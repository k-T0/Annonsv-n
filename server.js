require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) console.warn('GEMINI_API_KEY missing');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function buildPrompt({ title, condition, price, notes = '', city = '', style = 'simple' }) {
  const specHeader = 'Specifikationer:';
  return `
System:
You write Swedish marketplace product descriptions for Blocket, Tradera, and Facebook Marketplace.
Return PLAIN TEXT only. No markdown (*,#,\`), no emojis.

Input:
- Title: ${title}
- Condition: ${condition}
- Price: ${price} SEK
- Notes (optional): ${notes || '—'}
- Style: ${style}  // minimal | simple | detailed

Rules (follow exactly):
1) Tone: objective, concise, slightly salesy; Swedish marketplace voice.
2) minimal  = 1–2 sentences. No lists.
3) simple   = 1–2 sentences + 2–4 bullet points using "· " prefix.
4) detailed = 2–3 sentences + the line "${specHeader}" then 4–8 "· " bullet points.
5) Mention condition briefly. If brand new or parts/repair, say it clearly.
6) Keep it clean: no markdown, no emojis, no code fences.
7) Do not include contact info or links.
${city ? `8) Add at the very end: "Går att hämta upp i ${city}."` : ''}

Write ONLY the final description text (no headers, no JSON).
`.trim();
}

function sanitizePlain(s = '') {
  try {
    s = s
      .replace(/(^|\s)#{1,6}\s*/g, '$1')
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
      .replace(/^\s*[-*•]\s+/gm, '· ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch {
    s = s
      .replace(/(^|\s)#{1,6}\s*/g, '$1')
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/^\s*[-*•]\s+/gm, '· ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return s;
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/generate-description', async (req, res) => {
  try {
    const { title, condition, price, style = 'simple', notes = '', city = '' } = req.body || {};
    if (!title || !condition || !price) return res.status(400).json({ error: 'Missing fields' });

    const prompt = buildPrompt({ title, condition, price, notes, city, style });
    const result = await model.generateContent(prompt);
    const raw = result?.response?.text?.() || '';
    let description = sanitizePlain(raw || '');

    if (style === 'minimal') {
      const sentences = description.split(/(?<=[.!?])\s+/).slice(0, 2);
      description = sentences.join(' ').trim();
    } else {
      description = description.replace(/^\s*[-*]\s+/gm, '· ');
    }
    res.json({ description });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
