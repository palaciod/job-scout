@echo off
setlocal enabledelayedexpansion

REM
set scriptName=%~nx0

REM
for %%f in (*.exe) do (
    REM
    if /I not "%%f"=="%scriptName%" (
        echo Deleting %%f
        del "%%f"
    )
)

echo Done: deleted all .exe files except this script.
