#include <windows.h>
#include <iostream>
#include <string>
#include <filesystem>

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    // Set up target directory and filename
    std::string folder = "screenshots";
    std::string filename = (argc >= 2) ? argv[1] : "linkedInScreen";
    std::string fullPath = folder + "\\" + filename + ".bmp";

    // Ensure the folder exists
    std::filesystem::create_directory(folder);

    // Screen dimensions
    int screenWidth = GetSystemMetrics(SM_CXSCREEN);
    int screenHeight = GetSystemMetrics(SM_CYSCREEN);

    // Capture the screen
    HDC hScreenDC = GetDC(NULL);
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);
    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, screenWidth, screenHeight);
    SelectObject(hMemoryDC, hBitmap);
    BitBlt(hMemoryDC, 0, 0, screenWidth, screenHeight, hScreenDC, 0, 0, SRCCOPY);

    // Set up bitmap headers
    BITMAPFILEHEADER bmfHeader;
    BITMAPINFOHEADER bi;
    bi.biSize = sizeof(BITMAPINFOHEADER);
    bi.biWidth = screenWidth;
    bi.biHeight = -screenHeight;
    bi.biPlanes = 1;
    bi.biBitCount = 24;
    bi.biCompression = BI_RGB;
    bi.biSizeImage = 0;
    bi.biXPelsPerMeter = 0;
    bi.biYPelsPerMeter = 0;
    bi.biClrUsed = 0;
    bi.biClrImportant = 0;

    DWORD dwBmpSize = ((screenWidth * bi.biBitCount + 31) / 32) * 4 * screenHeight;
    HANDLE hDIB = GlobalAlloc(GHND, dwBmpSize);
    char* lpbitmap = (char*)GlobalLock(hDIB);

    GetDIBits(hMemoryDC, hBitmap, 0, (UINT)screenHeight, lpbitmap, (BITMAPINFO*)&bi, DIB_RGB_COLORS);

    std::wstring widePath(fullPath.begin(), fullPath.end());

    HANDLE hFile = CreateFileW(widePath.c_str(), GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE) {
        std::cerr << "Failed to create file: " << fullPath << std::endl;
        return 1;
    }

    DWORD dwSizeofDIB = dwBmpSize + sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);
    bmfHeader.bfOffBits = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);
    bmfHeader.bfSize = dwSizeofDIB;
    bmfHeader.bfType = 0x4D42;

    DWORD dwBytesWritten;
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
