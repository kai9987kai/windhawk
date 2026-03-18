// ==WindhawkMod==
// @id              new-ai-mod
// @name            Your AI-Assisted Mod
// @description     Starter template for AI-assisted Windhawk development
// @version         0.1
// @author          You
// @github          https://github.com/your-name
// @twitter         https://twitter.com/your-name
// @homepage        https://your-project.example.com/
// @include         mspaint.exe
// @compilerOptions -lcomdlg32
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your AI-Assisted Mod
Use this starter when you want an AI assistant to help with ideation,
refactoring, documentation, or test planning while you stay in control of the
actual hook targets and safety decisions.

## AI collaboration brief
Before asking an AI tool for help, give it:
- The target process and why it is the right process.
- The user-visible behavior you want to change.
- The Windows APIs, exports, or messages you suspect are involved.
- Safety constraints, fallback behavior, and any settings you want exposed.
- The exact errors, logs, or manual test results you already observed.

## Structure brief
Tell the AI to preserve the current section layout:
- `ModSettings` for user-configurable values.
- `RuntimeState` for runtime-only state.
- Hook callbacks for the behavior you are changing.
- Helpers such as settings loading and hook installation.
- Lifecycle callbacks for init, uninit, and settings changes.

## Suggested prompt
Paste something like this into your AI assistant:

```text
Help me write a Windhawk mod in C++.
Target process: mspaint.exe
Goal: Force Paint to use one color and optionally block file opening.
Constraints:
- Keep the metadata, readme, and settings blocks valid for Windhawk.
- Preserve the section layout for settings, runtime state, hook callbacks,
  helpers, and lifecycle callbacks.
- Explain why each hook target is appropriate.
- Minimize risk to unrelated behavior.
- Provide manual test steps and edge cases.
Output:
- Updated source code
- A brief explanation of each hook
- A checklist of what I still need to verify myself
```

## Human verification checklist
- Confirm that the target process is correct.
- Confirm that each hook target exists and is called in the scenario you care
  about.
- Compile and test the mod with logging enabled before widening its scope.
- Review any AI-generated code for crashes, blocking calls, or unsafe pointer
  usage.
- Document the expected behavior and recovery path if the mod fails.

## Manual test plan
- Compile the mod with the button on the left or with Ctrl+B.
- Run Microsoft Paint from the Start menu or by launching `mspaint.exe`.
- Draw something and confirm that the orange color is always used.
- Try opening a file and confirm that it is blocked when the setting is
  enabled.

## References
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
# When asking AI for settings help, ask it to keep names and descriptions short,
# explain defaults, and avoid breaking backward compatibility.
- color:
  - red: 255
  - green: 127
  - blue: 39
  $name: Custom color
  $description: This color will be used regardless of the selected color.
- blockOpen: true
  $name: Block opening files
  $description: When enabled, opening files in Paint is not allowed.
*/
// ==/WindhawkModSettings==

// The source code of the mod starts here. This sample was inspired by the
// article "X64 Function Hooking by Example" by Kyle Halladay:
// https://kylehalladay.com/blog/2020/11/13/Hooking-By-Example.html
//
// If you ask AI to extend this file, require it to explain:
// - why a hook target is correct
// - what happens when the target API fails
// - how to test the change without affecting unrelated workflows

#include <gdiplus.h>

using namespace Gdiplus;

namespace {

struct ModSettings {
    BYTE red;
    BYTE green;
    BYTE blue;
    bool blockOpen;
} settings;

struct RuntimeState {
    HMODULE gdiPlusModule;
} runtimeState;

using GdipSetSolidFillColor_t = decltype(&DllExports::GdipSetSolidFillColor);
GdipSetSolidFillColor_t GdipSetSolidFillColor_Original;

using GetOpenFileNameW_t = decltype(&GetOpenFileNameW);
GetOpenFileNameW_t GetOpenFileNameW_Original;

GpStatus WINAPI GdipSetSolidFillColor_Hook(GpSolidFill* brush, ARGB color) {
    Wh_Log(L"GdipSetSolidFillColor_Hook: color=%08X", color);

    if (Color(color).GetAlpha() == 255) {
        color = Color::MakeARGB(255, settings.red, settings.green,
                                settings.blue);
    }

    return GdipSetSolidFillColor_Original(brush, color);
}

BOOL WINAPI GetOpenFileNameW_Hook(LPOPENFILENAMEW params) {
    Wh_Log(L"GetOpenFileNameW_Hook");

    if (settings.blockOpen) {
        MessageBoxW(GetActiveWindow(), L"Opening files is forbidden",
                    L"AI-Assisted Starter", MB_OK);
        return FALSE;
    }

    return GetOpenFileNameW_Original(params);
}

void LoadSettings() {
    settings.red = Wh_GetIntSetting(L"color.red");
    settings.green = Wh_GetIntSetting(L"color.green");
    settings.blue = Wh_GetIntSetting(L"color.blue");
    settings.blockOpen = Wh_GetIntSetting(L"blockOpen");
}

BOOL InstallHooks() {
    runtimeState.gdiPlusModule = LoadLibraryW(L"gdiplus.dll");
    if (!runtimeState.gdiPlusModule) {
        Wh_Log(L"Failed to load gdiplus.dll");
        return FALSE;
    }

    auto GdipSetSolidFillColor =
        reinterpret_cast<GdipSetSolidFillColor_t>(GetProcAddress(
            runtimeState.gdiPlusModule, "GdipSetSolidFillColor"));
    if (!GdipSetSolidFillColor) {
        Wh_Log(L"Failed to resolve GdipSetSolidFillColor");
        return FALSE;
    }

    Wh_SetFunctionHook((void*)GdipSetSolidFillColor,
                       (void*)GdipSetSolidFillColor_Hook,
                       (void**)&GdipSetSolidFillColor_Original);

    Wh_SetFunctionHook((void*)GetOpenFileNameW, (void*)GetOpenFileNameW_Hook,
                       (void**)&GetOpenFileNameW_Original);

    return TRUE;
}

}  // namespace

BOOL Wh_ModInit() {
    Wh_Log(L"Init");

    LoadSettings();

    return InstallHooks();
}

void Wh_ModUninit() {
    Wh_Log(L"Uninit");
}

void Wh_ModSettingsChanged() {
    Wh_Log(L"SettingsChanged");

    LoadSettings();
}
