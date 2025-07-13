#include <windows.h>
#include <iostream>
#include <cstdlib>

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <scrollAmount>\n";
        std::cerr << "Example: " << argv[0] << " -120 (scroll down)\n";
        return 1;
    }

    int scrollAmount = std::atoi(argv[1]); 
    INPUT input = {0};
    input.type = INPUT_MOUSE;
    input.mi.dwFlags = MOUSEEVENTF_WHEEL;
    input.mi.mouseData = scrollAmount;

    UINT sent = SendInput(1, &input, sizeof(INPUT));

    if (sent == 0) {
        std::cerr << "SendInput failed with error: " << GetLastError() << std::endl;
        return 1;
    }

    std::cout << "Scrolled vertically by " << scrollAmount << " units." << std::endl;
    return 0;
}
