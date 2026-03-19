#include "stdafx.h"
#include "mockingjay_inject.h"
#include "logger.h"
#include <psapi.h>
#include <algorithm>

namespace MockingjayInject {

namespace {

// Read NT headers from a remote process module to find sections with RWX.
// Returns true if we successfully read and parsed the PE headers.
bool FindRWXInRemoteModule(HANDLE hProcess, HMODULE hRemoteModule,
                           const std::wstring& moduleName,
                           std::vector<RWXSection>& results) {
    // Read the DOS header
    IMAGE_DOS_HEADER dosHeader = {};
    SIZE_T bytesRead = 0;
    if (!ReadProcessMemory(hProcess, hRemoteModule, &dosHeader,
                           sizeof(dosHeader), &bytesRead) ||
        bytesRead != sizeof(dosHeader)) {
        return false;
    }

    if (dosHeader.e_magic != IMAGE_DOS_SIGNATURE) return false;

    // Read the NT headers
    BYTE ntHeaderBuf[4096] = {};
    PVOID pNtHeaders = (BYTE*)hRemoteModule + dosHeader.e_lfanew;
    if (!ReadProcessMemory(hProcess, pNtHeaders, ntHeaderBuf,
                           sizeof(ntHeaderBuf), &bytesRead)) {
        return false;
    }

    auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(ntHeaderBuf);
    if (pNtHdr->Signature != IMAGE_NT_SIGNATURE) return false;

    auto pSection = IMAGE_FIRST_SECTION(pNtHdr);
    WORD numSections = pNtHdr->FileHeader.NumberOfSections;

    // Check each section for RWX characteristics
    for (WORD i = 0; i < numSections; i++, pSection++) {
        DWORD characteristics = pSection->Characteristics;

        // Check for Read + Write + Execute
        bool isReadable  = (characteristics & IMAGE_SCN_MEM_READ) != 0;
        bool isWritable  = (characteristics & IMAGE_SCN_MEM_WRITE) != 0;
        bool isExecutable = (characteristics & IMAGE_SCN_MEM_EXECUTE) != 0;

        if (isReadable && isWritable && isExecutable) {
            size_t sectionSize = pSection->Misc.VirtualSize;
            if (sectionSize == 0) sectionSize = pSection->SizeOfRawData;

            // Only consider sections large enough to hold useful payloads
            if (sectionSize >= 256) {
                void* sectionAddr = (BYTE*)hRemoteModule + pSection->VirtualAddress;
                results.push_back({ sectionAddr, sectionSize, moduleName });

                VERBOSE(L"Mockingjay: Found RWX section '%.8S' in %s at %p (size=%zu)",
                        pSection->Name, moduleName.c_str(), sectionAddr, sectionSize);
            }
        }
    }

    return true;
}

} // namespace

std::vector<RWXSection> FindRWXSections(HANDLE hProcess) {
    std::vector<RWXSection> results;

    HMODULE hMods[1024];
    DWORD cbNeeded = 0;

    if (!EnumProcessModulesEx(hProcess, hMods, sizeof(hMods),
                              &cbNeeded, LIST_MODULES_ALL)) {
        LOG(L"Mockingjay: EnumProcessModulesEx failed: %u", GetLastError());
        return results;
    }

    DWORD moduleCount = cbNeeded / sizeof(HMODULE);
    VERBOSE(L"Mockingjay: Scanning %u loaded modules for RWX sections", moduleCount);

    for (DWORD i = 0; i < moduleCount; i++) {
        WCHAR szModName[MAX_PATH] = {};
        GetModuleBaseNameW(hProcess, hMods[i], szModName, _countof(szModName));

        // Skip critical system modules we shouldn't stomp
        std::wstring modName(szModName);
        std::wstring modLower = modName;
        std::transform(modLower.begin(), modLower.end(), modLower.begin(), ::towlower);
        
        if (modLower == L"ntdll.dll" || modLower == L"kernel32.dll" ||
            modLower == L"kernelbase.dll" || modLower == L"windhawk.dll") {
            continue;
        }

        FindRWXInRemoteModule(hProcess, hMods[i], modName, results);
    }

    // Sort by size, largest first (prefer bigger RWX sections for more payload room)
    std::sort(results.begin(), results.end(),
              [](const RWXSection& a, const RWXSection& b) {
                  return a.size > b.size;
              });

    VERBOSE(L"Mockingjay: Found %zu total RWX sections across %u modules",
            results.size(), moduleCount);

    return results;
}

bool InjectIntoRWX(HANDLE hProcess, const RWXSection& section,
                   const void* payload, size_t payloadSize) {
    if (payloadSize > section.size) {
        LOG(L"Mockingjay: Payload (%zu) exceeds RWX section size (%zu) in %s",
            payloadSize, section.size, section.moduleName.c_str());
        return false;
    }

    SIZE_T bytesWritten = 0;
    if (!WriteProcessMemory(hProcess, section.address, payload,
                            payloadSize, &bytesWritten) ||
        bytesWritten != payloadSize) {
        LOG(L"Mockingjay: WriteProcessMemory failed for %s: %u",
            section.moduleName.c_str(), GetLastError());
        return false;
    }

    // No VirtualProtectEx needed — the memory is already RWX!
    VERBOSE(L"Mockingjay: Successfully wrote %zu bytes to RWX section in %s at %p",
            payloadSize, section.moduleName.c_str(), section.address);
    return true;
}

} // namespace MockingjayInject
