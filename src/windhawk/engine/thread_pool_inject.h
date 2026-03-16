#pragma once

#include <windows.h>
#include <vector>

namespace ThreadPoolInject {

// Find a suitable existing thread in the target process that is likely alertable
// and can be used for APC injection.
// Returns a thread handle with THREAD_ALL_ACCESS, or NULL if not found.
HANDLE FindAlertableThread(HANDLE hProcess);

} // namespace ThreadPoolInject
