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

struct LineInfo {
    std::string text;
    std::vector<OCRWord> words;
};

std::string toLower(const std::string& s) {
    std::string out;
    for (char c : s) out += std::tolower(c);
    return out;
}

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

    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <imagePath> <word1> <word2> ...\n";
        return 1;
    }

    std::string imagePath = argv[1];

    Pix* image = pixRead(imagePath.c_str());
    if (!image) {
        std::cerr << "Failed to load image: " << imagePath << "\n";
        return 1;
    }

    tesseract::TessBaseAPI* api = new tesseract::TessBaseAPI();
    if (api->Init(NULL, "eng")) {
        std::cerr << "Could not initialize tesseract.\n";
        return 1;
    }

    api->SetVariable("preserve_interword_spaces", "1");
    api->SetImage(image);
    api->Recognize(0);

    std::vector<LineInfo> lines;
    tesseract::ResultIterator* it = api->GetIterator();
    if (it != nullptr) {
        do {
            const char* lineText = it->GetUTF8Text(tesseract::RIL_TEXTLINE);
            if (!lineText) continue;

            LineInfo line;
            line.text = std::string(lineText);
            delete[] lineText;

            do {
                const char* wordText = it->GetUTF8Text(tesseract::RIL_WORD);
                int x1, y1, x2, y2;
                it->BoundingBox(tesseract::RIL_WORD, &x1, &y1, &x2, &y2);

                if (wordText) {
                    line.words.push_back({ wordText, x1, y1, x2, y2 });
                    delete[] wordText;
                }

            } while (it->Next(tesseract::RIL_WORD) && !it->IsAtBeginningOf(tesseract::RIL_TEXTLINE));

            lines.push_back(line);
        } while (it->Next(tesseract::RIL_TEXTLINE));
    }

    std::cout << "{\n";

    for (int i = 2; i < argc; ++i) {
        std::string searchWord = argv[i];
        bool matchFound = false;

        for (const auto& line : lines) {
            for (const auto& word : line.words) {
                if (toLower(word.text).find(toLower(searchWord)) != std::string::npos) {
                    matchFound = true;
                    std::string bestNumber;
                    std::regex numberRegex(R"(\d[\d,\.]*[+%]?)");
                    std::sregex_iterator numbersBegin(line.text.begin(), line.text.end(), numberRegex);
                    std::sregex_iterator numbersEnd;

                    size_t bestPos = std::string::npos;
                    size_t wordPos = line.text.find(word.text);

                    for (auto it = numbersBegin; it != numbersEnd; ++it) {
                        size_t numberPos = line.text.find(it->str());
                        if (numberPos != std::string::npos) {
                            size_t distance = std::abs((int)(numberPos - wordPos));
                            if (bestPos == std::string::npos || distance < std::abs((int)(bestPos - wordPos))) {
                                bestPos = numberPos;
                                bestNumber = it->str();
                            }
                        }
                    }

                    std::cout << "  \"" << searchWord << "\": {\n";
                    std::cout << "    \"found\": true,\n";
                    std::cout << "    \"boundingBox\": [{\"x\": " << word.x1 << ", \"y\": " << word.y1
                              << "}, {\"x\": " << word.x2 << ", \"y\": " << word.y2 << "}],\n";
                    std::cout << "    \"line\": \"" << escapeQuotes(line.text) << "\",\n";
                    std::cout << "    \"number\": " << (bestNumber.empty() ? "null" : ("\"" + bestNumber + "\"")) << "\n";
                    std::cout << "  }";
                    goto EndMatchLoop;
                }
            }
        }

    EndMatchLoop:
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
