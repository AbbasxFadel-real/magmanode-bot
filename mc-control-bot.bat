@echo off
chcp 65001 >nul
title MagmaNode Discord Bot - Control Panel
color 0A

:menu
cls
echo ╔════════════════════════════════════════════╗
echo ║   MagmaNode Minecraft Server Discord Bot  ║
echo ╚════════════════════════════════════════════╝
echo.
echo [1] Start Bot
echo [2] Install Dependencies (npm install)
echo [3] Update Dependencies (npm update)
echo [4] Check Bot Status
echo [5] Exit
echo.
set /p choice="Select an option (1-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto install
if "%choice%"=="3" goto update
if "%choice%"=="4" goto status
if "%choice%"=="5" goto exit
goto menu

:start
cls
echo ════════════════════════════════════════════
echo    Starting MagmaNode Discord Bot...
echo ════════════════════════════════════════════
echo.
node index.js
echo.
echo ════════════════════════════════════════════
echo Bot has stopped!
echo ════════════════════════════════════════════
pause
goto menu

:install
cls
echo ════════════════════════════════════════════
echo    Installing Dependencies...
echo ════════════════════════════════════════════
echo.
npm install
echo.
echo ════════════════════════════════════════════
echo Installation Complete!
echo ════════════════════════════════════════════
pause
goto menu

:update
cls
echo ════════════════════════════════════════════
echo    Updating Dependencies...
echo ════════════════════════════════════════════
echo.
npm update
echo.
echo ════════════════════════════════════════════
echo Update Complete!
echo ════════════════════════════════════════════
pause
goto menu

:status
cls
echo ════════════════════════════════════════════
echo    Checking Configuration...
echo ════════════════════════════════════════════
echo.
echo Node.js Version:
node --version
echo.
echo NPM Version:
npm --version
echo.
echo Installed Packages:
npm list --depth=0
echo.
if exist .env (
    echo ✓ .env file found
) else (
    echo ✗ .env file NOT found - Please create it!
)
echo.
if exist index.js (
    echo ✓ index.js found
) else (
    echo ✗ index.js NOT found!
)
echo.
if exist package.json (
    echo ✓ package.json found
) else (
    echo ✗ package.json NOT found!
)
echo.
echo ════════════════════════════════════════════
pause
goto menu

:exit
cls
echo.
echo Thank you for using MagmaNode Bot!
echo.
timeout /t 2 >nul
exit