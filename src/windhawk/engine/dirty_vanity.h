#pragma once

#include <windows.h>
#include <string>

// Dirty Vanity Injection (2024 technique)
//
// Abuses Windows Process Forking (RtlCreateUserProcess / RtlCloneUserProcess)
// to separate memory allocation from execution.
// 
// Process A (injector) clones Process B. The EDR sees a standard clone.
// Process A then manually maps sections into the newly cloned Process B,
// and redirects Process B's execution flow. This bypasses behavioral monitors
// that track WriteProcessMemory + CreateRemoteThread chains.

namespace DirtyVanity {

// Fork the specified process and inject the payload into the clone.
// The cloned process runs the payload instead of the original code.
// Returns the cloned process HANDLE, or nullptr on failure.
HANDLE ForkAndInject(HANDLE hSourceProcess, const void* pPayload, size_t payloadSize);

} // namespace DirtyVanity
