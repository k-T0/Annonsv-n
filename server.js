const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(bodyParser.json());

// CORS: allow only your Vercel app + localhost for dev. Update the vercel URL if different.
app.use(cors({
  origin: ["https://annonsvn.vercel.app", "http://localhost:3000"],
  methods: ["POST"]
}));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Proxy to Gemini (plain text only)
app.post("/generate-description", async (req, res) => {
  try {
    const { style, title, condition, price } = req.body;

    const prompt = `Skriv en ${style} svensk produktbeskrivning för en annons.
Produkt: ${title}
Skick: ${condition}
Pris: ${price} SEK

Viktigt:
- Endast vanlig text. Inga emojis. Ingen markdown. Inga list-symboler.
- 3–8 meningar beroende på stil.
- Fokusera på skick, funktion, och vad köparen får.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ description: text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Description generation failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT));
