# Job Scout 🕵️‍♂️

An intelligent automated job discovery and evaluation system for LinkedIn. Job Scout automatically scans through job postings, filters promising opportunities, and uses AI to evaluate how well they match your profile - saving you hours of manual job searching.

## 🎯 What It Does

Job Scout **does not apply to jobs automatically**. Instead, it:

- 🔍 **Discovers Jobs**: Automatically navigates LinkedIn job search results
- 🎯 **Smart Filtering**: Applies initial criteria (fewer than 100 applicants, avoids low-quality job boards)
- 📋 **Data Extraction**: Captures full job descriptions for promising opportunities
- 🤖 **AI Evaluation**: Uses local LLM to assess job fit based on your profile
- 📊 **Structured Results**: Saves all evaluations in organized format for easy review

## 🏗️ Architecture

The system consists of three main components:

### 1. Scout Bot (`scout-bot/`)
- Node.js automation script that controls the entire workflow
- Orchestrates screenshot capture, computer vision, and job evaluation
- Handles LinkedIn page navigation and data extraction

### 2. Mouse Tools (`mouse-tools/`)
- Collection of C++ utilities for browser automation:
  - **Screenshot capture** - Captures specific screen regions
  - **Mouse movement** - Smooth cursor automation with safety controls
  - **Text highlighting** - Automatic text selection and copying
  - **OCR detection** - Finds text in images using Tesseract
  - **Template matching** - Computer vision to locate UI elements
  - **Scrolling** - Programmatic page navigation

### 3. Job Evaluation Server (`job-scout-app/server/`)
- Express.js API server for job analysis
- Integrates with local LLM (LM Studio) for intelligent evaluation
- Provides structured job data extraction and fit assessment

## 🚀 Setup

### Prerequisites

- **Node.js** (v16+)
- **MSYS2** with development tools
- **LM Studio** with a language model (e.g., Llama3-8b)
- **Dependencies**: OpenCV, Tesseract OCR, libpng

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-scout
   ```

2. **Install Node.js dependencies**
   ```bash
   # Scout bot
   cd scout-bot
   npm install
   
   # Job evaluation server
   cd ../job-scout-app/server
   npm install
   ```

3. **Setup MSYS2 and C++ dependencies**
   ```bash
   # Install OpenCV, Tesseract, and other dependencies via MSYS2
   pacman -S mingw-w64-ucrt-x86_64-opencv
   pacman -S mingw-w64-ucrt-x86_64-tesseract-ocr
   pacman -S mingw-w64-ucrt-x86_64-libpng
   ```

4. **Setup LM Studio**
   - Install [LM Studio](https://lmstudio.ai/)
   - Download a model (recommended: Llama3-8b)
   - Start the local server on `http://127.0.0.1:1234`

5. **Build mouse tools**
   ```bash
   cd mouse-tools
   # Tools will auto-build when first run
   ```

## 🎮 Usage

### 1. Start the Job Evaluation Server
```bash
cd job-scout-app/server
npm run dev
```

### 2. Setup LinkedIn Job Search
- Open LinkedIn in your browser
- Navigate to your desired job search results page
- Position the window where the bot can capture it

### 3. Run the Scout Bot
```bash
cd scout-bot
npm run dev
```

### 4. Safety Controls
- **Press ESC** at any time to stop the bot immediately
- The bot includes built-in escape detection for safe operation

## ⚙️ Configuration

### Job Filtering Criteria

The bot applies several filters to focus on quality opportunities:

- **Applicant Count**: Prefers jobs with < 100 applicants
- **Company Blocklist**: Avoids known low-quality job boards:
  - Jobright.ai, Wiraa, Lensa
  - Generic "hours", "United States", "people" postings

### Profile Configuration

Currently optimized for a **full-stack developer with 4 years experience** in:
- JavaScript, Python, Node.js, AWS

To customize for your profile, edit the `systemPrompt` in:
`job-scout-app/server/controllers/jobs/index.js`

## 📊 Output

### Job Evaluation Data

Each processed job is saved to `job-descriptions/parsed-jobs.json` with:

```json
{
  "timestamp": "2025-07-13T...",
  "job": {
    "title": "Senior Full Stack Developer",
    "company": "TechCorp Inc.",
    "technologies": ["React", "Node.js", "AWS"],
    "experienceLevel": "Mid",
    "remote": true,
    "summary": "Building scalable web applications...",
    "applicantCount": 45,
    "entryLevelPercent": 30,
    "seniorLevelPercent": 25,
    "yearsRequired": 3,
    "fit": "Yes",
    "reason": "Strong match for React/Node.js experience..."
  }
}
```

## 🛠️ Technical Details

### Computer Vision
- Uses OpenCV for template matching to find UI elements
- Tesseract OCR for text extraction from job postings
- Robust handling of different screen resolutions and layouts

### Safety Features
- Global escape key listener for immediate stop
- Smooth mouse movements to avoid detection
- Error handling and retry logic for robustness

### LLM Integration
- Connects to local LM Studio instance
- Structured prompting for consistent job evaluation
- JSON parsing with error handling

## 🎯 Use Cases

- **Job Market Research**: Analyze trends in job requirements and compensation
- **Opportunity Discovery**: Find jobs you might have missed in manual searches
- **Fit Assessment**: Get AI-powered evaluation of job compatibility
- **Time Saving**: Process hundreds of jobs in the time it takes to manually review dozens

## ⚠️ Important Notes

- **LinkedIn ToS**: Be aware of LinkedIn's terms of service regarding automation
- **Rate Limiting**: The bot includes delays to avoid overwhelming LinkedIn's servers  
- **Manual Review**: Always manually review AI-recommended jobs before applying
- **Local Processing**: All job data processing happens locally for privacy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenCV for computer vision capabilities
- Tesseract for OCR functionality
- LM Studio for local LLM hosting
- The open-source community for various tools and libraries

---

**Disclaimer**: This tool is for educational and personal use. Always respect website terms of service and use responsibly.
