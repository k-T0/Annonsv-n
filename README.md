# AnnonsVän Pro (MVP)

Two parts:

- **Backend (Render Web Service)** — Node/Express proxy that calls Gemini securely.
  - Files: `server.js`, `package.json`
  - Env var on Render: `GEMINI_API_KEY=...`

- **Frontend (Vercel Static Site)** — HTML/CSS/JS UI.
  - Files under `frontend/public`
  - `frontend/vercel.json` rewrites `/api/generate-description` → Render backend

## Deploy

### Render (backend)
- Create Web Service → GitHub repo
- Build Command: `npm install`
- Start Command: `npm start`
- Add env var `GEMINI_API_KEY`
- Optional: update allowed origins in `server.js` CORS list

### Vercel (frontend)
- New Project → Framework: Other
- **Root Directory:** `frontend`
- **Output Directory:** `public`
- Build/Install Command: (leave empty)
- Deploy

## Frontend Features

- Manual save draft + auto-save every 30s (localStorage)
- Clear All with confirm
- Copy per marketplace (Tradera, Blocket, Facebook, eBay) — plain text
- AI description buttons: Minimal/Enkel/Detaljerad → calls `/api/generate-description`
