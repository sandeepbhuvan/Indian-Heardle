# Indian Heardle 🎵

A multi-language song guessing game inspired by Heardle, tailored for Indian music industries (Bollywood Hindi, Tamil, Telugu, Punjabi, Malayalam, Kannada).

## Architecture Highlights
- **Backend**: FastAPI (Python 3.12) with SQLAlchemy, SQLite/PostgreSQL support, and RapidFuzz for fuzzy string matching (handles transliterated spellings and alternate artist/movie names).
- **Frontend**: Angular 18 (Standalone Components) with YouTube IFrame Player API integration for precise snippet playback (1s → 2s → 4s → 7s → 11s → 16s). Zero raw audio/video files stored or served.
- **Languages Supported**:
  - 🎬 Hindi (Bollywood)
  - 🌟 Tamil (Kollywood)
  - ⚡ Telugu (Tollywood)
  - 🔥 Punjabi Pop
  - 🌴 Malayalam (Mollywood)
  - 👑 Kannada (Sandalwood)

---

## Quick Start

### 1. Start Backend
```bash
# Option A: Run batch script
./run_backend.bat

# Option B: Manual commands
cd backend
python -m venv ../venv
..\venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed_data
python -m uvicorn app.main:app --port 8000 --reload
```
Backend API will be accessible at: `http://localhost:8000/docs`

### 2. Start Frontend
```bash
# Option A: Run batch script
./run_frontend.bat

# Option B: Manual commands
cd frontend
npm install
npx ng serve --port 4200
```
Open your browser at: `http://localhost:4200`

---

## Docker Support
You can also launch both containers together:
```bash
docker-compose up --build
```