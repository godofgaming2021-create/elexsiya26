@echo off
echo.
echo ================================================================
echo   ELEXSIYA 26 - Course PDF Generator
echo ================================================================
echo.
echo   The course HTML file is ready at:
echo   course_final.html (174 KB - all 19 modules merged)
echo.
echo   Opening in your default browser...
echo.

:: Open the HTML file in the default browser
start "" "%~dp0course_final.html"

echo   ================================================================
echo   HOW TO SAVE AS PDF (30 seconds):
echo   ================================================================
echo.
echo   1. The course should now be open in your browser
echo   2. Press Ctrl + P  (Print)
echo   3. Change Destination to "Save as PDF"
echo   4. Click "More settings"
echo        - Paper size: A4
echo        - Margins: None
echo        - Scale: Default (100)
echo        - Turn ON: Background graphics  ^<-- IMPORTANT
echo   5. Click Save
echo   6. Save as: course_ELEXSIYA26.pdf
echo      In this folder: %~dp0
echo.
echo   ================================================================
echo   Your PDF will contain:
echo     - Beautiful dark cover page with gold title
echo     - Full Table of Contents with 19 modules
echo     - All code blocks with syntax-highlighted dark theme
echo     - All tables with red headers
echo     - 200+ pages of world-class content
echo   ================================================================
echo.
pause
