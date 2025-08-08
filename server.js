// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.includes("vercel.app") || origin.includes("localhost")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST"]
}));

// --- ROUTES ---

// Health check
app.get("/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// AI description generation
app.post("/generate-description", async (req, res) => {
    const { style, title, condition, price } = req.body;
    console.log("Incoming generate-description request:", req.body);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
    }

    try {
        const prompt = `Skriv en ${style} annonsbeskrivning för: "${title}".
        Skick: ${condition}. Pris: ${price} kr.
        Texten ska vara på svenska, utan emojis, utan specialtecken som inte funkar på annonseringsplattformar.`;

        const geminiRes = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!geminiRes.ok) {
            throw new Error(`Gemini API error: ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const description =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        console.log("Generated description:", description);

        res.json({ description });

    } catch (err) {
        console.error("Error generating description:", err);
        res.status(500).json({ error: "Failed to generate description" });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
