@echo off
title SIH26057 - Underwater Marine Debris Detection
echo ========================================================
echo  SIH26057: Automated Underwater Marine Debris Detection
echo  AI Engine: Ultralytics YOLO11-OBB + Acoustic Physics
echo ========================================================
echo.

echo [1/2] Starting FastAPI Backend (Port 8000)...
start "SIH Backend (FastAPI + YOLO11-OBB)" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 >nul

echo [2/2] Starting Vite Frontend (Port 5173)...
start "SIH Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul

echo Launching Mission Dashboard in default browser...
start http://localhost:5173

echo.
echo ========================================================
echo  System is running!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API & Docs: http://127.0.0.1:8000/docs
echo ========================================================
