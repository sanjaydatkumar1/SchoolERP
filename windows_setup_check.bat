@echo off
chcp 65001 >nul
echo ========================================
echo Premium School ERP - Windows Setup Check
echo ========================================
echo.
echo Checking Node.js...
node -v
if errorlevel 1 (
  echo [MISSING] Node.js not found. Install Node.js LTS from https://nodejs.org/
) else (
  echo [OK] Node.js found.
)
echo.
echo Checking npm...
npm -v
if errorlevel 1 (
  echo [MISSING] npm not found. It comes with Node.js LTS.
) else (
  echo [OK] npm found.
)
echo.
echo Checking Rust...
rustc --version
if errorlevel 1 (
  echo [MISSING] Rust not found. Install using: winget install Rustlang.Rustup
) else (
  echo [OK] Rust compiler found.
)
echo.
echo Checking Cargo...
cargo --version
if errorlevel 1 (
  echo [MISSING] Cargo not found. It comes with Rust.
) else (
  echo [OK] Cargo found.
)
echo.
echo Checking Visual Studio C++ Build Tools...
where cl >nul 2>nul
if errorlevel 1 (
  echo [WARNING] MSVC compiler 'cl' not found in current terminal.
  echo If build fails, open Visual Studio Installer and install workload: Desktop development with C++.
) else (
  echo [OK] MSVC compiler found.
  cl 2>&1 | findstr /C:"Version"
)
echo.
echo ========================================
echo If anything says MISSING, install it first.
echo Then run: npm install
echo Then run: npm run tauri:dev
echo ========================================
pause
