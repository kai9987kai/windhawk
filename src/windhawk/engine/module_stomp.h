#pragma once

#include <windows.h>
#include <string>

namespace ModuleStomp {

// Load a legit Windows DLL into the target process and return its base address.
// This memory will be used to "stomp" our payload into.
void* LoadStompTarget(HANDLE hProcess, const std::wstring& dllName);

} // namespace ModuleStomp
