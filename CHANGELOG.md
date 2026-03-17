# Changelog

## 2026-03-17

### Added

* A richer mod install decision modal with community, targeting, freshness, and reviewability signals, plus direct jumps to the details, source, and changelog tabs before install.
* A shared changelog viewer for Windhawk and mod release notes with release-summary cards and inline filtering.
* Browse-mode discovery insight chips in Explore so high-signal mods surface their strengths without requiring a search query.
* Guided Explore starting points that jump into fresh updates, community favorites, Taskbar, Explorer, Start menu, and Audio views.
* Research-backed Explore missions that turn common Windows goals into compare-and-verify flows, with copyable AI briefs and an active mission workbench for comparing top candidate mods.
* Additional Windows-surface discovery presets for Notifications, Window management, Input, and Appearance, backed by richer Windows shell search concepts.
* Changelog controls for release scoping, a latest-only toggle, and copy-to-clipboard support for the visible notes.
* A New Mod Studio flow with a real AI-ready starter template and AI prompt packs for ideation, scaffolding, review, and documentation.
* An editor cockpit redesign with live mod metadata, a one-click recommended compile action, an evidence board, a verification pack, a dynamic iteration plan, safer compile guidance, and copyable AI helper prompts for scaffold, review, scope explanation, test planning, docs, and release notes.
* A Windows toolkit in the About page with OS/session diagnostics, Windows settings shortcuts, and Explorer actions for runtime paths.
* Strategy cards and a disabled-first install path in the install modal, backed by focused heuristics for scope, freshness, and reviewability.
* Local home quick-focus chips for local drafts, compile-needed mods, logging-enabled mods, and update-ready mods.

### Updated

* The English locale with new mission-workbench, verification-pack, recommended-compile, and AI prompt-deck strings.
* Contributor guidance for AI-assisted mod authoring and the new editor cockpit workflow.
* The VS Code extension/editor bridge so compile, enable, and logging actions refresh the sidebar with current mod metadata.
* Runtime diagnostics so the extension exposes Windows version/session details and reusable shell actions to the webview.
* The README with the latest UI improvements and additional research references for code understanding, AI trust, and question-driven debugging.
* The installed-mods overview so "needs attention" also surfaces debug-logging and compile-needed states, not just updates.

### Verified

* `npx jest apps/vscode-windhawk-ui/src/app/utils.spec.ts apps/vscode-windhawk-ui/src/app/panel/changelogUtils.spec.ts apps/vscode-windhawk-ui/src/app/panel/modDiscovery.spec.ts apps/vscode-windhawk-ui/src/app/panel/aiModStudio.spec.ts apps/vscode-windhawk-ui/src/app/sidebar/editorModeUtils.spec.ts --runInBand`
* `npx tsc -p apps/vscode-windhawk-ui/tsconfig.app.json --noEmit`
* `npx tsc -p . --noEmit`
* `npx nx build vscode-windhawk-ui --configuration=development`
