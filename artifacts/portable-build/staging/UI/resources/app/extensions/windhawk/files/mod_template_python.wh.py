from windhawk_py import (
    Mod,
    bool_setting,
    int_setting,
    keyboard_helpers,
    mouse_helpers,
    string_setting,
)

mod = Mod(
    id="python-automation",
    name="Python Automation Starter",
    description="Author a Windhawk mod in Python and render it to .wh.cpp.",
    version="0.1.0",
    author="You",
    include=["notepad.exe"],
    compiler_options="-luser32",
    license="MIT",
)

mod.readme = """
# Python Automation Starter
This starter uses `windhawk_py` to define metadata, settings, and reusable
helper code from Python while still compiling through the normal Windhawk C++
toolchain.

## What is included
- A `.wh.py` authoring file
- Generated `.wh.cpp` compatibility output at compile time
- Mouse and keyboard automation helpers backed by `SendInput`

## Suggested next steps
1. Replace the sample process target if you are not testing in Notepad.
2. Move the automation call behind a real hook or trigger once you identify the
   right Win32 surface.
3. Keep the generated `.wh.cpp` under review if you share or ship the mod.
"""

mod.settings = [
    bool_setting(
        "enableMouseClick",
        True,
        name="Enable mouse click",
        description="Run the sample mouse click helper when the mod initializes.",
    ),
    int_setting(
        "clickX",
        240,
        name="Click X",
        description="Screen-space X coordinate for the sample mouse move.",
    ),
    int_setting(
        "clickY",
        180,
        name="Click Y",
        description="Screen-space Y coordinate for the sample mouse move.",
    ),
    bool_setting(
        "enableKeyboardTap",
        False,
        name="Enable keyboard shortcut",
        description="Send a sample Ctrl+Shift+L chord when the mod initializes.",
    ),
    string_setting(
        "statusMessage",
        "Python authoring ready",
        name="Status message",
        description="Text written to the Windhawk log when the mod initializes.",
    ),
]

mod.helpers = mouse_helpers() + "\n\n" + keyboard_helpers()

mod.body = r"""
void RunAutomationSample() {
    if (settings.enableMouseClick) {
        MouseAutomation::MoveAbsolute(settings.clickX, settings.clickY);
        MouseAutomation::LeftClick();
    }

    if (settings.enableKeyboardTap) {
        KeyboardAutomation::CtrlShiftTap('L');
    }
}

BOOL InstallHooks() {
    RunAutomationSample();
    return TRUE;
}
"""

mod.init_code = r"""
const auto statusMessage = Wh_GetStringSetting(L"statusMessage");
Wh_Log(L"%ls", statusMessage);
Wh_FreeStringSetting(statusMessage);
"""

mod.settings_changed_code = "RunAutomationSample();"
