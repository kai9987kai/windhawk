#pragma once

#include <windows.h>
#include <vector>
#include <string>

// Minifilter Rootkit Interface (Phase 6)
//
// Communicates with a custom Kernel File System Minifilter to selectively
// hide files, folders, and registry keys from all user-mode applications,
// including EDRs and Windows Explorer. 
//
// Bypasses the need for unstable SSDT hooking. Since the Minifilter intercepts 
// I/O Request Packets (IRPs) directly inside the storage stack, queries for 
// Windhawk configuration simply return STATUS_NO_SUCH_FILE.

namespace MinifilterRootkit {

// Instruct the minifilter to hide a specific path from Directory Enums.
bool HidePath(const std::wstring& absolutePath);

// Instruct the minifilter to hide a specific registry key value.
bool HideRegistryValue(const std::wstring& keyPath, const std::wstring& valueName);

} // namespace MinifilterRootkit
