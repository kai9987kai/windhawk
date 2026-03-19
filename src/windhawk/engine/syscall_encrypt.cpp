#include "stdafx.h"
#include "syscall_encrypt.h"
#include "logger.h"
#include <vector>
#include <mutex>

namespace SyscallEncrypt {

namespace {

struct EncryptedRegion {
    void* address;
    size_t size;
    bool encrypted;
};

DWORD g_key = 0;
std::vector<EncryptedRegion> g_regions;
std::mutex g_mutex;
bool g_initialized = false;

void XorRegion(void* pRegion, size_t size, DWORD key) {
    PBYTE data = (PBYTE)pRegion;
    PBYTE keyBytes = (PBYTE)&key;
    for (size_t i = 0; i < size; i++) {
        data[i] ^= keyBytes[i % sizeof(DWORD)];
    }
}

EncryptedRegion* FindRegion(void* pRegion) {
    for (auto& r : g_regions) {
        if (r.address == pRegion) return &r;
    }
    return nullptr;
}

} // namespace

bool Initialize() {
    if (g_initialized) return true;

    // Generate a random key using RDTSC + process/thread IDs
    LARGE_INTEGER counter;
    QueryPerformanceCounter(&counter);
    g_key = (DWORD)(counter.QuadPart ^ GetCurrentProcessId() ^ GetCurrentThreadId());
    
    // Ensure key is never zero
    if (g_key == 0) g_key = 0xDEADBEEF;

    g_initialized = true;
    VERBOSE(L"SyscallEncrypt: Initialized with key 0x%08X", g_key);
    return true;
}

bool EncryptRegion(void* pRegion, size_t size) {
    if (!g_initialized) Initialize();
    std::lock_guard<std::mutex> lock(g_mutex);

    if (FindRegion(pRegion)) {
        LOG(L"SyscallEncrypt: Region at %p already registered", pRegion);
        return false;
    }

    // Make the region writable
    DWORD oldProtect = 0;
    if (!VirtualProtect(pRegion, size, PAGE_READWRITE, &oldProtect)) {
        LOG(L"SyscallEncrypt: VirtualProtect failed: %u", GetLastError());
        return false;
    }

    // XOR encrypt the region
    XorRegion(pRegion, size, g_key);

    // Restore protection (now non-executable while encrypted)
    VirtualProtect(pRegion, size, oldProtect, &oldProtect);

    EncryptedRegion region = { pRegion, size, true };
    g_regions.push_back(region);

    VERBOSE(L"SyscallEncrypt: Encrypted %zu bytes at %p", size, pRegion);
    return true;
}

bool ExecuteDecrypted(void* pRegion, void (*callback)(void* ctx), void* ctx) {
    if (!g_initialized) return false;
    std::lock_guard<std::mutex> lock(g_mutex);

    auto* region = FindRegion(pRegion);
    if (!region || !region->encrypted) return false;

    // Decrypt
    DWORD oldProtect = 0;
    VirtualProtect(pRegion, region->size, PAGE_EXECUTE_READWRITE, &oldProtect);
    XorRegion(pRegion, region->size, g_key);
    region->encrypted = false;

    // Execute callback
    callback(ctx);

    // Re-encrypt
    XorRegion(pRegion, region->size, g_key);
    VirtualProtect(pRegion, region->size, oldProtect, &oldProtect);
    region->encrypted = true;

    return true;
}

bool DecryptRegion(void* pRegion) {
    if (!g_initialized) return false;
    std::lock_guard<std::mutex> lock(g_mutex);

    auto* region = FindRegion(pRegion);
    if (!region || !region->encrypted) return false;

    DWORD oldProtect = 0;
    VirtualProtect(pRegion, region->size, PAGE_READWRITE, &oldProtect);
    XorRegion(pRegion, region->size, g_key);
    VirtualProtect(pRegion, region->size, oldProtect, &oldProtect);

    region->encrypted = false;
    VERBOSE(L"SyscallEncrypt: Permanently decrypted %zu bytes at %p",
            region->size, pRegion);
    return true;
}

DWORD GetKey() { return g_key; }

} // namespace SyscallEncrypt
