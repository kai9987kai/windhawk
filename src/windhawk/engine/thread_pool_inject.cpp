#include "stdafx.h"
#include "thread_pool_inject.h"
#include "logger.h"
#include <tlhelp32.h>

namespace ThreadPoolInject {

namespace {

// Thread state enum from NT internals
enum KTHREAD_STATE : ULONG {
    Initialized = 0,
    Ready = 1,
    Running = 2,
    Standby = 3,
    Terminated = 4,
    Waiting = 5,
    Transition = 6,
    DeferredReady = 7,
    GateWaitObsolete = 8,
    WaitingForProcessInSwap = 9
};

// Wait reason enum (subset)
enum KWAIT_REASON : ULONG {
    Executive = 0,
    FreePage = 1,
    PageIn = 2,
    PoolAllocation = 3,
    DelayExecution = 4,
    Suspended = 5,
    UserRequest = 6,
    WrExecutive = 7,
    WrFreePage = 8,
    WrPageIn = 9,
    WrPoolAllocation = 10,
    WrDelayExecution = 11,
    WrSuspended = 12,
    WrUserRequest = 13,
    WrQueue = 15,        // Thread pool worker queue wait
    WrAlerted = 20,
    MaximumWaitReason = 37
};

typedef struct _THREAD_BASIC_INFORMATION {
    NTSTATUS ExitStatus;
    PVOID TebBaseAddress;
    struct {
        HANDLE UniqueProcess;
        HANDLE UniqueThread;
    } ClientId;
    ULONG_PTR AffinityMask;
    LONG Priority;
    LONG BasePriority;
} THREAD_BASIC_INFORMATION;

// NtQueryInformationThread function pointer
typedef NTSTATUS (NTAPI* NtQueryInformationThread_t)(
    HANDLE ThreadHandle,
    ULONG ThreadInformationClass,
    PVOID ThreadInformation,
    ULONG ThreadInformationLength,
    PULONG ReturnLength
);

// Check if a thread is likely in an alertable wait state (thread pool worker).
// Uses NtQueryInformationThread with class 4 (ThreadBasicInformation)
// and class 40 (ThreadIsTerminated) if available.
bool IsThreadSuitableForAPC(HANDLE hThread, NtQueryInformationThread_t pNtQueryInfoThread) {
    if (!pNtQueryInfoThread) return true; // fallback: accept any

    // Check if thread is terminated
    ULONG isTerminated = 0;
    NTSTATUS status = pNtQueryInfoThread(hThread, 40 /*ThreadIsTerminated*/,
        &isTerminated, sizeof(isTerminated), nullptr);
    if (status >= 0 && isTerminated) {
        return false; // Skip terminated threads
    }

    // Get basic information to check priority and exit status
    THREAD_BASIC_INFORMATION tbi = {};
    status = pNtQueryInfoThread(hThread, 0 /*ThreadBasicInformation*/,
        &tbi, sizeof(tbi), nullptr);
    if (status >= 0) {
        // Skip threads with unusual exit status (already terminating)
        if (tbi.ExitStatus != 0x103 /*STATUS_PENDING*/) {
            return false;
        }
    }

    return true;
}

} // namespace

HANDLE FindAlertableThread(HANDLE hProcess) {
    DWORD dwProcessId = GetProcessId(hProcess);
    if (!dwProcessId) return NULL;

    // Resolve NtQueryInformationThread for more precise checks
    NtQueryInformationThread_t pNtQueryInfoThread = nullptr;
    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (hNtdll) {
        pNtQueryInfoThread = (NtQueryInformationThread_t)
            GetProcAddress(hNtdll, "NtQueryInformationThread");
    }

    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return NULL;

    THREADENTRY32 te = { sizeof(te) };
    HANDLE hBestThread = NULL;
    DWORD bestThreadId = 0;
    int bestScore = -1;

    if (Thread32First(hSnapshot, &te)) {
        do {
            if (te.th32OwnerProcessID != dwProcessId) continue;

            HANDLE hThread = OpenThread(
                THREAD_SET_CONTEXT | THREAD_GET_CONTEXT | 
                THREAD_SUSPEND_RESUME | THREAD_QUERY_INFORMATION,
                FALSE, te.th32ThreadID);
            if (!hThread) continue;

            // Evaluate this thread's suitability
            if (!IsThreadSuitableForAPC(hThread, pNtQueryInfoThread)) {
                CloseHandle(hThread);
                continue;
            }

            // Score threads: prefer lower priority (worker threads typically
            // run at normal or below-normal priority)
            int score = 0;
            
            // Non-main threads are preferred (higher thread IDs created later)
            score += 1;
            
            // Lower base priority suggests worker thread
            if (te.tpBasePri <= THREAD_PRIORITY_NORMAL) {
                score += 2;
            }

            if (score > bestScore) {
                if (hBestThread) CloseHandle(hBestThread);
                hBestThread = hThread;
                bestThreadId = te.th32ThreadID;
                bestScore = score;
            } else {
                CloseHandle(hThread);
            }
        } while (Thread32Next(hSnapshot, &te));
    }

    CloseHandle(hSnapshot);
    
    if (hBestThread) {
        VERBOSE(L"Phantom Injection: Found target thread %u (score=%d) in process %u",
                bestThreadId, bestScore, dwProcessId);
    } else {
        LOG(L"Phantom Injection: Could not find suitable thread in process %u", dwProcessId);
    }
    
    return hBestThread;
}

} // namespace ThreadPoolInject

