@echo off
echo ========================================
echo Neura App - Clean Installation Script
echo ========================================
echo.

echo Step 1: Waiting for file locks to release...
timeout /t 5 /nobreak >nul

echo Step 2: Cleaning old installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f /q package-lock.json 2>nul
)

echo Step 3: Cleaning npm cache...
call npm cache clean --force

echo Step 4: Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo ========================================
if %errorlevel% equ 0 (
    echo SUCCESS! Installation completed.
    echo.
    echo Now run: npx expo start
) else (
    echo FAILED! Check the error above.
    echo.
    echo Try:
    echo 1. Close VS Code and all terminals
    echo 2. Wait 10 seconds
    echo 3. Run this script again
)
echo ========================================
pause
