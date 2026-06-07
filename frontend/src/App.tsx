import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Contact from "./Contact";
import Trends from "./Trends";
import Legal from "./legal";
import Plans from "./Plans";

// ============================================
// 🔧 YOUR DETAILS — change these 2 lines only
const YOUR_UPI_ID    = "9315133390@ptyes";
const YOUR_PAYPAL_ME = "https://paypal.me/yourname";
const SUPPORT_PHONE = "+91 9315133390";
// ============================================

const PLANS = {
  free:    { label: "Free",    limit: 3,    priceINR: 0,    priceUSD: 0  },
  starter: { label: "Starter", limit: 50,   priceINR: 499,  priceUSD: 6,  badge: "🔥 Popular" },
  pro:     { label: "Pro",     limit: 150,  priceINR: 1499, priceUSD: 18, badge: "⚡ Best Value" },
  agency:  { label: "Agency",  limit: 1000, priceINR: 4999, priceUSD: 59, badge: "👑 Premium" },
};

const NICHE_EXAMPLES = {
  Fitness:      ["weight loss", "gym motivation", "protein diet", "HIIT workout"],
  Business:     ["passive income", "side hustle", "startup tips", "freelancing"],
  Tech:         ["AI tools", "ChatGPT hacks", "coding tips", "app development"],
  Lifestyle:    ["morning routine", "productivity hacks", "minimalism", "self care"],
  Food:         ["meal prep", "healthy recipes", "street food", "viral recipes"],
  "AI & Automation": ["AI tools", "automation hacks", "ChatGPT tips", "AI side hustle"],
  "Personal Finance": ["invest money", "save money fast", "passive income", "budget tips"],
  "Sustainable Living": ["eco friendly", "zero waste", "sustainable fashion", "green living"],
  "Mental Health": ["anxiety tips", "self care routine", "mindfulness", "stress relief"],
  Storytelling:  ["viral stories", "content writing", "narrative hooks", "storytelling tips"],
  Gaming:        ["gaming tips", "game review", "gaming setup", "esports", "mobile gaming"],
  "Beauty & Skincare": ["skincare routine", "glow up tips", "makeup hacks", "anti aging"],
  "Ads & Marketing": ["facebook ads", "google ads", "ad copywriting", "marketing strategy"],
  "Education": ["online course", "study tips", "e-learning", "skill development"],
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const LANGUAGES = [
  { code: "en", label: "🇬🇧 English" },
  { code: "hi", label: "🇮🇳 Hindi" },
  { code: "es", label: "🇪🇸 Spanish" },
  { code: "fr", label: "🇫🇷 French" },
  { code: "de", label: "🇩🇪 German" },
  { code: "ar", label: "🇸🇦 Arabic" },
  { code: "pt", label: "🇧🇷 Portuguese" },
  { code: "id", label: "🇮🇩 Indonesian" },
  { code: "tr", label: "🇹🇷 Turkish" },
  { code: "bn", label: "🇧🇩 Bengali" },
  { code: "ur", label: "🇵🇰 Urdu" },
  { code: "zh", label: "🇨🇳 Chinese" },
  { code: "ja", label: "🇯🇵 Japanese" },
  { code: "ko", label: "🇰🇷 Korean" },
  { code: "ru", label: "🇷🇺 Russian" },
];
const CONTENT_TYPES = ["Tips","Story","Mistakes","Behind the Scenes","Q&A","Tutorial","Motivation","Trend","Case Study","Poll","Review","Challenge"];

function getBrowserLang() {
  const raw = navigator.language || navigator.languages?.[0] || "en";
  return raw.split("-")[0].toLowerCase();
}

const LANG_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", es: "Spanish", fr: "French",
  de: "German",  pt: "Portuguese", ar: "Arabic", zh: "Chinese",
  ja: "Japanese", ko: "Korean", ru: "Russian", it: "Italian",
  tr: "Turkish",  nl: "Dutch", pl: "Polish", id: "Indonesian",
  vi: "Vietnamese", th: "Thai", bn: "Bengali", ur: "Urdu",
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

  const generate = async () => {
    if (!calKeyword.trim()) { setError("Enter a keyword or topic first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setCalendar([]);

    const prompt = `You are a content strategist. Create a 30-day content calendar for keyword: "${calKeyword}", niche: ${niche}.
Generate in ${langLabel} language.
Respond ONLY in this exact JSON (no markdown):
{"days":[{"day":1,"type":"Tips","hook":"hook text here","platform_note":"short tip"},...]}
Generate exactly 30 days. Use varied types: ${CONTENT_TYPES.join(", ")}. Make hooks punchy and platform-ready.`;

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
const [reviewText, setReviewText] = useState("");
const [reviewRole, setReviewRole] = useState("");
const [reviewStars, setReviewStars] = useState(5);
const [reviewSubmitted, setReviewSubmitted] = useState(false);
const [reviewLoading, setReviewLoading] = useState(false);
const [user, setUser] = useState<any>(null);
const [authLoading, setAuthLoading] = useState(true);
const [profile, setProfile] = useState<any>(null);
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
        setProfile(data?.[0] ?? null);
const ADMIN_EMAIL = "ravenderr01@gmail.com";
if (session?.user?.email === ADMIN_EMAIL) {
  setPlan("agency");
  localStorage.setItem("viral_plan", "agency");
} else if (data?.[0]?.plan) {
  setPlan(data[0].plan);
  localStorage.setItem("viral_plan", data[0].plan);
}


      }
    });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const limit     = plan === "free" ? 3 : (PLANS[plan as keyof typeof PLANS]?.limit || 3);
  const remaining = Math.max(0, limit - usageCount);
  const usedPct   = Math.min(100, (usageCount / limit) * 100);
  const langLabel = getLangLabel(selectedLang);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("viral_usage", newCount.toString());
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }

    // Supabase se check karo
    const { data: userData } = await supabase
      .from("users")
      .select("generations_used_today, last_reset_date, plan")
      .eq("id", user.id)
      .single();

    if (userData) {
      // Daily reset check
      const today = new Date().toISOString().split("T")[0];
      if (userData.last_reset_date !== today) {
        await supabase.from("users").update({
          generations_used_today: 0,
          last_reset_date: today
        }).eq("id", user.id);
        userData.generations_used_today = 0;
      }

      // Limit check
      const dailyLimit = userData.plan === "free" ? 3 : 999;
      if (userData.generations_used_today >= dailyLimit) {
        setShowPaywall(true);
        return;
      }
    }

    if (usageCount >= limit) { setShowPaywall(true); return; }

    setLoading(true); setError(""); setResults(null);

    const platformInstructions: Record<string, string> = {
      "Google Ads": `You are a Google Ads expert. Generate hooks as 5 headlines (MAX 30 chars each, no emojis), titles as 5 ad titles (MAX 30 chars), captions as 3 descriptions (MAX 90 chars, include CTA). Conversion focused only.`,
      "Meta Ads": `You are a Meta Ads expert. Generate hooks as 5 scroll-stopping first lines (under 125 chars), titles as 5 ad headlines (MAX 40 chars), captions as 3 primary texts (emotion-based, with CTA).`,
      "Native Ads": `You are a Native Ads copywriter. Generate hooks as 5 curiosity-based headlines (not salesy), titles as 5 article-style titles, captions as 3 advertorial style descriptions.`,
      "Instagram": `You are an Instagram viral expert. Generate hooks as 5 viral opening lines (curiosity, emotion, shock), titles as 5 post ideas, captions as 3 engaging captions with emojis.`,
      "YouTube": `You are a YouTube SEO expert. Generate hooks as 5 video hook lines (first 30 seconds), titles as 5 SEO optimized video titles, captions as 3 video descriptions with keywords.`,
      "TikTok": `You are a TikTok viral expert. Generate hooks as 5 pattern interrupt hooks (first 3 seconds), titles as 5 trending style titles, captions as 3 short punchy captions.`,
      "LinkedIn": `You are a LinkedIn content strategist. Generate hooks as 5 professional story openers, titles as 5 thought leadership titles, captions as 3 value-driven posts.`,
      "Twitter / X": `You are a Twitter/X viral expert. Generate hooks as 5 tweet hooks (under 280 chars), titles as 5 thread title ideas, captions as 3 tweet threads.`,
      "Learning & Skills": `You are an e-learning content expert. Generate hooks as 5 curiosity-driven learning hooks, titles as 5 course/tutorial titles, captions as 3 educational post captions.`,
    };

    const nicheContext: Record<string, string> = {
      "Fitness": "fitness, gym, health, workout, nutrition focused",
      "Business": "entrepreneurship, startup, business growth focused",
      "Tech": "technology, software, gadgets, innovation focused",
      "Lifestyle": "daily life, habits, personal growth focused",
      "Food": "recipes, cooking, food review focused",
      "AI & Automation": "artificial intelligence, productivity tools focused",
      "Personal Finance": "money management, investing, savings focused",
      "Mental Health": "emotional wellness, mindfulness focused",
      "Sustainable Living": "eco-friendly, zero waste, green living focused",
      "Storytelling": "narrative, personal story, entertainment focused",
      "Gaming": "video games, esports, gaming culture focused",
      "Beauty & Skincare": "beauty, makeup, skincare routine focused",
      "Ads & Marketing": "digital marketing, advertising, campaigns focused",
      "Education": "learning, skills, knowledge, teaching focused",
    };

    const platformGuide = platformInstructions[platform] || platformInstructions["Instagram"];
    const nicheGuide = nicheContext[niche] || "general content";

    const prompt = `${platformGuide}

NICHE: This content is ${nicheGuide}
KEYWORD: ${keyword}
OUTPUT LANGUAGE: Write everything strictly in ${langLabel} only
TARGET: ${niche} audience on ${platform}

Respond ONLY in this exact JSON (no markdown, no extra text):
{"trendingTopics":["topic1","topic2","topic3","topic4","topic5"],"viralHooks":["hook1","hook2","hook3","hook4","hook5"],"titles":["title1","title2","title3","title4","title5"],"captions":["caption1","caption2","caption3"]}

Make everything highly specific to ${keyword}. Use numbers, power words, emotion triggers.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data  = await res.json();
      const text  = data.content?.map((i: any) => i.text || "").join("") || "";
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
      // Supabase mein count update 
      await supabase.from("users").update({
        generations_used_today: (userData?.generations_used_today || 0) + 1
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
  ];

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#06040f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#a855f7", fontFamily: "sans-serif", animation: "pulse 1s infinite" }}>⚡ Loading...</p>
    </div>
  );

  if (showContact) return <Contact onBack={() => setShowContact(false)} />;
  if (legalPage) return <Legal page={legalPage} onBack={() => setLegalPage(null)} />;
  if (showPlans) return <Plans onBack={() => setShowPlans(false)} onUpgrade={() => { setShowPlans(false); setShowPaywall(true); }} currentPlan={plan} />;
  if (!user) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))} />;

  return (
    <>
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
          padding: "1.5rem 1.5rem 0", textAlign: "center", position: "relative"
        }}>
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
            position: "absolute", top: "1rem", right: "14rem",
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
                {remaining === 0 ? "⛔ Limit reached" : `${remaining} left`}
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
                isPro={["score","calendar","pack","trends"].includes(t.id)} />
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
                        const freeNiches = ["Fitness", "Business"];
                        const starterNiches = Object.keys(NICHE_EXAMPLES).filter(n => n !== "Ads & Marketing");
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
                  {["Instagram", "YouTube", "LinkedIn", "Twitter / X", "TikTok", "Google Ads", "Meta Ads", "Native Ads", "Learning & Skills"].map(p => (
                    <button key={p} className="tbtn" onClick={() => {
                        const freePlatforms = ["Instagram", "YouTube"];
                        const starterPlatforms = ["Instagram", "YouTube", "LinkedIn", "Twitter / X"];
                        const proPlatforms = ["Instagram", "YouTube", "LinkedIn", "Twitter / X", "TikTok", "Google Ads", "Meta Ads", "Native Ads", "Learning & Skills"];
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

              {/* Keyword */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>OUTPUT LANGUAGE</label>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => {
                      const freeLangs = ["en"];
                      const paidLangs = ["en", "hi"];
                      const isLocked = (plan === "free" && !freeLangs.includes(lang.code)) || (plan === "starter" && !paidLangs.includes(lang.code)) || (plan === "pro" && !paidLangs.includes(lang.code));
                      isLocked ? setShowPaywall(true) : setSelectedLang(lang.code);
                    }}
                    style={{
                      background: selectedLang === lang.code ? "rgba(168,85,247,0.15)" : "#0d0d0d",
                      border: `1px solid ${selectedLang === lang.code ? "#a855f7" : "#1a1a1a"}`,
                      color: selectedLang === lang.code ? "#a855f7" : (plan === "free" && !["en"].includes(lang.code)) ? "#2a2a2a" : "#444",
                      padding: "0.28rem 0.75rem", borderRadius: "20px",
                      cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                      transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                    }}>
                    {(plan === "free" && !["en"].includes(lang.code)) ? "🔒 " : ""}{lang.label}
                  </button>
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
                    Starter ₹749 · Pro ₹1499 · Bundle ₹3999
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
            (plan === "free" || plan === "starter") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Hook Score Analyzer is available on paid plans only.</p>
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
            (plan === "free" || plan === "starter" || plan === "pro") ? (
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
            />
            )
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
            (plan === "free" || plan === "starter" || plan === "pro") ? (
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
