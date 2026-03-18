# Contributing

## Repository layout

- `src/windhawk`: Native Windows engine and app solution (`windhawk.sln`).
- `src/vscode-windhawk`: VS Code extension host integration.
- `src/vscode-windhawk-ui`: React/Nx webview UI used by the extension.

## Quick verification

These commands are the fastest checks currently verified in this repository.

### VS Code extension

```powershell
cd src\vscode-windhawk
npm install --ignore-scripts --no-package-lock
npx tsc -p . --noEmit
npm run lint
```

### Webview UI

```powershell
cd src\vscode-windhawk-ui
npm install --ignore-scripts --no-package-lock
npx nx lint vscode-windhawk-ui
npx nx lint vscode-windhawk-ui-e2e
npx nx test vscode-windhawk-ui --runInBand
npx tsc -p apps\vscode-windhawk-ui\tsconfig.app.json --noEmit
npx nx build vscode-windhawk-ui
```

## Native build prerequisites

The native solution is Windows-only and requires Visual Studio 2022 or the equivalent MSBuild + C++ build tools with a recent Windows SDK installed.

Open `src/windhawk/windhawk.sln` in Visual Studio, or build it from a Visual Studio developer shell.

### Native build shortcut

If `src\windhawk\build.bat` doesn't find the expected Visual Studio path automatically, enter a Visual Studio developer command prompt first and then run:

```powershell
cd src\windhawk
build.bat Release
```

That keeps the native build working even when the installed Visual Studio path differs from the hardcoded fallback inside `build.bat`.

If you need to discover the current Visual Studio install path first, `vswhere` plus `vcvars64.bat` is the most reliable fallback:

```powershell
$vsPath = & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" `
  -latest -products * -property installationPath
cmd /c "call `"$vsPath\VC\Auxiliary\Build\vcvars64.bat`" && cd /d src\windhawk && build.bat Release"
```

## Notes

- The extension package includes native runtime dependencies. For lint and typecheck-only verification, `--ignore-scripts` avoids unnecessary rebuild steps.
- If you add new automated checks, prefer commands that can run headlessly in CI.

## Portable release packaging

- Refresh the native binaries first. The packaging script does not rebuild `src\windhawk\Release` for you.
- A verified native-build fallback is:

```powershell
$vsPath = & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" `
  -latest -products * -property installationPath
cmd /c "call `"$vsPath\VC\Auxiliary\Build\vcvars64.bat`" && cd /d src\windhawk && build.bat Release"
```

- The supported packaging script is `artifacts/installer-build/build_custom_portable.ps1`.
- Run it from the repository root with `powershell -ExecutionPolicy Bypass -File artifacts\installer-build\build_custom_portable.ps1`.
- It expects a portable baseline install at `%LOCALAPPDATA%\Programs\Windhawk-Custom-Portable` and reads `windhawk.ini` from that location to determine the active engine path.
- The script rebuilds the webview and extension by default, overlays the latest native binaries from `src/windhawk/Release`, rewrites the portable runtime config, and emits both `artifacts/windhawk-custom-portable-installer.exe` and `artifacts/portable-build/windhawk-custom-portable.zip`.
- Use `-SkipBuild` only when you deliberately want to reuse the current webview and extension outputs while repackaging the portable payload.
- If you change installer behavior, payload layout, or runtime config rewriting, keep `artifacts/installer-build/InstallerStub.cs` and `artifacts/installer-build/build_custom_portable.ps1` aligned so the release artifact and the packaged payload stay in sync.

## AI-assisted mod authoring

- The webview now includes a `New Mod Studio` flow with code-first and visual modes, language-aware starter filtering, a structured core starter, a standard starter, an AI-ready starter, focused starters for Explorer shell work, Chromium browser work, window behavior, and settings-first scaffolding, plus copyable prompt packs for ideation, structure planning, scaffolding, browser UI work, review, and documentation.
- The same flow now exposes workflow bundles, recommended launch paths, CLI playbooks, and kickoff packets that combine the chosen starter, tools, prompts, and verification guidance into one copyable handoff.
- The AI-ready starter lives at `src/vscode-windhawk/files/mod_template_ai_ready.wh.cpp` and is intentionally still a normal Windhawk template, not a separate runtime path.
- Additional focused starters live beside it in `src/vscode-windhawk/files`. Keep them compile-safe, explanatory, and structurally legible: they should help contributors pick a mod shape quickly without pretending to be finished production mods.
- Python-backed authoring now lives in `src/vscode-windhawk/files/mod_template_python.wh.py`, with the renderer in `src/vscode-windhawk/files/python/render_mod.py` and the helper module in `src/vscode-windhawk/files/python/windhawk_py`. Keep the generated `.wh.cpp` output valid because it is still the compile-time contract with Windhawk.
- The create flow currently exposes the Python automation starter as the Python-backed template. If you add more `.wh.py` starters, update the modal starter filtering and tests so Python mode only offers templates that actually have a Python implementation.
- If you add or rename starters, workflow bundles, or CLI playbooks, keep `NewModStudioModal.tsx`, `aiModStudio.ts`, `aiModStudio.spec.ts`, and `translation.json` aligned so the copy, filtering, and packet generation stay consistent.
- Recent studio sessions are persisted in local UI settings and relaunch through stored editor launch context. If you change launch-context shape or recent-session behavior, keep `appUISettings.ts`, `appUISettings.spec.ts`, `NewModStudioModal.tsx`, and `translation.json` aligned.
- Treat AI output as a draft. Contributors are still expected to verify hook targets, failure handling, compatibility notes, and manual test steps before shipping a mod or template change.

## Editor cockpit workflow

- The editor sidebar now depends on live `setEditedModDetails` metadata from the extension host. If you add editor-side actions that change compile state, logging, versioning, or target processes, keep that payload in sync.
- The editor cockpit now uses an explicit scroll shell with a pinned footer exit action. Keep long-running or low-priority actions inside the scroll area and reserve the footer for persistent, high-value actions that must remain reachable.
- Compile presets, process summarization, inferred Windows surfaces, contextual Windows quick actions, the evidence board, the iteration plan, and AI helper prompt generation live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/sidebar/EditorModeControls.tsx` and `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/sidebar/editorModeUtils.ts`. Update the paired tests when you change those flows.
- The editor now also derives a recommended compile profile and a verification pack from the current draft state. If you retune those heuristics, update the utility tests rather than burying the behavior inside the component.
- The sidebar intentionally refreshes details after compile, enable, and logging actions so the authoring UI reflects the latest runtime state instead of stale local assumptions.
- The newer AI flows are intentionally heuristic-backed. If you change the prompt deck or evidence cards, keep `editorModeUtils.spec.ts` aligned so trust and verification guidance do not silently drift.
- The latest editor AI additions are research-driven: prompt-less explainers, a challenge board, best-practice audit prompts, and validation-feedback recovery prompts. Keep those grouped and legible so the cockpit stays actionable rather than turning into an undifferentiated prompt dump.

## Windows runtime toolkit

- `AppRuntimeDiagnostics` is shared between the extension host and the webview. If you add or rename Windows environment fields, update both `src/vscode-windhawk/src/webviewIPCMessages.ts` and `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/webviewIPCMessages.ts` together.
- Runtime diagnostics now include memory and simple NPU detection in addition to Windows version/session data. Keep `RuntimeDiagnosticsUtils` fast and defensive because these values are fetched as part of normal settings/about flows.
- The About page and the editor cockpit now use `openExternal` and `openPath` IPC actions for Windows settings deep links and Explorer path launches. Reuse those actions instead of hardcoding shell behavior inside React components.
- Windows-surface discovery lives in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/modDiscovery.ts` and `ModsBrowserOnline.tsx`. When you add new Windows areas, update the concept vocabulary, preset cards, mission coverage, and `modDiscovery.spec.ts` together so search, browse insights, and preset counts stay aligned.
- Research missions also live off the discovery layer. If you add or retune a mission, keep the query, follow-up queries, workbench candidate summaries, verification checks, and mission-brief output coherent so Explore still encourages compare-and-verify behavior instead of one-click blind installs.

## Local performance preferences

- Local workspace behavior is coordinated through `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/appUISettings.ts`. If you add new local UI switches, update the normalization, defaults, persistence tests, and any runtime-based recommendation logic together.
- The new Performance and AI settings section reads `runtimeDiagnostics` from `getAppSettings`. If you change those diagnostics, keep the recommendation copy and the About page summary aligned so the same machine state does not produce contradictory guidance.
- Workflow-level settings now also drive the startup route, Explore's empty-query sort, the editor cockpit assistance level, and Windows quick-action density in About/editor surfaces. Keep `Panel.tsx`, `ModsBrowserOnline.tsx`, `About.tsx`, and `EditorModeControls.tsx` aligned when you add or rename those controls.

## Install and home heuristics

- Install decision heuristics live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/installDecisionUtils.ts`. If you change install guidance, keep the recommendation cards and checklist logic aligned so the modal does not suggest an action that contradicts its own signals.
- The install modal now supports a disabled-first install path through the existing install IPC. If you change the install request payload shape, make sure the not-installed and update flows still preserve the optional `disabled` flag.
- Curated repository mods are merged into the normal online catalog in the extension host. Keep their metadata, source URLs, and install expectations aligned so featured defaults such as `force-process-accelerators` behave like first-class available mods.
- Local home insights live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/localModsInsights.ts`. Update the paired tests when you retune what counts as "needs attention", "needs compile", or "logging enabled" so quick-focus chips and overview counts remain intentional.
