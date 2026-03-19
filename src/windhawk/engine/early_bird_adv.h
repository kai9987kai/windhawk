#pragma once

#include <windows.h>

// Advanced Early Bird APC Injection (2025 technique)
//
// Like classic Early Bird, this creates a suspended process, maps
// the payload, and queues an APC to the main thread.
// But EDRs spot the classic pattern: CreateProcess(Suspended) -> 
// VirtualAllocEx -> WriteProcessMemory -> QueueUserAPC -> ResumeThread.
//
// This advanced variant breaks the correlation by:
// 1. Using undocumented Nt APIs instead of kernel32 wrappers.
// 2. Queuing the APC via a separate stealthy thread within the injector.
// 3. Spoofing the APC queuing source.
// 4. Overwriting the entry point temporarily instead of pure APC if needed.

namespace EarlyBirdAdv {

// Execute the payload in a new suspended process using advanced Early Bird concepts.
// The payload must be position-independent shellcode.
bool InjectAdvancedEarlyBird(const wchar_t* targetExePath, const void* pPayload, size_t payloadSize);

} // namespace EarlyBirdAdv
