#pragma once

#include <windows.h>

// Perun's Fart Universal Unhooker (Phase 5)
//
// Instead of individually finding and fixing inline EDR hooks one by one, 
// this technique creates a new suspended dummy process (e.g. notepad.exe), 
// which forces the OS to map a clean, unhooked copy of ntdll.dll into the dummy.
// EDRs usually inject their hooking DLLs AFTER process creation, so the dummy's
// initially mapped ntdll.dll is pristine.
//
// The current process then reads the .text section from the dummy's ntdll,
// changes the memory protections of its own ntdll.dll, and overwrites it.
// All user-mode hooks are universally annihilated in one operation.

namespace PerunsFart {

// Universally unhook the current process's ntdll.dll by mapping
// a fresh copy from a suspended child process.
bool UnhookAll();

} // namespace PerunsFart
