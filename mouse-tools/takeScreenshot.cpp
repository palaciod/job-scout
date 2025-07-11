#include <windows.h>
#include <png.h>
#include <vector>
#include <iostream>
#include <string>
#include <filesystem>
#include <sstream>
#include <cstdio>

int Clamp(int val, int minVal, int maxVal) {
    return (val < minVal) ? minVal : (val > maxVal) ? maxVal : val;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 2) {
        std::cerr << "Usage: screenshot.exe <filename> [x y]\n";
        return 1;
    }

    const int fixedWidth = 1000;
    const int fixedHeight = 500;

    std::string filename = argv[1];
    int captureX = 0;
    int captureY = 0;
    int captureWidth = fixedWidth;
    int captureHeight = fixedHeight;
    bool captureWholeScreen = true;

    MONITORINFO monitorInfo = { sizeof(MONITORINFO) };
    HMONITOR hMonitor = MonitorFromWindow(NULL, MONITOR_DEFAULTTOPRIMARY);
    if (!GetMonitorInfo(hMonitor, &monitorInfo)) {
        std::cerr << "Failed to get monitor info.\n";
        return 1;
    }

    RECT rc = monitorInfo.rcMonitor;
    int monitorWidth = rc.right - rc.left;
    int monitorHeight = rc.bottom - rc.top;

    if (argc >= 4) {
        captureWholeScreen = false;
        int inputX = std::stoi(argv[2]);
        int inputY = std::stoi(argv[3]);
        captureX = inputX;
        captureY = inputY - captureHeight;
        captureX = Clamp(captureX, rc.left, rc.right - captureWidth);
        captureY = Clamp(captureY, rc.top, rc.bottom - captureHeight);
    } else {
        captureX = rc.left;
        captureY = rc.top;
        captureWidth = monitorWidth;
        captureHeight = monitorHeight;
    }

    std::string folder = "screenshots";
    std::filesystem::create_directory(folder);
    std::string fullPath = folder + "\\" + filename + ".png";

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

    BITMAPINFOHEADER bi;
    bi.biSize = sizeof(BITMAPINFOHEADER);
    bi.biWidth = captureWidth;
    bi.biHeight = -captureHeight;
    bi.biPlanes = 1;
    bi.biBitCount = 32;
    bi.biCompression = BI_RGB;
    bi.biSizeImage = 0;
    bi.biXPelsPerMeter = 0;
    bi.biYPelsPerMeter = 0;
    bi.biClrUsed = 0;
    bi.biClrImportant = 0;

    int imageSize = captureWidth * captureHeight * 4;
    std::vector<unsigned char> pixels(imageSize);

    if (GetDIBits(hMemoryDC, hBitmap, 0, captureHeight, pixels.data(), (BITMAPINFO*)&bi, DIB_RGB_COLORS) == 0) {
        std::cerr << "Failed to get bitmap data.\n";
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    // Convert BGRA to RGBA
    for (int i = 0; i < imageSize; i += 4) {
        std::swap(pixels[i], pixels[i + 2]);
    }

    FILE* fp = fopen(fullPath.c_str(), "wb");
    if (!fp) {
        std::cerr << "Failed to open file for PNG output.\n";
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        return 1;
    }

    png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    png_infop info_ptr = png_create_info_struct(png_ptr);
    if (!png_ptr || !info_ptr) {
        std::cerr << "Failed to create PNG write struct.\n";
        fclose(fp);
        return 1;
    }

    if (setjmp(png_jmpbuf(png_ptr))) {
        std::cerr << "PNG write error.\n";
        png_destroy_write_struct(&png_ptr, &info_ptr);
        fclose(fp);
        return 1;
    }

    png_init_io(png_ptr, fp);
    png_set_IHDR(png_ptr, info_ptr, captureWidth, captureHeight,
                 8, PNG_COLOR_TYPE_RGBA, PNG_INTERLACE_NONE,
                 PNG_COMPRESSION_TYPE_BASE, PNG_FILTER_TYPE_BASE);
    png_write_info(png_ptr, info_ptr);

    std::vector<png_bytep> row_pointers(captureHeight);
    for (int y = 0; y < captureHeight; ++y) {
        row_pointers[y] = pixels.data() + y * captureWidth * 4;
    }

    png_write_image(png_ptr, row_pointers.data());
    png_write_end(png_ptr, NULL);

    png_destroy_write_struct(&png_ptr, &info_ptr);
    fclose(fp);

    std::cout << "Screenshot saved to " << fullPath << std::endl;

    DeleteObject(hBitmap);
    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);

    return 0;
}
