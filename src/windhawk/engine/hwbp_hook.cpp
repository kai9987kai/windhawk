#include "stdafx.h"
#include "hwbp_hook.h"
#include "logger.h"
#include <tlhelp32.h>

namespace HwbpHook {

namespace {
    std::vector<HookContext> g_hooks;
    std::mutex g_hooksMutex;
    bool g_initialized = false;
}

bool Initialize() {
    std::lock_guard<std::mutex> lock(g_hooksMutex);
    if (g_initialized) {
        return true;
    }
    // Note: The actual VEH registration happens in injection_monitor.cpp
    // We just mark the HWBP engine as ready to process hooks
    g_initialized = true;
    return true;
}

void Uninitialize() {
    std::lock_guard<std::mutex> lock(g_hooksMutex);
    
    // Clear all hooks by resetting DR registers for the hooked threads
    for (const auto& hook : g_hooks) {
        HANDLE hThread = OpenThread(THREAD_GET_CONTEXT | THREAD_SET_CONTEXT | THREAD_SUSPEND_RESUME, FALSE, hook.threadId);
        if (hThread) {
            SuspendThread(hThread);
            CONTEXT ctx = { 0 };
            ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
            if (GetThreadContext(hThread, &ctx)) {
                // Clear the specific debug register
                if (hook.debugRegisterIndex == 0) ctx.Dr0 = 0;
                else if (hook.debugRegisterIndex == 1) ctx.Dr1 = 0;
                else if (hook.debugRegisterIndex == 2) ctx.Dr2 = 0;
                else if (hook.debugRegisterIndex == 3) ctx.Dr3 = 0;
                
                // Clear the local exact enable bit (L0-L3)
                ctx.Dr7 &= ~(1ull << (hook.debugRegisterIndex * 2));
                
                SetThreadContext(hThread, &ctx);
            }
            ResumeThread(hThread);
            CloseHandle(hThread);
        }
    }
    g_hooks.clear();
    g_initialized = false;
}

bool SetHook(void* targetFunction, void* hookFunction, void** originalFunction, DWORD threadId) {
    if (!g_initialized) return false;
    
    std::lock_guard<std::mutex> lock(g_hooksMutex);

    // Find a free debug register (0-3) for this thread
    int freeRegister = -1;
    bool registersInUse[4] = { false };
    
    for (const auto& hook : g_hooks) {
        if (hook.threadId == threadId) {
            registersInUse[hook.debugRegisterIndex] = true;
            if (hook.targetFunction == targetFunction) {
                // Already hooked
                return false;
            }
        }
    }
    
    for (int i = 0; i < 4; i++) {
        if (!registersInUse[i]) {
            freeRegister = i;
            break;
        }
    }
    
    if (freeRegister == -1) {
        LOG(L"HWBP Hooking failed: All debug registers in use for thread %u", threadId);
        return false;
    }

    HANDLE hThread = OpenThread(THREAD_GET_CONTEXT | THREAD_SET_CONTEXT | THREAD_SUSPEND_RESUME, FALSE, threadId);
    if (!hThread) {
        LOG(L"HWBP Hooking failed: Could not open thread %u", threadId);
        return false;
    }

    SuspendThread(hThread);
    
    CONTEXT ctx = { 0 };
    ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
    if (!GetThreadContext(hThread, &ctx)) {
        ResumeThread(hThread);
        CloseHandle(hThread);
        return false;
    }

    // Set the target address in the free debug register
    if (freeRegister == 0) ctx.Dr0 = reinterpret_cast<DWORD64>(targetFunction);
    else if (freeRegister == 1) ctx.Dr1 = reinterpret_cast<DWORD64>(targetFunction);
    else if (freeRegister == 2) ctx.Dr2 = reinterpret_cast<DWORD64>(targetFunction);
    else if (freeRegister == 3) ctx.Dr3 = reinterpret_cast<DWORD64>(targetFunction);

    // Enable the local exact breakpoint (execution only)
    ctx.Dr7 |= (1ull << (freeRegister * 2)); // Local enable
    // Bits 16-31 control condition and length. For execution breakpoints, they should be 00 (Execution) and 00 (1 byte).
    ctx.Dr7 &= ~(0xFull << (16 + (freeRegister * 4))); 
    
    if (!SetThreadContext(hThread, &ctx)) {
        ResumeThread(hThread);
        CloseHandle(hThread);
        return false;
    }

    ResumeThread(hThread);
    CloseHandle(hThread);

    HookContext newHook = { targetFunction, hookFunction, nullptr, threadId, freeRegister };
    g_hooks.push_back(newHook);
    
    if (originalFunction) {
        // HWBP hooking doesn't use a trampoline to return to original.
        // The original is simply the target function itself.
        // The hook function must handle calling the original function and temporarily disabling the HWBP, or emulating the instruction.
        // For simplicity, we just pass the target address so the hook knows what to call on resume.
        *originalFunction = targetFunction;
    }

    VERBOSE(L"HWBP Hook set on %p via DR%d for thread %u", targetFunction, freeRegister, threadId);
    return true;
}

bool SetHookAllThreads(void* targetFunction, void* hookFunction, void** originalFunction) {
    if (!g_initialized) return false;

    DWORD currentProcessId = GetCurrentProcessId();
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return false;

    THREADENTRY32 te = { sizeof(te) };
    bool success = true;

    if (Thread32First(hSnapshot, &te)) {
        do {
            if (te.th32OwnerProcessID == currentProcessId && te.th32ThreadID != GetCurrentThreadId()) {
                if (!SetHook(targetFunction, hookFunction, originalFunction, te.th32ThreadID)) {
                    // Success is opportunistic; if one thread fails, we continue others
                }
            }
        } while (Thread32Next(hSnapshot, &te));
    }

    CloseHandle(hSnapshot);
    return true; // Return true as long as we tried to apply it
}

bool RemoveHook(void* targetFunction, DWORD threadId) {
    if (!g_initialized) return false;
    
    std::lock_guard<std::mutex> lock(g_hooksMutex);
    
    for (auto it = g_hooks.begin(); it != g_hooks.end(); ++it) {
        if (it->targetFunction == targetFunction && it->threadId == threadId) {
            HANDLE hThread = OpenThread(THREAD_GET_CONTEXT | THREAD_SET_CONTEXT | THREAD_SUSPEND_RESUME, FALSE, threadId);
            if (hThread) {
                SuspendThread(hThread);
                CONTEXT ctx = { 0 };
                ctx.ContextFlags = CONTEXT_DEBUG_REGISTERS;
                if (GetThreadContext(hThread, &ctx)) {
                    if (it->debugRegisterIndex == 0) ctx.Dr0 = 0;
                    else if (it->debugRegisterIndex == 1) ctx.Dr1 = 0;
                    else if (it->debugRegisterIndex == 2) ctx.Dr2 = 0;
                    else if (it->debugRegisterIndex == 3) ctx.Dr3 = 0;
                    
                    ctx.Dr7 &= ~(1ull << (it->debugRegisterIndex * 2));
                    SetThreadContext(hThread, &ctx);
                }
                ResumeThread(hThread);
                CloseHandle(hThread);
            }
            g_hooks.erase(it);
            return true;
        }
    }
    return false;
}

bool RemoveHookAllThreads(void* targetFunction) {
    if (!g_initialized) return false;

    DWORD currentProcessId = GetCurrentProcessId();
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return false;

    THREADENTRY32 te = { sizeof(te) };
    if (Thread32First(hSnapshot, &te)) {
        do {
            if (te.th32OwnerProcessID == currentProcessId) {
                RemoveHook(targetFunction, te.th32ThreadID);
            }
        } while (Thread32Next(hSnapshot, &te));
    }

    CloseHandle(hSnapshot);
    return true;
}

bool HandleSingleStepException(PEXCEPTION_POINTERS exceptionInfo) {
    if (!g_initialized) return false;

    DWORD currentThreadId = GetCurrentThreadId();
    void* faultAddress = reinterpret_cast<void*>(exceptionInfo->ExceptionRecord->ExceptionAddress);

    std::lock_guard<std::mutex> lock(g_hooksMutex);

    for (const auto& hook : g_hooks) {
        if (hook.threadId == currentThreadId && hook.targetFunction == faultAddress) {
            // HWBP hit! Redirect execution to the hook function
            
            // On x64/x86, we modify the instruction pointer
#if defined(_M_AMD64)
            exceptionInfo->ContextRecord->Rip = reinterpret_cast<DWORD64>(hook.hookFunction);
#elif defined(_M_IX86)
            exceptionInfo->ContextRecord->Eip = reinterpret_cast<DWORD>(hook.hookFunction);
#else
            #error "Unsupported architecture"
#endif
            
            // To prevent an infinite loop, if the hook wants to call the original, 
            // the engineer must either emulate the first instruction or temporarily disable DR, 
            // set RF (Resume Flag) in EFLAGS, and step.
            // For now, setting Resume Flag allows returning to hook target without immediately re-triggering.
            exceptionInfo->ContextRecord->EFlags |= 0x10000; // Set RF bit

            return true; // We handled the exception
        }
    }

    return false; // Not our breakpoint
}

} // namespace HwbpHook
