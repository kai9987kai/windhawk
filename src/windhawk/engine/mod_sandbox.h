#pragma once

#include <windows.h>
#include <wil/resource.h>

namespace ModSandbox {

struct SandboxLimits {
    // Number of handles allowed
    DWORD maxHandles = 10000;
    
    // Max working set memory in bytes (0 = unlimited)
    SIZE_T maxMemoryBytes = 0;
    
    // Max CPU percentage (1-100, 0 = unlimited)
    DWORD maxCpuPercentage = 0;
};

class SandboxObject {
public:
    SandboxObject(PCWSTR objectName, const SandboxLimits& limits);
    ~SandboxObject();
    
    SandboxObject(const SandboxObject&) = delete;
    SandboxObject& operator=(const SandboxObject&) = delete;

    bool ApplyThreadLimits(HANDLE hThread);
    
private:
    SandboxLimits m_limits;
};

} // namespace ModSandbox
