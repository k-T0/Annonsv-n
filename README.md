# 📦 AnnonsVän Pro

**Create listings. Sell faster.**  
AnnonsVän Pro is a modern, browser‑based tool that streamlines publishing the *same listing* to multiple marketplaces. It combines AI‑assisted copy, simple image management, and a clean publishing checklist into one flow.

---

## 🧭 Index
1. [What is AnnonsVän Pro?](#what-is-annonsvän-pro)
2. [Live App & Contact](#live-app--contact)
3. [Screenshots](#screenshots)
4. [Core Features](#core-features)
5. [How it Works](#how-it-works)
6. [Technical Overview](#technical-overview)
7. [Architecture at a Glance](#architecture-at-a-glance)
8. [Roadmap (v2)](#roadmap-v2)
9. [Status & Known Limitations](#status--known-limitations)
10. [Contributing](#contributing)
11. [License](#license)

---

## What is AnnonsVän Pro?
AnnonsVän Pro reduces copy‑paste chaos when selling on several platforms. You fill in a single listing, drop in photos, generate Swedish descriptions with AI, and then publish to Tradera, Blocket, Facebook Marketplace, and eBay with the right formatting. Drafts and images live locally so you can work without logging in.

---

## Live App & Contact
- **Live:** https://annonsvn.vercel.app/  
- **Contact:** send a message (issues/DM) — solo project for now 👋

---

## Screenshots
> File names expected in `screenshots/` as `1.png`, `2.png`, `3.png`.

| Studio (Left Pane) | Preview (Center) | Marketplaces (Right Pane) |
| --- | --- | --- |
| ![Studio](screenshots/1.png) | ![Preview](screenshots/2.png) | ![Marketplaces](screenshots/3.png) |

---

## Core Features
- **Unified listing form** — title, price, condition, notes, city.
- **Image box** — single modern dropzone, drag & reorder with a smooth “gravity” feel, rotate, lightbox, set cover (hero).
- **AI descriptions (Swedish)** — *Minimal*, *Enkel*, *Detaljerad*; cleans markdown; marketplace‑safe plain text.
- **Preview** — large hero + strip, mirrors order live.
- **Multi‑marketplace publishing** — platform‑specific formatting and one‑click “Open” + “Klar” tracking.
- **Drafts** — stored in the browser (`localStorage`), with cover image, status badge, snippet, timestamp.
- **Quality meter** — subtle score with actionable suggestions.

---

## How it Works
1. **Fill in basics** — title, price (SEK), condition, optional city/notes.
2. **Add images** — drag & drop, re‑order, rotate; the first image is the cover; you can “Set as cover” on any image.
3. **Generate text** — choose Minimal / Enkel / Detaljerad; AI returns a clean, plain‑text description.
4. **Preview** — hero and thumbnails reflect the current order; quality meter updates live.
5. **Publish** — copy/open per marketplace and mark **Klar**; mark **Såld** to lock and celebrate 🎉.

---

## Technical Overview
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES2020+)
- **Hosting:** Vercel (static site)
- **AI backend:** Render (Node/Express) — `POST /generate-description`  
  Env: `GEMINI_API_KEY` (Google Gemini). If the API is unreachable, a lightweight client fallback generates text.
- **Data storage:** `localStorage`
  - `avp3.drafts` — array of saved drafts (includes images as data URLs, status, timestamps).
  - `avp3.markets` — booleans per marketplace (Tradera/Blocket/Facebook/eBay).
- **Images:** client‑side compression via Canvas (longest edge ≈ **1200 px**, JPEG **quality 0.8**); rotate in 90° steps; lightbox with next/prev.
- **Accessibility:** visible focus states, large click targets (≥44×44), keyboardable controls.
- **Assets:** marketplace icons expected at `/gallery/icons/*.svg` (e.g., `tradera.svg`, `blocket.svg`, `facebook.svg`, `ebay.svg`).

> **Standards:** HTML5, CSS3, ES2020+ APIs (e.g., `createImageBitmap`/Canvas where supported).

---

## Architecture at a Glance
- **Three‑pane layout:** Left (form + drafts), Center (preview + quality), Right (marketplaces).
- **State:** held in memory, persisted to `localStorage` on save; no server DB.
- **AI integration:** frontend calls Render backend → Gemini; response sanitized to plain text.
- **Publishing:** clipboard formatting + deep links to each marketplace; per‑platform “Klar” toggles update overall progress.
- **Sold state:** locks toggles and triggers confetti; can be undone.

---

## Roadmap (v2)
- **Direct API posting** where terms allow; otherwise stronger autofill/extension flow.
- **Cloud sync** of drafts across devices (opt‑in).
- **Browser extension** for half‑automation on each site (fill forms, upload photos).
- **Import/Export** drafts as JSON; autosave every 2 minutes.
- **Image smarts** (auto‑crop/contrast, platform‑specific recommendations).
- **More marketplaces** (international & niche).

---

## Status & Known Limitations
- Clipboard/deep‑link approach is used where official APIs are limited.
- No authentication or multi‑user roles yet.
- Drafts and images are local to the browser (privacy‑friendly, but device‑bound until cloud sync lands).
- AI output is sanitized plain text (no markdown/emojis/links) to fit Swedish marketplaces’ norms.

---

## Contributing
One‑person project — feedback and issues are welcome. If you want to contribute, open an issue with context and a small, testable proposal.

---

## License
Proprietary for now — all rights reserved.
