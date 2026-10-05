@echo off
chcp 65001 >nul
echo ========================================
echo Premium School ERP - Run Development App
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
    echo npm install failed. Please check Node.js installation and internet connection.
    pause
    exit /b 1
  )
)
echo Starting Tauri development app...
npm run tauri:dev
pause
