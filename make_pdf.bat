@echo off
setlocal

set "OUTFILE=%~dp0pdf_log.txt"
set "HTML=%~dp0course_final.html"
set "PDF=%~dp0course_ELEXSIYA26.pdf"

echo Searching for browser... > "%OUTFILE%"

:: Check Edge (always installed on Windows 10/11)
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

:: Check Chrome
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

:: Decide which browser to use
set "BROWSER="
if exist "%EDGE%"   set "BROWSER=%EDGE%"   & echo Using Edge >> "%OUTFILE%"
if exist "%CHROME%" set "BROWSER=%CHROME%" & echo Using Chrome >> "%OUTFILE%"

echo Browser: %BROWSER% >> "%OUTFILE%"

if "%BROWSER%"=="" (
    echo ERROR: No browser found >> "%OUTFILE%"
    echo BROWSER_NOT_FOUND
    exit /b 1
)

:: Create temp profile dir
set "TMPDIR=%TEMP%\elx_pdf_%RANDOM%"
mkdir "%TMPDIR%" 2>nul

echo Launching headless browser... >> "%OUTFILE%"
echo HTML: %HTML% >> "%OUTFILE%"
echo PDF: %PDF% >> "%OUTFILE%"

:: Run Chrome/Edge headless
"%BROWSER%" --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage --run-all-compositor-stages-before-draw --virtual-time-budget=8000 --print-to-pdf-no-header "--user-data-dir=%TMPDIR%" "--print-to-pdf=%PDF%" "file:///%HTML:\=/%"

echo Exit code: %ERRORLEVEL% >> "%OUTFILE%"

timeout /t 3 /nobreak >nul

if exist "%PDF%" (
    echo SUCCESS: PDF created >> "%OUTFILE%"
    for %%A in ("%PDF%") do echo Size: %%~zA bytes >> "%OUTFILE%"
    echo PDF_SUCCESS
) else (
    echo FAIL: PDF not found at %PDF% >> "%OUTFILE%"
    :: Check if saved to current dir
    if exist "%~dp0course_final.pdf" (
        move "%~dp0course_final.pdf" "%PDF%"
        echo Moved course_final.pdf to PDF path >> "%OUTFILE%"
        echo PDF_SUCCESS_MOVED
    ) else (
        echo PDF_FAILED
    )
)

rmdir /s /q "%TMPDIR%" 2>nul
endlocal
