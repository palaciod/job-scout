#include <windows.h>
#include <iostream>
#include <string>
#include <filesystem>
#include <sstream>

int Clamp(int val, int minVal, int maxVal) {
    return (val < minVal) ? minVal : (val > maxVal) ? maxVal : val;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 2) {
        std::cerr << "Usage: screenshot.exe <filename> [width height]\n";
        return 1;
    }

    std::string filename = argv[1];
    int captureWidth = 0;
    int captureHeight = 0;
    bool captureWholeScreen = true;

    if (argc >= 4) {
        captureWidth = std::stoi(argv[2]);
        captureHeight = std::stoi(argv[3]);
        captureWholeScreen = false;
    }

    std::string folder = "screenshots";
    std::string fullPath = folder + "\\" + filename + ".bmp";
    std::wstring widePath(fullPath.begin(), fullPath.end());
    std::filesystem::create_directory(folder);

    MONITORINFO monitorInfo = { sizeof(MONITORINFO) };
    HMONITOR hMonitor = MonitorFromWindow(NULL, MONITOR_DEFAULTTOPRIMARY);
    if (!GetMonitorInfo(hMonitor, &monitorInfo)) {
        std::cerr << "Failed to get monitor info.\n";
        return 1;
    }

    RECT rc = monitorInfo.rcMonitor;
    int monitorWidth = rc.right - rc.left;
    int monitorHeight = rc.bottom - rc.top;

    int captureX = rc.left;
    int captureY = rc.top;

    if (!captureWholeScreen) {
        POINT mousePos;
        if (!GetCursorPos(&mousePos)) {
            std::cerr << "Failed to get mouse position.\n";
            return 1;
        }
        captureX = mousePos.x;
        captureY = mousePos.y - captureHeight / 2;
        captureX = Clamp(captureX, rc.left, rc.right - captureWidth);
        captureY = Clamp(captureY, rc.top, rc.bottom - captureHeight);
    } else {
        captureWidth = monitorWidth;
        captureHeight = monitorHeight;
    }

    // Capture screen
    HDC hScreenDC = GetDC(NULL);
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);
    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, captureWidth, captureHeight);
    if (!hBitmap) {
        std::cerr << "Failed to create bitmap.\n";
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    SelectObject(hMemoryDC, hBitmap);
    BitBlt(hMemoryDC, 0, 0, captureWidth, captureHeight, hScreenDC, captureX, captureY, SRCCOPY);

    BITMAPFILEHEADER bmfHeader;
    BITMAPINFOHEADER bi;
    bi.biSize = sizeof(BITMAPINFOHEADER);
    bi.biWidth = captureWidth;
    bi.biHeight = -captureHeight;
    bi.biPlanes = 1;
    bi.biBitCount = 32;
    bi.biCompression = BI_RGB;
    bi.biSizeImage = captureWidth * 4 * captureHeight;
    bi.biXPelsPerMeter = 0;
    bi.biYPelsPerMeter = 0;
    bi.biClrUsed = 0;
    bi.biClrImportant = 0;

    DWORD dwBmpSize = bi.biSizeImage;
    HANDLE hDIB = GlobalAlloc(GHND, dwBmpSize);
    if (!hDIB) {
        std::cerr << "GlobalAlloc failed.\n";
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    char* lpbitmap = (char*)GlobalLock(hDIB);
    if (!lpbitmap) {
        std::cerr << "GlobalLock failed.\n";
        GlobalFree(hDIB);
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    GetDIBits(hMemoryDC, hBitmap, 0, (UINT)captureHeight, lpbitmap, (BITMAPINFO*)&bi, DIB_RGB_COLORS);

    HANDLE hFile = CreateFileW(widePath.c_str(), GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE) {
        std::cerr << "Failed to create file: " << fullPath << std::endl;
        GlobalUnlock(hDIB);
        GlobalFree(hDIB);
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    DWORD dwBytesWritten;
    bmfHeader.bfOffBits = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);
    bmfHeader.bfSize = dwBmpSize + bmfHeader.bfOffBits;
    bmfHeader.bfType = 0x4D42;

    WriteFile(hFile, (LPSTR)&bmfHeader, sizeof(BITMAPFILEHEADER), &dwBytesWritten, NULL);
    WriteFile(hFile, (LPSTR)&bi, sizeof(BITMAPINFOHEADER), &dwBytesWritten, NULL);
    WriteFile(hFile, lpbitmap, dwBmpSize, &dwBytesWritten, NULL);

    GlobalUnlock(hDIB);
    GlobalFree(hDIB);
    CloseHandle(hFile);
    DeleteObject(hBitmap);
    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);

    std::cout << "Screenshot saved to " << fullPath << std::endl;
    return 0;
}
