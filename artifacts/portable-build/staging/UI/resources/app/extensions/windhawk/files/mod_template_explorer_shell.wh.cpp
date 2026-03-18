// ==WindhawkMod==
// @id              new-explorer-shell-mod
// @name            Your Explorer Shell Mod
// @description     Starter template for taskbar, tray, Start menu, and shell experiments
// @version         0.1
// @author          You
// @github          https://github.com/your-name
// @twitter         https://twitter.com/your-name
// @homepage        https://your-project.example.com/
// @include         explorer.exe
// @include         ShellExperienceHost.exe
// @include         StartMenuExperienceHost.exe
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your Explorer Shell Mod
Use this starter when your idea lives in the Windows shell: taskbar buttons,
tray behavior, Start menu flows, notification surfaces, or Explorer-hosted UI.

## Good first questions
- Which process owns the exact surface you want to change?
- Is the behavior in Explorer itself, or in a companion shell host?
- What is the smallest window class, export, COM call, or message you can
  observe before hooking anything?

## Suggested first verification loop
- Compile with logging enabled.
- Open the taskbar, tray, Start menu, or notification surface you care about.
- Watch the log to confirm the right process is loaded.
- Only then start tracing candidate APIs, window classes, or messages.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- enableDetailedLogs: true
  $name: Enable detailed logs
  $description: Log the shell surface summary during initialization and settings reloads.
- taskbarOnly: false
  $name: Focus on taskbar only
  $description: Use this flag when you want to keep your first iteration scoped to taskbar behavior.
*/
// ==/WindhawkModSettings==

#include <windows.h>

struct {
    bool enableDetailedLogs;
    bool taskbarOnly;
} settings;

PCWSTR GetScopeSummary() {
    return settings.taskbarOnly
        ? L"Taskbar-first scope"
        : L"Explorer, Start, and shell host scope";
}

void LoadSettings() {
    settings.enableDetailedLogs = Wh_GetIntSetting(L"enableDetailedLogs");
    settings.taskbarOnly = Wh_GetIntSetting(L"taskbarOnly");
}

BOOL Wh_ModInit() {
    LoadSettings();

    Wh_Log(L"Explorer shell starter initialized");
    if (settings.enableDetailedLogs) {
        Wh_Log(L"Scope summary: %ls", GetScopeSummary());
        Wh_Log(L"Next step: inspect the exact shell surface before adding hooks");
    }

    return TRUE;
}

void Wh_ModUninit() {
    Wh_Log(L"Explorer shell starter uninitialized");
}

void Wh_ModSettingsChanged() {
    LoadSettings();

    if (settings.enableDetailedLogs) {
        Wh_Log(L"Settings changed, scope summary: %ls", GetScopeSummary());
    }
}
