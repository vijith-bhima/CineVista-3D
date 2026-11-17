@echo off
set "PATH=%SystemRoot%\System32;%SystemRoot%;%PATH%"
title CineVista 3D Master Launcher
echo ===================================================
echo   Starting CineVista 3D Full-Stack Application
echo ===================================================

echo [Cleanup] Freeing ports 5173, 8080, 5433 if in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5433 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1
del /f /q "C:\Cinevista-3D\backend\pgdata\postmaster.pid" >nul 2>&1

echo [1/3] Starting PostgreSQL on port 5433...
start "CineVista - PostgreSQL" cmd /k "title PostgreSQL (Port 5433) && \"C:\Program Files\PostgreSQL\18\bin\postgres.exe\" -D \"C:\Cinevista-3D\backend\pgdata\""

timeout /t 2 /nobreak >nul

echo [2/3] Starting Plain Java Backend on port 8080...
start "CineVista - Java Backend" cmd /k "title Java Backend (Port 8080) && cd /d C:\Cinevista-3D\backend && run.bat"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Next.js Frontend on port 5173...
start "CineVista - Next.js Frontend" cmd /k "title Next.js Frontend (Port 5173) && cd /d C:\Cinevista-3D\frontend && npm run dev"

echo ===================================================
echo   All 3 services launched in separate windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080/api/health
echo ===================================================
pause
