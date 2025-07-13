#include <windows.h>
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

void detectAndPrint(const cv::Mat& screenshot, const cv::Mat& targetTemplate) {
    cv::Mat result;
    cv::matchTemplate(screenshot, targetTemplate, result, cv::TM_CCOEFF_NORMED);

    double minVal, maxVal;
    cv::Point minLoc, maxLoc;
    cv::minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc);

    double threshold = 0.8;
    if (maxVal >= threshold) {
        int xStart = maxLoc.x;
        int yStart = maxLoc.y;
        int centerX = xStart + targetTemplate.cols / 2;
        int centerY = yStart + targetTemplate.rows / 2;
        std::cout << "{ \"x\": " << centerX
                  << ", \"y\": " << centerY
                  << ", \"xStart\": " << xStart
                  << ", \"yStart\": " << yStart
                  << " }" << std::endl;
    } else {
        std::cout << "{}" << std::endl;
    }
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    if (argc < 2) {
        std::cerr << "Usage: visualizer.exe <screenshotPath> [find-save | find-about]" << std::endl;
        return 1;
    }

    std::string screenshotPath = argv[1];
    std::string mode = (argc >= 3) ? argv[2] : "";

    bool findSave = (mode == "find-save");
    bool findAboutTheJob = (mode == "find-about");
    bool findMenu = (mode == "find-menu");
    bool findNext = (mode == "find-next");
    bool findFinalPage = (mode == "find-final-page");

    cv::Mat screenshot = cv::imread(screenshotPath);
    cv::Mat templateImg = cv::imread("templates/job-post-x.png");
    cv::Mat saveButtonTemplate = cv::imread("templates/save-button.png");
    cv::Mat aboutTheJobTemplate = cv::imread("templates/about-the-job.png");
    cv::Mat menuButtonTemplate = cv::imread("templates/menu-arrow.png");
    cv::Mat nextButtonTemplate = cv::imread("templates/next-button.png");
    cv::Mat finalPageSearchTemplate = cv::imread("templates/final-page-search.png");

    if (screenshot.empty() || finalPageSearchTemplate.empty() || nextButtonTemplate.empty() || templateImg.empty() || saveButtonTemplate.empty() || aboutTheJobTemplate.empty()) {
        std::cout << (findSave || findAboutTheJob ? "{}" : "[]") << std::endl;
        return -1;
    }

    if (findSave) {
        detectAndPrint(screenshot, saveButtonTemplate);
        return 0;
    }

    if (findAboutTheJob) {
        detectAndPrint(screenshot, aboutTheJobTemplate);
        return 0;
    }

    if (findMenu) {
        detectAndPrint(screenshot, menuButtonTemplate);
        return 0;
    }

    if (findNext) {
        detectAndPrint(screenshot, nextButtonTemplate);
        return 0;
    }
    if (findFinalPage){
        detectAndPrint(screenshot, finalPageSearchTemplate);
        return 0;
    }
    cv::Mat result;
    cv::matchTemplate(screenshot, templateImg, result, cv::TM_CCOEFF_NORMED);

    double threshold = 0.8;
    std::vector<cv::Point> matchPoints;

    while (true) {
        double minVal, maxVal;
        cv::Point minLoc, maxLoc;
        cv::minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc);

        if (maxVal >= threshold) {
            matchPoints.push_back(maxLoc);
            cv::rectangle(result, maxLoc,
                cv::Point(maxLoc.x + templateImg.cols, maxLoc.y + templateImg.rows),
                cv::Scalar(0), -1);
        } else {
            break;
        }
    }

    std::sort(matchPoints.begin(), matchPoints.end(), [](const cv::Point& a, const cv::Point& b) {
        return a.y < b.y;
    });

    std::vector<cv::Point> filteredPoints;
    int minDistance = templateImg.rows / 2;

    for (const auto& pt : matchPoints) {
        bool tooClose = false;
        for (const auto& kept : filteredPoints) {
            if (std::abs(pt.y - kept.y) < minDistance) {
                tooClose = true;
                break;
            }
        }
        if (!tooClose) {
            filteredPoints.push_back(pt);
        }
    }

    std::cout << "[";
    for (size_t i = 0; i < filteredPoints.size(); ++i) {
        int xStart = filteredPoints[i].x;
        int yStart = filteredPoints[i].y;
        int centerX = xStart + templateImg.cols / 2;
        int centerY = yStart + templateImg.rows / 2;

        std::cout << "{ \"x\": " << centerX
                  << ", \"y\": " << centerY
                  << ", \"xStart\": " << xStart
                  << ", \"yStart\": " << yStart
                  << " }";

        if (i != filteredPoints.size() - 1) std::cout << ",";
    }
    std::cout << "]" << std::endl;

    return 0;
}
