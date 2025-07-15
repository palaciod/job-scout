#include <windows.h>
#include <UIAutomation.h>
#include <iostream>
#include <thread>
#include <chrono>
#include <cmath>
#include <cstdlib>

std::wstring getTextUnderCursor() {
    std::wstring result = L"";

    IUIAutomation* automation = nullptr;
    if (FAILED(CoCreateInstance(__uuidof(CUIAutomation), NULL, CLSCTX_INPROC_SERVER,
                                IID_PPV_ARGS(&automation)))) {
        return L"";
    }

    POINT pt;
    if (!GetCursorPos(&pt)) {
        automation->Release();
        return L"";
    }

    IUIAutomationElement* element = nullptr;
    if (FAILED(automation->ElementFromPoint(pt, &element)) || !element) {
        automation->Release();
        return L"";
    }

    BSTR name;
    if (SUCCEEDED(element->get_CurrentName(&name)) && name != nullptr) {
        result = name;
        SysFreeString(name);
    }

    IUIAutomationValuePattern* valuePattern = nullptr;
    if (SUCCEEDED(element->GetCurrentPatternAs(UIA_ValuePatternId, __uuidof(IUIAutomationValuePattern), (void**)&valuePattern))) {
        BSTR val;
        if (SUCCEEDED(valuePattern->get_CurrentValue(&val))) {
            result = val;
            SysFreeString(val);
        }
        valuePattern->Release();
    }

    element->Release();
    automation->Release();
    return result;
}

std::wstring escapeJson(const std::wstring& input) {
    std::wstring output;
    for (wchar_t c : input) {
        if (c == L'"') output += L"\\\"";
        else if (c == L'\\') output += L"\\\\";
        else output += c;
    }
    return output;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 3) {
        std::cout << "Usage: moveMouse.exe <x> <y> [click|copy]" << std::endl;
        return 1;
    }

    int targetX = std::atoi(argv[1]);
    int targetY = std::atoi(argv[2]);

    bool doClick = false;
    bool doCopy = false;

    if (argc >= 4) {
        std::string action = argv[3];
        if (action == "click") {
            doClick = true;
        } else if (action == "copy") {
            doCopy = true;
        } else {
            std::cout << "Invalid action. Use either 'click' or 'copy'." << std::endl;
            return 1;
        }
    }

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
        std::cout << "Escape key pressed before action. Exiting early." << std::endl;
        return 0;
    }

    if (doClick) {
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    } else if (doCopy) {
        CoInitialize(NULL);
        std::wstring text = getTextUnderCursor();
        CoUninitialize();

        std::wcout << L"{ \"jobUrl\": \"" << escapeJson(text) << L"\" }" << std::endl;
    }

    return 0;
}
