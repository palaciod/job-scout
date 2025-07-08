#include <windows.h>
#include <iostream>
#include <thread>
#include <chrono>
#include <cstdlib>

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 4) {
        std::cout << "Usage: highlight.exe <targetX> <scrolls> <scrollAmount>" << std::endl;
        return 1;
    }

    int targetX = std::atoi(argv[1]);
    int scrolls = std::atoi(argv[2]);
    int scrollAmount = std::atoi(argv[3]);

    POINT start;
    if (!GetCursorPos(&start)) {
        std::cerr << "Failed to get cursor position." << std::endl;
        return 1;
    }

    // Click and hold
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    // Move to the targetX while keeping the same Y
    SetCursorPos(targetX, start.y);
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Scroll while holding click
    for (int i = 0; i < scrolls; ++i) {
        if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
            std::cout << "Escape key pressed. Exiting early." << std::endl;
            break;
        }

        mouse_event(MOUSEEVENTF_WHEEL, 0, 0, scrollAmount, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    // Release click
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);

    return 0;
}
