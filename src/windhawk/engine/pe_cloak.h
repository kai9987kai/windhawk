#pragma once

#include <windows.h>

// PE Header Cloaking (2025 technique)
//
// After a DLL is loaded into a process, this module zeros out the DOS header
// (MZ signature) and PE header (PE\0\0 signature + optional header) in memory.
// 
// Memory scanners that enumerate loaded modules by walking the PEB or scanning
// for PE signatures will fail to identify the cloaked module. The code and
// data sections remain fully functional since they don't reference the headers
// at runtime.
//
// This is effective against:
// - Memory forensics tools (Volatility, WinDbg !dlls)
// - EDR module enumeration
// - Signature-based memory scanners

namespace PeCloak {

// Cloak a module in the current process by zeroing its PE headers.
// Returns true if the headers were successfully wiped.
bool CloakModule(HMODULE hModule);

// Cloak a module in a remote process.
// pRemoteBase should be the base address of the loaded DLL.
bool CloakRemoteModule(HANDLE hProcess, void* pRemoteBase);

// Check if a module's PE headers have been cloaked (MZ signature is zero).
bool IsCloaked(HMODULE hModule);

} // namespace PeCloak
