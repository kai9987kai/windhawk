#pragma once

#include <windows.h>

// PoolParty Injection (2024/2025 technique)
//
// Abuses the Windows user-mode thread pool worker factories to execute
// shellcode or injected DLLs without creating new threads or using standard APCs.
// This achieves extremely high success rates against EDRs since the thread
// pool infrastructure is a legitimate Windows OS mechanism.
//
// It locates an active TpWorkerFactory, injects the payload, and then
// hijacks an upcoming worker thread to execute the payload.

namespace PoolParty {

// Inject payload into the target process by hijacking a thread pool worker.
// Returns true on success, false otherwise.
bool InjectViaWorkerFactory(HANDLE hProcess, const void* pPayload, size_t payloadSize);

// Discover handles to worker factories in the target process.
// Uses NtQuerySystemInformation to enumerate handles.
HANDLE FindWorkerFactoryHandle(HANDLE hProcess, DWORD processId);

} // namespace PoolParty
