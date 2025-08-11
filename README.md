# 📦 AnnonsVän Pro

**Create once. Publish everywhere.**  
AnnonsVän Pro is a modern, browser-based tool that helps you **compose, preview, and publish a single listing to multiple marketplaces fast** — with AI copy, streamlined image handling, and a clear publishing checklist.

> ⚡ **Live app:** https://annonsvn.vercel.app/  
> ✉️ **Contact:** Send a message (open an issue or DM).  
> 🏷 **Current version:** v2

---

## 🔗 Index

- [What is AnnonsVän Pro?](#-what-is-annonsv%C3%A4n-pro)
- [Screenshots](#-screenshots)
- [Core Features](#-core-features)
- [How It Works](#-how-it-works)
- [Technical Overview](#-technical-overview)
- [Hosting & Environments](#-hosting--environments)
- [Design System](#-design-system)
- [Roadmap (v2 → v3)](#-roadmap-v2--v3)
- [FAQ](#-faq)
- [Contributing & Feedback](#-contributing--feedback)

---

## 💡 What is AnnonsVän Pro?

AnnonsVän Pro is your control room for listings. **One ad → multiple marketplaces**, without repeating yourself. You write the listing once, **AI drafts the description in Swedish**, you drop in images (we compress locally), and then you **one‑click open each marketplace** with formatted content ready to paste. A subtle quality score nudges you to “ready” without getting in the way.

---

## 🖼 Screenshots

<p align="center">
  <img src="screenshots/1.png" alt="Studio – fields + preview + marketplaces" width="800"><br/>
  <em>Studio: fields, live preview, and marketplace checklist</em>
  <br/><br/>
  <img src="screenshots/2.png" alt="Image manager – dropzone + reordering + cover" width="800"><br/>
  <em>Image manager: drop, reorder, rotate, set cover</em>
  <br/><br/>
  <img src="screenshots/3.png" alt="Publishing – per-platform copy + progress" width="800"><br/>
  <em>Publishing: platform formats and progress</em>
</p>

---

## ✨ Core Features

- **Central listing composer** – Title, price, condition, notes, tags; plain‑text safe output.  
- **AI descriptions (Swedish)** – Minimal / Simple / Detailed styles, sanitized (no Markdown/emojis).  
- **Modern image box** – Drag & drop, client‑side JPEG compression (~1200px @ 0.8), rotate, **reorder with “gravity” feel**, set cover.  
- **Live preview** – Hero image & thumbnails mirror your order, responsive scaling.  
- **Marketplace helpers** – Per‑platform formatting for Tradera, Blocket, Facebook Marketplace, eBay; **Open** + **Klar** toggles and overall progress.  
- **Local drafts** – Save, reload, status badges (Draft / Ready / Published / Sold).  
- **No login** – Everything is stored in your browser via LocalStorage.

> Icons are expected at: **`/gallery/icons/*.svg`** (e.g. `tradera.svg`, `blocket.svg`, `facebook.svg`, `ebay.svg`).

---

## 🧭 How It Works

1. **Fill the basics** – Title, price, condition (and optional city/notes).  
2. **Drop your images** – We compress client‑side for speed; reorder, rotate, set cover.  
3. **AI‑generate text** – Pick style (Minimal/Enkel/Detailed) and tweak if needed.  
4. **Preview** – See exactly what you’ll ship; quality score helps you reach “ready”.  
5. **Publish** – Click each marketplace, paste the prepared text, mark **Klar**; set **Såld** when done.

---

## 🛠 Technical Overview

**Front‑end**
- HTML **5**, CSS **3**, JavaScript **ES2020+** (Vanilla)
- Canvas API (client‑side compression & rotation)
- LocalStorage persistence (drafts, markets, images)
- Accessible controls (keyboard/focus, large hit targets)

**Back‑end (description API)**
- Endpoint: `POST /generate-description` (hosted on Render)
- Model: **Google Gemini API** (sanitized to plain text)
- Payload `{ title, price, condition, style, notes?, city? }`

**Publishing**
- Per‑platform formatters (Tradera, Blocket, Facebook, eBay)
- Clipboard copy-on-open for fast pasting

**Files & Paths**
- Screenshots: `screenshots/1.png`, `screenshots/2.png`, `screenshots/3.png`
- Icons: `/gallery/icons/tradera.svg`, `/gallery/icons/blocket.svg`, `/gallery/icons/facebook.svg`, `/gallery/icons/ebay.svg`

---

## ☁️ Hosting & Environments

- **App hosting:** **Vercel** (https://annonsvn.vercel.app/) – CDN, HTTPS by default.  
- **API hosting:** **Render** – `/generate-description` (Gemini).  
- **Storage:** LocalStorage in the browser (no server-side DB for MVP).

> 🔒 **Privacy-first MVP:** Images and drafts never leave your browser unless you choose to publish.

---

## 🎨 Design System

- **Palette**: Ivory `#FFFBF6`, Periwinkle `#8C9EFF`, Sage `#7CC9A7`, Coral `#F49C7A` (soft, pastel).  
- **Type**: Fraunces (brand), Source Serif 4 (H1–H3 600), Inter (UI 400/500).  
- **Shapes**: 18px corners, pill buttons; light, airy shadows.  
- **Motion**: Subtle hover lift, animated gradient background.

---

## 🛣 Roadmap (v2 → v3)

- **Direct API posting** (where possible) to reduce manual pasting.  
- **Cloud sync** for drafts across devices (opt‑in).  
- **Bulk ops** – export/import drafts (JSON), autosave-on-change.  
- **More marketplaces** – international and niche.  
- **Smarter AI** – image‑aware tags, platform‑tuned copy, safety filters.  
- **Browser extension** – fill forms directly on marketplace pages.

<details>
<summary><strong>Recent focus</strong></summary>

- Large hero preview mirroring marketplace look  
- Modern single dropzone with internal gallery  
- Reordering fixes (no duplicates), better drag feel  
- “Sold” toggle (undo supported) + confetti  
- A11y polish (focus rings, hit areas, tab order)
</details>

---

## ❓ FAQ

**Does AnnonsVän Pro upload my images to a server?**  
No. For the MVP, images are handled **entirely client‑side** (Canvas compression + LocalStorage). They only go to a marketplace when you upload there.

**Is a login required?**  
No. Your drafts live in your browser. (Cloud sync is planned as an opt‑in feature.)

**Which marketplaces are supported today?**  
Tradera, Blocket, Facebook Marketplace, eBay (with platform‑specific formatting). More are planned.

**How does the AI description work?**  
We call a backend endpoint (`/generate-description`) that uses **Google Gemini** to draft a Swedish description in the chosen style. We sanitize the response to plain text (no Markdown/emojis).

**Can I export my drafts?**  
Export/Import (JSON) is on the near roadmap. For now you can copy all fields via the UI.

**Why do I see a quality score?**  
It’s a gentle checklist (title, price, condition, description length, images, etc.) to nudge you to “ready.” It never blocks publishing.

**What about mobile?**  
The studio adapts to narrow screens (stacked panes). Best experience is on desktop/laptop, but you can review and tweak on mobile.

**Where do the marketplace icons come from?**  
Place SVGs at **`/gallery/icons/*.svg`** (e.g. `tradera.svg`). The app looks there by default.

**Is my data private?**  
Yes. Drafts and images stay on your device unless you explicitly upload to a marketplace. We don’t run analytics in the MVP.

**I found a bug — how do I report it?**  
Open an issue or send a message. Repro steps + browser/OS help a lot.

---

## 💬 Contributing & Feedback

This is a practical tool built for real sellers. If you have a suggestion or want to collaborate:
- Open an issue with context (screens, expected vs. actual behavior), or
- Send a message with your use case and we’ll discuss.

> The project is currently built and maintained by a **solo dev**. Small, steady improvements ship frequently.

---

<p align="center">
  <sub>© AnnonsVän Pro — Fast, focused, and seller‑friendly.</sub><br/>
  <a href="https://annonsvn.vercel.app/">Open the app</a>
</p>
