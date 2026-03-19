#include "stdafx.h"
#include "dll_proxy.h"
#include "logger.h"
#include <vector>
#include <string>

namespace DllProxy {

bool GetRealDllPath(const wchar_t* dllName, wchar_t* pathOut, size_t pathLen) {
    // The real DLL is in the System32 directory
    UINT written = GetSystemDirectoryW(pathOut, (UINT)pathLen);
    if (written == 0 || written >= pathLen - 2) return false;

    wcscat_s(pathOut, pathLen, L"\\");
    wcscat_s(pathOut, pathLen, dllName);

    return GetFileAttributesW(pathOut) != INVALID_FILE_ATTRIBUTES;
}

PVOID BuildProxyDll(const ProxyConfig& config, size_t* pOutputSize) {
    if (!config.targetDllName || !config.realDllPath) return nullptr;

    // Load the real DLL to enumerate its exports
    HMODULE hRealDll = LoadLibraryExW(config.realDllPath, nullptr,
                                       DONT_RESOLVE_DLL_REFERENCES);
    if (!hRealDll) {
        LOG(L"DllProxy: Failed to load real DLL: %s (error=%u)",
            config.realDllPath, GetLastError());
        return nullptr;
    }

    auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(hRealDll);
    auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(
        (PBYTE)hRealDll + pDosHdr->e_lfanew);
    auto& exportDir = pNtHdr->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT];

    std::vector<std::string> exportNames;

    if (exportDir.Size > 0) {
        auto pExport = reinterpret_cast<PIMAGE_EXPORT_DIRECTORY>(
            (PBYTE)hRealDll + exportDir.VirtualAddress);
        auto pNames = reinterpret_cast<PDWORD>((PBYTE)hRealDll + pExport->AddressOfNames);

        for (DWORD i = 0; i < pExport->NumberOfNames; i++) {
            const char* name = (const char*)((PBYTE)hRealDll + pNames[i]);
            exportNames.push_back(name);
        }
    }

    FreeLibrary(hRealDll);

    VERBOSE(L"DllProxy: Real DLL '%s' has %zu exports to forward",
            config.targetDllName, exportNames.size());

    // Generate a linker-compatible DEF file content that forwards all exports.
    // This is stored as metadata that can be used to build the proxy DLL with
    // the appropriate build tools.
    std::string defContent = "LIBRARY \"";
    
    // Convert wchar_t name to narrow
    char narrowName[MAX_PATH] = {};
    WideCharToMultiByte(CP_UTF8, 0, config.targetDllName, -1,
                        narrowName, sizeof(narrowName), nullptr, nullptr);
    defContent += narrowName;
    defContent += "\"\nEXPORTS\n";

    char narrowRealPath[MAX_PATH] = {};
    WideCharToMultiByte(CP_UTF8, 0, config.realDllPath, -1,
                        narrowRealPath, sizeof(narrowRealPath), nullptr, nullptr);

    // Extract just the filename from the real path for forwarding
    std::string realDllFile = narrowRealPath;
    size_t lastSlash = realDllFile.find_last_of("\\/");
    if (lastSlash != std::string::npos)
        realDllFile = realDllFile.substr(lastSlash + 1);
    // Remove .dll extension
    size_t dotPos = realDllFile.rfind('.');
    if (dotPos != std::string::npos)
        realDllFile = realDllFile.substr(0, dotPos);

    for (const auto& name : exportNames) {
        // Format: exportName = realDll.exportName
        defContent += "  " + name + " = " + realDllFile + "." + name + "\n";
    }

    // Allocate buffer for the DEF content as our output
    size_t outputSize = defContent.size() + 1;
    PVOID pOutput = VirtualAlloc(nullptr, outputSize, MEM_COMMIT | MEM_RESERVE,
                                  PAGE_READWRITE);
    if (pOutput) {
        memcpy(pOutput, defContent.c_str(), outputSize);
        if (pOutputSize) *pOutputSize = outputSize;
    }

    return pOutput;
}

bool DeployProxy(const ProxyConfig& config, const wchar_t* deployPath) {
    if (!deployPath) return false;

    size_t defSize = 0;
    PVOID pDefContent = BuildProxyDll(config, &defSize);
    if (!pDefContent) return false;

    // Write the DEF file to the deploy path for offline compilation
    std::wstring defPath = deployPath;
    defPath += L"\\";
    defPath += config.targetDllName;
    defPath += L".def";

    HANDLE hFile = CreateFileW(defPath.c_str(), GENERIC_WRITE, 0, nullptr,
                                CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
    if (hFile == INVALID_HANDLE_VALUE) {
        LOG(L"DllProxy: Failed to write DEF file: %s (error=%u)",
            defPath.c_str(), GetLastError());
        VirtualFree(pDefContent, 0, MEM_RELEASE);
        return false;
    }

    DWORD written = 0;
    WriteFile(hFile, pDefContent, (DWORD)defSize, &written, nullptr);
    CloseHandle(hFile);
    VirtualFree(pDefContent, 0, MEM_RELEASE);

    VERBOSE(L"DllProxy: DEF file written to %s (%zu exports forwarded)",
            defPath.c_str(), defSize);
    return true;
}

bool RemoveProxy(const wchar_t* proxyPath) {
    if (!proxyPath) return false;
    return DeleteFileW(proxyPath) != FALSE;
}

} // namespace DllProxy
