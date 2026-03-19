# Windhawk

<img width="1094" height="731" alt="image" src="https://github.com/user-attachments/assets/df55925e-7152-41a1-935e-2b7b0e3a0648" />
<img width="1088" height="731" alt="image" src="https://github.com/user-attachments/assets/204bb35f-ed1e-411c-8d71-b8fce94f27e8" />
<img width="1097" height="725" alt="image" src="https://github.com/user-attachments/assets/56a9ebca-43dc-47e9-9f7c-ce68781b2796" />

Windhawk aims to make it easier to customize Windows programs. For more details, see [the official website](https://windhawk.net/) and [the announcement](https://ramensoftware.com/windhawk).

This repository is used to [report issues](https://github.com/ramensoftware/windhawk/issues) and to [discuss Windhawk](https://github.com/ramensoftware/windhawk/discussions). For discussing Windhawk mods, refer to [the windhawk-mods repository](https://github.com/ramensoftware/windhawk-mods).

You're also welcome to join [the Windhawk Discord channel](https://discord.com/servers/windhawk-923944342991818753) for a live discussion.

## Technical details

High-level architecture:

<img width="1180" height="760" alt="image" src="https://github.com/user-attachments/assets/22aec2df-296a-4ca4-a957-9d2126bf1161" />

For technical details about the global injection and hooking method that is used, refer to the following blog post: [Implementing Global Injection and Hooking in Windows](https://m417z.com/Implementing-Global-Injection-and-Hooking-in-Windows/).

### Runtime storage contract

The most important runtime invariant for a working build is that the app, the embedded extension, and the engine all resolve to the same storage backend.

* `windhawk.ini` selects the install mode and points the app and extension to the active app-data root, engine folder, compiler folder, and UI runtime.
* `Engine\<version>\engine.ini` must resolve to the matching engine app-data root and, for installed mode, the matching registry subtree.
* If those files disagree, the UI can still show mods as installed while the injected engine loads a different storage location and the mods never activate.

The current fork now exposes runtime diagnostics in the About page, surfaces storage mismatches on the Home page, and includes a repair action that rewrites the engine config to match the active install.

## Source code

The Windhawk source code can be found in the `src` folder, which contains the following subfolders:

* `windhawk`: The code of the main `windhawk.exe` executable and the 32-bit and 64-bit `windhawk.dll` engine libraries.

* `vscode-windhawk`: The code of the VSCode extension that is responsible for UI operations such as installing mods and listing installed mods.

* `vscode-windhawk-ui`: The UI part of the VSCode extension.

A simple way to get started is by extracting the portable version of Windhawk with the official installer, building the part of Windhawk that you want to modify, and then replacing the corresponding files in the portable version with the newly built files.

## Development

Contributor setup, verified validation commands, and native build prerequisites are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

## Portable installer build

This fork includes a portable packaging flow that bundles the rebuilt native binaries, the VS Code extension, and the React webview into a custom installer.

Typical packaging flow:

1. Refresh the native Release binaries:

```powershell
$vsPath = & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" `
  -latest -products * -property installationPath
cmd /c "call `"$vsPath\VC\Auxiliary\Build\vcvars64.bat`" && cd /d src\windhawk && build.bat Release"
```

2. Run the packaging script from the repository root. It rebuilds the webview and extension by default before staging the portable payload:

```powershell
powershell -ExecutionPolicy Bypass -File artifacts\installer-build\build_custom_portable.ps1
```

If `src\windhawk\build.bat` doesn't detect the local Visual Studio installation automatically, a Visual Studio developer shell or the explicit `vswhere` + `vcvars64.bat` sequence above is the supported fallback.

The script produces `artifacts/windhawk-custom-portable-installer.exe` and `artifacts/portable-build/windhawk-custom-portable.zip`, refreshes the staged portable payload used by the installer stub, and expects a portable Windhawk baseline at `%LOCALAPPDATA%\Programs\Windhawk-Custom-Portable`. Use `-SkipBuild` only when you intentionally want to reuse the current webview and extension outputs.

## UI preview

The React webview lives in `src/vscode-windhawk-ui` and can be iterated on independently from the native C++ binaries.

Typical local preview workflow:

1. `cd src/vscode-windhawk-ui`
2. `npm install --ignore-scripts --no-package-lock`
3. `npx nx build vscode-windhawk-ui`
4. Serve `dist/apps/vscode-windhawk-ui` with a static file server, for example:
   `python -m http.server 4200 --directory dist/apps/vscode-windhawk-ui`

Then open `http://127.0.0.1:4200/`.

## Recent UI improvements

The webview UI now includes:

* smarter mod discovery with typo recovery, query broadening, and refinement suggestions
* a redesigned settings experience with persistent local workspace controls for density, startup page, Explore default sorting, editor assistance level, Windows quick-action density, wide layout, reduced motion, and performance tuning
* an expanded About page with current workspace status, runtime diagnostics, path inspection, repair actions, and quicker access to key project resources
* a richer installed-mods home view with a fast overview strip and an early warning when the engine storage backend diverges from the UI backend
* a research-informed install decision modal with scope/freshness/community signals and one-click review actions for details, source, and changelog tabs
* strategy-based install guidance with a disabled-first path for broad-scope or lower-reviewability mods, plus a short pre-install checklist derived from scope and freshness
* a shared changelog explorer with release-summary cards and inline filtering in both the About page and per-mod changelog views
* browse-mode insight chips in Explore so fresh, popular, and focused mods stand out even before typing a query
* guided Explore starting points that jump straight into fresh updates, community favorites, or focused areas such as Taskbar, Explorer, Start menu, and Audio
* research-backed Explore missions that turn common Windows goals into compare-and-verify flows, with copyable AI comparison briefs and an active mission workbench for top-candidate comparison
* broader Windows-surface discovery presets for notifications, window management, input, and appearance so the catalog is easier to navigate by the Windows area you want to change
* more Windows customization entry points in Explore for context menus, the desktop surface, Alt+Tab, virtual desktops, and widgets so it is easier to start from the part of Windows you actually want to change
* richer changelog tooling with release scoping, a latest-only toggle, and copy-to-clipboard support for the currently visible notes
* a new mod studio that promotes AI-assisted authoring with code-first and visual creation modes, language-aware C++ and Python starter filtering, a structured core starter, an AI-ready starter template, focused starters for Explorer shell work, Chromium/Chrome browser mods, window behavior mods, settings-first experiments, and optional `.wh.py` Python automation authoring that renders back to compatible `.wh.cpp`
* workflow bundles inside the mod studio with recommended launch paths, copyable kickoff packets, and CLI playbooks that combine the chosen starter, prompt packs, and verification checklist into one handoff
* persistent recent studio sessions in New Mod Studio so starters, visual presets, and workflow bundles can be relaunched with the same launch brief, packet, authoring language, and studio mode
* a redesigned editor cockpit with a real scroll shell, a pinned exit action, live mod metadata, visible compile mode cards, a one-click recommended compile action, an evidence board, a verification pack, a dynamic iteration plan, and copyable AI helper prompts for scope analysis, test planning, release notes, and review
* contextual Windows integration inside the editor cockpit, including inferred shell-surface tags and one-click deep links into the Windows settings pages that match the current mod's target processes
* newer research-driven editor innovations including prompt-less AI explainers for APIs, Windows terms, and usage examples, a visible challenge board that pushes the draft with counterquestions instead of agreement, a best-practice audit prompt, and a validation-feedback recovery prompt for failed builds
* a Windows toolkit on the About page with live OS/session diagnostics, expanded quick links into key Windows settings surfaces such as Start, Notifications, Multitasking, Colors, Background, Themes, Lock screen, Clipboard, and one-click opening of Windhawk runtime paths in Explorer
* local home quick-focus chips for drafts, compile-needed mods, logging-enabled mods, and pending updates so maintenance work is easier to batch
* a new Performance and AI settings section with runtime-based profile recommendations, NPU-aware acceleration preferences, and coordinated local UI presets for balanced, responsive, or efficient workspaces
* richer runtime diagnostics that now surface system memory and detected NPU hardware so local recommendations and Windows troubleshooting are grounded in the active machine
* a curated `force-process-accelerators` repository mod surfaced as a featured available install so process CPU/GPU/NPU preference tuning is easier to discover from the default catalog

## Research-informed UX improvements

These interaction changes are intentionally grounded in a small set of papers that map well to Windhawk's mod-install and release-review workflows.

* [Crying Wolf: An Empirical Study of SSL Warning Effectiveness](https://www.usenix.org/conference/usenixsecurity09/technical-sessions/presentation/crying-wolf-empirical-study-ssl) motivated a more concrete install warning with supporting context and clear review paths instead of a single generic caution block.
* [An Empirical Study of Release Note Production and Usage in Practice](https://www.microsoft.com/en-us/research/publication/an-empirical-study-of-release-note-production-and-usage-in-practice/) informed the release-summary cards and searchable changelog view so the most actionable updates are visible before reading the full Markdown stream.
* [The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations](https://www.cs.umd.edu/users/ben/papers/Shneiderman1996eyes.pdf) continues to inform the "overview first, zoom and filter, then details on demand" structure used across Explore, changelog, and the editor cockpit's visible mode cards and status surfaces.
* [Using an LLM to Help With Code Understanding](https://research.google/pubs/using-an-llm-to-help-with-code-understanding/) pushed the editor cockpit toward prompt-light, in-IDE requests such as scope explanation, API understanding, and test-plan generation instead of one generic AI action.
* [Identifying the Factors that Influence Trust in AI Code Completion](https://research.google/pubs/identifying-the-factors-that-influence-trust-in-ai-code-completion/) motivated the evidence board, visible compile mode states, and safer compile recommendations so AI assistance is paired with explicit trust signals and verification steps.
* [Source-level Debugging with the Whyline](https://faculty.washington.edu/ajko/papers/Ko2008SourceLevelDebugging.pdf) informed the new mission and editor flows that foreground "why this candidate?", "what Windows surface should I check?", and "what should I verify next?" instead of forcing users to build those questions manually.
* [AI-assisted Assessment of Coding Practices in Industrial Code Review](https://research.google/pubs/ai-assisted-assessment-of-coding-practices-in-industrial-code-review/) motivated the new best-practice audit prompt so contributors can ask for language-aware C++ and Windows review comments instead of only generic summaries.
* [AI Should Challenge, Not Obey](https://www.microsoft.com/en-us/research/publication/ai-should-challenge-not-obey/) directly informed the editor challenge board and counterexample-hunt prompts so the assistant can question assumptions rather than merely comply.
* [A Case Study of LLM for Automated Vulnerability Repair: Assessing Impact of Reasoning and Patch Validation Feedback](https://arxiv.org/abs/2405.15690) pushed the new compile-recovery prompt toward smaller, validation-driven iteration loops after build failures instead of broader speculative rewrites.

## Research-informed reliability

The new diagnostics and repair flow is based on a narrow, reliability-focused interpretation of configuration research rather than more invasive runtime behavior changes.

* [PeerPressure: Using Peer Configuration to Troubleshoot Systems Automatically](https://www.usenix.org/legacy/events/osdi04/tech/full_papers/wang/wang_html/) motivated the idea of treating configuration mismatches as first-class failures instead of as vague runtime symptoms.
* [Strider: A Black-box, State-based Approach to Change and Configuration Management and Support](https://www.microsoft.com/en-us/research/publication/strider-a-black-box-state-based-approach-to-change-and-configuration-management-and-support/) informed the emphasis on comparing observed state with expected state before attempting repair.
* [Automatically Generating Predicates and Solutions for Configuration Troubleshooting](https://www.usenix.org/conference/atc10/automatically-generating-predicates-and-solutions-configuration-troubleshooting) reinforced the direction of pairing diagnostics with concrete, low-friction fixes instead of only presenting raw paths and flags.
* [The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations](https://www.cs.umd.edu/users/ben/papers/Shneiderman1996eyes.pdf) informed the UI structure: overview first, then diagnostic details on demand.

## Advanced Research Features (2026 MASTER VERSION)

This version of Windhawk incorporates **31 state-of-the-art modules** for EDR bypass, stealth, and persistence.

### Phase 1: Engine Foundation & Fixes
* **Indirect Syscall Engine**: Dynamic SSN resolution and legitimization.
* **Module Stomp Core**: Shellcode hiding within signed DLLs.
* **ETW Stealth**: Multi-layered event suppression.
* **Stack Spoofing**: Synthetic stack construction for OS API calls.

### Phase 2: Fundamental Evasion
* **Mockingjay Injection**: Zero-allocation injection into pre-existing RWX sections.
* **Process Ghosting**: Executing payloads from deleted file handles.
* **File Mapping Injection**: Shared memory cross-process deployment.
* **Thread Execution Hijacking**: Native redirection for process control.
* **HookChain IAT Rewriting**: Stealthy hook orchestration.
* **PE Header Cloaking**: Surgical modification of PE headers to hide malicious signatures.

### Phase 3: Anti-Scanners & Defenses (2025)
* **AMSI Bypass Patcher**: Kernel-level memory patching for AMSI suppression.
* **Halo's/Tartarus' Gate**: Dynamic, direct syscall invocation bypassing EDR filters.
* **Proxy DLL Generator**: Advanced search-order hijacking for persistent injection.
* **Syscall Memory Encryptor**: On-demand encryption of sensitive syscall logic regions.
* **Ekko/Zilean Sleep Obfuscation**: RoP-based memory encryption during execution pauses.

### Phase 4: State-of-the-Art Evasion (2025/2026)
* **PoolParty Injection**: Complete abuse of Windows Worker Factories and Thread Pools.
* **Dirty Vanity Injection**: Process forking-based injection for maximum stealth.
* **Advanced Early Bird APC**: Modern variation of APC queueing for early-stage takeover.
* **VEH Hardware Breakpoint Hooks**: Non-invasive hooking using CPU Debug Registers (DR0-DR3).

### Phase 5: Kernel Blinding & Universal Unhooking
* **BYOVD EDR Blinder**: Exploits legitimate signed drivers to strip EDR kernel callbacks.
* **Phantom DLL Mapper**: Transacts payloads to disk via TxF and maps them as legitimate DLLs.
* **Perun's Fart Universal Unhooker**: Automates unhooking of all user-mode DLLs via fresh disk copies.

### Phase 6: Persistence & Privilege Escalation
* **UEFI NVRAM Persistence**: Injects payload entry points into motherboard EFI variables.
* **Token Stealer**: Automates NT AUTHORITY\SYSTEM token theft and impersonation.
* **Minifilter Rootkit Interface**: Direct kernel interface for hiding files and processes from the OS.

### Phase 7: AI Polymorphism & Hypervisor Stealth
* **AI Polymorphism Engine**: Meta-mutation of shellcode via local SLM/ONNX models for unique signatures.
* **Ring -1 Hypervisor VMM**: Boots a lightweight hypervisor underneath Windows to hide memory via EPT.
* **Data-Only Attack Builder**: Advanced ROP/JOP compiler that executes intent without executable memory.

## Additional resources

Code that demonstrates the global injection and hooking method that is used can be found in this repository: [global-inject-demo](https://github.com/m417z/global-inject-demo).
