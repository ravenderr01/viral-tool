const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.options("/api/generate", cors());

app.post("/api/generate", async (req, res) => {
  console.log("Request received:", JSON.stringify(req.body).slice(0, 100));
  try {
    const { messages, max_tokens } = req.body;
    const userMessage = messages[messages.length - 1].content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: max_tokens || 1000 }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data).slice(0, 200));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));