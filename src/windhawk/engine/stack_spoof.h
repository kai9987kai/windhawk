#pragma once

#include <windows.h>

namespace StackSpoof {

// Initialize the stack spoofing module by finding gadgets in system DLLs.
bool Initialize();

// Spoof the call stack for a function call with up to 6 arguments.
// This is a simplified version for demonstration of the technique.
extern "C" PVOID SpoofCall(
    PVOID pTarget,
    PVOID pGadget,
    PVOID pJmpRbptr,
    DWORD64 nArgs,
    ...
);

} // namespace StackSpoof
