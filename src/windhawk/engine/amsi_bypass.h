#pragma once

#include <windows.h>

// AMSI Bypass (2025 technique)
//
// Patches AmsiScanBuffer in amsi.dll to always return AMSI_RESULT_CLEAN,
// preventing the Antimalware Scan Interface from flagging injected scripts
// or shellcode. Uses memory patching with minimal VirtualProtect surface.
//
// This is critical for scenarios where Windhawk mods execute PowerShell
// or other scripting engines that integrate AMSI scanning.

namespace AmsiBypass {

// Patch AmsiScanBuffer to return AMSI_RESULT_CLEAN.
// Returns true if successfully patched or already patched.
bool PatchAmsiScanBuffer();

// Restore AmsiScanBuffer to its original state.
bool RestoreAmsiScanBuffer();

// Check if AMSI is currently bypassed.
bool IsPatched();

// Initialize — load amsi.dll if not already loaded, resolve function.
bool Initialize();

} // namespace AmsiBypass
