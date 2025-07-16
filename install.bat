@echo off
echo Installing Job Scout Dependencies...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Installing dependencies...
echo.

REM Install scout-bot dependencies
echo [1/3] Installing Scout Bot dependencies...
cd /d "%~dp0scout-bot"
call npm install
if %errorlevel% neq 0 (
    echo Error installing scout-bot dependencies
    pause
    exit /b 1
)

REM Install server dependencies
echo [2/3] Installing Server dependencies...
cd /d "%~dp0job-scout-app\server"
call npm install
if %errorlevel% neq 0 (
    echo Error installing server dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [3/3] Installing Frontend dependencies...
cd /d "%~dp0job-scout-app\front-end\job-scout"
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo ======================================
echo Installation Complete!
echo ======================================
echo.
echo You can now run the application using:
echo   start.bat (Windows)
echo   ./start.sh (Linux/Mac)
echo.
echo Press any key to continue...
pause >nul
