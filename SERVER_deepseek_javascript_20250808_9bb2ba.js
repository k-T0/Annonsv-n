require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Gemini API proxy endpoint
app.post('/generate-description', async (req, res) => {
  const { style, title, condition, price } = req.body;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a ${style} Swedish product description for ${title} in ${condition} condition. 
                      Price: ${price} SEK. Use plain text only - no markdown, no emojis, 
                      and no special formatting. Focus on product features and condition.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const description = data.candidates[0]?.content?.parts[0]?.text || '';
    res.json({ description });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Description generation failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));