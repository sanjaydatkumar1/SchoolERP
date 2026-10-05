@echo off
chcp 65001 >nul
title Premium School ERP - FRESH START (Clean All Data)
setlocal

set "APP_DIR=%APPDATA%\PremiumSchoolERP"

echo ============================================================
echo    Premium School ERP   -   FRESH START (Clean All Data)
echo    Developer: Sanjaydat Kumar
echo ============================================================
echo.
echo Data folder: %APP_DIR%
echo.

if not exist "%APP_DIR%" (
  echo [INFO] Data folder nahi mila.
  echo        App ko ek baar chalayein, band karein, phir ye file dobara chalayein.
  echo.
  pause
  exit /b 0
)

echo [1/4] App band kar rahe hain ^(agar chal rahi hai^)...
taskkill /IM "Premium School ERP.exe" /F >nul 2>&1
taskkill /IM "premium_school_erp.exe" /F >nul 2>&1
timeout /t 2 >nul

set "STAMP=%DATE%_%TIME%"
set "STAMP=%STAMP:/=-%"
set "STAMP=%STAMP::=-%"
set "STAMP=%STAMP:.=-%"
set "STAMP=%STAMP: =0%"
set "BACKUP_ZIP=%USERPROFILE%\Desktop\SchoolERP_Data_Backup_%STAMP%.zip"

echo [2/4] Safety backup ban raha hai (purana data zinda rahega):
echo       %BACKUP_ZIP%
powershell -NoProfile -Command "Compress-Archive -Path '%APP_DIR%\*' -DestinationPath '%BACKUP_ZIP%' -Force" >nul 2>&1
if exist "%BACKUP_ZIP%" (echo       Backup OK.) else (echo       [WARN] Backup nahi ban paya. Aage badh rahe hain.)

echo.
echo [3/4] WARNING - is folder ka SAARA data delete hoga:
echo       Students, Fees, Attendance, Exams, Payroll, Classes, Teachers,
echo       Login Users aur Settings - sab kuch.
echo       (Purana data Desktop ke ZIP me safe hai.)
echo.
set /p CONFIRM=Delete karna hai to YES type karke Enter dabayein: 
if /I not "%CONFIRM%"=="YES" (
  echo.
  echo Cancelled. Kuch bhi delete nahi hua.
  echo.
  pause
  exit /b 0
)

echo [4/4] Data delete kar rahe hain...
rmdir /s /q "%APP_DIR%"
if exist "%APP_DIR%" (
  echo.
  echo [ERROR] Folder delete nahi hua. App poori band karke dobara try karein.
) else (
  echo.
  echo DONE! Ab app kholein. Fresh install ki tarah chalega.
  echo Login:  username: admin    password: admin123
)
echo.
pause
