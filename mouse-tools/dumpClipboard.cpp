#include <windows.h>
#include <winhttp.h>
#include <iostream>
#include <string>
#include <sstream>

#pragma comment(lib, "winhttp.lib")

std::string escapeJson(const std::string& input) {
    std::ostringstream ss;
    for (char c : input) {
        switch (c) {
            case '\"': ss << "\\\""; break;
            case '\\': ss << "\\\\"; break;
            case '\b': ss << "\\b"; break;
            case '\f': ss << "\\f"; break;
            case '\n': ss << "\\n"; break;
            case '\r': ss << "\\r"; break;
            case '\t': ss << "\\t"; break;
            default:
                if ('\x00' <= c && c <= '\x1f') {
                    ss << "\\u" << std::hex << std::uppercase << (int)c;
                } else {
                    ss << c;
                }
        }
    }
    return ss.str();
}

std::string getClipboardText() {
    if (!OpenClipboard(nullptr)) return "";

    HANDLE hData = GetClipboardData(CF_TEXT);
    if (!hData) {
        CloseClipboard();
        return "";
    }

    char* pszText = static_cast<char*>(GlobalLock(hData));
    if (!pszText) {
        CloseClipboard();
        return "";
    }

    std::string text(pszText);
    GlobalUnlock(hData);
    CloseClipboard();
    return text;
}

void postToAPI(const std::string& rawText) {
    std::wstring host = L"localhost";
    std::wstring path = L"/jobs/dump-job";

    std::string escapedText = escapeJson(rawText);
    std::string json = "{\"text\":\"" + escapedText + "\"}";

    HINTERNET hSession = WinHttpOpen(L"ClipboardUploader/1.0",
        WINHTTP_ACCESS_TYPE_NO_PROXY,
        WINHTTP_NO_PROXY_NAME,
        WINHTTP_NO_PROXY_BYPASS, 0);

    if (!hSession) {
        std::cerr << "Failed to open HTTP session.\n";
        return;
    }

    HINTERNET hConnect = WinHttpConnect(hSession, host.c_str(), 3000, 0);
    if (!hConnect) {
        std::cerr << "Failed to connect to localhost:3000\n";
        WinHttpCloseHandle(hSession);
        return;
    }

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", path.c_str(),
        NULL, WINHTTP_NO_REFERER,
        WINHTTP_DEFAULT_ACCEPT_TYPES, 0);

    if (!hRequest) {
        std::cerr << "Failed to open request handle.\n";
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return;
    }

    std::wstring headers = L"Content-Type: application/json\r\n";

    BOOL bResults = WinHttpSendRequest(
        hRequest,
        headers.c_str(),
        -1,
        (LPVOID)json.c_str(),
        (DWORD)json.length(),
        (DWORD)json.length(),
        0);

    if (!bResults) {
        std::cerr << "Failed to send HTTP request.\n";
    } else {
        WinHttpReceiveResponse(hRequest, NULL);
        std::cout << "Clipboard data sent to API.\n";
    }

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
}

int main() {
    std::string text = getClipboardText();
    if (text.empty()) {
        std::cerr << "No text found in clipboard.\n";
        return 1;
    }

    postToAPI(text);
    return 0;
}
