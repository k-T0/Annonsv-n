require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Health
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Generate description
app.post('/generate-description', async (req, res) => {
  try {
    const { style, title, condition, price } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    if (!style || !title || !condition || !price) {
      return res.status(400).json({ error: 'Missing required fields (style, title, condition, price)' });
    }

    const prompt = `Skriv en ${style} svensk produktbeskrivning utan markdown/emoji.
Titel: ${title}
Skick: ${condition}
Pris: ${price} SEK`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Bubble up Google’s error so we see the cause in the frontend/devtools
      return res.status(response.status).json({ error: data.error || 'Gemini request failed' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ description: text });
  } catch (err) {
    console.error('Error generating description:', err);
    return res.status(500).json({ error: 'Failed to generate description' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
