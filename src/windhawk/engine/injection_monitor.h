#pragma once

#include <windows.h>

// Injection Integrity Monitoring via Guard Pages
// Based on 2025-2026 research: Uses VEH + PAGE_GUARD to monitor hook 
// trampolines for tampering by third-party software (e.g., anti-cheat, AV).
// If a registered hook region is accessed or modified, a STATUS_GUARD_PAGE_VIOLATION
// is raised and caught by our VEH, allowing us to log and optionally restore the hook.

namespace InjectionMonitor {

// Initialize the VEH handler.
bool Initialize();

// Unregister the VEH handler.
void Shutdown();

// Register a memory region (usually a hook trampoline) to be guarded.
// This sets PAGE_GUARD on the region.
bool RegisterHookRegion(void* address, size_t size);

// Unregister a region from being guarded.
bool UnregisterHookRegion(void* address);

}  // namespace InjectionMonitor
