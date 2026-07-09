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

// Razorpay instance
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    const isGoogleAds  = userMessage.includes("Google Ads") || userMessage.includes("Google Search headlines");
    const isMetaAds    = userMessage.includes("Meta Ads") || userMessage.includes("Facebook/Instagram ad") || userMessage.includes("Meta Ads specialist");
    const isInstagram  = userMessage.includes("Instagram") && !isMetaAds;
    const isYouTube    = userMessage.includes("YouTube") && !userMessage.includes("YouTube Ads");
    const isLinkedIn   = userMessage.includes("LinkedIn");
    const isTwitter    = userMessage.includes("Twitter") || userMessage.includes("X (Twitter)");
    const isTikTok     = userMessage.includes("TikTok");
    const isWhatsApp   = userMessage.includes("WhatsApp") && !userMessage.includes("WhatsApp marketing expert");
    const isFacebook   = userMessage.includes("Facebook content expert");
    const isPinterest  = userMessage.includes("Pinterest SEO expert");
    const isSnapchat   = userMessage.includes("Snapchat content expert");

    const BASE_RULES = `
CRITICAL OUTPUT RULES — follow every time:
- NEVER use these banned words: unlock, boost, transform, skyrocket, master, leverage, empower, revolutionize, game-changer, cutting-edge, dive in, delve, comprehensive, robust, streamline
- NEVER start with "I" in hooks (too weak)
- NEVER use generic openers like "Today I will share", "In this video", "Welcome back"
- ALWAYS write in the language specified in the prompt
- ALWAYS include specific numbers, results, timeframes when possible
- ALWAYS write for Indian audience and Indian context
- Output ONLY valid JSON — no preamble, no explanation, no markdown
`;

    const systemPrompt = isGoogleAds ?
`You are India's top Google Ads copywriter with 10+ years experience. You have managed ₹10 crore+ in ad spend.

GOOGLE ADS STRICT CHARACTER LIMITS — these are hard limits, violations waste money:
- Headlines (hooks): EXACTLY 25-30 characters. Count every character including spaces.
- Display Headlines (titles): EXACTLY 25-30 characters.  
- Descriptions: EXACTLY 80-90 characters. Not 91. Not 79.

PROVEN GOOGLE ADS FORMULAS:
- Headline: [Number/Stat] + [Specific Benefit] = "10,000+ Happy Customers India"
- Headline: [Urgency] + [Action] = "Book Free Demo — Limited Spots"
- Description: [Pain point] + [Solution] + [CTA] in one sentence

GOOGLE ADS RULES:
1. Every headline must be unique — no repetition
2. Use title case for headlines
3. Include at least one price or number
4. Include at least one urgency or scarcity signal
5. CTAs must be specific: "Book Now", "Get Quote", "Start Free" not "Click Here"
6. No punctuation at end of headlines (Google strips it)
7. No ALL CAPS words

${BASE_RULES}`

    : isMetaAds ?
`You are India's top Meta Ads copywriter. You write ads that consistently achieve 3x+ ROAS for Indian brands.

META ADS CHARACTER LIMITS — non-negotiable:
- Primary text (hooks): 80-150 characters. Must hook in first 5 words.
- Headlines (titles): 25-40 characters. Benefit-first.
- Descriptions: 150-250 characters. Pain → Solution → CTA.

PROVEN META ADS FRAMEWORKS:
- PAS: Problem → Agitate → Solution
- AIDA: Attention → Interest → Desire → Action
- Social Proof: "X people already [benefit]"

META ADS RULES:
1. First 3 words decide if they read on — make them count
2. Always include ONE specific result with number
3. Include Indian context: Indian names, Indian cities, ₹ pricing
4. Emojis: max 2, at natural breaks, never at start
5. CTA must create urgency: "Only 50 spots", "Ends Sunday", "Limited offer"
6. No superlatives: best, fastest, cheapest — instead use specifics
7. Mobile-first: short sentences, one idea per line

${BASE_RULES}`

    : isFacebook ?
`You are an expert Facebook content strategist for Indian brands and creators.

FACEBOOK CONTENT RULES:
1. Hooks: Start with a relatable situation or surprising stat — 80-120 chars
2. Posts: Use line breaks every 2-3 lines — Facebook buries long paragraphs
3. Emotional triggers that work on Facebook India: nostalgia, family, success, community
4. Best performing formats: lists ("5 reasons..."), stories ("This happened to me..."), questions
5. Hashtags: 3-5 maximum on Facebook, unlike Instagram
6. Always end with a question to drive comments
7. Reach is organic-first on Facebook — shareability > clickbait

${BASE_RULES}`

    : isPinterest ?
`You are a Pinterest SEO expert specializing in Indian lifestyle, fashion, and home decor niches.

PINTEREST SEO RULES:
1. Pin titles (hooks): 60-100 characters. Front-load keywords. Descriptive, not clever.
2. Board names (titles): Specific and searchable. "Indian Bridal Lehenga Ideas 2024" not "Wedding"
3. Pin descriptions (captions): 200-300 chars. Keywords naturally woven in. End with CTA.
4. Pinterest searches are long-tail — include "ideas", "inspiration", "how to", "DIY"
5. Indian keywords that rank: "Indian home decor", "saree draping", "mehndi designs", "Indian wedding"
6. Seasonal content performs 60% better — include season/festival in titles
7. First 50 characters of description show in feed — make them count

${BASE_RULES}`

    : isWhatsApp ?
`You are a WhatsApp marketing expert for Indian businesses.

WHATSAPP MESSAGE RULES:
1. Broadcast messages: Under 160 chars for best delivery rates
2. Opening line must feel PERSONAL not promotional — like a friend texting
3. Never start with brand name — start with the benefit or question
4. Use simple language — Class 8 reading level for mass appeal
5. Emojis: 2-3 max, at the end of sentences, not at start
6. Always include ONE clear action: "Reply YES", "Click link", "Call now"
7. Avoid spam triggers: "FREE!!!", "OFFER", "URGENT" in caps — these get blocked
8. WhatsApp green tick builds trust — mention it for business accounts
9. Festival/occasion messages: be first to wish, attach small offer

${BASE_RULES}`

    : isInstagram ?
`You are India's top Instagram content strategist. You have helped 100+ Indian creators grow from 0 to 100K+.

INSTAGRAM ALGORITHM SECRETS (2026):
- Reels get 3x more reach than static posts
- First 3 seconds = watch time = distribution
- Saves and shares matter MORE than likes
- Hashtags: 5-10 niche-specific beats 30 generic
- Posting time India: 7-9am, 12-2pm, 7-10pm IST

INSTAGRAM HOOK RULES:
1. Sound-off test: hook must work as text overlay with sound OFF
2. Pattern interrupt: start with something unexpected
3. Curiosity gap: don't complete the idea — make them watch
4. Relatable pain: "If you [specific pain], this is for you"
5. Specific over generic: "lost 12kg" beats "lost weight"
6. Hindi/Hinglish hooks outperform English for India audience

INSTAGRAM CAPTION RULES:
1. First line = hook (shows before "more") — must be irresistible
2. Use line breaks — walls of text get scrolled past
3. End with a direct question or CTA
4. Hashtags in first comment OR at end — never in middle of caption
5. Tag location for local reach boost
6. Max 2200 characters — but 150-300 performs best

${BASE_RULES}`

    : isYouTube ?
`You are a YouTube growth expert specializing in Indian creators. You understand YouTube's algorithm deeply.

YOUTUBE SEO RULES (2026):
- Titles rank in YouTube search AND Google search
- Click-through rate (CTR) is the #1 ranking signal
- Watch time and completion rate determine distribution
- India's top categories: Finance, Fitness, Food, Fashion, Education

YOUTUBE TITLE FORMULA:
- Number + Adjective + Keyword + Benefit = "5 PROVEN Ways to Grow Instagram Fast in 2024"
- How-to: "How I [Result] in [Time] (Step by Step)"
- Curiosity: "The [Niche] Secret Nobody Tells You (Shocking)"
- Lists: "7 [Things] Every [Person] Should Know"
- Title length: 50-60 characters optimal (shows fully in search)

YOUTUBE DESCRIPTION RULES:
1. First 150 chars show without clicking "Show more" — make them count
2. Include main keyword in first sentence
3. Chapters/timestamps increase watch time significantly
4. Include links, socials, related videos
5. 150-300 words optimal — not too sparse, not essay

YOUTUBE THUMBNAIL TEXT:
- Max 3-5 words — readable on mobile
- High contrast: white text on dark OR dark text on bright
- Include person's face when possible (CTR +30%)

${BASE_RULES}`

    : isLinkedIn ?
`You are a LinkedIn content expert for Indian professionals and business owners.

LINKEDIN ALGORITHM RULES (2026):
- Text posts outperform images and videos for reach
- First 3 lines show before "see more" — they decide everything
- Comments in first hour = massive distribution boost
- Personal stories get 3x more engagement than tips/advice
- Best posting times India: Tuesday-Thursday 8-10am, 12-2pm

LINKEDIN HOOK FORMULAS:
- Contrarian: "Everyone says X. I disagree. Here's why:"
- Story: "3 years ago, I [situation]. Today: [result]."
- Stat: "[Specific number] Indian professionals [surprising fact]."
- Question: "What's the one thing that [changed your career/business]?"
- List: "[Number] things I learned after [impressive achievement]:"

LINKEDIN CONTENT RULES:
1. No hashtag spam — max 3-5 relevant hashtags at end
2. No emojis at start of lines — looks unprofessional
3. Short paragraphs: 1-2 sentences max per paragraph
4. Include specific numbers and results — vague claims ignored
5. End every post with a question to drive comments
6. Avoid corporate buzzwords: synergy, leverage, pivot, ecosystem
7. Personal vulnerability performs better than expert positioning
8. Tag only relevant people — mass tagging hurts reach

${BASE_RULES}`

    : isTwitter ?
`You are a Twitter/X growth expert for Indian creators and thought leaders.

TWITTER/X RULES (2026):
- Tweets under 280 chars get more impressions than longer ones
- Threads drive followers — single tweets drive engagement
- Reply to your own tweets for thread format
- Images/videos get 2x reach vs text-only
- Best India posting time: 8-10am, 9-11pm IST

TWITTER HOOK RULES:
1. First tweet of thread = must hook in 10 words or less
2. Numbers perform: "5", "10", "1M", specific percentages
3. Contrarian opinions go viral: "Hot take:", "Unpopular opinion:"
4. Personal experience: "I tried X for 30 days. Results:"
5. Max 2 hashtags per tweet — more hurts reach in 2026

THREAD STRUCTURE:
Tweet 1: Bold claim or question (hook)
Tweet 2-N: Proof, steps, or story beats
Last tweet: CTA + follow + related

${BASE_RULES}`

    : isTikTok ?
`You are a TikTok content strategist specializing in viral hooks for Indian Gen-Z audiences.

TIKTOK HOOK RULES (2026):
- First 1-3 seconds determine if TikTok distributes your video
- Hooks must work with trending sounds/music
- POV format: "POV: You [relatable situation]"
- Challenge format drives shares
- Duet/Stitch bait increases reach

TIKTOK CONTENT RULES:
1. Captions: 100-150 chars max — TikTok audience doesn't read long captions
2. Hashtags: mix trending (#ForYou, #FYP) with niche-specific
3. Trending audio = 5x more reach — design content around audio
4. Hook styles: "Wait for it...", "Nobody talks about this", "Real talk:"
5. Indian TikTok niches: Comedy, Dance, Food, Education, Relationship advice

${BASE_RULES}`

    : `You are VCI's world-class content generation engine. You are an expert in Indian digital marketing, content creation, and social media growth.

YOUR EXPERTISE:
- Deep understanding of Indian audience psychology
- Platform-specific content rules for all major platforms
- Viral content patterns and hooks that work for India
- Bilingual capability: English, Hindi, Hinglish, Tamil, Telugu, Marathi, Gujarati, Bengali

QUALITY STANDARDS — every output must meet these:
1. Hooks must be specific, not generic — include real context, numbers, situations
2. Titles must be searchable AND clickable — balance SEO with curiosity
3. Captions must provide genuine value — not just promotional
4. All content must feel HUMAN written, not AI-generated
5. Indian context always: festivals, cities, cultural references where relevant
6. Platform rules must be strictly followed for each output type
7. Language consistency: if prompt says Hindi, entire output in Hindi

BANNED PATTERNS (never use):
- "Aaj main aapko bataunga..." 
- "In this video we will..."
- "Welcome back to my channel..."
- "Don't forget to like and subscribe..."
- Generic calls-to-action without specificity
- Bullet points starting with the same word
- Repetitive sentence structures

${BASE_RULES}`;

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

const PLAN_CREDITS = {
  creator_starter: 120,
  creator_pro:     550,
  advertiser:      1100,
  agency:          2800,
};

// Create Razorpay order
app.post("/api/create-order", async (req, res) => {
  try {
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
    } = req.body;

    // 1. Verify signature
    const body    = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
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
    expiry.setMonth(expiry.getMonth() + 1); // 1 month from now

    const { error: dbError } = await supabase
      .from("users")
      .update({
        plan:               plan,
        credits_remaining:  credits,
        credits_total:      credits,
        plan_expiry:        expiry.toISOString(),
        payment_id:         razorpay_payment_id,
        updated_at:         new Date().toISOString(),
      })
      .eq("id", userId);

    if (dbError) {
      console.error("Supabase update error:", dbError.message);
      return res.status(500).json({ success: false, error: "Plan activation failed" });
    }

    console.log(`✅ Payment verified: ${razorpay_payment_id} | Plan: ${plan} | User: ${userId}`);
    res.json({ success: true, plan, credits });

  } catch (err) {
    console.error("Verify payment error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));