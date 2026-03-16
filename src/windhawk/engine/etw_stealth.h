#pragma once

#include <windows.h>
#include <evntprov.h>

// Anti-Detection ETW Stealth Module
// Based on 2025 research: In-memory patching of ntdll!EtwEventWrite to return
// STATUS_SUCCESS (0) without generating any ETW telemetry. 
// Uses thread-local storage (TLS) to only suppress events from the injection
// thread, rather than blinding the entire system or process globally.

namespace EtwStealth {

// Must be called once during process startup to initialize TLS indexing.
bool Initialize();

// Cleanup TLS slot.
void Shutdown();

// Patches EtwEventWrite if not already patched.
// Returns true if successful or already patched.
bool PatchEtwEventWrite();

// Restores the original bytes of EtwEventWrite.
// Returns true if successful or already restored.
bool RestoreEtwEventWrite();

// Increments the suppression counter for the current thread.
// When > 0, the patched EtwEventWrite will return immediately.
void SuppressForCurrentThread();

// Decrements the suppression counter for the current thread.
void ResumeForCurrentThread();

// Checks if the current thread is suppressed. (Used internally by the hook).
bool IsCurrentThreadSuppressed();

}  // namespace EtwStealth
