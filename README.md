# Job Scout 🕵️‍♂️

> **⚠️ Windows Only**: This project currently supports Windows only due to native C++ automation tools. Cross-platform support is planned for future releases.

An intelligent automated job discovery and evaluation system for LinkedIn. Job Scout automatically scans through job postings, filters promising opportunities, and uses AI to evaluate how well they match your profile - saving you hours of manual job searching.

## 🎯 What It Does

Job Scout **does not apply to jobs automatically**. Instead, it:

- 🔍 **Discovers Jobs**: Automatically navigates LinkedIn job search results
- 🎯 **Smart Filtering**: Applies initial criteria (fewer than 100 applicants, avoids low-quality job boards)
- 📋 **Data Extraction**: Captures full job descriptions for promising opportunities
- 🤖 **AI Evaluation**: Uses local LLM to assess job fit based on your profile
- �️ **Web Interface**: Modern React application for managing and reviewing discovered jobs
- �📊 **Structured Results**: Saves all evaluations in organized format for easy review

## 🏗️ Architecture

The system consists of four main components:

### 1. Web Application (`job-scout-app/front-end/`)
- **Modern React Interface**: Built with React 19 and Material-UI
- **Job Management**: View, filter, and organize discovered jobs
- **Resume Integration**: Upload resume for personalized job matching
- **Company Filtering**: Block unwanted companies and job boards
- **Theme Support**: Dark/light mode toggle
- **Responsive Design**: Grid and list view options

### 2. Scout Bot (`scout-bot/`)
- Node.js automation script that controls the entire workflow
- Orchestrates screenshot capture, computer vision, and job evaluation
- Handles LinkedIn page navigation and data extraction

### 3. Mouse Tools (`mouse-tools/`) 🖱️ **Windows Only**
- Collection of **native C++ utilities** for precise browser automation:
  - **Screenshot capture** - Captures specific screen regions with pixel-perfect accuracy
  - **Mouse movement** - Smooth, human-like cursor automation with safety controls
  - **Text highlighting** - Automatic text selection and copying
  - **OCR detection** - Finds text in images using Tesseract OCR
  - **Template matching** - Computer vision to locate UI elements (OpenCV)
  - **Scrolling** - Programmatic page navigation
  - **Global hotkeys** - Emergency stop functionality (ESC key)
- **Dependencies**: OpenCV, Tesseract OCR, Windows API, MSYS2/MinGW-w64
- **Performance**: Native C++ for millisecond-precise timing and smooth automation

### 4. Job Evaluation Server (`job-scout-app/server/`)
- Express.js API server for job analysis
- Integrates with local LLM (LM Studio) for intelligent evaluation
- Provides structured job data extraction and fit assessment
- Serves data to the React frontend application

## 🚀 Quick Start

### System Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **Node.js**: v16 or higher
- **MSYS2**: Required for C++ compilation (includes MinGW-w64)
- **Memory**: 4GB RAM minimum (8GB recommended for LLM)
- **Storage**: 2GB free space (more for language models)

### Dependencies (Auto-installed)
- **OpenCV 4.x** - Computer vision and image processing
- **Tesseract OCR** - Text recognition from screenshots  
- **libpng** - Image format support
- **Windows UI Automation** - Native Windows automation APIs

### Super Simple Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-scout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start everything**
   ```bash
   npm start
   ```

4. **Setup LM Studio**
   - Install [LM Studio](https://lmstudio.ai/)
   - Download a model (recommended: Llama3-8b)
   - Start the local server on `http://127.0.0.1:1234`

That's it! The script will:
- ✅ Install all dependencies automatically (step 2)
- ✅ Start the backend server (step 3)
- ✅ Start the React frontend (step 3)
- ✅ Open the web interface at `http://localhost:3001`

### Alternative Commands

```bash
# Install dependencies only
npm run install-deps

# Development mode (more verbose output)
npm run dev
```

### Legacy Scripts (Alternative)

If you prefer the original batch/shell scripts:

```bash
# Windows
install.bat
start.bat

# They are placeholders for future cross-platform support
```

### Manual Setup

If you prefer to set up components manually:

## 🚀 Setup

### Prerequisites

- **Windows 10/11** (64-bit)
- **Node.js** (v16+)
- **MSYS2** with development tools ([Download here](https://www.msys2.org/))
- **LM Studio** with a language model (e.g., Llama3-8b)
- **Dependencies**: OpenCV, Tesseract OCR, libpng (auto-installed via MSYS2)

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
   
   # React frontend
   cd ../front-end/job-scout
   npm install
   ```

3. **Setup MSYS2 and C++ dependencies (Windows)**
   ```bash
   # Install MSYS2 from https://www.msys2.org/
   # Then install required packages:
   pacman -S mingw-w64-ucrt-x86_64-gcc
   pacman -S mingw-w64-ucrt-x86_64-opencv
   pacman -S mingw-w64-ucrt-x86_64-tesseract-ocr
   pacman -S mingw-w64-ucrt-x86_64-libpng
   
   # Add MSYS2 to your PATH:
   # C:\msys64\ucrt64\bin
   ```

4. **Setup LM Studio**
   - Install [LM Studio](https://lmstudio.ai/)
   - Download a model (recommended: Llama3-8b)
   - Start the local server on `http://127.0.0.1:1234`

5. **Build mouse tools (Windows)**
   ```bash
   cd mouse-tools
   # C++ tools will auto-build when first run by the bot
   # Or manually build with: .\buildMoveMouse.bat, .\buildVisualizer.bat, etc.
   ```

## 🎮 Usage

### Super Quick Start
After cloning the repo:

```bash
npm start
```

Then:
1. **Access the web interface** at `http://localhost:3001`
2. **Upload your resume** (required for personalized job matching)
3. **Optional: Run the automation bot**
   - Open LinkedIn job search in your browser
   - Run: `cd scout-bot && npm run dev`
   - Press ESC to stop the bot anytime

### Alternative Usage

### 1. Start the Job Evaluation Server
```bash
cd job-scout-app/server
npm run dev
```

### 2. Start the React Frontend (Optional)
```bash
cd job-scout-app/front-end/job-scout
npm start
```
The web interface will be available at `http://localhost:3000`

### 3. Setup LinkedIn Job Search
- Open LinkedIn in your browser
- Navigate to your desired job search results page
- Position the window where the bot can capture it

### 4. Run the Scout Bot
```bash
cd scout-bot
npm run dev
```

### 5. Safety Controls
- **Press ESC** at any time to stop the bot immediately
- The bot includes built-in escape detection for safe operation
- Use `stop.bat` (Windows) to stop all Job Scout processes

## 🖥️ Web Interface Features

### Job Management
- **Job Board**: View all discovered jobs in grid or list format
- **Search & Filter**: Find specific jobs by title, company, or technology
- **Trash System**: Soft delete jobs with restore functionality
- **Company Blocking**: Maintain a blocklist of unwanted companies

### User Experience
- **Resume Upload**: Required before accessing job data for personalized matching
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Navigation**: Clean sidebar navigation with organized sections

### Data Organization
- **Applied Jobs**: Track jobs you've applied to (coming soon)
- **Settings**: Customize filtering preferences (coming soon)
- **Export Options**: Export job data for external analysis (coming soon)

## ⚙️ Configuration

### Job Filtering Criteria

The bot applies several filters to focus on quality opportunities:

- **Applicant Count**: Prefers jobs with < 100 applicants
- **Company Blocklist**: Avoids known low-quality job boards:
  - Jobright.ai, Wiraa, Lensa
  - Generic "hours", "United States", "people" postings

### Profile Configuration

Currently optimized for a **full-stack developer with 5+ years experience** in:
- JavaScript, Python, Node.js, AWS

To customize for your profile, edit the `systemPrompt` in:
`job-scout-app/server/controllers/jobs/index.js`

## 📊 Output

### Web Interface
Jobs are displayed in the React application with:
- **Card/List Views**: Choose your preferred layout
- **Filtering**: Search by company, title, technologies
- **Status Tracking**: Applied, saved, or trashed jobs
- **AI Insights**: LLM evaluation results and fit reasoning

### Job Evaluation Data

Each processed job is also saved to `job-descriptions/parsed-jobs.json` with:

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
- **Note**: Screenshot-based detection is currently resolution-dependent and may require adjustments for different display setups
- Robust handling of different screen resolutions and layouts (work in progress)

### Safety Features
- Global escape key listener for immediate stop
- Smooth mouse movements to avoid detection
- Error handling and retry logic for robustness

### LLM Integration
- Connects to local LM Studio instance
- Structured prompting for consistent job evaluation
- JSON parsing with error handling

## 🎯 Use Cases

- **Professional Job Management**: Modern web interface for organizing job searches
- **Job Market Research**: Analyze trends in job requirements and compensation
- **Opportunity Discovery**: Find jobs you might have missed in manual searches
- **Fit Assessment**: Get AI-powered evaluation of job compatibility
- **Time Saving**: Process hundreds of jobs in the time it takes to manually review dozens
- **Portfolio Tracking**: Maintain organized records of job applications and responses

## ⚠️ Important Notes

- **Windows Only**: Currently supports Windows 10/11 only due to native C++ automation tools
- **Cross-Platform Plans**: Linux and macOS support planned for future releases
- **Work in Progress**: This project is actively under development
- **Frontend Available**: A modern React web interface is now available for job management
- **Resolution Dependency**: Screenshot-based UI element detection may need adjustments for different screen resolutions and display scaling
- **LinkedIn ToS**: Be aware of LinkedIn's terms of service regarding automation
- **Rate Limiting**: The bot includes delays to avoid overwhelming LinkedIn's servers  
- **Manual Review**: Always manually review AI-recommended jobs before applying
- **Local Processing**: All job data processing happens locally for privacy

## 🔮 Future Plans

### Cross-Platform Support
- **Python Alternative**: Python-based automation tools for Linux/macOS
- **Node.js Port**: Cross-platform automation using robotjs
- **Platform Detection**: Automatic tool selection based on operating system
- **Docker Support**: Containerized deployment options

### Enhanced Features
- **Mobile App**: React Native companion app
- **Browser Extension**: Direct LinkedIn integration
- **Cloud Sync**: Optional cloud storage for job data
- **Team Features**: Collaborative job searching and sharing

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

**Current Status**: This project is actively developed with a functional React web interface. Currently Windows-only due to native C++ automation tools. Cross-platform support is planned for future releases.

## Screenshots
<img width="1273" height="663" alt="job-scout-1" src="https://github.com/user-attachments/assets/3dc9fddd-9b70-4de2-8cd2-1a22b152268e" />
<img width="949" height="458" alt="job-scout-3" src="https://github.com/user-attachments/assets/c31735f5-70ef-4e53-bfca-8b599580609a" />
<img width="1210" height="586" alt="job-scout-4" src="https://github.com/user-attachments/assets/c3c0c10e-189b-46aa-a5b0-03be8d942b15" />
