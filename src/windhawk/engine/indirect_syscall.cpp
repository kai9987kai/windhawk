#include "stdafx.h"
#include "indirect_syscall.h"
#include "logger.h"

#ifdef _WIN64

namespace IndirectSyscall {

struct SyscallEntry {
    DWORD dwHash;
    WORD wSystemCall;
    PVOID pAddress;
};

// Hashes for the functions we need
constexpr DWORD HASH_NtAllocateVirtualMemory = 0x8a920dba;
constexpr DWORD HASH_NtWriteVirtualMemory    = 0x48937086;
constexpr DWORD HASH_NtProtectVirtualMemory  = 0x510619a0;
constexpr DWORD HASH_NtFreeVirtualMemory     = 0xe8e6538b;
constexpr DWORD HASH_NtCreateThreadEx        = 0x3d0d8bbd;
constexpr DWORD HASH_NtQueueApcThread        = 0x51ce30a4;

// Global table for resolved syscalls
SyscallEntry g_Syscall_NtAllocateVirtualMemory = { HASH_NtAllocateVirtualMemory, 0, nullptr };
SyscallEntry g_Syscall_NtWriteVirtualMemory    = { HASH_NtWriteVirtualMemory, 0, nullptr };
SyscallEntry g_Syscall_NtProtectVirtualMemory  = { HASH_NtProtectVirtualMemory, 0, nullptr };
SyscallEntry g_Syscall_NtFreeVirtualMemory     = { HASH_NtFreeVirtualMemory, 0, nullptr };
SyscallEntry g_Syscall_NtCreateThreadEx        = { HASH_NtCreateThreadEx, 0, nullptr };
SyscallEntry g_Syscall_NtQueueApcThread        = { HASH_NtQueueApcThread, 0, nullptr };

static bool g_bInitialized = false;

// Simple DJB2 hash for function names
constexpr DWORD HashStringDjb2(const char* String) {
    DWORD Hash = 5381;
    INT c;
    while ((c = *String++))
        Hash = ((Hash << 5) + Hash) + c;
    return Hash;
}

bool Initialize() {
    if (g_bInitialized) return true;

    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    PBYTE pNtdllBase = reinterpret_cast<PBYTE>(hNtdll);
    if (!pNtdllBase) return false;

    PIMAGE_DOS_HEADER pDosHdr = (PIMAGE_DOS_HEADER)pNtdllBase;
    PIMAGE_NT_HEADERS pNtHdrs = (PIMAGE_NT_HEADERS)(pNtdllBase + pDosHdr->e_lfanew);
    PIMAGE_EXPORT_DIRECTORY pExportDir = (PIMAGE_EXPORT_DIRECTORY)(pNtdllBase + pNtHdrs->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT].VirtualAddress);

    PDWORD pAddressOfFunctions = (PDWORD)(pNtdllBase + pExportDir->AddressOfFunctions);
    PDWORD pAddressOfNames = (PDWORD)(pNtdllBase + pExportDir->AddressOfNames);
    PWORD pAddressOfNameOrdinals = (PWORD)(pNtdllBase + pExportDir->AddressOfNameOrdinals);

    auto resolveSyscall = [&](SyscallEntry& entry) {
        for (DWORD i = 0; i < pExportDir->NumberOfNames; i++) {
            const char* szName = (const char*)(pNtdllBase + pAddressOfNames[i]);
            if (HashStringDjb2(szName) == entry.dwHash) {
                WORD ordinal = pAddressOfNameOrdinals[i];
                PVOID pFunction = (PVOID)(pNtdllBase + pAddressOfFunctions[ordinal]);
                
                // Parse the stub to find the syscall number (SSN)
                // mov r10, rcx
                // mov eax, <SSN>
                PBYTE pCode = (PBYTE)pFunction;
                if (pCode[0] == 0x4c && pCode[1] == 0x8b && pCode[2] == 0xd1 && pCode[3] == 0xb8) {
                    entry.wSystemCall = *(PWORD)(pCode + 4);
                    
                    // Now find the 'syscall' instruction (0x0F 0x05) nearby to jump to
                    // This is the core of indirect syscalls - jumping into legitimate ntdll space
                    for (int j = 0; j < 32; j++) {
                        if (pCode[j] == 0x0f && pCode[j+1] == 0x05) {
                            entry.pAddress = (PVOID)(pCode + j);
                            break;
                        }
                    }
                }
                break;
            }
        }
    };

    resolveSyscall(g_Syscall_NtAllocateVirtualMemory);
    resolveSyscall(g_Syscall_NtWriteVirtualMemory);
    resolveSyscall(g_Syscall_NtProtectVirtualMemory);
    resolveSyscall(g_Syscall_NtFreeVirtualMemory);
    resolveSyscall(g_Syscall_NtCreateThreadEx);
    resolveSyscall(g_Syscall_NtQueueApcThread);

    // Ensure all were resolved properly
    if (g_Syscall_NtAllocateVirtualMemory.pAddress &&
        g_Syscall_NtWriteVirtualMemory.pAddress &&
        g_Syscall_NtCreateThreadEx.pAddress) {
        g_bInitialized = true;
    }

    return g_bInitialized;
}

bool IsAvailable() {
    if (!g_bInitialized) {
        Initialize();
    }
    return g_bInitialized;
}

void Shutdown() {
    g_bInitialized = false;
}

// Shellcode for indirect syscall execution.
// MSVC x64 does not support inline assembly, so we dynamically generate
// a dispatcher stub that shuffles the C calling convention arguments
// into the Windows syscall convention, loads SSN into EAX, sets R10=RCX,
// and jumps to the 'syscall' instruction inside legitimate ntdll code.

static PVOID GetDispatcherStub() {
    static PVOID pDispatcher = nullptr;
    if (!pDispatcher) {
        pDispatcher = VirtualAlloc(NULL, 0x1000, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
        if (pDispatcher) {
            // Dispatcher calling convention:
            //   NTSTATUS Dispatch(SSN, Addr, Arg1, Arg2, Arg3, Arg4, Arg5...)
            //   RCX = SSN (system service number)
            //   RDX = Addr (address of 'syscall' gadget in ntdll)
            //   R8  = Arg1 -> goes to RCX for the actual syscall
            //   R9  = Arg2 -> goes to RDX for the actual syscall
            //   [RSP+0x28] = Arg3  -> goes to R8
            //   [RSP+0x30] = Arg4  -> goes to R9
            //   [RSP+0x38] = Arg5  -> goes to [RSP+0x28]
            //   [RSP+0x40] = Arg6  -> goes to [RSP+0x30]
            //   ... and so on
            BYTE stub[] = {
                // Save SSN and target address from the first two register args
                0x48, 0x89, 0x4C, 0x24, 0x08,       // mov [rsp+08h], rcx   ; save SSN
                0x48, 0x89, 0x54, 0x24, 0x10,       // mov [rsp+10h], rdx   ; save Addr

                // Shuffle API arguments: r8->rcx, r9->rdx, stack down by 2 slots
                0x49, 0x8B, 0xC8,                   // mov rcx, r8          ; Arg1 -> rcx
                0x49, 0x8B, 0xD1,                   // mov rdx, r9          ; Arg2 -> rdx
                0x4C, 0x8B, 0x44, 0x24, 0x28,       // mov r8,  [rsp+28h]   ; Arg3 -> r8
                0x4C, 0x8B, 0x4C, 0x24, 0x30,       // mov r9,  [rsp+30h]   ; Arg4 -> r9

                // Shift remaining stack arguments down by 2 slots (16 bytes)
                0x48, 0x8B, 0x44, 0x24, 0x38,       // mov rax, [rsp+38h]
                0x48, 0x89, 0x44, 0x24, 0x28,       // mov [rsp+28h], rax   ; Arg5
                0x48, 0x8B, 0x44, 0x24, 0x40,       // mov rax, [rsp+40h]
                0x48, 0x89, 0x44, 0x24, 0x30,       // mov [rsp+30h], rax   ; Arg6
                0x48, 0x8B, 0x44, 0x24, 0x48,       // mov rax, [rsp+48h]
                0x48, 0x89, 0x44, 0x24, 0x38,       // mov [rsp+38h], rax   ; Arg7
                0x48, 0x8B, 0x44, 0x24, 0x50,       // mov rax, [rsp+50h]
                0x48, 0x89, 0x44, 0x24, 0x40,       // mov [rsp+40h], rax   ; Arg8
                0x48, 0x8B, 0x44, 0x24, 0x58,       // mov rax, [rsp+58h]
                0x48, 0x89, 0x44, 0x24, 0x48,       // mov [rsp+48h], rax   ; Arg9
                0x48, 0x8B, 0x44, 0x24, 0x60,       // mov rax, [rsp+50h]
                0x48, 0x89, 0x44, 0x24, 0x50,       // mov [rsp+50h], rax   ; Arg10
                0x48, 0x8B, 0x44, 0x24, 0x68,       // mov rax, [rsp+58h]
                0x48, 0x89, 0x44, 0x24, 0x58,       // mov [rsp+58h], rax   ; Arg11

                // Set up syscall: mov r10, rcx (Windows syscall convention)
                0x4C, 0x8B, 0xD1,                   // mov r10, rcx

                // Load SSN into eax
                0x8B, 0x44, 0x24, 0x08,             // mov eax, dword ptr [rsp+08h] ; SSN

                // Load target 'syscall' gadget address into r11 and jump
                0x4C, 0x8B, 0x5C, 0x24, 0x10,       // mov r11, [rsp+10h]  ; Addr
                0x41, 0xFF, 0xE3                    // jmp r11             ; -> syscall; ret
            };

            memcpy(pDispatcher, stub, sizeof(stub));
            DWORD oldProtect;
            VirtualProtect(pDispatcher, 0x1000, PAGE_EXECUTE_READ, &oldProtect);
        }
    }
    return pDispatcher;
}

// Function pointer typedef for our generated stub
typedef NTSTATUS(NTAPI* pfnSyscallDispatcher)(DWORD ssn, PVOID addr, ...);

NTSTATUS IndirectNtAllocateVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _In_ ULONG_PTR ZeroBits,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG AllocationType,
    _In_ ULONG Protect)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtAllocateVirtualMemory.pAddress) return -1;
    return dispatcher(g_Syscall_NtAllocateVirtualMemory.wSystemCall, 
                      g_Syscall_NtAllocateVirtualMemory.pAddress,
                      ProcessHandle, BaseAddress, ZeroBits, RegionSize, AllocationType, Protect);
}

NTSTATUS IndirectNtWriteVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _In_ PVOID BaseAddress,
    _In_ PVOID Buffer,
    _In_ SIZE_T NumberOfBytesToWrite,
    _Out_opt_ PSIZE_T NumberOfBytesWritten)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtWriteVirtualMemory.pAddress) return -1;
    return dispatcher(g_Syscall_NtWriteVirtualMemory.wSystemCall,
                      g_Syscall_NtWriteVirtualMemory.pAddress,
                      ProcessHandle, BaseAddress, Buffer, NumberOfBytesToWrite, NumberOfBytesWritten);
}

NTSTATUS IndirectNtProtectVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG NewProtect,
    _Out_ PULONG OldProtect)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtProtectVirtualMemory.pAddress) return -1;
    return dispatcher(g_Syscall_NtProtectVirtualMemory.wSystemCall,
                      g_Syscall_NtProtectVirtualMemory.pAddress,
                      ProcessHandle, BaseAddress, RegionSize, NewProtect, OldProtect);
}

NTSTATUS IndirectNtFreeVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG FreeType)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtFreeVirtualMemory.pAddress) return -1;
    return dispatcher(g_Syscall_NtFreeVirtualMemory.wSystemCall,
                      g_Syscall_NtFreeVirtualMemory.pAddress,
                      ProcessHandle, BaseAddress, RegionSize, FreeType);
}

NTSTATUS IndirectNtCreateThreadEx(
    _Out_ PHANDLE ThreadHandle,
    _In_ ACCESS_MASK DesiredAccess,
    _In_opt_ PVOID ObjectAttributes,
    _In_ HANDLE ProcessHandle,
    _In_ PVOID StartRoutine,
    _In_opt_ PVOID Argument,
    _In_ ULONG CreateFlags,
    _In_ SIZE_T ZeroBits,
    _In_ SIZE_T StackSize,
    _In_ SIZE_T MaximumStackSize,
    _In_opt_ PVOID AttributeList)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtCreateThreadEx.pAddress) return -1;
    return dispatcher(g_Syscall_NtCreateThreadEx.wSystemCall,
                      g_Syscall_NtCreateThreadEx.pAddress,
                      ThreadHandle, DesiredAccess, ObjectAttributes, ProcessHandle, StartRoutine, 
                      Argument, CreateFlags, ZeroBits, StackSize, MaximumStackSize, AttributeList);
}

NTSTATUS IndirectNtQueueApcThread(
    _In_ HANDLE ThreadHandle,
    _In_ PVOID ApcRoutine,
    _In_opt_ PVOID ApcArgument1,
    _In_opt_ PVOID ApcArgument2,
    _In_opt_ PVOID ApcArgument3)
{
    pfnSyscallDispatcher dispatcher = (pfnSyscallDispatcher)GetDispatcherStub();
    if (!dispatcher || !g_Syscall_NtQueueApcThread.pAddress) return -1;
    return dispatcher(g_Syscall_NtQueueApcThread.wSystemCall,
                      g_Syscall_NtQueueApcThread.pAddress,
                      ThreadHandle, ApcRoutine, ApcArgument1, ApcArgument2, ApcArgument3);
}

}  // namespace IndirectSyscall

#else // !defined(_WIN64)

namespace IndirectSyscall {
bool Initialize() { return false; }
bool IsAvailable() { return false; }
void Shutdown() {}
NTSTATUS IndirectNtAllocateVirtualMemory(HANDLE, PVOID*, ULONG_PTR, PSIZE_T, ULONG, ULONG) { return -1; }
NTSTATUS IndirectNtWriteVirtualMemory(HANDLE, PVOID, PVOID, SIZE_T, PSIZE_T) { return -1; }
NTSTATUS IndirectNtProtectVirtualMemory(HANDLE, PVOID*, PSIZE_T, ULONG, PULONG) { return -1; }
NTSTATUS IndirectNtFreeVirtualMemory(HANDLE, PVOID*, PSIZE_T, ULONG) { return -1; }
NTSTATUS IndirectNtCreateThreadEx(PHANDLE, ACCESS_MASK, PVOID, HANDLE, PVOID, PVOID, ULONG, SIZE_T, SIZE_T, SIZE_T, PVOID) { return -1; }
NTSTATUS IndirectNtQueueApcThread(HANDLE, PVOID, PVOID, PVOID, PVOID) { return -1; }
}

#endif // _WIN64
