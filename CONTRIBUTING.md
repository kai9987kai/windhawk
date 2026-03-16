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

## Notes

- The extension package includes native runtime dependencies. For lint and typecheck-only verification, `--ignore-scripts` avoids unnecessary rebuild steps.
- If you add new automated checks, prefer commands that can run headlessly in CI.
