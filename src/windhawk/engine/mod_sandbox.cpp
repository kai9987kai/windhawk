#include "stdafx.h"
#include "mod_sandbox.h"
#include "logger.h"

namespace ModSandbox {

namespace {

using SetThreadInformation_t =
    BOOL(WINAPI*)(HANDLE, THREAD_INFORMATION_CLASS, LPVOID, DWORD);

#if (_WIN32_WINNT < _WIN32_WINNT_WIN8)
typedef struct _MEMORY_PRIORITY_INFORMATION {
    ULONG MemoryPriority;
} MEMORY_PRIORITY_INFORMATION, *PMEMORY_PRIORITY_INFORMATION;
#endif

#ifndef MEMORY_PRIORITY_LOWEST
#define MEMORY_PRIORITY_LOWEST 0
#endif

#ifndef THREAD_POWER_THROTTLING_CURRENT_VERSION
#define THREAD_POWER_THROTTLING_CURRENT_VERSION 1
#endif

#ifndef THREAD_POWER_THROTTLING_EXECUTION_SPEED
#define THREAD_POWER_THROTTLING_EXECUTION_SPEED 0x1
#endif

#if !defined(THREAD_POWER_THROTTLING_CURRENT_VERSION) || \
    (_WIN32_WINNT < _WIN32_WINNT_WIN10_RS3)
typedef struct _THREAD_POWER_THROTTLING_STATE {
    ULONG Version;
    ULONG ControlMask;
    ULONG StateMask;
} THREAD_POWER_THROTTLING_STATE;
#endif

SetThreadInformation_t GetSetThreadInformation() {
    static auto setThreadInformation =
        reinterpret_cast<SetThreadInformation_t>(
            GetProcAddress(GetModuleHandleW(L"kernel32.dll"),
                           "SetThreadInformation"));
    return setThreadInformation;
}

}  // namespace

SandboxObject::SandboxObject(PCWSTR objectName, const SandboxLimits& limits) 
    : m_limits(limits) {
    VERBOSE(L"Sandbox Object requested: %s", objectName ? objectName : L"Anonymous");
}

SandboxObject::~SandboxObject() {
}

bool SandboxObject::ApplyThreadLimits(HANDLE hThread) {
    bool success = true;

    // Apply CPU limits via Thread Priority and Power Throttling
    if (m_limits.maxCpuPercentage > 0 && m_limits.maxCpuPercentage < 100) {
        if (!SetThreadPriority(hThread, THREAD_PRIORITY_LOWEST)) {
            LOG(L"Failed to set thread priority for sandbox: %u", GetLastError());
            success = false;
        }

        // Apply Power Throttling (Windows 10+)
        THREAD_POWER_THROTTLING_STATE powerThrottling;
        ZeroMemory(&powerThrottling, sizeof(powerThrottling));
        powerThrottling.Version = THREAD_POWER_THROTTLING_CURRENT_VERSION;
        powerThrottling.ControlMask = THREAD_POWER_THROTTLING_EXECUTION_SPEED;
        
        // If CPU limit is strict (e.g., < 50%), enable heavy throttling
        if (m_limits.maxCpuPercentage < 50) {
            powerThrottling.StateMask = THREAD_POWER_THROTTLING_EXECUTION_SPEED;
        } else {
            powerThrottling.StateMask = 0;
        }

        if (auto setThreadInformation = GetSetThreadInformation()) {
            setThreadInformation(hThread, ThreadPowerThrottling,
                                 &powerThrottling,
                                 sizeof(powerThrottling));
        }
    }

    // Apply Memory Priority limits
    if (m_limits.maxMemoryBytes > 0) {
        MEMORY_PRIORITY_INFORMATION memPriority;
        memPriority.MemoryPriority = MEMORY_PRIORITY_LOWEST;
        if (auto setThreadInformation = GetSetThreadInformation()) {
            if (!setThreadInformation(hThread, ThreadMemoryPriority,
                                      &memPriority, sizeof(memPriority))) {
                LOG(L"Failed to set thread memory priority: %u",
                    GetLastError());
                success = false;
            }
        }
    }

    return success;
}

} // namespace ModSandbox
