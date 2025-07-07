#include <windows.h>
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

// Reusable helper for single-point detection and JSON output
void detectAndPrint(const cv::Mat& screenshot, const cv::Mat& targetTemplate) {
    cv::Mat result;
    cv::matchTemplate(screenshot, targetTemplate, result, cv::TM_CCOEFF_NORMED);

    double minVal, maxVal;
    cv::Point minLoc, maxLoc;
    cv::minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc);

    double threshold = 0.8;
    if (maxVal >= threshold) {
        int centerX = maxLoc.x + targetTemplate.cols / 2;
        int centerY = maxLoc.y + targetTemplate.rows / 2;
        std::cout << "{ \"x\": " << centerX << ", \"y\": " << centerY << " }" << std::endl;
    } else {
        std::cout << "{}" << std::endl;
    }
}

int main(int argc, char* argv[]) {
    SetProcessDPIAware();

    bool findSave = false;
    bool findAboutTheJob = false;

    if (argc == 2) {
        std::string arg = argv[1];
        if (arg == "find-save") {
            findSave = true;
        } else if (arg == "find-about") {
            findAboutTheJob = true;
        }
    }

    cv::Mat screenshot = cv::imread("linkedInScreen.bmp");
    cv::Mat templateImg = cv::imread("templates/job-post-exit.png");
    cv::Mat saveButtonTemplate = cv::imread("templates/save-button.png");
    cv::Mat aboutTheJobTemplate = cv::imread("templates/about-the-job.png");

    if (screenshot.empty() || templateImg.empty() || saveButtonTemplate.empty() || aboutTheJobTemplate.empty()) {
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

    // Default logic for detecting multiple job listings
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
        int centerX = filteredPoints[i].x + templateImg.cols / 2;
        int centerY = filteredPoints[i].y + templateImg.rows / 2;
        std::cout << "{ \"x\": " << centerX << ", \"y\": " << centerY << " }";
        if (i != filteredPoints.size() - 1) {
            std::cout << ",";
        }
    }
    std::cout << "]" << std::endl;

    return 0;
}
