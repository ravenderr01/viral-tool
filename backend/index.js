const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.options("/api/generate", cors());

app.post("/api/generate", async (req, res) => {
  console.log("Request received");
  try {
    const { messages, max_tokens } = req.body;

    // Vira Assistant + Image AI ke liye
    if (req.body.system) {
      const hasImage = req.body.messages?.some((m) =>
        Array.isArray(m.content) && m.content.some((c) => c.type === "image")
      );

      if (hasImage) {
        // Convert to Groq vision format
        const groqMessages = req.body.messages.map((m) => {
          if (Array.isArray(m.content)) {
            const newContent = m.content.map((c) => {
              if (c.type === "image") {
                return {
                  type: "image_url",
                  image_url: {
                    url: `data:${c.source.media_type};base64,${c.source.data}`
                  }
                };
              }
              return c;
            });
            return { ...m, content: newContent };
          }
          return m;
        });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.2-90b-vision-preview",
            max_tokens: req.body.max_tokens || 1500,
            temperature: 0.8,
            messages: [
              { role: "system", content: req.body.system },
              ...groqMessages
            ]
          })
        });
        const data = await response.json();
        console.log("Vision response:", JSON.stringify(data).slice(0, 300));
        const text = data.choices?.[0]?.message?.content || "";
        return res.json({ content: [{ type: "text", text }] });
      }

      // Regular text (Vira Assistant)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: req.body.max_tokens || 500,
          temperature: 0.8,
          messages: [
            { role: "system", content: req.body.system },
            ...req.body.messages
          ]
        })
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return res.json({ content: [{ type: "text", text }] });
    }

    const userMessage = messages[messages.length - 1].content;

    const isGoogleAds = userMessage.includes("Google Ads") || userMessage.includes("Google Search headlines");
    const isMetaAds = userMessage.includes("Meta Ads") || userMessage.includes("Facebook/Instagram ad") || userMessage.includes("Meta Ads specialist");

    const systemPrompt = isGoogleAds ?
      `You are a Google Ads expert. CRITICAL RULES:
      1. hooks (Google Search Headlines): MUST be 25-30 characters. Use urgency + benefit. Example: "Expert Fitness Coach Today"
      2. titles (Display Headlines): MUST be 25-30 characters. Focus on USP. Example: "Get Fit in 30 Days - Start"
      3. Descriptions: MUST be 80-90 characters. Include benefit + CTA. Example: "Work with certified fitness coach online. Book free consultation today and get results!"
      4. scripts: keyword match suggestions like [exact match], "phrase match", broad match
      5. NO advertising/marketing words in titles — focus on customer benefit only
      6. Always respond in valid JSON only.`
      : isMetaAds ?
      `You are a world-class Meta Ads copywriter. STRICT RULES:
      1. hooks: MUST be 80-125 characters. Start with customer pain point. Example: "Still losing clients to competitors? Here's the exact Facebook strategy that gets 10 new clients weekly."
      2. titles: MUST be 30-40 characters. Include specific number/result. Example: "Get 10 Clients in 30 Days"
      3. captions: MUST be 200-300 characters. Format: Pain → Agitate → Solution → CTA
      4. NO generic words: unlock, boost, transform, skyrocket, master, pro
      5. Every line must mention specific results with numbers
      6. Always respond in valid JSON only.`
      : userMessage.includes("Facebook content expert") ?
      `You are a Facebook content expert. STRICT RULES:
      1. hooks: 8 emotional story-based post openers (80-120 chars). Start with relatable situation.
      2. titles: 8 post headlines (40-60 chars). Community-focused, shareable.
      3. captions: 5 complete Facebook posts (200-300 chars). Format: Story → Value → CTA. Use 1-2 emojis.
      4. scripts: 5 Facebook video scripts (Hook/Story/CTA format)
      5. Always respond in valid JSON only.`
      : userMessage.includes("Pinterest SEO expert") ?
      `You are a Pinterest SEO expert. STRICT RULES:
      1. hooks: 8 pin titles (60-80 chars). Keyword-rich, descriptive, benefit-focused.
      2. titles: 8 board name ideas. Specific and searchable.
      3. captions: 5 pin descriptions (200-300 chars). Include keywords naturally, end with CTA.
      4. scripts: 5 Pinterest strategy tips for growth.
      5. Always respond in valid JSON only.`
      : userMessage.includes("WhatsApp marketing expert") ?
      `You are a WhatsApp marketing expert. STRICT RULES:
      1. hooks: 8 broadcast message openers (50-80 chars). Personal, direct, curiosity-driven.
      2. titles: 8 message subject lines (30-50 chars). Clear and compelling.
      3. captions: 5 complete WhatsApp broadcast messages (150-200 chars). Conversational tone, clear CTA.
      4. scripts: 5 WhatsApp status ideas. Short and engaging.
      5. hashtags: empty []
      6. Always respond in valid JSON only.`
      : userMessage.includes("Snapchat content expert") ?
      `You are a Snapchat content expert. STRICT RULES:
      1. hooks: 8 snap story hooks (30-50 chars). Fun, casual, FOMO-based.
      2. titles: 8 story title ideas. Trendy and youth-focused.
      3. captions: 5 snap captions (20-40 chars). Short, fun, emoji-heavy.
      4. scripts: 5 Snapchat story scripts (5-7 snaps each with text overlay ideas).
      5. Always respond in valid JSON only.`
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

// Platform Trends endpoint
app.post("/api/trends/platform", async (req, res) => {
  try {
    const { platform, niche, keyword, country } = req.body;
    const prompt = `You are a viral content trend analyst. Generate CURRENT trending content ideas for ${platform} in the ${niche} niche for ${country}.
Return ONLY a valid JSON object like this:
{
  "platform": "${platform}",
  "niche": "${niche}",
  "trending_formats": [{ "format": "Format name", "description": "What it is", "example": "Specific example", "why_trending": "Why it works now" }],
  "trending_topics": [{ "topic": "Topic name", "hook": "Hook idea", "content_angle": "Unique angle" }],
  "best_posting_times": "Best times to post on ${platform}",
  "trending_hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "pro_tip": "One specific actionable tip for ${platform} ${niche} content right now"
}
Keyword context: ${keyword || niche}
Return only JSON, no extra text.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        temperature: 0.8,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error("Platform trends error:", err);
    res.status(500).json({ error: "Platform trends fetch failed" });
  }
});

// Google Trends endpoint
app.get("/api/trends/google", async (req, res) => {
  try {
    const query = req.query.q || "trending";
    const country = req.query.country || "IN";
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&geo=${country}&api_key=${process.env.SERPAPI_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Google Trends fetch failed" });
  }
});

// Google Trending Searches endpoint
app.get("/api/trends/google-trending", async (req, res) => {
  try {
    const country = req.query.country || "IN";
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_trends_trending_now&frequency=realtime&geo=${country}&api_key=${process.env.SERPAPI_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Google Trending fetch failed" });
  }
});

// YouTube Trends endpoint
app.get("/api/trends/youtube", async (req, res) => {
  try {
    const country = req.query.country || "IN";
    const category = req.query.category || "0";
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${country}&videoCategoryId=${category}&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "YouTube trends fetch failed" });
  }
});

// YouTube Search endpoint
app.get("/api/trends/youtube-search", async (req, res) => {
  try {
    const query = req.query.q || "trending";
    const country = req.query.country || "IN";
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&regionCode=${country}&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "YouTube search failed" });
  }
});

// Reddit Trends endpoint
app.get("/api/trends/reddit", async (req, res) => {
  try {
    const subreddit = req.query.subreddit || "all";
    const time = req.query.time || "day";
    const limit = req.query.limit || 10;
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=${time}`,
      { headers: { "User-Agent": "VCI-Tool/1.0" } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Reddit fetch failed" });
  }
});

// Referral endpoint
app.post("/api/referral/apply", async (req, res) => {
  const { referral_code, new_user_id } = req.body;
  console.log("Referral apply called:", referral_code, new_user_id);

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: referrer, error: refErr } = await supabase
      .from("users")
      .select("id, credits_remaining, referral_count")
      .eq("referral_code", referral_code.toUpperCase())
      .single();

    console.log("Referrer found:", referrer, refErr);

    if (!referrer) {
      return res.json({ success: false, message: "Invalid referral code" });
    }

    const { data: newUser, error: newErr } = await supabase
      .from("users")
      .select("id, referred_by, credits_remaining")
      .eq("id", new_user_id)
      .single();

    console.log("New user found:", newUser, newErr);

    if (!newUser) {
      return res.json({ success: false, message: "New user not found" });
    }

    if (newUser.referred_by) {
      return res.json({ success: false, message: "Already used a referral code" });
    }

    await supabase.from("users").update({
      credits_remaining: (referrer.credits_remaining || 0) + 10,
      referral_count: (referrer.referral_count || 0) + 1
    }).eq("id", referrer.id);

    await supabase.from("users").update({
      credits_remaining: (newUser.credits_remaining || 10) + 10,
      credits_total: 20,
      referred_by: referral_code.toUpperCase()
    }).eq("id", new_user_id);

    res.json({ success: true, message: "Referral applied successfully!" });

  } catch (err) {
    console.error("Referral error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));