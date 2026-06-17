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

const YOUR_UPI_ID    = "9315133390@ptyes";
const YOUR_PAYPAL_ME = "https://paypal.me/yourname";
const SUPPORT_PHONE = "+91 9315133390";

const PLANS = {
  free:        { label: "Free",        limit: 10,   priceINR: 0,    priceUSD: 0  },
  starter:     { label: "Starter",     limit: 100,  priceINR: 299,  priceUSD: 4,  badge: "🔥 Popular" },
  pro_creator: { label: "Pro Creator", limit: 400,  priceINR: 999,  priceUSD: 12, badge: "⚡ Best Value" },
  growth:      { label: "Growth",      limit: 150,  priceINR: 799,  priceUSD: 10, badge: "📈 Business" },
  business:    { label: "Business",    limit: 400,  priceINR: 1999, priceUSD: 24, badge: "💎 Pro" },
  agency:      { label: "Agency",      limit: 1000, priceINR: 4999, priceUSD: 59, badge: "👑 Premium" },
};

const NICHE_EXAMPLES: Record<string, string[]> = {
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
  { country: "🇮🇳 India", code: "IN", languages: [
    { code: "hi", label: "Hindi" }, { code: "bn", label: "Bengali" },
    { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
    { code: "mr", label: "Marathi" }, { code: "gu", label: "Gujarati" },
    { code: "kn", label: "Kannada" }, { code: "ml", label: "Malayalam" },
    { code: "pa", label: "Punjabi" }, { code: "or", label: "Odia" },
    { code: "as", label: "Assamese" }, { code: "ur", label: "Urdu" },
  ]},
  { country: "🇬🇧 English", code: "EN", languages: [{ code: "en", label: "English" }]},
  { country: "🇺🇸 USA", code: "US", languages: [
    { code: "en-us", label: "American English" }, { code: "es-us", label: "Spanish (US)" },
  ]},
  { country: "🇩🇪 Germany", code: "DE", languages: [{ code: "de", label: "German" }]},
  { country: "🇫🇷 France", code: "FR", languages: [{ code: "fr", label: "French" }]},
  { country: "🇪🇸 Spain", code: "ES", languages: [{ code: "es", label: "Spanish" }]},
  { country: "🇮🇹 Italy", code: "IT", languages: [{ code: "it", label: "Italian" }]},
  { country: "🇷🇺 Russia", code: "RU", languages: [{ code: "ru", label: "Russian" }]},
  { country: "🇨🇳 China", code: "CN", languages: [
    { code: "zh", label: "Chinese (Mandarin)" }, { code: "zh-yue", label: "Cantonese" },
  ]},
  { country: "🇯🇵 Japan", code: "JP", languages: [{ code: "ja", label: "Japanese" }]},
  { country: "🇰🇷 Korea", code: "KR", languages: [{ code: "ko", label: "Korean" }]},
  { country: "🇸🇦 Arabic", code: "AR", languages: [
    { code: "ar", label: "Arabic" }, { code: "ar-eg", label: "Egyptian Arabic" },
  ]},
  { country: "🇵🇰 Pakistan", code: "PK", languages: [{ code: "ur-pk", label: "Urdu (Pakistan)" }]},
  { country: "🇹🇭 Thailand", code: "TH", languages: [{ code: "th", label: "Thai" }]},
  { country: "🇧🇷 Brazil", code: "BR", languages: [{ code: "pt", label: "Portuguese" }]},
  { country: "🇮🇩 Indonesia", code: "ID", languages: [{ code: "id", label: "Indonesian" }]},
  { country: "🇹🇷 Turkey", code: "TR", languages: [{ code: "tr", label: "Turkish" }]},
];

const LANG_LABELS: Record<string, string> = {
  en: "English", "en-us": "American English", "es-us": "Spanish (US)",
  hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
  mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  pa: "Punjabi", or: "Odia", as: "Assamese", ur: "Urdu", "ur-pk": "Urdu (Pakistan)",
  es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", ar: "Arabic", "ar-eg": "Egyptian Arabic",
  zh: "Chinese (Mandarin)", "zh-yue": "Cantonese",
  ja: "Japanese", ko: "Korean", ru: "Russian",
  tr: "Turkish", id: "Indonesian", th: "Thai",
};

const LANG_STRICT: Record<string, string> = {
  en: "English only",
  "en-us": "American English only",
  hi: "Hindi only — use Devanagari script (हिंदी में लिखें)",
  bn: "Bengali only — use Bengali script (বাংলায় লিখুন)",
  ta: "Tamil only — use Tamil script (தமிழில் எழுதவும்)",
  te: "Telugu only — use Telugu script (తెలుగులో రాయండి)",
  mr: "Marathi only — use Devanagari script (मराठीत लिहा)",
  gu: "Gujarati only — use Gujarati script (ગુજરાતીમાં લખો)",
  kn: "Kannada only — use Kannada script (ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ)",
  ml: "Malayalam only — use Malayalam script (മലയാളത്തിൽ എഴുതുക)",
  pa: "Punjabi only — use Gurmukhi script (ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ)",
  or: "Odia only — use Odia script (ଓଡ଼ିଆରେ ଲେଖ)",
  as: "Assamese only — use Assamese script (অসমীয়াত লিখক)",
  ur: "Urdu only — use Urdu script (اردو میں لکھیں)",
  "ur-pk": "Urdu only — use Urdu script (اردو میں لکھیں)",
  es: "Spanish only", "es-us": "Spanish only",
  fr: "French only", de: "German only", it: "Italian only",
  pt: "Portuguese only",
  ar: "Arabic only — use Arabic script (اكتب بالعربية)",
  "ar-eg": "Egyptian Arabic only — use Arabic script",
  zh: "Simplified Chinese only — use Chinese characters (用中文写)",
  "zh-yue": "Cantonese only — use Traditional Chinese characters",
  ja: "Japanese only — use Japanese script (日本語で書いてください)",
  ko: "Korean only — use Korean script (한국어로 작성하세요)",
  ru: "Russian only — use Cyrillic script (пишите на русском)",
  tr: "Turkish only", id: "Indonesian only",
  th: "Thai only — use Thai script (เขียนเป็นภาษาไทย)",
};

function getLangLabel(code: string) { return LANG_LABELS[code] || "English"; }
function getLangStrict(code: string) { return LANG_STRICT[code] || `${LANG_LABELS[code] || "English"} only`; }

function getBrowserLang() {
  const raw = navigator.language || navigator.languages?.[0] || "en";
  return raw.split("-")[0].toLowerCase();
}

function getUPIQR(upiId: string, amount: number) {
  const upiUrl = `upi://pay?pa=${upiId}&pn=ViralTool&am=${amount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}&bgcolor=0a0a0a&color=ff6b35&margin=12`;
}

const CONTENT_TYPES = ["Tips","Story","Mistakes","Behind the Scenes","Q&A","Tutorial","Motivation","Trend","Case Study","Poll","Review","Challenge"];

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

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, cx = 36, cy = 36, stroke = 5;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => { setTimeout(() => setProgress(score / 10), 100); }, [score]);
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
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnimatedScore target={score} color={color} />
        </div>
      </div>
      <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}
function ScriptLab({ plan, usageCount, limit, onUpgrade, langStrict }: any) {
  const [mode, setMode] = useState<"improve" | "generate">("improve");

  // Improve mode states
  const [script, setScript] = useState("");
  const [improveResult, setImproveResult] = useState<any>(null);
  const [improveLoading, setImproveLoading] = useState(false);

  // Generate mode states
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState("Tutorial");
  const [duration, setDuration] = useState("30 sec");
  const [generateResult, setGenerateResult] = useState<any>(null);
  const [generateLoading, setGenerateLoading] = useState(false);

  const [platform, setPlatform] = useState("Instagram");
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
  ];

  const STYLES = ["Tutorial", "Story", "POV", "Challenge", "Before/After", "Motivation", "Tips", "Review", "Day in Life", "Comedy"];
  const DURATIONS = ["15 sec", "30 sec", "60 sec", "90 sec"];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gradeColor = (g: string) => ({ A: "#22c55e", B: "#06b6d4", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[g] || "#6d28d9");
  const lineColor = (type: string) => type === "strong" ? "#22c55e" : type === "weak" ? "#ef4444" : "#71717a";

  const analyzeScript = async () => {
    if (!script.trim()) { setError("Apna script paste karo."); return; }
    if (script.trim().split(" ").length < 5) { setError("Script thodi lambi honi chahiye."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setImproveLoading(true); setError(""); setImproveResult(null);

    const prompt = `You are an expert content coach. Analyze this ${platform} script and provide before/after comparison.

ORIGINAL SCRIPT:
"""${script}"""

PLATFORM: ${platform}
LANGUAGE: Detect and respond in same language as the script.

Respond ONLY in JSON:
{
  "before": {
    "score": 0,
    "grade": "C",
    "lines": [{"text": "line", "score": 0, "issue": "problem", "type": "weak/strong/neutral"}],
    "summary": "verdict"
  },
  "after": {
    "score": 0,
    "grade": "A",
    "script": "complete improved script",
    "lines": [{"text": "line", "reason": "why it works"}],
    "summary": "why better"
  },
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "score_jump": "+X points",
  "platform_tips": ["tip 1", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setImproveResult(parsed);
    } catch { setError("Analysis failed. Try again."); }
    setImproveLoading(false);
  };

  const generateScript = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setGenerateLoading(true); setError(""); setGenerateResult(null);

    const durationGuide: Record<string, string> = {
      "15 sec": "Hook (0-3s) + Key Point (3-12s) + CTA (12-15s). Very short and punchy.",
      "30 sec": "Hook (0-3s) + Problem (3-8s) + Solution (8-25s) + CTA (25-30s)",
      "60 sec": "Hook (0-5s) + Problem (5-15s) + 3 Key Points (15-50s) + CTA (50-60s)",
      "90 sec": "Hook + Story + 3-5 tips + Examples + CTA. More storytelling.",
      "3 min": "Full tutorial format: Hook + Problem + Step by step solution + Results + CTA",
    };

    const platformGuide: Record<string, string> = {
      "Instagram": "Instagram Reels — vertical 9:16, hook in first 3 seconds, trending audio suggestion, end with save/share CTA",
      "YouTube": "YouTube Shorts or Long form — strong hook, value delivery, subscribe CTA",
      "TikTok": "TikTok — fast paced, trending sounds, pattern interrupt hook, duet/stitch friendly",
      "LinkedIn": "LinkedIn — professional story format, insight-driven, no trending audio needed",
      "Twitter / X": "Twitter/X — punchy thread format or video script, controversial hook",
      "Facebook": "Facebook Reels — emotional hook, community focused, share CTA",
    };

    const prompt = `You are a viral ${platform} content creator and script writer.

Create a complete ${duration} ${style} script for ${platform} about: "${keyword}"

Platform: ${platform}
Style: ${style}
Duration: ${duration}
Format Guide: ${durationGuide[duration]}
Platform Guide: ${platformGuide[platform]}
Language: ${langStrict}

Create a script that will go VIRAL. Be specific, emotional, and platform-perfect.

Respond ONLY in JSON:
{
  "title": "Catchy title for this script",
  "hook": "First 3 seconds — attention grabbing opener",
  "script": "Complete word-for-word script with [PAUSE], [SHOW X], [CUT TO] stage directions",
  "sections": [
    {"time": "0-3s", "label": "HOOK", "content": "exact words to say", "direction": "what to show/do"},
    {"time": "3-10s", "label": "PROBLEM", "content": "exact words", "direction": "visual direction"},
    {"time": "10-25s", "label": "SOLUTION", "content": "exact words", "direction": "visual direction"},
    {"time": "25-30s", "label": "CTA", "content": "exact words", "direction": "visual direction"}
  ],
  "caption": "Ready-to-post caption with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "thumbnail_idea": "What to show in thumbnail/cover",
  "audio_suggestion": "Type of music/sound that works best",
  "pro_tips": ["tip 1", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setGenerateResult(parsed);
    } catch { setError("Generation failed. Try again."); }
    setGenerateLoading(false);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Mode Toggle */}
      <div style={{ display: "flex", background: "#0f0f0f", borderRadius: "14px", padding: "0.35rem", marginBottom: "1rem", border: "1px solid #1f1f1f" }}>
        {[
          { id: "generate", label: "🎬 Generate Script", desc: "Fresh reel script banao" },
          { id: "improve", label: "✨ Improve Script", desc: "Existing script better banao" },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id as any); setError(""); }}
            style={{ flex: 1, padding: "0.65rem 1rem", borderRadius: "10px", border: "none", cursor: "pointer", transition: "all 0.2s", background: mode === m.id ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "transparent", color: mode === m.id ? "#fff" : "#52525b", fontWeight: mode === m.id ? 800 : 500, fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", textAlign: "center" as const }}>
            <div>{m.label}</div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, marginTop: "0.1rem" }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Platform Selector */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "1rem" }}>
        <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.5rem" }}>SELECT PLATFORM</label>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              style={{ background: platform === p.id ? `${p.color}15` : "#080808", border: `1px solid ${platform === p.id ? p.color : "#1f1f1f"}`, color: platform === p.id ? p.color : "#52525b", padding: "0.35rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s" }}>
              {p.emoji} {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* GENERATE MODE */}
      {mode === "generate" && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🎬</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Generate Reel Script</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Keyword daalo → complete word-for-word script ready</p>
            </div>
          </div>

          {/* Keyword */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>KEYWORD / TOPIC</label>
            <input value={keyword} onChange={e => { setKeyword(e.target.value); setError(""); }}
              placeholder={`e.g. weight loss, morning routine, AI tools...`}
              style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.8rem 1rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#6d28d9"}
              onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
          </div>

          {/* Style */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>SCRIPT STYLE</label>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)}
                  style={{ background: style === s ? "rgba(109,40,217,0.15)" : "#080808", border: `1px solid ${style === s ? "#6d28d9" : "#1f1f1f"}`, color: style === s ? "#8b5cf6" : "#52525b", padding: "0.28rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, transition: "all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>DURATION</label>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{ background: duration === d ? "rgba(109,40,217,0.15)" : "#080808", border: `1px solid ${duration === d ? "#6d28d9" : "#1f1f1f"}`, color: duration === d ? "#8b5cf6" : "#52525b", padding: "0.28rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.2s" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

          <button onClick={generateScript} disabled={generateLoading}
            style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: generateLoading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: generateLoading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.92rem", cursor: generateLoading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif" }}>
            {generateLoading ? "🎬 Writing your script..." : `🎬 Generate ${duration} ${style} Script for ${platform}`}
          </button>
        </div>
      )}

      {/* GENERATE RESULT */}
      {mode === "generate" && generateResult && (
        <div style={{ animation: "slideUp 0.5s ease" }}>

          {/* Title + Hook */}
          <div style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.12),rgba(109,40,217,0.06))", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "14px", padding: "1.1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎬 SCRIPT TITLE</p>
                <p style={{ margin: 0, color: "#fff", fontSize: "1rem", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{generateResult.title}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)", color: "#8b5cf6", borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.68rem", fontWeight: 700 }}>{platform}</span>
                <span style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)", color: "#8b5cf6", borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.68rem", fontWeight: 700 }}>{duration}</span>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.6rem 0.85rem", marginTop: "0.5rem" }}>
              <p style={{ margin: "0 0 0.2rem", fontSize: "0.62rem", color: "#8b5cf6", fontWeight: 700 }}>⚡ HOOK (First 3 seconds)</p>
              <p style={{ margin: 0, color: "#f1f5f9", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.5 }}>{generateResult.hook}</p>
            </div>
          </div>

          {/* Script Sections */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎙️ SCRIPT BREAKDOWN</p>
            {(generateResult.sections || []).map((sec: any, i: number) => {
              const sectionColors: Record<string, string> = { HOOK: "#8b5cf6", PROBLEM: "#ef4444", SOLUTION: "#22c55e", CTA: "#f59e0b", INTRO: "#8b5cf6", TIPS: "#06b6d4", STORY: "#f59e0b", BODY: "#22c55e" };
              const color = sectionColors[sec.label] || "#8b5cf6";
              return (
                <div key={i} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "0.75rem 0.85rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ color, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em" }}>{sec.label}</span>
                    <span style={{ color: "#3f3f46", fontSize: "0.62rem" }}>{sec.time}</span>
                  </div>
                  <p style={{ margin: "0 0 0.3rem", color: "#f1f5f9", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 500 }}>{sec.content}</p>
                  {sec.direction && <p style={{ margin: 0, color: "#52525b", fontSize: "0.68rem", lineHeight: 1.4 }}>📷 {sec.direction}</p>}
                </div>
              );
            })}
          </div>

          {/* Full Script */}
          <div style={{ background: "linear-gradient(135deg,#080f08,#0a0f0a)", border: "1px solid #22c55e25", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>📝 COMPLETE WORD-FOR-WORD SCRIPT</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => copyText(generateResult.script, "fullscript")}
                  style={{ background: copiedKey === "fullscript" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "fullscript" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "fullscript" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                  {copiedKey === "fullscript" ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button onClick={() => { setScript(generateResult.script); setMode("improve"); window.scrollTo(0, 0); }}
                  style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.4)", color: "#8b5cf6", padding: "0.2rem 0.75rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                  ✨ Send to Improve →
                </button>
              </div>
            </div>
            <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{generateResult.script}</p>
          </div>

          {/* Caption + Hashtags */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700 }}>💬 CAPTION</p>
                <button onClick={() => copyText(generateResult.caption, "caption")} style={{ background: "none", border: "none", color: copiedKey === "caption" ? "#22c55e" : "#555", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>{copiedKey === "caption" ? "✓" : "Copy"}</button>
              </div>
              <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.78rem", lineHeight: 1.6 }}>{generateResult.caption}</p>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#06b6d4", fontWeight: 700 }}>#️⃣ HASHTAGS</p>
                <button onClick={() => copyText((generateResult.hashtags || []).join(" "), "hashtags")} style={{ background: "none", border: "none", color: copiedKey === "hashtags" ? "#22c55e" : "#555", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>{copiedKey === "hashtags" ? "✓" : "Copy"}</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {(generateResult.hashtags || []).map((tag: string, i: number) => (
                  <span key={i} style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4", padding: "0.15rem 0.45rem", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail + Audio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {generateResult.thumbnail_idea && (
              <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
                <p style={{ margin: "0 0 0.35rem", fontSize: "0.65rem", color: "#a855f7", fontWeight: 700 }}>🖼️ THUMBNAIL IDEA</p>
                <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{generateResult.thumbnail_idea}</p>
              </div>
            )}
            {generateResult.audio_suggestion && (
              <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
                <p style={{ margin: "0 0 0.35rem", fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>🎵 AUDIO SUGGESTION</p>
                <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{generateResult.audio_suggestion}</p>
              </div>
            )}
          </div>

          {/* Pro Tips */}
          {generateResult.pro_tips && (
            <div style={{ background: "linear-gradient(135deg,#08080f,#0a0a14)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "14px", padding: "1rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>💡 PRO TIPS</p>
              {generateResult.pro_tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#8b5cf6", fontSize: "0.75rem", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMPROVE MODE */}
      {mode === "improve" && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>✨</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Improve Existing Script</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Paste your script → Before/After comparison + improved version</p>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>YOUR SCRIPT / CONTENT</label>
            <textarea value={script} onChange={e => { setScript(e.target.value); setError(""); }}
              placeholder={`Paste your ${platform} script here...\n\nExamples:\n• "5 tips for weight loss that actually work"\n• Your complete reel script\n• Instagram caption or ad copy`}
              rows={7}
              style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#f1f5f9", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7, transition: "border 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#6d28d9"}
              onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem" }}>Hook, caption, reel script or ad copy</span>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem" }}>{script.length} chars</span>
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

          <button onClick={analyzeScript} disabled={improveLoading}
            style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: improveLoading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: improveLoading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.92rem", cursor: improveLoading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif" }}>
            {improveLoading ? "✨ Analyzing & Improving..." : `✨ Analyze & Improve for ${platform}`}
          </button>
        </div>
      )}

      {/* IMPROVE RESULT */}
      {mode === "improve" && improveResult && (
        <div style={{ animation: "slideUp 0.5s ease" }}>
          {/* Score Jump */}
          <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(109,40,217,0.08))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1rem", color: "#fff" }}>🚀 Script Improved!</div>
              <div style={{ color: "#71717a", fontSize: "0.72rem", marginTop: "0.2rem" }}>Your script got significantly better</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.8rem", color: gradeColor(improveResult.before?.grade), lineHeight: 1 }}>{improveResult.before?.score}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>BEFORE</div>
              </div>
              <div style={{ color: "#22c55e", fontWeight: 900, fontSize: "1.5rem" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.8rem", color: gradeColor(improveResult.after?.grade), lineHeight: 1 }}>{improveResult.after?.score}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>AFTER</div>
              </div>
              <div style={{ background: "#22c55e12", border: "1px solid #22c55e25", borderRadius: "8px", padding: "0.4rem 0.75rem", textAlign: "center" }}>
                <div style={{ color: "#22c55e", fontWeight: 900, fontSize: "1rem", fontFamily: "'Syne',sans-serif" }}>{improveResult.score_jump}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>JUMP</div>
              </div>
            </div>
          </div>

          {/* Before / After Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #ef444325", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid #ef444420", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.8rem" }}>❌ BEFORE</span>
                <span style={{ color: gradeColor(improveResult.before?.grade), fontWeight: 900, fontSize: "1rem" }}>{improveResult.before?.grade} · {improveResult.before?.score}/100</span>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <p style={{ margin: "0 0 0.6rem", color: "#71717a", fontSize: "0.7rem", fontStyle: "italic", lineHeight: 1.5 }}>{improveResult.before?.summary}</p>
                {(improveResult.before?.lines || []).map((line: any, i: number) => (
                  <div key={i} style={{ borderLeft: `2px solid ${lineColor(line.type)}`, paddingLeft: "0.5rem", marginBottom: "0.4rem" }}>
                    <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{line.text}</p>
                    {line.issue && <p style={{ margin: "0.2rem 0 0", color: lineColor(line.type), fontSize: "0.62rem" }}>⚠️ {line.issue}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #22c55e25", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid #22c55e20", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "0.8rem" }}>✅ AFTER</span>
                <span style={{ color: gradeColor(improveResult.after?.grade), fontWeight: 900, fontSize: "1rem" }}>{improveResult.after?.grade} · {improveResult.after?.score}/100</span>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <p style={{ margin: "0 0 0.6rem", color: "#71717a", fontSize: "0.7rem", fontStyle: "italic", lineHeight: 1.5 }}>{improveResult.after?.summary}</p>
                {(improveResult.after?.lines || []).map((line: any, i: number) => (
                  <div key={i} style={{ borderLeft: "2px solid #22c55e", paddingLeft: "0.5rem", marginBottom: "0.4rem" }}>
                    <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{line.text}</p>
                    {line.reason && <p style={{ margin: "0.2rem 0 0", color: "#22c55e", fontSize: "0.62rem" }}>✓ {line.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Improved Script */}
          <div style={{ background: "linear-gradient(135deg,#080f08,#0a0f0a)", border: "1px solid #22c55e25", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>✨ FULL IMPROVED SCRIPT</p>
              <button onClick={() => copyText(improveResult.after?.script || "", "improved")}
                style={{ background: copiedKey === "improved" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "improved" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "improved" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                {copiedKey === "improved" ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{improveResult.after?.script}</p>
          </div>

          {/* Improvements + Tips */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700 }}>📈 IMPROVEMENTS</p>
              {(improveResult.improvements || []).map((imp: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#22c55e", fontSize: "0.72rem", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.72rem", lineHeight: 1.5 }}>{imp}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700 }}>💡 PLATFORM TIPS</p>
              {(improveResult.platform_tips || []).map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#8b5cf6", fontSize: "0.72rem", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.72rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function HookScoreAnalyzer({ plan, usageCount, limit, onUpgrade, langStrict }: any) {
  const [contentInput, setContentInput] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const SCORE_PLATFORMS = [
    { id: "Instagram", emoji: "📸" }, { id: "YouTube", emoji: "▶️" },
    { id: "LinkedIn", emoji: "💼" }, { id: "Twitter / X", emoji: "🐦" },
    { id: "Facebook", emoji: "📘" }, { id: "TikTok", emoji: "🎵" },
    { id: "Google Ads", emoji: "📢" }, { id: "Meta Ads", emoji: "📘" },
  ];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const analyze = async () => {
    if (!contentInput.trim()) { setError("Apna content ya hook paste karo."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are an expert viral content analyst and coach. Analyze this content for ${platform}:

CONTENT TO ANALYZE:
"""
${contentInput}
"""

PLATFORM: ${platform}

LANGUAGE RULE: Detect the language of the content and respond in the SAME language. Hindi content = Hindi response. English = English.

ANALYSIS RULES:
- Score out of 100 (not 10). Be strict — average content scores 40-60.
- Analyze the FULL content, not just first line
- Give LINE-BY-LINE feedback on weak parts
- Give 3 platform-specific improved versions
- Identify exactly what's strong and what's weak

Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "scores": {
    "curiosity": 0,
    "emotion": 0,
    "virality": 0,
    "clarity": 0,
    "overall": 0
  },
  "grade": "A/B/C/D/F",
  "verdict": "2-3 line honest verdict",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "line_fixes": [
    {"original": "exact weak line or phrase from content (never write 'none')", "problem": "specific reason why this line is weak", "fixed": "completely rewritten better version"}
  ],
  "platform_versions": {
    "version1": {"label": "Curiosity Version", "content": "complete rewritten content"},
    "version2": {"label": "Emotion Version", "content": "complete rewritten content"},
    "version3": {"label": "Power Version", "content": "complete rewritten content"}
  },
  "pro_tips": ["tip 1 specific to ${platform}", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setResult(parsed);
    } catch { setError("Analysis failed. Try again."); }
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";
  const gradeColor = (g: string) => g === "A" ? "#22c55e" : g === "B" ? "#06b6d4" : g === "C" ? "#f59e0b" : g === "D" ? "#f97316" : "#ef4444";
  const gradeLabel = (g: string) => g === "A" ? "🔥 Viral Ready!" : g === "B" ? "⚡ Almost There" : g === "C" ? "📈 Needs Work" : g === "D" ? "⚠️ Weak Content" : "💀 Rewrite Needed";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Input Card */}
      <div style={{ background: "linear-gradient(135deg,#0d0d0d,#111)", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.4rem" }}>📊</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>Content Score Analyzer</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Poora content paste karo → detailed analysis + fixes + 3 improved versions</p>
          </div>
        </div>

        {/* Platform selector */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#333", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {SCORE_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                style={{ background: platform === p.id ? "rgba(124,58,237,0.1)" : "#0a0a0a", border: `1px solid ${platform === p.id ? "#6d28d9" : "#1a1a1a"}`, color: platform === p.id ? "#6d28d9" : "#555", padding: "0.25rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, transition: "all 0.2s" }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Content textarea */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#333", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>
            APNA CONTENT PASTE KARO
            <span style={{ color: "#222", fontWeight: 400, marginLeft: "0.5rem" }}>
              (caption, hook, script, ad copy — kuch bhi)
            </span>
          </label>
          <textarea value={contentInput} onChange={e => { setContentInput(e.target.value); setError(""); }}
            placeholder={`Paste your ${platform} content here...\n\nFor example:\n"5 tips to lose weight fast without gym"\n\nYa poora caption/script bhi paste kar sakte ho!`}
            rows={6}
            style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#6d28d9"}
            onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
            <span style={{ color: "#222", fontSize: "0.65rem" }}>Hook, caption, script, ad copy — sab analyze hoga</span>
            <span style={{ color: "#52525b", fontSize: "0.68rem" }}>{contentInput.length} chars</span>
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}

        <button onClick={analyze} disabled={loading}
          style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#8b8cf8,#6366f1)", border: "none", color: loading ? "#333" : "#fff", fontWeight: 800, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif", transition: "all 0.3s" }}>
          {loading ? "🔍 Analyzing your content..." : `🔍 Analyze for ${platform}`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ animation: "slideUp 0.5s ease" }}>

          {/* Overall Score Banner */}
          <div style={{ background: `${gradeColor(result.grade)}15`, border: `2px solid ${gradeColor(result.grade)}40`, borderRadius: "16px", padding: "1.25rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#fff" }}>{gradeLabel(result.grade)}</div>
                <div style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.2rem" }}>{result.verdict}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "3rem", color: gradeColor(result.grade), lineHeight: 1 }}>{result.grade}</div>
                <div style={{ color: "#555", fontSize: "0.65rem", fontWeight: 700 }}>GRADE</div>
              </div>
            </div>
          </div>

          {/* Score Bars — /100 */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 1rem", fontSize: "0.7rem", color: "#444", fontWeight: 700, letterSpacing: "0.06em" }}>📊 DETAILED SCORES /100</p>
            {[
              ["Curiosity", result.scores?.curiosity, "#6d28d9"],
              ["Emotion", result.scores?.emotion, "#ec4899"],
              ["Virality", result.scores?.virality, "#f59e0b"],
              ["Clarity", result.scores?.clarity, "#06b6d4"],
              ["Overall", result.scores?.overall, "#22c55e"],
            ].map(([label, score, color]: any) => (
              <div key={label} style={{ marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ color: "#888", fontSize: "0.72rem", fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 800, fontSize: "0.78rem" }}>{score}/100</span>
                </div>
                <div style={{ background: "#141414", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "4px", background: color, width: `${score}%`, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#081a08", border: "1px solid #22c55e30", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>✅ STRONG POINTS</p>
              {(result.strengths || []).map((s: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#22c55e", fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#aaa", fontSize: "0.72rem", lineHeight: 1.4 }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#1a0808", border: "1px solid #ef444430", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#ef4444", fontWeight: 700 }}>❌ WEAK POINTS</p>
              {(result.weaknesses || []).map((w: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#ef4444", fontSize: "0.7rem", flexShrink: 0 }}>✗</span>
                  <span style={{ color: "#aaa", fontSize: "0.72rem", lineHeight: 1.4 }}>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line by Line Fixes */}
          {result.line_fixes && result.line_fixes.length > 0 && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>🔧 LINE-BY-LINE FIXES</p>
              {result.line_fixes.map((fix: any, i: number) => (
                <div key={i} style={{ background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem", marginBottom: "0.5rem" }}>
                  <div style={{ color: "#ef4444", fontSize: "0.75rem", fontStyle: "italic", marginBottom: "0.25rem" }}>
                    {fix.original && fix.original !== "none" && fix.original !== "None" ? `"${fix.original}"` : "📝 General Improvement"}
                  </div>
                  <div style={{ color: "#555", fontSize: "0.68rem", marginBottom: "0.4rem" }}>
                    ⚠️ {fix.problem && fix.problem !== "no specific lines to fix" ? fix.problem : "Content mein yeh improvements karo"}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                    <span style={{ color: "#22c55e", fontSize: "0.68rem", flexShrink: 0, marginTop: "0.1rem" }}>✅ Fixed:</span>
                    <span style={{ color: "#22c55e", fontSize: "0.78rem", lineHeight: 1.5 }}>{fix.fixed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3 Platform Versions */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", color: "#6d28d9", fontWeight: 700, letterSpacing: "0.06em" }}>✨ 3 IMPROVED VERSIONS FOR {platform.toUpperCase()}</p>
            {result.platform_versions && Object.entries(result.platform_versions).map(([key, ver]: any, i) => {
              const colors = ["#6d28d9", "#06b6d4", "#22c55e"];
              const color = colors[i] || "#6d28d9";
              return (
                <div key={key} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: "10px", padding: "0.85rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ color, fontSize: "0.7rem", fontWeight: 700 }}>✨ {ver.label}</span>
                    <button onClick={() => copyText(ver.content, key)}
                      style={{ background: copiedKey === key ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === key ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === key ? "#22c55e" : "#555", padding: "0.15rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700 }}>
                      {copiedKey === key ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ margin: 0, color: "#ddd", fontSize: "0.83rem", lineHeight: 1.6 }}>{ver.content}</p>
                </div>
              );
            })}
          </div>

          {/* Pro Tips */}
          {result.pro_tips && result.pro_tips.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#0d0a1a,#0a0814)", border: "1px solid #8b8cf830", borderRadius: "14px", padding: "1rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", color: "#8b8cf8", fontWeight: 700, letterSpacing: "0.06em" }}>💡 PRO TIPS FOR {platform.toUpperCase()}</p>
              {result.pro_tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#8b8cf8", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContentCalendar({ plan, usageCount, limit, onUpgrade, keyword, niche, langStrict }: any) {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [calKeyword, setCalKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [calPlatform, setCalPlatform] = useState("Instagram");

  const CAL_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" }, { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" }, { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" }, { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
  ];

  const generate = async () => {
    if (!calKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setCalendar([]);

    const prompt = `You are a ${calPlatform} content strategist. Create a 30-day content calendar.
Platform: ${calPlatform}
Keyword: "${calKeyword}"
Niche: ${niche}
OUTPUT LANGUAGE: ${langStrict} — Write ALL hooks and notes in this language/script only. No English mixing.

STRICT RULES:
- Every hook must be platform-specific for ${calPlatform}
- Use varied content types: ${CONTENT_TYPES.join(", ")}
- All hooks must be in the specified language

Respond ONLY in JSON (no markdown):
{"days":[{"day":1,"type":"Tips","hook":"hook here","platform_note":"tip here"},...]}
Generate exactly 30 days.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setCalendar(parsed.days || []);
    } catch { setError("Calendar generation failed. Try again."); }
    setLoading(false);
  };

  useEffect(() => { setCalKeyword(keyword || ""); }, [keyword]);

  const TYPE_COLORS: Record<string, string> = {
    Tips: "#8b8cf8", Story: "#f59e0b", Mistakes: "#ef4444", Tutorial: "#22c55e",
    Motivation: "#6d28d9", Trend: "#06b6d4", "Case Study": "#6d28d9",
    Poll: "#ec4899", Review: "#84cc16", Challenge: "#f97316",
    "Behind the Scenes": "#64748b", "Q&A": "#14b8a6"
  };

  const getWeek = (day: number) => Math.ceil(day / 7);
  const weeks = calendar.length ? Array.from(new Set(calendar.map(d => getWeek(d.day)))) : [];

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>30-Day Content Calendar</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>AI auto-plans your entire month of content</p>
          </div>
        </div>
        <input value={calKeyword} onChange={e => { setCalKeyword(e.target.value); setError(""); }}
          placeholder="Topic or keyword (e.g. weight loss)"
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border 0.2s", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#06b6d4"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {CAL_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setCalPlatform(p.id)} style={{ background: calPlatform === p.id ? `${p.color}18` : "#0a0a0a", border: `1px solid ${calPlatform === p.id ? p.color : "#1a1a1a"}`, color: calPlatform === p.id ? p.color : "#444", padding: "0.28rem 0.75rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif" }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", background: loading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: loading ? "#333" : "#fff", fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif" }}>
          {loading ? "⚡ Planning 30 days..." : "📅 Generate My Content Calendar"}
        </button>
      </div>
      {calendar.length > 0 && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#555", fontSize: "0.75rem" }}>30 days of content ready</span>
            <button onClick={() => navigator.clipboard.writeText(calendar.map(d => `Day ${d.day} (${d.type}): ${d.hook}`).join("\n"))} style={{ background: "#ffffff0a", border: "1px solid #2a2a2a", color: "#666", padding: "0.25rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Copy All</button>
          </div>
          {weeks.map(week => (
            <div key={week} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#333", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.4rem" }}>WEEK {week}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {calendar.filter(d => getWeek(d.day) === week).map((day) => {
                  const color = TYPE_COLORS[day.type] || "#6d28d9";
                  return (
                    <div key={day.day} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.65rem 0.85rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = color + "40")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                      onClick={() => { navigator.clipboard.writeText(day.hook); setCopiedDay(day.day); setTimeout(() => setCopiedDay(null), 1500); }}>
                      <div style={{ flexShrink: 0, textAlign: "center", minWidth: "36px" }}>
                        <div style={{ fontSize: "0.6rem", color: "#333", fontWeight: 700 }}>{DAYS[(day.day - 1) % 7]}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{day.day}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, background: color + "18", border: `1px solid ${color}30`, color, borderRadius: "4px", padding: "0.08rem 0.4rem" }}>{day.type}</span>
                          {copiedDay === day.day && <span style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 700 }}>✓ Copied!</span>}
                        </div>
                        <p style={{ margin: 0, color: "#bbb", fontSize: "0.8rem", lineHeight: 1.5 }}>{day.hook}</p>
                        {day.platform_note && <p style={{ margin: "0.2rem 0 0", color: "#333", fontSize: "0.68rem" }}>💡 {day.platform_note}</p>}
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

function ContentPack({ plan, usageCount, limit, onUpgrade, keyword, niche, platform, langStrict }: any) {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<any>(null);
  const [packKeyword, setPackKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [packType, setPackType] = useState<"ads" | "youtube" | "instagram">("instagram");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const PACK_TYPES = [
    { id: "instagram", label: "📸 Instagram & TikTok", desc: "Hooks, Reels, Captions, Hashtags" },
    { id: "youtube", label: "▶️ YouTube", desc: "Titles, Scripts, Descriptions, Tags" },
    { id: "ads", label: "📢 Google & Meta Ads", desc: "Headlines, Ad Copy, CTAs" },
  ];

  const generate = async () => {
    if (!packKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setPack(null);

    const packPrompts: Record<string, string> = {
      instagram: `You are an Instagram & TikTok viral content expert. Generate:
- hooks: 10 viral opening lines
- titles: 8 post/reel title ideas
- captions: 5 full captions with emojis and CTA
- scripts: 5 Reel/TikTok scripts
- hashtags: 15 relevant hashtags`,
      youtube: `You are a YouTube content strategist. Generate:
- hooks: 8 video hook lines
- titles: 10 SEO-optimized video titles
- captions: 5 video descriptions
- scripts: 5 full intro scripts
- hashtags: 10 YouTube tags`,
      ads: `You are a Google Ads & Meta Ads expert. Generate:
- hooks: 10 Google Ad headlines (MAX 30 chars each)
- titles: 8 Meta Ad headlines (MAX 40 chars each)
- captions: 5 ad descriptions (MAX 90 chars each)
- scripts: 5 Meta ad primary texts
- hashtags: []`,
    };

    const prompt = `${packPrompts[packType]}

KEYWORD: ${packKeyword}
NICHE: ${niche}
OUTPUT LANGUAGE: ${langStrict} — Write EVERYTHING in this language/script. No English mixing.

Respond ONLY in JSON:
{"hooks":[],"titles":[],"captions":[],"scripts":[],"hashtags":[]}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      setPack(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setError("Pack generation failed. Try again."); }
    setLoading(false);
  };

  useEffect(() => { setPackKeyword(keyword || ""); }, [keyword]);

  const sectionLabels: Record<string, any[]> = {
    instagram: [
      { key: "hooks", label: "Viral Hooks", emoji: "🎣", color: "#6d28d9" },
      { key: "titles", label: "Post Titles", emoji: "📝", color: "#8b8cf8" },
      { key: "captions", label: "Captions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Reel Scripts", emoji: "🎬", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags", emoji: "#️⃣", color: "#06b6d4" },
    ],
    youtube: [
      { key: "hooks", label: "Video Hooks", emoji: "🎬", color: "#6d28d9" },
      { key: "titles", label: "SEO Titles", emoji: "📝", color: "#8b8cf8" },
      { key: "captions", label: "Descriptions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Intro Scripts", emoji: "🎙️", color: "#f59e0b" },
      { key: "hashtags", label: "YouTube Tags", emoji: "#️⃣", color: "#06b6d4" },
    ],
    ads: [
      { key: "hooks", label: "Google Headlines", emoji: "📢", color: "#6d28d9" },
      { key: "titles", label: "Meta Headlines", emoji: "📘", color: "#8b8cf8" },
      { key: "captions", label: "Ad Descriptions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Meta Ad Copies", emoji: "🎯", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags", emoji: "#️⃣", color: "#06b6d4" },
    ],
  };

  const copySection = (key: string, items: string[]) => {
    navigator.clipboard.writeText(items.join("\n"));
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📦</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>One-Click Content Pack</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Choose your platform — get complete content pack</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {PACK_TYPES.map(pt => (
            <button key={pt.id} onClick={() => { setPackType(pt.id as any); setPack(null); }}
              style={{ background: packType === pt.id ? "rgba(124,58,237,0.1)" : "#0a0a0a", border: `1px solid ${packType === pt.id ? "#6d28d9" : "#1a1a1a"}`, borderRadius: "10px", padding: "0.65rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ color: packType === pt.id ? "#6d28d9" : "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{pt.label}</span>
              <span style={{ color: "#444", fontSize: "0.72rem" }}>{pt.desc}</span>
            </button>
          ))}
        </div>
        <input value={packKeyword} onChange={e => { setPackKeyword(e.target.value); setError(""); }}
          placeholder="Enter keyword (e.g. meal prep)"
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}
        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", background: loading ? "#111" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: loading ? "#333" : "#000", fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif" }}>
          {loading ? "⚡ Building your pack..." : "📦 Generate Full Content Pack"}
        </button>
      </div>
      {pack && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {sectionLabels[packType].map(({ key, label, emoji, color }) => {
            const items = pack[key] || [];
            const isOpen = openSection === key;
            return (
              <div key={key} style={{ background: "#0f0f0f", border: `1px solid ${isOpen ? color + "40" : "#1a1a1a"}`, borderRadius: "12px", marginBottom: "0.5rem", overflow: "hidden" }}>
                <div onClick={() => setOpenSection(isOpen ? null : key)} style={{ padding: "0.85rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{emoji}</span>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>{label}</span>
                    <span style={{ background: color + "18", border: `1px solid ${color}30`, color, borderRadius: "20px", padding: "0.1rem 0.5rem", fontSize: "0.65rem", fontWeight: 700 }}>{items.length}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button onClick={e => { e.stopPropagation(); copySection(key, items); }} style={{ background: copiedSection === key ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedSection === key ? "#22c55e" : "#2a2a2a"}`, color: copiedSection === key ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
                      {copiedSection === key ? "✓" : "Copy"}
                    </button>
                    <span style={{ color: "#333" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${color}20`, padding: "0 1rem 1rem" }}>
                    {items.map((item: string, i: number) => (
                      <div key={i} style={{ padding: "0.5rem 0", borderBottom: i < items.length - 1 ? "1px solid #111" : "none", display: "flex", gap: "0.75rem" }}>
                        <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
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

function PaymentModal({ plan, onClose, onPaid }: any) {
  const [currency, setCurrency] = useState("INR");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const planData = PLANS[plan as keyof typeof PLANS];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
      <div style={{ background: "#080808", border: "1px solid #6d28d9", borderRadius: "20px", padding: "1.75rem", maxWidth: "460px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem" }}>💳</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", margin: "0.5rem 0", color: "#6d28d9" }}>Complete Payment</h2>
          <div style={{ display: "inline-block", background: "#6d28d918", border: "1px solid #6d28d940", borderRadius: "20px", padding: "0.3rem 1rem" }}>
            <span style={{ fontWeight: 800 }}>{planData?.label} — <span style={{ color: "#6d28d9" }}>₹{planData?.priceINR} / ${planData?.priceUSD}</span></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", background: "#111111", borderRadius: "10px", padding: "0.3rem", marginBottom: "1.25rem" }}>
          {[["INR", "🇮🇳 UPI (India)"], ["USD", "🌍 PayPal (Worldwide)"]].map(([c, label]) => (
            <button key={c} onClick={() => setCurrency(c)} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none", background: currency === c ? "#6d28d9" : "transparent", color: currency === c ? "#000" : "#666", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>{label}</button>
          ))}
        </div>
        {currency === "INR" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <p style={{ color: "#555", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>📱 Scan with PhonePe / GPay / Paytm</p>
            <div style={{ background: "#111111", border: "2px solid #6d28d930", borderRadius: "14px", padding: "1rem", display: "inline-block", marginBottom: "0.75rem" }}>
              <img src={getUPIQR(YOUR_UPI_ID, planData?.priceINR)} alt="UPI QR" style={{ width: "160px", height: "160px", borderRadius: "8px", display: "block" }} />
            </div>
            <div style={{ background: "#080808", border: "1px solid #6d28d925", borderRadius: "10px", padding: "0.6rem 1rem", margin: "0 auto 0.75rem", maxWidth: "300px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <span style={{ color: "#6d28d9", fontWeight: 700, wordBreak: "break-all" }}>{YOUR_UPI_ID}</span>
              <button onClick={() => { navigator.clipboard.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: copied ? "#22c55e22" : "#6d28d918", border: `1px solid ${copied ? "#22c55e" : "#6d28d940"}`, color: copied ? "#22c55e" : "#6d28d9", padding: "0.25rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
        {currency === "USD" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ background: "#0a1628", border: "1px solid #003087", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "3rem" }}>🅿️</div>
              <a href={`${YOUR_PAYPAL_ME}/${planData?.priceUSD}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg,#003087,#009cde)", color: "#fff", padding: "0.8rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 800 }}>
                Pay ${planData?.priceUSD} via PayPal →
              </a>
            </div>
          </div>
        )}
        {!paid ? (
          <button onClick={() => { setPaid(true); setTimeout(() => onPaid(plan), 1800); }} style={{ width: "100%", padding: "0.9rem", borderRadius: "10px", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginBottom: "0.5rem" }}>
            ✅ I've Paid — Request Activation
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "0.9rem", background: "#22c55e18", border: "1px solid #22c55e", borderRadius: "10px", marginBottom: "0.5rem", color: "#22c55e", fontWeight: 800 }}>
            🎉 Activating your plan...
          </div>
        )}
        <p style={{ color: "#333", fontSize: "0.72rem", textAlign: "center", margin: "0 0 0.75rem" }}>Access granted after manual verification.</p>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
      </div>
    </div>
  );
}

function PaywallModal({ onClose, onSelectPlan }: any) {
  const [selected, setSelected] = useState("starter");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#080808", border: "1px solid #6d28d9", borderRadius: "20px", padding: "1.75rem", maxWidth: "480px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🚀</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", margin: "0.5rem 0", color: "#6d28d9" }}>Free Limit Reached!</h2>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>Upgrade to unlock Hook Scoring, 30-Day Calendars, Content Packs & more.</p>
        </div>
        <div style={{ display: "grid", gap: "0.65rem", marginBottom: "1.25rem" }}>
          {Object.entries(PLANS).filter(([k]) => k !== "free").map(([key, plan]: any) => (
            <div key={key} onClick={() => setSelected(key)} style={{ border: `${selected === key ? "2" : "1"}px solid ${selected === key ? "#6d28d9" : "#1e1e1e"}`, borderRadius: "12px", padding: "0.9rem 1rem", background: selected === key ? "rgba(168,85,247,0.07)" : "#0d0d0d", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{plan.label} {plan.badge}</div>
                <div style={{ color: "#444", fontSize: "0.76rem" }}>{plan.limit} credits/mo</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6d28d9" }}>₹{plan.priceINR}</div>
                <div style={{ color: "#333", fontSize: "0.72rem" }}>${plan.priceUSD} / mo</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onSelectPlan(selected)} style={{ width: "100%", padding: "0.9rem", borderRadius: "10px", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginBottom: "0.5rem" }}>
          Get {PLANS[selected as keyof typeof PLANS]?.label} — ₹{PLANS[selected as keyof typeof PLANS]?.priceINR} →
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Maybe later</button>
      </div>
    </div>
  );
}

function ResultCard({ title, items, emoji, color }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "#0f0f0f", border: `1px solid ${color}22`, borderRadius: "14px", padding: "1.1rem", marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color, fontSize: "0.88rem" }}>{emoji} {title}</h3>
        <button onClick={() => { navigator.clipboard.writeText(items.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: copied ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied ? "#22c55e" : "#2a2a2a"}`, color: copied ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
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

function TabBtn({ id, label, emoji, active, onClick, isPro }: any) {
  return (
    <button onClick={() => onClick(id)} style={{ flex: 1, padding: "0.6rem 0.25rem", borderRadius: "10px", border: "none", background: active ? "rgba(124,58,237,0.1)" : "transparent", color: active ? "#8b5cf6" : "#525252", fontWeight: active ? 700 : 500, fontSize: "0.72rem", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", position: "relative", borderBottom: active ? "2px solid #6d28d9" : "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
      <span style={{ fontSize: "1rem" }}>{emoji}</span>
      <span>{label}</span>
      {isPro && !active && (
        <span style={{ position: "absolute", top: 4, right: 4, fontSize: "0.5rem", background: "#6d28d920", border: "1px solid #6d28d940", color: "#6d28d9", borderRadius: "4px", padding: "0.05rem 0.25rem", fontWeight: 700 }}>PRO</span>
      )}
    </button>
  );
}

export default function ViralContentTool() {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [niche, setNiche] = useState("Fitness");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [plan, setPlan] = useState("free");
  const [showPaywall, setShowPaywall] = useState(false);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
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
    try { const saved = localStorage.getItem("viral_profile"); return saved ? JSON.parse(saved) : null; }
    catch { return null; }
  });
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setProfile(data ?? null);
        if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(data?.user_type || "creator"); }
        if (data?.referral_code) { localStorage.setItem("viral_profile", JSON.stringify(data)); }
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        if (session?.user?.email === ADMIN_EMAIL) { setPlan("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined) {
          setUsageCount((data.credits_total || 10) - data.credits_remaining);
        }
      }
      setProfileLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setUser(session.user);
        setProfile(data ?? null);
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        if (session.user.email === ADMIN_EMAIL) { setPlan("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined) {
          setUsageCount((data.credits_total || 10) - data.credits_remaining);
        }
        if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(data.user_type); }
        setProfileLoading(false);
      } else {
        setUser(null); setProfile(null); setPlan("free"); setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const limit = PLANS[plan as keyof typeof PLANS]?.limit || 10;
  const remaining = Math.max(0, limit - usageCount);
  const usedPct = Math.min(100, (usageCount / limit) * 100);
  const langLabel = getLangLabel(selectedLang);
  const langStrict = getLangStrict(selectedLang);

  const CREDIT_COSTS: Record<string, number> = { generate: 1, score: 1, image: 2, pack: 3, calendar: 5, scriptgenerate: 2, scriptimprove: 1 };

  const incrementUsage = (feature: string = "generate") => {
    const cost = CREDIT_COSTS[feature] || 1;
    setUsageCount(prev => prev + cost);
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }
    const { data: userData } = await supabase.from("users").select("generations_used_today, last_reset_date, plan, credits_remaining").eq("id", user.id).single();
    if (userData) {
      const today = new Date().toISOString().split("T")[0];
      if (userData.last_reset_date !== today) {
        await supabase.from("users").update({ generations_used_today: 0, last_reset_date: today }).eq("id", user.id);
        userData.generations_used_today = 0;
      }
      if (userData.credits_remaining <= 0) { setShowPaywall(true); return; }
    }
    if (usageCount >= limit) { setShowPaywall(true); return; }
    setLoading(true); setError(""); setResults(null);

    const nicheContext: Record<string, string> = {
      "Fitness": "fitness, gym, workout, weight loss", "Business": "entrepreneurship, startup, business growth",
      "Tech": "technology, AI tools, coding", "Lifestyle": "daily routines, personal growth",
      "Food": "recipes, cooking, food trends", "Daily Vlog": "day in my life, vlog",
      "Comedy & Entertainment": "funny content, comedy", "Sports": "cricket, football, sports",
      "Spirituality": "meditation, manifestation", "AI & Automation": "AI tools, automation",
      "Personal Finance": "investing, saving, passive income", "Mental Health": "wellness, mindfulness",
      "Beauty & Skincare": "skincare, makeup, beauty", "Ads & Marketing": "digital marketing, ads",
      "Education": "online learning, courses", "Travel": "travel tips, destinations",
      "Fashion & Style": "fashion, style, outfits", "Real Estate": "property, investment",
      "Motivational": "success mindset, motivation", "Health & Wellness": "healthy lifestyle, yoga",
      "Gaming": "video games, esports, gaming",
    };

    try {
      let realData = "";

      if (platform === "YouTube" || platform === "YouTube Ads") {
        try {
          const [trendRes, searchRes] = await Promise.allSettled([
            fetch(`https://viral-tool-1.onrender.com/api/trends/youtube?country=IN`),
            fetch(`https://viral-tool-1.onrender.com/api/trends/youtube-search?q=${encodeURIComponent(keyword)}&country=IN`)
          ]);
          let trendTitles: string[] = [], searchTitles: string[] = [];
          if (trendRes.status === "fulfilled" && trendRes.value.ok) {
            const d = await trendRes.value.json();
            trendTitles = (d.items || []).slice(0, 5).map((v: any) => v.snippet?.title || "");
          }
          if (searchRes.status === "fulfilled" && searchRes.value.ok) {
            const d = await searchRes.value.json();
            searchTitles = (d.items || []).slice(0, 5).map((v: any) => v.snippet?.title || "");
          }
          if (trendTitles.length > 0 || searchTitles.length > 0) {
            realData = `\nREAL YOUTUBE TRENDING:\n${trendTitles.map((t, i) => `${i+1}. ${t}`).join("\n")}\nTOP VIDEOS FOR "${keyword}":\n${searchTitles.map((t, i) => `${i+1}. ${t}`).join("\n")}`;
          }
        } catch (e) {}
      } else if (platform === "Google Ads" || platform === "Meta Ads" || platform === "Native Ads") {
        try {
          const serpRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/google?q=${encodeURIComponent(keyword)}&country=IN`);
          if (serpRes.ok) {
            const d = await serpRes.json();
            const relatedQueries = d.related_queries?.rising?.slice(0, 5).map((q: any) => q.query) || [];
            if (relatedQueries.length > 0) realData = `\nRISING SEARCHES: ${relatedQueries.join(", ")}`;
          }
        } catch (e) {}
      } else {
        try {
          const serpRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/google?q=${encodeURIComponent(keyword)}&country=IN`);
          if (serpRes.ok) {
            const d = await serpRes.json();
            const rising = d.related_queries?.rising?.slice(0, 5).map((q: any) => q.query) || [];
            if (rising.length > 0) realData = `\nTRENDING SEARCHES: ${rising.join(", ")}`;
          }
        } catch (e) {}
      }

      const platformGuide: Record<string, string> = {
        "Instagram": "5 Reel opening lines, 5 post titles, 3 captions with hashtags, 5 trending topics",
        "YouTube": "5 video hooks, 5 SEO titles, 3 descriptions, 5 trending formats",
        "TikTok": "5 first-3-second hooks, 5 caption ideas, 3 video scripts, 5 trending sounds",
        "Facebook": "5 post hooks, 5 shareable headlines, 3 posts, 5 content formats",
        "Reddit": "5 post titles, 5 subreddit ideas, 3 post bodies, 5 trending topics",
        "LinkedIn": "5 post openers, 5 article titles, 3 posts, 5 trending topics",
        "Twitter / X": "5 tweet hooks, 5 thread titles, 3 tweet threads, 5 trending topics",
        "Pinterest": "5 pin titles, 5 board names, 3 pin descriptions, 5 trending searches",
        "WhatsApp": "5 broadcast openers, 5 status ideas, 3 messages, 5 content ideas",
        "Snapchat": "5 story hooks, 5 story ideas, 3 snap texts, 5 trending formats",
        "Google Ads": "5 search headlines (25-30 chars), 5 display headlines, 3 descriptions (80-90 chars), 5 keyword ideas",
        "Meta Ads": "5 primary text openers, 5 ad headlines (30-40 chars), 3 ad copies, 5 ad angles",
        "YouTube Ads": "5 first-5-second hooks, 5 banner headlines, 3 ad scripts, 5 targeting angles",
        "Native Ads": "5 editorial headlines, 5 article titles, 3 advertorial descriptions, 5 story angles",
      };

      const prompt = `You are a ${platform} content expert for ${niche} niche.
Keyword: "${keyword}"
${realData}

Generate: ${platformGuide[platform] || platformGuide["Instagram"]}

OUTPUT LANGUAGE: ${langStrict}
IMPORTANT: Write EVERYTHING in the specified language/script. No English mixing if non-English selected.

Respond ONLY in JSON:
{"trendingTopics":["t1","t2","t3","t4","t5"],"viralHooks":["h1","h2","h3","h4","h5"],"titles":["t1","t2","t3","t4","t5"],"captions":["c1","c2","c3"]}`;

      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Parse failed");
      }
      setResults(parsed);
      incrementUsage();
      await supabase.from("generated_content").insert({ user_id: user.id, niche, platform, language: langLabel, keyword, hooks: parsed.viralHooks || [], titles: parsed.titles || [], captions: parsed.captions || [], trending_topics: parsed.trendingTopics || [] });
      await supabase.from("users").update({ generations_used_today: (userData?.generations_used_today || 0) + 1, credits_remaining: (userData?.credits_remaining || 0) - 1 }).eq("id", user.id);
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    await supabase.from("reviews").insert({ user_id: user.id, name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : user.email?.split("@")[0], role: reviewRole || "Content Creator", review: reviewText, stars: reviewStars, approved: false });
    setReviewSubmitted(true); setReviewLoading(false);
    setTimeout(() => { setShowReview(false); setReviewSubmitted(false); setReviewText(""); setReviewRole(""); setReviewStars(5); }, 2000);
  };

  const handleSelectPlan = (p: string) => { setShowPaywall(false); setPayingPlan(p); };
  const handlePaid = (p: string) => { setPayingPlan(null); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000); };

  const tabs = [
    { id: "generate", label: "Generate", emoji: "⚡" },
    { id: "score", label: "Hook Score", emoji: "📊" },
    { id: "calendar", label: "Calendar", emoji: "📅" },
    { id: "pack", label: "Pack", emoji: "📦" },
    { id: "trends", label: "Trends", emoji: "📈" },
    { id: "image", label: "Image AI", emoji: "🖼️" },
    { id: "scriptlab", label: "Script Lab", emoji: "🎬" },
  ];

  if (authLoading || profileLoading) return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6d28d9", fontFamily: "sans-serif", animation: "pulse 1s infinite" }}>⚡ Loading...</p>
    </div>
  );

  if (showContact) return <Contact onBack={() => setShowContact(false)} />;
  if (legalPage) return <Legal page={legalPage} onBack={() => setLegalPage(null)} />;
  if (showOnboarding && user) return <Onboarding userId={user.id} onComplete={(type: string) => { setUserType(type); setShowOnboarding(false); }} />;
  if (showAdmin) return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  if (showPlans) return <Plans onBack={() => setShowPlans(false)} onUpgrade={(selectedPlan: string) => { setShowPlans(false); setPayingPlan(selectedPlan); }} currentPlan={plan} />;
  if (!user) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))} />;

  const freeLangs = ["en"];
  const starterLangs = ["en", "hi"];

  return (
    <>
      <Helmet>
        <title>VCI — Viral Content Intelligence</title>
        <meta name="description" content="AI-powered tool to discover and predict viral content for creators and brands." />
      </Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000000; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.15)} 50%{box-shadow:0 0 24px rgba(124,58,237,0.25)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes floatDown { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(8px)} }
        @keyframes countUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .sidebar-card { transition: all 0.3s; }
        .sidebar-card:hover { border-color: rgba(109,40,217,0.3) !important; transform: translateY(-2px); }
        @media (max-width: 1200px) { .left-sidebar, .right-sidebar { display: none !important; } }
        .gbtn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 4px 20px rgba(124,58,237,0.2) !important; }
        .tbtn:hover { border-color:#6d28d9!important; color:#6d28d9!important; }
        @media (max-width: 768px) {
  .desktop-btn { display: none !important; }
  .mobile-header { padding: 0.75rem 1rem 0.5rem !important; }
}
        input,textarea { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>

        {/* LEFT SIDEBAR */}
        <div className="left-sidebar" style={{ position: "fixed", left: "1.5rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "0.65rem", zIndex: 10, width: "160px" }}>
          {[
            { icon: "📸", label: "47.2K views", sub: "Instagram Reel", color: "#e1306c", anim: "floatUp 3.5s ease-in-out infinite" },
            { icon: "📊", label: "Grade A — 91/100", sub: "Hook Score", color: "#22c55e", anim: "floatDown 4s ease-in-out infinite" },
            { icon: "🎬", label: "Script Ready", sub: "30 sec reel", color: "#6d28d9", anim: "floatUp 4.5s ease-in-out infinite" },
            { icon: "📈", label: "Trending ↑", sub: "Google Trends", color: "#0891b2", anim: "floatDown 3.8s ease-in-out infinite" },
            { icon: "🌐", label: "30+ Languages", sub: "Hindi · Tamil · Telugu", color: "#f59e0b", anim: "floatUp 5s ease-in-out infinite" },
          ].map((item, i) => (
            <div key={i} className="sidebar-card" style={{ background: "#080808", border: `1px solid ${item.color}18`, borderRadius: "10px", padding: "0.6rem 0.75rem", animation: item.anim, opacity: 0.75 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: "0.7rem", lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <div style={{ color: "#3f3f46", fontSize: "0.58rem", paddingLeft: "1.1rem" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar" style={{ position: "fixed", right: "1.5rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "0.65rem", zIndex: 10, width: "160px" }}>
          {[
            { icon: "⚡", label: "10 sec", sub: "Generation time", color: "#6d28d9", anim: "floatDown 3.5s ease-in-out infinite" },
            { icon: "▶️", label: "89.4K views", sub: "YouTube Short", color: "#ef4444", anim: "floatUp 4s ease-in-out infinite" },
            { icon: "📅", label: "30-Day Plan", sub: "Content Calendar", color: "#059669", anim: "floatDown 4.5s ease-in-out infinite" },
            { icon: "💎", label: "₹299/month", sub: "Starter Plan", color: "#22c55e", anim: "floatUp 3.8s ease-in-out infinite" },
            { icon: "🎯", label: "Platform-Specific", sub: "15+ Platforms", color: "#be185d", anim: "floatDown 5s ease-in-out infinite" },
          ].map((item, i) => (
            <div key={i} className="sidebar-card" style={{ background: "#080808", border: `1px solid ${item.color}18`, borderRadius: "10px", padding: "0.6rem 0.75rem", animation: item.anim, opacity: 0.75 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: "0.7rem", lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <div style={{ color: "#3f3f46", fontSize: "0.58rem", paddingLeft: "1.1rem" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ background: "#080808", borderBottom: "1px solid #1e1e1e", padding: "1.25rem 1.5rem 1rem", textAlign: "center", position: "relative" }}>

          

          {/* Admin Button */}
          {user?.email === "ravenderr01@gmail.com" && (
            <button onClick={() => setShowAdmin(true)} style={{ position: "absolute", top: "1rem", right: "34rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>🔧 Admin</button>
          )}

          {/* Top Buttons */}
          <button onClick={() => supabase.auth.signOut()} className="desktop-btn" style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#6d28d9", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>Logout →</button>
          <button onClick={() => setShowPlans(true)} className="desktop-btn" style={{ position: "absolute", top: "1rem", right: "20rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#6d28d9", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>💎 Plans</button>
          <button onClick={() => setShowContact(true)} className="desktop-btn" style={{ position: "absolute", top: "1rem", right: "7rem", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>Support</button>
          <button onClick={() => setShowReview(true)} className="desktop-btn" style={{ position: "absolute", top: "1rem", right: "13rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#f59e0b", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>⭐ Review</button>

          {/* Mobile Top Bar */}
          <div style={{ display: "none" }} className="mobile-top-bar">
            <button onClick={() => setShowPlans(true)} style={{ background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",color:"#6d28d9",padding:"0.3rem 0.6rem",borderRadius:"8px",fontSize:"0.7rem",fontWeight:700,cursor:"pointer" }}>💎 Plans</button>
            <button onClick={() => supabase.auth.signOut()} style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"0.3rem 0.6rem",borderRadius:"8px",fontSize:"0.7rem",fontWeight:700,cursor:"pointer" }}>Logout</button>
          </div>

          {/* Profile */}
          <div style={{ position: "absolute", top: "0.75rem", left: "1rem" }} onClick={() => setShowProfile(!showProfile)}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 800, fontSize: "1rem", color: "#fff", boxShadow: "0 4px 15px rgba(109,40,217,0.25)" }}>
              {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            {showProfile && (
              <div style={{ position: "absolute", top: "48px", left: 0, background: "#0f0f0f", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "16px", padding: "1.25rem", minWidth: "240px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100, animation: "slideUp 0.2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.3rem", color: "#fff", flexShrink: 0 }}>
                    {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "User"}</div>
                    <div style={{ color: "#555", fontSize: "0.75rem" }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888", fontSize: "0.75rem" }}>Current Plan</span>
                  <span style={{ color: "#6d28d9", fontWeight: 700, fontSize: "0.82rem" }}>{plan} ✨</span>
                </div>
                {profile?.phone && <div style={{ color: "#555", fontSize: "0.75rem", marginBottom: "0.75rem" }}>📞 {profile.phone}</div>}
                <div style={{ color: "#333", fontSize: "0.72rem", marginBottom: "1rem" }}>📅 Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
                {profile?.plan === "free" && (
                  <button onClick={() => { setShowPaywall(true); setShowProfile(false); }} style={{ width: "100%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.5rem" }}>🚀 Upgrade Plan</button>
                )}
                <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>Logout</button>
              </div>
            )}
          </div>
{/* Mobile Top Bar */}
<div style={{ display: "none" }} className="mobile-top-bar">
  <style>{`@media(max-width:768px){.mobile-top-bar{display:flex!important;justify-content:space-between;align-items:center;padding:0.5rem 1rem;position:absolute;top:0;left:0;right:0;z-index:10}}`}</style>
  <button onClick={() => setShowPlans(true)} style={{ background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",color:"#6d28d9",padding:"0.3rem 0.6rem",borderRadius:"8px",fontSize:"0.7rem",fontWeight:700,cursor:"pointer" }}>💎 Plans</button>
  <button onClick={() => supabase.auth.signOut()} style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"0.3rem 0.6rem",borderRadius:"8px",fontSize:"0.7rem",fontWeight:700,cursor:"pointer" }}>Logout</button>
</div>
          {/* Title */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "0.2rem 0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.08em" }}>⚡ VCI — Viral Content Intelligence</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.4rem,5vw,2.2rem)", fontWeight: 800, margin: "0 0 0.3rem", color: "#ffffff" }}>
            Viral Content Intelligence
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>Hook Score · 30-Day Calendar · Content Pack · Instant Generation</p>

          {/* Scrolling Ticker */}
          <div style={{ overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "0.25rem 0", marginBottom: "0.75rem", maxWidth: "500px", margin: "0 auto 0.75rem" }}>
            <style>{`.ticker{display:flex;animation:tickerScroll 20s linear infinite;white-space:nowrap} @keyframes tickerScroll{0%{transform:translateX(0)} 100%{transform:translateX(-50%)}}`}</style>
            <div className="ticker">
              {[...Array(2)].map((_, ri) => (
                <span key={ri}>
                  {["⚡ 500+ Creators", "🎣 Viral Hooks", "📅 30-Day Cal", "🌐 30+ Languages", "📦 Content Pack", "🖼️ Image AI", "🔥 20% OFF — First 100 Users"].map((item, i) => (
                    <span key={i} style={{ color: i === 6 ? "#8b5cf6" : "#3f3f46", fontSize: "0.68rem", fontWeight: i === 6 ? 800 : 600, padding: "0 1rem" }}>
                      {item} <span style={{ color: "#222" }}>·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* Global Language Selector */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}>🌐</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#6d28d9", padding: "0.3rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {LANGUAGE_GROUPS.find(g => g.languages.some(l => l.code === selectedLang))?.country} — {getLangLabel(selectedLang)} ▾
              </button>
              {showLangDropdown && (
                <div style={{ position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "0.75rem", zIndex: 200, width: "300px", boxShadow: "0 8px 40px rgba(0,0,0,0.7)", maxHeight: "400px", overflowY: "auto" }}>
                  <p style={{ color: "#333", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.5rem", letterSpacing: "0.06em" }}>SELECT LANGUAGE</p>
                  {LANGUAGE_GROUPS.map(group => (
                    <div key={group.code} style={{ marginBottom: "0.5rem" }}>
                      <p style={{ color: "#555", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{group.country}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {group.languages.map(lang => {
                          const isLocked = (plan === "free" && !freeLangs.includes(lang.code)) ||
                            (plan === "starter" && !starterLangs.includes(lang.code) && !["pro_creator","growth","business","agency"].includes(plan));
                          return (
                            <button key={lang.code}
                              onClick={() => {
                                if (isLocked) { setShowPaywall(true); return; }
                                setSelectedLang(lang.code);
                                setShowLangDropdown(false);
                              }}
                              style={{ background: selectedLang === lang.code ? "rgba(124,58,237,0.12)" : "#111", border: `1px solid ${selectedLang === lang.code ? "#6d28d9" : "#1e1e1e"}`, color: selectedLang === lang.code ? "#6d28d9" : isLocked ? "#2a2a2a" : "#888", padding: "0.2rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>
                              {isLocked ? "🔒 " : ""}{lang.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Credits bar */}
          <div style={{ maxWidth: "260px", margin: "0 auto 1rem", background: "#0f0f0f", border: "1px solid #161616", borderRadius: "10px", padding: "0.6rem 0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "#444" }}>Plan: <strong style={{ color: "#8b5cf6" }}>{PLANS[plan as keyof typeof PLANS]?.label}</strong></span>
              <span style={{ color: remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                {remaining === 0 ? "⛔ Limit reached" : `${remaining} / ${limit} credits`}
              </span>
            </div>
            <div style={{ background: "#141414", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", background: remaining === 0 ? "#ef4444" : "linear-gradient(90deg,#6d28d9,#9d71f5)", width: `${usedPct}%`, transition: "width 0.5s" }} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", gap: "0.15rem", background: "#080808", borderRadius: "12px 12px 0 0", padding: "0.5rem 0.5rem 0", borderTop: "1px solid #111", borderLeft: "1px solid #111", borderRight: "1px solid #111" }}>
            {tabs.map(t => (
              <TabBtn key={t.id} id={t.id} label={t.label} emoji={t.emoji} active={activeTab === t.id} onClick={setActiveTab}
                isPro={["score","calendar","pack","trends","image"].includes(t.id) && !["pro_creator","business","agency"].includes(plan)} />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>

          {/* TAB: GENERATE */}
          {activeTab === "generate" && (
            <div>
              {/* Niche */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>NICHE</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {Object.keys(NICHE_EXAMPLES).map(n => {
                    const freeNiches = ["Fitness", "Business", "Daily Vlog"];
                    const starterNiches = Object.keys(NICHE_EXAMPLES).filter(x => x !== "Ads & Marketing" && x !== "Real Estate" && x !== "Comedy & Entertainment");
                    const isLocked = (plan === "free" && !freeNiches.includes(n)) || (plan === "starter" && !starterNiches.includes(n));
                    return (
                      <button key={n} className="tbtn" onClick={() => isLocked ? setShowPaywall(true) : setNiche(n)}
                        style={{ background: niche === n ? "#6d28d912" : "#0d0d0d", border: `1px solid ${niche === n ? "#6d28d9" : "#1a1a1a"}`, color: niche === n ? "#8b5cf6" : isLocked ? "#2a2a2a" : "#52525b", padding: "0.4rem 1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, transition: "all 0.2s" }}>
                        {isLocked ? "🔒 " : ""}{n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
                {[
                  { group: "📱 SOCIAL MEDIA", platforms: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"] },
                  { group: "📢 ADVERTISING", platforms: ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"] }
                ].map(({ group, platforms }) => (
                  <div key={group} style={{ marginBottom: "0.75rem" }}>
                    <p style={{ color: "#444", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.35rem" }}>{group}</p>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {platforms.map(p => {
                        const freePlatforms = ["Instagram", "YouTube"];
                        const starterPlatforms = ["Instagram", "YouTube", "LinkedIn", "Twitter / X", "Facebook"];
                        const isLocked = (plan === "free" && !freePlatforms.includes(p)) || (plan === "starter" && !starterPlatforms.includes(p));
                        return (
                          <button key={p} className="tbtn" onClick={() => isLocked ? setShowPaywall(true) : setPlatform(p)}
                            style={{ background: platform === p ? "#6d28d912" : "#0d0d0d", border: `1px solid ${platform === p ? "#6d28d9" : "#1a1a1a"}`, color: platform === p ? "#8b5cf6" : isLocked ? "#2a2a2a" : "#52525b", padding: "0.4rem 1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, transition: "all 0.2s" }}>
                            {isLocked ? "🔒 " : ""}{p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Keyword */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>KEYWORD</label>
                <input value={keyword} onChange={e => { setKeyword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  placeholder={`e.g. ${NICHE_EXAMPLES[niche]?.[0] || "weight loss"}`}
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.8rem 1rem", color: "#fff", fontSize: "0.92rem", outline: "none", transition: "border 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  {(NICHE_EXAMPLES[niche] || []).slice(0, 3).map(ex => (
                    <button key={ex} onClick={() => setKeyword(ex)} style={{ background: "none", border: "1px solid #141414", color: "#2a2a2a", padding: "0.18rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}
                      onMouseEnter={e => { (e.target as any).style.color = "#555"; (e.target as any).style.borderColor = "#222"; }}
                      onMouseLeave={e => { (e.target as any).style.color = "#2a2a2a"; (e.target as any).style.borderColor = "#141414"; }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0 0 0.7rem" }}>{error}</p>}

              <button className="gbtn" onClick={handleGenerate} disabled={loading} style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: loading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: loading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif", transition: "all 0.3s", animation: "none", marginBottom: "1.5rem" }}>
                {loading ? <span style={{ animation: "pulse 1s infinite" }}>⚡ Generating in {langLabel}...</span> : "⚡ Generate Viral Content"}
              </button>

              {results && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#6d28d908", border: "1px solid #6d28d920", borderRadius: "8px", fontSize: "0.75rem", color: "#6d28d9" }}>
                    🌐 Generated in <strong>{langLabel}</strong>
                    <span style={{ marginLeft: "auto", color: "#333", fontSize: "0.7rem" }}>💡 Try Hook Score tab</span>
                  </div>
                  {["Google Ads", "Meta Ads", "Native Ads"].includes(platform) ? (
                    <><ResultCard title="Headlines" items={results.viralHooks} emoji="📢" color="#8b8cf8" /><ResultCard title="Ad Titles" items={results.titles} emoji="📝" color="#6d28d9" /><ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#22c55e" /></>
                  ) : platform === "YouTube" ? (
                    <><ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" /><ResultCard title="Video Hooks" items={results.viralHooks} emoji="🎬" color="#6d28d9" /><ResultCard title="SEO Titles" items={results.titles} emoji="📝" color="#22c55e" /><ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#f59e0b" /></>
                  ) : platform === "Reddit" ? (
                    <><ResultCard title="Reddit Post Titles" items={results.viralHooks} emoji="🔴" color="#ff4500" /><ResultCard title="Subreddit Ideas" items={results.titles} emoji="📌" color="#ff6534" /><ResultCard title="Post Bodies" items={results.captions} emoji="💬" color="#6d28d9" /></>
                  ) : (
                    <><ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" /><ResultCard title="Viral Hooks" items={results.viralHooks} emoji="🎣" color="#6d28d9" /><ResultCard title="Title Ideas" items={results.titles} emoji="📝" color="#22c55e" /><ResultCard title="Captions" items={results.captions} emoji="💬" color="#f59e0b" /></>
                  )}
                  <div style={{ background: "#080808", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginTop: "0.5rem" }}>
                    <p style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", color: "#444", fontWeight: 600 }}>WANT MORE FROM THIS KEYWORD?</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {[["📊 Score my hooks", "score"], ["📅 Plan 30 days", "calendar"], ["📦 Full content pack", "pack"]].map(([label, tab]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "#111111", border: "1px solid #1f1f1f", color: "#555", padding: "0.35rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                          onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6d28d9"); (e.currentTarget.style.color = "#6d28d9"); }}
                          onMouseLeave={e => { (e.currentTarget.style.borderColor = "#1e1e1e"); (e.currentTarget.style.color = "#555"); }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {plan === "free" && (
                <div style={{ background: "#6d28d908", border: "1px solid #6d28d918", borderRadius: "14px", padding: "1.1rem", marginTop: "1rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, marginBottom: "0.4rem", fontSize: "0.95rem" }}>🔥 Unlock Hook Score, Calendar & Content Packs</div>
                  <div style={{ color: "#444", fontSize: "0.77rem", marginBottom: "0.85rem" }}>Starter ₹299 · Pro Creator ₹999 · Business ₹1,999 · Agency ₹4,999</div>
                  <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", fontWeight: 800, padding: "0.55rem 1.5rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.82rem" }}>🚀 Upgrade Now</button>
                </div>
              )}
            </div>
          )}

          {/* TAB: HOOK SCORE */}
          {activeTab === "score" && (
            plan === "free" ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Starter Plan Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Hook Score Analyzer unlocks from Starter plan onwards.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <HookScoreAnalyzer plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} />
            )
          )}

          {/* TAB: CALENDAR */}
          {activeTab === "calendar" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Creator / Business Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>30-Day Content Calendar uses 5 credits per generation.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <ContentCalendar plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} langStrict={langStrict} creditCost={5} />
            )
          )}

          {/* TAB: IMAGE AI */}
          {activeTab === "image" && (
            <ImageContent plan={plan} onUpgrade={() => setShowPaywall(true)} credits={remaining} onCreditUsed={() => incrementUsage("image")} langLabel={langStrict} />
          )}

          {/* TAB: TRENDS */}
          {activeTab === "trends" && (
            (plan === "free" || plan === "starter") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Growth Plan Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>AI Trend Intelligence is available from Growth plan onwards.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <Trends niche={niche} keyword={keyword} langLabel={langLabel} />
            )
          )}

          {/* TAB: SCRIPT LAB */}
          {activeTab === "scriptlab" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Creator Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Script Lab unlocks from Pro Creator plan onwards.</p>
                <p style={{ color: "#444", fontSize: "0.78rem", marginBottom: "1.5rem" }}>Generate viral reel scripts up to 90 seconds + Before/After improvement</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <ScriptLab plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} />
            )
          )}

          {/* TAB: PACK */}
          {activeTab === "pack" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Creator / Business Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Content Pack uses 3 credits per generation.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <ContentPack plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} platform={platform} langStrict={langStrict} creditCost={3} />
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "1.5rem 1rem", borderTop: "1px solid rgba(139,92,246,0.1)", marginTop: "2rem" }}>
        <p style={{ color: "#2a2a2a", fontSize: "0.72rem", margin: 0 }}>
          Designed & Developed by <span style={{ color: "#6d28d9", fontWeight: 700 }}>Global Web Info Vision</span> © {new Date().getFullYear()} All Rights Reserved.
          {" "}<span style={{ margin: "0 0.5rem", color: "#1a1a1a" }}>|</span>
          <button onClick={() => setLegalPage("privacy")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Privacy Policy</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("terms")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Terms & Conditions</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("refund")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Refund Policy</button>
        </p>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#080808", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "20px", padding: "2rem", maxWidth: "440px", width: "100%", animation: "slideUp 0.3s ease" }}>
            {!reviewSubmitted ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                  <h3 style={{ color: "#fff", margin: "0 0 0.3rem" }}>Share Your Experience</h3>
                  <p style={{ color: "#555", fontSize: "0.82rem", margin: 0 }}>Your review helps other creators discover VCI!</p>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewStars(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.8rem", color: s <= reviewStars ? "#f59e0b" : "#2a2a2a" }}>★</button>
                  ))}
                </div>
                <input value={reviewRole} onChange={e => setReviewRole(e.target.value)} placeholder="Your role (e.g. Instagram Creator)"
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", outline: "none", marginBottom: "0.75rem" }} />
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience with VCI..." rows={4}
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", outline: "none", resize: "none", marginBottom: "1rem" }} />
                <button onClick={handleReviewSubmit} disabled={reviewLoading || !reviewText.trim()} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: !reviewText.trim() ? "rgba(251,191,36,0.2)" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: !reviewText.trim() ? "#555" : "#000", fontWeight: 800, cursor: !reviewText.trim() ? "not-allowed" : "pointer", marginBottom: "0.5rem" }}>
                  {reviewLoading ? "⚡ Submitting..." : "⭐ Submit Review"}
                </button>
                <button onClick={() => setShowReview(false)} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                <h3 style={{ color: "#fff" }}>Thank You!</h3>
                <p style={{ color: "#555", fontSize: "0.85rem" }}>Your review will be published after approval.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSelectPlan={handleSelectPlan} />}
      {payingPlan && <PaymentModal plan={payingPlan} onClose={() => setPayingPlan(null)} onPaid={handlePaid} />}

      <VCIAssistant niche={niche} platform={platform} keyword={keyword} plan={plan} />

      <a href="https://wa.me/919315133390?text=Hi!%20I%20want%20to%20know%20more%20about%20Viral%20Content%20Tool" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999, background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", borderRadius: "50px", padding: "0.75rem 1.25rem", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        💬 WhatsApp
      </a>

      {showSuccess && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 800, zIndex: 9999, animation: "slideUp 0.3s ease", whiteSpace: "nowrap" }}>
          ✅ Payment received! We'll activate your plan within 2 hours.
        </div>
      )}
    </>
  );
}