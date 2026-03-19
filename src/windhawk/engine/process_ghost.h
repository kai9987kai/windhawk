#pragma once

#include <windows.h>

// Process Ghosting (2021 technique, refined 2025)
//
// Creates a process from a payload that has no backing file on disk:
// 1. Create a temp file and write the payload
// 2. Put the file in delete-pending state (NtSetInformationFile)
// 3. Create an image section from the delete-pending file
// 4. Close the file handle, completing the deletion
// 5. Create a process from the section — the executable is now "ghosted"
//
// Security products that inspect the file at process creation find nothing.

namespace ProcessGhost {

// Create a ghosted process from an in-memory PE payload.
// Returns the process handle, or NULL on failure.
// The caller is responsible for closing the handle.
HANDLE CreateGhostedProcess(const void* pePayload, size_t payloadSize);

} // namespace ProcessGhost
