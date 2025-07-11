@echo off

REM
g++ findTextImage.cpp -o findTextImage.exe ^
 -IC:\msys64\ucrt64\include ^
 -IC:\msys64\ucrt64\include\leptonica ^
 -IC:\msys64\ucrt64\include\tesseract ^
 -IC:\msys64\ucrt64\include\opencv4 ^
 -LC:\msys64\ucrt64\lib ^
 C:\msys64\ucrt64\lib\libtesseract.dll.a ^
 C:\msys64\ucrt64\lib\libleptonica.dll.a ^
 C:\msys64\ucrt64\lib\libopencv_core.dll.a ^
 C:\msys64\ucrt64\lib\libopencv_imgcodecs.dll.a ^
 C:\msys64\ucrt64\lib\libopencv_imgproc.dll.a

REM
if %errorlevel% neq 0 (
  echo Build failed.
  exit /b
)

echo Build successful.
