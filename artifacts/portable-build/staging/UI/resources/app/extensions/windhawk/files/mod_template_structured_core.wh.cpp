// ==WindhawkMod==
// @id              new-structured-mod
// @name            Your Structured Mod
// @description     Architecture-first starter for a cleanly organized Windhawk mod
// @version         0.1
// @author          You
// @github          https://github.com/your-name
// @twitter         https://twitter.com/your-name
// @homepage        https://your-project.example.com/
// @include         notepad.exe
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your Structured Mod
Use this starter when you want the mod's code layout to stay readable as the
idea grows. The template intentionally separates configuration, runtime state,
helpers, planned hook setup, and lifecycle callbacks.

## Suggested build order
1. Confirm the target process is correct.
2. Run the dry-run template with logging enabled.
3. Inspect the current window/process state in the logs.
4. Replace `InitializePlannedHooks` with the smallest useful hook setup.
5. Only then widen scope or add more settings.

## Section guide
- `ModSettings`: values loaded from the Windhawk settings block.
- `RuntimeState`: state derived while the mod is running.
- Helpers: reusable diagnostics and plan-summary functions.
- Hook setup: the place to install your real hooks once the target is proven.
- Lifecycle callbacks: `Wh_ModInit`, `Wh_ModUninit`, and
  `Wh_ModSettingsChanged`.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- feature:
  - enabled: false
    $name: Enable planned feature
    $description: Keep this off until the first hook path is implemented and verified.
  - level: 1
    $name: Feature level
    $description: Use this as an example of how to scale behavior gradually.
- workflow:
  - dryRun: true
    $name: Dry-run mode
    $description: When enabled, initialization only logs scope information and installs no hooks.
  - verboseLogs: true
    $name: Verbose logs
    $description: Log the current scope and foreground window summary during iteration.
*/
// ==/WindhawkModSettings==

#include <windows.h>

namespace {

struct ModSettings {
    bool featureEnabled;
    int featureLevel;
    bool dryRun;
    bool verboseLogs;
} settings;

struct RuntimeState {
    DWORD initTickCount;
    HWND lastForegroundWindow;
} runtimeState;

void LoadSettings() {
    settings.featureEnabled = Wh_GetIntSetting(L"feature.enabled");
    settings.featureLevel = Wh_GetIntSetting(L"feature.level");
    settings.dryRun = Wh_GetIntSetting(L"workflow.dryRun");
    settings.verboseLogs = Wh_GetIntSetting(L"workflow.verboseLogs");
}

void LogCurrentPlan() {
    Wh_Log(
        L"Plan summary: featureEnabled=%d, featureLevel=%d, dryRun=%d, "
        L"verboseLogs=%d",
        settings.featureEnabled,
        settings.featureLevel,
        settings.dryRun,
        settings.verboseLogs);
}

void CaptureForegroundWindowSummary() {
    runtimeState.lastForegroundWindow = GetForegroundWindow();

    if (!settings.verboseLogs) {
        return;
    }

    wchar_t title[160] = {};
    if (runtimeState.lastForegroundWindow) {
        GetWindowTextW(runtimeState.lastForegroundWindow, title,
                       ARRAYSIZE(title));
    }

    Wh_Log(L"Foreground window snapshot: hwnd=%p, title=%ls",
           runtimeState.lastForegroundWindow,
           title[0] ? title : L"<untitled>");
}

BOOL InitializePlannedHooks() {
    if (settings.dryRun) {
        Wh_Log(L"Dry-run mode is enabled, no hooks will be installed yet");
        return TRUE;
    }

    Wh_Log(L"Replace InitializePlannedHooks with your real hook setup");
    return TRUE;
}

}  // namespace

BOOL Wh_ModInit() {
    runtimeState.initTickCount = GetTickCount();

    LoadSettings();
    LogCurrentPlan();
    CaptureForegroundWindowSummary();

    return InitializePlannedHooks();
}

void Wh_ModUninit() {
    Wh_Log(L"Structured starter uninitialized after %lu ms",
           GetTickCount() - runtimeState.initTickCount);
}

void Wh_ModSettingsChanged() {
    LoadSettings();
    LogCurrentPlan();
    CaptureForegroundWindowSummary();
}
