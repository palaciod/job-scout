#include <windows.h>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>
#include <opencv2/opencv.hpp>
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

Pix* mat8ToPix(const cv::Mat& mat) {
    Pix* pixs = pixCreate(mat.cols, mat.rows, 8);
    for (int y = 0; y < mat.rows; ++y) {
        for (int x = 0; x < mat.cols; ++x) {
            pixSetPixel(pixs, x, y, mat.at<uchar>(y, x));
        }
    }
    return pixs;
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();
    _putenv("TESSDATA_PREFIX=C:\\msys64\\ucrt64\\share\\tessdata\\");

    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <imagePath> <word1> <word2> ...\n";
        return 1;
    }

    std::string imagePath = argv[1];

    cv::Mat img = cv::imread(imagePath);
    if (img.empty()) {
        std::cerr << "Failed to load image: " << imagePath << "\n";
        return 1;
    }

    cv::Mat gray, thresh;
    cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);
    cv::resize(gray, gray, cv::Size(), 2.0, 2.0, cv::INTER_CUBIC);
    cv::adaptiveThreshold(gray, thresh, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 11, 2);

    Pix* image = mat8ToPix(thresh);
    if (!image) {
        std::cerr << "Failed to convert image to Pix.\n";
        return 1;
    }

    tesseract::TessBaseAPI* api = new tesseract::TessBaseAPI();
    if (api->Init(NULL, "eng", tesseract::OEM_LSTM_ONLY)) {
        std::cerr << "Could not initialize tesseract.\n";
        return 1;
    }

    api->SetPageSegMode(tesseract::PSM_SPARSE_TEXT);
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
    bool anyMatchFound = false;

    for (int i = 2; i < argc; ++i) {
        std::string searchWord = argv[i];
        bool matchFound = false;

        for (const auto& line : lines) {
            if (toLower(line.text).find(toLower(searchWord)) != std::string::npos) {
                const OCRWord* matchedWord = nullptr;

                for (const auto& word : line.words) {
                    if (toLower(word.text).find(toLower(searchWord)) != std::string::npos) {
                        matchedWord = &word;
                        break;
                    }
                }

                if (!matchedWord && !line.words.empty()) {
                    matchedWord = &line.words[0];
                }

                if (matchedWord) {
                    matchFound = true;
                    anyMatchFound = true;

                    std::string bestNumber;
                    std::regex numberRegex(R"(\d[\d,\.]*[+%]?)");
                    std::sregex_iterator numbersBegin(line.text.begin(), line.text.end(), numberRegex);
                    std::sregex_iterator numbersEnd;

                    size_t bestPos = std::string::npos;
                    size_t wordPos = line.text.find(searchWord);

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
                    std::cout << "    \"boundingBox\": [{\"x\": " << matchedWord->x1 << ", \"y\": " << matchedWord->y1
                              << "}, {\"x\": " << matchedWord->x2 << ", \"y\": " << matchedWord->y2 << "}],\n";
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
    if (!anyMatchFound) {
        std::cout << "\n[DEBUG] No matches found. Here’s everything Tesseract detected:\n";
        for (const auto& line : lines) {
            std::cout << "Line: " << escapeQuotes(line.text) << "\n";
            for (const auto& word : line.words) {
                std::cout << "  Word: " << word.text
                          << " [x1=" << word.x1 << ", y1=" << word.y1
                          << ", x2=" << word.x2 << ", y2=" << word.y2 << "]\n";
            }
        }
    }

    api->End();
    pixDestroy(&image);
    delete api;
    return 0;
}
