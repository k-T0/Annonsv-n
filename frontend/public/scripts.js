// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// --- CORS (keep it loose for now; tighten later) ---
app.use(cors());
app.use(express.json());

// --- Health checks ---
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.head('/generate-description', (_req, res) => {
  res.status(204).end();
});

// --- Proxy endpoint ---
app.post('/generate-description', async (req, res) => {
  try {
    // Accept both names so Render/Vercel mismatches don't break us
    const GEMINI_API_KEY = process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error('[Server] Missing API key: set GOOGLE_AI_KEY or GEMINI_API_KEY');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const { style, title, condition, price } = req.body || {};

    if (!style || !title || !condition || !price) {
      return res.status(400).json({ error: 'Missing required fields: style, title, condition, price' });
    }

    // Build the prompt (plain text only)
    const prompt = [
      `Skriv en ${style} svensk produktbeskrivning.`,
      `Titel: ${title}`,
      `Skick: ${condition}`,
      `Pris: ${price} SEK`,
      `Krav: Endast ren text (ingen markdown, inga emojis, inga specialtecken).`,
      `Hållningen: saklig, kort och säljande.`
    ].join('\n');

    // Use global fetch (Node 18+). If you’re on older Node, add node-fetch.
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
      encodeURIComponent(GEMINI_API_KEY);

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    };

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[Gemini] HTTP', r.status, text || '(no body)');
      return res.status(500).json({ error: 'Failed to generate description' });
    }

    const data = await r.json();
    const description =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || '';

    if (!description) {
      console.error('[Gemini] Empty description payload', JSON.stringify(data).slice(0, 400));
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    return res.json({ description });
  } catch (err) {
    console.error('[Server] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Server] Listening on ${PORT}`);
});
