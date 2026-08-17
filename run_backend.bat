@echo off
echo Starting Indian Heardle Backend (FastAPI)...
call venv\Scripts\activate
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
