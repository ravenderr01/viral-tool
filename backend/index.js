const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── AI PROVIDER: Groq primary, Gemini fallback ────────────────────────────
// Groq hits rate limit (429) → automatically switches to Gemini
// User never sees an error, just seamless generation

async function callGroq({ system, messages, max_tokens = 1500, temperature = 0.7, model = "llama-3.3-70b-versatile" }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      max_tokens,
      temperature,
      messages: system
        ? [{ role: "system", content: system }, ...messages]
        : messages
    }),
    signal: AbortSignal.timeout(20000) // 20s timeout
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error?.message || `Groq HTTP ${res.status}`), { status: res.status });
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini({ system, messages, max_tokens = 1500, temperature = 0.7 }) {
  // Build prompt: system + last user message
  const userMsg = messages[messages.length - 1]?.content || "";
  const fullPrompt = system ? `${system}\n\n${userMsg}` : userMsg;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: max_tokens,
          temperature
        }
      }),
      signal: AbortSignal.timeout(25000)
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Main function — tries Groq first, falls back to Gemini on 429 or error
async function callAI(options) {
  try {
    const text = await callGroq(options);
    console.log("✅ AI: Groq responded");
    return text;
  } catch (err) {
    const isRateLimit = err.status === 429 || err.message?.includes("rate") || err.message?.includes("limit");
    console.log(`⚠️ Groq failed (${err.message}) → switching to Gemini`);

    try {
      const text = await callGemini(options);
      console.log("✅ AI: Gemini responded (fallback)");
      return text;
    } catch (geminiErr) {
      console.error("❌ Both Groq and Gemini failed:", geminiErr.message);
      throw new Error("AI service temporarily unavailable. Please try again.");
    }
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
        // Vision: Groq vision model, Gemini fallback handles image via text description
        const groqMessages = req.body.messages.map((m) => {
          if (Array.isArray(m.content)) {
            return {
              ...m, content: m.content.map((c) =>
                c.type === "image"
                  ? { type: "image_url", image_url: { url: `data:${c.source.media_type};base64,${c.source.data}` } }
                  : c
              )
            };
          }
          return m;
        });

        const text = await callAI({
          system: req.body.system,
          messages: groqMessages,
          max_tokens: req.body.max_tokens || 1500,
          temperature: 0.8,
          model: "meta-llama/llama-4-scout-17b-16e-instruct"
        });
        return res.json({ content: [{ type: "text", text }] });
      }

      // Regular text (Vira Assistant)
      const text = await callAI({
        system: req.body.system,
        messages: req.body.messages,
        max_tokens: req.body.max_tokens || 500,
        temperature: 0.8
      });
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

    const text = await callAI({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: max_tokens || 2000,
      temperature: 0.7
    });
    res.json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Platform Trends endpoint
app.post("/api/trends/platform", async (req, res) => {
  try {
    const { platform, niche, keyword, country } = req.body;

    // Supabase se real crowd data fetch karo
    const { data: trendingData } = await supabase
      .from('trending_styles')
      .select('*')
      .eq('niche', niche)
      .eq('platform', platform)
      .order('generation_count', { ascending: false })
      .limit(3);

    const trendingContext = trendingData?.length
      ? `\nREAL CROWD INTELLIGENCE (actual user behavior on this tool):
${trendingData.map(t => `- "${t.style}" content: used ${t.generation_count} times (${t.pct_share}% of ${niche} creators on ${platform})`).join('\n')}
Prioritize these proven styles in your response.\n`
      : '';

    const prompt = `You are a viral content trend analyst. Generate CURRENT trending content ideas for ${platform} in the ${niche} niche for ${country}.
${trendingContext}
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

    const text = await callAI({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.8
    });
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error("Platform trends error:", err.message);
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

// Text-to-Speech endpoint (Azure TTS)
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voiceName, languageCode, style, rate } = req.body;

    if (!text || !voiceName || !languageCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const speakingRate = rate || "1.0";
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const innerContent = (style && style !== "Default")
      ? `<mstts:express-as style="${style.toLowerCase()}"><prosody rate="${speakingRate}">${escapedText}</prosody></mstts:express-as>`
      : `<prosody rate="${speakingRate}">${escapedText}</prosody>`;

    const ssml = `<speak version='1.0' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${languageCode}'><voice xml:lang='${languageCode}' name='${voiceName}'>${innerContent}</voice></speak>`;

    const response = await fetch(
      `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Azure TTS error:", response.status, errText);
      return res.status(500).json({ error: "TTS generation failed" });
    }

    const audioBuffer = await response.buffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(audioBuffer);

  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: "TTS generation failed" });
  }
});

const PORT = process.env.PORT || 3001;

// Keep alive — ping every 14 minutes
setInterval(() => {
  fetch(`https://viral-tool-1.onrender.com/health`)
    .then(() => console.log("Keep alive ping sent"))
    .catch(() => {});
}, 14 * 60 * 1000);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));