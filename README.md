# 📦 AnnonsVän Pro
**Create once. Publish everywhere.**  
A fast, browser‑based studio for writing Swedish listings (with AI), managing photos, and publishing to multiple marketplaces — all in one flow.

[**▶ Live App**](https://annonsvn.vercel.app/) &nbsp;•&nbsp; **Contact:** _Send a message (issues welcome)_

---

## At a glance
- ✅ **One studio** for Tradera, Blocket, Facebook Marketplace, and eBay
- ✅ **AI descriptions** (Minimal / Simple / Detailed), Swedish tone, safe formatting
- ✅ **Modern image manager:** drag & drop, rotate, reorder, set cover, client‑side compression
- ✅ **Per‑platform status** (Open / Klar) and a single **Sold** toggle to close the loop
- ✅ **No login** — drafts + images persist in your browser (LocalStorage)

---

## Why
Selling the same item on several marketplaces is slow: different forms, formats, and copy rules.  
AnnonsVän Pro removes the repetition — type once, drop your images, let AI help with the copy, then open each marketplace with everything ready.

---

## How it works
1. **Fill in basics** — title, price, condition (and optional city/notes).  
2. **Add photos** — drop images; they are compressed on-device and you can reorder, rotate, and pick a cover.  
3. **Generate copy with AI** — choose Minimal / Simple / Detailed; plain‑text, Swedish marketplace style.  
4. **Preview live** — see the layout with a large hero image and a thumbnail strip.  
5. **Publish** — open each marketplace with formatted text; mark **Klar** per platform, or **Såld** when done.

---

## Feature matrix
| Area | Details |
| --- | --- |
| **AI copy** | 3 styles; safe Swedish tone; plain text (no markdown/emojis/links) |
| **Images** | Drag & drop, rotate, reorder, **set as cover**, lightbox zoom; client‑side JPEG compression (~1200px @ 0.8) |
| **Publishing** | Tradera, Blocket, Facebook Marketplace, eBay — per‑platform formatting + copy helpers |
| **Status** | Visual progress per platform; “Markera som Såld” lock/unlock with confetti |
| **Drafts** | LocalStorage (no account); hero, snippet, timestamp; quick load/delete |
| **Accessibility** | Focus rings, larger hit areas, keyboard support (ongoing) |

---

## Tech stack & versions
- **Frontend:** HTML5, CSS3, **Vanilla JavaScript (ES2020+)**
- **APIs:** `fetch` POST → **/generate-description** (backend). Backend uses **Google Gemini API** for text generation.
- **Images:** **Canvas API** for client‑side compression & rotation; **FileReader** for previews
- **Data:** **LocalStorage** for drafts (`avp3.drafts`) and marketplace state (`avp3.markets`)
- **Hosting:** **Vercel** (frontend). Backend currently on Render.
- **Performance:** No frameworks; minimal JS; images compressed before storing

> Backend base URL is configured via `<meta name="backend" content="https://…">` in `index.html`.

---

## Privacy
- No signup or server‑side drafts; your **drafts and images stay in your browser**.  
- Only AI‑generation requests hit the backend (`/generate-description`). No analytics by default.

---

## Screenshots
| Studio | Image manager | Marketplaces |
| --- | --- | --- |
| ![Studio](screenshots/studio.png) | ![Gallery](screenshots/gallery.png) | ![Marketplaces](screenshots/marketplaces.png) |

> Place real images in `/screenshots/` with the names above for GitHub to render them.

---

## Roadmap
**Now**
- Lightbox rotation polish (maintain layout on rotate)
- Mobile layout: stacked panes and responsive preview sizing
- Logo icons for marketplaces from `/gallery/icons/*.svg`

**Next**
- Export/Import drafts (JSON)
- Autosave every 2 minutes (on change)
- “Set as cover” from preview strip + keyboard reordering

**Later**
- Direct publishing integrations (where ToS allows)
- Cloud sync for drafts
- More marketplaces & analytics

---

## What this is / isn’t
- **Is:** a speed‑to‑publish tool that keeps everything **plain text & safe** for Swedish marketplaces.  
- **Isn’t:** a bulk bot, spam tool, or a data harvester. You still review and publish.

---

## Development
- Open `index.html` directly or serve statically.
- Configure backend URL via the `<meta name="backend">` tag.
- Keys used only by the backend (e.g., `GEMINI_API_KEY`).

**Folders of note**
```
/screenshots         # Images used in this README
/gallery/icons       # Marketplace SVG icons (Tradera, Blocket, Facebook, eBay)
```

---

## Support & Contact
Solo‑built. I read everything, but replies might be delayed.  
**Contact:** Send me a message via issues or your preferred channel.

---

## License
TBD (proprietary for now).

---

**Try it now → https://annonsvn.vercel.app/**
