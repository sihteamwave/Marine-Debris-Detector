@echo off
title SAMUDRA-SURAKSHA v2 - Marine Debris & Hydrographic Intelligence
echo ==============================================================================
echo  SAMUDRA-SURAKSHA (समुद्र-सुरक्षा) — National Marine Intelligence Platform
echo  AI Perception: Fine-Tuned YOLO11-Seg + Directional Acoustic Shadow Inversion
echo  Statutory Decision-Support: MoES / ICG / NIOT / NHO (IHO S-44 Compliant)
echo ==============================================================================
echo.

echo [1/2] Starting FastAPI Backend (Port 8000)...
start "SIH Backend (FastAPI + YOLO11-Seg)" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

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
