#include <windows.h>
#include <iostream>
#include <fstream>

int main() {
    if (!RegisterHotKey(NULL, 1, 0, VK_ESCAPE)) {
        std::cerr << "Failed to register global Esc key hotkey." << std::endl;
        return 1;
    }

    std::cout << "Global Esc key listener running. Press Esc to trigger stop.txt." << std::endl;

    MSG msg = { 0 };
    while (GetMessage(&msg, NULL, 0, 0)) {
        if (msg.message == WM_HOTKEY && msg.wParam == 1) {
            std::cout << "Esc key detected. Creating stop.txt..." << std::endl;

            std::ofstream stopFile("stop.txt");
            stopFile << "Stop triggered" << std::endl;
            stopFile.close();

            break;
        }
    }

    UnregisterHotKey(NULL, 1);
    return 0;
}
