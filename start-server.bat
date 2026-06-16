@echo off
title MedScan Local Server
cd /d "%~dp0"

echo ===================================================
echo             MedScan Local Server Launcher          
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Node.js is required to run this project.
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing Node.js, close this window and run start-server.bat again.
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, if not run npm install
if not exist node_modules (
    echo [1/2] Installing required project dependencies: Vite...
    echo This may take a few moments on the first run. Please wait...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo [1/2] Project dependencies already installed.
)

echo [2/2] Starting local Vite development server...
echo.
echo ===================================================
echo   KEEP THIS WINDOW OPEN WHILE USING THE WEBSITE!
echo   To shut down the server, press Ctrl+C or close this window.
echo ===================================================
echo.

:: Start Vite dev server which automatically opens the browser
call npm start
