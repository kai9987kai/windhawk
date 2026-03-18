// ==WindhawkMod==
// @id              new-chromium-browser-mod
// @name            Your Chromium Browser Mod
// @description     Starter template for Chrome-family window chrome, tab strip, and browser UI experiments
// @version         0.1
// @author          You
// @github          https://github.com/your-name
// @twitter         https://twitter.com/your-name
// @homepage        https://your-project.example.com/
// @include         chrome.exe
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your Chromium Browser Mod
Use this starter when the target is Chrome or another Chromium-family browser
surface such as the tab strip, title bar, browser commands, or window-level UI.

## Good first questions
- Is the behavior owned by the browser chrome, not by page content?
- Which browser window class, command, message, or accelerator is closest to the
  user-visible change you want?
- What adjacent browser flow should remain unchanged if the hook target is right?

## Safe first iteration
- Keep the process scope on `chrome.exe` first.
- Compile with logging enabled for the first run.
- Open one browser window and confirm the foreground browser window details in
  the log before adding a hook.
- Only then widen to other Chromium-family executables if you have evidence the
  same surface is shared.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- logBrowserProcessPath: true
  $name: Log browser process path
  $description: Log the current browser executable path during initialization and settings reloads.
- logForegroundWindow: true
  $name: Log foreground browser window
  $description: Log the foreground window class and title when it belongs to the current browser process.
*/
// ==/WindhawkModSettings==

#include <windows.h>

struct {
    bool logBrowserProcessPath;
    bool logForegroundWindow;
} settings;

void LoadSettings() {
    settings.logBrowserProcessPath = Wh_GetIntSetting(L"logBrowserProcessPath");
    settings.logForegroundWindow = Wh_GetIntSetting(L"logForegroundWindow");
}

void LogBrowserProcessPath() {
    if (!settings.logBrowserProcessPath) {
        return;
    }

    WCHAR processPath[MAX_PATH] = {};
    GetModuleFileNameW(nullptr, processPath, ARRAYSIZE(processPath));
    Wh_Log(L"Chromium browser process path: %ls", processPath);
}

void LogForegroundBrowserWindow() {
    if (!settings.logForegroundWindow) {
        return;
    }

    HWND hwnd = GetForegroundWindow();
    if (!hwnd) {
        Wh_Log(L"No foreground browser window was found");
        return;
    }

    DWORD foregroundProcessId = 0;
    GetWindowThreadProcessId(hwnd, &foregroundProcessId);
    if (foregroundProcessId != GetCurrentProcessId()) {
        Wh_Log(L"The foreground window belongs to another process; keep the first hook scoped");
        return;
    }

    WCHAR className[256] = {};
    WCHAR windowTitle[512] = {};
    GetClassNameW(hwnd, className, ARRAYSIZE(className));
    GetWindowTextW(hwnd, windowTitle, ARRAYSIZE(windowTitle));

    Wh_Log(L"Foreground browser window class: %ls", className);
    Wh_Log(L"Foreground browser window title: %ls", windowTitle);
}

BOOL Wh_ModInit() {
    LoadSettings();

    Wh_Log(L"Chromium browser starter initialized");
    LogBrowserProcessPath();
    LogForegroundBrowserWindow();
    Wh_Log(L"Next step: inspect the exact browser UI surface before choosing a hook");

    return TRUE;
}

void Wh_ModUninit() {
    Wh_Log(L"Chromium browser starter uninitialized");
}

void Wh_ModSettingsChanged() {
    LoadSettings();
    LogBrowserProcessPath();
    LogForegroundBrowserWindow();
}
