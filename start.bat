@echo off
echo Starting Job Scout Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Starting application components...
echo.

REM Start the backend server
echo [1/3] Starting Job Evaluation Server...
start "Job Scout Server" cmd /k "cd /d %~dp0job-scout-app\server && npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start the React frontend
echo [2/3] Starting React Frontend...
start "Job Scout Frontend" cmd /k "cd /d %~dp0job-scout-app\front-end\job-scout && npm start"

REM Wait a moment
timeout /t 2 /nobreak >nul

echo [3/3] Setup complete!
echo.
echo ======================================
echo Job Scout is starting up...
echo ======================================
echo.
echo Backend Server: http://localhost:3000
echo Frontend App: http://localhost:3001 (will open automatically)
echo.
echo To run the automation bot:
echo   1. Open LinkedIn job search in your browser
echo   2. Run: cd scout-bot && npm run dev
echo.
echo Press ESC in any bot window to stop automation
echo Press any key to close this window...
pause >nul
