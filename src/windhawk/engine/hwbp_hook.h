#pragma once

#include <windows.h>
#include <vector>
#include <mutex>

namespace HwbpHook {

struct HookContext {
    void* targetFunction;
    void* hookFunction;
    void* originalFunction; // Optional: To continue execution if needed
    DWORD threadId;
    int debugRegisterIndex; // 0 to 3
};

// Initialize the HWBP hooking engine
bool Initialize();

// Uninitialize the HWBP hooking engine
void Uninitialize();

// Set a hardware breakpoint hook on a specific target function in a specific thread
bool SetHook(void* targetFunction, void* hookFunction, void** originalFunction, DWORD threadId);

// Set a hardware breakpoint hook on all threads in the current process
bool SetHookAllThreads(void* targetFunction, void* hookFunction, void** originalFunction);

// Remove a hardware breakpoint hook from a specific thread
bool RemoveHook(void* targetFunction, DWORD threadId);

// Remove a hardware breakpoint hook from all threads
bool RemoveHookAllThreads(void* targetFunction);

// Internal: Called by the VEH when EXCEPTION_SINGLE_STEP occurs.
// Returns true if the exception was a HWBP hit and was handled.
bool HandleSingleStepException(PEXCEPTION_POINTERS exceptionInfo);

} // namespace HwbpHook
