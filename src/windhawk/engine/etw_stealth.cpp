#include "stdafx.h"
#include "etw_stealth.h"
#include "logger.h"

namespace EtwStealth {

static DWORD g_TlsIndex = TLS_OUT_OF_INDEXES;

// Original function pointers
static PVOID g_pOriginalEtwEventWrite = nullptr;
static PVOID g_pOriginalEtwEventWriteEx = nullptr;
static PVOID g_pOriginalEtwEventWriteFull = nullptr;
static PVOID g_pOriginalNtTraceEvent = nullptr;

// Target function pointers (for hook management)
static PVOID g_pTargetEtwEventWrite = nullptr;
static PVOID g_pTargetEtwEventWriteEx = nullptr;
static PVOID g_pTargetEtwEventWriteFull = nullptr;
static PVOID g_pTargetNtTraceEvent = nullptr;

static bool g_bIsPatched = false;
static int  g_nHooksInstalled = 0;

// --- Typedefs ---

typedef ULONG (NTAPI* EtwEventWrite_t)(
    _In_ REGHANDLE RegHandle,
    _In_ PCEVENT_DESCRIPTOR EventDescriptor,
    _In_ ULONG UserDataCount,
    _In_reads_opt_(UserDataCount) PEVENT_DATA_DESCRIPTOR UserData
);

// EtwEventWriteEx has an additional Filter parameter
typedef ULONG (NTAPI* EtwEventWriteEx_t)(
    _In_ REGHANDLE RegHandle,
    _In_ PCEVENT_DESCRIPTOR EventDescriptor,
    _In_ ULONG64 Filter,
    _In_ ULONG Flags,
    _In_ ULONG UserDataCount,
    _In_reads_opt_(UserDataCount) PEVENT_DATA_DESCRIPTOR UserData
);

// EtwEventWriteFull is the comprehensive version
typedef ULONG (NTAPI* EtwEventWriteFull_t)(
    _In_ REGHANDLE RegHandle,
    _In_ PCEVENT_DESCRIPTOR EventDescriptor,
    _In_ USHORT EventProperty,
    _In_opt_ LPCGUID ActivityId,
    _In_opt_ LPCGUID RelatedActivityId,
    _In_ ULONG UserDataCount,
    _In_reads_opt_(UserDataCount) PEVENT_DATA_DESCRIPTOR UserData
);

// NtTraceEvent is the kernel-level entry point
typedef NTSTATUS (NTAPI* NtTraceEvent_t)(
    _In_ HANDLE TraceHandle,
    _In_ ULONG Flags,
    _In_ ULONG FieldSize,
    _In_ PVOID Fields
);

// --- Hooked Functions ---

static ULONG NTAPI Hooked_EtwEventWrite(
    REGHANDLE RegHandle,
    PCEVENT_DESCRIPTOR EventDescriptor,
    ULONG UserDataCount,
    PEVENT_DATA_DESCRIPTOR UserData)
{
    if (IsCurrentThreadSuppressed()) return 0;
    if (g_pOriginalEtwEventWrite) {
        return ((EtwEventWrite_t)g_pOriginalEtwEventWrite)(
            RegHandle, EventDescriptor, UserDataCount, UserData);
    }
    return 0; 
}

static ULONG NTAPI Hooked_EtwEventWriteEx(
    REGHANDLE RegHandle,
    PCEVENT_DESCRIPTOR EventDescriptor,
    ULONG64 Filter,
    ULONG Flags,
    ULONG UserDataCount,
    PEVENT_DATA_DESCRIPTOR UserData)
{
    if (IsCurrentThreadSuppressed()) return 0;
    if (g_pOriginalEtwEventWriteEx) {
        return ((EtwEventWriteEx_t)g_pOriginalEtwEventWriteEx)(
            RegHandle, EventDescriptor, Filter, Flags, UserDataCount, UserData);
    }
    return 0;
}

static ULONG NTAPI Hooked_EtwEventWriteFull(
    REGHANDLE RegHandle,
    PCEVENT_DESCRIPTOR EventDescriptor,
    USHORT EventProperty,
    LPCGUID ActivityId,
    LPCGUID RelatedActivityId,
    ULONG UserDataCount,
    PEVENT_DATA_DESCRIPTOR UserData)
{
    if (IsCurrentThreadSuppressed()) return 0;
    if (g_pOriginalEtwEventWriteFull) {
        return ((EtwEventWriteFull_t)g_pOriginalEtwEventWriteFull)(
            RegHandle, EventDescriptor, EventProperty, 
            ActivityId, RelatedActivityId, UserDataCount, UserData);
    }
    return 0;
}

static NTSTATUS NTAPI Hooked_NtTraceEvent(
    HANDLE TraceHandle,
    ULONG Flags,
    ULONG FieldSize,
    PVOID Fields)
{
    if (IsCurrentThreadSuppressed()) return 0;
    if (g_pOriginalNtTraceEvent) {
        return ((NtTraceEvent_t)g_pOriginalNtTraceEvent)(
            TraceHandle, Flags, FieldSize, Fields);
    }
    return 0;
}

// --- Lifecycle ---

bool Initialize() {
    if (g_TlsIndex == TLS_OUT_OF_INDEXES) {
        g_TlsIndex = TlsAlloc();
        if (g_TlsIndex != TLS_OUT_OF_INDEXES) {
            TlsSetValue(g_TlsIndex, (LPVOID)0);
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

#ifdef WH_HOOKING_ENGINE_MINHOOK
// Helper to install a single hook, logging on failure but continuing
static bool InstallOneHook(const char* name, HMODULE hModule, const char* procName,
                           LPVOID hookFn, PVOID* ppOriginal, PVOID* ppTarget) {
    *ppTarget = GetProcAddress(hModule, procName);
    if (!*ppTarget) {
        VERBOSE(L"EtwStealth: %S not found, skipping", name);
        return false;
    }

    MH_STATUS status = MH_CreateHook(*ppTarget, hookFn, ppOriginal);
    if (status != MH_OK && status != MH_ERROR_ALREADY_CREATED) {
        LOG(L"EtwStealth: Failed to create %S hook: %d", name, status);
        return false;
    }

    status = MH_EnableHook(*ppTarget);
    if (status != MH_OK && status != MH_ERROR_ENABLED) {
        LOG(L"EtwStealth: Failed to enable %S hook: %d", name, status);
        return false;
    }

    VERBOSE(L"EtwStealth: %S hooked successfully", name);
    return true;
}
#endif

bool PatchEtwEventWrite() {
    if (g_bIsPatched) return true;
    Initialize();
    
    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return false;

#ifdef WH_HOOKING_ENGINE_MINHOOK
    g_nHooksInstalled = 0;

    // Primary target: EtwEventWrite (used by most ETW providers)
    if (InstallOneHook("EtwEventWrite", hNtdll, "EtwEventWrite",
                       (LPVOID)&Hooked_EtwEventWrite,
                       &g_pOriginalEtwEventWrite, &g_pTargetEtwEventWrite)) {
        g_nHooksInstalled++;
    }

    // Extended target: EtwEventWriteEx (used by newer providers with filters)
    if (InstallOneHook("EtwEventWriteEx", hNtdll, "EtwEventWriteEx",
                       (LPVOID)&Hooked_EtwEventWriteEx,
                       &g_pOriginalEtwEventWriteEx, &g_pTargetEtwEventWriteEx)) {
        g_nHooksInstalled++;
    }

    // Full target: EtwEventWriteFull (comprehensive ETW writer)
    if (InstallOneHook("EtwEventWriteFull", hNtdll, "EtwpEventWriteFull",
                       (LPVOID)&Hooked_EtwEventWriteFull,
                       &g_pOriginalEtwEventWriteFull, &g_pTargetEtwEventWriteFull)) {
        g_nHooksInstalled++;
    }

    // Kernel path: NtTraceEvent (bypasses user-mode ETW entirely)
    if (InstallOneHook("NtTraceEvent", hNtdll, "NtTraceEvent",
                       (LPVOID)&Hooked_NtTraceEvent,
                       &g_pOriginalNtTraceEvent, &g_pTargetNtTraceEvent)) {
        g_nHooksInstalled++;
    }

    if (g_nHooksInstalled > 0) {
        g_bIsPatched = true;
        VERBOSE(L"EtwStealth: %d ETW hook(s) installed for stealth injection", g_nHooksInstalled);
        return true;
    }

    LOG(L"EtwStealth: Failed to install any ETW hooks");
    return false;
#else
    LOG(L"EtwStealth requires MinHook engine");
    return false;
#endif
}

bool RestoreEtwEventWrite() {
    if (!g_bIsPatched) return true;

#ifdef WH_HOOKING_ENGINE_MINHOOK
    auto unhook = [](PVOID target) {
        if (target) {
            MH_DisableHook(target);
        }
    };

    unhook(g_pTargetEtwEventWrite);
    unhook(g_pTargetEtwEventWriteEx);
    unhook(g_pTargetEtwEventWriteFull);
    unhook(g_pTargetNtTraceEvent);

    g_bIsPatched = false;
    g_nHooksInstalled = 0;
    return true;
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

