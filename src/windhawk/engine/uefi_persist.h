#pragma once

#include <windows.h>
#include <string>

// UEFI NVRAM Persistence (Phase 6)
//
// Writes Windhawk bootstrap execution paths directly into the Motherboard's 
// NVRAM firmware environment variables. 
//
// This allows Windhawk modules to survive complete hard drive formats and OS 
// reinstallations by hooking the Windows Boot Manager (bootmgfw.efi) or 
// forcing UEFI to execute a pre-boot environment payload before the OS even loads.

namespace UefiPersist {

// Set an EFI Variable in NVRAM.
// Requires SeSystemEnvironmentPrivilege.
bool WriteNvramVariable(const std::wstring& varName, const void* pData, size_t dataSize);

// Configure Windhawk to execute on next boot via NVRAM injection.
bool InstallBootkitPersistence(const std::wstring& payloadPath);

} // namespace UefiPersist
