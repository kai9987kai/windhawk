#include "stdafx.h"
#include "sleep_obfuscate.h"
#include "logger.h"

namespace SleepObfuscate {

namespace {

DWORD g_xorKey = 0;
bool g_initialized = false;

void XorMemory(PBYTE data, size_t size, DWORD key) {
    PBYTE keyBytes = (PBYTE)&key;
    for (size_t i = 0; i < size; i++) {
        data[i] ^= keyBytes[i % sizeof(DWORD)];
    }
}

struct TimerContext {
    void* pRegion;
    size_t regionSize;
    DWORD xorKey;
    HANDLE hEvent;     // Signaled when encryption is done
    bool encrypt;      // true = encrypt, false = decrypt
};

void CALLBACK TimerCallback(PVOID lpParameter, BOOLEAN TimerOrWaitFired) {
    auto* ctx = reinterpret_cast<TimerContext*>(lpParameter);

    DWORD oldProtect = 0;
    VirtualProtect(ctx->pRegion, ctx->regionSize, PAGE_READWRITE, &oldProtect);
    XorMemory((PBYTE)ctx->pRegion, ctx->regionSize, ctx->xorKey);
    VirtualProtect(ctx->pRegion, ctx->regionSize, oldProtect, &oldProtect);

    SetEvent(ctx->hEvent);
}

} // namespace

bool Initialize() {
    if (g_initialized) return true;

    LARGE_INTEGER counter;
    QueryPerformanceCounter(&counter);
    g_xorKey = (DWORD)(counter.QuadPart ^ GetCurrentProcessId() ^
                       (GetCurrentThreadId() << 16));
    if (g_xorKey == 0) g_xorKey = 0xCAFEBABE;

    g_initialized = true;
    VERBOSE(L"SleepObfuscate: Initialized with key 0x%08X", g_xorKey);
    return true;
}

void ObfuscatedSleep(DWORD dwMilliseconds, void* pRegion, size_t regionSize) {
    if (!g_initialized) Initialize();
    if (!pRegion || regionSize == 0) {
        Sleep(dwMilliseconds);
        return;
    }

    // Step 1: Encrypt the memory region
    HANDLE hEncryptDone = CreateEventW(nullptr, TRUE, FALSE, nullptr);
    if (!hEncryptDone) {
        Sleep(dwMilliseconds);
        return;
    }

    TimerContext encCtx = { pRegion, regionSize, g_xorKey, hEncryptDone, true };

    HANDLE hTimerQueue = CreateTimerQueue();
    HANDLE hEncryptTimer = nullptr;

    // Schedule encryption immediately (0ms delay)
    CreateTimerQueueTimer(&hEncryptTimer, hTimerQueue, TimerCallback,
                          &encCtx, 0, 0, WT_EXECUTEONLYONCE);

    // Wait for encryption to complete
    WaitForSingleObject(hEncryptDone, INFINITE);
    CloseHandle(hEncryptDone);

    VERBOSE(L"SleepObfuscate: Memory encrypted, sleeping %ums", dwMilliseconds);

    // Step 2: Sleep with the memory encrypted
    Sleep(dwMilliseconds);

    // Step 3: Decrypt the memory region
    HANDLE hDecryptDone = CreateEventW(nullptr, TRUE, FALSE, nullptr);
    TimerContext decCtx = { pRegion, regionSize, g_xorKey, hDecryptDone, false };

    HANDLE hDecryptTimer = nullptr;
    CreateTimerQueueTimer(&hDecryptTimer, hTimerQueue, TimerCallback,
                          &decCtx, 0, 0, WT_EXECUTEONLYONCE);

    WaitForSingleObject(hDecryptDone, INFINITE);
    CloseHandle(hDecryptDone);

    // Cleanup timer queue
    DeleteTimerQueue(hTimerQueue);

    VERBOSE(L"SleepObfuscate: Memory decrypted, resuming execution");
}

bool IsAvailable() {
    // Available on all Windows versions that support timer queues
    return true;
}

} // namespace SleepObfuscate
