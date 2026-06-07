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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: max_tokens || 1000,
        messages: [{ role: "user", content: userMessage }]
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

const PORT = process.env.PORT || 3001;
// Google Trends endpoint
app.get("/api/trends/google", async (req, res) => {
  try {
    const { keyword } = req.query;
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
    console.error(err);
    res.status(500).json({ error: "Trends fetch failed" });
  }
});

// YouTube Trends endpoint
app.get("/api/trends/youtube", async (req, res) => {
  try {
    const { keyword } = req.query;
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
    console.error(err);
    res.status(500).json({ error: "YouTube trends fetch failed" });
  }
});
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));