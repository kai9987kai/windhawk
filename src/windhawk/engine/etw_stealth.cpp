#include "stdafx.h"
#include "etw_stealth.h"
#include "logger.h"

// For hook implementation, we use MinHook if available. 
// Windhawk clone already uses MinHook for the mods API so we can leverage it here.
#ifdef WH_HOOKING_ENGINE_MINHOOK
#include <MinHook.h>
#endif

namespace EtwStealth {

static DWORD g_TlsIndex = TLS_OUT_OF_INDEXES;
static PVOID g_pOriginalEtwEventWrite = nullptr;
static PVOID g_pTargetEtwEventWrite = nullptr;
static bool  g_bIsPatched = false;

// Typedef for ntdll!EtwEventWrite
typedef ULONG (NTAPI* EtwEventWrite_t)(
    _In_ REGHANDLE RegHandle,
    _In_ PCEVENT_DESCRIPTOR EventDescriptor,
    _In_ ULONG UserDataCount,
    _In_reads_opt_(UserDataCount) PEVENT_DATA_DESCRIPTOR UserData
);

// Our hooked EtwEventWrite
static ULONG NTAPI Hooked_EtwEventWrite(
    REGHANDLE RegHandle,
    PCEVENT_DESCRIPTOR EventDescriptor,
    ULONG UserDataCount,
    PEVENT_DATA_DESCRIPTOR UserData)
{
    // Check if the current thread is suppressed
    if (IsCurrentThreadSuppressed()) {
        // Return STATUS_SUCCESS (0) to signal to ETW that the event 
        // was successfully written, effectively acting as a black hole.
        return 0; 
    }

    // Call original function
    if (g_pOriginalEtwEventWrite) {
        return ((EtwEventWrite_t)g_pOriginalEtwEventWrite)(
            RegHandle, EventDescriptor, UserDataCount, UserData);
    }
    
    return 0; 
}

bool Initialize() {
    if (g_TlsIndex == TLS_OUT_OF_INDEXES) {
        g_TlsIndex = TlsAlloc();
        if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
            TlsSetValue(g_TlsIndex, (LPVOID)0); // initialized to 0
            return true;
        }
    }
    return g_TlsIndex != TLS_OUT_OF_INDEXES;
}

void Shutdown() {
    if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
        TlsFree(g_TlsIndex);
        g_TlsIndex = TLS_OUT_OF_INDEXES;
    }
    RestoreEtwEventWrite();
}

bool PatchEtwEventWrite() {
    if (g_bIsPatched) return true;
    Initialize(); // ensure TLS is up
    
    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return false;

    g_pTargetEtwEventWrite = GetProcAddress(hNtdll, "EtwEventWrite");
    if (!g_pTargetEtwEventWrite) return false;

#ifdef WH_HOOKING_ENGINE_MINHOOK
    MH_STATUS status = MH_CreateHook(g_pTargetEtwEventWrite, (LPVOID)&Hooked_EtwEventWrite, &g_pOriginalEtwEventWrite);
    if (status == MH_OK || status == MH_ERROR_ALREADY_CREATED) {
        status = MH_EnableHook(g_pTargetEtwEventWrite);
        if (status == MH_OK || status == MH_ERROR_ENABLED) {
            g_bIsPatched = true;
            VERBOSE(L"EtwEventWrite successfully hooked for stealth injection");
            return true;
        } else {
            LOG(L"Failed to enable EtwEventWrite hook: %d", status);
            return false;
        }
    } else {
        LOG(L"Failed to create EtwEventWrite hook: %d", status);
        return false;
    }
#else
    // If MinHook is disabled, we would do a manual inline patch here
    // (e.g. jmp to our hook and assemble a trampoline)
    // Windhawk relies on MinHook so this branch is unlikely.
    LOG(L"EtwStealth requires MinHook engine");
    return false;
#endif
}

bool RestoreEtwEventWrite() {
    if (!g_bIsPatched) return true;

#ifdef WH_HOOKING_ENGINE_MINHOOK
    MH_STATUS status = MH_DisableHook(g_pTargetEtwEventWrite);
    if (status == MH_OK || status == MH_ERROR_DISABLED) {
        g_bIsPatched = false;
        return true;
    }
    return false;
#else
    return false;
#endif
}

void SuppressForCurrentThread() {
    if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
        size_t count = (size_t)TlsGetValue(g_TlsIndex);
        count++;
        TlsSetValue(g_TlsIndex, (LPVOID)count);
    }
}

void ResumeForCurrentThread() {
    if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
        size_t count = (size_t)TlsGetValue(g_TlsIndex);
        if (count > 0) {
            count--;
            TlsSetValue(g_TlsIndex, (LPVOID)count);
        }
    }
}

bool IsCurrentThreadSuppressed() {
    if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
        size_t count = (size_t)TlsGetValue(g_TlsIndex);
        return count > 0;
    }
    return false;
}

}  // namespace EtwStealth
