#include "stdafx.h"
#include "injection_monitor.h"
#include "logger.h"

#include <unordered_map>
#include <mutex>
#include "hwbp_hook.h"

namespace InjectionMonitor {

struct RegionInfo {
    void* address;
    size_t size;
    DWORD originalProtect;
};

static std::unordered_map<void*, RegionInfo> g_MonitoredRegions;
static std::mutex g_RegionsMutex;
static PVOID g_VehHandle = nullptr;
static bool g_bInitialized = false;

static LONG CALLBACK VehHandler(PEXCEPTION_POINTERS pExceptionInfo)
{
    if (pExceptionInfo->ExceptionRecord->ExceptionCode == STATUS_GUARD_PAGE_VIOLATION)
    {
        void* faultAddress = (void*)pExceptionInfo->ExceptionRecord->ExceptionInformation[1];
        bool isMonitoredFault = false;
        
        {
            std::lock_guard<std::mutex> lock(g_RegionsMutex);
            
            // Check if fault address is inside any of our monitored regions
            for (auto& pair : g_MonitoredRegions) {
                void* regionStart = pair.first;
                void* regionEnd = (void*)((uintptr_t)regionStart + pair.second.size);
                
                if (faultAddress >= regionStart && faultAddress < regionEnd) {
                    isMonitoredFault = true;
                    // Read the first parameter (ExceptionInformation[0]) to determine operation:
                    // 0 = Read, 1 = Write, 8 = Execute
                    ULONG_PTR opType = pExceptionInfo->ExceptionRecord->ExceptionInformation[0];
                    const wchar_t* opStr = L"Unknown";
                    if (opType == 0) opStr = L"Read";
                    else if (opType == 1) opStr = L"Write";
                    else if (opType == 8) opStr = L"Execute";
                    
                    LOG(L"[Hook Tamper Alert] Guard page hit at monitored hook region %p (Fault at %p) - Operation: %s", 
                        regionStart, faultAddress, opStr);
                    
                    // The system removes the PAGE_GUARD flag automatically when the exception is raised.
                    // If we want to continue monitoring, we must re-apply PAGE_GUARD.
                    // However, we can't do it immediately or the current instruction will just fault again.
                    // To re-arm safely we'd need to set the Trap Flag (TF) and catch single-step, 
                    // or re-arm from another thread.
                    // For tamper detection logging purposes, one alert is usually sufficient.
                    
                    break;
                }
            }
        }
        
        if (isMonitoredFault) {
            // We caught and logged our guard page violation. 
            // Return EXCEPTION_CONTINUE_EXECUTION so the faulting instruction can execute without the guard flag.
            return EXCEPTION_CONTINUE_EXECUTION;
        }
    } else if (pExceptionInfo->ExceptionRecord->ExceptionCode == EXCEPTION_SINGLE_STEP) {
        if (HwbpHook::HandleSingleStepException(pExceptionInfo)) {
            return EXCEPTION_CONTINUE_EXECUTION;
        }
    }
    
    return EXCEPTION_CONTINUE_SEARCH;
}

bool Initialize() {
    if (g_bInitialized) return true;
    
    // Register the VEH handler (CALL_FIRST)
    g_VehHandle = AddVectoredExceptionHandler(1, VehHandler);
    if (g_VehHandle) {
        g_bInitialized = true;
        VERBOSE(L"InjectionMonitor VEH registered");
        return true;
    }
    
    LOG(L"Failed to register InjectionMonitor VEH");
    return false;
}

void Shutdown() {
    if (g_VehHandle) {
        RemoveVectoredExceptionHandler(g_VehHandle);
        g_VehHandle = nullptr;
    }
    
    std::lock_guard<std::mutex> lock(g_RegionsMutex);
    
    // Restore original protection to all regions
    for (auto& pair : g_MonitoredRegions) {
        DWORD oldProtect;
        VirtualProtect(pair.second.address, pair.second.size, pair.second.originalProtect, &oldProtect);
    }
    g_MonitoredRegions.clear();
    
    g_bInitialized = false;
}

bool RegisterHookRegion(void* address, size_t size) {
    if (!g_bInitialized && !Initialize()) return false;
    if (!address || size == 0) return false;

    // Get page start and align size
    void* pageAddress = (void*)((uintptr_t)address & ~((uintptr_t)0xFFF));
    size_t offset = (uintptr_t)address - (uintptr_t)pageAddress;
    size_t alignedSize = (size + offset + 0xFFF) & ~((size_t)0xFFF);

    MEMORY_BASIC_INFORMATION mbi;
    if (VirtualQuery(pageAddress, &mbi, sizeof(mbi)) == 0) return false;

    // If it's already a guard page, skip it to avoid nesting issues
    if (mbi.Protect & PAGE_GUARD) return true;

    DWORD originalProtect = mbi.Protect;
    DWORD newProtect = originalProtect | PAGE_GUARD;
    DWORD oldProtect;

    if (!VirtualProtect(pageAddress, alignedSize, newProtect, &oldProtect)) {
        LOG(L"Failed to set PAGE_GUARD on hook region %p", address);
        return false;
    }

    {
        std::lock_guard<std::mutex> lock(g_RegionsMutex);
        g_MonitoredRegions[pageAddress] = { pageAddress, alignedSize, originalProtect };
    }

    VERBOSE(L"Registered guard page monitoring for hook region %p", address);
    return true;
}

bool UnregisterHookRegion(void* address) {
    if (!g_bInitialized) return false;
    
    void* pageAddress = (void*)((uintptr_t)address & ~((uintptr_t)0xFFF));
    
    std::lock_guard<std::mutex> lock(g_RegionsMutex);
    
    auto it = g_MonitoredRegions.find(pageAddress);
    if (it != g_MonitoredRegions.end()) {
        DWORD oldProtect;
        VirtualProtect(it->second.address, it->second.size, it->second.originalProtect, &oldProtect);
        g_MonitoredRegions.erase(it);
        return true;
    }
    
    return false;
}

}  // namespace InjectionMonitor
