@echo off
title Editorial Content Planner - Runner
echo ============================================
echo Editorial Content Calendar ^& Publication Planner
echo Starting Frontend and Backend...
echo ============================================

if not exist backend (
  echo Backend folder not found!
  pause
  exit
)

if not exist frontend (
  echo Frontend folder not found!
  pause
  exit
)

echo Starting backend...
start "Backend Server" cmd /k "cd backend && (if not exist node_modules npm install) && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Frontend App" cmd /k "cd frontend && (if not exist node_modules npm install) && npm run dev"

echo ============================================
echo Project is starting...
echo Backend:  http://localhost:5000/api
echo Frontend: http://localhost:5173
echo ============================================
pause
