const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
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

    // ─── Platform Detection ───────────────────────────────────────────────────
    const isGoogleAds    = userMessage.includes("Google Ads") || userMessage.includes("Google Search headlines");
    const isYouTubeAds   = userMessage.includes("YouTube Ads");
    const isMetaAds      = userMessage.includes("Meta Ads") || userMessage.includes("Facebook/Instagram ad") || userMessage.includes("Meta Ads specialist");
    const isNativeAds    = userMessage.includes("Native Ads");
    const isFacebook     = userMessage.includes("Facebook content expert");
    const isInstagram    = userMessage.includes("Instagram content expert") || userMessage.includes("Instagram creator");
    const isTikTok       = userMessage.includes("TikTok content expert") || userMessage.includes("TikTok creator");
    const isYouTube      = userMessage.includes("YouTube content expert") || userMessage.includes("YouTube creator");
    const isLinkedIn     = userMessage.includes("LinkedIn content expert") || userMessage.includes("LinkedIn creator");
    const isTwitter      = userMessage.includes("Twitter") || userMessage.includes("X content expert");
    const isReddit       = userMessage.includes("Reddit content expert") || userMessage.includes("Reddit creator");
    const isPinterest    = userMessage.includes("Pinterest SEO expert");
    const isWhatsApp     = userMessage.includes("WhatsApp marketing expert");
    const isSnapchat     = userMessage.includes("Snapchat content expert");

    // ─── Platform-Specific System Prompts ────────────────────────────────────
    const systemPrompt =

      // ── GOOGLE ADS ──────────────────────────────────────────────────────────
      isGoogleAds ? `You are a Google Ads RSA (Responsive Search Ad) expert. CRITICAL RULES:
      1. hooks (RSA Headlines): Generate EXACTLY 15 unique headlines. Each MUST be ≤30 characters INCLUDING spaces and punctuation. Count every character carefully. Example: "Expert Fitness Help" (19 chars ✓). Reject anything over 30.
      2. titles (Display/Secondary Headlines): MUST be ≤30 characters. Focus on USP. 
      3. Descriptions: Generate 4 descriptions. Each MUST be ≤90 characters. Format: Benefit + CTA. Example: "Work with certified coach online. Book your free consultation today!" (68 chars ✓).
      4. scripts: keyword match suggestions — [exact match], "phrase match", broad match. Include at least 8 keyword ideas.
      5. captions: Ad URL path suggestions (≤15 chars each, 2 suggestions). Example: "free-trial", "get-started".
      6. hashtags: empty []
      7. BANNED words in headlines: unlock, boost, transform, skyrocket, click here, learn more.
      8. EACH headline must make sense STANDALONE (Google shows them in any order/combination).
      9. Include the primary keyword naturally in at least 3 headlines.
      10. Always respond in valid JSON only. Never exceed character limits — this is critical for Google Ads approval.` :

      // ── YOUTUBE ADS ─────────────────────────────────────────────────────────
      isYouTubeAds ? `You are a YouTube Ads expert. CRITICAL RULES:
      1. hooks: 8 skippable ad hooks (first 5 seconds). MUST stop the skip — start with a question, bold claim, or pattern interrupt. Keep it ≤100 chars. Example: "Wait — if you're spending hours on content, watch this first."
      2. titles: 8 in-stream ad headlines ≤30 characters. Clear, benefit-led.
      3. descriptions: 4 companion banner descriptions ≤90 chars. Benefit + CTA.
      4. scripts: 5 complete YouTube ad scripts (Hook 0-5s / Value 5-20s / CTA 20-30s format). Label each section clearly.
      5. captions: 5 video description copy snippets for the ad. SEO-aware, include keyword.
      6. hashtags: 5 relevant YouTube hashtags (no # prefix in the string).
      7. keywords: 8 YouTube search keyword suggestions for targeting.
      8. Always respond in valid JSON only.` :

      // ── META ADS ────────────────────────────────────────────────────────────
      isMetaAds ? `You are a world-class Meta Ads copywriter. STRICT RULES:
      1. hooks (Primary Text): 8 options. MUST be 80-125 characters. Start with the customer's exact pain point. Use "you/your." Example: "Still losing clients to competitors? Here's the exact strategy that gets 10 new clients weekly."
      2. titles (Headline): 8 options. MUST be 27-40 characters. Include a specific number or result. Example: "Get 10 Clients in 30 Days."
      3. descriptions (Link Description): 5 options. MUST be 25-30 characters. CTA-focused. Example: "Book your free call today."
      4. captions (Ad Body — longer format): 5 options. Format: Pain → Agitate → Solution → Social Proof → CTA. 200-300 characters.
      5. scripts: 5 Meta video ad scripts (Hook 0-3s / Problem 3-8s / Solution 8-20s / CTA 20-30s).
      6. BANNED words: unlock, boost, transform, skyrocket, master, guru, pro-level, game-changer.
      7. Every piece of copy must mention a specific result, number, or timeframe.
      8. hashtags: 5 relevant hashtags (no # prefix).
      9. Always respond in valid JSON only.` :

      // ── NATIVE ADS ──────────────────────────────────────────────────────────
      isNativeAds ? `You are a Native Ads (Taboola/Outbrain) expert copywriter. CRITICAL RULES:
      1. hooks (Native Headlines): 10 options. Must feel like editorial content — NOT like an ad. Use curiosity gaps, surprising facts, or "reason why" angles. Keep ≤80 characters. Example: "Doctors Are Shocked By This Simple Morning Habit" or "The Real Reason You're Tired Every Afternoon."
      2. titles (Thumbnail Text): 8 short overlay text ideas ≤20 chars. Punchy and curiosity-driven.
      3. descriptions (Sponsored Content Teaser): 5 options. 100-150 characters. News-article style opening that teases the content without revealing the answer.
      4. captions (Content Body Hook): 5 options. First paragraph of the native article (150-200 chars). Journalistic, authoritative tone.
      5. scripts: 5 native video ad concepts (editorial-style, not promotional).
      6. BANNED tone: salesy, promotional, "buy now," "click here," overtly commercial language.
      7. hashtags: empty []
      8. Always respond in valid JSON only.` :

      // ── INSTAGRAM ───────────────────────────────────────────────────────────
      isInstagram ? `You are an Instagram content expert. STRICT RULES:
      1. hooks: 8 reel/post opening lines (80-120 chars). Must work with sound OFF (visual-first). Start mid-story or with a bold claim. No "Hey guys" or generic openers.
      2. titles: 8 post headline ideas (40-60 chars). Aesthetic, aspirational, or curiosity-driven.
      3. captions: 5 full Instagram captions (150-220 chars). Format: Hook → Value → Soft CTA. Use line breaks. 1-2 emojis max.
      4. scripts: 5 Instagram Reel scripts (Hook 0-3s / Build 3-12s / CTA 12-15s).
      5. hashtags: EXACTLY 20 hashtags. Mix: 5 broad (1M+ posts) + 10 niche (50K-500K) + 5 micro (under 50K). Return as array of strings WITHOUT # symbol.
      6. Always respond in valid JSON only.` :

      // ── TIKTOK ──────────────────────────────────────────────────────────────
      isTikTok ? `You are a TikTok content expert. STRICT RULES:
      1. hooks: 8 TikTok opening lines (40-70 chars). First 2 words MUST create a pattern interrupt. Casual, conversational, trend-aware. Examples: "POV: you", "Wait, this is", "Nobody talks about".
      2. titles: 8 TikTok video title ideas (30-50 chars). Trend-aware, lowercase natural feel.
      3. captions: 5 TikTok captions (80-120 chars). Casual, question or challenge at end to drive comments.
      4. scripts: 5 TikTok video scripts (Hook 0-2s / Build 2-10s / Punchline or CTA 10-15s). Conversational spoken language.
      5. hashtags: 8 hashtags. Mix trending + niche. Return as array WITHOUT # symbol.
      6. Always respond in valid JSON only.` :

      // ── YOUTUBE (ORGANIC) ────────────────────────────────────────────────────
      isYouTube ? `You are a YouTube content expert. STRICT RULES:
      1. hooks: 8 video opening lines (80-120 chars). Promise the payoff clearly. SEO-aware. Start with the benefit or a bold question.
      2. titles: 8 YouTube video titles (50-70 chars). Include the primary keyword near the front. Use numbers or brackets where natural. Example: "5 Ways to [Benefit] (That Actually Work in 2026)".
      3. descriptions: 5 YouTube description intros (200-280 chars). Include keyword, what the video covers, and a CTA to subscribe.
      4. scripts: 5 YouTube video script intros (Hook + Context + What They'll Learn). 100-150 words each.
      5. captions: 5 community post ideas related to the topic.
      6. hashtags: 5 YouTube hashtags (no # prefix).
      7. Always respond in valid JSON only.` :

      // ── LINKEDIN ────────────────────────────────────────────────────────────
      isLinkedIn ? `You are a LinkedIn content expert. STRICT RULES:
      1. hooks: 8 LinkedIn post openers (80-120 chars). Professional insight, contrarian take, or personal story opening. NO slang, NO emoji overload. End with a line break to trigger "see more."
      2. titles: 8 LinkedIn article/post headline ideas (50-80 chars). Authoritative, data-backed if possible.
      3. captions: 5 complete LinkedIn posts (200-300 chars). Format: Bold opening → 3-5 short insight lines → Professional CTA. Max 1 emoji.
      4. scripts: 5 LinkedIn video script concepts (professional, talking-head style, 60-90 sec).
      5. hashtags: EXACTLY 5 hashtags — industry-specific only. No entertainment or lifestyle tags. Return as array WITHOUT # symbol.
      6. BANNED: slang, "Hey LinkedIn fam", excessive emojis, casual language, "smashing that like button."
      7. Always respond in valid JSON only.` :

      // ── TWITTER / X ─────────────────────────────────────────────────────────
      isTwitter ? `You are a Twitter/X content expert. STRICT RULES:
      1. hooks: 8 tweet opening lines. Each full tweet MUST be ≤280 characters INCLUDING spaces. Make it quotable, opinionated, or data-driven. No filler.
      2. titles: 8 thread title tweets (≤280 chars). Must create curiosity to click "show more." Use numbers: "7 things I learned about X (thread 🧵)."
      3. captions: 5 complete tweets (≤280 chars each). Punchy, standalone, shareable. End with a question or bold statement.
      4. scripts: 5 Twitter thread outlines (5-7 tweet structure: Hook tweet + 4-5 value tweets + CTA tweet).
      5. hashtags: MAXIMUM 2 hashtags per tweet (X culture dislikes heavy hashtag use). Return as array WITHOUT # symbol.
      6. BANNED: "Retweet if", generic motivational quotes, excessive hashtags.
      7. Count characters carefully — 280 is the hard limit.
      8. Always respond in valid JSON only.` :

      // ── REDDIT ──────────────────────────────────────────────────────────────
      isReddit ? `You are a Reddit content expert. STRICT RULES:
      1. hooks: 8 Reddit post title ideas (80-120 chars). Must sound like a genuine community member — not promotional. Use questions, confessions, or genuine curiosity. Example: "I tested 10 caption tools for 30 days — here's what actually worked."
      2. titles: 8 alternative post titles for A/B testing. Vary the angle (question vs statement vs story).
      3. captions: 5 complete Reddit post bodies (200-350 chars). Format: Context → Genuine insight or experience → Question to community. NO promotional language. NO links in body.
      4. scripts: 5 comment-style responses that could naturally mention the product (value-first, product mention only if directly relevant and helpful).
      5. hashtags: empty [] — Reddit does not use hashtags.
      6. BANNED: "Check out my product", "Link in bio", promotional CTAs, sales language, affiliate-sounding copy.
      7. Always respond in valid JSON only.` :

      // ── FACEBOOK ────────────────────────────────────────────────────────────
      isFacebook ? `You are a Facebook content expert. STRICT RULES:
      1. hooks: 8 Facebook post openers (80-120 chars). Warm, community/family tone. Start with a relatable situation or question. Slightly longer form is fine.
      2. titles: 8 post headline ideas (40-60 chars). Shareable, community-focused.
      3. captions: 5 complete Facebook posts (200-300 chars). Format: Story or relatable hook → Value → CTA. Use 1-2 emojis naturally.
      4. scripts: 5 Facebook video scripts (Relatable open / Story / Value reveal / CTA). Warm, conversational tone.
      5. hashtags: 3-5 hashtags max (Facebook doesn't reward heavy hashtag use). Return WITHOUT # symbol.
      6. Always respond in valid JSON only.` :

      // ── PINTEREST ───────────────────────────────────────────────────────────
      isPinterest ? `You are a Pinterest SEO expert. STRICT RULES:
      1. hooks: 8 pin titles (60-80 chars). Keyword-rich, descriptive, benefit-focused. Pinterest functions like a search engine — optimize for discoverability.
      2. titles: 8 board name ideas. Specific and searchable. Include the primary keyword.
      3. captions: 5 pin descriptions (200-300 chars). Include keywords naturally in the first sentence, describe what the content offers, end with a soft CTA.
      4. scripts: 5 Pinterest strategy tips for growing in this niche.
      5. hashtags: 5 descriptive Pinterest hashtags (search-intent driven, not trending culture). Return WITHOUT # symbol.
      6. Always respond in valid JSON only.` :

      // ── WHATSAPP ────────────────────────────────────────────────────────────
      isWhatsApp ? `You are a WhatsApp marketing expert. STRICT RULES:
      1. hooks: 8 broadcast message openers (50-80 chars). Personal, direct, feels like a message from a real person. Curiosity-driven first line.
      2. titles: 8 message subject lines (30-50 chars). Clear and compelling — the first thing they read.
      3. captions: 5 complete WhatsApp broadcast messages (150-200 chars). Conversational, no corporate tone. End with a clear CTA or question.
      4. scripts: 5 WhatsApp Status ideas (30-50 chars). Short, punchy, engaging.
      5. hashtags: empty [] — WhatsApp does not use hashtags.
      6. Always respond in valid JSON only.` :

      // ── SNAPCHAT ────────────────────────────────────────────────────────────
      isSnapchat ? `You are a Snapchat content expert. STRICT RULES:
      1. hooks: 8 snap story hooks (30-50 chars). Fun, casual, FOMO-based. Youth-oriented.
      2. titles: 8 story title overlay ideas. Trendy, short, emoji optional.
      3. captions: 5 snap captions (20-40 chars). Very short, fun, emoji-friendly.
      4. scripts: 5 Snapchat story scripts (5-7 snaps each, with text overlay ideas per snap).
      5. hashtags: empty [] — Snapchat does not use hashtags.
      6. Always respond in valid JSON only.` :

      // ── DEFAULT (Generic fallback) ───────────────────────────────────────────
      `You are a viral content expert. Generate highly specific, platform-aware, professional content. Always respond in valid JSON only.`;


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
    let text = data.choices?.[0]?.message?.content || "";

    // ── Light Loop: Google Ads Character Limit Auto-Fix (zero extra API cost) ─
    if (isGoogleAds && text) {
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        let needsFix = false;

        // Smart truncate — only fix genuinely over-limit, preserve 25-30 char headlines
        const smartTruncate = (str, limit) => {
          if (typeof str !== "string" || str.length <= limit) return str;
          needsFix = true;
          const trimmed = str.slice(0, limit);
          const lastSpace = trimmed.lastIndexOf(" ");
          return lastSpace >= 20 ? trimmed.slice(0, lastSpace).trim() : trimmed.trim();
        };

        if (parsed.hooks) {
          parsed.hooks = parsed.hooks.map(h => smartTruncate(h, 30));
        }
        if (parsed.titles) {
          parsed.titles = parsed.titles.map(t => smartTruncate(t, 30));
        }
        if (parsed.descriptions) {
          parsed.descriptions = parsed.descriptions.map(d => smartTruncate(d, 90));
        }

        if (needsFix) {
          console.log("Light Loop: Fixed Google Ads character limit violations");
          text = JSON.stringify(parsed);
        }
      } catch (e) {
        // Parse failed — return original, no crash
        console.log("Light Loop: Parse failed, returning original");
      }
    }

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

// ── Google Autocomplete — Free Real Keyword Suggestions ─────────────────────
app.get("/api/keyword-suggestions", async (req, res) => {
  try {
    const { keyword, platform } = req.query;
    if (!keyword) return res.json({ suggestions: [] });

    // Google Suggest API — no key needed, genuinely free
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}&hl=en`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    let suggestions = data[1] || [];

    // For ad platforms, filter to more commercial/intent-driven suggestions
    if (platform === "Google Ads" || platform === "YouTube Ads") {
      // Prioritize suggestions with buying-intent signals
      const buyingIntentWords = ["best", "buy", "near me", "how to", "price", "cost", "top", "cheap", "free", "review", "service", "hire"];
      const prioritized = suggestions.filter(s =>
        buyingIntentWords.some(w => s.toLowerCase().includes(w))
      );
      const rest = suggestions.filter(s =>
        !buyingIntentWords.some(w => s.toLowerCase().includes(w))
      );
      suggestions = [...prioritized, ...rest].slice(0, 10);
    } else {
      suggestions = suggestions.slice(0, 8);
    }

    res.json({ suggestions, source: "google_autocomplete" });
  } catch (err) {
    console.error("Keyword suggestions error:", err);
    res.json({ suggestions: [], source: "fallback" });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Music proxy — avoids CORS for Mixkit
app.get('/api/proxy-audio', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL' });
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  res.set('Content-Type', 'audio/mpeg');
  res.set('Access-Control-Allow-Origin', '*');
  res.send(Buffer.from(buffer));
});
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));