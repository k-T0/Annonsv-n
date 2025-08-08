// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2.x

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// -------- Middleware --------
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// -------- Health --------
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), ts: Date.now() });
});

// -------- Helpers --------
const GEMINI_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
  GEMINI_API_KEY || ''
)}`;

function sxnLog(...args) {
  console.log('////////////////////////////////////////////////////////////');
  console.log(...args);
  console.log('////////////////////////////////////////////////////////////');
}

// -------- AI proxy --------
app.post('/generate-description', async (req, res) => {
  try {
    const { style, title, condition, price } = req.body || {};

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }
    if (!title || !price || !condition || !style) {
      return res.status(400).json({ error: 'Missing required fields (style, title, condition, price)' });
    }

    sxnLog('Incoming generate-description request:', {
      style,
      title,
      condition,
      price,
    });

    const prompt = [
      `Generate a ${style} Swedish product description.`,
      `Product: ${title}`,
      `Condition: ${condition}`,
      `Price: ${price} SEK`,
      `Rules: plain text only (no markdown, no emojis, no special formatting).`,
      `Keep it suitable for Swedish marketplaces.`
    ].join('\n');

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      // You can tune safety/params here if you want:
      // generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 256 }
    };

    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Render free tier can be sleepy—give a bit more time:
      timeout: 30_000,
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '<no body>');
      console.error('Gemini error', r.status, errTxt);
      return res.status(500).json({ error: `Gemini API error: ${r.status}` });
    }

    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ||
      '';

    return res.json({ description: text });
  } catch (err) {
    console.error('Error generating description:', err);
    return res.status(500).json({ error: 'Description generation failed' });
  }
});

// -------- SPA fallback (serve frontend) --------
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------- Start --------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('==> Your service is live 🎉');
  console.log('==> Available at your primary URL https://<your-render-name>.onrender.com');
});
