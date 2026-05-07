@echo off
title AI Partner Start

:: ==========================================
echo ==========================================
echo          AI Partner Start
echo ==========================================
echo.

:: Set project path
set "PROJECT_PATH=%~dp0"
cd /d "%PROJECT_PATH%"

:: Step 1: Check Node.js
echo [Step 1/4] Check Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [Error] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js ready
node -v
echo.

:: Step 2: Install dependencies
echo [Step 2/4] Check dependencies...
if not exist "node_modules" (
    echo [*] Installing dependencies, please wait...
    call npm install
    if errorlevel 1 (
        echo [Error] Install failed
        pause
        exit /b 1
    )
    echo [OK] Install success
) else (
    echo [OK] Dependencies ready
)
echo.

:: Step 3: Setup database
echo [Step 3/4] Check database...
if not exist "prisma\dev.db" (
    echo [*] Init database...
    call npx prisma migrate dev --name init
    echo [OK] Database ready
) else (
    echo [OK] Database ready
)
echo.

:: Generate Prisma client
echo [*] Generate Prisma client...
call npx prisma generate >nul 2>&1
echo [OK] Prisma client ready
echo.

:: Step 4: Start server
echo [Step 4/4] Start server...
echo.
echo ==========================================
echo Server starting...
echo Please wait...
echo ==========================================
echo.
echo Open: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

timeout /t 2 /nobreak >nul

:: Start Next.js dev server
call npm run dev

echo.
echo [Stop] Server stopped
echo.
pause
