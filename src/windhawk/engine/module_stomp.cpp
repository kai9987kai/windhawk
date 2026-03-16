#include "stdafx.h"
#include "module_stomp.h"
#include "logger.h"
#include "functions.h"

namespace ModuleStomp {

void* LoadStompTarget(HANDLE hProcess, const std::wstring& dllName) {
    // We'll use MyCreateRemoteThread to call LoadLibraryW in the target process.
    // This is the simplest way to get a legitimate module loaded.
    
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
    
    DWORD dwExitCode = 0;
    GetExitCodeThread(hThread, &dwExitCode);
    CloseHandle(hThread);
    VirtualFreeEx(hProcess, pRemotePath, 0, MEM_RELEASE);

    if (dwExitCode == 0) {
        LOG(L"ModuleStomp: Failed to load %s in target process", dllName.c_str());
        return nullptr;
    }

    void* pBaseAddress = (void*)(ULONG_PTR)dwExitCode;
    VERBOSE(L"ModuleStomp: Loaded %s at %p", dllName.c_str(), pBaseAddress);
    return pBaseAddress;
}

} // namespace ModuleStomp
