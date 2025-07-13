#include <windows.h>
#include <iostream>
#include <thread>
#include <chrono>
#include <cmath>
#include <cstdlib>

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 3) {
        std::cout << "Usage: moveMouse.exe <x> <y> [click]" << std::endl;
        return 1;
    }

    bool doClick = (argc >= 4) && (std::string(argv[3]) == "click");

    int targetX = std::atoi(argv[1]);
    int targetY = std::atoi(argv[2]);

    POINT p;
    if (GetCursorPos(&p)) {
        int startX = p.x;
        int startY = p.y;

        int controlX = (startX + targetX) / 2 + rand() % 100 - 50;
        int controlY = (startY + targetY) / 2 - 200;

        int steps = 10;
        int delayMs = 1;

        for (int i = 0; i <= steps; ++i) {
            if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
                std::cout << "Escape key pressed. Exiting early." << std::endl;
                return 0;
            }

            double t = static_cast<double>(i) / steps;
            double x = std::pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + std::pow(t, 2) * targetX;
            double y = std::pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + std::pow(t, 2) * targetY;

            SetCursorPos(static_cast<int>(x), static_cast<int>(y));
            std::this_thread::sleep_for(std::chrono::milliseconds(delayMs));
        }
    }

    if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
        std::cout << "Escape key pressed before click. Exiting early." << std::endl;
        return 0;
    }

    if (doClick) {
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }

    return 0;
}
