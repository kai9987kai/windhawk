#pragma once

#include <windows.h>

// Syscall Encryptor (2025 technique)
//
// Encrypts syscall stubs in memory when not in use, decrypts them
// just before execution, and re-encrypts immediately after. This
// prevents memory scanners from identifying syscall patterns in
// the injected payload's memory.
//
// Uses a simple XOR cipher with a random key generated at runtime.

namespace SyscallEncrypt {

// Initialize with a random encryption key.
bool Initialize();

// Encrypt a memory region containing syscall stubs.
// Stores the region info for later decryption.
bool EncryptRegion(void* pRegion, size_t size);

// Temporarily decrypt a region for execution, then re-encrypt.
// The callback is executed while the region is decrypted.
bool ExecuteDecrypted(void* pRegion, void (*callback)(void* ctx), void* ctx);

// Permanently decrypt a region (for cleanup).
bool DecryptRegion(void* pRegion);

// Get the current encryption key (for debugging).
DWORD GetKey();

} // namespace SyscallEncrypt
