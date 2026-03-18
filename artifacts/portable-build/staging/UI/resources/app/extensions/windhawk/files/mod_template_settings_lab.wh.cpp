// ==WindhawkMod==
// @id              new-settings-lab-mod
// @name            Your Settings-First Mod
// @description     Starter template for designing settings, defaults, and safe rollout before hook work
// @version         0.1
// @author          You
// @github          https://github.com/your-name
// @twitter         https://twitter.com/your-name
// @homepage        https://your-project.example.com/
// @include         mspaint.exe
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your Settings-First Mod
Use this starter when the hardest part is shaping the user-facing settings,
defaults, and rollout plan before you commit to specific hooks.

## Why start here
- You can lock down the config structure before adding risky code.
- It is easier to review names, defaults, and migration risks early.
- AI tools are less likely to break a mod when the settings contract is explicit.

## Recommended next step
- Finalize the settings shape.
- Add logging around how each setting changes the intended behavior.
- Only then begin tracing the APIs that should consume those settings.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
- feature:
  - enabled: true
  - intensity: 2
  $name: Feature controls
  $description: Use this group for the main feature flag and intensity tuning.
- rollout:
  - safeMode: true
  - verboseLogs: true
  $name: Rollout controls
  $description: Keep first-run safeguards and visibility toggles together.
*/
// ==/WindhawkModSettings==

#include <windows.h>

struct {
    bool featureEnabled;
    int featureIntensity;
    bool rolloutSafeMode;
    bool verboseLogs;
} settings;

void LoadSettings() {
    settings.featureEnabled = Wh_GetIntSetting(L"feature.enabled");
    settings.featureIntensity = Wh_GetIntSetting(L"feature.intensity");
    settings.rolloutSafeMode = Wh_GetIntSetting(L"rollout.safeMode");
    settings.verboseLogs = Wh_GetIntSetting(L"rollout.verboseLogs");
}

void LogSettingsSnapshot() {
    if (!settings.verboseLogs) {
        return;
    }

    Wh_Log(L"Settings snapshot: feature=%d intensity=%d safeMode=%d",
           settings.featureEnabled, settings.featureIntensity,
           settings.rolloutSafeMode);
}

BOOL Wh_ModInit() {
    LoadSettings();

    Wh_Log(L"Settings-first starter initialized");
    LogSettingsSnapshot();
    Wh_Log(L"Next step: bind each setting to one explicit behavior before adding hooks");

    return TRUE;
}

void Wh_ModUninit() {
    Wh_Log(L"Settings-first starter uninitialized");
}

void Wh_ModSettingsChanged() {
    LoadSettings();
    LogSettingsSnapshot();
}
