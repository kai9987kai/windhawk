#pragma once

#include <windows.h>

// Ring -1 Hypervisor Stealth (VMM) (Phase 7)
//
// A "Blue Pill" style Virtual Machine Monitor implementation.
// Utilizes Intel VT-x or AMD-V hardware virtualization instructions
// to boot a lightweight hypervisor *underneath* the running operating system.
//
// Once operating at Ring -1 (VMX Root Mode), Windhawk uses Extended Page Tables 
// (EPT) or Second Level Address Translation (SLAT) to manipulate the physical 
// memory mappings perceived by the OS (Ring-0) and EDR.
// 
// This makes injected memory blocks mathematically invisible to memory
// scanners, as the EPT abstracts the true hardware pages away from them.

namespace HypervisorStealth {

// Initialize the hypervisor on all logical processors and enter VMX Root Mode.
bool InitializeHypervisor();

// Direct the Hypervisor via hypercalls (VMCALL) to hide a physical memory page
// from the guest OS using EPT unmapping.
bool HideMemoryPageWithEPT(PVOID virtualAddress);

} // namespace HypervisorStealth
