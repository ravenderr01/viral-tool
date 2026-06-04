import { useState, useEffect, useRef } from "react";

// ============================================
// 🔧 YOUR DETAILS — change these 2 lines only
const YOUR_UPI_ID    = "yourname@upi";
const YOUR_PAYPAL_ME = "https://paypal.me/yourname";
// ============================================

const PLANS = {
  free:    { label: "Free",    limit: 3,    priceINR: 0,    priceUSD: 0  },
  starter: { label: "Starter", limit: 30,   priceINR: 749,  priceUSD: 9,  badge: "🔥 Popular" },
  pro:     { label: "Pro",     limit: 100,  priceINR: 1499, priceUSD: 19, badge: "⚡ Best Value" },
  bundle:  { label: "Bundle",  limit: 9999, priceINR: 3999, priceUSD: 49, badge: "👑 Unlimited" },
};

const NICHE_EXAMPLES = {
  Fitness:   ["weight loss", "gym motivation", "protein diet", "HIIT workout"],
  Business:  ["passive income", "side hustle", "startup tips", "freelancing"],
  Tech:      ["AI tools", "ChatGPT hacks", "coding tips", "app development"],
  Lifestyle: ["morning routine", "productivity hacks", "minimalism", "self care"],
  Food:      ["meal prep", "healthy recipes", "street food", "viral recipes"],
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
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

    const prompt = `You are a viral content expert. Analyze this hook: "${hookInput}"
Respond ONLY in this exact JSON (no markdown, no extra text):
{"curiosity":7,"emotion":5,"virality":8,"overall":7,"verdict":"Good hook but needs more curiosity trigger","improved":"${hookInput} — improved version here","why":"2-sentence explanation of what works and what doesn't"}
Score each dimension 1-10. Be honest and specific. Improved version should be dramatically better.`;

    try {
      const res = await fetch("${process.env.REACT_APP_API_URL}/api/generate", {
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
            onFocus={e => e.target.style.borderColor = "#ff6b35"}
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
      const res = await fetch("${process.env.REACT_APP_API_URL}/api/generate", {
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
    Motivation: "#ff6b35", Trend: "#06b6d4", "Case Study": "#a855f7",
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
                  const color = TYPE_COLORS[day.type] || "#ff6b35";
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

  const generate = async () => {
    if (!packKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setPack(null);

    const prompt = `You are a viral content machine. Generate a complete content pack for keyword: "${packKeyword}", platform: ${platform}, niche: ${niche}.
Output in ${langLabel}. Respond ONLY in this exact JSON (no markdown):
{
  "hooks":["hook1","hook2","hook3","hook4","hook5","hook6","hook7","hook8","hook9","hook10","hook11","hook12","hook13","hook14","hook15","hook16","hook17","hook18","hook19","hook20"],
  "titles":["title1","title2","title3","title4","title5","title6","title7","title8","title9","title10"],
  "captions":["caption with emojis 1","caption with emojis 2","caption with emojis 3","caption with emojis 4","caption with emojis 5"],
  "scripts":["Reel script 1 (3 parts: Hook/Body/CTA)","Reel script 2","Reel script 3"],
  "hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15"]
}
Make everything highly specific, punchy, and viral. Use numbers, power words, emotion triggers.`;

    try {
      const res = await fetch("${process.env.REACT_APP_API_URL}/api/generate", {
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

  const sections = pack ? [
    { key: "hooks",    label: "Viral Hooks",    emoji: "🎣", color: "#ff6b35", count: pack.hooks?.length },
    { key: "titles",   label: "Title Ideas",    emoji: "📝", color: "#818cf8", count: pack.titles?.length },
    { key: "captions", label: "Captions",       emoji: "💬", color: "#22c55e", count: pack.captions?.length },
    { key: "scripts",  label: "Reel Scripts",   emoji: "🎬", color: "#f59e0b", count: pack.scripts?.length },
    { key: "hashtags", label: "Hashtags",       emoji: "#️⃣", color: "#06b6d4", count: pack.hashtags?.length },
  ] : [];

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
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>20 hooks + 10 titles + 5 captions + 3 scripts + hashtags</p>
          </div>
        </div>

        {/* Pack stats preview */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {[["20","Hooks","#ff6b35"],["10","Titles","#818cf8"],["5","Captions","#22c55e"],["3","Scripts","#f59e0b"],["15","Hashtags","#06b6d4"]].map(([n,l,c]) => (
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
        background: "#0a0a0a", border: "1px solid #ff6b35", borderRadius: "20px",
        padding: "1.75rem", maxWidth: "460px", width: "100%", color: "#fff",
        boxShadow: "0 0 80px rgba(255,107,53,0.25)", animation: "slideUp 0.3s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>💳</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", margin: "0 0 0.5rem", color: "#ff6b35" }}>
            Complete Payment
          </h2>
          <div style={{
            display: "inline-block", background: "#ff6b3518", border: "1px solid #ff6b3540",
            borderRadius: "20px", padding: "0.3rem 1rem"
          }}>
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>
              {planData?.label} — <span style={{ color: "#ff6b35" }}>₹{planData?.priceINR} / ${planData?.priceUSD}</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", background: "#111", borderRadius: "10px", padding: "0.3rem", marginBottom: "1.25rem" }}>
          {[["INR", "🇮🇳 UPI (India)"], ["USD", "🌍 PayPal (Worldwide)"]].map(([c, label]) => (
            <button key={c} onClick={() => setCurrency(c)}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none",
                background: currency === c ? "#ff6b35" : "transparent",
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
              background: "#111", border: "2px solid #ff6b3530", borderRadius: "14px",
              padding: "1rem", display: "inline-block", marginBottom: "0.75rem"
            }}>
              <img src={getUPIQR(YOUR_UPI_ID, planData?.priceINR)} alt="UPI QR"
                style={{ width: "160px", height: "160px", borderRadius: "8px", display: "block" }} />
            </div>
            <div style={{
              background: "#0a0a0a", border: "1px solid #ff6b3525", borderRadius: "10px",
              padding: "0.6rem 1rem", margin: "0 auto 0.75rem", maxWidth: "300px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem"
            }}>
              <span style={{ color: "#ff6b35", fontWeight: 700, fontSize: "0.9rem", wordBreak: "break-all" }}>{YOUR_UPI_ID}</span>
              <button onClick={() => { navigator.clipboard.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                  background: copied ? "#22c55e22" : "#ff6b3518", border: `1px solid ${copied ? "#22c55e" : "#ff6b3540"}`,
                  color: copied ? "#22c55e" : "#ff6b35", padding: "0.25rem 0.6rem", borderRadius: "6px",
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
            ✅ I've Completed Payment — Activate Now!
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
        background: "#0a0a0a", border: "1px solid #ff6b35", borderRadius: "20px",
        padding: "1.75rem", maxWidth: "480px", width: "100%", color: "#fff",
        boxShadow: "0 0 80px rgba(255,107,53,0.25)", animation: "slideUp 0.3s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🚀</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", margin: "0.5rem 0", color: "#ff6b35" }}>
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
                border: `${selected === key ? "2" : "1"}px solid ${selected === key ? "#ff6b35" : "#1e1e1e"}`,
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
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ff6b35" }}>₹{plan.priceINR}</div>
                <div style={{ color: "#333", fontSize: "0.72rem" }}>${plan.priceUSD} / mo</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => onSelectPlan(selected)}
          style={{
            width: "100%", padding: "0.9rem", borderRadius: "10px",
            background: "linear-gradient(135deg,#ff6b35,#f7c59f)",
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
        background: active ? "#ff6b3515" : "transparent",
        color: active ? "#ff6b35" : "#444",
        fontWeight: active ? 700 : 500, fontSize: "0.72rem",
        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.2s", position: "relative",
        borderBottom: active ? "2px solid #ff6b35" : "2px solid transparent",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem"
      }}>
      <span style={{ fontSize: "1rem" }}>{emoji}</span>
      <span>{label}</span>
      {isPro && !active && (
        <span style={{
          position: "absolute", top: 4, right: 4, fontSize: "0.5rem",
          background: "#ff6b3520", border: "1px solid #ff6b3540", color: "#ff6b35",
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
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    const u = localStorage.getItem("viral_usage");
    const p = localStorage.getItem("viral_plan");
    if (u) setUsageCount(parseInt(u));
    if (p) setPlan(p);
    setDetectedLang(getBrowserLang());
  }, []);

  const limit     = plan === "free" ? 3 : (PLANS[plan as keyof typeof PLANS]?.limit || 3);
  const remaining = Math.max(0, limit - usageCount);
  const usedPct   = Math.min(100, (usageCount / limit) * 100);
  const langLabel = getLangLabel(detectedLang);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("viral_usage", newCount.toString());
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }
    if (usageCount >= limit) { setShowPaywall(true); return; }

    setLoading(true); setError(""); setResults(null);

    const prompt = `You are a viral content strategist. Generate content for keyword: "${keyword}", platform: ${platform}, niche: ${niche}.
The user's browser language is "${langLabel}" — generate ALL output text in ${langLabel}.
Respond ONLY in this exact JSON format (no markdown, no extra text):
{"trendingTopics":["topic1","topic2","topic3","topic4","topic5"],"viralHooks":["hook1","hook2","hook3","hook4"],"titles":["title1","title2","title3","title4"],"captions":["caption with emojis 1","caption with emojis 2","caption with emojis 3"]}
Rules: punchy, trendy, platform-specific for ${platform}, use numbers, emotions, power words, emojis in captions.`;

    try {
      const res = await fetch("${process.env.REACT_APP_API_URL}/api/generate", {
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
      setResults(JSON.parse(clean));
      incrementUsage();
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSelectPlan = (p: string) => { setShowPaywall(false); setPayingPlan(p); };
  const handlePaid = (p: string) => {
    setPlan(p);
    localStorage.setItem("viral_plan", p);
    setPayingPlan(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const tabs = [
    { id: "generate", label: "Generate",  emoji: "⚡" },
    { id: "score",    label: "Hook Score", emoji: "📊" },
    { id: "calendar", label: "Calendar",  emoji: "📅" },
    { id: "pack",     label: "Pack",      emoji: "📦" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #050505; }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 20px rgba(255,107,53,0.25)} 50%{box-shadow:0 0 50px rgba(255,107,53,0.55)} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .gbtn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 40px rgba(255,107,53,0.5)!important; }
        .tbtn:hover { border-color:#ff6b35!important; color:#ff6b35!important; }
        input,textarea { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0a0a0a; }
        ::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── Header ── */}
        <div style={{
          background: "#080808", borderBottom: "1px solid #111",
          padding: "1.25rem 1rem 0", textAlign: "center"
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "#ff6b3510", border: "1px solid #ff6b3525", borderRadius: "20px",
            padding: "0.2rem 0.85rem", marginBottom: "0.6rem"
          }}>
            <span style={{ fontSize: "0.65rem", color: "#ff6b35", fontWeight: 700, letterSpacing: "0.08em" }}>⚡ AI-POWERED VIRAL ENGINE</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.4rem,5vw,2.2rem)", fontWeight: 800,
            margin: "0 0 0.3rem",
            background: "linear-gradient(135deg,#ffffff 10%, #ff9a6c 50%, #ff6b35 90%)",
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
              <span style={{ color: "#444" }}>Plan: <strong style={{ color: "#ff6b35" }}>{PLANS[plan as keyof typeof PLANS]?.label}</strong></span>
              <span style={{ color: remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                {remaining === 0 ? "⛔ Limit reached" : `${remaining} left`}
              </span>
            </div>
            <div style={{ background: "#141414", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "4px",
                background: remaining === 0 ? "#ef4444" : "linear-gradient(90deg,#ff6b35,#f7c59f)",
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
                isPro={["score","calendar","pack"].includes(t.id)} />
            ))}
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>

          {/* ── TAB: GENERATE ── */}
          {activeTab === "generate" && (
            <div>
              {/* Niche */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>NICHE</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {Object.keys(NICHE_EXAMPLES).map(n => (
                    <button key={n} className="tbtn" onClick={() => setNiche(n)}
                      style={{
                        background: niche === n ? "#ff6b3512" : "#0d0d0d",
                        border: `1px solid ${niche === n ? "#ff6b35" : "#1a1a1a"}`,
                        color: niche === n ? "#ff6b35" : "#444",
                        padding: "0.28rem 0.75rem", borderRadius: "20px",
                        cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                        transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {["Instagram", "YouTube", "LinkedIn", "Twitter / X", "TikTok"].map(p => (
                    <button key={p} className="tbtn" onClick={() => setPlatform(p)}
                      style={{
                        background: platform === p ? "#ff6b3512" : "#0d0d0d",
                        border: `1px solid ${platform === p ? "#ff6b35" : "#1a1a1a"}`,
                        color: platform === p ? "#ff6b35" : "#444",
                        padding: "0.28rem 0.75rem", borderRadius: "20px",
                        cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                        transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword */}
              <div style={{ marginBottom: "0.75rem" }}>
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
                  onFocus={e => e.target.style.borderColor = "#ff6b35"}
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
                  background: loading ? "#0d0d0d" : "linear-gradient(135deg,#ff6b35,#f7c59f)",
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
                    background: "#ff6b3508", border: "1px solid #ff6b3520",
                    borderRadius: "8px", fontSize: "0.75rem", color: "#ff6b35"
                  }}>
                    🌐 Generated in <strong>{langLabel}</strong>
                    <span style={{ marginLeft: "auto", color: "#333", fontSize: "0.7rem" }}>
                      💡 Try Hook Score tab to improve these
                    </span>
                  </div>
                  <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#818cf8" />
                  <ResultCard title="Viral Hooks"     items={results.viralHooks}     emoji="🎣" color="#ff6b35" />
                  <ResultCard title="Title Ideas"     items={results.titles}         emoji="📝" color="#22c55e" />
                  <ResultCard title="Captions"        items={results.captions}       emoji="💬" color="#f59e0b" />

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
                          onMouseEnter={e => { (e.currentTarget.style.borderColor = "#ff6b35"); (e.currentTarget.style.color = "#ff6b35"); }}
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
                  background: "#ff6b3508", border: "1px solid #ff6b3518", borderRadius: "14px",
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
                      background: "linear-gradient(135deg,#ff6b35,#f7c59f)", border: "none", color: "#000",
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
            <HookScoreAnalyzer
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              langLabel={langLabel}
            />
          )}

          {/* ── TAB: CALENDAR ── */}
          {activeTab === "calendar" && (
            <ContentCalendar
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              keyword={keyword} niche={niche} langLabel={langLabel}
            />
          )}

          {/* ── TAB: PACK ── */}
          {activeTab === "pack" && (
            <ContentPack
              plan={plan} usageCount={usageCount} limit={limit}
              onUpgrade={() => setShowPaywall(true)}
              keyword={keyword} niche={niche} platform={platform} langLabel={langLabel}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSelectPlan={handleSelectPlan} />}
      {payingPlan  && <PaymentModal plan={payingPlan} onClose={() => setPayingPlan(null)} onPaid={handlePaid} />}

      {/* Toast */}
      {showSuccess && (
        <div style={{
          position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff",
          padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 800, zIndex: 9999,
          animation: "slideUp 0.3s ease", whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(34,197,94,0.4)", fontFamily: "'Syne',sans-serif"
        }}>
          🎉 Plan activated! Enjoy unlimited viral content.
        </div>
      )}
    </>
  );
}
