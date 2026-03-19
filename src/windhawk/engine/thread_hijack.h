#pragma once

#include <windows.h>

// Thread Execution Hijacking (classic technique, refined 2025)
//
// Avoids creating remote threads or queuing APCs — instead:
// 1. Suspend an existing thread in the target process
// 2. Get its context (register state)
// 3. Save the original RIP/EIP
// 4. Set RIP/EIP to point at injected code, RCX/EDI to the data pointer
// 5. Resume the thread
//
// The injected code is responsible for restoring the original register state
// and jumping back to the saved instruction pointer after execution.

namespace ThreadHijack {

// Hijack a thread to execute code at pRemoteCode with argument pRemoteData.
// The thread will be suspended, its context modified, and then resumed.
// Returns true if the hijack was set up successfully.
bool HijackThread(HANDLE hProcess, HANDLE hThread,
                  void* pRemoteCode, void* pRemoteData);

} // namespace ThreadHijack
