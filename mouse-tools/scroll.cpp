#include <windows.h>
#include <iostream>

int main() {
    SetProcessDPIAware();

    // Scroll direction: positive = up, negative = down
    int scrollAmount = -45;

    // Perform the scroll
    mouse_event(MOUSEEVENTF_WHEEL, 0, 0, scrollAmount, 0);

    std::cout << "Scrolled vertically by " << scrollAmount << " units." << std::endl;

    return 0;
}
