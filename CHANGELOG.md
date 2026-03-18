# Changelog

## 2026-03-18

### Updated

* The README and contributor guide to document the exact portable packaging command, both emitted artifacts (`artifacts/windhawk-custom-portable-installer.exe` and `artifacts/portable-build/windhawk-custom-portable.zip`), the `-SkipBuild` repack path, and the Visual Studio developer-shell fallback for native builds.
* The New Mod Studio documentation to cover code-first and visual authoring modes, language-aware starter filtering, workflow bundles, CLI playbooks, and kickoff packets.
* The README and contributor guide to document the verified two-step release flow (`vcvars64.bat` + `build.bat Release`, then `build_custom_portable.ps1`) and the new recent-session relaunch behavior in New Mod Studio.

### Verified

* `build.bat Release` from `src\windhawk` after priming a Visual Studio developer shell.
* `powershell -ExecutionPolicy Bypass -File artifacts\installer-build\build_custom_portable.ps1`

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
* A structured core mod starter and a structure-planning prompt so new mods can begin from a cleaner settings/runtime/helpers/hooks layout instead of one growing source block.
* Additional mod creation templates for Explorer shell tweaks, window-behavior mods, and settings-first scaffolding.
* A Chromium browser starter so Chrome-related mods can be created directly from the mod studio with a compile-safe browser UI scaffold.
* Optional `.wh.py` Python mod authoring with a bundled `windhawk_py` helper module, generated `.wh.cpp` compatibility output, and mouse/keyboard automation helpers.
* An editor cockpit redesign with live mod metadata, a one-click recommended compile action, an evidence board, a verification pack, a dynamic iteration plan, safer compile guidance, and copyable AI helper prompts for scaffold, review, scope explanation, test planning, docs, and release notes.
* A Windows toolkit in the About page with OS/session diagnostics, Windows settings shortcuts, and Explorer actions for runtime paths.
* Strategy cards and a disabled-first install path in the install modal, backed by focused heuristics for scope, freshness, and reviewability.
* Local home quick-focus chips for local drafts, compile-needed mods, logging-enabled mods, and update-ready mods.
* A scrollable editor cockpit shell with a pinned exit action so long mod sessions no longer hide the last controls off-screen.
* Visible compile mode cards in the editor cockpit, replacing the hidden-first compile choice with explicit current and recommended states.
* A contextual Windows bridge in the editor cockpit that infers shell surfaces from target processes and opens the matching Windows settings pages directly.
* More Windows quick actions in the About page for Start, Notifications, Multitasking, and Colors.
* More Windows customization routes in Explore for Context menu, Desktop, Alt+Tab, Virtual desktops, and Widgets, plus new missions for context-menu cleanup, desktop polish, and app switching.
* More Windows quick actions in the About page for Background, Themes, Lock screen, and Clipboard.
* A new Performance and AI settings section with balanced, responsive, and efficient workspace profiles, plus an NPU-aware AI acceleration preference.
* Runtime-based local recommendation logic that can apply a suggested profile from the active machine's memory, NPU, and runtime-health signals.
* Runtime diagnostics that now include total memory and detected NPU hardware for About and Settings.
* More complex workflow settings for startup routing, Explore default sorting, editor assistance level, and Windows quick-action density, wired into Settings, About, Explore, and the editor cockpit.
* New research-driven editor features: prompt-less AI explainers for APIs, Windows terms, and usage examples; a challenge board with counterquestions; a best-practice audit prompt; and a validation-feedback compile-recovery prompt.
* A curated `force-process-accelerators` repository mod surfaced as a featured available install in the default online catalog.

### Updated

* The English locale with new mission-workbench, verification-pack, recommended-compile, and AI prompt-deck strings.
* Contributor guidance for AI-assisted mod authoring and the new editor cockpit workflow.
* The VS Code extension/editor bridge so compile, enable, and logging actions refresh the sidebar with current mod metadata.
* Runtime diagnostics so the extension exposes Windows version/session details and reusable shell actions to the webview.
* The README with the latest UI improvements and additional research references for code understanding, AI trust, and question-driven debugging.
* The installed-mods overview so "needs attention" also surfaces debug-logging and compile-needed states, not just updates.
* The editor workflow text so Shneiderman's overview-first guidance and the Whyline-style "what should I inspect next?" loop now show up directly in the sidebar rather than only in documentation.
* Local UI preferences so performance profile and AI acceleration settings persist with the rest of the webview workspace state.
* The README and contributor guidance to document the broader local workflow settings surface and the files that now depend on it.
* The mod studio copy and docs to include Chromium/Chrome-focused authoring support and a browser UI prompt pack.
* The mod studio flow so Python mode only offers starters that have real `.wh.py` implementations, avoiding template mismatches.
* Local authoring preferences so stored language and source-extension choices stay aligned even if older or malformed state is loaded.
* The research notes in the README to include newer work on AI challenge behavior, industrial code-review guidance, and validation-feedback repair loops.

### Verified

* `npx jest apps/vscode-windhawk-ui/src/app/utils.spec.ts apps/vscode-windhawk-ui/src/app/panel/changelogUtils.spec.ts apps/vscode-windhawk-ui/src/app/panel/modDiscovery.spec.ts apps/vscode-windhawk-ui/src/app/panel/aiModStudio.spec.ts apps/vscode-windhawk-ui/src/app/sidebar/editorModeUtils.spec.ts --runInBand`
* `npx tsc -p apps/vscode-windhawk-ui/tsconfig.app.json --noEmit`
* `npx tsc -p . --noEmit`
* `npx nx build vscode-windhawk-ui --configuration=development`
