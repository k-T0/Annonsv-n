require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Generate description
app.post('/generate-description', async (req, res) => {
  try {
    const { style, title, condition, price } = req.body;

    console.log('Incoming generate-description request:');
    console.log({ style, title, condition, price });

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set in environment.');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Skriv en ${style} produktbeskrivning för:
Titel: ${title}
Skick: ${condition}
Pris: ${price} SEK`;

    console.log('Generated prompt:', prompt);

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response body:', data);

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Failed to generate description' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ description: text });
  } catch (err) {
    console.error('Error generating description:', err);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Your service is live 🚀');
});
