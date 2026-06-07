const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());
app.options("/api/generate", cors());

app.post("/api/generate", async (req, res) => {
  console.log("Request received");
  try {
    const { messages, max_tokens } = req.body;
    const userMessage = messages[messages.length - 1].content;

    // Detect if Google Ads request
    const isGoogleAds = userMessage.includes("Google Ads") || userMessage.includes("Google Search headlines");
    const isMetaAds = userMessage.includes("Meta Ads") || userMessage.includes("Facebook/Instagram ad");

    const systemPrompt = isGoogleAds ? 
      `You are a Google Ads expert. CRITICAL RULES:
      1. Google headlines MUST be 25-30 characters EXACTLY. Count every character including spaces.
      2. Descriptions MUST be 80-90 characters EXACTLY.
      3. Use power words: Fast, Expert, Save, Free, Now, Today, Best, Proven, Guaranteed
      4. Every headline must be a complete compelling message, not just 2 words.
      5. Bad example: "Fix Now" (7 chars - TOO SHORT). Good example: "Expert Printer Repair Today" (27 chars)
      6. Always respond in valid JSON only.` 
      : isMetaAds ?
      `You are a Meta Ads expert. Write compelling, emotional ad copy.
      Headlines under 40 characters. Primary texts 150-300 characters.
      Always respond in valid JSON only.`
      : `You are a viral content expert. Generate highly specific, professional content.
      Always respond in valid JSON only.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: max_tokens || 2000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    console.log("Groq response status:", response.status);
    const text = data.choices?.[0]?.message?.content || "";

    res.json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Google Trends endpoint
app.get("/api/trends/google", async (req, res) => {
  try {
    const response = await fetch(
      `https://google-trends8.p.rapidapi.com/trendings?region_code=IN&hl=en-US`,
      {
        headers: {
          "x-rapidapi-host": "google-trends8.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Trends fetch failed" });
  }
});

// YouTube Trends endpoint
app.get("/api/trends/youtube", async (req, res) => {
  try {
    const response = await fetch(
      `https://youtube-v3-alternative.p.rapidapi.com/trending?regionCode=IN&type=video&hl=en&gl=IN`,
      {
        headers: {
          "x-rapidapi-host": "youtube-v3-alternative.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "YouTube trends fetch failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));