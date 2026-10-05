@echo off
chcp 65001 >nul
echo ========================================
echo Premium School ERP - Build Windows Installer
echo ========================================
echo.
if not exist package.json (
  echo ERROR: package.json not found.
  echo Please keep this BAT file inside the project folder.
  pause
  exit /b 1
)
if not exist node_modules (
  echo node_modules not found. Installing dependencies first...
  npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo Building installer. This may take time...
npm run tauri:build
if errorlevel 1 (
  echo Build failed. Check if Rust and Visual Studio Desktop development with C++ are installed.
  pause
  exit /b 1
)
echo.
echo Build completed.
echo Installer should be inside:
echo src-tauri\target\release\bundle\
pause
