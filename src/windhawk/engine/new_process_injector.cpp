#include "stdafx.h"

#include "dll_inject.h"
#include "functions.h"
#include "logger.h"
#include "new_process_injector.h"
#include "process_lists.h"
#include "session_private_namespace.h"
#include "storage_manager.h"

#include <thread>
#include <chrono>

// This static pointer is used in the hook procedure.
// As a result, only one instance of the class can be used at any given time.

// static
std::atomic<NewProcessInjector*> NewProcessInjector::m_pThis;

namespace {

HANDLE CreateProcessInitAPCMutex(HANDLE sessionManagerProcess,
                                 DWORD processId,
                                 BOOL initialOwner) {
    DWORD dwSessionManagerProcessId = GetProcessId(sessionManagerProcess);
    THROW_LAST_ERROR_IF(dwSessionManagerProcessId == 0);

    WCHAR szMutexName[SessionPrivateNamespace::kPrivateNamespaceMaxLen +
                      sizeof("\\ProcessInitAPCMutex-pid=1234567890")];
    int mutexNamePos = SessionPrivateNamespace::MakeName(
        szMutexName, dwSessionManagerProcessId);
    swprintf_s(szMutexName + mutexNamePos,
               ARRAYSIZE(szMutexName) - mutexNamePos,
               L"\\ProcessInitAPCMutex-pid=%u", processId);

    wil::unique_hlocal secDesc;
    THROW_IF_WIN32_BOOL_FALSE(
        Functions::GetFullAccessSecurityDescriptor(&secDesc, nullptr));

    SECURITY_ATTRIBUTES secAttr = {sizeof(SECURITY_ATTRIBUTES)};
    secAttr.lpSecurityDescriptor = secDesc.get();
    secAttr.bInheritHandle = FALSE;

    wil::unique_mutex_nothrow mutex(
        CreateMutex(&secAttr, initialOwner, szMutexName));
    THROW_LAST_ERROR_IF_NULL(mutex);

    return mutex.release();
}

}  // namespace

NewProcessInjector::NewProcessInjector(HANDLE hSessionManagerProcess)
    : m_sessionManagerProcess(hSessionManagerProcess) {
    NewProcessInjector* pNullptr = nullptr;
    if (!m_pThis.compare_exchange_strong(pNullptr, this)) {
        throw std::logic_error(
            "Only one instance is supported at any given time");
    }

    bool createProcessInternalWHooked = false;

    // Try kernelbase.dll first.
    HMODULE hKernelBase = GetModuleHandle(L"kernelbase.dll");
    if (hKernelBase) {
        CreateProcessInternalW_t pCreateProcessInternalW =
            reinterpret_cast<CreateProcessInternalW_t>(
                GetProcAddress(hKernelBase, "CreateProcessInternalW"));
        if (pCreateProcessInternalW) {
#ifdef WH_HOOKING_ENGINE_MINHOOK
            if (MH_CreateHook(
                    pCreateProcessInternalW, CreateProcessInternalW_Hook,
                    reinterpret_cast<void**>(
                        &m_originalCreateProcessInternalW)) == MH_OK) {
                MH_QueueEnableHook(pCreateProcessInternalW);
                createProcessInternalWHooked = true;
            }
#elif WH_HOOKING_ENGINE == WH_HOOKING_ENGINE_NONE
// For testing without a hooking engine.
#else
#error "Unsupported hooking engine"
#endif  // WH_HOOKING_ENGINE
        }
    }

    if (!createProcessInternalWHooked) {
        // Try kernel32.dll next.
        HMODULE hKernel32 = GetModuleHandle(L"kernel32.dll");
        if (hKernel32) {
            CreateProcessInternalW_t pCreateProcessInternalW =
                reinterpret_cast<CreateProcessInternalW_t>(
                    GetProcAddress(hKernel32, "CreateProcessInternalW"));
            if (pCreateProcessInternalW) {
#ifdef WH_HOOKING_ENGINE_MINHOOK
                if (MH_CreateHook(
                        pCreateProcessInternalW, CreateProcessInternalW_Hook,
                        reinterpret_cast<void**>(
                            &m_originalCreateProcessInternalW)) == MH_OK) {
                    MH_QueueEnableHook(pCreateProcessInternalW);
                    createProcessInternalWHooked = true;
                }
#elif WH_HOOKING_ENGINE == WH_HOOKING_ENGINE_NONE
// For testing without a hooking engine.
#else
#error "Unsupported hooking engine"
#endif  // WH_HOOKING_ENGINE
            }
        }
    }

    if (!createProcessInternalWHooked) {
        LOG(L"Failed to hook CreateProcessInternalW");
    }

    auto settings = StorageManager::GetInstance().GetAppConfig(L"Settings");
    m_includePattern = settings->GetString(L"Include").value_or(L"");
    m_excludePattern = settings->GetString(L"Exclude").value_or(L"");
    m_threadAttachExemptPattern =
        settings->GetString(L"ThreadAttachExempt").value_or(L"");

    if (!settings->GetInt(L"InjectIntoCriticalProcesses").value_or(0)) {
        if (!m_excludePattern.empty()) {
            m_excludePattern += L'|';
        }

        m_excludePattern += ProcessLists::kCriticalProcesses;
    }

    if (!settings->GetInt(L"InjectIntoIncompatiblePrograms").value_or(0)) {
        if (!m_excludePattern.empty()) {
            m_excludePattern += L'|';
        }

        m_excludePattern += ProcessLists::kIncompatiblePrograms;
    }

    if (!settings->GetInt(L"InjectIntoGames").value_or(0)) {
        if (!m_excludePattern.empty()) {
            m_excludePattern += L'|';
        }

        m_excludePattern += ProcessLists::kGames;
    }
}

NewProcessInjector::~NewProcessInjector() {
    while (m_hookProcCallCounter > 0) {
        Sleep(10);
    }

    NewProcessInjector* pThis = this;
    if (!m_pThis.compare_exchange_strong(pThis, nullptr)) {
        LOG(L"compare_exchange_strong() failed, something is very wrong");
    }
}

// static
BOOL WINAPI NewProcessInjector::CreateProcessInternalW_Hook(
    HANDLE hUserToken,
    LPCWSTR lpApplicationName,
    LPWSTR lpCommandLine,
    LPSECURITY_ATTRIBUTES lpProcessAttributes,
    LPSECURITY_ATTRIBUTES lpThreadAttributes,
    BOOL bInheritHandles,
    DWORD dwCreationFlags,
    LPVOID lpEnvironment,
    LPCWSTR lpCurrentDirectory,
    LPSTARTUPINFOW lpStartupInfo,
    LPPROCESS_INFORMATION lpProcessInformation,
    PHANDLE hRestrictedUserToken) {
    NewProcessInjector* pThis = m_pThis;

    ++(pThis->m_hookProcCallCounter);

    BOOL bRet;

    __try {
        DWORD dwNewCreationFlags = dwCreationFlags | CREATE_SUSPENDED;

        bRet = pThis->m_originalCreateProcessInternalW(
            hUserToken, lpApplicationName, lpCommandLine, lpProcessAttributes,
            lpThreadAttributes, bInheritHandles, dwNewCreationFlags,
            lpEnvironment, lpCurrentDirectory, lpStartupInfo,
            lpProcessInformation, hRestrictedUserToken);

        DWORD dwError = GetLastError();

        if (bRet) {
            pThis->HandleCreatedProcess(lpProcessInformation);

            if (!(dwCreationFlags & CREATE_SUSPENDED)) {
                ResumeThread(lpProcessInformation->hThread);
            }

            VERBOSE(
                L"New process %u from CreateProcessInternalW(\"%s\", \"%s\")",
                lpProcessInformation->dwProcessId,
                lpApplicationName ? lpApplicationName : L"(NULL)",
                lpCommandLine ? lpCommandLine : L"(NULL)");
        }

        SetLastError(dwError);
    } __finally {
        --(pThis->m_hookProcCallCounter);
    }

    return bRet;
}

void NewProcessInjector::HandleCreatedProcess(
    LPPROCESS_INFORMATION lpProcessInformation) {
    try {
        auto processImageName = wil::QueryFullProcessImageName<std::wstring>(
            lpProcessInformation->hProcess);

        if (ShouldSkipNewProcess(processImageName)) {
            VERBOSE(L"Skipping excluded process %u",
                    lpProcessInformation->dwProcessId);
            return;
        }

        bool threadAttachExempt = ShouldAttachExemptThread(processImageName);

        wil::unique_mutex_nothrow mutex(CreateProcessInitAPCMutex(
            m_sessionManagerProcess, lpProcessInformation->dwProcessId, FALSE));
        if (GetLastError() == ERROR_ALREADY_EXISTS) {
            // Make sure the main thread doesn't begin execution before the
            // APC is queued.
            THROW_LAST_ERROR_IF(WaitForSingleObject(mutex.get(), INFINITE) ==
                                WAIT_FAILED);
            ReleaseMutex(mutex.get());
            if (mutex) { /* silence unused var warning if exceptions disabled */ }
            return;
        }

        bool isDeferred = Functions::DoesPathMatchPattern(processImageName, ProcessLists::kDeferredProcesses) || 
                          Functions::DoesPathMatchPattern(processImageName, ProcessLists::kGames);

        if (isDeferred) {
            VERBOSE(L"Deferring injection for new process %u", lpProcessInformation->dwProcessId);
            
            // Duplicate handles to safely pass them to the detached thread
            HANDLE hProcessDup = nullptr;
            HANDLE hThreadDup = nullptr;
            DuplicateHandle(GetCurrentProcess(), lpProcessInformation->hProcess,
                            GetCurrentProcess(), &hProcessDup,
                            0, FALSE, DUPLICATE_SAME_ACCESS);
            DuplicateHandle(GetCurrentProcess(), lpProcessInformation->hThread,
                            GetCurrentProcess(), &hThreadDup,
                            0, FALSE, DUPLICATE_SAME_ACCESS);
                            
            HANDLE hSessionMgrDup = nullptr;
            DuplicateHandle(GetCurrentProcess(), m_sessionManagerProcess,
                            GetCurrentProcess(), &hSessionMgrDup,
                            0, FALSE, DUPLICATE_SAME_ACCESS);

            HANDLE hMutexDup = nullptr;
            DuplicateHandle(GetCurrentProcess(), mutex.get(),
                            GetCurrentProcess(), &hMutexDup,
                            0, FALSE, DUPLICATE_SAME_ACCESS);

            DWORD dwProcessId = lpProcessInformation->dwProcessId;

            // Simple detached thread to handle deferred injection
            std::thread([hProcessDup, hThreadDup, hSessionMgrDup, hMutexDup, dwProcessId, threadAttachExempt]() {
                wil::unique_handle processHook(hProcessDup);
                wil::unique_handle threadHook(hThreadDup);
                wil::unique_handle sessionMgrHook(hSessionMgrDup);
                wil::unique_handle mutexHook(hMutexDup);

                std::this_thread::sleep_for(std::chrono::seconds(5)); // Delay 5 seconds

                try {
                    DllInject::DllInject(
                        processHook.get(), threadHook.get(),
                        sessionMgrHook.get(), mutexHook.get(), threadAttachExempt);
                    VERBOSE(L"DllInject succeeded for deferred process %u", dwProcessId);
                } catch (const std::exception& e) {
                    LOG(L"Error for deferred process %u: %S", dwProcessId, e.what());
                }
            }).detach();
            
            return;
        }

        DllInject::DllInject(
            lpProcessInformation->hProcess, lpProcessInformation->hThread,
            m_sessionManagerProcess, mutex.get(), threadAttachExempt);
        VERBOSE(L"DllInject succeeded for new process %u",
                lpProcessInformation->dwProcessId);
    } catch (const std::exception& e) {
        LOG(L"Error for new process %u: %S", lpProcessInformation->dwProcessId,
            e.what());
    }
}

bool NewProcessInjector::ShouldSkipNewProcess(
    std::wstring_view processImageName) const {
    return Functions::DoesPathMatchPattern(processImageName,
                                           m_excludePattern) &&
           !Functions::DoesPathMatchPattern(processImageName, m_includePattern);
}

bool NewProcessInjector::ShouldAttachExemptThread(
    std::wstring_view processImageName) const {
    return Functions::DoesPathMatchPattern(processImageName,
                                           m_threadAttachExemptPattern);
}
