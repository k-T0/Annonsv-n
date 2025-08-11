# 📦 AnnonsVän Pro
**Create once. Publish faster.**  
A modern, browser-based studio to compose, preview and publish listings across multiple marketplaces in one flow.

[**Live App** → annonsvn.vercel.app](https://annonsvn.vercel.app/) · **Contact**: send a message · **Status**: Public MVP (v2)

---

## Table of Contents
- [Overview](#overview)
- [What it is / What it isn’t](#what-it-is--what-it-isnt)
- [Core Features](#core-features)
- [Demo Screenshots](#demo-screenshots)
- [Technical Overview](#technical-overview)
- [Configuration](#configuration)
- [Data & Privacy](#data--privacy)
- [Accessibility](#accessibility)
- [Browser Support](#browser-support)
- [Keyboard & Power Tips](#keyboard--power-tips)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Status & Versioning](#status--versioning)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License & Trademarks](#license--trademarks)

---

## Overview
AnnonsVän Pro streamlines the entire listing workflow—title, price, condition, photos, copy, preview and publishing—so you don’t repeat work across platforms. The goal is **speed and consistency** from idea to published ad.

> **One-person team:** Built and maintained by a solo developer. If you find bugs or have ideas, please open an issue or send a message.

---

## What it is / What it isn’t
**It is:** a fast, no-login, in-browser studio for preparing listings and pushing them to marketplaces with correct formatting.  
**It isn’t (yet):** a headless integrator that publishes via platform APIs on your behalf (you’ll still confirm on each marketplace).

---

## Core Features
- **Unified editor** – Clean form for title, price, condition, optional city/tags/notes.
- **Photo workflow** – Drag & drop, reorder via drag-and-drop, rotate, choose cover, lightbox zoom.
- **AI copy** – Swedish descriptions in three styles (*Minimal*, *Simple*, *Detailed*) with local fallback when the API is unavailable.
- **Live preview** – Large hero image + thumbnail strip; marketplace-style typography.
- **Quality score** – Clear hints to reach a “ready to publish” state.
- **Publishing checklist** – Open marketplaces, mark as “Done”, track overall progress.
- **Drafts** – Local drafts with thumbnails and status badges (Draft / Ready / Published / Sold).
- **Sold state** – One click to mark as “Sold” (undoable) with celebratory feedback.

**Marketplaces in MVP**
- Tradera · Blocket · Facebook Marketplace · eBay  
  SVG icons are loaded from: `/gallery/icons/{tradera|blocket|facebook|ebay}.svg`

---

## Demo Screenshots
> Replace with actual paths in your repo, e.g. `/screenshots/*`.

| Start | Photo workflow | Publishing |
|---|---|---|
| `screenshots/start.png` | `screenshots/gallery.png` | `screenshots/marketplaces.png` |

---

## Technical Overview
| Area | Choice / Version |
|---|---|
| **Frontend** | **HTML5**, **CSS3** (Flexbox, Grid, custom properties, `aspect-ratio`), **JavaScript (ES2021+)** — no heavy framework |
| **Build** | None required (vanilla, static assets) |
| **Images** | Client-side compression via **Canvas API** (JPEG), rotation, thumbnails |
| **Storage** | `localStorage` for drafts, marketplace status, thumbnail data |
| **AI** | Google **Gemini API** via lightweight backend (`POST /generate-description`); graceful offline/local fallback |
| **Deployment** | **Vercel** (global CDN, HTTPS, auto CI/CD) |
| **Accessibility** | ARIA roles, focus outlines, keyboard interactions for key flows |
| **Brand assets** | SVG icons in `/gallery/icons/*.svg` |
| **Backend endpoint** | Set via `<meta name="backend" content="https://…"/>` in `index.html` |

---

## Configuration
- The AI backend endpoint is provided via `<meta name="backend">` in `index.html`:
  ```html
  <meta name="backend" content="https://annonsv-n.onrender.com"/>
  ```
- If the endpoint is unreachable, the app falls back to a local, safe text template to keep the flow unblocked.

---

## Data & Privacy
- **No accounts.** All drafts and state are stored locally in your browser (`localStorage`).
- **Photos** remain local; the app does not upload them anywhere by itself. Images are compressed **client-side** for performance.
- **AI requests** are sent only when you explicitly click an **AI** button. Otherwise, no data leaves your browser.

---

## Accessibility
- Focus-visible rings on interactive elements.
- Keyboard interaction for key flows (e.g., toggles, lightbox controls).
- Larger click targets where it matters (≈44px).

---

## Browser Support
- **Officially supported:** Latest **Chrome**, **Edge**, **Firefox**, **Safari** (desktop).  
- **Mobile:** iOS Safari, Android Chrome (stacked layout on smaller screens).  
> Older browsers may lack features like `aspect-ratio`, CSS custom properties, or modern Grid behavior.

---

## Keyboard & Power Tips
- **Marketplace toggles:** Use the mouse or Tab + Enter/Space to mark “Done” per platform.
- **Lightbox:** ← / → to navigate, **Rotate** button for 90° steps.
- **Copy blocks:** Use the copy buttons to get platform-formatted text into your clipboard quickly.

---

## Known Limitations
- **Direct API publishing** is not implemented in the MVP; you confirm listings on each marketplace.
- **Local-only drafts** (no cross-device sync yet).
- **AI output** should be reviewed before posting (guardrails are applied, but judgment matters).

---

## Roadmap
**v2.x (planned)**
- Direct publishing via marketplace APIs (where permitted).
- Cloud sync for drafts across devices.
- Platform-aware image optimization (size, crop, backgrounds).
- Automatic tag suggestions (text + vision signals).  
- Expanded analytics (conversion hints, category best practices).

**Ongoing refinements**
- Drag-and-drop micro-interactions and “gravity feel” polish.
- More AI tone controls & templates.
- Additional workflow states (e.g., “Synced”).

---

## Status & Versioning
- **Current:** Public MVP (v2)
- **Recent highlights:**
  - Large marketplace-style preview with hero + thumbnail strip.
  - Publishing checklist and reversible **Sold** state.
  - Local drafts with cover image and status badges.
  - Robust AI fallback when the backend is unavailable.

---

## FAQ
**Does the app upload my photos anywhere?**  
No. Photos stay in your browser unless you upload them to a marketplace yourself.

**Do I need an account?**  
No. Everything is local. (Cloud sync is on the roadmap.)

**What happens if the AI backend is down?**  
You still get safe, local copy generation so you can proceed.

**Can I add more marketplaces?**  
Yes—UI and formatters are designed to be extended; icons live in `/gallery/icons/`.

**Will there be a mobile app?**  
Possibly. The web app is mobile-friendly today; a native wrapper is being explored.

---

## Contributing
Solo project for now, but ideas and bug reports are welcome. Please open an issue with:
- Steps to reproduce (if a bug)
- Browser + OS
- Screenshots or a short screen recording

---

## License & Trademarks
License: TBD.  
Tradera, Blocket, Facebook and eBay are trademarks of their respective owners. Names and icons are used for descriptive UI purposes only.
