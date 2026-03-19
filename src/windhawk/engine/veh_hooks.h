#pragma once

#include <windows.h>
#include <vector>

// VEH Hardware Breakpoint Hooks (2025/2026 technique)
//
// Most EDRs detect hooks by scanning for modified memory (JMP instructions
// in function prologues) or modified Import/Export Address Tables.
//
// This module uses CPU Hardware Debug Registers (DR0-DR3) to break on execution
// (HWBP) at specific memory addresses, without modifying the memory itself.
// A Vectored Exception Handler (VEH) catches the EXCEPTION_SINGLE_STEP event,
// checks if the instruction pointer matches our target, and then modifies
// registers (like arguments or the return value/instruction pointer) to bypass
// the monitored API, effectively hooking the function with zero memory footprint.
//
// Ideal for evading advanced AMSI, ETW, or security policy checks.

namespace VehHooks {

// Function signature for a VEH hook callback.
// Returning true indicates the hook handled the exception.
typedef bool (*VehHookCallback)(PCONTEXT pContext);

// Install a hardware breakpoint hook on an address.
// Up to 4 hooks can be active simultaneously per thread (DR0-DR3).
bool InstallHardwareHook(PVOID targetAddress, VehHookCallback callback);

// Uninstall a specific hardware hook.
bool UninstallHardwareHook(PVOID targetAddress);

// Completely remove the VEH handler and all hooks.
bool UninstallAll();

// Example Callback: Bypass AMSI by faking AmsiScanBuffer
bool Callback_BypassAmsiScanBuffer(PCONTEXT pContext);

} // namespace VehHooks
