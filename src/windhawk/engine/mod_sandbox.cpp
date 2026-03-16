#include "stdafx.h"
#include "mod_sandbox.h"
#include "logger.h"

namespace ModSandbox {

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

        SetThreadInformation(hThread, ThreadPowerThrottling, &powerThrottling, sizeof(powerThrottling));
    }

    // Apply Memory Priority limits
    if (m_limits.maxMemoryBytes > 0) {
        MEMORY_PRIORITY_INFORMATION memPriority;
        memPriority.MemoryPriority = MEMORY_PRIORITY_LOWEST;
        if (!SetThreadInformation(hThread, ThreadMemoryPriority, &memPriority, sizeof(memPriority))) {
            LOG(L"Failed to set thread memory priority: %u", GetLastError());
            success = false;
        }
    }

    return success;
}

} // namespace ModSandbox
