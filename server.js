const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
    try {
        const { title, tags, prompt, model } = req.body;
        const fullPrompt = `Title: ${title}\nTags: ${tags}\nInstruction: ${prompt}`;
        const generationModel = genAI.getGenerativeModel({ model });
        const result = await generationModel.generateContent(fullPrompt);
        const text = result.response.text();
        res.json({ output: text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate description." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
