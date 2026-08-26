const express  = require("express");
const cors     = require("cors");
const fetch    = require("node-fetch");
const crypto   = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Razorpay instance — only init if keys present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized");
} else {
  console.warn("⚠️  Razorpay keys missing — payment routes disabled");
}

// ── AI PROVIDER: Groq primary, Gemini fallback ────────────────────────────
// Groq hits rate limit (429) → automatically switches to Gemini
// User never sees an error, just seamless generation

async function callGroq({ system, messages, max_tokens = 1500, temperature = 0.7, model = "openai/gpt-oss-120b" }) {
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  // Try Groq
  try {
    const text = await callGroq(options);
    console.log("✅ AI: Groq");
    return text;
  } catch (err) {
    console.log(`⚠️ Groq failed (${err.message?.slice(0,50)}) → Gemini`);
  }

  // Try Gemini
  try {
    const text = await callGemini(options);
    console.log("✅ AI: Gemini fallback");
    return text;
  } catch (err) {
    console.log(`❌ Gemini also failed: ${err.message?.slice(0,50)}`);
  }

  // Both failed — try Groq with smaller model as last resort
  // NOTE: llama-3.1-8b-instant is TEXT-ONLY (no vision support).
  // If the original request contained an image, skip this fallback —
  // sending image content to a text-only model returns a 400 invalid_request_error.
  const hasImageContent = options.messages?.some((m) =>
    Array.isArray(m.content) && m.content.some((c) => c.type === "image_url")
  );

  if (hasImageContent) {
    throw new Error("AI temporarily busy. Please try again in a few seconds.");
  }

  try {
    console.log("🔄 Trying Groq 8B model...");
    const text = await callGroq({ ...options, model: "llama-3.1-8b-instant" });
    console.log("✅ AI: Groq 8B fallback");
    return text;
  } catch (err) {
    throw new Error("AI temporarily busy. Please try again in a few seconds.");
  }
}

async function callClaude({ system, messages, max_tokens = 1500, model = "claude-haiku-4-5" }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens,
      system: system || undefined,
      messages
    }),
    signal: AbortSignal.timeout(30000)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// Smart routing — plan ke hissab se model choose karo
async function callAISmart(options, plan) {
  const aiModel = getAIModel(plan);

  // Free users → Groq always (₹0 cost)
  if (aiModel === "groq") {
    return callAI(options);
  }

  // Paid users → Claude (Haiku or Sonnet)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const text = await callClaude({ ...options, model: aiModel });
      console.log(`✅ AI: Claude (${aiModel}) — plan: ${plan}`);
      return text;
    } catch (err) {
      console.log(`⚠️ Claude failed (${err.message?.slice(0,50)}) → Groq fallback`);
    }
  }

  // Fallback to Groq if Claude fails or key missing
  return callAI(options);
}

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.options("/api/generate", cors());

app.post("/api/generate", async (req, res) => {
  console.log("Request received");
  try {
    const { messages, max_tokens, plan } = req.body;

    // Vira Assistant + Image AI ke liye
    if (req.body.system) {
      const hasImage = req.body.messages?.some((m) =>
        Array.isArray(m.content) && m.content.some((c) => c.type === "image")
      );

      if (hasImage) {
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

        // FIX (July 2026): meta-llama/llama-4-scout-17b-16e-instruct was
        // deprecated by Groq on June 17, 2026. Replaced with Groq's current
        // vision-capable model, qwen/qwen3.6-27b (accepts text + images).
        const text = await callAI({
          system: req.body.system,
          messages: groqMessages,
          max_tokens: req.body.max_tokens || 1500,
          temperature: 0.8,
          model: "qwen/qwen3.6-27b"
        });
        return res.json({ content: [{ type: "text", text }] });
      }

      // Vira Assistant — always Groq (free, fast)
      const text = await callAI({
        system: req.body.system,
        messages: req.body.messages,
        max_tokens: req.body.max_tokens || 500,
        temperature: 0.8
      });
      return res.json({ content: [{ type: "text", text }] });
    }

    const userMessage = messages[messages.length - 1].content;

    const isGoogleAds  = userMessage.includes("Google Ads") || userMessage.includes("Google Search headlines");
    const isMetaAds    = userMessage.includes("Meta Ads") || userMessage.includes("Facebook/Instagram ad") || userMessage.includes("Meta Ads specialist");
    const isInstagram  = userMessage.includes("Instagram") && !isMetaAds;
    const isYouTube    = userMessage.includes("YouTube") && !userMessage.includes("YouTube Ads");
    const isLinkedIn   = userMessage.includes("LinkedIn");
    const isTwitter    = userMessage.includes("Twitter") || userMessage.includes("X (Twitter)");
    const isWhatsApp   = userMessage.includes("WhatsApp") && !userMessage.includes("WhatsApp marketing expert");
    const isFacebook   = userMessage.includes("Facebook content expert");
    const isPinterest  = userMessage.includes("Pinterest SEO expert");
    const isSnapchat   = userMessage.includes("Snapchat content expert");

    // Compact but powerful system prompts — optimized for token efficiency
    const BASE = `You are VCI, India's #1 AI content tool. Rules: Never use generic openers like "Today I will" or "In this video". Always write for Indian audience. Include specific numbers/results. No banned words: unlock, boost, transform, skyrocket, leverage. Output ONLY valid JSON.`;

    const systemPrompt = isGoogleAds ?
`${BASE} Google Ads expert. STRICT: Headlines 25-30 chars, Descriptions 80-90 chars. Use numbers, urgency, specific CTAs. No superlatives.`
    : isMetaAds ?
`${BASE} Meta Ads expert. STRICT: Hooks 80-125 chars, start with pain point. Headlines 30-40 chars with specific result. Descriptions 200-250 chars using PAS framework. Include Indian context.`
    : isFacebook ?
`${BASE} Facebook content expert for India. Use story-based hooks 80-120 chars. Shareable community content. End with question. Max 3-5 hashtags.`
    : isPinterest ?
`${BASE} Pinterest SEO expert India. Titles 60-80 chars, keyword-rich. Descriptions 200-300 chars. Include Indian keywords.`
    : isWhatsApp ?
`${BASE} WhatsApp marketing expert India. Messages under 160 chars. Personal tone, not promotional. Clear single CTA. Avoid spam triggers.`
    : isInstagram ?
`${BASE} Instagram expert India. Hooks must work sound-OFF. Specific over generic: "lost 12kg" beats "lost weight". Captions 150-300 chars best. 5-10 niche hashtags.`
    : isYouTube ?
`${BASE} YouTube SEO expert India. Titles 50-60 chars, front-load keyword. CTR-optimized. Descriptions first 150 chars crucial.`
    : isLinkedIn ?
`${BASE} LinkedIn expert India. First 3 lines before "see more" decide everything. Personal stories 3x engagement. No corporate buzzwords. Max 3-5 hashtags. End with question.`
    : isTwitter ?
`${BASE} Twitter/X expert India. Under 280 chars. Numbers and contrarian opinions go viral. Max 2 hashtags.`
    : isSnapchat ?
`${BASE} Snapchat expert. Fun casual hooks 30-50 chars. Short captions 20-40 chars. Youth-focused Indian content.`
    : `${BASE} Expert in Indian digital marketing and content creation. Platform-specific rules, Indian audience psychology, bilingual Hindi/English capability.`;

    const text = await callAISmart({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: max_tokens || 2000,
      temperature: 0.7
    }, plan || "free");
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

    const prompt = `You are India's #1 social media trend analyst. You track viral content across all platforms daily.

Platform: ${platform}
Niche: ${niche}
Country: ${country}
Keyword: ${keyword || niche}
${trendingContext}

Generate HIGHLY SPECIFIC, ACTIONABLE trending content intelligence. Be specific to India, not generic global trends.

RULES:
- trending_formats: Must be actually trending in 2026 on ${platform} — not generic advice
- trending_topics: India-specific topics, current events, seasonal context
- All examples must be production-ready — someone could post them TODAY
- best_posting_times: India timezone (IST), specific hours, different for weekdays vs weekends
- hashtags: Mix of high-volume (#Fitness 50M posts) and niche-specific (#FitnessIndia 2M posts)
- pro_tip: One non-obvious, specific tip nobody else is giving

Return ONLY valid JSON:
{
  "platform": "${platform}",
  "niche": "${niche}",
  "trending_formats": [
    { "format": "Format name", "description": "Exactly what to do", "example": "Ready-to-use example for ${niche}", "why_trending": "Specific reason with data" }
  ],
  "trending_topics": [
    { "topic": "Specific topic", "hook": "Ready-to-post hook line", "content_angle": "Unique angle others haven't done" }
  ],
  "best_posting_times": "Specific IST times for ${platform} ${niche} audience",
  "trending_hashtags": ["#specific1", "#specific2", "#specific3", "#niche4", "#broad5"],
  "pro_tip": "One non-obvious, high-impact tip for ${niche} on ${platform} right now"
}`;

    const text = await callAI({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.75
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

// ── RAZORPAY PAYMENT ROUTES ───────────────────────────────────────────────────

// ── FINAL PLANS — Haiku for Starter/Pro, Sonnet for Advertiser/Agency ────────
const PLAN_CREDITS = {
  creator_starter: 100,   // Haiku — cheap, 46% margin
  creator_pro:     350,   // Haiku — 63% margin
  advertiser:      700,   // Sonnet — 48% margin
  agency:          2000,  // Sonnet — 66% margin
};

const PLAN_PRICES = {
  creator_starter: 499,
  creator_pro:     1299,
  advertiser:      2499,
  agency:          8999.99,
};

const PLAN_LABELS = {
  creator_starter: "Creator Starter",
  creator_pro:     "Creator Pro",
  advertiser:      "Advertiser",
  agency:          "Agency",
};

// ── AI MODEL ROUTING ──────────────────────────────────────────────────────────
// Free users  → Groq (₹0 cost always)
// Starter/Pro → Claude Haiku ($0.25/M in, $1.25/M out — 46-63% margin)
// Advertiser+ → Claude Sonnet ($3/M in, $15/M out — 48-66% margin)
// Switch: set ANTHROPIC_API_KEY in Render when ready (10+ paid users)

function getAIModel(plan) {
  if (!process.env.ANTHROPIC_API_KEY) return "groq"; // fallback if no key
  if (plan === "free" || !plan) return "groq";
  if (plan === "creator_starter" || plan === "creator_pro") return "claude-haiku-4-5";
  if (plan === "advertiser" || plan === "agency") return "claude-sonnet-4-5";
  return "groq";
}

// ── TELEGRAM NOTIFICATION ─────────────────────────────────────────────────
async function sendTelegramNotification(message) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) return;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text:       message,
        parse_mode: "HTML"
      })
    });
  } catch (err) {
    console.log("Telegram notification failed (non-critical):", err.message);
  }
}

// Create Razorpay order
app.post("/api/create-order", async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ error: "Payment gateway not configured" });
    const { amount, plan } = req.body;
    if (!amount || !plan) return res.status(400).json({ error: "amount and plan required" });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount), // paise mein
      currency: "INR",
      receipt:  `vci_${plan}_${Date.now()}`,
      notes:    { plan }
    });

    res.json({ orderId: order.id });
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ error: "Could not create order: " + err.message });
  }
});

// Verify payment + activate plan in Supabase
app.post("/api/verify-payment", async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, error: "Payment gateway not configured" });
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
      userEmail,
    } = req.body;

    // 1. Verify signature
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.error("Invalid Razorpay signature");
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    // 2. Get credits for this plan
    const credits = PLAN_CREDITS[plan];
    if (!credits) return res.status(400).json({ success: false, error: "Invalid plan" });

    // 3. Update Supabase — activate plan + add credits
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const { error: dbError } = await supabase
      .from("users")
      .update({
        plan:              plan,
        credits_remaining: credits,
        credits_total:     credits,
        plan_expiry:       expiry.toISOString(),
        payment_id:        razorpay_payment_id,
        updated_at:        new Date().toISOString(),
      })
      .eq("id", userId);

    if (dbError) {
      console.error("Supabase update error:", dbError.message);
      return res.status(500).json({ success: false, error: "Plan activation failed" });
    }

    // 4. Send Telegram notification
    const planLabel  = PLAN_LABELS[plan] || plan;
    const planPrice  = PLAN_PRICES[plan] || 0;
    const expiryDate = expiry.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

    await sendTelegramNotification(
`💰 <b>NEW PAYMENT — VCI</b>

👤 User: <code>${userEmail || userId}</code>
📦 Plan: <b>${planLabel}</b>
💵 Amount: <b>₹${planPrice}</b>
⚡ Credits: <b>${credits}</b>
🔑 Payment ID: <code>${razorpay_payment_id}</code>
📅 Expires: ${expiryDate}
✅ Plan activated automatically`
    );

    console.log(`✅ Payment verified: ${razorpay_payment_id} | Plan: ${plan} | User: ${userId}`);
    res.json({ success: true, plan, credits });

  } catch (err) {
    console.error("Verify payment error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));