#pragma once

#include <windows.h>

// HookChain (2024 technique by M4v3r1ck, refined 2025)
//
// Rewrites the Import Address Table (IAT) of kernel32.dll and kernelbase.dll
// to bypass EDR hooks. Instead of calling ntdll functions through the hooked
// addresses, HookChain redirects IAT entries to point at clean 'syscall'
// instructions within ntdll, using dynamically resolved SSNs.
//
// This makes API calls from kernel32/kernelbase invisible to EDRs that
// rely on inline hooks in ntdll — the calls never reach the hook trampolines.
//
// Research shows 88% bypass rate against tested EDR products.

namespace HookChain {

// Initialize by scanning ntdll exports and resolving SSNs.
// Must be called before RewriteIAT.
bool Initialize();

// Rewrite IATs of kernel32.dll and kernelbase.dll to bypass EDR hooks.
// Returns true if at least one IAT entry was successfully rewritten.
bool RewriteIAT();

// Restore all modified IAT entries to their original values.
void RestoreIAT();

// Returns true if HookChain is active (IATs have been rewritten).
bool IsActive();

// Shutdown and clean up.
void Shutdown();

} // namespace HookChain
