#include "stdafx.h"
#include "thread_hijack.h"
#include "logger.h"

namespace ThreadHijack {

bool HijackThread(HANDLE hProcess, HANDLE hThread,
                  void* pRemoteCode, void* pRemoteData) {
    if (!hThread || !pRemoteCode) return false;

    // Step 1: Suspend the target thread
    DWORD suspendCount = SuspendThread(hThread);
    if (suspendCount == (DWORD)-1) {
        LOG(L"ThreadHijack: SuspendThread failed: %u", GetLastError());
        return false;
    }

    CONTEXT ctx = {};
    bool success = false;

#ifdef _M_AMD64
    // x64 implementation
    ctx.ContextFlags = CONTEXT_FULL;
    if (!GetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: GetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    VERBOSE(L"ThreadHijack: Original RIP=0x%llX, RSP=0x%llX", ctx.Rip, ctx.Rsp);

    // Write the original RIP to the remote stack as a "return address"
    // so the shellcode can restore execution after it's done.
    // We push the original RIP onto the stack (aligned to 16 bytes)
    ctx.Rsp -= sizeof(DWORD64);
    ctx.Rsp &= ~0xF; // Ensure 16-byte alignment
    
    SIZE_T bytesWritten = 0;
    DWORD64 originalRip = ctx.Rip;
    if (!WriteProcessMemory(hProcess, (PVOID)ctx.Rsp, &originalRip,
                            sizeof(originalRip), &bytesWritten)) {
        LOG(L"ThreadHijack: Failed to write return address to stack: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    // Set RIP to our injected code
    ctx.Rip = (DWORD64)pRemoteCode;
    // Pass data pointer via RCX (first argument in x64 calling convention)
    ctx.Rcx = (DWORD64)pRemoteData;

    if (!SetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: SetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    success = true;
    VERBOSE(L"ThreadHijack: x64 context hijacked — new RIP=%p, RCX=%p",
            pRemoteCode, pRemoteData);

#elif defined(_M_IX86)
    // x86 implementation
    ctx.ContextFlags = CONTEXT_FULL;
    if (!GetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: GetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    VERBOSE(L"ThreadHijack: Original EIP=0x%08X, ESP=0x%08X", ctx.Eip, ctx.Esp);

    // Push original EIP and data pointer onto the stack
    ctx.Esp -= sizeof(DWORD);
    DWORD dataArg = (DWORD)(DWORD_PTR)pRemoteData;
    WriteProcessMemory(hProcess, (PVOID)ctx.Esp, &dataArg, sizeof(dataArg), nullptr);

    ctx.Esp -= sizeof(DWORD);
    DWORD originalEip = ctx.Eip;
    WriteProcessMemory(hProcess, (PVOID)ctx.Esp, &originalEip, sizeof(originalEip), nullptr);

    // Set EIP to our injected code
    ctx.Eip = (DWORD)(DWORD_PTR)pRemoteCode;

    if (!SetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: SetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    success = true;
    VERBOSE(L"ThreadHijack: x86 context hijacked — new EIP=%p", pRemoteCode);

#elif defined(_M_ARM64)
    // ARM64 implementation
    ctx.ContextFlags = CONTEXT_FULL;
    if (!GetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: GetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    VERBOSE(L"ThreadHijack: Original PC=0x%llX, SP=0x%llX", ctx.Pc, ctx.Sp);

    // Save original PC in LR (X30) so the shellcode can branch back
    ctx.Lr = ctx.Pc;
    // Set PC to our injected code
    ctx.Pc = (DWORD64)pRemoteCode;
    // Pass data pointer via X0 (first argument in ARM64 calling convention)
    ctx.X[0] = (DWORD64)pRemoteData;

    if (!SetThreadContext(hThread, &ctx)) {
        LOG(L"ThreadHijack: SetThreadContext failed: %u", GetLastError());
        ResumeThread(hThread);
        return false;
    }

    success = true;
    VERBOSE(L"ThreadHijack: ARM64 context hijacked — new PC=%p, X0=%p",
            pRemoteCode, pRemoteData);

#else
    LOG(L"ThreadHijack: Unsupported architecture");
#endif

    // Step 4: Resume the thread — it now executes our code
    if (success) {
        ResumeThread(hThread);
        VERBOSE(L"ThreadHijack: Thread resumed, executing injected code");
    } else {
        ResumeThread(hThread);
    }

    return success;
}

} // namespace ThreadHijack
