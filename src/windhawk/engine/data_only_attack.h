#pragma once

#include <windows.h>
#include <vector>

// Data-Only Attack Builder (Phase 7)
//
// Replaces traditional executable shellcode targeting PAGE_EXECUTE_READWRITE
// with a Data-Only ROP/JOP (Return/Jump Oriented Programming) chain.
//
// Modern EDRs flag any allocation of Executable memory space. By leveraging
// existing code in legitimate loaded DLLs (ntdll, kernel32), this engine
// constructs a payload comprising solely of stack addresses (data).
// The target thread's stack pointer is hijacked and redirected to our data array,
// forcing the CPU to bounce through pre-existing executable instructions to achieve
// the objective without mapping a single suspicious byte of code.

namespace DataOnlyAttack {

// Build a dynamic ROP chain payload array from gadgets in the target process.
// Returns the stacked address array representing the data-only payload.
std::vector<ULONG_PTR> CompileRopChain(HANDLE hProcess, ULONG_PTR intendedGoal);

// Execute a compiled ROP chain in the target process by hijacking a thread.
bool ExecuteChain(HANDLE hProcess, const std::vector<ULONG_PTR>& ropChain);

} // namespace DataOnlyAttack
