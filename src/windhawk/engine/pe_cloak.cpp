#include "stdafx.h"
#include "pe_cloak.h"
#include "logger.h"

namespace PeCloak {

namespace {

// Get the size of headers to wipe from a PE module.
// Returns 0 if the module is not a valid PE.
size_t GetHeaderSize(PVOID pBase) {
    auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(pBase);
    if (pDosHdr->e_magic != IMAGE_DOS_SIGNATURE) return 0;

    auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(
        reinterpret_cast<PBYTE>(pBase) + pDosHdr->e_lfanew);
    if (pNtHdr->Signature != IMAGE_NT_SIGNATURE) return 0;

    // The SizeOfHeaders field includes DOS header, PE header, section table
    return pNtHdr->OptionalHeader.SizeOfHeaders;
}

} // namespace

bool CloakModule(HMODULE hModule) {
    if (!hModule) return false;

    PBYTE pBase = reinterpret_cast<PBYTE>(hModule);
    size_t headerSize = GetHeaderSize(pBase);
    if (headerSize == 0) {
        LOG(L"PeCloak: Module at %p has invalid PE headers", hModule);
        return false;
    }

    // Change protection to allow writing
    DWORD oldProtect = 0;
    if (!VirtualProtect(pBase, headerSize, PAGE_READWRITE, &oldProtect)) {
        LOG(L"PeCloak: VirtualProtect (RW) failed for %p: %u", hModule, GetLastError());
        return false;
    }

    // Zero out the entire header region
    SecureZeroMemory(pBase, headerSize);

    // Restore original protection
    VirtualProtect(pBase, headerSize, oldProtect, &oldProtect);

    VERBOSE(L"PeCloak: Cloaked module at %p (%zu header bytes wiped)", hModule, headerSize);
    return true;
}

bool CloakRemoteModule(HANDLE hProcess, void* pRemoteBase) {
    if (!hProcess || !pRemoteBase) return false;

    // Read the DOS header to find the PE header
    IMAGE_DOS_HEADER dosHeader = {};
    SIZE_T bytesRead = 0;
    if (!ReadProcessMemory(hProcess, pRemoteBase, &dosHeader,
                           sizeof(dosHeader), &bytesRead) ||
        bytesRead != sizeof(dosHeader)) {
        LOG(L"PeCloak: Failed to read DOS header from remote process");
        return false;
    }

    if (dosHeader.e_magic != IMAGE_DOS_SIGNATURE) {
        LOG(L"PeCloak: Remote module at %p has invalid DOS signature", pRemoteBase);
        return false;
    }

    // Read the NT headers to get SizeOfHeaders
    IMAGE_NT_HEADERS ntHeaders = {};
    PVOID pNtHdr = (PBYTE)pRemoteBase + dosHeader.e_lfanew;
    if (!ReadProcessMemory(hProcess, pNtHdr, &ntHeaders,
                           sizeof(ntHeaders), &bytesRead)) {
        LOG(L"PeCloak: Failed to read NT headers from remote process");
        return false;
    }

    if (ntHeaders.Signature != IMAGE_NT_SIGNATURE) {
        LOG(L"PeCloak: Remote module at %p has invalid PE signature", pRemoteBase);
        return false;
    }

    size_t headerSize = ntHeaders.OptionalHeader.SizeOfHeaders;
    if (headerSize == 0 || headerSize > 0x10000) {
        LOG(L"PeCloak: Suspicious header size: %zu", headerSize);
        return false;
    }

    // Create a zero buffer
    std::vector<BYTE> zeros(headerSize, 0);

    // Change protection in remote process
    DWORD oldProtect = 0;
    if (!VirtualProtectEx(hProcess, pRemoteBase, headerSize,
                          PAGE_READWRITE, &oldProtect)) {
        LOG(L"PeCloak: VirtualProtectEx failed for remote %p: %u",
            pRemoteBase, GetLastError());
        return false;
    }

    // Write zeros over the headers
    SIZE_T bytesWritten = 0;
    bool success = WriteProcessMemory(hProcess, pRemoteBase, zeros.data(),
                                       headerSize, &bytesWritten) &&
                   bytesWritten == headerSize;

    // Restore original protection
    VirtualProtectEx(hProcess, pRemoteBase, headerSize, oldProtect, &oldProtect);

    if (success) {
        VERBOSE(L"PeCloak: Cloaked remote module at %p (%zu header bytes wiped)",
                pRemoteBase, headerSize);
    } else {
        LOG(L"PeCloak: Failed to wipe remote headers: %u", GetLastError());
    }

    return success;
}

bool IsCloaked(HMODULE hModule) {
    if (!hModule) return false;
    
    // Check if the MZ signature has been zeroed
    auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(hModule);
    return pDosHdr->e_magic != IMAGE_DOS_SIGNATURE;
}

} // namespace PeCloak
