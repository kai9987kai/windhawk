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

## Notes

- The extension package includes native runtime dependencies. For lint and typecheck-only verification, `--ignore-scripts` avoids unnecessary rebuild steps.
- If you add new automated checks, prefer commands that can run headlessly in CI.

## Portable release packaging

- The supported packaging script is `artifacts/installer-build/build_custom_portable.ps1`.
- It expects a portable baseline install at `%LOCALAPPDATA%\Programs\Windhawk-Custom-Portable` and reads `windhawk.ini` from that location to determine the active engine path.
- The script rebuilds the webview and extension by default, overlays the latest native binaries from `src/windhawk/Release`, rewrites the portable runtime config, and emits `artifacts/windhawk-custom-portable-installer.exe`.
- If you change installer behavior, payload layout, or runtime config rewriting, keep `artifacts/installer-build/InstallerStub.cs` and `artifacts/installer-build/build_custom_portable.ps1` aligned so the release artifact and the packaged payload stay in sync.

## AI-assisted mod authoring

- The webview now includes a `New Mod Studio` flow with a standard starter, an AI-ready starter, and copyable prompt packs for ideation, scaffolding, review, and documentation.
- The AI-ready starter lives at `src/vscode-windhawk/files/mod_template_ai_ready.wh.cpp` and is intentionally still a normal Windhawk template, not a separate runtime path.
- Treat AI output as a draft. Contributors are still expected to verify hook targets, failure handling, compatibility notes, and manual test steps before shipping a mod or template change.

## Editor cockpit workflow

- The editor sidebar now depends on live `setEditedModDetails` metadata from the extension host. If you add editor-side actions that change compile state, logging, versioning, or target processes, keep that payload in sync.
- Compile presets, process summarization, the evidence board, the iteration plan, and AI helper prompt generation live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/sidebar/EditorModeControls.tsx` and `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/sidebar/editorModeUtils.ts`. Update the paired tests when you change those flows.
- The editor now also derives a recommended compile profile and a verification pack from the current draft state. If you retune those heuristics, update the utility tests rather than burying the behavior inside the component.
- The sidebar intentionally refreshes details after compile, enable, and logging actions so the authoring UI reflects the latest runtime state instead of stale local assumptions.
- The newer AI flows are intentionally heuristic-backed. If you change the prompt deck or evidence cards, keep `editorModeUtils.spec.ts` aligned so trust and verification guidance do not silently drift.

## Windows runtime toolkit

- `AppRuntimeDiagnostics` is shared between the extension host and the webview. If you add or rename Windows environment fields, update both `src/vscode-windhawk/src/webviewIPCMessages.ts` and `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/webviewIPCMessages.ts` together.
- The About page now uses `openExternal` and `openPath` IPC actions for Windows settings deep links and Explorer path launches. Reuse those actions instead of hardcoding shell behavior inside React components.
- Windows-surface discovery lives in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/modDiscovery.ts` and `ModsBrowserOnline.tsx`. When you add new Windows areas, update the concept vocabulary, preset cards, and `modDiscovery.spec.ts` together so search, browse insights, and preset counts stay aligned.
- Research missions also live off the discovery layer. If you add or retune a mission, keep the query, follow-up queries, workbench candidate summaries, verification checks, and mission-brief output coherent so Explore still encourages compare-and-verify behavior instead of one-click blind installs.

## Install and home heuristics

- Install decision heuristics live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/installDecisionUtils.ts`. If you change install guidance, keep the recommendation cards and checklist logic aligned so the modal does not suggest an action that contradicts its own signals.
- The install modal now supports a disabled-first install path through the existing install IPC. If you change the install request payload shape, make sure the not-installed and update flows still preserve the optional `disabled` flag.
- Local home insights live in `src/vscode-windhawk-ui/apps/vscode-windhawk-ui/src/app/panel/localModsInsights.ts`. Update the paired tests when you retune what counts as "needs attention", "needs compile", or "logging enabled" so quick-focus chips and overview counts remain intentional.
