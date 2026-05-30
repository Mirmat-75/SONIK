# 🎵 SONIK – The New Event App

> Discover concerts, festivals & showcases near you. Powered by Ticketmaster + Claude AI.

**Live URL:** `https://sonik.vercel.app` *(replace with your deployed URL)*  
**Demo login:** `demo@sonik.app` / `sonik2026`

---

## Problem Statement

Music events are scattered across dozens of platforms, making discovery fragmented and time-consuming. SONIK centralises live event search, adds AI-powered personalisation, and lets users save favourites — all in one deployed web app.

**Target users:** Students, young professionals, and music lovers aged 18–35.

---

## Architecture

```
┌─────────────────────┐        HTTPS         ┌──────────────────────────┐
│   React (Vite)      │ ──── /api proxy ───► │  FastAPI (Python)        │
│   Vercel CDN        │                       │  Render.com              │
│                     │ ◄── JSON responses ── │                          │
└─────────────────────┘                       └────────────┬─────────────┘
                                                           │
                    ┌──────────────────────────────────────┼───────────────┐
                    │                                       │               │
             ┌──────▼───────┐                    ┌─────────▼──────┐  ┌────▼───────┐
             │  Supabase    │                    │  Ticketmaster  │  │            │
             │  PostgreSQL  │                    │  Discovery API │  │ Gemini AI  │
             │  + Auth      │                    │                │  │            │
             └──────────────┘                    └────────────────┘  └────────────┘
```

### Components

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | Fast SPA, great DX, free Vercel deploy |
| Backend | Python 3.11 + FastAPI | Async, clean OpenAPI docs, L2 patterns fit naturally |
| Database | Supabase PostgreSQL | Managed DB + Auth-as-a-service, free tier, RLS policies |
| Auth | Supabase Auth | Managed provider — no rolling our own password storage |
| Events API | Ticketmaster Discovery | Real-time structured data, 5k req/day free |
| AI | Gemini AI | Personalised recommendation blurbs, concurrent fan-out |
| Hosting FE | Vercel | CDN, HTTPS, Git CI out of the box |
| Hosting BE | Render | Python support, auto-deploy from main |

---

## APIs & Services Used

- **Ticketmaster Discovery API** – event search, detail, images, ticket links
- **Gemini AI** (`Google AI Studio`) – recommendation blurbs
- **Supabase** – PostgreSQL `favorites` table, `user_profiles` table, JWT auth
- **Vercel** – frontend static hosting with CDN
- **Render** – FastAPI backend web service

---

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A [Supabase](https://supabase.com) project (free)
- A [Ticketmaster API key](https://developer.ticketmaster.com/) (free)
- An [Anthropic API key](https://console.anthropic.com/) 

### 1 — Clone

```bash
git clone https://github.com/YOUR_ORG/sonik.git
cd sonik
```

### 2 — Database

Open Supabase → SQL Editor → paste and run `backend/schema.sql`.

### 3 — Backend

```bash
cd backend
cp .env.example .env          # fill in your keys
pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000
```

### 4 — Frontend

```bash
cd frontend
cp .env.example .env          # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev                   # http://localhost:5173
```

---

## Deployment

### Backend → Render

1. New Web Service → connect GitHub repo → select `backend/` as root dir
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all env vars from `.env.example` in the Render dashboard

### Frontend → Vercel

1. Import GitHub repo → set root to `frontend/`
2. Framework preset: Vite
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (Render URL)
4. Deploy

---

## Backend Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/events` | No | Search events (keyword, genre, city, date) |
| GET | `/events/{id}` | No | Single event detail |
| GET | `/favorites` | JWT | List user's saved event IDs |
| POST | `/favorites` | JWT | Save an event |
| DELETE | `/favorites/{id}` | JWT | Remove from favourites |
| POST | `/recommendations` | JWT | AI-personalised event picks |
| GET | `/health` | No | Health check |

Full docs available at `/docs` (FastAPI Swagger UI) when the backend is running.

---

## Test Plan

See `docs/test-plan.md` for the manual QA script. Key scenarios:

1. **Browse without login** – events load, search and filters work, favorites button shows "sign in" alert
2. **Sign up** – email confirmation flow, then sign in
3. **Add / remove favorite** – heart toggles, persists after page refresh
4. **Recommendations** – select genres, submit, blurb and events appear
5. **Error states** – disconnect network mid-search; retry toast appears
6. **Mobile** – all pages usable at 390px width (iPhone 14 emulation)

---

## Security

- API keys stored in environment variables only — never committed
- `.env` is in `.gitignore`; `.env.example` shows required variable names
- Supabase API key sent from backend only (service role); anon key in frontend is safe by design
- Supabase RLS policies enforce per-user data isolation
- Auth handled by Supabase Auth — no custom password storage

---

## Known Limitations

- No local event cache — favourites page fans out to Ticketmaster per event ID
- Genre preferences not persisted between recommendation sessions
- No pagination (20 events per search call)
- Not tested on physical iOS Safari

---

## Cost at 1,000 MAU

~$34–54/month (Supabase Pro $25 + Render Starter $7 + Vercel Hobby $0 + Anthropic ~$2).  
Full breakdown in the Group Report.
