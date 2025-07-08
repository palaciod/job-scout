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

// Escape quotes, newlines, carriage returns
std::string escapeQuotes(const std::string& str) {
    std::string result;
    for (char c : str) {
        if (c == '"') result += "\\\"";
        else if (c == '\n') result += "\\n";
        else if (c == '\r') result += "\\r";
        else result += c;
    }
    return result;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();
    _putenv("TESSDATA_PREFIX=C:\\msys64\\ucrt64\\share\\tessdata\\");

    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <word1> <word2> ...\n";
        return 1;
    }

    std::string imagePath =  "screenshots/jobPost.bmp";

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

    std::cout << "{\n";

    for (int i = 1; i < argc; ++i) {
        std::string searchWord = argv[i];
        bool matchFound = false;

        for (const auto& w : words) {
            if (toLower(w.text).find(toLower(searchWord)) != std::string::npos) {
                matchFound = true;
                std::string foundLine;
                std::string bestNumber;

                tesseract::ResultIterator* lineIt = api->GetIterator();
                if (lineIt != nullptr) {
                    do {
                        const char* wordText = lineIt->GetUTF8Text(tesseract::RIL_WORD);
                        int lx1, ly1, lx2, ly2;
                        lineIt->BoundingBox(tesseract::RIL_WORD, &lx1, &ly1, &lx2, &ly2);

                        if (wordText && lx1 == w.x1 && ly1 == w.y1 && lx2 == w.x2 && ly2 == w.y2) {
                            const char* lineText = lineIt->GetUTF8Text(tesseract::RIL_TEXTLINE);
                            std::string lineStr = lineText ? lineText : "";
                            foundLine = lineStr;

                            std::regex numberRegex(R"(\d[\d,\.]*[+%]?)");
                            std::sregex_iterator numbersBegin(lineStr.begin(), lineStr.end(), numberRegex);
                            std::sregex_iterator numbersEnd;

                            size_t bestPos = std::string::npos;
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

                            delete[] lineText;
                        }

                        delete[] wordText;
                    } while (lineIt->Next(tesseract::RIL_WORD));
                }

                std::cout << "  \"" << searchWord << "\": {\n";
                std::cout << "    \"found\": true,\n";
                std::cout << "    \"boundingBox\": [{\"x\": " << w.x1 << ", \"y\": " << w.y1 << "}, {\"x\": " << w.x2 << ", \"y\": " << w.y2 << "}],\n";
                std::cout << "    \"line\": \"" << escapeQuotes(foundLine) << "\",\n";
                std::cout << "    \"number\": " << (bestNumber.empty() ? "null" : bestNumber) << "\n";
                std::cout << "  }";

                break;
            }
        }

        if (!matchFound) {
            std::cout << "  \"" << searchWord << "\": { \"found\": false }";
        }

        if (i < argc - 1) std::cout << ",\n";
        else std::cout << "\n";
    }

    std::cout << "}\n";

    api->End();
    pixDestroy(&image);
    return 0;
}
