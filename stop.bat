@echo off
echo Stopping Job Scout Application...
echo.

REM Kill processes by window title
taskkill /fi "WindowTitle eq Job Scout Server*" /f /t >nul 2>&1
taskkill /fi "WindowTitle eq Job Scout Frontend*" /f /t >nul 2>&1

REM Kill Node.js processes running on common ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Job Scout has been stopped.
echo.
pause
