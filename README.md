# AnnonsVän Pro — Studio

One listing → publish to multiple marketplaces fast.  
AI writes safe Swedish descriptions. Drafts (with images) live locally.  
Track per-platform **Klar** and a single **Såld** action that closes the loop.

---

## ✨ Features

- **3-pane studio**
  - **Left:** listing fields, AI description, image dropzone, drafts
  - **Center:** live preview (large hero + strip) + subtle quality score
  - **Right:** marketplaces (Open + Klar), overall progress, **Markera som Såld**
- **AI descriptions** (Minimal / Enkel / Detaljerad) via `POST /generate-description`
- **Image system**
  - Single modern dropzone (click or drag & drop)
  - Client-side compression (~1200px max edge @ quality 0.8)
  - Rotate, lightbox, **drag-reorder with “gravity”**, set as cover (Omslag)
  - Preview mirrors current order; hero = first image
- **Drafts in localStorage**
  - Save/load, hero thumbnail, status badge, snippet, timestamp
  - Keys:
    - `avp3.drafts` (array of drafts)
    - `avp3.markets` (booleans per platform)
- **Marketplace helpers**
  - Per-platform “Open” (copies formatted text) + **Klar** toggle
  - Overall progress %, **Såld** toggles/untoggles (with confetti)
- **Design system**
  - Palette: Ivory `#FFFBF6`, Periwinkle `#8C9EFF`, Sage `#7CC9A7`, Coral `#F49C7A`
  - Type: Fraunces (logo), Source Serif 4 (H1–H3 600), Inter (UI 400/500)
  - 18px corners, pill buttons, airy shadows, animated background gradient

---

## 🗂️ Structure

```
/
├─ index.html
├─ styles.css
├─ scripts.js
└─ gallery/
   └─ icons/
      ├─ tradera.svg
      ├─ blocket.svg
      ├─ facebook.svg
      └─ ebay.svg
```

> Drop your marketplace SVGs into `gallery/icons/` with those exact filenames.

---

## 🚀 Getting started

No build step required (vanilla HTML/CSS/JS).

### Option A — just open it
- Double-click `index.html` in a modern browser.

### Option B — run a tiny local server (recommended)
```bash
# any of these is fine
python3 -m http.server 5173
# or
npx serve .
# or
deno task serve  # if you have a deno task for static
```
Open `http://localhost:5173` (or whatever port your server prints).

---

## 🔌 AI backend

The app looks for a `<meta name="backend" content="...">` in `index.html`.  
Endpoint used:

```
POST {BACKEND}/generate-description
Content-Type: application/json

{
  "title":     string,
  "condition": "Nytt" | "Som nytt" | "Mycket bra" | "Använt",
  "price":     string|number,
  "style":     "minimal" | "simple" | "detailed",
  "notes":     string?,   // optional
  "city":      string?    // optional
}
```

**Response**
```json
{ "description": "Plain-text Swedish description" }
```

If the backend is absent or returns non-200, the UI falls back to a client-side template generator (keeps UX snappy).

> Dev note: the Render service can use `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) in `server.js`. Keep outputs **plain text** (no markdown/emojis/links). See prompt rules under “Voice & content rules”.

---

## 🖼️ Images

- Compression: canvas resample to **max edge ~1200px** at **quality 0.8** (JPEG DataURL)
- Reorder: **DOM-in-place**, no re-render while dragging → no duplicates
- Interactions:
  - Hover non-hero → **“Omslag”** pill appears (sets as cover)
  - Hero shows **badge** bottom-left
  - Rotate 90° steps in the gallery or lightbox
  - Lightbox: prev/next/rotate/close
- Preview updates instantly when order or hero changes

---

## 🧠 Quality score (non-blocking)

- Title (+10)
- Price (+20)
- Condition (+15)
- Description length > 40 chars (+20)
- Images: **Quick** mode = ≥1 image (+15), **Pro** mode = ≥3 (+15)
- **Quick** mode “essentials ok” bonus (+20) → can reach 100 without Pro fields
- In **Pro** mode: any of notes/city/tags (+20)

---

## 🧱 Voice & content rules (backend)

- Swedish marketplace voice; **no markdown/emojis/links**
- Styles:
  - **Minimal:** 1–2 meningar
  - **Enkel:** 1–2 meningar + 2–4 punkter (`· ` bullets)
  - **Detaljerad:** 2–3 meningar + “Specifikationer:” + 4–8 punkter
- Mention `skick`; append pickup city line if provided

---

## ♿ Accessibility

- Focus-visible rings on all interactive elements
- Hit areas ≥ 44×44 where practical
- Keyboard: drag handles via native DnD; buttons and pills tabbable
- Live region toasts for actions (e.g., copy, sold)

---

## 🧩 Marketplace formatting

- **Tradera / Blocket / eBay:** include tags line
- **Facebook Marketplace:** **no tags**
- Open action copies platform-specific plain text to clipboard and opens the site.

---

## 💾 Persistence

- Drafts are stored in `localStorage` under **`avp3.drafts`**
  - Each draft keeps: `id`, `title`, `price`, `condition`, `city`, `tags`, `notes`, `description`, `thumbs[]`, `status`, `sold`, `markets`, `date`
  - `thumbs[]` = `{ id, src, rotation }` (src is compressed DataURL)
- Marketplace state in **`avp3.markets`** (booleans per platform)

> No remote storage yet; an export/import JSON tool is planned.

---

## 🛣️ Roadmap

**P0 (ship now)**
- [x] Drag “gravity”, no duplicates
- [x] Large preview hero
- [x] Single modern dropzone (click + DnD)
- [x] Quick mode can hit 100 with 1 image
- [x] Sold is toggleable (undo)
- [x] Long unbroken words don’t break layout
- [x] Adaptive layout for ultrawide monitors

**P1 (quality of life)**
- Export/Import draft (JSON)
- Autosave every 2 min (only on change)
- Keyboard shortcuts for Klar/Såld
- Better empty states & errors

**Migration (optional, next step)**
- SvelteKit + Tailwind re-skin (same features/state)
- Stores: listing/images/drafts/markets (persisted)
- Same backend contract; better a11y testing

---

## 🧪 Dev tips

- Keep visual changes small; ask before wide rewrites
- Commit format: `scope: intent`
  - e.g., `feat(image): drag reorder persists in drafts`
- Prioritize **speed-to-publish** and **plain-text safety** over flair

---

## 🔖 License

_Add the license you prefer (MIT recommended)._

---

## 🙌 Credits

Design tokens & product vision from **AnnonsVän Pro — Dev Handoff & Vision**.  
Icons © their respective owners — place SVGs in `gallery/icons/`.

---

## 🐞 Troubleshooting

- **Images duplicate when dragging** → should not happen now (DOM reorders in place). If you see it, clear `localStorage` and retest; then file a bug with steps + browser/version.
- **Title overflows preview** → we apply `overflow-wrap:anywhere`. If you spot a layout blow-up, attach a screenshot and the exact input.
