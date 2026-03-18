from __future__ import annotations

import argparse
import configparser
import json
import os
import random
import re
import shutil
import subprocess
import sys
import time
import winreg
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


DEFAULT_TEMPLATE = """// ==WindhawkMod==
// @id              {mod_id}
// @name            {name}
// @description     {description}
// @version         {version}
// @author          {author}
{github_line}{homepage_line}{include_lines}{compiler_options_line}{license_line}// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# {name}
{description}

Use the bundled Windhawk workflow to iterate on this mod:
- Edit `mod.wh.cpp` in `Data\\EditorWorkspace` or change the source in `Data\\ModsSource`.
- Compile it with `windhawk_tool.py compile --mod-id {mod_id}`.
- Restart Windhawk or the target process to validate the change.
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- enabled: true
  $name: Enabled
  $description: Disable this if you want the hook to short-circuit without uninstalling the mod.
*/
// ==/WindhawkModSettings==

#include <windows.h>

BOOL Wh_ModInit() {{
    return TRUE;
}}

void Wh_ModAfterInit() {{
}}

void Wh_ModBeforeUninit() {{
}}

void Wh_ModUninit() {{
}}

void Wh_ModSettingsChanged() {{
}}
"""

WORKSPACE_COMPILE_FLAGS = [
    "-x",
    "c++",
    "-std=c++23",
    "-target",
    "x86_64-w64-mingw32",
    "-DUNICODE",
    "-D_UNICODE",
    "-DWINVER=0x0A00",
    "-D_WIN32_WINNT=0x0A00",
    "-D_WIN32_IE=0x0A00",
    "-DNTDDI_VERSION=0x0A000008",
    "-D__USE_MINGW_ANSI_STDIO=0",
    "-DWH_MOD",
    "-DWH_EDITING",
    "-include",
    "windhawk_api.h",
    "-Wall",
    "-Wextra",
    "-Wno-unused-parameter",
    "-Wno-missing-field-initializers",
    "-Wno-cast-function-type-mismatch",
]

DEFAULT_CLANG_FORMAT = [
    "# To override, create a .clang-format.windhawk file with the desired settings.",
    "BasedOnStyle: Chromium",
    "IndentWidth: 4",
    "CommentPragmas: ^[ \\t]+@[a-zA-Z]+",
]

COMMON_SYSTEM_MOD_TARGETS = {
    "startmenuexperiencehost.exe",
    "searchhost.exe",
    "explorer.exe",
    "shellexperiencehost.exe",
    "shellhost.exe",
    "dwm.exe",
    "notepad.exe",
    "regedit.exe",
}

WINDOWS_VERSION_FLAG_EXCEPTIONS = {
    ("classic-taskdlg-fix", "1.1.0"),
}

BACKWARD_COMPATIBILITY_FLAGS = {
    ("chrome-ui-tweaks", "1.0.0"): ["-include", "atomic", "-include", "optional"],
    ("sib-plusplus-tweaker", "0.7.1"): ["-include", "atomic"],
    ("classic-explorer-treeview", "1.1.3"): ["-include", "cmath"],
    ("sysdm-general-tab", "1.1"): ["-include", "cmath"],
    ("ce-disable-process-button-flashing", "1.0.1"): ["-include", "vector"],
    ("windows-7-clock-spacing", "1.0.0"): ["-include", "vector"],
}

METADATA_SINGLE_VALUE = {
    "id",
    "version",
    "github",
    "twitter",
    "homepage",
    "compilerOptions",
    "license",
    "donateUrl",
}
METADATA_LOCALIZABLE_SINGLE_VALUE = {"name", "description", "author"}
METADATA_MULTI_VALUE = {"include", "exclude", "architecture"}
SUPPORTED_ARCHITECTURES = {"x86", "x86-64", "amd64", "arm64"}
INT_PATTERN = re.compile(r"^-?\d+$")


class WindhawkError(RuntimeError):
    pass


class CompileError(WindhawkError):
    def __init__(self, target: str, result: subprocess.CompletedProcess[str]):
        exit_code = result.returncode
        message = "Compilation failed"
        if exit_code == 1:
            message += ", the mod might require a newer Windhawk version"
            if target == "aarch64-w64-mingw32":
                message += ", or the mod may not support ARM64 yet"
        elif exit_code == 0xC0000135:
            message += ", some files are missing; reinstall Windhawk or check antivirus exclusions"
        else:
            message += f", error code: 0x{exit_code & 0xFFFFFFFF:08X}"
        super().__init__(message)
        self.target = target
        self.exit_code = exit_code
        self.stdout = result.stdout
        self.stderr = result.stderr


@dataclass
class RegistryRef:
    root_name: str
    subkey: str

    @property
    def root(self) -> int:
        roots = {
            "HKLM": winreg.HKEY_LOCAL_MACHINE,
            "HKCU": winreg.HKEY_CURRENT_USER,
            "HKCR": winreg.HKEY_CLASSES_ROOT,
        }
        return roots[self.root_name]

    def with_suffix(self, suffix: str) -> "RegistryRef":
        suffix = suffix.lstrip("\\")
        return RegistryRef(self.root_name, f"{self.subkey}\\{suffix}" if suffix else self.subkey)

    def as_string(self) -> str:
        return f"{self.root_name}\\{self.subkey}"


@dataclass
class WindhawkRuntime:
    root: Path
    portable: bool
    exe_path: Path
    ini_path: Path
    compiler_path: Path
    engine_path: Path
    ui_path: Path
    app_data_path: Path
    engine_app_data_path: Path
    app_registry_ref: RegistryRef | None
    engine_registry_ref: RegistryRef | None
    mods_source_path: Path
    editor_workspace_path: Path
    drafts_path: Path
    engine_mods_path: Path
    engine_mods_writable_path: Path
    ui_logs_path: Path
    arm64_enabled: bool
    storage_notes: list[str]

    @property
    def storage_mismatch(self) -> bool:
        return bool(self.storage_notes)

    @property
    def mod_registry_ref(self) -> RegistryRef | None:
        if self.engine_registry_ref:
            return self.engine_registry_ref.with_suffix("Mods")
        if self.app_registry_ref:
            return self.app_registry_ref.with_suffix("Engine\\Mods")
        return None

    @property
    def mod_registry_writable_ref(self) -> RegistryRef | None:
        if self.engine_registry_ref:
            return self.engine_registry_ref.with_suffix("ModsWritable")
        if self.app_registry_ref:
            return self.app_registry_ref.with_suffix("Engine\\ModsWritable")
        return None

    def to_dict(self) -> dict[str, Any]:
        return {
            "root": str(self.root),
            "portable": self.portable,
            "exe_path": str(self.exe_path),
            "compiler_path": str(self.compiler_path),
            "engine_path": str(self.engine_path),
            "ui_path": str(self.ui_path),
            "app_data_path": str(self.app_data_path),
            "engine_app_data_path": str(self.engine_app_data_path),
            "mods_source_path": str(self.mods_source_path),
            "editor_workspace_path": str(self.editor_workspace_path),
            "engine_mods_path": str(self.engine_mods_path),
            "ui_logs_path": str(self.ui_logs_path),
            "arm64_enabled": self.arm64_enabled,
            "storage_mismatch": self.storage_mismatch,
            "storage_notes": self.storage_notes,
            "app_registry_key": self.app_registry_ref.as_string() if self.app_registry_ref else None,
            "engine_registry_key": self.engine_registry_ref.as_string() if self.engine_registry_ref else None,
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Control a local Windhawk install and automate the mod dev loop.")
    parser.add_argument("--root", help="Optional Windhawk root. Overrides auto-detection.")
    parser.add_argument("--json", action="store_true", help="Emit JSON for machine-readable output.")

    subparsers = parser.add_subparsers(dest="command", required=True)

    detect = subparsers.add_parser("detect", help="Detect the active Windhawk runtime.")
    detect.add_argument("--all", action="store_true", help="List every detected install instead of only the preferred one.")

    status = subparsers.add_parser("status", help="Show runtime status, source mods, and installed mods.")
    status.add_argument("--mod-id", help="Optional mod id to inspect in detail.")

    launch = subparsers.add_parser("launch", help="Launch Windhawk.")
    launch.add_argument("--tray-only", action="store_true")
    launch.add_argument("--safe-mode", action="store_true")
    launch.add_argument("--wait", action="store_true")

    restart = subparsers.add_parser("restart", help="Restart Windhawk.")
    restart.add_argument("--tray-only", action="store_true")
    restart.add_argument("--wait", action="store_true")

    exit_cmd = subparsers.add_parser("exit", help="Exit Windhawk.")
    exit_cmd.add_argument("--wait", action="store_true")

    init_mod = subparsers.add_parser("init-mod", help="Create a new .wh.cpp mod source in ModsSource.")
    init_mod.add_argument("--mod-id", required=True)
    init_mod.add_argument("--name", required=True)
    init_mod.add_argument("--description", default="A new Windhawk mod.")
    init_mod.add_argument("--author", default=os.environ.get("USERNAME", "You"))
    init_mod.add_argument("--version", default="0.1.0")
    init_mod.add_argument("--include", action="append", default=[])
    init_mod.add_argument("--github")
    init_mod.add_argument("--homepage")
    init_mod.add_argument("--compiler-options")
    init_mod.add_argument("--license", default="MIT")
    init_mod.add_argument("--force", action="store_true")
    init_mod.add_argument("--sync-workspace", action="store_true")

    sync = subparsers.add_parser("sync-workspace", help="Copy a mod between ModsSource and EditorWorkspace.")
    sync.add_argument("--mod-id", required=True)
    sync.add_argument("--direction", choices=["to-workspace", "from-workspace"], default="to-workspace")
    sync.add_argument("--force", action="store_true")

    compile_mod = subparsers.add_parser("compile", help="Compile a mod with Windhawk's bundled toolchain and update its config.")
    compile_mod.add_argument("--mod-id", required=True)
    compile_mod.add_argument("--from-workspace", action="store_true", help="Compile Data\\EditorWorkspace\\mod.wh.cpp and sync it back to ModsSource first.")
    compile_mod.add_argument("--disabled", action="store_true", help="Install the compiled mod disabled.")
    compile_mod.add_argument("--enable-logging", action="store_true", help="Enable Windhawk logging for the mod after compile.")
    compile_mod.add_argument("--restart", action="store_true", help="Restart Windhawk after a successful compile.")
    compile_mod.add_argument("--tray-only", action="store_true", help="Use -tray-only with --restart.")

    enable = subparsers.add_parser("enable", help="Enable an installed mod.")
    enable.add_argument("--mod-id", required=True)
    enable.add_argument("--restart", action="store_true")
    enable.add_argument("--tray-only", action="store_true")

    disable = subparsers.add_parser("disable", help="Disable an installed mod.")
    disable.add_argument("--mod-id", required=True)
    disable.add_argument("--restart", action="store_true")
    disable.add_argument("--tray-only", action="store_true")

    logging_cmd = subparsers.add_parser("logging", help="Toggle Windhawk logging for a mod.")
    logging_cmd.add_argument("--mod-id", required=True)
    logging_cmd.add_argument("--state", choices=["on", "off"], required=True)

    delete_mod = subparsers.add_parser("delete-mod", help="Remove a mod's source, config, and compiled binaries.")
    delete_mod.add_argument("--mod-id", required=True)
    delete_mod.add_argument("--keep-source", action="store_true")

    logs = subparsers.add_parser("logs", help="Show recent Windhawk UI logs from the latest log session.")
    logs.add_argument("--kind", choices=["main", "all"], default="main")
    logs.add_argument("--lines", type=int, default=80)
    logs.add_argument("--contains", help="Only show lines containing this substring.")

    return parser.parse_args()


def parse_ini(path: Path) -> configparser.ConfigParser:
    parser = configparser.ConfigParser(interpolation=None)
    parser.optionxform = str

    if not path.exists():
        return parser

    raw = path.read_bytes()
    last_error: UnicodeDecodeError | None = None
    for encoding in ("utf-8-sig", "utf-16", "utf-16-le", "utf-16-be", "mbcs"):
        try:
            parser.read_string(raw.decode(encoding))
            return parser
        except UnicodeDecodeError as exc:
            last_error = exc
            continue
    if last_error:
        raise last_error
    return parser


def write_ini(path: Path, parser: configparser.ConfigParser) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        parser.write(handle, space_around_delimiters=False)


def resolve_config_path(base: Path, raw_value: str | None, default: str) -> Path:
    value = raw_value or default
    expanded = Path(os.path.expandvars(value))
    if expanded.is_absolute():
        return expanded.resolve()
    return (base / expanded).resolve()


def normalize_path(value: Path) -> str:
    return str(value.resolve()).lower()


def parse_registry_ref(value: str | None) -> RegistryRef | None:
    if not value:
        return None
    match = re.match(r"^(HKLM|HKEY_LOCAL_MACHINE|HKCU|HKEY_CURRENT_USER|HKCR|HKEY_CLASSES_ROOT)\\(.+)$", value, re.IGNORECASE)
    if not match:
        raise WindhawkError(f"Unsupported registry key format: {value}")
    root = match.group(1).upper()
    root_map = {
        "HKEY_LOCAL_MACHINE": "HKLM",
        "HKEY_CURRENT_USER": "HKCU",
        "HKEY_CLASSES_ROOT": "HKCR",
    }
    return RegistryRef(root_map.get(root, root), match.group(2))


def load_runtime(root: Path) -> WindhawkRuntime:
    root = root.resolve()
    ini_path = root / "windhawk.ini"
    exe_path = root / "windhawk.exe"
    if not ini_path.exists() or not exe_path.exists():
        raise WindhawkError(f"{root} is not a Windhawk root")

    parser = parse_ini(ini_path)
    storage = parser["Storage"]
    portable = storage.get("Portable", "0").strip() == "1"

    compiler_path = resolve_config_path(root, storage.get("CompilerPath"), "Compiler")
    engine_path = resolve_config_path(root, storage.get("EnginePath"), "Engine")
    ui_path = resolve_config_path(root, storage.get("UIPath"), "UI")
    app_data_path = resolve_config_path(root, storage.get("AppDataPath"), "Data")
    app_registry_ref = parse_registry_ref(storage.get("RegistryKey"))

    engine_ini_path = engine_path / "engine.ini"
    engine_app_data_path = (app_data_path / "Engine").resolve()
    engine_registry_ref: RegistryRef | None = None
    storage_notes: list[str] = []

    if engine_ini_path.exists():
        engine_parser = parse_ini(engine_ini_path)
        if engine_parser.has_section("Storage"):
            engine_storage = engine_parser["Storage"]
            engine_portable = engine_storage.get("Portable", "0").strip() == "1"
            engine_app_data_path = resolve_config_path(engine_path, engine_storage.get("AppDataPath"), "..\\..\\Data\\Engine")
            engine_registry_ref = parse_registry_ref(engine_storage.get("RegistryKey"))

            if engine_portable != portable:
                storage_notes.append(
                    f"windhawk.ini portable={int(portable)} but engine.ini portable={int(engine_portable)}"
                )
            if normalize_path(engine_app_data_path) != normalize_path(app_data_path / "Engine"):
                storage_notes.append(
                    f"engine.ini app-data path is {engine_app_data_path} but windhawk.ini implies {(app_data_path / 'Engine').resolve()}"
                )
            if app_registry_ref and engine_registry_ref:
                expected_engine_key = app_registry_ref.with_suffix("Engine").as_string().lower()
                actual_engine_key = engine_registry_ref.as_string().lower()
                if expected_engine_key != actual_engine_key:
                    storage_notes.append(
                        f"engine.ini registry key is {engine_registry_ref.as_string()} but windhawk.ini implies {app_registry_ref.with_suffix('Engine').as_string()}"
                    )

    engine_mods_path = (engine_app_data_path / "Mods").resolve()
    engine_mods_writable_path = (engine_app_data_path / "ModsWritable").resolve()
    arm64_enabled = (compiler_path / "aarch64-w64-mingw32" / "bin" / "libc++.dll").exists() or (engine_mods_path / "arm64").exists()

    return WindhawkRuntime(
        root=root,
        portable=portable,
        exe_path=exe_path,
        ini_path=ini_path,
        compiler_path=compiler_path,
        engine_path=engine_path,
        ui_path=ui_path,
        app_data_path=app_data_path,
        engine_app_data_path=engine_app_data_path,
        app_registry_ref=app_registry_ref,
        engine_registry_ref=engine_registry_ref,
        mods_source_path=(app_data_path / "ModsSource").resolve(),
        editor_workspace_path=(app_data_path / "EditorWorkspace").resolve(),
        drafts_path=(app_data_path / "EditorWorkspace" / "Drafts").resolve(),
        engine_mods_path=engine_mods_path,
        engine_mods_writable_path=engine_mods_writable_path,
        ui_logs_path=(app_data_path / "UIData" / "user-data" / "logs").resolve(),
        arm64_enabled=arm64_enabled,
        storage_notes=storage_notes,
    )


def candidate_roots(root_hint: str | None) -> list[Path]:
    ordered: list[Path] = []

    def add(candidate: Path | None) -> None:
        if not candidate:
            return
        candidate = candidate.resolve()
        if candidate not in ordered:
            ordered.append(candidate)

    if root_hint:
        candidate = Path(root_hint)
        if candidate.name.lower() == "windhawk.exe":
            candidate = candidate.parent
        add(candidate)

    env_root = os.environ.get("WINDHAWK_ROOT")
    if env_root:
        add(Path(env_root))

    local_app_data = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
    local_programs = local_app_data / "Programs"
    if local_programs.exists():
        for pattern in ("Windhawk*Portable", "Windhawk*"):
            for candidate in sorted(local_programs.glob(pattern)):
                if candidate.is_dir():
                    add(candidate)

    add(Path(r"C:\Program Files\Windhawk"))
    return ordered


def detect_runtimes(root_hint: str | None) -> list[WindhawkRuntime]:
    runtimes: list[WindhawkRuntime] = []
    for candidate in candidate_roots(root_hint):
        try:
            runtimes.append(load_runtime(candidate))
        except WindhawkError:
            continue
    if not runtimes:
        raise WindhawkError("No Windhawk install was detected. Pass --root or set WINDHAWK_ROOT.")
    return runtimes


def resolve_runtime(root_hint: str | None) -> WindhawkRuntime:
    runtimes = detect_runtimes(root_hint)
    if root_hint:
        return runtimes[0]
    portable = [runtime for runtime in runtimes if runtime.portable and runtime.app_data_path.exists()]
    if portable:
        return portable[0]
    return runtimes[0]


def is_windhawk_running() -> bool:
    result = subprocess.run(
        ["tasklist", "/FI", "IMAGENAME eq windhawk.exe", "/FO", "CSV", "/NH"],
        capture_output=True,
        text=True,
        check=False,
    )
    return "windhawk.exe" in result.stdout.lower()


def splitargs(value: str) -> list[str]:
    single_quote_open = False
    double_quote_open = False
    token_buffer: list[str] = []
    tokens: list[str] = []

    for char in value:
        if char == "'" and not double_quote_open:
            single_quote_open = not single_quote_open
            continue
        if char == '"' and not single_quote_open:
            double_quote_open = not double_quote_open
            continue
        if char.isspace() and not single_quote_open and not double_quote_open:
            if token_buffer:
                tokens.append("".join(token_buffer))
                token_buffer = []
            continue
        token_buffer.append(char)

    if token_buffer:
        tokens.append("".join(token_buffer))
    return tokens


def get_best_language_match(match_language: str, candidates: list[dict[str, str | None]]) -> dict[str, str | None]:
    languages = [(candidate["language"] or "").lower() or None for candidate in candidates]
    iter_language = match_language.lower()

    while True:
        if iter_language in languages:
            return candidates[languages.index(iter_language)]
        for index, language in enumerate(languages):
            if language and language.startswith(iter_language):
                return candidates[index]
        if "-" not in iter_language:
            break
        iter_language = iter_language.rsplit("-", 1)[0]

    if None in languages:
        return candidates[languages.index(None)]
    return candidates[0]


def extract_metadata_raw(mod_source: str) -> dict[str, list[dict[str, str | None]]]:
    block_match = re.search(
        r"^//[ \t]+==WindhawkMod==[ \t]*$([\s\S]+?)^//[ \t]+==/WindhawkMod==[ \t]*$",
        mod_source,
        re.MULTILINE,
    )
    if not block_match:
        raise WindhawkError("Couldn't find a metadata block in the source code")

    result: dict[str, list[dict[str, str | None]]] = {}
    for line in block_match.group(1).splitlines():
        line = line.rstrip()
        if not line:
            continue
        match = re.match(r"^//[ \t]+@(_?[a-zA-Z]+)(?::([a-z]{2}(?:-[A-Z]{2})?))?[ \t]+(.*)$", line)
        if not match:
            truncated = line[:17] + "..." if len(line) > 20 else line
            raise WindhawkError(f"Couldn't parse metadata line: {truncated}")
        key = match.group(1)
        value = {"language": match.group(2), "value": match.group(3)}
        result.setdefault(key, []).append(value)
    return result


def extract_metadata(mod_source: str, language: str = "en") -> dict[str, Any]:
    metadata_raw = extract_metadata_raw(mod_source)
    metadata: dict[str, Any] = {}

    for raw_key, entries in metadata_raw.items():
        key = raw_key.removeprefix("_")
        if key in METADATA_LOCALIZABLE_SINGLE_VALUE:
            seen_languages = set()
            for entry in entries:
                lang = entry["language"]
                if lang in seen_languages:
                    raise WindhawkError(f"Duplicate metadata parameter: {key}" + (f":{lang}" if lang else ""))
                seen_languages.add(lang)
            metadata[key] = get_best_language_match(language, entries)["value"]
        elif key in METADATA_MULTI_VALUE:
            if any(entry["language"] is not None for entry in entries):
                raise WindhawkError(f"Metadata parameter can't be localized: {key}")
            metadata[key] = [entry["value"] for entry in entries]
        elif key in METADATA_SINGLE_VALUE:
            if any(entry["language"] is not None for entry in entries):
                raise WindhawkError(f"Metadata parameter can't be localized: {key}")
            if len(entries) > 1:
                raise WindhawkError(f"Duplicate metadata parameter: {key}")
            metadata[key] = entries[0]["value"]
        elif raw_key.startswith("_"):
            continue
        else:
            raise WindhawkError(f"Unsupported metadata parameter: {key}")

    mod_id = metadata.get("id")
    if not mod_id:
        raise WindhawkError("Mod id must be specified in the source code")
    if not re.fullmatch(r"[0-9a-z-]+", mod_id):
        raise WindhawkError("Mod id must only contain 0-9, a-z, and hyphens")

    for category in ("include", "exclude"):
        for path_value in metadata.get(category, []) or []:
            if re.search(r'[/"<>|]', path_value):
                raise WindhawkError(f"Mod {category} path contains one of the forbidden characters: / \" < > |")

    for architecture in metadata.get("architecture", []) or []:
        if architecture not in SUPPORTED_ARCHITECTURES:
            raise WindhawkError(
                f"Unsupported architecture {architecture}; expected one of {', '.join(sorted(SUPPORTED_ARCHITECTURES))}"
            )

    return metadata


def extract_initial_settings_for_engine(mod_source: str) -> dict[str, str | int] | None:
    match = re.search(
        r"^//[ \t]+==WindhawkModSettings==[ \t]*$\s*/\*\s*([\s\S]+?)\s*\*/\s*^//[ \t]+==/WindhawkModSettings==[ \t]*$",
        mod_source,
        re.MULTILINE,
    )
    if not match:
        return None

    try:
        settings = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        raise WindhawkError(f"Failed to parse settings: {exc}") from exc
    if not isinstance(settings, list):
        raise WindhawkError("Failed to parse settings: expected a YAML list")

    parsed: dict[str, str | int] = {}

    def parse_settings(items: list[Any], key_prefix: str = "") -> None:
        for item in items:
            if not isinstance(item, dict):
                raise WindhawkError("Failed to parse settings: expected a YAML object")
            actual_keys = [key for key in item if not str(key).startswith("$")]
            if len(actual_keys) != 1:
                raise WindhawkError("Each settings item must contain exactly one non-$ key")
            actual_key = actual_keys[0]
            next_key = f"{key_prefix}.{actual_key}" if key_prefix else str(actual_key)
            parse_settings_value(item[actual_key], next_key)

    def parse_settings_value(value: Any, key: str) -> None:
        if isinstance(value, bool):
            parsed[key] = 1 if value else 0
            return
        if isinstance(value, (int, float)):
            parsed[key] = int(value)
            return
        if isinstance(value, str):
            parsed[key] = value
            return
        if not isinstance(value, list) or not value:
            raise WindhawkError(f"Unsupported settings structure at {key}")

        first = value[0]
        if isinstance(first, (bool, int, float, str)):
            for index, item in enumerate(value):
                parse_settings_value(item, f"{key}[{index}]")
            return
        if isinstance(first, list):
            for index, item in enumerate(value):
                if not isinstance(item, list):
                    raise WindhawkError(f"Mixed settings array types at {key}")
                parse_settings(item, f"{key}[{index}]")
            return
        parse_settings(value, key)

    parse_settings(settings)
    return parsed


def ensure_workspace_initialized(runtime: WindhawkRuntime) -> None:
    runtime.editor_workspace_path.mkdir(parents=True, exist_ok=True)
    (runtime.editor_workspace_path / "compile_flags.txt").write_text("\n".join(WORKSPACE_COMPILE_FLAGS) + "\n", encoding="utf-8")

    override_clang = runtime.editor_workspace_path / ".clang-format.windhawk"
    target_clang = runtime.editor_workspace_path / ".clang-format"
    if override_clang.exists():
        shutil.copy2(override_clang, target_clang)
    else:
        target_clang.write_text("\n".join(DEFAULT_CLANG_FORMAT) + "\n", encoding="utf-8")

    old_api = runtime.editor_workspace_path / "windhawk_api.h"
    if old_api.exists():
        old_api.unlink()

    try:
        subprocess.run(["git", "init"], cwd=runtime.editor_workspace_path, capture_output=True, text=True, check=False)
        subprocess.run(["git", "add", "mod.wh.cpp"], cwd=runtime.editor_workspace_path, capture_output=True, text=True, check=False)
    except OSError:
        pass


def read_mod_source(runtime: WindhawkRuntime, mod_id: str) -> str:
    path = runtime.mods_source_path / f"{mod_id}.wh.cpp"
    if not path.exists():
        raise WindhawkError(f"Mod source not found: {path}")
    return path.read_text(encoding="utf-8")


def write_mod_source(runtime: WindhawkRuntime, mod_id: str, mod_source: str) -> Path:
    path = runtime.mods_source_path / f"{mod_id}.wh.cpp"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(mod_source, encoding="utf-8")
    return path


def delete_mod_source(runtime: WindhawkRuntime, mod_id: str) -> None:
    path = runtime.mods_source_path / f"{mod_id}.wh.cpp"
    if path.exists():
        path.unlink()


def sync_workspace(runtime: WindhawkRuntime, mod_id: str, direction: str, force: bool = False) -> dict[str, str]:
    ensure_workspace_initialized(runtime)
    source_path = runtime.mods_source_path / f"{mod_id}.wh.cpp"
    workspace_path = runtime.editor_workspace_path / "mod.wh.cpp"

    if direction == "to-workspace":
        if not source_path.exists():
            raise WindhawkError(f"Mod source not found: {source_path}")
        if workspace_path.exists() and not force:
            current = workspace_path.read_text(encoding="utf-8", errors="ignore")
            if current and current != source_path.read_text(encoding="utf-8"):
                raise WindhawkError("EditorWorkspace/mod.wh.cpp already has different contents; use --force if you want to overwrite it")
        shutil.copy2(source_path, workspace_path)
        return {"from": str(source_path), "to": str(workspace_path)}

    if not workspace_path.exists():
        raise WindhawkError(f"Workspace file not found: {workspace_path}")
    metadata = extract_metadata(workspace_path.read_text(encoding="utf-8"))
    workspace_mod_id = metadata["id"]
    if workspace_mod_id != mod_id and not force:
        raise WindhawkError(
            f"EditorWorkspace/mod.wh.cpp contains mod id {workspace_mod_id}, not {mod_id}; use --force to sync it anyway"
        )
    write_mod_source(runtime, mod_id, workspace_path.read_text(encoding="utf-8"))
    return {"from": str(workspace_path), "to": str(source_path)}


def create_mod_source(args: argparse.Namespace) -> str:
    mod_id = args.mod_id
    if not re.fullmatch(r"[0-9a-z-]+", mod_id):
        raise WindhawkError("Mod id must only contain 0-9, lowercase letters, and hyphens")
    include_values = args.include or ["notepad.exe"]
    include_lines = "".join(f"// @include         {item}\n" for item in include_values)
    github_line = f"// @github          {args.github}\n" if args.github else ""
    homepage_line = f"// @homepage        {args.homepage}\n" if args.homepage else ""
    compiler_options_line = f"// @compilerOptions {args.compiler_options}\n" if args.compiler_options else ""
    license_line = f"// @license         {args.license}\n" if args.license else ""
    return DEFAULT_TEMPLATE.format(
        mod_id=mod_id,
        name=args.name,
        description=args.description,
        version=args.version,
        author=args.author,
        github_line=github_line,
        homepage_line=homepage_line,
        include_lines=include_lines,
        compiler_options_line=compiler_options_line,
        license_line=license_line,
    )


def subfolder_from_target(target: str) -> str:
    return {
        "i686-w64-mingw32": "32",
        "x86_64-w64-mingw32": "64",
        "aarch64-w64-mingw32": "arm64",
    }[target]


def targets_from_architecture(runtime: WindhawkRuntime, architectures: list[str], mod_targets: list[str]) -> list[str]:
    if not architectures:
        architectures = ["x86", "x86-64"]

    targets: list[str] = []
    for architecture in architectures:
        if architecture == "x86":
            targets.append("i686-w64-mingw32")
        elif architecture == "x86-64":
            if runtime.arm64_enabled:
                targets.append("aarch64-w64-mingw32")
                if not mod_targets or not all(target.lower() in COMMON_SYSTEM_MOD_TARGETS for target in mod_targets):
                    targets.append("x86_64-w64-mingw32")
            else:
                targets.append("x86_64-w64-mingw32")
        elif architecture == "amd64":
            targets.append("x86_64-w64-mingw32")
        elif architecture == "arm64":
            if runtime.arm64_enabled:
                targets.append("aarch64-w64-mingw32")
        else:
            raise WindhawkError(f"Unsupported architecture: {architecture}")

    if not targets:
        raise WindhawkError("The current architecture is not supported")
    return targets


def subfolders_from_architecture(runtime: WindhawkRuntime, architectures: list[str]) -> set[str]:
    if not architectures:
        architectures = ["x86", "x86-64"]
    subfolders: set[str] = set()
    for architecture in architectures:
        if architecture == "x86":
            subfolders.add("32")
        elif architecture == "x86-64":
            if runtime.arm64_enabled:
                subfolders.update({"64", "arm64"})
            else:
                subfolders.add("64")
        elif architecture == "amd64":
            subfolders.add("64")
        elif architecture == "arm64" and runtime.arm64_enabled:
            subfolders.add("arm64")
    return subfolders


def copy_compiler_libs(runtime: WindhawkRuntime, target: str) -> None:
    libs_dir = runtime.compiler_path / target / "bin"
    target_mods_dir = runtime.engine_mods_path / subfolder_from_target(target)
    target_mods_dir.mkdir(parents=True, exist_ok=True)

    files_to_copy = [
        ("libc++.dll", "libc++.whl"),
        ("libunwind.dll", "libunwind.whl"),
        ("windhawk-mod-shim.dll", "windhawk-mod-shim.dll"),
    ]

    if (target_mods_dir / "libc++.dll").exists():
        files_to_copy.append(("libc++.dll", "libc++.dll"))
    if (target_mods_dir / "libunwind.dll").exists():
        files_to_copy.append(("libunwind.dll", "libunwind.dll"))

    for source_name, dest_name in files_to_copy:
        source_path = libs_dir / source_name
        dest_path = target_mods_dir / dest_name
        if not source_path.exists():
            raise WindhawkError(f"Missing compiler dependency: {source_path}")
        if dest_path.exists() and dest_path.stat().st_mtime_ns == source_path.stat().st_mtime_ns:
            continue
        if dest_path.exists():
            try:
                temp_path = dest_path.with_name(f"{dest_path.stem}_temp{random.randint(1, 9999)}{dest_path.suffix}")
                dest_path.rename(temp_path)
            except OSError:
                pass
        shutil.copy2(source_path, dest_path)


def generate_target_dll_name(runtime: WindhawkRuntime, mod_id: str, version: str, architectures: list[str], mod_targets: list[str]) -> str:
    targets = targets_from_architecture(runtime, architectures, mod_targets)
    for _ in range(1000):
        candidate = f"{mod_id}_{version}_{random.randint(100000, 999999)}.dll"
        if all(not (runtime.engine_mods_path / subfolder_from_target(target) / candidate).exists() for target in targets):
            return candidate
    raise WindhawkError("Failed to generate a unique target DLL name")


def compile_for_target(runtime: WindhawkRuntime, metadata: dict[str, Any], mod_source: str, target: str, target_dll_name: str) -> str:
    compiler_options = splitargs(metadata.get("compilerOptions", ""))
    mod_id = metadata["id"]
    version = metadata.get("version", "")

    engine_lib_path = runtime.engine_path / subfolder_from_target(target) / "windhawk.lib"
    compiled_dll_path = runtime.engine_mods_path / subfolder_from_target(target) / target_dll_name
    compiled_dll_path.parent.mkdir(parents=True, exist_ok=True)

    windows_version_flags: list[str] = []
    if (mod_id, version) not in WINDOWS_VERSION_FLAG_EXCEPTIONS:
        windows_version_flags = [
            "-DWINVER=0x0A00",
            "-D_WIN32_WINNT=0x0A00",
            "-D_WIN32_IE=0x0A00",
            "-DNTDDI_VERSION=0x0A000008",
        ]

    args = [
        str(runtime.compiler_path / "bin" / "clang++.exe"),
        "-std=c++23",
        "-O2",
        "-shared",
        "-DUNICODE",
        "-D_UNICODE",
        *windows_version_flags,
        "-D__USE_MINGW_ANSI_STDIO=0",
        "-DWH_MOD",
        f'-DWH_MOD_ID=L"{mod_id.replace(chr(34), r"\\\"")}"',
        f'-DWH_MOD_VERSION=L"{version.replace(chr(34), r"\\\"")}"',
        str(engine_lib_path),
        "-x",
        "c++",
        "-",
        "-include",
        "windhawk_api.h",
        "-target",
        target,
        "-Wl,--export-all-symbols",
        "-o",
        str(compiled_dll_path),
        *compiler_options,
        *BACKWARD_COMPATIBILITY_FLAGS.get((mod_id, version), []),
    ]

    result = subprocess.run(
        args,
        cwd=runtime.compiler_path,
        input=mod_source,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise CompileError(target, result)
    return str(compiled_dll_path)


def get_mod_ini_path(runtime: WindhawkRuntime, mod_id: str) -> Path:
    return runtime.engine_mods_path / f"{mod_id}.ini"


def read_registry_values(ref: RegistryRef, mod_id: str) -> dict[str, Any] | None:
    try:
        key = winreg.OpenKey(ref.root, f"{ref.subkey}\\{mod_id}", 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY)
    except FileNotFoundError:
        return None
    values: dict[str, Any] = {}
    index = 0
    try:
        while True:
            name, value, _kind = winreg.EnumValue(key, index)
            values[name] = value
            index += 1
    except OSError:
        pass
    finally:
        winreg.CloseKey(key)
    return values


def write_registry_values(ref: RegistryRef, mod_id: str, fields: dict[str, Any]) -> None:
    key = winreg.CreateKeyEx(ref.root, f"{ref.subkey}\\{mod_id}", 0, winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY)
    try:
        for name, value in fields.items():
            if isinstance(value, int):
                winreg.SetValueEx(key, name, 0, winreg.REG_DWORD, value)
            else:
                winreg.SetValueEx(key, name, 0, winreg.REG_SZ, str(value))
    finally:
        winreg.CloseKey(key)


def delete_registry_tree(ref: RegistryRef, relative_path: str) -> None:
    try:
        key = winreg.OpenKey(ref.root, f"{ref.subkey}\\{relative_path}", 0, winreg.KEY_READ | winreg.KEY_WRITE | winreg.KEY_WOW64_64KEY)
    except FileNotFoundError:
        return
    try:
        while True:
            try:
                child = winreg.EnumKey(key, 0)
            except OSError:
                break
            delete_registry_tree(ref, f"{relative_path}\\{child}")
    finally:
        winreg.CloseKey(key)
    try:
        winreg.DeleteKeyEx(ref.root, f"{ref.subkey}\\{relative_path}", access=winreg.KEY_WOW64_64KEY)
    except FileNotFoundError:
        pass


def parse_ini_scalar(value: str) -> str | int:
    return int(value) if INT_PATTERN.fullmatch(value) else value


def get_mod_config(runtime: WindhawkRuntime, mod_id: str) -> dict[str, Any] | None:
    field_types = {
        "LibraryFileName": "string",
        "Disabled": "bool",
        "LoggingEnabled": "bool",
        "DebugLoggingEnabled": "bool",
        "Include": "string-array",
        "Exclude": "string-array",
        "IncludeCustom": "string-array",
        "ExcludeCustom": "string-array",
        "IncludeExcludeCustomOnly": "bool",
        "PatternsMatchCriticalSystemProcesses": "bool",
        "Architecture": "string-array",
        "Version": "string",
    }

    raw_fields: dict[str, Any] | None
    if runtime.portable:
        parser = parse_ini(get_mod_ini_path(runtime, mod_id))
        if not parser.has_section("Mod"):
            return None
        raw_fields = dict(parser["Mod"])
    else:
        ref = runtime.mod_registry_ref
        if not ref:
            return None
        raw_fields = read_registry_values(ref, mod_id)
    if not raw_fields or not raw_fields.get("LibraryFileName"):
        return None

    config: dict[str, Any] = {}
    for field, field_type in field_types.items():
        raw_value = raw_fields.get(field, "")
        if field_type == "string":
            config[field] = str(raw_value)
        elif field_type == "bool":
            config[field] = bool(int(raw_value)) if str(raw_value) else False
        else:
            config[field] = [item for item in str(raw_value).split("|") if item]
    return config


def get_installed_mod_ids(runtime: WindhawkRuntime) -> list[str]:
    mod_ids: list[str] = []
    if runtime.portable:
        if runtime.engine_mods_path.exists():
            for path in sorted(runtime.engine_mods_path.glob("*.ini")):
                mod_id = path.stem
                if get_mod_config(runtime, mod_id):
                    mod_ids.append(mod_id)
        return mod_ids

    ref = runtime.mod_registry_ref
    if not ref:
        return mod_ids
    try:
        key = winreg.OpenKey(ref.root, ref.subkey, 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY)
    except FileNotFoundError:
        return mod_ids
    try:
        index = 0
        while True:
            try:
                mod_id = winreg.EnumKey(key, index)
            except OSError:
                break
            if get_mod_config(runtime, mod_id):
                mod_ids.append(mod_id)
            index += 1
    finally:
        winreg.CloseKey(key)
    return sorted(mod_ids)


def get_mod_settings(runtime: WindhawkRuntime, mod_id: str) -> dict[str, str | int]:
    if runtime.portable:
        parser = parse_ini(get_mod_ini_path(runtime, mod_id))
        if not parser.has_section("Settings"):
            return {}
        return {key: parse_ini_scalar(value) for key, value in parser["Settings"].items()}

    ref = runtime.mod_registry_ref
    if not ref:
        return {}
    try:
        key = winreg.OpenKey(ref.root, f"{ref.subkey}\\{mod_id}\\Settings", 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY)
    except FileNotFoundError:
        return {}
    settings: dict[str, str | int] = {}
    index = 0
    try:
        while True:
            try:
                name, value, _kind = winreg.EnumValue(key, index)
            except OSError:
                break
            settings[name] = value
            index += 1
    finally:
        winreg.CloseKey(key)
    return settings


def get_name_prefix(name: str) -> str:
    return re.sub(r"\[\d+\].*$", "[0]", name)


def merge_mod_settings(existing_settings: dict[str, str | int], new_settings: dict[str, str | int]) -> dict[str, str | int]:
    merged = dict(existing_settings)
    existing_prefixes = {get_name_prefix(name) for name in existing_settings}
    for name, value in new_settings.items():
        if get_name_prefix(name) not in existing_prefixes:
            merged[name] = value
    return merged


def write_mod_settings(runtime: WindhawkRuntime, mod_id: str, settings: dict[str, str | int]) -> None:
    if runtime.portable:
        parser = parse_ini(get_mod_ini_path(runtime, mod_id))
        if not parser.has_section("Settings"):
            parser.add_section("Settings")
        parser["Settings"] = {key: str(value) for key, value in settings.items()}
        if not parser.has_section("Mod"):
            parser.add_section("Mod")
        parser["Mod"]["SettingsChangeTime"] = str(int(time.time()) & 0x7FFFFFFF)
        write_ini(get_mod_ini_path(runtime, mod_id), parser)
        return

    ref = runtime.mod_registry_ref
    if not ref:
        raise WindhawkError("Registry storage is not configured for this Windhawk install")
    delete_registry_tree(ref, f"{mod_id}\\Settings")
    settings_key = winreg.CreateKeyEx(ref.root, f"{ref.subkey}\\{mod_id}\\Settings", 0, winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY)
    try:
        for name, value in settings.items():
            if isinstance(value, int):
                winreg.SetValueEx(settings_key, name, 0, winreg.REG_DWORD, value & 0xFFFFFFFF)
            else:
                winreg.SetValueEx(settings_key, name, 0, winreg.REG_SZ, str(value))
    finally:
        winreg.CloseKey(settings_key)
    write_registry_values(ref, mod_id, {"SettingsChangeTime": int(time.time()) & 0x7FFFFFFF})


def write_mod_config(runtime: WindhawkRuntime, mod_id: str, fields: dict[str, Any], initial_settings: dict[str, str | int] | None = None) -> dict[str, Any]:
    config_existed = get_mod_config(runtime, mod_id) is not None

    if runtime.portable:
        parser = parse_ini(get_mod_ini_path(runtime, mod_id))
        if not parser.has_section("Mod"):
            parser.add_section("Mod")
        for name, value in fields.items():
            if isinstance(value, list):
                parser["Mod"][name] = "|".join(value)
            elif isinstance(value, bool):
                parser["Mod"][name] = "1" if value else "0"
            else:
                parser["Mod"][name] = str(value)
        write_ini(get_mod_ini_path(runtime, mod_id), parser)
    else:
        ref = runtime.mod_registry_ref
        if not ref:
            raise WindhawkError("Registry storage is not configured for this Windhawk install")
        serialized: dict[str, Any] = {}
        for name, value in fields.items():
            if isinstance(value, list):
                serialized[name] = "|".join(value)
            elif isinstance(value, bool):
                serialized[name] = 1 if value else 0
            else:
                serialized[name] = value
        write_registry_values(ref, mod_id, serialized)

    if initial_settings:
        merged_settings = initial_settings if not config_existed else merge_mod_settings(get_mod_settings(runtime, mod_id), initial_settings)
        write_mod_settings(runtime, mod_id, merged_settings)

    config = get_mod_config(runtime, mod_id)
    if config is None:
        raise WindhawkError("Failed to read back the mod config after writing it")
    return config


def set_mod_field(runtime: WindhawkRuntime, mod_id: str, field: str, value: bool) -> dict[str, Any]:
    config = get_mod_config(runtime, mod_id)
    if config is None:
        raise WindhawkError(f"Mod is not installed: {mod_id}")
    if runtime.portable:
        parser = parse_ini(get_mod_ini_path(runtime, mod_id))
        if not parser.has_section("Mod"):
            parser.add_section("Mod")
        parser["Mod"][field] = "1" if value else "0"
        write_ini(get_mod_ini_path(runtime, mod_id), parser)
    else:
        ref = runtime.mod_registry_ref
        if not ref:
            raise WindhawkError("Registry storage is not configured for this Windhawk install")
        write_registry_values(ref, mod_id, {field: 1 if value else 0})
    updated = get_mod_config(runtime, mod_id)
    if updated is None:
        raise WindhawkError(f"Failed to update mod config: {mod_id}")
    return updated


def delete_mod_storage(runtime: WindhawkRuntime, mod_id: str) -> None:
    storage_path = runtime.engine_mods_writable_path / "mod-storage" / mod_id
    shutil.rmtree(storage_path, ignore_errors=True)


def delete_mod_config(runtime: WindhawkRuntime, mod_id: str) -> None:
    if runtime.portable:
        for path in (
            get_mod_ini_path(runtime, mod_id),
            runtime.engine_mods_writable_path / f"{mod_id}.ini",
        ):
            try:
                path.unlink()
            except FileNotFoundError:
                pass
        delete_mod_storage(runtime, mod_id)
        return

    if runtime.mod_registry_ref:
        delete_registry_tree(runtime.mod_registry_ref, mod_id)
    if runtime.mod_registry_writable_ref:
        delete_registry_tree(runtime.mod_registry_writable_ref, mod_id)
    delete_mod_storage(runtime, mod_id)


def delete_old_mod_files(runtime: WindhawkRuntime, mod_id: str, architectures: list[str], current_dll_name: str | None = None) -> None:
    for subfolder in subfolders_from_architecture(runtime, architectures):
        compiled_mods_path = runtime.engine_mods_path / subfolder
        if not compiled_mods_path.exists():
            continue
        for path in compiled_mods_path.glob(f"{mod_id}_*.dll"):
            if current_dll_name and path.name == current_dll_name:
                continue
            name_without_extension = path.stem
            if not re.search(r"(^|_)\d+$", name_without_extension):
                continue
            try:
                path.unlink()
            except OSError:
                pass


def find_latest_log_files(runtime: WindhawkRuntime, kind: str) -> list[Path]:
    if not runtime.ui_logs_path.exists():
        return []
    sessions = [path for path in runtime.ui_logs_path.iterdir() if path.is_dir()]
    if not sessions:
        return []
    latest_session = max(sessions, key=lambda path: path.stat().st_mtime_ns)
    if kind == "main":
        main_log = latest_session / "main.log"
        return [main_log] if main_log.exists() else []
    return sorted(path for path in latest_session.rglob("*.log") if path.is_file())


def tail_lines(path: Path, limit: int, contains: str | None = None) -> list[str]:
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    if contains:
        lines = [line for line in lines if contains in line]
    return lines[-limit:]


def run_windhawk(runtime: WindhawkRuntime, *flags: str, wait: bool = False) -> dict[str, Any]:
    args = [str(runtime.exe_path), *flags]
    if wait:
        result = subprocess.run(args, capture_output=True, text=True, check=False)
        return {"args": args, "exit_code": result.returncode, "stdout": result.stdout, "stderr": result.stderr}
    process = subprocess.Popen(args)
    return {"args": args, "pid": process.pid}


def print_output(payload: Any, as_json: bool) -> None:
    if as_json:
        print(json.dumps(payload, indent=2))
        return
    print(json.dumps(payload, indent=2))


def command_detect(args: argparse.Namespace) -> Any:
    runtimes = detect_runtimes(args.root)
    if args.all:
        return {"runtimes": [runtime.to_dict() for runtime in runtimes]}
    return {"runtime": resolve_runtime(args.root).to_dict()}


def command_status(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    source_mods = sorted(path.name.removesuffix(".wh.cpp") for path in runtime.mods_source_path.glob("*.wh.cpp")) if runtime.mods_source_path.exists() else []
    installed_mods = get_installed_mod_ids(runtime)
    payload: dict[str, Any] = {
        "runtime": runtime.to_dict(),
        "running": is_windhawk_running(),
        "source_mods": source_mods,
        "installed_mods": installed_mods,
    }

    if args.mod_id:
        mod_payload: dict[str, Any] = {
            "mod_id": args.mod_id,
            "source_path": str(runtime.mods_source_path / f"{args.mod_id}.wh.cpp"),
            "workspace_path": str(runtime.editor_workspace_path / "mod.wh.cpp"),
            "config": get_mod_config(runtime, args.mod_id),
            "settings": get_mod_settings(runtime, args.mod_id),
            "compiled_binaries": [],
        }
        source_path = runtime.mods_source_path / f"{args.mod_id}.wh.cpp"
        if source_path.exists():
            source_text = source_path.read_text(encoding="utf-8")
            mod_payload["metadata"] = extract_metadata(source_text)
        for subfolder in ("32", "64", "arm64"):
            compiled_dir = runtime.engine_mods_path / subfolder
            if compiled_dir.exists():
                mod_payload["compiled_binaries"].extend(str(path) for path in sorted(compiled_dir.glob(f"{args.mod_id}_*.dll")))
        payload["mod"] = mod_payload
    return payload


def command_launch(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    flags: list[str] = []
    if args.tray_only:
        flags.append("-tray-only")
    if args.safe_mode:
        flags.append("-safe-mode")
    return run_windhawk(runtime, *flags, wait=args.wait)


def command_restart(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    flags = ["-restart"]
    if args.tray_only:
        flags.append("-tray-only")
    return run_windhawk(runtime, *flags, wait=args.wait)


def command_exit(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    flags = ["-exit"]
    if args.wait:
        flags.append("-wait")
    return run_windhawk(runtime, *flags, wait=args.wait)


def command_init_mod(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    source_path = runtime.mods_source_path / f"{args.mod_id}.wh.cpp"
    if source_path.exists() and not args.force:
        raise WindhawkError(f"Mod source already exists: {source_path}")
    mod_source = create_mod_source(args)
    write_mod_source(runtime, args.mod_id, mod_source)
    result: dict[str, Any] = {"mod_id": args.mod_id, "source_path": str(source_path)}
    if args.sync_workspace:
        result["workspace_sync"] = sync_workspace(runtime, args.mod_id, "to-workspace", force=True)
    return result


def command_sync_workspace(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    return sync_workspace(runtime, args.mod_id, args.direction, force=args.force)


def command_compile(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    if args.from_workspace:
        sync_workspace(runtime, args.mod_id, "from-workspace", force=False)
    mod_source = read_mod_source(runtime, args.mod_id)
    metadata = extract_metadata(mod_source)
    if metadata["id"] != args.mod_id:
        raise WindhawkError(f"Mod id in source is {metadata['id']}, expected {args.mod_id}")

    mod_targets = metadata.get("include", []) or []
    architectures = metadata.get("architecture", []) or []
    target_dll_name = generate_target_dll_name(runtime, args.mod_id, metadata.get("version", ""), architectures, mod_targets)

    compiled_paths: list[str] = []
    for target in targets_from_architecture(runtime, architectures, mod_targets):
        copy_compiler_libs(runtime, target)
        compiled_paths.append(compile_for_target(runtime, metadata, mod_source, target, target_dll_name))

    initial_settings = extract_initial_settings_for_engine(mod_source)
    config = write_mod_config(
        runtime,
        args.mod_id,
        {
            "LibraryFileName": target_dll_name,
            "Disabled": 1 if args.disabled else 0,
            "LoggingEnabled": 1 if args.enable_logging else 0,
            "Include": metadata.get("include", []) or [],
            "Exclude": metadata.get("exclude", []) or [],
            "Architecture": metadata.get("architecture", []) or [],
            "Version": metadata.get("version", "") or "",
        },
        initial_settings=initial_settings,
    )
    delete_old_mod_files(runtime, args.mod_id, architectures, current_dll_name=target_dll_name)

    restart_result = None
    if args.restart:
        flags = ["-restart"]
        if args.tray_only:
            flags.append("-tray-only")
        restart_result = run_windhawk(runtime, *flags, wait=False)

    return {
        "mod_id": args.mod_id,
        "target_dll_name": target_dll_name,
        "compiled_paths": compiled_paths,
        "config": config,
        "restart": restart_result,
    }


def command_enable(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    config = set_mod_field(runtime, args.mod_id, "Disabled", False)
    restart_result = None
    if args.restart:
        flags = ["-restart"]
        if args.tray_only:
            flags.append("-tray-only")
        restart_result = run_windhawk(runtime, *flags, wait=False)
    return {"mod_id": args.mod_id, "config": config, "restart": restart_result}


def command_disable(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    config = set_mod_field(runtime, args.mod_id, "Disabled", True)
    restart_result = None
    if args.restart:
        flags = ["-restart"]
        if args.tray_only:
            flags.append("-tray-only")
        restart_result = run_windhawk(runtime, *flags, wait=False)
    return {"mod_id": args.mod_id, "config": config, "restart": restart_result}


def command_logging(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    config = set_mod_field(runtime, args.mod_id, "LoggingEnabled", args.state == "on")
    return {"mod_id": args.mod_id, "config": config}


def command_delete_mod(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    config = get_mod_config(runtime, args.mod_id)
    architectures = config.get("Architecture", []) if config else []
    delete_old_mod_files(runtime, args.mod_id, architectures)
    delete_mod_config(runtime, args.mod_id)
    if not args.keep_source:
        delete_mod_source(runtime, args.mod_id)
    return {"mod_id": args.mod_id, "source_deleted": not args.keep_source}


def command_logs(args: argparse.Namespace) -> Any:
    runtime = resolve_runtime(args.root)
    files = find_latest_log_files(runtime, args.kind)
    return {
        "files": [
            {
                "path": str(path),
                "lines": tail_lines(path, args.lines, args.contains),
            }
            for path in files
        ]
    }


def main() -> int:
    args = parse_args()
    handlers = {
        "detect": command_detect,
        "status": command_status,
        "launch": command_launch,
        "restart": command_restart,
        "exit": command_exit,
        "init-mod": command_init_mod,
        "sync-workspace": command_sync_workspace,
        "compile": command_compile,
        "enable": command_enable,
        "disable": command_disable,
        "logging": command_logging,
        "delete-mod": command_delete_mod,
        "logs": command_logs,
    }

    try:
        payload = handlers[args.command](args)
    except CompileError as exc:
        error_payload = {
            "error": str(exc),
            "target": exc.target,
            "exit_code": exc.exit_code,
            "stdout": exc.stdout,
            "stderr": exc.stderr,
        }
        print(json.dumps(error_payload, indent=2))
        return 1
    except (WindhawkError, FileNotFoundError) as exc:
        print(json.dumps({"error": str(exc)}, indent=2))
        return 1

    print_output(payload, args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
