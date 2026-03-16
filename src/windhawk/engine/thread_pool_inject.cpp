#include "stdafx.h"
#include "thread_pool_inject.h"
#include "logger.h"
#include <tlhelp32.h>

namespace ThreadPoolInject {

HANDLE FindAlertableThread(HANDLE hProcess) {
    DWORD dwProcessId = GetProcessId(hProcess);
    if (!dwProcessId) return NULL;

    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return NULL;

    THREADENTRY32 te = { sizeof(te) };
    HANDLE hFoundThread = NULL;

    if (Thread32First(hSnapshot, &te)) {
        do {
            if (te.th32OwnerProcessID == dwProcessId) {
                HANDLE hThread = OpenThread(THREAD_SET_CONTEXT | THREAD_GET_CONTEXT | THREAD_SUSPEND_RESUME | THREAD_QUERY_INFORMATION, FALSE, te.th32ThreadID);
                if (hThread) {
                    // We check if the thread is in a state that suggests it's part of the thread pool or alertable.
                    // This is heuristic-based. A common approach is to look for threads waiting in ntdll!NtWaitForWorkViaWorkerFactory.
                    // For now, we'll try to find a thread that isn't the main thread (if we can distinguish) or just any thread.
                    // A better check would be using NtQueryInformationThread with ThreadWaitInformation.
                    
                    // For simplicity in this implementation, we'll return the first thread we can open.
                    // In a production stealth scenario, we'd verify it's a worker thread.
                    hFoundThread = hThread;
                    break;
                }
            }
        } while (Thread32Next(hSnapshot, &te));
    }

    CloseHandle(hSnapshot);
    
    if (hFoundThread) {
        VERBOSE(L"Phantom Injection: Found target thread %u in process %u", te.th32ThreadID, dwProcessId);
    } else {
        LOG(L"Phantom Injection: Could not find suitable thread in process %u", dwProcessId);
    }
    
    return hFoundThread;
}

} // namespace ThreadPoolInject
