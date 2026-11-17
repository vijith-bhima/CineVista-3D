# CineVista 3D — Full Stack Master Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting CineVista 3D Full-Stack Application" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

# Cleanup ports if already in use
Write-Host "[Cleanup] Checking and freeing ports 5173, 8080, 5433..." -ForegroundColor Gray
@(5173, 8080, 5433) | ForEach-Object {
    $p = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($p) {
        $p | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
}
if (Test-Path "C:\Cinevista-3D\backend\pgdata\postmaster.pid") {
    Remove-Item "C:\Cinevista-3D\backend\pgdata\postmaster.pid" -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

# 1. Start PostgreSQL
Write-Host "[1/3] Starting PostgreSQL (Port 5433)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'PostgreSQL Server (Port 5433)' -ForegroundColor Cyan; & 'C:\Program Files\PostgreSQL\18\bin\postgres.exe' -D 'C:\Cinevista-3D\backend\pgdata'"

Start-Sleep -Seconds 2

# 2. Start Java Backend
Write-Host "[2/3] Starting Java Backend (Port 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'CineVista Java Backend (Port 8080)' -ForegroundColor Cyan; cd 'C:\Cinevista-3D\backend'; .\run.ps1"

Start-Sleep -Seconds 2

# 3. Start Next.js Frontend
Write-Host "[3/3] Starting Next.js Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Next.js Frontend (Port 5173)' -ForegroundColor Cyan; cd 'C:\Cinevista-3D\frontend'; npm run dev"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "All 3 services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:8080/api/health" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
