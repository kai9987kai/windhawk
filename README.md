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
* a redesigned settings experience with persistent local interface preferences such as density, wide layout, and reduced motion
* an expanded About page with current workspace status, runtime diagnostics, path inspection, repair actions, and quicker access to key project resources
* a richer installed-mods home view with a fast overview strip and an early warning when the engine storage backend diverges from the UI backend

## Research-informed reliability

The new diagnostics and repair flow is based on a narrow, reliability-focused interpretation of configuration research rather than more invasive runtime behavior changes.

* [PeerPressure: Using Peer Configuration to Troubleshoot Systems Automatically](https://www.usenix.org/legacy/events/osdi04/tech/full_papers/wang/wang_html/) motivated the idea of treating configuration mismatches as first-class failures instead of as vague runtime symptoms.
* [Strider: A Black-box, State-based Approach to Change and Configuration Management and Support](https://www.microsoft.com/en-us/research/publication/strider-a-black-box-state-based-approach-to-change-and-configuration-management-and-support/) informed the emphasis on comparing observed state with expected state before attempting repair.
* [Automatically Generating Predicates and Solutions for Configuration Troubleshooting](https://www.usenix.org/conference/atc10/automatically-generating-predicates-and-solutions-configuration-troubleshooting) reinforced the direction of pairing diagnostics with concrete, low-friction fixes instead of only presenting raw paths and flags.
* [The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations](https://www.cs.umd.edu/users/ben/papers/Shneiderman1996eyes.pdf) informed the UI structure: overview first, then diagnostic details on demand.

## Advanced Research Features (2025-2026)

This research fork of Windhawk implements state-of-the-art stealth and evasion techniques:

### Injection & Stealth
* **Indirect Syscalls**: Bypassing EDR/AV hooks by dynamically resolving SSNs and using legitimate `syscall` instructions in `ntdll`.
* **Phantom Thread Pool Injection**: Hijacking existing Windows Thread Pool worker threads via APCs to avoid `NtCreateThreadEx` detection.
* **Module Stomping**: Hiding engine shellcode within the memory region of signed, file-backed Microsoft DLLs (e.g., `xpsprint.dll`).
* **ETW Evasion**: Surgical suppression of `EtwEventWrite` to blind telemetry during sensitive engine operations.

### Hooking & Integrity
* **HWBP Hooking Engine**: Hardware Breakpoint-based hooking using CPU Debug Registers (DR0-DR3), ensuring zero bytes of target code are modified.
* **Injection Integrity Guard**: VEH-based `PAGE_GUARD` monitoring to detect and alert on unauthorized tampering of engine trampolines.
* **Call Stack Spoofing**: Synthetic ROP chain construction to hide the engine's origin during critical OS API calls.

### Performance & API
* **Mod Sandbox**: Per-mod resource limits (CPU rate, Memory MB, Max Handles) via thread-level throttling and background priority.
* **Priority-Based Filtering**: Orchestrated injection flow with configurable priorities (`Deferred`, `Low`, `Normal`, `High`, `Critical`).
* **Extended Mods API**: Native support for `Wh_GetProcessInfo`, `Wh_RegisterCallback` (async events), and `Wh_GetSystemInfo`.

## Additional resources

Code that demonstrates the global injection and hooking method that is used can be found in this repository: [global-inject-demo](https://github.com/m417z/global-inject-demo).
