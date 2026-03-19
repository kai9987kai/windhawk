#pragma once

#include <windows.h>

// Halo's Gate / Tartarus' Gate SSN Resolver (2024-2025 technique)
//
// Dynamically resolves System Service Numbers (SSNs) from ntdll.dll by
// parsing the Nt* function stubs. When an EDR has hooked a function (replacing
// the mov eax, SSN with a jmp), Halo's Gate searches neighboring functions
// (which are sequentially numbered) to derive the correct SSN.
//
// Tartarus' Gate extends this by checking for different hook signatures
// at alternative byte offsets within the function prologue.

namespace SsnResolver {

struct SyscallEntry {
    DWORD ssn;             // System Service Number
    PVOID pSyscallAddr;    // Address of the 'syscall' instruction
    PVOID pFuncAddr;       // Original function address in ntdll
    char funcName[64];     // Function name
    bool hooked;           // True if the function appears to be hooked
};

// Initialize: parse ntdll exports and resolve all Nt* SSNs.
// Uses Halo's Gate / Tartarus' Gate for hooked functions.
bool Initialize();

// Look up a resolved SSN by function name.
// Returns nullptr if not found.
const SyscallEntry* GetEntry(const char* funcName);

// Get the total number of resolved syscalls.
size_t GetResolvedCount();

// Get the number of hooked functions detected.
size_t GetHookedCount();

} // namespace SsnResolver
