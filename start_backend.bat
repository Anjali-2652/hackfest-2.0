@echo off
REM Start the FastAPI backend server for PolicyGuard

echo Starting PolicyGuard FastAPI Backend...
echo.
echo Server will run at: http://127.0.0.1:8000
echo Keep this window open while developing
echo.

D:/Hackfest2.0/hackfest-2.0/.venv/Scripts/python.exe backend/main.py

pause
