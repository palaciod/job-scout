#include <windows.h>
#include <winhttp.h>
#include <iostream>
#include <string>

#pragma comment(lib, "winhttp.lib")

std::wstring stringToWstring(const std::string& str) {
    int size_needed = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, NULL, 0);
    std::wstring result(size_needed, 0);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], size_needed);
    return result;
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

void postToAPI(const std::string& text) {
    std::wstring host = L"localhost";
    std::wstring path = L"/jobs/dump-job";
    std::string json = "{\"text\": \"" + text + "\"}";
    std::wstring jsonW = stringToWstring(json);

    HINTERNET hSession = WinHttpOpen(L"ClipboardUploader/1.0", WINHTTP_ACCESS_TYPE_NO_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
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

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", path.c_str(), NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
    if (!hRequest) {
        std::cerr << "Failed to open request handle.\n";
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return;
    }

    std::wstring headers = L"Content-Type: application/json\r\n";
    BOOL sent = WinHttpSendRequest(hRequest, headers.c_str(), -1, (LPVOID)jsonW.c_str(), jsonW.length() * sizeof(wchar_t), jsonW.length() * sizeof(wchar_t), 0);

    if (!sent) {
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
