# Axle — Setup Guide

This guide gets you from a fresh `git clone` to a running local instance (backend + frontend + Supabase).

## Prerequisites

- Node.js (v18+ recommended) — check with `node -v`
- npm (comes with Node) — check with `npm -v`
- A Supabase project (existing or new) — see [supabase.com](https://supabase.com)
- Git

## 1. Clone the repo
git clone https://github.com/pijeomah/axle.git
cd axle

## 2. Project structure

> Adjust this section to match your actual repo layout.


axle/
├── backend/          # Node.js API server
├── frontend/          # React + Vite app
└── README.md


If backend and frontend live in separate folders with their own `package.json`, you'll need to install and run each independently (see below).

## 3. Environment variables

Copy the example env file(s) and fill in your own values:


cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env   # if the frontend needs its own env vars


Required variables (adjust to match your actual `.env.example`):

| Variable | Where to find it | Used by |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API | backend |
| `SUPABASE_KEY` (anon or service key) | Supabase dashboard → Project Settings → API | backend |
| `PORT` | your choice, e.g. `3000` | backend |
| `VITE_API_URL` | e.g. `http://localhost:3000` | frontend |

⚠️ Never commit your `.env` file. Confirm it's listed in `.gitignore` before your first commit.

## 4. Install dependencies

Backend:
bash
cd backend
npm install


Frontend:
bash
cd frontend
npm install

> If you see an error like `sh: 1: vite: not found` when starting the frontend, it means `npm install` hasn't been run yet (or was interrupted) in the frontend folder. Re-run `npm install` there.

## 5. Set up the database

- Log into your Supabase project dashboard.
- If this is a fresh Supabase project (not the original), run the SQL migrations found in `[path/to/migrations]` via the Supabase SQL editor, or via CLI if you use one.
- Confirm tables exist and match what the backend expects (check `[path/to/schema or types file]`).

## 6. Run it

Backend:
```bash
cd backend
npm run dev
```

Frontend (separate terminal):
```bash
cd frontend
npm run dev
```

- Backend should be running on `http://localhost:5000`
- Frontend should be running on `http://localhost:5173` (Vite default) or as shown in your terminal output

## 7. Verify it's working

- Visit the frontend URL in your browser
- Try logging in / creating a test transaction
- Check backend terminal for incoming request logs
- (Once added) hit the health check endpoint, e.g. `GET /health`, to confirm the API is alive

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `vite: not found` | Frontend deps not installed — run `npm install` in the frontend folder |
| Backend can't connect to Supabase | Wrong or missing `SUPABASE_URL`/`SUPABASE_KEY` in `.env` |
| CORS errors in browser console | Backend CORS config doesn't allow frontend's origin |
| 401/auth errors immediately after login | Token storage or auth middleware misconfigured — check `.env` and auth routes |

## Notes for contributors

- This project uses [Node.js / Express-style backend], Supabase (Postgres + Auth), and React + Vite.
- See `README.md` for architecture overview and current known issues.
