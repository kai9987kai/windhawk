from __future__ import annotations

from dataclasses import dataclass, field
import re
from typing import Iterable, List, Optional


def _indent_block(value: str, prefix: str = "    ") -> str:
    value = value.strip("\n")
    if not value:
        return ""
    return "\n".join(
        (prefix + line if line else "") for line in value.splitlines()
    )


def _sanitize_cpp_name(value: str) -> str:
    sanitized = re.sub(r"[^0-9A-Za-z_]", "_", value)
    if sanitized and sanitized[0].isdigit():
        sanitized = "_" + sanitized
    return sanitized or "value"


def _yaml_scalar(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    text = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{text}"'


def _render_yaml_setting(setting: "Setting") -> str:
    lines = [f"- {setting.key}: {_yaml_scalar(setting.default)}"]
    if setting.name:
        lines.append(f"  $name: {_yaml_scalar(setting.name)}")
    if setting.description:
        lines.append(f"  $description: {_yaml_scalar(setting.description)}")
    if setting.options:
        lines.append("  $options:")
        for option in setting.options:
            for key, value in option.items():
                lines.append(f"  - {key}: {_yaml_scalar(value)}")
    return "\n".join(lines)


def _render_string_setting_loader(setting: "Setting") -> str:
    return "\n".join(
        [
            f'    const auto raw_{setting.cpp_name} = Wh_GetStringSetting(L"{setting.key}");',
            f"    settings.{setting.cpp_name} = raw_{setting.cpp_name};",
            f"    Wh_FreeStringSetting(raw_{setting.cpp_name});",
        ]
    )


@dataclass
class Setting:
    key: str
    default: object
    kind: str
    name: Optional[str] = None
    description: Optional[str] = None
    options: Optional[List[dict[str, str]]] = None
    cpp_name: str = field(init=False)

    def __post_init__(self) -> None:
        self.cpp_name = _sanitize_cpp_name(self.key.replace(".", "_"))

    def cpp_type(self) -> str:
        if self.kind == "bool":
            return "bool"
        if self.kind == "int":
            return "int"
        return "std::wstring"

    def load_line(self) -> str:
        if self.kind == "bool":
            return f'    settings.{self.cpp_name} = Wh_GetIntSetting(L"{self.key}") != 0;'
        if self.kind == "int":
            return f'    settings.{self.cpp_name} = Wh_GetIntSetting(L"{self.key}");'
        return _render_string_setting_loader(self)


def bool_setting(
    key: str,
    default: bool,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> Setting:
    return Setting(
        key=key,
        default=default,
        kind="bool",
        name=name,
        description=description,
    )


def int_setting(
    key: str,
    default: int,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> Setting:
    return Setting(
        key=key,
        default=default,
        kind="int",
        name=name,
        description=description,
    )


def string_setting(
    key: str,
    default: str,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> Setting:
    return Setting(
        key=key,
        default=default,
        kind="string",
        name=name,
        description=description,
    )


def choice_setting(
    key: str,
    default: str,
    *,
    options: Iterable[dict[str, str]],
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> Setting:
    return Setting(
        key=key,
        default=default,
        kind="string",
        name=name,
        description=description,
        options=list(options),
    )


def mouse_helpers() -> str:
    return r"""
namespace MouseAutomation {

INPUT MakeMouseInput(DWORD flags, LONG dx = 0, LONG dy = 0) {
    INPUT input{};
    input.type = INPUT_MOUSE;
    input.mi.dwFlags = flags;
    input.mi.dx = dx;
    input.mi.dy = dy;
    return input;
}

void MoveAbsolute(int x, int y) {
    const int screenWidth = GetSystemMetrics(SM_CXSCREEN) - 1;
    const int screenHeight = GetSystemMetrics(SM_CYSCREEN) - 1;
    if (screenWidth <= 0 || screenHeight <= 0) {
        return;
    }

    const LONG normalizedX = static_cast<LONG>((65535LL * x) / screenWidth);
    const LONG normalizedY = static_cast<LONG>((65535LL * y) / screenHeight);
    auto input = MakeMouseInput(
        MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE,
        normalizedX,
        normalizedY
    );
    SendInput(1, &input, sizeof(input));
}

void LeftClick() {
    INPUT inputs[2] = {
        MakeMouseInput(MOUSEEVENTF_LEFTDOWN),
        MakeMouseInput(MOUSEEVENTF_LEFTUP),
    };
    SendInput(2, inputs, sizeof(INPUT));
}

}  // namespace MouseAutomation
"""


def keyboard_helpers() -> str:
    return r"""
namespace KeyboardAutomation {

INPUT MakeKeyboardInput(WORD key, DWORD flags = 0) {
    INPUT input{};
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = key;
    input.ki.dwFlags = flags;
    return input;
}

void Tap(WORD key) {
    INPUT inputs[2] = {
        MakeKeyboardInput(key),
        MakeKeyboardInput(key, KEYEVENTF_KEYUP),
    };
    SendInput(2, inputs, sizeof(INPUT));
}

void CtrlShiftTap(WORD key) {
    INPUT inputs[6] = {
        MakeKeyboardInput(VK_CONTROL),
        MakeKeyboardInput(VK_SHIFT),
        MakeKeyboardInput(key),
        MakeKeyboardInput(key, KEYEVENTF_KEYUP),
        MakeKeyboardInput(VK_SHIFT, KEYEVENTF_KEYUP),
        MakeKeyboardInput(VK_CONTROL, KEYEVENTF_KEYUP),
    };
    SendInput(6, inputs, sizeof(INPUT));
}

}  // namespace KeyboardAutomation
"""


@dataclass
class Mod:
    id: str
    name: str
    description: str
    version: str
    author: str
    include: List[str] = field(default_factory=list)
    exclude: List[str] = field(default_factory=list)
    architecture: List[str] = field(default_factory=lambda: ["x86", "x86-64"])
    compiler_options: str = "-luser32"
    license: str = "MIT"
    github: str = ""
    homepage: str = ""
    twitter: str = ""
    donate_url: str = ""
    readme: str = ""
    settings: List[Setting] = field(default_factory=list)
    headers: str = ""
    globals: str = ""
    helpers: str = ""
    body: str = ""
    init_code: str = ""
    uninit_code: str = ""
    settings_changed_code: str = ""

    def _metadata_lines(self) -> List[str]:
        lines = [
            "// ==WindhawkMod==",
            f"// @id              {self.id}",
            f"// @name            {self.name}",
            f"// @description     {self.description}",
            f"// @version         {self.version}",
            f"// @author          {self.author}",
        ]
        if self.github:
            lines.append(f"// @github          {self.github}")
        if self.twitter:
            lines.append(f"// @twitter         {self.twitter}")
        if self.homepage:
            lines.append(f"// @homepage        {self.homepage}")
        if self.compiler_options:
            lines.append(f"// @compilerOptions {self.compiler_options}")
        if self.license:
            lines.append(f"// @license         {self.license}")
        if self.donate_url:
            lines.append(f"// @donateUrl       {self.donate_url}")
        for value in self.include:
            lines.append(f"// @include         {value}")
        for value in self.exclude:
            lines.append(f"// @exclude         {value}")
        for value in self.architecture:
            lines.append(f"// @architecture    {value}")
        lines.append("// ==/WindhawkMod==")
        return lines

    def _settings_struct(self) -> str:
        if not self.settings:
            return ""

        fields = "\n".join(
            f"    {setting.cpp_type()} {setting.cpp_name};" for setting in self.settings
        )
        return "\n".join(
            [
                "struct ModSettings {",
                fields,
                "} settings;",
            ]
        )

    def _load_settings(self) -> str:
        if not self.settings:
            return "\n".join(["void LoadSettings() {", "}", ""])

        lines = ["void LoadSettings() {"]
        for setting in self.settings:
            lines.append(setting.load_line())
        lines.append("}")
        lines.append("")
        return "\n".join(lines)

    def render(self) -> str:
        readme = self.readme.strip() or (
            "# Python-authored Windhawk mod\n"
            "This mod was authored with `windhawk_py` and rendered to `.wh.cpp`."
        )
        settings_block = (
            "\n".join(_render_yaml_setting(setting) for setting in self.settings)
            if self.settings
            else "- enabled: true\n  $name: Enabled\n  $description: Toggle the mod on or off."
        )

        include_string = ""
        if any(setting.kind == "string" for setting in self.settings):
            include_string = "#include <string>\n"

        user_headers = self.headers.strip()
        if user_headers:
            user_headers = user_headers + "\n"

        sections = [
            "\n".join(self._metadata_lines()),
            "",
            "// ==WindhawkModReadme==",
            "/*",
            readme,
            "*/",
            "// ==/WindhawkModReadme==",
            "",
            "// ==WindhawkModSettings==",
            "/*",
            settings_block,
            "*/",
            "// ==/WindhawkModSettings==",
            "",
            "#include <windows.h>",
            include_string.rstrip("\n"),
            user_headers.rstrip("\n"),
            "",
            "namespace {",
            "",
            self._settings_struct(),
            self.globals.strip(),
            self.helpers.strip(),
            self.body.strip(),
            self._load_settings().rstrip("\n"),
            "}  // namespace",
            "",
            "BOOL Wh_ModInit() {",
            '    Wh_Log(L"Init");',
            "    LoadSettings();",
            _indent_block(self.init_code),
            "    return InstallHooks();"
            if "InstallHooks(" in self.body
            else "    return TRUE;",
            "}",
            "",
            "void Wh_ModUninit() {",
            '    Wh_Log(L"Uninit");',
            _indent_block(self.uninit_code),
            "}",
            "",
            "void Wh_ModSettingsChanged() {",
            '    Wh_Log(L"SettingsChanged");',
            "    LoadSettings();",
            _indent_block(self.settings_changed_code),
            "}",
            "",
        ]

        rendered = "\n".join(section for section in sections if section is not None)
        return re.sub(r"\n{3,}", "\n\n", rendered).strip() + "\n"
