@echo off
echo ========================================================
echo Starting DeFiGuard Backend (FastAPI) and Frontend (Next.js)
echo ========================================================

start "DeFiGuard Backend API (Port 8000)" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

start "DeFiGuard Frontend UI (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting up:
echo - Frontend Dashboard: http://localhost:3000
echo - Backend REST API:   http://localhost:8000
echo - API Docs (Swagger): http://localhost:8000/docs
echo ========================================================
