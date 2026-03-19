#include "stdafx.h"
#include "module_stomp.h"
#include "logger.h"
#include "functions.h"
#include <psapi.h>

namespace ModuleStomp {

// Find a module by name in the remote process using EnumProcessModulesEx.
// This correctly handles 64-bit addresses, unlike GetExitCodeThread which truncates.
static void* FindRemoteModuleBase(HANDLE hProcess, const std::wstring& dllName) {
    HMODULE hMods[1024];
    DWORD cbNeeded = 0;

    if (!EnumProcessModulesEx(hProcess, hMods, sizeof(hMods), &cbNeeded, LIST_MODULES_ALL)) {
        LOG(L"ModuleStomp: EnumProcessModulesEx failed: %u", GetLastError());
        return nullptr;
    }

    DWORD moduleCount = cbNeeded / sizeof(HMODULE);
    for (DWORD i = 0; i < moduleCount; i++) {
        WCHAR szModName[MAX_PATH] = { 0 };
        if (GetModuleBaseNameW(hProcess, hMods[i], szModName, _countof(szModName))) {
            if (_wcsicmp(szModName, dllName.c_str()) == 0) {
                return (void*)hMods[i];
            }
        }
    }

    return nullptr;
}

void* LoadStompTarget(HANDLE hProcess, const std::wstring& dllName) {
    // Load the target DLL into the remote process via CreateRemoteThread + LoadLibraryW.
    HMODULE hKernel32 = GetModuleHandle(L"kernel32.dll");
    void* pLoadLibraryW = GetProcAddress(hKernel32, "LoadLibraryW");
    
    if (!pLoadLibraryW) return nullptr;

    size_t pathLen = (dllName.length() + 1) * sizeof(wchar_t);
    void* pRemotePath = VirtualAllocEx(hProcess, nullptr, pathLen, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
    if (!pRemotePath) return nullptr;

    if (!WriteProcessMemory(hProcess, pRemotePath, dllName.c_str(), pathLen, nullptr)) {
        VirtualFreeEx(hProcess, pRemotePath, 0, MEM_RELEASE);
        return nullptr;
    }

    HANDLE hThread = Functions::MyCreateRemoteThread(hProcess, (LPTHREAD_START_ROUTINE)pLoadLibraryW, pRemotePath, 0);
    if (!hThread) {
        VirtualFreeEx(hProcess, pRemotePath, 0, MEM_RELEASE);
        return nullptr;
    }

    WaitForSingleObject(hThread, INFINITE);
    CloseHandle(hThread);
    VirtualFreeEx(hProcess, pRemotePath, 0, MEM_RELEASE);

    // Use EnumProcessModulesEx to find the correct 64-bit base address
    // instead of GetExitCodeThread which truncates to DWORD on x64.
    void* pBaseAddress = FindRemoteModuleBase(hProcess, dllName);
    if (!pBaseAddress) {
        LOG(L"ModuleStomp: Failed to find %s in target process after loading", dllName.c_str());
        return nullptr;
    }

    VERBOSE(L"ModuleStomp: Loaded %s at %p", dllName.c_str(), pBaseAddress);
    return pBaseAddress;
}

} // namespace ModuleStomp

