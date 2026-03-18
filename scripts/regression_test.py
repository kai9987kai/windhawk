from __future__ import annotations

import argparse
import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run regression tests for the Windhawk control skill.")
    parser.add_argument(
        "--helper",
        default=str(Path(__file__).with_name("windhawk_tool.py")),
        help="Path to windhawk_tool.py. Defaults to the sibling helper script.",
    )
    parser.add_argument(
        "--real-root",
        default=str(Path(os.environ.get("LOCALAPPDATA", str(Path.home() / "AppData" / "Local"))) / "Programs" / "Windhawk-Custom-Portable"),
        help="Path to a real Windhawk portable root used for compiler/runtime assets.",
    )
    parser.add_argument(
        "--include-live",
        action="store_true",
        help="Also run live lifecycle checks against the auto-detected real Windhawk runtime.",
    )
    parser.add_argument(
        "--keep-sandboxes",
        action="store_true",
        help="Keep temporary sandboxes after the run.",
    )
    return parser.parse_args()


@dataclass
class CommandResult:
    returncode: int
    payload: dict[str, Any] | None
    stderr: str


class RegressionFailure(RuntimeError):
    pass


class RegressionHarness:
    def __init__(self, helper: Path, real_root: Path, include_live: bool, keep_sandboxes: bool) -> None:
        self.helper = helper
        self.real_root = real_root
        self.include_live = include_live
        self.keep_sandboxes = keep_sandboxes
        self.results: list[dict[str, Any]] = []
        self.temp_dir = Path(tempfile.mkdtemp(prefix="windhawk-control-regression-"))
        self.base = self.temp_dir / "base"
        self.mismatch = self.temp_dir / "mismatch"
        self.no_compiler = self.temp_dir / "no-compiler"

    def run(self) -> int:
        try:
            self._validate_inputs()
            self._create_sandboxes()
            self._run_sandbox_suite()
            if self.include_live:
                self._run_live_suite()
        except Exception as exc:
            self._record_failure("regression-suite", str(exc))
            print(
                json.dumps(
                    {
                        "ok": False,
                        "helper": str(self.helper),
                        "real_root": str(self.real_root),
                        "results": self.results,
                        "sandbox_dir": str(self.temp_dir),
                    },
                    indent=2,
                )
            )
            return 1
        finally:
            if not self.keep_sandboxes and not any(not result["ok"] for result in self.results):
                self._cleanup()

        print(
            json.dumps(
                {
                    "ok": True,
                    "helper": str(self.helper),
                    "real_root": str(self.real_root),
                    "include_live": self.include_live,
                    "results": self.results,
                    "sandbox_dir": None if not self.keep_sandboxes else str(self.temp_dir),
                },
                indent=2,
            )
        )
        return 0

    def _validate_inputs(self) -> None:
        if not self.helper.exists():
            raise RegressionFailure(f"Helper not found: {self.helper}")
        if not self.real_root.exists():
            raise RegressionFailure(f"Real Windhawk root not found: {self.real_root}")
        for path in [
            self.real_root / "windhawk.exe",
            self.real_root / "windhawk-x64-helper.exe",
            self.real_root / "command-line.txt",
            self.real_root / "Compiler",
            self.real_root / "UI",
            self.real_root / "Engine" / "1.7.3" / "32" / "windhawk.lib",
            self.real_root / "Engine" / "1.7.3" / "64" / "windhawk.lib",
            self.real_root / "Engine" / "1.7.3" / "arm64" / "windhawk.lib",
        ]:
            if not path.exists():
                raise RegressionFailure(f"Missing required real-root asset: {path}")

    def _create_sandboxes(self) -> None:
        for root in [self.base, self.mismatch, self.no_compiler]:
            self._build_sandbox(root)

        (self.mismatch / "Engine" / "1.7.3" / "engine.ini").write_text(
            "[Storage]\nPortable=1\nAppDataPath=..\\..\\Data\\WrongEngine\n",
            encoding="utf-8",
        )
        (self.no_compiler / "windhawk.ini").write_text(
            "[Storage]\n"
            "Portable=1\n"
            "CompilerPath=C:\\definitely-missing-windhawk-compiler\n"
            "EnginePath=Engine\\1.7.3\n"
            f"UIPath={self.real_root / 'UI'}\n"
            "AppDataPath=Data\n",
            encoding="utf-8",
        )

    def _build_sandbox(self, root: Path) -> None:
        for rel in [
            Path("Engine/1.7.3/32"),
            Path("Engine/1.7.3/64"),
            Path("Engine/1.7.3/arm64"),
            Path("Data/Engine/Mods/32"),
            Path("Data/Engine/Mods/64"),
            Path("Data/Engine/Mods/arm64"),
        ]:
            (root / rel).mkdir(parents=True, exist_ok=True)

        for name in ["windhawk.exe", "windhawk-x64-helper.exe", "command-line.txt"]:
            shutil.copy2(self.real_root / name, root / name)
        for arch in ["32", "64", "arm64"]:
            shutil.copy2(
                self.real_root / "Engine" / "1.7.3" / arch / "windhawk.lib",
                root / "Engine" / "1.7.3" / arch / "windhawk.lib",
            )

        (root / "windhawk.ini").write_text(
            "[Storage]\n"
            "Portable=1\n"
            f"CompilerPath={self.real_root / 'Compiler'}\n"
            "EnginePath=Engine\\1.7.3\n"
            f"UIPath={self.real_root / 'UI'}\n"
            "AppDataPath=Data\n",
            encoding="utf-8",
        )
        (root / "Engine" / "1.7.3" / "engine.ini").write_text(
            "[Storage]\nPortable=1\nAppDataPath=..\\..\\Data\\Engine\n",
            encoding="utf-8",
        )

    def _run_sandbox_suite(self) -> None:
        status = self._run_helper("baseline-status", self.base, "status")
        self._expect(status.returncode == 0, "baseline status failed")
        self._expect(status.payload["runtime"]["storage_mismatch"] is False, "baseline sandbox unexpectedly mismatched")

        valid_init = self._run_helper(
            "positive-init",
            self.base,
            "init-mod",
            "--mod-id",
            "control-ok",
            "--name",
            "Control Ok",
            "--description",
            "Positive control mod",
            "--include",
            "notepad.exe",
            "--sync-workspace",
            "--force",
        )
        self._expect(valid_init.returncode == 0, "positive init failed")

        workspace = self.base / "Data" / "EditorWorkspace" / "mod.wh.cpp"
        workspace.write_text(workspace.read_text(encoding="utf-8") + "\n// positive-control\n", encoding="utf-8")
        valid_compile = self._run_helper(
            "positive-compile",
            self.base,
            "compile",
            "--mod-id",
            "control-ok",
            "--from-workspace",
            "--disabled",
            "--enable-logging",
        )
        self._expect(valid_compile.returncode == 0, "positive compile failed")
        self._expect(valid_compile.payload["config"]["Disabled"] is True, "positive compile disabled flag mismatch")
        self._expect(valid_compile.payload["config"]["LoggingEnabled"] is True, "positive compile logging flag mismatch")

        logs = self._run_helper("empty-logs", self.base, "logs", "--kind", "main", "--lines", "5")
        self._expect(logs.returncode == 0, "logs failed")
        self._expect(logs.payload["files"] == [], "fresh sandbox logs should be empty")

        delete_missing = self._run_helper("delete-missing-mod", self.base, "delete-mod", "--mod-id", "missing-mod")
        self._expect(delete_missing.returncode == 0, "delete missing failed")

        missing_status = self._run_helper("status-missing-mod", self.base, "status", "--mod-id", "not-installed-anywhere")
        self._expect(missing_status.returncode == 0, "missing mod status failed")
        self._expect(missing_status.payload["mod"]["config"] is None, "missing mod config should be null")

        invalid_id = self._run_helper("invalid-mod-id", self.base, "init-mod", "--mod-id", "BadMod", "--name", "BadMod")
        self._expect(invalid_id.returncode != 0, "invalid id should fail")
        self._expect("lowercase letters" in invalid_id.payload["error"], "invalid id error mismatch")

        workspace_init = self._run_helper(
            "workspace-id-mismatch-init",
            self.base,
            "init-mod",
            "--mod-id",
            "workspace-one",
            "--name",
            "Workspace One",
            "--sync-workspace",
            "--force",
        )
        self._expect(workspace_init.returncode == 0, "workspace init failed")
        text = workspace.read_text(encoding="utf-8")
        workspace.write_text(text.replace("@id              workspace-one", "@id              workspace-two"), encoding="utf-8")
        workspace_sync_fail = self._run_helper(
            "workspace-id-mismatch",
            self.base,
            "sync-workspace",
            "--mod-id",
            "workspace-one",
            "--direction",
            "from-workspace",
        )
        self._expect(workspace_sync_fail.returncode != 0, "workspace id mismatch should fail")
        self._expect("contains mod id workspace-two" in workspace_sync_fail.payload["error"], "workspace mismatch error mismatch")

        (self.base / "Data" / "ModsSource" / "missing-meta.wh.cpp").write_text("int main() { return 0; }\n", encoding="utf-8")
        missing_meta = self._run_helper("missing-metadata", self.base, "compile", "--mod-id", "missing-meta")
        self._expect(missing_meta.returncode != 0, "missing metadata should fail")
        self._expect("Couldn't find a metadata block" in missing_meta.payload["error"], "missing metadata error mismatch")

        bad_settings_init = self._run_helper(
            "malformed-settings-init",
            self.base,
            "init-mod",
            "--mod-id",
            "bad-settings",
            "--name",
            "Bad Settings",
            "--force",
        )
        self._expect(bad_settings_init.returncode == 0, "bad settings init failed")
        bad_settings_path = self.base / "Data" / "ModsSource" / "bad-settings.wh.cpp"
        bad_settings_text = bad_settings_path.read_text(encoding="utf-8")
        bad_settings_text = bad_settings_text.replace(
            "- enabled: true\n  $name: Enabled\n  $description: Disable this if you want the hook to short-circuit without uninstalling the mod.\n",
            "- enabled: [\n",
        )
        bad_settings_path.write_text(bad_settings_text, encoding="utf-8")
        bad_settings = self._run_helper("malformed-settings-yaml", self.base, "compile", "--mod-id", "bad-settings")
        self._expect(bad_settings.returncode != 0, "malformed settings should fail")
        self._expect("Failed to parse settings:" in bad_settings.payload["error"], "malformed settings error mismatch")
        self._expect(bad_settings.stderr == "", "malformed settings should not print tracebacks")

        bad_arch_init = self._run_helper(
            "unsupported-architecture-init",
            self.base,
            "init-mod",
            "--mod-id",
            "bad-arch",
            "--name",
            "Bad Arch",
            "--force",
        )
        self._expect(bad_arch_init.returncode == 0, "bad arch init failed")
        bad_arch_path = self.base / "Data" / "ModsSource" / "bad-arch.wh.cpp"
        bad_arch_text = bad_arch_path.read_text(encoding="utf-8").replace("// ==/WindhawkMod==", "// @architecture    armv7\n// ==/WindhawkMod==")
        bad_arch_path.write_text(bad_arch_text, encoding="utf-8")
        bad_arch = self._run_helper("unsupported-architecture", self.base, "compile", "--mod-id", "bad-arch")
        self._expect(bad_arch.returncode != 0, "unsupported architecture should fail")
        self._expect("Unsupported architecture armv7" in bad_arch.payload["error"], "unsupported architecture error mismatch")

        syntax_init = self._run_helper(
            "compile-syntax-error-init",
            self.base,
            "init-mod",
            "--mod-id",
            "syntax-bomb",
            "--name",
            "Syntax Bomb",
            "--force",
        )
        self._expect(syntax_init.returncode == 0, "syntax init failed")
        syntax_path = self.base / "Data" / "ModsSource" / "syntax-bomb.wh.cpp"
        syntax_path.write_text(syntax_path.read_text(encoding="utf-8") + "\nthis is not valid c++\n", encoding="utf-8")
        syntax_fail = self._run_helper("compile-syntax-error", self.base, "compile", "--mod-id", "syntax-bomb")
        self._expect(syntax_fail.returncode != 0, "syntax compile should fail")
        self._expect(bool(syntax_fail.payload["stderr"]), "syntax compile should include stderr")

        no_compiler_init = self._run_helper(
            "missing-compiler-init",
            self.no_compiler,
            "init-mod",
            "--mod-id",
            "no-compiler",
            "--name",
            "No Compiler",
            "--force",
        )
        self._expect(no_compiler_init.returncode == 0, "missing compiler init failed")
        no_compiler = self._run_helper("missing-compiler-path", self.no_compiler, "compile", "--mod-id", "no-compiler")
        self._expect(no_compiler.returncode != 0, "missing compiler should fail")
        self._expect("Missing compiler dependency" in no_compiler.payload["error"], "missing compiler error mismatch")

        mismatch_status = self._run_helper("storage-mismatch-detection", self.mismatch, "status")
        self._expect(mismatch_status.returncode == 0, "mismatch status failed")
        self._expect(mismatch_status.payload["runtime"]["storage_mismatch"] is True, "mismatch should be flagged")
        self._expect(len(mismatch_status.payload["runtime"]["storage_notes"]) > 0, "mismatch notes should be present")

        missing_enable = self._run_helper("enable-missing-mod", self.base, "enable", "--mod-id", "not-installed-anywhere")
        self._expect(missing_enable.returncode != 0, "enable on missing mod should fail")
        self._expect("Mod is not installed" in missing_enable.payload["error"], "missing enable error mismatch")

        cleanup = self._run_helper("cleanup-control-mod", self.base, "delete-mod", "--mod-id", "control-ok")
        self._expect(cleanup.returncode == 0, "positive control cleanup failed")

    def _run_live_suite(self) -> None:
        detect = self._run_helper("live-detect", None, "detect")
        self._expect(detect.returncode == 0, "live detect failed")

        status_before = self._run_helper("live-status-before", None, "status")
        self._expect(status_before.returncode == 0, "live status before failed")

        launched = False
        try:
            launch = self._run_helper("live-launch", None, "launch", "--tray-only")
            self._expect(launch.returncode == 0, "live launch failed")
            launched = True

            restart = self._run_helper("live-restart", None, "restart", "--tray-only")
            self._expect(restart.returncode == 0, "live restart failed")

            status_running = self._run_helper("live-status-running", None, "status")
            self._expect(status_running.returncode == 0, "live running status failed")
            self._expect(status_running.payload["running"] is True, "Windhawk should be running during live suite")
        finally:
            if launched:
                self._run_helper("live-exit", None, "exit", "--wait")

        status_after = self._run_helper("live-status-after", None, "status")
        self._expect(status_after.returncode == 0, "live status after failed")
        self._expect(status_after.payload["running"] is False, "Windhawk should be stopped after live suite")

    def _run_helper(self, name: str, root: Path | None, *args: str) -> CommandResult:
        command = [sys.executable, str(self.helper)]
        if root is not None:
            command.extend(["--root", str(root)])
        command.extend(["--json", *args])

        proc = subprocess.run(command, capture_output=True, text=True, timeout=180)
        payload = json.loads(proc.stdout) if proc.stdout.strip() else None
        result = CommandResult(proc.returncode, payload, proc.stderr.strip())
        self.results.append(
            {
                "name": name,
                "ok": proc.returncode == 0,
                "args": list(args) if root is None else [str(root), *args],
                "returncode": proc.returncode,
                "payload": payload,
                "stderr": result.stderr,
            }
        )
        return result

    def _expect(self, condition: bool, message: str) -> None:
        if not condition:
            raise RegressionFailure(message)
        self.results[-1]["ok"] = True

    def _record_failure(self, name: str, error: str) -> None:
        self.results.append({"name": name, "ok": False, "error": error})

    def _cleanup(self) -> None:
        def onerror(func, path, _exc_info):
            os.chmod(path, stat.S_IWRITE)
            func(path)

        shutil.rmtree(self.temp_dir, onerror=onerror, ignore_errors=False)


def main() -> int:
    args = parse_args()
    harness = RegressionHarness(
        helper=Path(args.helper).resolve(),
        real_root=Path(args.real_root).resolve(),
        include_live=args.include_live,
        keep_sandboxes=args.keep_sandboxes,
    )
    return harness.run()


if __name__ == "__main__":
    sys.exit(main())
