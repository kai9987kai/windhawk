// ==WindhawkMod==
// @id              new-window-behavior-mod
// @name            Your Window Behavior Mod
// @description     Starter template for app window sizing, placement, style, and caption behavior
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
# Your Window Behavior Mod
Use this starter for per-app behavior such as caption tweaks, visibility rules,
window styles, minimum sizes, snap behavior, or placement changes.

## Typical APIs to inspect
- `ShowWindow`
- `SetWindowPos`
- `CreateWindowExW`
- `SetWindowLongPtrW`
- `DwmSetWindowAttribute`

## Safe first iteration
- Keep the scope on one application first.
- Log the foreground window class and title before changing behavior.
- Avoid widening to `*` until you know exactly which windows should be affected.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- onlyVisibleWindows: true
  $name: Only affect visible windows
  $description: Use this to keep the first implementation away from hidden helper windows.
- writeWindowClassToLog: true
  $name: Log foreground window class
  $description: Log the current foreground window class during initialization and reloads.
*/
// ==/WindhawkModSettings==

#include <windows.h>

struct {
    bool onlyVisibleWindows;
    bool writeWindowClassToLog;
} settings;

bool ShouldAffectWindow(HWND hwnd) {
    if (!hwnd) {
        return false;
    }

    if (settings.onlyVisibleWindows && !IsWindowVisible(hwnd)) {
        return false;
    }

    return true;
}

void LogForegroundWindowClass() {
    if (!settings.writeWindowClassToLog) {
        return;
    }

    HWND hwnd = GetForegroundWindow();
    if (!ShouldAffectWindow(hwnd)) {
        Wh_Log(L"No visible foreground window matched the current scope");
        return;
    }

    WCHAR className[256] = {};
    GetClassNameW(hwnd, className, ARRAYSIZE(className));
    Wh_Log(L"Foreground window class: %ls", className);
}

void LoadSettings() {
    settings.onlyVisibleWindows = Wh_GetIntSetting(L"onlyVisibleWindows");
    settings.writeWindowClassToLog = Wh_GetIntSetting(L"writeWindowClassToLog");
}

BOOL Wh_ModInit() {
    LoadSettings();

    Wh_Log(L"Window behavior starter initialized");
    LogForegroundWindowClass();
    Wh_Log(L"Next step: choose the one API or message that owns the behavior you want");

    return TRUE;
}

void Wh_ModUninit() {
    Wh_Log(L"Window behavior starter uninitialized");
}

void Wh_ModSettingsChanged() {
    LoadSettings();
    LogForegroundWindowClass();
}
