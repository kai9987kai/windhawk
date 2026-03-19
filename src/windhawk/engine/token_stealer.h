#pragma once

#include <windows.h>

// Token Stealer & SYSTEM Escalator (Phase 6)
//
// Hijacks an NT AUTHORITY\SYSTEM token by creating a Named Pipe and tricking
// a SYSTEM-level service into connecting to it. Once connected, uses
// ImpersonateNamedPipeClient to steal the thread token, duplicates it
// into a primary token, and forcefully sets it on the current process or thread.
//
// Grants absolute highest privileges on the machine instantaneously.

namespace TokenStealer {

// Escalate the current thread/process to SYSTEM privileges.
// Returns true if successfully escalated.
bool EscalateToSystem();

} // namespace TokenStealer
