#include <windows.h>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <algorithm>
#include <regex>

struct OCRWord {
    std::string text;
    int x1, y1, x2, y2;
};

std::string toLower(const std::string& s) {
    std::string out;
    for (char c : s) out += std::tolower(c);
    return out;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();
    _putenv("TESSDATA_PREFIX=C:\\msys64\\ucrt64\\share\\tessdata\\");

    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <word1> <word2> ...\n";
        return 1;
    }

    std::string imagePath = "templates/applicant-amount.png";

    Pix* image = pixRead(imagePath.c_str());
    if (!image) {
        std::cerr << "Failed to load image.\n";
        return 1;
    }

    tesseract::TessBaseAPI* api = new tesseract::TessBaseAPI();
    if (api->Init(NULL, "eng")) {
        std::cerr << "Could not initialize tesseract.\n";
        return 1;
    }

    api->SetImage(image);
    api->Recognize(0);

    tesseract::ResultIterator* ri = api->GetIterator();
    tesseract::PageIteratorLevel level = tesseract::RIL_WORD;

    std::vector<OCRWord> words;

    if (ri != nullptr) {
        do {
            const char* word = ri->GetUTF8Text(level);
            int x1, y1, x2, y2;
            if (word != nullptr) {
                ri->BoundingBox(level, &x1, &y1, &x2, &y2);
                words.push_back({ word, x1, y1, x2, y2 });
                delete[] word;
            }
        } while (ri->Next(level));
    }

    bool anyMatchFound = false;

    for (int i = 1; i < argc; ++i) {
        std::string searchWord = argv[i];
        bool matchFound = false;

        for (const auto& w : words) {
            if (toLower(w.text).find(toLower(searchWord)) != std::string::npos) {
                matchFound = true;
                anyMatchFound = true;

                std::cout << "\n🔍 Searching for: " << searchWord << "\n";
                std::cout << "Found word: " << w.text << "\n";
                std::cout << "Bounding box: (" << w.x1 << ", " << w.y1 << ") -> (" << w.x2 << ", " << w.y2 << ")\n";
                tesseract::ResultIterator* lineIt = api->GetIterator();
                if (lineIt != nullptr) {
                    do {
                        const char* wordText = lineIt->GetUTF8Text(tesseract::RIL_WORD);
                        int lx1, ly1, lx2, ly2;
                        lineIt->BoundingBox(tesseract::RIL_WORD, &lx1, &ly1, &lx2, &ly2);

                        if (wordText &&
                            lx1 == w.x1 && ly1 == w.y1 && lx2 == w.x2 && ly2 == w.y2) {

                            const char* lineText = lineIt->GetUTF8Text(tesseract::RIL_TEXTLINE);
                            std::string lineStr = lineText ? lineText : "[unreadable]";
                            std::cout << "-> Line: " << lineStr << "\n";
                            std::regex numberRegex(R"(\d[\d,\.]*[+%]?)");
                            std::sregex_iterator numbersBegin(lineStr.begin(), lineStr.end(), numberRegex);
                            std::sregex_iterator numbersEnd;

                            size_t bestPos = std::string::npos;
                            std::string bestNumber;
                            size_t wordPos = lineStr.find(w.text);

                            for (auto it = numbersBegin; it != numbersEnd; ++it) {
                                size_t numberPos = lineStr.find(it->str());
                                if (numberPos != std::string::npos) {
                                    size_t distance = std::abs((int)(numberPos - wordPos));
                                    if (bestPos == std::string::npos || distance < std::abs((int)(bestPos - wordPos))) {
                                        bestPos = numberPos;
                                        bestNumber = it->str();
                                    }
                                }
                            }

                            if (!bestNumber.empty()) {
                                std::cout << "-> Number in line: " << bestNumber << "\n";
                            }

                            delete[] lineText;
                        }

                        delete[] wordText;
                    } while (lineIt->Next(tesseract::RIL_WORD));
                }

                break;
            }
        }

        if (!matchFound) {
            std::cout << "\n🔍 Searching for: " << searchWord << "\n";
            std::cout << "No match found for \"" << searchWord << "\"\n";
        }
    }

    api->End();
    pixDestroy(&image);
    return 0;
}
