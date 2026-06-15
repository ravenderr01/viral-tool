import Onboarding from "./Onboarding";
import AdminDashboard from "./AdminDashboard";
import ImageContent from "./ImageContent";
import { useState, useEffect, useRef } from "react";
import VCIAssistant from "./VCIAssistant";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Contact from "./Contact";
import Trends from "./Trends";
import Legal from "./Legal";
import Plans from "./plans";
import { Helmet } from 'react-helmet-async';
// ============================================
// 🔧 YOUR DETAILS — change these 2 lines only
const YOUR_UPI_ID    = "9315133390@ptyes";
const YOUR_PAYPAL_ME = "https://paypal.me/yourname";
const SUPPORT_PHONE = "+91 9315133390";
// ============================================

const PLANS = {
  free:        { label: "Free",        limit: 10,   priceINR: 0,    priceUSD: 0  },
  starter:     { label: "Starter",     limit: 100,  priceINR: 299,  priceUSD: 4,  badge: "🔥 Popular" },
  pro_creator: { label: "Pro Creator", limit: 400,  priceINR: 999,  priceUSD: 12, badge: "⚡ Best Value" },
  growth:      { label: "Growth",      limit: 150,  priceINR: 799,  priceUSD: 10, badge: "📈 Business" },
  business:    { label: "Business",    limit: 400,  priceINR: 1999, priceUSD: 24, badge: "💎 Pro" },
  agency:      { label: "Agency",      limit: 1000, priceINR: 4999, priceUSD: 59, badge: "👑 Premium" },
};


const NICHE_EXAMPLES = {
  Fitness:              ["weight loss", "gym motivation", "protein diet", "HIIT workout"],
  Business:             ["passive income", "side hustle", "startup tips", "freelancing"],
  Tech:                 ["AI tools", "ChatGPT hacks", "coding tips", "app development"],
  Lifestyle:            ["morning routine", "productivity hacks", "minimalism", "self care"],
  Food:                 ["meal prep", "healthy recipes", "street food", "viral recipes"],
  "Daily Vlog":         ["day in my life", "vlog ideas", "daily routine", "life update"],
  "Comedy & Entertainment": ["funny skits", "comedy reels", "meme content", "trending jokes"],
  "Sports":             ["cricket tips", "football highlights", "sports motivation", "fitness training"],
  "Spirituality":       ["meditation tips", "manifestation", "spiritual growth", "mindfulness"],
  "AI & Automation":    ["AI tools", "automation hacks", "ChatGPT tips", "AI side hustle"],
  "Personal Finance":   ["invest money", "save money fast", "passive income", "budget tips"],
  "Mental Health":      ["anxiety tips", "self care routine", "mindfulness", "stress relief"],
  "Beauty & Skincare":  ["skincare routine", "glow up tips", "makeup hacks", "anti aging"],
  "Ads & Marketing":    ["facebook ads", "google ads", "ad copywriting", "marketing strategy"],
  Education:            ["online course", "study tips", "e-learning", "skill development"],
  Travel:               ["travel tips", "budget travel", "solo travel", "travel vlog"],
  "Fashion & Style":    ["outfit ideas", "fashion tips", "style guide", "trendy outfits"],
  "Real Estate":        ["property investment", "home buying tips", "real estate India", "rental income"],
  Motivational:         ["success mindset", "morning motivation", "self improvement", "hustle tips"],
  "Health & Wellness":  ["healthy lifestyle", "nutrition tips", "yoga benefits", "sleep tips"],
  Gaming:               ["gaming tips", "game review", "gaming setup", "mobile gaming"],
};
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const LANGUAGE_GROUPS = [
  {
    country: "🇮🇳 India",
    code: "IN",
    languages: [
      { code: "hi", label: "Hindi" },
      { code: "bn", label: "Bengali" },
      { code: "ta", label: "Tamil" },
      { code: "te", label: "Telugu" },
      { code: "mr", label: "Marathi" },
      { code: "gu", label: "Gujarati" },
      { code: "kn", label: "Kannada" },
      { code: "ml", label: "Malayalam" },
      { code: "pa", label: "Punjabi" },
      { code: "or", label: "Odia" },
      { code: "as", label: "Assamese" },
      { code: "ur", label: "Urdu" },
    ]
  },
  {
    country: "🇬🇧 English",
    code: "EN",
    languages: [
      { code: "en", label: "English" },
    ]
  },
  {
    country: "🇺🇸 USA",
    code: "US",
    languages: [
      { code: "en-us", label: "American English" },
      { code: "es-us", label: "Spanish (US)" },
    ]
  },
  {
    country: "🇩🇪 Germany",
    code: "DE",
    languages: [
      { code: "de", label: "German" },
    ]
  },
  {
    country: "🇫🇷 France",
    code: "FR",
    languages: [
      { code: "fr", label: "French" },
    ]
  },
  {
    country: "🇪🇸 Spain",
    code: "ES",
    languages: [
      { code: "es", label: "Spanish" },
    ]
  },
  {
    country: "🇮🇹 Italy",
    code: "IT",
    languages: [
      { code: "it", label: "Italian" },
    ]
  },
  {
    country: "🇷🇺 Russia",
    code: "RU",
    languages: [
      { code: "ru", label: "Russian" },
    ]
  },
  {
    country: "🇨🇳 China",
    code: "CN",
    languages: [
      { code: "zh", label: "Chinese (Mandarin)" },
      { code: "zh-yue", label: "Cantonese" },
    ]
  },
  {
    country: "🇯🇵 Japan",
    code: "JP",
    languages: [
      { code: "ja", label: "Japanese" },
    ]
  },
  {
    country: "🇰🇷 Korea",
    code: "KR",
    languages: [
      { code: "ko", label: "Korean" },
    ]
  },
  {
    country: "🇸🇦 Arabic",
    code: "AR",
    languages: [
      { code: "ar", label: "Arabic" },
      { code: "ar-eg", label: "Egyptian Arabic" },
    ]
  },
  {
    country: "🇵🇰 Pakistan",
    code: "PK",
    languages: [
      { code: "ur", label: "Urdu" },
    ]
  },
  {
    country: "🇹🇭 Thailand",
    code: "TH",
    languages: [
      { code: "th", label: "Thai" },
    ]
  },
  {
    country: "🇧🇷 Brazil",
    code: "BR",
    languages: [
      { code: "pt", label: "Portuguese" },
    ]
  },
  {
    country: "🇮🇩 Indonesia",
    code: "ID",
    languages: [
      { code: "id", label: "Indonesian" },
    ]
  },
  {
    country: "🇹🇷 Turkey",
    code: "TR",
    languages: [
      { code: "tr", label: "Turkish" },
    ]
  },
];

const LANGUAGES = LANGUAGE_GROUPS.flatMap(g => g.languages);
const CONTENT_TYPES = ["Tips","Story","Mistakes","Behind the Scenes","Q&A","Tutorial","Motivation","Trend","Case Study","Poll","Review","Challenge"];

function getBrowserLang() {
  const raw = navigator.language || navigator.languages?.[0] || "en";
  return raw.split("-")[0].toLowerCase();
}

const LANG_LABELS: Record<string, string> = {
  en: "English", "en-us": "American English", "es-us": "Spanish (US)",
  hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
  mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  pa: "Punjabi", or: "Odia", as: "Assamese",
  es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", ar: "Arabic", "ar-eg": "Egyptian Arabic",
  zh: "Chinese (Mandarin)", "zh-yue": "Cantonese",
  ja: "Japanese", ko: "Korean", ru: "Russian",
  tr: "Turkish", id: "Indonesian", th: "Thai", ur: "Urdu",
};

function getLangLabel(code: string) {
  return LANG_LABELS[code] || "English";
}

function getUPIQR(upiId: string, amount: number) {
  const upiUrl = `upi://pay?pa=${upiId}&pn=ViralTool&am=${amount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}&bgcolor=0a0a0a&color=ff6b35&margin=12`;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span style={{ color, fontWeight: 800, fontSize: "1.4rem", fontFamily: "'Syne',sans-serif" }}>{val}</span>;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, cx = 36, cy = 36, stroke = 5;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setTimeout(() => setProgress(score / 10), 100);
  }, [score]);
  const dash = circ * progress;

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <AnimatedScore target={score} color={color} />
        </div>
      </div>
      <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}

// ─── Hook Score Feature ───────────────────────────────────────────────────────
function HookScoreAnalyzer({ plan, usageCount, limit, onUpgrade, langLabel }: any) {
  const [hookInput, setHookInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!hookInput.trim()) { setError("Enter a hook to analyze."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are a harsh viral content critic. Analyze this hook brutally honestly: "${hookInput}"

IMPORTANT: Detect the language of the hook and respond in the SAME language. If hook is in Hindi, respond in Hindi. If English, respond in English.

Scoring rules:
- Most hooks score 3-6. Only truly exceptional hooks get 8+
- Be STRICT. A generic hook like "best tips" = 2-3/10
- Curiosity: Does it make people NEED to know more?
- Emotion: Does it trigger fear, excitement, anger, or hope?
- Virality: Would people share this?
- Overall: Average of above 3, rounded
- Improved version must use power words, numbers, emotion triggers - completely rewritten
- Also score the improved version separately

Respond ONLY in this exact JSON (no markdown, no extra text):
{"curiosity":0,"emotion":0,"virality":0,"overall":0,"verdict":"honest verdict","improved":"completely rewritten viral hook","improved_curiosity":0,"improved_emotion":0,"improved_virality":0,"improved_overall":0,"why":"explain what was weak and what makes improved version better"}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setError("Analysis failed. Try again.");
    }
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 8 ? "#22c55e" : s >= 5 ? "#f59e0b" : "#ef4444";
  const overallGrade = result ? (result.overall >= 8 ? "🔥 Viral Ready" : result.overall >= 5 ? "⚡ Needs Work" : "💀 Weak Hook") : "";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{
        background: "linear-gradient(135deg, #0d0d0d, #111)",
        border: "1px solid #1e1e1e", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📊</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>Hook Score Analyzer</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Paste your hook → get a viral score + improved version</p>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "0.75rem" }}>
          <textarea
            value={hookInput}
            onChange={e => { setHookInput(e.target.value); setError(""); }}
            placeholder='e.g. "5 tips to lose weight fast"'
            rows={2}
            style={{
              width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e",
              borderRadius: "12px", padding: "0.8rem 1rem", color: "#fff",
              fontSize: "0.9rem", outline: "none", resize: "none",
              fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5,
              transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#a855f7"}
            onBlur={e => e.target.style.borderColor = "#1e1e1e"}
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}

        <button onClick={analyze} disabled={loading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: loading ? "#111" : "linear-gradient(135deg,#818cf8,#6366f1)",
            border: "none", color: loading ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
          }}>
          {loading ? "⚡ Analyzing..." : "🔍 Analyze My Hook"}
        </button>
      </div>

      {result && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {/* Overall Grade Banner */}
          <div style={{
            background: result.overall >= 8 ? "#22c55e15" : result.overall >= 5 ? "#f59e0b15" : "#ef444415",
            border: `1px solid ${result.overall >= 8 ? "#22c55e40" : result.overall >= 5 ? "#f59e0b40" : "#ef444440"}`,
            borderRadius: "14px", padding: "0.9rem 1rem", marginBottom: "0.75rem",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem" }}>{overallGrade}</span>
            <span style={{ color: "#555", fontSize: "0.78rem" }}>Overall: <strong style={{ color: "#fff" }}>{result.overall}/10</strong></span>
          </div>

          {/* Score Rings */}
          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px",
            padding: "1.25rem", marginBottom: "0.75rem",
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem"
          }}>
            <ScoreRing score={result.curiosity} label="CURIOSITY" color={scoreColor(result.curiosity)} />
            <ScoreRing score={result.emotion}   label="EMOTION"   color={scoreColor(result.emotion)} />
            <ScoreRing score={result.virality}  label="VIRALITY"  color={scoreColor(result.virality)} />
          </div>

          {/* Why it works */}
          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px",
            padding: "1rem", marginBottom: "0.75rem"
          }}>
            <p style={{ margin: "0 0 0.3rem", fontSize: "0.7rem", color: "#444", fontWeight: 700, letterSpacing: "0.06em" }}>VERDICT</p>
            <p style={{ margin: 0, color: "#ccc", fontSize: "0.85rem", lineHeight: 1.6 }}>{result.verdict}</p>
            <p style={{ margin: "0.5rem 0 0", color: "#555", fontSize: "0.78rem", lineHeight: 1.6 }}>{result.why}</p>
          </div>

          {/* Improved Version */}
          <div style={{
            background: "linear-gradient(135deg,#0a1a0a,#0d1a0d)", border: "1px solid #22c55e30",
            borderRadius: "14px", padding: "1rem"
          }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>✨ IMPROVED VERSION</p>
            <p style={{ margin: "0 0 0.75rem", color: "#e2e2e2", fontSize: "0.92rem", lineHeight: 1.6, fontWeight: 500 }}>{result.improved}</p>
            {result.improved_overall && (
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                {[["CURIOSITY", result.improved_curiosity], ["EMOTION", result.improved_emotion], ["VIRALITY", result.improved_virality]].map(([label, score]: any) => (
                  <div key={label} style={{ textAlign: "center", flex: 1, background: "#0a1a0a", border: "1px solid #22c55e30", borderRadius: "8px", padding: "0.5rem" }}>
                    <div style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.2rem" }}>{score}</div>
                    <div style={{ color: "#444", fontSize: "0.6rem", fontWeight: 700 }}>{label}</div>
                  </div>
                ))}
                <div style={{ textAlign: "center", flex: 1, background: "#0a1a0a", border: "1px solid #22c55e50", borderRadius: "8px", padding: "0.5rem" }}>
                  <div style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.2rem" }}>{result.improved_overall}</div>
                  <div style={{ color: "#444", fontSize: "0.6rem", fontWeight: 700 }}>OVERALL</div>
                </div>
              </div>
            )}
            <button onClick={() => navigator.clipboard.writeText(result.improved)}
              style={{
                background: "#22c55e18", border: "1px solid #22c55e40", color: "#22c55e",
                padding: "0.3rem 0.8rem", borderRadius: "8px", cursor: "pointer",
                fontSize: "0.72rem", fontWeight: 700
              }}>
              Copy Improved Hook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Content Calendar ─────────────────────────────────────────────────────────
function ContentCalendar({ plan, usageCount, limit, onUpgrade, keyword, niche, langLabel }: any) {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [calKeyword, setCalKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [calPlatform, setCalPlatform] = useState("Instagram");

  const CAL_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
  ];

  const platformGuide: Record<string, string> = {
    "Instagram": "Instagram Reels, Stories, Carousels, and Feed Posts. Focus on visual hooks, trending audio suggestions, reel ideas, and caption CTAs.",
    "YouTube": "YouTube Videos and Shorts. Focus on video titles, thumbnail ideas, video hooks (first 30 seconds), and description keywords.",
    "Facebook": "Facebook Reels, Posts, and Stories. Focus on community engagement, shareable content, emotional storytelling, and group posts.",
    "TikTok": "TikTok Videos. Focus on trending sounds, first-3-second hooks, duet/stitch ideas, and viral formats.",
    "LinkedIn": "LinkedIn Posts, Articles, and Newsletters. Focus on thought leadership, professional insights, data-driven posts, and carousels.",
    "Twitter / X": "Twitter/X Tweets and Threads. Focus on hot takes, thread ideas, engagement questions, and trending conversations.",
    "Pinterest": "Pinterest Pins and Boards. Focus on SEO-optimized pin titles, board ideas, and save-worthy content.",
  };

  const generate = async () => {
    if (!calKeyword.trim()) { setError("Enter a keyword or topic first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setCalendar([]);

    const prompt = `You are a ${calPlatform} content strategist. Create a 30-day content calendar specifically for ${calPlatform}.

Platform: ${calPlatform}
Platform Guide: ${platformGuide[calPlatform]}
Keyword/Topic: "${calKeyword}"
Niche: ${niche}
Language: ${langLabel}

STRICT RULES:
- Every hook must be specifically designed for ${calPlatform} — not generic
- platform_note must give ${calPlatform}-specific advice (e.g. for YouTube: "Make thumbnail with shocked face", for Instagram: "Use trending audio", for LinkedIn: "Start with a bold stat")
- Use varied content types: ${CONTENT_TYPES.join(", ")}
- Make every hook punchy, specific, and ready to use on ${calPlatform}

Respond ONLY in this exact JSON (no markdown):
{"days":[{"day":1,"type":"Tips","hook":"platform specific hook here","platform_note":"specific ${calPlatform} tip"},...]}
Generate exactly 30 days.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setCalendar(parsed.days || []);
    } catch {
      setError("Calendar generation failed. Try again.");
    }
    setLoading(false);
  };

  useEffect(() => { setCalKeyword(keyword || ""); }, [keyword]);

  const TYPE_COLORS: Record<string, string> = {
    Tips: "#818cf8", Story: "#f59e0b", Mistakes: "#ef4444", Tutorial: "#22c55e",
    Motivation: "#a855f7", Trend: "#06b6d4", "Case Study": "#a855f7",
    Poll: "#ec4899", Review: "#84cc16", Challenge: "#f97316",
    "Behind the Scenes": "#64748b", "Q&A": "#14b8a6"
  };

  const getWeek = (day: number) => Math.ceil(day / 7);
  const weeks = calendar.length ? Array.from(new Set(calendar.map(d => getWeek(d.day)))) : [];

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "18px",
        padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>30-Day Content Calendar</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>AI auto-plans your entire month of content</p>
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <input value={calKeyword} onChange={e => { setCalKeyword(e.target.value); setError(""); }}
            placeholder="Topic or keyword (e.g. weight loss)"
            style={{
              width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e",
              borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff",
              fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif",
              transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#06b6d4"}
            onBlur={e => e.target.style.borderColor = "#1e1e1e"}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}

        {/* Platform Selector */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {CAL_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setCalPlatform(p.id)}
                style={{
                  background: calPlatform === p.id ? `${p.color}18` : "#0a0a0a",
                  border: `1px solid ${calPlatform === p.id ? p.color : "#1a1a1a"}`,
                  color: calPlatform === p.id ? p.color : "#444",
                  padding: "0.28rem 0.75rem", borderRadius: "20px",
                  cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                  transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: loading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)",
            border: "none", color: loading ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
          }}>
          {loading ? "⚡ Planning 30 days..." : "📅 Generate My Content Calendar"}
        </button>
      </div>

      {calendar.length > 0 && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#555", fontSize: "0.75rem" }}>30 days of content ready</span>
            <button onClick={() => {
              const text = calendar.map(d => `Day ${d.day} (${d.type}): ${d.hook}`).join("\n");
              navigator.clipboard.writeText(text);
            }} style={{
              background: "#ffffff0a", border: "1px solid #2a2a2a", color: "#666",
              padding: "0.25rem 0.75rem", borderRadius: "8px", cursor: "pointer",
              fontSize: "0.7rem", fontWeight: 700
            }}>
              Copy All
            </button>
          </div>

          {weeks.map(week => (
            <div key={week} style={{ marginBottom: "1rem" }}>
              <div style={{
                fontSize: "0.65rem", color: "#333", fontWeight: 700, letterSpacing: "0.08em",
                marginBottom: "0.4rem", paddingLeft: "0.25rem"
              }}>WEEK {week}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {calendar.filter(d => getWeek(d.day) === week).map((day, i) => {
                  const dayName = DAYS[(day.day - 1) % 7];
                  const color = TYPE_COLORS[day.type] || "#a855f7";
                  return (
                    <div key={day.day}
                      style={{
                        background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px",
                        padding: "0.65rem 0.85rem", display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        transition: "border-color 0.2s", cursor: "pointer"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = color + "40")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                      onClick={() => {
                        navigator.clipboard.writeText(day.hook);
                        setCopiedDay(day.day);
                        setTimeout(() => setCopiedDay(null), 1500);
                      }}>
                      <div style={{ flexShrink: 0, textAlign: "center", minWidth: "36px" }}>
                        <div style={{ fontSize: "0.6rem", color: "#333", fontWeight: 700 }}>{dayName}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{day.day}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                          <span style={{
                            fontSize: "0.6rem", fontWeight: 700, background: color + "18",
                            border: `1px solid ${color}30`, color, borderRadius: "4px",
                            padding: "0.08rem 0.4rem", letterSpacing: "0.04em"
                          }}>{day.type}</span>
                          {copiedDay === day.day && (
                            <span style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 700 }}>✓ Copied!</span>
                          )}
                        </div>
                        <p style={{ margin: 0, color: "#bbb", fontSize: "0.8rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{day.hook}</p>
                        {day.platform_note && (
                          <p style={{ margin: "0.2rem 0 0", color: "#333", fontSize: "0.68rem", lineHeight: 1.4 }}>💡 {day.platform_note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── One-Click Content Pack ───────────────────────────────────────────────────
function ContentPack({ plan, usageCount, limit, onUpgrade, keyword, niche, platform, langLabel }: any) {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<any>(null);
  const [packKeyword, setPackKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [packType, setPackType] = useState<"ads" | "youtube" | "instagram">("instagram");

  const PACK_TYPES = [
    { id: "instagram", label: "📸 Instagram & TikTok", desc: "Hooks, Reels, Captions, Hashtags" },
    { id: "youtube",   label: "▶️ YouTube",             desc: "Titles, Scripts, Descriptions, Tags" },
    { id: "ads",       label: "📢 Google & Meta Ads",   desc: "Headlines, Ad Copy, CTAs" },
  ];

  const generate = async () => {
    if (!packKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setPack(null);

    const platformInstructionsPack: Record<string, string> = {
        "Google Ads": `You are a senior Google Ads copywriter with 10+ years experience. Generate HIGH-CONVERTING ad copy for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 Google Search headlines. Each MUST be 25-30 characters (count carefully!). Use urgency, numbers, benefits. Example format: "Fix Printer Fast - Call Now", "Expert Repair in 60 Min"
- titles: 8 display ad headlines, each 25-30 characters. Focus on USP and offers.
- captions: 5 Google descriptions, each 80-90 characters. Include strong CTA, benefit, and urgency. Example: "Professional printer repair at your doorstep. Same-day service available. Call now!"
- scripts: 5 keyword match type suggestions (exact, phrase, broad match)
- hashtags: []

QUALITY RULES: No generic words. Every line must have power words (Fast, Expert, Proven, Guaranteed, Free, Save, Now, Today, Best). Use numbers where possible.`,

        "Meta Ads": `You are a senior Meta Ads specialist with 10+ years experience running profitable Facebook and Instagram campaigns. Generate HIGH-CONVERTING ad copy for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 scroll-stopping opening lines (80-125 chars each). Start with the customer's pain point or a bold claim. NEVER start with brand name. Example: "Still struggling with ${keyword}? Here's what actually works in 2024 — and it's not what you think."
- titles: 8 ad headlines (30-40 chars each). Must be specific, benefit-driven. NO generic words like "Pro", "Master", "Expert". Example: "Get 10 Fitness Clients in 30 Days"
- captions: 5 primary texts (200-300 chars each). Format: Pain point (1-2 lines) → Agitate (1 line) → Solution (2 lines) → Social proof (1 line) → CTA (1 line). Use 1-2 emojis max.
- scripts: 5 ad angles with full copy: 1)Fear angle 2)Curiosity angle 3)Social proof angle 4)Urgency angle 5)Transformation angle
- hashtags: []

QUALITY RULES:
- Every headline must mention a specific number or result
- Every caption must feel personal and relatable
- Avoid buzzwords: "unlock", "boost", "transform", "skyrocket"
- Write like you're talking to ONE specific person`,

        "Native Ads": `You are a native advertising expert. Generate editorial-style ad content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 curiosity-based headlines that sound like news/articles (not salesy). Example: "The Surprising Reason Your Printer Keeps Breaking (And How to Fix It)"
- titles: 8 article-style titles that blend with editorial content
- captions: 5 advertorial-style descriptions (100-150 chars). Sound informational, not promotional.
- scripts: 5 story-based ad copy angles (personal story, expert advice, case study, how-to, myth-busting)
- hashtags: []

QUALITY RULES: Sound like journalism, not advertising. Build curiosity first.`,

        "Instagram": `You are a top Instagram content strategist. Generate VIRAL content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 reel opening lines that stop scrolling in 1 second. Use shock, curiosity, controversy or bold claims.
- titles: 8 reel/post title ideas with strong emotional pull
- captions: 5 full captions (150-200 chars) with emojis, line breaks, and strong CTA. Use storytelling.
- scripts: 5 complete Reel scripts: Hook (1 line) → Problem (2 lines) → Solution (3 lines) → CTA (1 line)
- hashtags: 15 mix of niche, medium and broad hashtags

QUALITY RULES: Be bold, be real, be relatable. Use conversational tone.`,

        "YouTube": `You are a top YouTube growth strategist. Generate HIGH-CTR content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 video opening lines (first 30 seconds) that promise value and create curiosity. Use "What if", "The truth about", "Nobody tells you"
- titles: 8 SEO-optimized titles with power words, numbers, and brackets. Example: "How to Fix Any Printer in 10 Minutes (Step-by-Step)"
- captions: 5 video descriptions (200-250 chars) with keywords naturally embedded and timestamps hint
- scripts: 5 complete intro scripts: Hook → Credibility → Promise → Preview (each 4-5 sentences)
- hashtags: 10 YouTube-specific tags mixing broad and niche terms

QUALITY RULES: Titles must have high CTR potential. Hooks must create FOMO.`,

        "TikTok": `You are a viral TikTok content expert. Generate TRENDING content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 first-3-second hooks that immediately grab attention. Use pattern interrupts, controversial statements, or surprising facts.
- titles: 8 trending-style captions that work with TikTok algorithm
- captions: 5 short punchy captions (50-80 chars) with 2-3 emojis and CTA
- scripts: 5 TikTok video scripts: Hook (1 line) → Relate (1 line) → Reveal (2 lines) → CTA (1 line)
- hashtags: 10 trending TikTok hashtags (mix of viral and niche)

QUALITY RULES: Fast, punchy, trendy. No corporate language. Sound like a real person.`,

        "LinkedIn": `You are a LinkedIn thought leadership expert. Generate PROFESSIONAL content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 professional story openers that start with a bold statement or personal insight. Example: "I fixed 500+ printers last year. Here's what nobody tells you."
- titles: 8 thought leadership article titles that position you as an expert
- captions: 5 LinkedIn posts (150-200 chars) with value-first approach, minimal emojis, strong insight
- scripts: 5 carousel post outlines (5-7 slides each with slide title and key point)
- hashtags: 5-8 professional LinkedIn hashtags

QUALITY RULES: Authority tone. Data and insights. Professional but human.`,

        "Twitter / X": `You are a viral Twitter/X content expert. Generate HIGH-ENGAGEMENT content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 tweet hooks (under 200 chars). Use controversial takes, surprising facts, or bold opinions that spark debate.
- titles: 8 thread title ideas that make people click "read more"
- captions: 5 tweet threads (3-5 tweets each, separated by "//"). Build tension and deliver value.
- scripts: 5 viral tweet formats (Hot take, Unpopular opinion, Story thread, List thread, Question tweet)
- hashtags: 3-5 trending hashtags only

QUALITY RULES: Be polarizing but not offensive. Short sentences. Big ideas.`,

        "Learning & Skills": `You are an e-learning content expert. Generate ENGAGING educational content for keyword: ${keyword}.

STRICT RULES:
- hooks: 8 curiosity-driven learning hooks that promise transformation. Example: "Learn to fix any printer in under 10 minutes — even if you've never tried before."
- titles: 8 course/tutorial titles with clear outcome and time promise
- captions: 5 educational post captions (100-150 chars) that teach one thing and leave them wanting more
- scripts: 5 lesson outlines: Title → Learning Objective → 3 Key Points → Quiz Question → CTA
- hashtags: 10 education and skill hashtags

QUALITY RULES: Focus on transformation. Use before/after framing. Make learning feel achievable.`,
      };

      const nicheContextPack: Record<string, string> = {
        "Fitness": "fitness, gym, health focused",
        "Business": "entrepreneurship, business growth focused",
        "Tech": "technology, innovation focused",
        "Lifestyle": "daily life, personal growth focused",
        "Food": "recipes, cooking focused",
        "AI & Automation": "AI, productivity focused",
        "Personal Finance": "money, investing focused",
        "Mental Health": "wellness, mindfulness focused",
        "Sustainable Living": "eco-friendly, green living focused",
        "Storytelling": "narrative, entertainment focused",
        "Gaming": "gaming, esports focused",
        "Beauty & Skincare": "beauty, skincare focused",
        "Ads & Marketing": "marketing, advertising focused",
        "Education": "learning, teaching focused",
      };

      const nicheGuidePack = nicheContextPack[niche] || "general content";

      const packPrompts = {
        instagram: `You are an Instagram & TikTok viral content expert for ${nicheGuidePack}.
Generate exactly:
- hooks: 10 viral opening lines (curiosity, emotion, shock value)
- titles: 8 post/reel title ideas
- captions: 5 full captions with emojis and CTA
- scripts: 5 Reel/TikTok scripts (Hook line / Body 3 points / CTA)
- hashtags: 15 relevant hashtags`,

        youtube: `You are a YouTube content strategist for ${nicheGuidePack}.
Generate exactly:
- hooks: 8 video hook lines (first 30 seconds to retain viewers)
- titles: 10 SEO-optimized video titles (include numbers/power words)
- captions: 5 video descriptions (with keywords and timestamps structure)
- scripts: 5 full intro scripts (Hook / Promise / Preview format)
- hashtags: 10 YouTube tags`,

        ads: `You are a Google Ads & Meta Ads expert for ${nicheGuidePack}.
Generate exactly:
- hooks: 10 Google Ad headlines (MAX 30 characters each, no emojis)
- titles: 8 Meta Ad headlines (MAX 40 characters each)
- captions: 5 ad descriptions (MAX 90 characters, include strong CTA)
- scripts: 5 Meta ad primary texts (emotion-based, pain point + solution)
- hashtags: [] (leave empty for ads)`
      };

      const prompt = `${packPrompts[packType]}

KEYWORD: ${packKeyword}
OUTPUT LANGUAGE: Write everything strictly in ${langLabel} only

Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "hooks":["hook1","hook2"],
  "titles":["title1","title2"],
  "captions":["caption1","caption2"],
  "scripts":["script1","script2"],
  "hashtags":["#tag1","#tag2"]
}

Make everything highly specific to "${packKeyword}". Use numbers, power words, emotion triggers.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setPack(JSON.parse(clean));
    } catch {
      setError("Pack generation failed. Try again.");
    }
    setLoading(false);
  };

  useEffect(() => { setPackKeyword(keyword || ""); }, [keyword]);

  const copySection = (key: string, items: string[]) => {
    navigator.clipboard.writeText(items.join("\n"));
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sectionLabels: Record<string, any[]> = {
    instagram: [
      { key: "hooks",    label: "Viral Hooks",    emoji: "🎣", color: "#a855f7" },
      { key: "titles",   label: "Post Titles",    emoji: "📝", color: "#818cf8" },
      { key: "captions", label: "Captions",       emoji: "💬", color: "#22c55e" },
      { key: "scripts",  label: "Reel Scripts",   emoji: "🎬", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags",       emoji: "#️⃣", color: "#06b6d4" },
    ],
    youtube: [
      { key: "hooks",    label: "Video Hooks",       emoji: "🎬", color: "#a855f7" },
      { key: "titles",   label: "SEO Titles",        emoji: "📝", color: "#818cf8" },
      { key: "captions", label: "Descriptions",      emoji: "💬", color: "#22c55e" },
      { key: "scripts",  label: "Intro Scripts",     emoji: "🎙️", color: "#f59e0b" },
      { key: "hashtags", label: "YouTube Tags",      emoji: "#️⃣", color: "#06b6d4" },
    ],
    ads: [
      { key: "hooks",    label: "Google Headlines",  emoji: "📢", color: "#a855f7" },
      { key: "titles",   label: "Meta Headlines",    emoji: "📘", color: "#818cf8" },
      { key: "captions", label: "Ad Descriptions",   emoji: "💬", color: "#22c55e" },
      { key: "scripts",  label: "Meta Ad Copies",    emoji: "🎯", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags",          emoji: "#️⃣", color: "#06b6d4" },
    ],
  };

  const sections = pack ? sectionLabels[packType].map(s => ({
    ...s, count: pack[s.key]?.length
  })) : [];

  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "18px",
        padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📦</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>One-Click Content Pack</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Choose your platform — get complete content pack</p>
          </div>
        </div>

        {/* Pack Type Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {PACK_TYPES.map(pt => (
            <button key={pt.id} onClick={() => { setPackType(pt.id as any); setPack(null); }}
              style={{
                background: packType === pt.id ? "rgba(168,85,247,0.15)" : "#0a0a0a",
                border: `1px solid ${packType === pt.id ? "#a855f7" : "#1a1a1a"}`,
                borderRadius: "10px", padding: "0.65rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all 0.2s"
              }}>
              <span style={{ color: packType === pt.id ? "#a855f7" : "#fff", fontWeight: 700, fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif" }}>
                {pt.label}
              </span>
              <span style={{ color: "#444", fontSize: "0.72rem" }}>{pt.desc}</span>
            </button>
          ))}
        </div>

        {/* Pack stats preview */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {(packType === "ads" ? [["10","Headlines","#a855f7"],["8","Meta Titles","#818cf8"],["5","Ad Copies","#22c55e"],["5","Ad Scripts","#f59e0b"],["0","Hashtags","#06b6d4"]] : packType === "youtube" ? [["8","Video Hooks","#a855f7"],["10","SEO Titles","#818cf8"],["5","Descriptions","#22c55e"],["5","Scripts","#f59e0b"],["10","Tags","#06b6d4"]] : [["10","Viral Hooks","#a855f7"],["8","Post Titles","#818cf8"],["5","Captions","#22c55e"],["5","Reel Scripts","#f59e0b"],["15","Hashtags","#06b6d4"]]).map(([n,l,c]) => (
            <div key={l} style={{
              background: c + "10", border: `1px solid ${c}25`, borderRadius: "8px",
              padding: "0.3rem 0.6rem", display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <span style={{ fontWeight: 800, color: c, fontSize: "1rem", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{n}</span>
              <span style={{ color: "#444", fontSize: "0.6rem", marginTop: "0.1rem" }}>{l}</span>
            </div>
          ))}
        </div>

        <input value={packKeyword} onChange={e => { setPackKeyword(e.target.value); setError(""); }}
          placeholder="Enter keyword (e.g. meal prep)"
          style={{
            width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e",
            borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff",
            fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif",
            marginBottom: "0.75rem", transition: "border 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"}
          onBlur={e => e.target.style.borderColor = "#1e1e1e"}
        />

        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}

        <button onClick={generate} disabled={loading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: loading ? "#111" : "linear-gradient(135deg,#f59e0b,#d97706)",
            border: "none", color: loading ? "#333" : "#000",
            fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
          }}>
          {loading ? "⚡ Building your pack..." : "📦 Generate Full Content Pack"}
        </button>
      </div>

      {pack && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {/* Summary bar */}
          <div style={{
            background: "#0d1a2d", border: "1px solid #1e3a5f", borderRadius: "12px",
            padding: "0.75rem 1rem", marginBottom: "0.75rem",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1.1rem" }}>🎯</span>
            <span style={{ color: "#7aa6d4", fontSize: "0.8rem" }}>
              Your complete <strong style={{ color: "#fff" }}>{packKeyword}</strong> content pack is ready — click any section to expand
            </span>
          </div>

          {sections.map(({ key, label, emoji, color, count }) => {
            const items = pack[key] || [];
            const isOpen = openSection === key;
            return (
              <div key={key} style={{
                background: "#0d0d0d", border: `1px solid ${isOpen ? color + "40" : "#1a1a1a"}`,
                borderRadius: "12px", marginBottom: "0.5rem", overflow: "hidden",
                transition: "border-color 0.2s"
              }}>
                <div
                  onClick={() => setOpenSection(isOpen ? null : key)}
                  style={{
                    padding: "0.85rem 1rem", display: "flex", alignItems: "center",
                    justifyContent: "space-between", cursor: "pointer"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1rem" }}>{emoji}</span>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", fontFamily: "'Syne',sans-serif" }}>{label}</span>
                    <span style={{
                      background: color + "18", border: `1px solid ${color}30`,
                      color, borderRadius: "20px", padding: "0.1rem 0.5rem",
                      fontSize: "0.65rem", fontWeight: 700
                    }}>{count}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button onClick={e => { e.stopPropagation(); copySection(key, items); }}
                      style={{
                        background: copiedSection === key ? "#22c55e18" : "#ffffff0a",
                        border: `1px solid ${copiedSection === key ? "#22c55e" : "#2a2a2a"}`,
                        color: copiedSection === key ? "#22c55e" : "#555",
                        padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer",
                        fontSize: "0.68rem", fontWeight: 700
                      }}>
                      {copiedSection === key ? "✓" : "Copy"}
                    </button>
                    <span style={{ color: "#333", fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${color}20`, padding: "0 1rem 1rem" }}>
                    {items.map((item: string, i: number) => (
                      <div key={i} style={{
                        padding: "0.5rem 0", borderBottom: i < items.length - 1 ? "1px solid #111" : "none",
                        display: "flex", gap: "0.75rem", alignItems: "flex-start"
                      }}>
                        <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, paddingTop: "0.15rem", minWidth: "18px" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p style={{ margin: 0, color: "#ccc", fontSize: "0.83rem", lineHeight: 1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ plan, onClose, onPaid }: any) {
  const [currency, setCurrency] = useState("INR");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const planData = PLANS[plan as keyof typeof PLANS];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto"
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid #a855f7", borderRadius: "20px",
        padding: "1.75rem", maxWidth: "460px", width: "100%", color: "#fff",
        boxShadow: "0 0 80px rgba(255,107,53,0.25)", animation: "slideUp 0.3s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>💳</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", margin: "0 0 0.5rem", color: "#a855f7" }}>
            Complete Payment
          </h2>
          <div style={{
            display: "inline-block", background: "#a855f718", border: "1px solid #a855f740",
            borderRadius: "20px", padding: "0.3rem 1rem"
          }}>
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>
              {planData?.label} — <span style={{ color: "#a855f7" }}>₹{planData?.priceINR} / ${planData?.priceUSD}</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", background: "#111", borderRadius: "10px", padding: "0.3rem", marginBottom: "1.25rem" }}>
          {[["INR", "🇮🇳 UPI (India)"], ["USD", "🌍 PayPal (Worldwide)"]].map(([c, label]) => (
            <button key={c} onClick={() => setCurrency(c)}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none",
                background: currency === c ? "#a855f7" : "transparent",
                color: currency === c ? "#000" : "#666",
                fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif",
                transition: "all 0.2s", fontSize: "0.82rem"
              }}>
              {label}
            </button>
          ))}
        </div>

        {currency === "INR" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <p style={{ color: "#555", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>
              📱 Scan with PhonePe / GPay / Paytm or any UPI app
            </p>
            <div style={{
              background: "#111", border: "2px solid #a855f730", borderRadius: "14px",
              padding: "1rem", display: "inline-block", marginBottom: "0.75rem"
            }}>
              <img src={getUPIQR(YOUR_UPI_ID, planData?.priceINR)} alt="UPI QR"
                style={{ width: "160px", height: "160px", borderRadius: "8px", display: "block" }} />
            </div>
            <div style={{
              background: "#0a0a0a", border: "1px solid #a855f725", borderRadius: "10px",
              padding: "0.6rem 1rem", margin: "0 auto 0.75rem", maxWidth: "300px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem"
            }}>
              <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.9rem", wordBreak: "break-all" }}>{YOUR_UPI_ID}</span>
              <button onClick={() => { navigator.clipboard.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                  background: copied ? "#22c55e22" : "#a855f718", border: `1px solid ${copied ? "#22c55e" : "#a855f740"}`,
                  color: copied ? "#22c55e" : "#a855f7", padding: "0.25rem 0.6rem", borderRadius: "6px",
                  cursor: "pointer", fontSize: "0.72rem", flexShrink: 0, fontWeight: 700
                }}>
                {copied ? "✓" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "0.5rem" }}>
              {[["GPay", "#4285f4"], ["PhonePe", "#5f259f"], ["Paytm", "#00b9f1"]].map(([name, color]) => (
                <a key={name} href={`upi://pay?pa=${YOUR_UPI_ID}&pn=ViralTool&am=${planData?.priceINR}&cu=INR`}
                  style={{
                    background: color + "20", border: `1px solid ${color}50`, color,
                    borderRadius: "8px", padding: "0.35rem 0.7rem",
                    textDecoration: "none", fontSize: "0.78rem", fontWeight: 700
                  }}>{name}</a>
              ))}
            </div>
          </div>
        )}

        {currency === "USD" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{
              background: "#0a1628", border: "1px solid #003087",
              borderRadius: "16px", padding: "1.5rem", marginBottom: "0.75rem"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🅿️</div>
              <p style={{ color: "#7aa6d4", fontSize: "0.85rem", margin: "0 0 1rem" }}>Worldwide — fast & secure</p>
              <a href={`${YOUR_PAYPAL_ME}/${planData?.priceUSD}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-block", background: "linear-gradient(135deg,#003087,#009cde)",
                  color: "#fff", padding: "0.8rem 2rem", borderRadius: "10px",
                  textDecoration: "none", fontWeight: 800, fontSize: "1rem",
                  fontFamily: "'Syne',sans-serif"
                }}>
                Pay ${planData?.priceUSD} via PayPal →
              </a>
            </div>
          </div>
        )}

        {!paid ? (
          <button onClick={() => { setPaid(true); setTimeout(() => onPaid(plan), 1800); }}
            style={{
              width: "100%", padding: "0.9rem", borderRadius: "10px",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              border: "none", color: "#fff", fontWeight: 800,
              fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Syne',sans-serif", marginBottom: "0.5rem"
            }}>
            ✅ I've Paid — Request Activation
          </button>
        ) : (
          <div style={{
            textAlign: "center", padding: "0.9rem", background: "#22c55e18",
            border: "1px solid #22c55e", borderRadius: "10px", marginBottom: "0.5rem",
            color: "#22c55e", fontWeight: 800, animation: "pulse 1s infinite"
          }}>
            🎉 Activating your plan...
          </div>
        )}

        <p style={{ color: "#333", fontSize: "0.72rem", textAlign: "center", margin: "0 0 0.75rem" }}>
          Access granted after manual verification.
        </p>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Paywall Modal ────────────────────────────────────────────────────────────
function PaywallModal({ onClose, onSelectPlan }: any) {
  const [selected, setSelected] = useState("starter");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid #a855f7", borderRadius: "20px",
        padding: "1.75rem", maxWidth: "480px", width: "100%", color: "#fff",
        boxShadow: "0 0 80px rgba(255,107,53,0.25)", animation: "slideUp 0.3s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🚀</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", margin: "0.5rem 0", color: "#a855f7" }}>
            Free Limit Reached!
          </h2>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
            Upgrade to unlock Hook Scoring, 30-Day Calendars, Content Packs & more.
          </p>
        </div>

        <div style={{ display: "grid", gap: "0.65rem", marginBottom: "1.25rem" }}>
          {Object.entries(PLANS).filter(([k]) => k !== "free").map(([key, plan]: any) => (
            <div key={key} onClick={() => setSelected(key)}
              style={{
                border: `${selected === key ? "2" : "1"}px solid ${selected === key ? "#a855f7" : "#1e1e1e"}`,
                borderRadius: "12px", padding: "0.9rem 1rem",
                background: selected === key ? "rgba(255,107,53,0.07)" : "#0d0d0d",
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
              <div>
                <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
                  {plan.label} {plan.badge}
                </div>
                <div style={{ color: "#444", fontSize: "0.76rem", marginTop: "0.15rem" }}>
                  {plan.limit >= 9999 ? "Unlimited" : `${plan.limit}`} generations/mo
                  {key === "bundle" && " · All features unlocked"}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a855f7" }}>₹{plan.priceINR}</div>
                <div style={{ color: "#333", fontSize: "0.72rem" }}>${plan.priceUSD} / mo</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => onSelectPlan(selected)}
          style={{
            width: "100%", padding: "0.9rem", borderRadius: "10px",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none", color: "#000", fontWeight: 800,
            fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Syne',sans-serif", marginBottom: "0.5rem"
          }}>
          Get {PLANS[selected as keyof typeof PLANS]?.label} — ₹{PLANS[selected as keyof typeof PLANS]?.priceINR} / ${PLANS[selected as keyof typeof PLANS]?.priceUSD} →
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ title, items, emoji, color }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${color}22`, borderRadius: "14px", padding: "1.1rem", marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color, fontSize: "0.88rem" }}>{emoji} {title}</h3>
        <button onClick={() => { navigator.clipboard.writeText(items.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{
            background: copied ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied ? "#22c55e" : "#2a2a2a"}`,
            color: copied ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px",
            cursor: "pointer", fontSize: "0.7rem", transition: "all 0.2s"
          }}>
          {copied ? "✓ Copied!" : "Copy all"}
        </button>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
        {items.map((item: string, i: number) => (
          <li key={i} style={{ color: "#ccc", fontSize: "0.83rem", marginBottom: "0.35rem", lineHeight: 1.6 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ id, label, emoji, active, onClick, isPro }: any) {
  return (
    <button onClick={() => onClick(id)}
      style={{
        flex: 1, padding: "0.6rem 0.25rem", borderRadius: "10px", border: "none",
        background: active ? "#a855f715" : "transparent",
        color: active ? "#a855f7" : "#444",
        fontWeight: active ? 700 : 500, fontSize: "0.72rem",
        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.2s", position: "relative",
        borderBottom: active ? "2px solid #a855f7" : "2px solid transparent",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem"
      }}>
      <span style={{ fontSize: "1rem" }}>{emoji}</span>
      <span>{label}</span>
      {isPro && !active && (
        <span style={{
          position: "absolute", top: 4, right: 4, fontSize: "0.5rem",
          background: "#a855f720", border: "1px solid #a855f740", color: "#a855f7",
          borderRadius: "4px", padding: "0.05rem 0.25rem", fontWeight: 700
        }}>PRO</span>
      )}
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ViralContentTool() {
  const [keyword, setKeyword]     = useState("");
  const [platform, setPlatform]   = useState("Instagram");
  const [niche, setNiche]         = useState("Fitness");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<any>(null);
  const [error, setError]         = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [plan, setPlan]           = useState("free");
  const [showPaywall, setShowPaywall] = useState(false);
  const [payingPlan, setPayingPlan]   = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectedLang, setDetectedLang] = useState("en");
const [selectedLang, setSelectedLang] = useState("en");
  const [activeTab, setActiveTab] = useState("generate");
const [showContact, setShowContact] = useState(false);
const [legalPage, setLegalPage] = useState<"privacy" | "terms" | "refund" | null>(null);
const [showReview, setShowReview] = useState(false);
const [showPlans, setShowPlans] = useState(false);
const [showAdmin, setShowAdmin] = useState(false);
const [userType, setUserType] = useState<string | null>(null);
const [showOnboarding, setShowOnboarding] = useState(false);
const [reviewText, setReviewText] = useState("");
const [reviewRole, setReviewRole] = useState("");
const [reviewStars, setReviewStars] = useState(5);
const [reviewSubmitted, setReviewSubmitted] = useState(false);
const [reviewLoading, setReviewLoading] = useState(false);
const [user, setUser] = useState<any>(null);
const [authLoading, setAuthLoading] = useState(true);
const [profileLoading, setProfileLoading] = useState(true);
const [profile, setProfile] = useState<any>(() => {
  try {
    const saved = localStorage.getItem("viral_profile");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
});
const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Only set plan if it's a valid plan
        setDetectedLang(getBrowserLang());

    // Auth check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setProfile(data ?? null);
        if (!data?.user_type) {
  setShowOnboarding(true);
} else {
  setUserType(data?.user_type || "creator");
}
        
if (data?.referral_code) {
  localStorage.setItem("viral_profile", JSON.stringify(data));
}
const ADMIN_EMAIL = "ravenderr01@gmail.com";
if (session?.user?.email === ADMIN_EMAIL) {
  setPlan("agency");
} else if (data?.plan) {
  setPlan(data.plan);
}


      }
    });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setUser(session.user);
        setProfile(data ?? null);
        
        // Plan set karo
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        if (session.user.email === ADMIN_EMAIL) {
          setPlan("agency");
        } else if (data?.plan) {
          setPlan(data.plan);
        }

        // Credits set karo
        if (data?.credits_remaining !== undefined) {
          setUsageCount((data.credits_total || 10) - data.credits_remaining);
        }

        // Onboarding check
        if (!data?.user_type) {
          setShowOnboarding(true);
        } else {
          setUserType(data.user_type);
        }
        setProfileLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        setPlan("free");
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const limit = PLANS[plan as keyof typeof PLANS]?.limit || 10;
  const remaining = Math.max(0, limit - usageCount);
  const usedPct   = Math.min(100, (usageCount / limit) * 100);
  const langLabel = getLangLabel(selectedLang);

  const CREDIT_COSTS: Record<string, number> = {
    generate: 1,
    score: 1,
    image: 2,
    pack: 3,
    calendar: 5,
  };

  const incrementUsage = (feature: string = "generate") => {
    const cost = CREDIT_COSTS[feature] || 1;
    const newCount = usageCount + cost;
    setUsageCount(newCount);
    localStorage.setItem("viral_usage", newCount.toString());
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }

    // Supabase se check karo
    const { data: userData } = await supabase
      .from("users")
      .select("generations_used_today, last_reset_date, plan, credits_remaining")
      .eq("id", user.id)
      .single();

    if (userData) {
      const today = new Date().toISOString().split("T")[0];
      if (userData.last_reset_date !== today) {
        await supabase.from("users").update({
          generations_used_today: 0,
          last_reset_date: today
        }).eq("id", user.id);
        userData.generations_used_today = 0;
      }
      if (userData.credits_remaining <= 0) {
        setShowPaywall(true);
        return;
      }
    }

    if (usageCount >= limit) { setShowPaywall(true); return; }

    setLoading(true); setError(""); setResults(null);

    const nicheContext: Record<string, string> = {
      "Fitness": "fitness, gym, workout, weight loss, nutrition, health transformation",
      "Business": "entrepreneurship, startup, business growth, freelancing, side hustle",
      "Tech": "technology, software, AI tools, gadgets, coding, innovation",
      "Lifestyle": "daily routines, habits, personal growth, productivity, minimalism",
      "Food": "recipes, cooking, food review, street food, viral food trends",
      "Daily Vlog": "day in my life, daily routine, vlog, lifestyle content, personal vlogs",
      "Comedy & Entertainment": "funny content, comedy skits, meme culture, entertainment, humor",
      "Sports": "cricket, football, sports highlights, fitness training, sports motivation",
      "Spirituality": "meditation, manifestation, spiritual growth, mindfulness, inner peace",
      "AI & Automation": "artificial intelligence, automation tools, ChatGPT, productivity hacks",
      "Personal Finance": "investing, saving money, passive income, budgeting, financial freedom",
      "Mental Health": "emotional wellness, mindfulness, anxiety relief, self-care, therapy",
      "Beauty & Skincare": "skincare routine, makeup, beauty tips, glow up, anti-aging",
      "Ads & Marketing": "digital marketing, advertising, campaigns, copywriting, ROAS",
      "Education": "online learning, skill development, courses, e-learning, teaching",
      "Travel": "travel tips, destinations, budget travel, solo travel, travel vlogs",
      "Fashion & Style": "outfit ideas, fashion trends, style tips, clothing, accessories",
      "Real Estate": "property investment, home buying, rental income, real estate tips",
      "Motivational": "success mindset, motivation, self-improvement, hustle, discipline",
      "Health & Wellness": "healthy lifestyle, nutrition, yoga, wellness tips, sleep optimization",
      "Gaming": "video games, esports, gaming setup, mobile gaming, game reviews",
    };

    const nicheGuide = nicheContext[niche] || "general content creation";

    try {
      let realData = "";

      // ── REAL DATA FETCH based on platform ──
      if (platform === "YouTube" || platform === "YouTube Ads") {
        try {
          // Real YouTube trending videos fetch
          const [trendRes, searchRes] = await Promise.allSettled([
            fetch(`https://viral-tool-1.onrender.com/api/trends/youtube?country=IN`),
            fetch(`https://viral-tool-1.onrender.com/api/trends/youtube-search?q=${encodeURIComponent(keyword)}&country=IN`)
          ]);

          let trendTitles: string[] = [];
          let searchTitles: string[] = [];

          if (trendRes.status === "fulfilled" && trendRes.value.ok) {
            const data = await trendRes.value.json();
            trendTitles = (data.items || []).slice(0, 5).map((v: any) => v.snippet?.title || "");
          }
          if (searchRes.status === "fulfilled" && searchRes.value.ok) {
            const data = await searchRes.value.json();
            searchTitles = (data.items || []).slice(0, 5).map((v: any) => v.snippet?.title || "");
          }

          if (trendTitles.length > 0 || searchTitles.length > 0) {
            realData = `
REAL YOUTUBE DATA (use this to inform your content):
Currently Trending on YouTube India:
${trendTitles.map((t, i) => `${i+1}. ${t}`).join("\n")}

Top Videos for "${keyword}":
${searchTitles.map((t, i) => `${i+1}. ${t}`).join("\n")}

Analyze these real trends and create content that follows similar patterns, titles structures, and hooks that are currently working on YouTube.`;
          }
        } catch (e) {}

      } else if (platform === "Reddit") {
        try {
          // Real Reddit posts fetch
          const subredditMap: Record<string, string> = {
            "Fitness": "fitness+loseit+workout",
            "Business": "entrepreneur+smallbusiness+startups",
            "Tech": "technology+programming+artificial",
            "Lifestyle": "lifestyle+selfimprovement+productivity",
            "Food": "food+recipes+cooking",
            "Daily Vlog": "vlog+youtube+contentcreators",
            "Comedy & Entertainment": "funny+memes+comedy",
            "Sports": "sports+cricket+football",
            "Spirituality": "spirituality+meditation+mindfulness",
            "Mental Health": "mentalhealth+anxiety+selfcare",
            "Personal Finance": "personalfinance+investing+financialindependence",
            "Beauty & Skincare": "SkincareAddiction+beauty+makeupaddiction",
            "Gaming": "gaming+pcgaming+mobilegaming",
            "Travel": "travel+solotravel+backpacking",
          };
          const subreddit = subredditMap[niche] || "all";
          const redditRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/reddit?subreddit=${subreddit}&time=week&limit=8`);
          if (redditRes.ok) {
            const data = await redditRes.json();
            const posts = (data.data?.children || []).slice(0, 8).map((p: any) => ({
              title: p.data?.title || "",
              upvotes: p.data?.ups || 0,
              comments: p.data?.num_comments || 0,
              subreddit: p.data?.subreddit || ""
            }));
            if (posts.length > 0) {
              realData = `
REAL REDDIT DATA (currently trending this week):
${posts.map((p: any, i: number) => `${i+1}. "${p.title}" — ${p.upvotes} upvotes, ${p.comments} comments — r/${p.subreddit}`).join("\n")}

Analyze these real Reddit posts. Create content that matches the style, tone, and topics that are getting high engagement on Reddit right now.`;
            }
          }
        } catch (e) {}

      } else if (platform === "Google Ads" || platform === "Meta Ads" || platform === "Native Ads") {
        try {
          // Real Google trending searches
          const serpRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/google?q=${encodeURIComponent(keyword)}&country=IN`);
          if (serpRes.ok) {
            const data = await serpRes.json();
            const timeline = data.interest_over_time?.timeline_data || [];
            const peak = Math.max(...timeline.map((t: any) => t.values?.[0]?.extracted_value || 0));
            const avg = Math.round(timeline.reduce((a: number, t: any) => a + (t.values?.[0]?.extracted_value || 0), 0) / (timeline.length || 1));
            const relatedQueries = data.related_queries?.rising?.slice(0, 5).map((q: any) => q.query) || [];
            const relatedTopics = data.related_topics?.rising?.slice(0, 5).map((t: any) => t.topic_title) || [];

            if (peak > 0 || relatedQueries.length > 0) {
              realData = `
REAL GOOGLE TRENDS DATA for "${keyword}":
- Peak interest: ${peak}/100
- Average interest: ${avg}/100
- Rising related searches: ${relatedQueries.join(", ") || "N/A"}
- Rising related topics: ${relatedTopics.join(", ") || "N/A"}

Use this real data to create ads that target exactly what people are searching for right now.`;
            }
          }
        } catch (e) {}

      } else if (platform === "Instagram" || platform === "Facebook" || platform === "TikTok") {
        try {
          // Google trends + YouTube search for Instagram/TikTok/Facebook reels context
          const [serpRes, ytRes] = await Promise.allSettled([
            fetch(`https://viral-tool-1.onrender.com/api/trends/google?q=${encodeURIComponent(keyword)}&country=IN`),
            fetch(`https://viral-tool-1.onrender.com/api/trends/youtube-search?q=${encodeURIComponent(keyword + " reel viral")}&country=IN`)
          ]);

          let trendContext = "";
          let reelContext = "";

          if (serpRes.status === "fulfilled" && serpRes.value.ok) {
            const data = await serpRes.value.json();
            const rising = data.related_queries?.rising?.slice(0, 5).map((q: any) => q.query) || [];
            const topics = data.related_topics?.rising?.slice(0, 3).map((t: any) => t.topic_title) || [];
            if (rising.length > 0) trendContext = `Trending searches: ${rising.join(", ")}. Hot topics: ${topics.join(", ")}.`;
          }

          if (ytRes.status === "fulfilled" && ytRes.value.ok) {
            const data = await ytRes.value.json();
            const videos = (data.items || []).slice(0, 4).map((v: any) => v.snippet?.title || "");
            if (videos.length > 0) reelContext = `Viral video titles for inspiration: ${videos.join(" | ")}`;
          }

          if (trendContext || reelContext) {
            realData = `
REAL TREND CONTEXT for ${platform} content:
${trendContext}
${reelContext}

For ${platform === "Instagram" ? "Instagram Reels" : platform === "TikTok" ? "TikTok videos" : "Facebook Reels"}:
- Focus on trending audio categories for ${niche} niche
- Hook must work in first 2-3 seconds
- Use trending formats that are currently viral
- Trending reel styles for ${niche}: Tutorial, POV, Day-in-Life, Before/After, Reaction, Storytelling`;
          }
        } catch (e) {}
      }

      // ── PLATFORM SPECIFIC PROMPTS ──
      const platformPrompts: Record<string, string> = {
        "Instagram": `You are a top Instagram Reels strategist with deep knowledge of what goes viral in ${new Date().getFullYear()}.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 Reel opening lines — first 3 words MUST stop scroll. Use controversy, shock, curiosity or bold claim. NO "Hey guys" or generic openers.
- titles: 5 Reel/Post title ideas with strong emotional trigger and trending formats (POV, Tutorial, Day-in-life, Before/After, Storytime)
- captions: 3 complete captions (150-200 chars) with emojis, line breaks, storytelling arc, strong CTA + 5 relevant hashtags each
- trendingTopics: 5 trending audio/song types + reel format suggestions currently viral for ${niche}`,

        "YouTube": `You are a top YouTube growth expert who analyzes what makes videos go viral.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 video opening lines (first 30 seconds). Must create immediate curiosity or FOMO. Use "Nobody tells you...", "I tried...", "The truth about...", "What if..."
- titles: 5 SEO-optimized titles. Include: number OR power word + keyword + benefit/curiosity. Example format: "I Tried [keyword] for 30 Days — Here's What Happened"
- captions: 3 video descriptions (200 chars). Include main keyword naturally + timestamps hint + CTA
- trendingTopics: 5 trending video formats + thumbnail ideas currently working for ${niche} on YouTube`,

        "TikTok": `You are a viral TikTok content expert who knows exactly what trends in ${new Date().getFullYear()}.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 first-3-second hooks. Must use pattern interrupt, bold statement, or trending format. No slow intros.
- titles: 5 TikTok caption ideas (under 100 chars) with trending hashtag placement
- captions: 3 complete TikTok scripts (Hook 1 line → Story 2 lines → Reveal 1 line → CTA 1 line)
- trendingTopics: 5 trending TikTok sounds/audio types + video format ideas for ${niche}`,

        "Facebook": `You are a Facebook content expert specializing in Reels and viral posts for ${new Date().getFullYear()}.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 Facebook Reel hooks that work for 25-45 age group. Emotional, relatable, community-focused
- titles: 5 post headlines that get shares (40-60 chars). Use nostalgia, community feeling, or helpful tips
- captions: 3 Facebook posts (200-300 chars). Story format → Value → Tag someone CTA
- trendingTopics: 5 Facebook Reel formats + content types that get maximum reach for ${niche}`,

        "Reddit": `You are a Reddit community expert who knows how to create posts that go viral on Reddit.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 Reddit post titles that spark discussion. Use: "I discovered...", "Unpopular opinion:", "After X years...", "What nobody tells you about...", "Am I the only one who..."
- titles: 5 specific subreddit recommendations with reasons (format: r/subredditname — why post here)
- captions: 3 complete Reddit post bodies (200-300 chars). Conversational, value-first, ends with question to spark comments
- trendingTopics: 5 trending discussion topics in ${niche} Reddit communities right now`,

        "LinkedIn": `You are a LinkedIn thought leadership expert creating content that builds authority.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 LinkedIn post openers. Start with personal story or bold insight. No "I'm excited to share..."
- titles: 5 article/newsletter titles (data-driven, specific, authoritative)
- captions: 3 LinkedIn posts (150-200 chars). Format: Bold insight → Evidence → Takeaway → Question
- trendingTopics: 5 trending ${niche} topics getting high engagement on LinkedIn currently`,

        "Twitter / X": `You are a Twitter/X viral content expert who creates threads and tweets that get massive engagement.
Generate content for ${niche} niche, keyword: "${keyword}".

STRICT OUTPUT RULES:
- viralHooks: 5 tweet hooks (under 200 chars). Controversial take, surprising fact, or bold opinion that sparks debate
- titles: 5 thread titles that make people click "read more"
- captions: 3 tweet threads (3 tweets each, separated by //, each under 280 chars)
- trendingTopics: 5 trending ${niche} conversations happening on Twitter/X right now`,

        "Pinterest": `You are a Pinterest SEO and content expert who drives massive traffic through pins.
Generate content for ${niche} niche, keyword: "${keyword}".

STRICT OUTPUT RULES:
- viralHooks: 5 pin titles (60-80 chars). Keyword-rich, benefit-focused, searchable. Use "How to", numbers, "Ideas"
- titles: 5 board name ideas (specific, searchable, niche-focused)
- captions: 3 pin descriptions (200-300 chars). Natural keyword inclusion, helpful tone, CTA to save
- trendingTopics: 5 trending Pinterest search terms for ${niche} with seasonal relevance`,

        "WhatsApp": `You are a WhatsApp broadcast and community marketing expert.
Generate content for ${niche} niche, keyword: "${keyword}".

STRICT OUTPUT RULES:
- viralHooks: 5 broadcast message openers (50-80 chars). Personal, direct, creates urgency or curiosity
- titles: 5 WhatsApp status ideas that drive profile visits
- captions: 3 broadcast messages (150-200 chars). Conversational, clear value, single CTA
- trendingTopics: 5 content ideas perfect for WhatsApp communities in ${niche}`,

        "Snapchat": `You are a Snapchat content expert for Gen-Z audience.
Generate content for ${niche} niche, keyword: "${keyword}".

STRICT OUTPUT RULES:
- viralHooks: 5 snap story hooks (30-50 chars). Fun, FOMO-inducing, casual
- titles: 5 story series ideas (3-7 snaps each)
- captions: 3 snap text overlays (10-20 chars). Short, punchy, emoji-driven
- trendingTopics: 5 trending Snapchat story formats for ${niche}`,

        "Google Ads": `You are a senior Google Ads copywriter with 10+ years of experience.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 Search Ad headlines (EXACTLY 25-30 chars each, no emojis). Use urgency + specific benefit. Count carefully!
- titles: 5 Display Ad headlines (25-30 chars). Focus on unique selling point
- captions: 3 Ad descriptions (80-90 chars each). Benefit + proof + CTA. Example: "Trusted by 10,000+ users. Get results in 7 days. Start your free trial today!"
- trendingTopics: 5 high-intent keyword variations for "${keyword}" to bid on`,

        "Meta Ads": `You are a Meta Ads specialist running high-ROAS campaigns.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 primary text openers (80-125 chars). Start with customer's pain point. NEVER start with brand name.
- titles: 5 ad headlines (30-40 chars). Specific number or result. Example: "Lose 10kg in 30 Days"
- captions: 3 complete ad primary texts (200-300 chars). Format: Pain (1 line) → Agitate (1 line) → Solution (2 lines) → Social proof (1 line) → CTA
- trendingTopics: 5 winning ad angles for ${niche} — fear, curiosity, social proof, urgency, transformation`,

        "YouTube Ads": `You are a YouTube Ads expert creating skippable and non-skippable ads.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 first-5-second hooks that prevent skipping. Must create immediate curiosity or shock
- titles: 5 ad headlines shown in companion banner (40-60 chars)
- captions: 3 complete ad scripts: Hook (5sec) → Problem (10sec) → Solution (15sec) → Social proof (5sec) → CTA (5sec)
- trendingTopics: 5 ad formats + targeting angles working best for ${niche} on YouTube`,

        "Native Ads": `You are a Native Ads expert creating editorial-style content.
Generate content for ${niche} niche, keyword: "${keyword}".
${realData}

STRICT OUTPUT RULES:
- viralHooks: 5 curiosity headlines that look like news/articles (not ads). Example: "The Surprising Reason Most ${niche} People Fail"
- titles: 5 article-style titles that blend with editorial content
- captions: 3 advertorial descriptions (100-150 chars). Informational, not promotional tone
- trendingTopics: 5 story angles + content formats working for native ads in ${niche}`,
      };

      const prompt = `${platformPrompts[platform] || platformPrompts["Instagram"]}

OUTPUT LANGUAGE: Write EVERYTHING strictly in ${langLabel} only

Respond ONLY in this exact JSON (no markdown, no extra text):
{"trendingTopics":["topic1","topic2","topic3","topic4","topic5"],"viralHooks":["hook1","hook2","hook3","hook4","hook5"],"titles":["title1","title2","title3","title4","title5"],"captions":["caption1","caption2","caption3"]}`;

      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
      incrementUsage();

      // Supabase mein save karo
      await supabase.from("generated_content").insert({
        user_id: user.id,
        niche: niche,
        platform: platform,
        language: langLabel,
        keyword: keyword,
        hooks: parsed.viralHooks || [],
        titles: parsed.titles || [],
        captions: parsed.captions || [],
        trending_topics: parsed.trendingTopics || [],
      });

      // Credits update
      await supabase.from("users").update({
        generations_used_today: (userData?.generations_used_today || 0) + 1,
        credits_remaining: (userData?.credits_remaining || 0) - 1
      }).eq("id", user.id);

    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };
  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    await supabase.from("reviews").insert({
      user_id: user.id,
      name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : user.email?.split("@")[0],
      role: reviewRole || "Content Creator",
      review: reviewText,
      stars: reviewStars,
      approved: false
    });
    setReviewSubmitted(true);
    setReviewLoading(false);
    setTimeout(() => { setShowReview(false); setReviewSubmitted(false); setReviewText(""); setReviewRole(""); setReviewStars(5); }, 2000);
  };

  const handleSelectPlan = (p: string) => { setShowPaywall(false); setPayingPlan(p); };
  const handlePaid = (p: string) => {
    setPayingPlan(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const tabs = [
    { id: "generate", label: "Generate",  emoji: "⚡" },
    { id: "score",    label: "Hook Score", emoji: "📊" },
    { id: "calendar", label: "Calendar",  emoji: "📅" },
    { id: "pack",     label: "Pack",      emoji: "📦" },
    { id: "trends",   label: "Trends",    emoji: "📈" },
  { id: "image",    label: "Image AI",  emoji: "🖼️" },
  ];

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#06040f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#a855f7", fontFamily: "sans-serif", animation: "pulse 1s infinite" }}>⚡ Loading...</p>
    </div>
  );


  if (showContact) return <Contact onBack={() => setShowContact(false)} />;
  if (legalPage) return <Legal page={legalPage} onBack={() => setLegalPage(null)} />;
  if (showOnboarding && user) return <Onboarding userId={user.id} onComplete={(type) => { setUserType(type); setShowOnboarding(false); }} />;
  if (showAdmin) return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  if (showPlans) return <Plans onBack={() => setShowPlans(false)} onUpgrade={(selectedPlan: string) => { setShowPlans(false); setPayingPlan(selectedPlan); }} currentPlan={plan} />;
  if (!user) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))} />;

  return (
    <>
    <Helmet>
  <title>VCI — Viral Content Intelligence</title>
  <meta name="description" content="AI-powered tool to discover and predict viral content for creators and brands." />
  <meta property="og:title" content="VCI — Viral Content Intelligence" />
  <meta property="og:description" content="Predict viral content with AI. Built for creators and brands." />
  <meta property="og:url" content="https://www.getvci.com" />
</Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #06040f; }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 20px rgba(255,107,53,0.25)} 50%{box-shadow:0 0 50px rgba(255,107,53,0.55)} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .gbtn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 40px rgba(255,107,53,0.5)!important; }
        .tbtn:hover { border-color:#a855f7!important; color:#a855f7!important; }
        input,textarea { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0a0a0a; }
        ::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── Header ── */}
        <div style={{
          background: "#08040f", borderBottom: "1px solid #1a1040",
          padding: "1.5rem 1.5rem 1rem", textAlign: "center", position: "relative", minHeight: "120px"
        }}>
        {user?.email === "ravenderr01@gmail.com" && (
  <button onClick={() => setShowAdmin(true)} style={{
    position: "absolute", top: "1rem", right: "34rem",
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444", padding: "0.4rem 1rem", borderRadius: "8px",
    cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
    fontFamily: "'DM Sans',sans-serif"
  }}>🔧 Admin</button>
)}
          <button onClick={() => supabase.auth.signOut()} style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>
            Logout →
          </button>
          <button onClick={() => setShowPlans(true)} style={{
            position: "absolute", top: "1rem", right: "20rem",
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>
            💎 Plans
          </button>

          <button onClick={() => setShowContact(true)} style={{
            position: "absolute", top: "1rem", right: "7rem",
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
            color: "#06b6d4", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>
            Support
          </button>

          {/* Review Button */}
          <button onClick={() => setShowReview(true)} style={{
            position: "absolute", top: "1rem", right: "13rem",
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
            color: "#f59e0b", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>
            ⭐ Review
          </button>

          {/* Profile Button */}
          <div style={{ position: "absolute", top: "0.75rem", left: "1rem" }}
            onClick={() => setShowProfile(!showProfile)}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontWeight: 800, fontSize: "1rem", color: "#fff",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: "0 4px 15px rgba(139,92,246,0.4)"
            }}>
              {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>

            {showProfile && (
              <div style={{
                position: "absolute", top: "48px", left: 0,
                background: "#0d0d0d", border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "16px", padding: "1.25rem", minWidth: "240px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100,
                animation: "slideUp 0.2s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "1.3rem", color: "#fff",
                    fontFamily: "'Outfit',sans-serif", flexShrink: 0
                  }}>
                    {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", fontFamily: "'Outfit',sans-serif" }}>
                      {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "User"}
                    </div>
                    <div style={{ color: "#555", fontSize: "0.75rem" }}>{user?.email}</div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                  borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <span style={{ color: "#888", fontSize: "0.75rem" }}>Current Plan</span>
                  <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.82rem", textTransform: "capitalize" }}>
                    {plan} ✨

                  </span>
                </div>

                {profile?.phone && (
                  <div style={{ color: "#555", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                    📞 {profile.phone}
                  </div>
                )}
                <div style={{ color: "#333", fontSize: "0.72rem", marginBottom: "1rem" }}>
                  📅 Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </div>

                {profile?.plan === "free" && (
                  <button onClick={() => { setShowPaywall(true); setShowProfile(false); }}
                    style={{
                      width: "100%", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      border: "none", color: "#fff", padding: "0.6rem",
                      borderRadius: "8px", cursor: "pointer", fontWeight: 700,
                      fontSize: "0.82rem", fontFamily: "'Outfit',sans-serif", marginBottom: "0.5rem"
                    }}>
                    🚀 Upgrade Plan
                  </button>
)}

                <button onClick={() => supabase.auth.signOut()}
                  style={{
                    width: "100%", background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444",
                    padding: "0.6rem", borderRadius: "8px", cursor: "pointer",
                    fontWeight: 700, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif"
                  }}>
                  Logout
                </button>
              </div>
            )}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "#a855f710", border: "1px solid #a855f725", borderRadius: "20px",
            padding: "0.2rem 0.85rem", marginBottom: "0.6rem"
          }}>
            <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.08em" }}>⚡ VCI — Viral Content Intelligence</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.4rem,5vw,2.2rem)", fontWeight: 800,
            margin: "0 0 0.3rem",
            background: "linear-gradient(135deg,#ffffff 10%, #ff9a6c 50%, #a855f7 90%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Viral Content Intelligence
          </h1>
          <p style={{ color: "#444", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>
            Hook Score · 30-Day Calendar · Content Pack · Instant Generation
          </p>

          {/* Usage bar */}
          <div style={{
            maxWidth: "260px", margin: "0 auto 1rem", background: "#0d0d0d",
            border: "1px solid #161616", borderRadius: "10px", padding: "0.6rem 0.9rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "#444" }}>Plan: <strong style={{ color: "#a855f7" }}>{PLANS[plan as keyof typeof PLANS]?.label}</strong></span>
              <span style={{ color: remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                {remaining === 0 ? "⛔ Limit reached" : `${remaining} / ${limit} credits`}
              </span>
            </div>
            <div style={{ background: "#141414", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "4px",
                background: remaining === 0 ? "#ef4444" : "linear-gradient(90deg,#a855f7,#c084fc)",
                width: `${usedPct}%`, transition: "width 0.5s"
              }} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            maxWidth: "640px", margin: "0 auto",
            display: "flex", gap: "0.15rem", background: "#0a0a0a",
            borderRadius: "12px 12px 0 0", padding: "0.5rem 0.5rem 0",
            borderTop: "1px solid #111", borderLeft: "1px solid #111", borderRight: "1px solid #111"
          }}>
            {tabs.map(t => (
              <TabBtn key={t.id} id={t.id} label={t.label} emoji={t.emoji}
                active={activeTab === t.id} onClick={setActiveTab}
                isPro={["score","calendar","pack","trends","image"].includes(t.id) && !["pro","agency","Agency"].includes(plan)} />
            ))}
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>

          {/* ── TAB: GENERATE ── */}
          {activeTab === "generate" && (
            <div>
              {/* Niche */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>NICHE</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {Object.keys(NICHE_EXAMPLES).map(n => (
                    <button key={n} className="tbtn" onClick={() => {
                        const freeNiches = ["Fitness", "Business", "Daily Vlog"];
                        const starterNiches = Object.keys(NICHE_EXAMPLES).filter(n => n !== "Ads & Marketing" && n !== "Real Estate" && n !== "Comedy & Entertainment");
                        const isLocked = (plan === "free" && !freeNiches.includes(n)) || (plan === "starter" && !starterNiches.includes(n));
                        isLocked ? setShowPaywall(true) : setNiche(n);
                      }}
                      style={{
                        background: niche === n ? "#a855f712" : "#0d0d0d",
                        border: `1px solid ${niche === n ? "#a855f7" : "#1a1a1a"}`,
                        color: niche === n ? "#a855f7" : (plan === "free" && !["Fitness","Business"].includes(n)) ? "#2a2a2a" : "#444",
                        padding: "0.28rem 0.75rem", borderRadius: "20px",
                        cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                        transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                      }}>
                      {(plan === "free" && !["Fitness","Business"].includes(n)) ? "🔒 " : ""}{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {[
  { group: "📱 Social Media", platforms: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"] },
  { group: "📢 Advertising", platforms: ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"] }
].map(({ group, platforms }) => (
  <div key={group} style={{ width: "100%", marginBottom: "0.75rem" }}>
    <p style={{ color: "#444", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.35rem", textTransform: "uppercase" }}>{group}</p>
    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
      {platforms.map(p => (
        <button key={p} className="tbtn" onClick={() => {
          const freePlatforms = ["Instagram", "YouTube"];
          const starterPlatforms = ["Instagram", "YouTube", "LinkedIn", "Twitter / X", "Facebook"];
          const proPlatforms = ["Instagram", "YouTube", "LinkedIn", "Twitter / X", "Facebook", "TikTok", "Reddit", "Google Ads", "Meta Ads", "YouTube Ads", "Native Ads"];
          const isLocked = (plan === "free" && !freePlatforms.includes(p)) || (plan === "starter" && !starterPlatforms.includes(p));
          isLocked ? setShowPaywall(true) : setPlatform(p);
        }}
          style={{
            background: platform === p ? "#a855f712" : "#0d0d0d",
            border: `1px solid ${platform === p ? "#a855f7" : "#1a1a1a"}`,
            color: platform === p ? "#a855f7" : (plan === "free" && !["Instagram","YouTube"].includes(p)) ? "#2a2a2a" : "#444",
            padding: "0.28rem 0.75rem", borderRadius: "20px",
            cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
            transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
          }}>
          {(plan === "free" && !["Instagram","YouTube"].includes(p)) ? "🔒 " : ""}{p}
        </button>
      ))}
    </div>
  </div>
))}                </div>
              </div>

              {/* Keyword */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>OUTPUT LANGUAGE</label>
              {/* Selected language display */}
              <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(168,85,247,0.15)", border: "1px solid #a855f7", color: "#a855f7", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>
                  ✓ {getLangLabel(selectedLang)}
                </span>
                <span style={{ color: "#333", fontSize: "0.72rem" }}>← Click country to change</span>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {LANGUAGE_GROUPS.map(group => (
                  <div key={group.code} style={{ position: "relative" }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(`lang-${group.code}`);
                        if (el) el.style.display = el.style.display === "none" ? "flex" : "none";
                      }}
                      style={{
                        background: group.languages.some(l => l.code === selectedLang) ? "rgba(168,85,247,0.15)" : "#0d0d0d",
                        border: `1px solid ${group.languages.some(l => l.code === selectedLang) ? "#a855f7" : "#1a1a1a"}`,
                        color: group.languages.some(l => l.code === selectedLang) ? "#a855f7" : "#444",
                        padding: "0.28rem 0.75rem", borderRadius: "20px",
                        cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                        transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                      }}>
                      {group.country} ▾
                    </button>
                    <div id={`lang-${group.code}`} style={{
                      display: "none", position: "absolute", top: "110%", left: 0,
                      background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "12px",
                      padding: "0.5rem", zIndex: 50, minWidth: "160px",
                      flexDirection: "column", gap: "0.3rem",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                    }}>
                      {group.languages.map(lang => {
                        const freeLangs = ["en"];
                        const starterLangs = ["en", "hi"];
                        const isLocked = 
                          (plan === "free" && !freeLangs.includes(lang.code)) ||
                          (plan === "starter" && !starterLangs.includes(lang.code)) &&
                          !["pro_creator", "growth", "business", "agency"].includes(plan);
                        return (
                          <button key={lang.code}
                            onClick={() => {
                              if (isLocked) { setShowPaywall(true); return; }
                              setSelectedLang(lang.code);
                              const el = document.getElementById(`lang-${group.code}`);
                              if (el) el.style.display = "none";
                            }}
                            style={{
                              background: selectedLang === lang.code ? "rgba(168,85,247,0.15)" : "transparent",
                              border: "none",
                              color: selectedLang === lang.code ? "#a855f7" : isLocked ? "#333" : "#ccc",
                              padding: "0.4rem 0.75rem", borderRadius: "8px",
                              cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                              textAlign: "left", width: "100%",
                              fontFamily: "'DM Sans',sans-serif"
                            }}>
                            {isLocked ? "🔒 " : selectedLang === lang.code ? "✓ " : ""}{lang.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
                

              <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>KEYWORD</label>
                <input value={keyword}
                  onChange={e => { setKeyword(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  placeholder={`e.g. ${NICHE_EXAMPLES[niche as keyof typeof NICHE_EXAMPLES][0]}`}
                  style={{
                    width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a",
                    borderRadius: "12px", padding: "0.8rem 1rem", color: "#fff",
                    fontSize: "0.92rem", outline: "none", transition: "border 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#a855f7"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"}
                />
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  {NICHE_EXAMPLES[niche as keyof typeof NICHE_EXAMPLES].slice(0, 3).map(ex => (
                    <button key={ex} onClick={() => setKeyword(ex)}
                      style={{
                        background: "none", border: "1px solid #141414", color: "#2a2a2a",
                        padding: "0.18rem 0.55rem", borderRadius: "6px", cursor: "pointer",
                        fontSize: "0.7rem", fontFamily: "'DM Sans',sans-serif",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { (e.target as any).style.color = "#555"; (e.target as any).style.borderColor = "#222"; }}
                      onMouseLeave={e => { (e.target as any).style.color = "#2a2a2a"; (e.target as any).style.borderColor = "#141414"; }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0 0 0.7rem" }}>{error}</p>}

              <button className="gbtn" onClick={handleGenerate} disabled={loading}
                style={{
                  width: "100%", padding: "0.95rem", borderRadius: "12px",
                  background: loading ? "#0d0d0d" : "linear-gradient(135deg,#a855f7,#c084fc)",
                  border: "none", color: loading ? "#2a2a2a" : "#000",
                  fontWeight: 800, fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Syne',sans-serif", transition: "all 0.3s",
                  animation: !loading ? "glow 3s infinite" : "none", marginBottom: "1.5rem"
                }}>
                {loading
                  ? <span style={{ animation: "pulse 1s infinite" }}>⚡ Generating in {langLabel}...</span>
                  : "⚡ Generate Viral Content"}
              </button>

              {results && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    marginBottom: "1rem", padding: "0.5rem 0.75rem",
                    background: "#a855f708", border: "1px solid #a855f720",
                    borderRadius: "8px", fontSize: "0.75rem", color: "#a855f7"
                  }}>
                    🌐 Generated in <strong>{langLabel}</strong>
                    <span style={{ marginLeft: "auto", color: "#333", fontSize: "0.7rem" }}>
                      💡 Try Hook Score tab to improve these
                    </span>
                  </div>
                  {["Google Ads", "Meta Ads", "Native Ads"].includes(platform) ? (
                    <>
                      <ResultCard title="Headlines" items={results.viralHooks} emoji="📢" color="#818cf8" />
                      <ResultCard title="Ad Titles" items={results.titles} emoji="📝" color="#a855f7" />
                      <ResultCard title="Descriptions / CTAs" items={results.captions} emoji="💬" color="#22c55e" />
                    </>
                  ) : platform === "YouTube" ? (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#818cf8" />
                      <ResultCard title="Video Hooks" items={results.viralHooks} emoji="🎬" color="#a855f7" />
                      <ResultCard title="SEO Titles" items={results.titles} emoji="📝" color="#22c55e" />
                      <ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#f59e0b" />
                    </>
                  ) : platform === "LinkedIn" ? (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#818cf8" />
                      <ResultCard title="Story Openers" items={results.viralHooks} emoji="💼" color="#a855f7" />
                      <ResultCard title="Thought Leadership Titles" items={results.titles} emoji="📝" color="#22c55e" />
                      <ResultCard title="Posts" items={results.captions} emoji="💬" color="#f59e0b" />
                    </>
                  ) : platform === "Twitter / X" ? (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#818cf8" />
                      <ResultCard title="Tweet Hooks" items={results.viralHooks} emoji="🐦" color="#a855f7" />
                      <ResultCard title="Thread Titles" items={results.titles} emoji="📝" color="#22c55e" />
                      <ResultCard title="Tweet Threads" items={results.captions} emoji="💬" color="#f59e0b" />
                    </>
                  ) : platform === "Reddit" ? (
                    <>
                      <ResultCard title="Reddit Post Titles" items={results.viralHooks} emoji="🔴" color="#ff4500" />
                      <ResultCard title="Subreddit Ideas" items={results.titles} emoji="📌" color="#ff6534" />
                      <ResultCard title="Post Bodies" items={results.captions} emoji="💬" color="#a855f7" />
                    </>
                  ) : (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#818cf8" />
                      <ResultCard title="Viral Hooks" items={results.viralHooks} emoji="🎣" color="#a855f7" />
                      <ResultCard title="Title Ideas" items={results.titles} emoji="📝" color="#22c55e" />
                      <ResultCard title="Captions" items={results.captions} emoji="💬" color="#f59e0b" />
                    </>
                  )}

                  {/* Upsell to other features */}
                  <div style={{
                    background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px",
                    padding: "1rem", marginTop: "0.5rem"
                  }}>
                    <p style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", color: "#444", fontWeight: 600 }}>
                      WANT MORE FROM THIS KEYWORD?
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {[
                        ["📊 Score my hooks", "score"],
                        ["📅 Plan 30 days", "calendar"],
                        ["📦 Full content pack", "pack"]
                      ].map(([label, tab]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          style={{
                            background: "#111", border: "1px solid #1e1e1e", color: "#555",
                            padding: "0.35rem 0.75rem", borderRadius: "8px", cursor: "pointer",
                            fontSize: "0.75rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { (e.currentTarget.style.borderColor = "#a855f7"); (e.currentTarget.style.color = "#a855f7"); }}
                          onMouseLeave={e => { (e.currentTarget.style.borderColor = "#1e1e1e"); (e.currentTarget.style.color = "#555"); }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {plan === "free" && (
                <div style={{
                  background: "#a855f708", border: "1px solid #a855f718", borderRadius: "14px",
                  padding: "1.1rem", marginTop: "1rem", textAlign: "center"
                }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, marginBottom: "0.4rem", fontSize: "0.95rem" }}>
                    🔥 Unlock Hook Score, Calendar & Content Packs
                  </div>
                  <div style={{ color: "#444", fontSize: "0.77rem", marginBottom: "0.85rem" }}>
                    Starter ₹299 · Pro Creator ₹999 · Business ₹1,999 · Agency ₹4,999
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setShowPaywall(true)} style={{
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#000",
                      fontWeight: 800, padding: "0.55rem 1.1rem", borderRadius: "10px",
                      cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.82rem"
                    }}>🇮🇳 UPI</button>
                    <button onClick={() => setShowPaywall(true)} style={{
                      background: "linear-gradient(135deg,#003087,#009cde)", border: "none", color: "#fff",
                      fontWeight: 800, padding: "0.55rem 1.1rem", borderRadius: "10px",
                      cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.82rem"
                    }}>🌍 PayPal</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: HOOK SCORE ── */}
          {activeTab === "score" && (
            (plan === "free") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Growth Plan Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Hook Score Analyzer unlocks from Starter plan onwards.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
                  🚀 Upgrade Now
                </button>
              </div>
            ) : (
            <HookScoreAnalyzer
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              langLabel={langLabel}
            />
            )
          )}

          {/* ── TAB: CALENDAR ── */}
          {activeTab === "calendar" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>30-Day Content Calendar is available on paid plans only.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
                  🚀 Upgrade Now
                </button>
              </div>
            ) : (
            <ContentCalendar
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              keyword={keyword} niche={niche} langLabel={langLabel}
              creditCost={5}
            />
            )
          )}
{/* ── TAB: IMAGE AI ── */}
{activeTab === "image" && (
  <ImageContent
    plan={plan}
    onUpgrade={() => setShowPaywall(true)}
    credits={remaining}
    onCreditUsed={incrementUsage}
  />
)}
          {/* ── TAB: TRENDS ── */}
          {activeTab === "trends" && (
            (plan === "free" || plan === "starter") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>AI Trend Intelligence is available on paid plans only.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
                  🚀 Upgrade Now
                </button>
              </div>
            ) : (
            <Trends niche={niche} keyword={keyword} langLabel={langLabel} />
            )
          )}

          {/* ── TAB: PACK ── */}
          {activeTab === "pack" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>One-Click Content Pack is available on paid plans only.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
                  🚀 Upgrade Now
                </button>
              </div>
            ) : (
            <ContentPack
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              keyword={keyword} niche={niche} platform={platform} langLabel={langLabel}
              creditCost={3}
            />
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "1.5rem 1rem",
        borderTop: "1px solid rgba(139,92,246,0.1)",
        marginTop: "2rem"
      }}>
        <p style={{ color: "#2a2a2a", fontSize: "0.72rem", margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          Designed & Developed by{" "}
          <span style={{ color: "#a855f7", fontWeight: 700 }}>Global Web Info Vision</span>
          {" "}© {new Date().getFullYear()} All Rights Reserved.{" "}
          <span style={{ margin: "0 0.5rem", color: "#1a1a1a" }}>|</span>
          <button onClick={() => setLegalPage("privacy")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Privacy Policy</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("terms")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Terms & Conditions</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("refund")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Refund Policy</button>
        </p>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "20px", padding: "2rem", maxWidth: "440px", width: "100%", animation: "slideUp 0.3s ease" }}>
            {!reviewSubmitted ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.3rem" }}>Share Your Experience</h3>
                  <p style={{ color: "#555", fontSize: "0.82rem", margin: 0 }}>Your review helps other creators discover VCI!</p>
                </div>

                {/* Stars */}
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewStars(s)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.8rem", color: s <= reviewStars ? "#f59e0b" : "#2a2a2a", transition: "all 0.2s" }}>
                      ★
                    </button>
                  ))}
                </div>

                {/* Role */}
                <input value={reviewRole} onChange={e => setReviewRole(e.target.value)}
                  placeholder="Your role (e.g. Instagram Creator, YouTuber)"
                  style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif", outline: "none", marginBottom: "0.75rem" }} />

                {/* Review */}
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with VCI..."
                  rows={4}
                  style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "none", marginBottom: "1rem" }} />

                <button onClick={handleReviewSubmit} disabled={reviewLoading || !reviewText.trim()}
                  style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: !reviewText.trim() ? "rgba(251,191,36,0.2)" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: !reviewText.trim() ? "#555" : "#000", fontWeight: 800, fontSize: "0.9rem", cursor: !reviewText.trim() ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: "0.5rem" }}>
                  {reviewLoading ? "⚡ Submitting..." : "⭐ Submit Review"}
                </button>
                <button onClick={() => setShowReview(false)} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                <h3 style={{ color: "#fff", fontFamily: "'Outfit',sans-serif" }}>Thank You!</h3>
                <p style={{ color: "#555", fontSize: "0.85rem" }}>Your review will be published after approval.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSelectPlan={handleSelectPlan} />}
      {payingPlan  && <PaymentModal plan={payingPlan} onClose={() => setPayingPlan(null)} onPaid={handlePaid} />}

      {/* Toast */}
      <VCIAssistant niche={niche} platform={platform} keyword={keyword} plan={plan} />
      {/* WhatsApp Button */}
      <a href="https://wa.me/919315133390?text=Hi!%20I%20want%20to%20know%20more%20about%20Viral%20Content%20Tool"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999,
          background: "linear-gradient(135deg,#25d366,#128c7e)",
          color: "#fff", borderRadius: "50px", padding: "0.75rem 1.25rem",
          textDecoration: "none", fontWeight: 700, fontSize: "0.85rem",
          fontFamily: "'DM Sans',sans-serif",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          display: "flex", alignItems: "center", gap: "0.5rem",
          transition: "all 0.3s"
        }}>
        💬 WhatsApp
      </a>

      {showSuccess && (
        <div style={{
          position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff",
          padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 800, zIndex: 9999,
          animation: "slideUp 0.3s ease", whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(34,197,94,0.4)", fontFamily: "'Syne',sans-serif"
        }}>
          ✅ Payment received! We'll activate your plan within 2 hours. Check your email.
        </div>
      )}
    </>
  );
}
