// ==WindhawkMod==
// @id              new-mod
// @name            Your Awesome Mod
// @description     The best mod ever that does great things
// @version         0.1
// @author          You
// @github          https://github.com/nat
// @twitter         https://twitter.com/jack
// @homepage        https://your-personal-homepage.example.com/
// @include         mspaint.exe
// @compilerOptions -lcomdlg32
// @license         MIT
// ==/WindhawkMod==

// ==WindhawkModReadme==
/*
# Your Awesome Mod
This is a place for useful information about your mod. Use it to describe the
mod, explain why it's useful, and add any other relevant details. You can use
[Markdown](https://en.wikipedia.org/wiki/Markdown) to add links and
**formatting** to the readme.

This short sample customizes Microsoft Paint by forcing it to use just a single
color, and by blocking file opening. To see the mod in action:
- Compile the mod with the button on the left or with Ctrl+B.
- Run Microsoft Paint from the Start menu (type "Paint") or by running
  `mspaint.exe`.
- Draw something and notice that the orange color is always used, regardless of
  the color you pick.
- Try opening a file and notice that it's blocked.

# Structure guide
This sample is organized into settings, runtime state, hook callbacks, helper
functions, and lifecycle callbacks. Keep that shape as the mod grows so
`Wh_ModInit` stays focused on startup work instead of becoming one large block.

# Getting started
Check out the documentation
[here](https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod).
*/
// ==/WindhawkModReadme==

// ==WindhawkModSettings==
/*
# Here you can define settings, in YAML format, that the mod users will be able
# to configure. Metadata values such as $name and $description are optional.
# Check out the documentation for more information:
# https://github.com/ramensoftware/windhawk/wiki/Creating-a-new-mod#settings
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

// The source code of the mod starts here. This sample was inspired by the great
// article of Kyle Halladay, X64 Function Hooking by Example:
// https://kylehalladay.com/blog/2020/11/13/Hooking-By-Example.html
// If you're new to terms such as code injection and function hooking, the
// article is great to get started.

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
                    L"Surprise!", MB_OK);
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
