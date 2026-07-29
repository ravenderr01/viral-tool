import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Legal from "./Legal";

const BACKEND = "https://viral-tool-1.onrender.com";

const DEFAULT_REVIEWS = [
  { name: "Rahul S.", role: "Instagram Creator", review: "Generated 20 viral hooks in 10 seconds. My reel hit 100K views!", stars: 5 },
  { name: "Priya M.", role: "Digital Marketer", review: "The Google Ads copy saved me hours. Highly recommend VCI!", stars: 5 },
  { name: "Arjun K.", role: "YouTuber", review: "30-day calendar changed my posting strategy completely.", stars: 5 },
  { name: "Sneha R.", role: "Fitness Coach", review: "Hook Score helped me understand why content wasn't performing!", stars: 5 },
  { name: "Vikram T.", role: "Agency Owner", review: "We use VCI for all clients. Saves 5+ hours per week!", stars: 5 },
  { name: "Ananya D.", role: "Lifestyle Blogger", review: "Instagram captions doubled my engagement in 2 weeks.", stars: 5 },
  { name: "Mohit G.", role: "E-commerce Owner", review: "Meta Ads copy is incredible. ROAS improved by 3x!", stars: 5 },
  { name: "Deepak N.", role: "LinkedIn Consultant", review: "Best tool for LinkedIn content. Professional hooks every time.", stars: 5 },
];

// ─────────────────────────────────────────────────────────────────────────
// HERO FLOW ANIMATION — 15-20 sec auto loop
// Keyword → Generate → Hook Score → Script → Voice → Caption → Ready to Post
// ─────────────────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { id: "keyword",  icon: "⌨️", label: "Keyword",      color: "#8b5cf6" },
  { id: "generate", icon: "⚡", label: "Generate",      color: "#a855f7" },
  { id: "score",    icon: "📊", label: "Hook Score",   color: "#22c55e" },
  { id: "script",   icon: "🎬", label: "Script",       color: "#f59e0b" },
  { id: "voice",    icon: "🔊", label: "AI Voice",     color: "#06b6d4" },
  { id: "caption",  icon: "💬", label: "Caption",      color: "#ec4899" },
  { id: "ready",    icon: "✅", label: "Ready to Post", color: "#22c55e" },
];
const STEP_DURATION = 2400; // ms per step → 7 * 2.4s ≈ 16.8s full loop

function HeroFlowAnimation() {
  const [active, setActive] = useState(0);
  const [typedKeyword, setTypedKeyword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(a => (a + 1) % FLOW_STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(timer);
  }, []);

  // Typing effect for the keyword step
  useEffect(() => {
    if (active !== 0) { setTypedKeyword(""); return; }
    const word = "weight loss";
    let i = 0;
    setTypedKeyword("");
    const t = setInterval(() => {
      i++;
      setTypedKeyword(word.slice(0, i));
      if (i >= word.length) clearInterval(t);
    }, 90);
    return () => clearInterval(t);
  }, [active]);

  const step = FLOW_STEPS[active];

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>

      {/* Step tracker */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", position: "relative" }}>
        {FLOW_STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < FLOW_STEPS.length - 1 ? 1 : "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem",
              background: i === active ? s.color + "22" : i < active ? "#111" : "#0a0a0a",
              border: `1.5px solid ${i === active ? s.color : i < active ? "#2a2a2a" : "#1a1a1a"}`,
              transition: "all 0.35s ease",
              boxShadow: i === active ? `0 0 14px ${s.color}55` : "none",
            }}>
              {s.icon}
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "0 3px", borderRadius: 2, background: i < active ? "#2a2a2a" : "#141414", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: 0, background: step.color,
                  width: i < active ? "100%" : i === active ? "50%" : "0%",
                  transition: "width 0.35s ease", opacity: 0.6,
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active step label */}
      <div style={{ textAlign: "center" as const, marginBottom: "0.85rem" }}>
        <span style={{ color: step.color, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>
          STEP {active + 1}/7 — {step.label.toUpperCase()}
        </span>
      </div>

      {/* Preview panel */}
      <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden", minHeight: 190 }}>
        <div style={{ background: "#0d0d0d", borderBottom: "1px solid #111", padding: "0.55rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", opacity: 0.6 }} />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", opacity: 0.6 }} />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", opacity: 0.6 }} />
          </div>
          <span style={{ color: "#3f3f46", fontSize: "0.6rem", fontFamily: "monospace", flex: 1, textAlign: "center" as const }}>getvci.com</span>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 150 }}>
          <div key={active} style={{ width: "100%", animation: "slideUp 0.3s ease" }}>

            {active === 0 && (
              <div>
                <p style={{ color: "#52525b", fontSize: "0.65rem", fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.04em" }}>ENTER YOUR KEYWORD</p>
                <div style={{ background: "#0a0a0a", border: "1px solid #6d28d9", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", alignItems: "center" }}>
                  <span style={{ color: "#e4e4e7", fontSize: "0.9rem" }}>{typedKeyword}</span>
                  <span style={{ width: 2, height: 16, background: "#8b5cf6", marginLeft: 2, animation: "pulse 0.8s infinite" }} />
                </div>
              </div>
            )}

            {active === 1 && (
              <div style={{ textAlign: "center" as const }}>
                <div style={{ width: 42, height: 42, border: "3px solid #222", borderTopColor: "#a855f7", borderRadius: "50%", margin: "0 auto 0.85rem", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "#a855f7", fontSize: "0.82rem", fontWeight: 700 }}>Generating viral content...</p>
                <p style={{ color: "#3f3f46", fontSize: "0.65rem", marginTop: "0.3rem" }}>Analyzing trends & platform data</p>
              </div>
            )}

            {active === 2 && (
              <div style={{ textAlign: "center" as const }}>
                <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 0.6rem" }}>
                  <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={44} cy={44} r={38} fill="none" stroke="#1a1a1a" strokeWidth={6} />
                    <circle cx={44} cy={44} r={38} fill="none" stroke="#22c55e" strokeWidth={6}
                      strokeDasharray={`${2 * Math.PI * 38 * 0.92} ${2 * Math.PI * 38}`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const }}>
                    <span style={{ color: "#22c55e", fontWeight: 900, fontSize: "1.3rem" }}>92</span>
                  </div>
                </div>
                <p style={{ color: "#22c55e", fontSize: "0.78rem", fontWeight: 700 }}>Grade A — Viral Ready 🔥</p>
              </div>
            )}

            {active === 3 && (
              <div>
                <p style={{ color: "#f59e0b", fontSize: "0.65rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.04em" }}>🎬 SCRIPT GENERATED</p>
                {["HOOK: Lost 10kg without the gym...", "PROBLEM: Diets never worked for me...", "SOLUTION: Here's what changed it all..."].map((l, i) => (
                  <p key={i} style={{ color: "#a1a1aa", fontSize: "0.74rem", lineHeight: 1.7, margin: "0 0 0.25rem" }}>{l}</p>
                ))}
              </div>
            )}

            {active === 4 && (
              <div style={{ textAlign: "center" as const }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", height: 40, marginBottom: "0.6rem" }}>
                  {[8, 20, 14, 28, 10, 24, 16, 30, 12, 22, 9].map((h, i) => (
                    <div key={i} style={{ width: 3, height: h, background: "#06b6d4", borderRadius: 2, animation: `pulse ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
                <p style={{ color: "#06b6d4", fontSize: "0.78rem", fontWeight: 700 }}>AI Voiceover — Hindi 🇮🇳</p>
                <p style={{ color: "#3f3f46", fontSize: "0.65rem", marginTop: "0.2rem" }}>12 Indian languages supported</p>
              </div>
            )}

            {active === 5 && (
              <div>
                <p style={{ color: "#ec4899", fontSize: "0.65rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.04em" }}>💬 CAPTION READY</p>
                <p style={{ color: "#e4e4e7", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                  "Lost 10kg without the gym — here's exactly what I did 🔥"
                </p>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" as const }}>
                  {["#weightloss", "#fitness", "#transformation"].map(t => (
                    <span key={t} style={{ background: "rgba(236,72,153,0.08)", color: "#ec4899", fontSize: "0.62rem", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {active === 6 && (
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>✅</div>
                <p style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 800 }}>Ready to Post!</p>
                <p style={{ color: "#3f3f46", fontSize: "0.68rem", marginTop: "0.3rem" }}>Hook + Script + Caption + Hashtags + Voice</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// LIVE EXAMPLE OUTPUT CARD
// ─────────────────────────────────────────────────────────────────────────
function LiveExampleCard() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let s = 0;
    const t = setInterval(() => {
      s += 4;
      if (s >= 92) { s = 92; clearInterval(t); }
      setScore(s);
    }, 25);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "#080808", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "16px", padding: "1.1rem", width: "100%", maxWidth: 440 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span style={{ color: "#52525b", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>LIVE EXAMPLE</span>
        <span style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "0.6rem", fontWeight: 700, padding: "0.12rem 0.5rem", borderRadius: "20px" }}>Real output</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
        <span style={{ color: "#3f3f46", fontSize: "0.72rem" }}>Input:</span>
        <span style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", color: "#e4e4e7", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.65rem", borderRadius: "8px" }}>"weight loss"</span>
      </div>

      <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", marginBottom: "0.85rem", background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "10px", padding: "0.7rem 0.85rem" }}>
        <div style={{ position: "relative", width: 46, height: 46, flexShrink: 0 }}>
          <svg width="46" height="46" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={23} cy={23} r={19} fill="none" stroke="#1a1a1a" strokeWidth={4} />
            <circle cx={23} cy={23} r={19} fill="none" stroke="#22c55e" strokeWidth={4}
              strokeDasharray={`${2 * Math.PI * 19 * (score / 100)} ${2 * Math.PI * 19}`} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#22c55e", fontWeight: 900, fontSize: "0.85rem" }}>{score}</span>
          </div>
        </div>
        <div>
          <p style={{ margin: 0, color: "#22c55e", fontWeight: 800, fontSize: "0.85rem" }}>Hook Score: Grade A</p>
          <p style={{ margin: "0.1rem 0 0", color: "#52525b", fontSize: "0.68rem" }}>Viral-ready in one generation</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.55rem" }}>
        {[
          { label: "🎣 Hook", text: "I lost 10kg without the gym — here's exactly what I did 🔥", color: "#a855f7" },
          { label: "🎬 Script", text: "HOOK → PROBLEM → SOLUTION → CTA, fully written, 30-sec reel ready", color: "#f59e0b" },
          { label: "💬 Caption", text: "Losing weight isn't about willpower, it's about the right system...", color: "#ec4899" },
          { label: "#️⃣ Hashtags", text: "#weightloss #fitness #transformation #healthylifestyle +11 more", color: "#06b6d4" },
        ].map(item => (
          <div key={item.label} style={{ borderLeft: `2px solid ${item.color}`, paddingLeft: "0.6rem" }}>
            <p style={{ margin: "0 0 0.1rem", color: item.color, fontSize: "0.62rem", fontWeight: 700 }}>{item.label}</p>
            <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.72rem", lineHeight: 1.5 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SOCIAL PROOF STATS
// ─────────────────────────────────────────────────────────────────────────
const SOCIAL_PROOF_STATS = [
  { icon: "🧰", stat: "20+", label: "AI Tools" },
  { icon: "⚡", stat: "10–30 sec", label: "Result Time" },
  { icon: "🇮🇳", stat: "12", label: "Indian Languages" },
  { icon: "👥", stat: "Creator + Advertiser + Agency", label: "Built for everyone" },
];

// ─────────────────────────────────────────────────────────────────────────
// PLAN CARDS
// ─────────────────────────────────────────────────────────────────────────
const PLAN_CARDS = [
  { icon: "🎨", name: "Creator", price: "From ₹499/mo", desc: "Hooks, scripts, captions, calendar, voiceover", color: "#8b5cf6" },
  { icon: "📢", name: "Advertiser", price: "From ₹2,499/mo", desc: "Ad copy, ROI calculator, landing pages", color: "#06b6d4" },
  { icon: "👑", name: "Agency", price: "₹8,999/mo", desc: "Everything unlocked + client management", color: "#f59e0b" },
];

// ─────────────────────────────────────────────────────────────────────────
// VIRA — AI ASSISTANT WIDGET (floating, bottom corner)
// ─────────────────────────────────────────────────────────────────────────
function ViraAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "vira"; text: string }[]>([
    { role: "vira", text: "Hi! I'm VIRA 👋 Ask me anything about VCI before you sign up — pricing, features, languages, anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const ask = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    const prompt = `You are VIRA, the friendly AI assistant for VCI (Viral Content Intelligence) — an AI platform that generates viral hooks, scripts, captions, hashtags, ad copy, landing pages and AI voiceovers in 12 Indian languages, for Creators, Advertisers and Agencies. VCI has 20+ AI tools and gives results in 10-30 seconds. Plans start at ₹499/mo (Creator), ₹2,499/mo (Advertiser), and ₹8,999/mo (Agency), with a free plan (25 credits) requiring no credit card.

Answer this visitor's question about VCI in 2-4 short, friendly sentences. Be concise, helpful and encourage them to sign up if relevant. Do not use markdown formatting.

Visitor's question: "${q}"`;

    try {
      const res = await fetch(`${BACKEND}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "Sorry, I couldn't fetch an answer right now — feel free to sign up and explore VCI directly!";
      setMessages(m => [...m, { role: "vira", text: text.trim() }]);
    } catch {
      setMessages(m => [...m, { role: "vira", text: "I'm having trouble connecting right now. Try signing up free — no credit card needed!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "1.25rem", right: "1.25rem", zIndex: 500, fontFamily: "'Inter',sans-serif" }}>

      {open && (
        <div style={{
          width: "min(340px, 88vw)", height: "min(440px, 70vh)",
          background: "#0a0a0a", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "18px",
          marginBottom: "0.75rem", display: "flex", flexDirection: "column" as const,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden", animation: "slideUp 0.25s ease",
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>VIRA</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.65rem" }}>AI Assistant · Ask anything</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "0.85rem", display: "flex", flexDirection: "column" as const, gap: "0.6rem" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{
                  background: m.role === "user" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "#141414",
                  color: m.role === "user" ? "#fff" : "#d4d4d8",
                  border: m.role === "vira" ? "1px solid #1f1f1f" : "none",
                  borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  padding: "0.55rem 0.75rem", fontSize: "0.78rem", lineHeight: 1.55,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "#141414", border: "1px solid #1f1f1f", borderRadius: "12px 12px 12px 2px", padding: "0.55rem 0.75rem", display: "flex", gap: "3px" }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#71717a", animation: `pulse 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "0.65rem", borderTop: "1px solid #141414", display: "flex", gap: "0.4rem" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Ask about pricing, features..."
              style={{ flex: 1, background: "#141414", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.55rem 0.75rem", color: "#f5f5f5", fontSize: "0.78rem", outline: "none", fontFamily: "'Inter',sans-serif" }}
            />
            <button onClick={ask} disabled={loading || !input.trim()}
              style={{ background: !input.trim() ? "#1a1a1a" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: !input.trim() ? "#444" : "#fff", borderRadius: "10px", padding: "0 0.9rem", cursor: !input.trim() ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
              →
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "0.55rem",
          background: "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none",
          borderRadius: "50px", padding: open ? "0.7rem" : "0.7rem 1.1rem 0.7rem 0.7rem",
          cursor: "pointer", boxShadow: "0 8px 28px rgba(109,40,217,0.4)",
          marginLeft: "auto", float: "right" as const,
        }}>
        <span style={{ position: "relative", width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>
          🤖
          <span style={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "2px solid #6d28d9", animation: "pulse 2s infinite" }} />
        </span>
        {!open && <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap" as const }}>Meet VIRA — Ask anything</span>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN AUTH COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [reviews, setReviews] = useState<any[]>([]);
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | "refund" | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      if (!firstName || !lastName || !phone) { setError("Please fill all fields."); setLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }

      // ── Disposable email block ──────────────────────────────────────
      const disposableDomains = [
        "mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com",
        "throwam.com","yopmail.com","sharklasers.com","trashmail.com",
        "trashmail.me","trashmail.net","dispostable.com","maildrop.cc",
        "spamgourmet.com","getairmail.com","filzmail.com","tempr.email",
        "discard.email","mailnesia.com","fakeinbox.com","emailondeck.com",
        "throwaway.email","temp-mail.org","tmpmail.net","tmpmail.org",
        "burnermail.io","mailtemp.net","email-temp.com","mohmal.com",
        "spambox.us","spamevader.com","spamfree24.org","spamspot.com",
        "trbvm.com","wegwerf-email.de","zehnminuten.de","zehnminutenmail.de",
        "zippymail.info","guerrillamail.info","guerrillamail.biz",
        "guerrillamail.de","guerrillamail.net","guerrillamail.org",
        "spam4.me","mailnull.com","selfdestructingmail.com","mintemail.com",
      ];
      const emailDomain = email.split("@")[1]?.toLowerCase();
      if (!emailDomain || disposableDomains.includes(emailDomain)) {
        setError("Temporary or disposable emails are not allowed. Please use Gmail, Outlook, Yahoo, or your work email.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        // upsert — creates row if not exists, updates if exists
        const { error: dbError } = await supabase.from("users").upsert({
          id: data.user.id,
          email: data.user.email || email,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          plan: "free",
          credits_remaining: 25,
          credits_total: 25,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

        if (dbError) {
          // Non-fatal — auth account created, profile save failed
          console.error("Profile save error:", dbError.message);
          // Still let user proceed — trigger SQL will handle it
        }
      }
      setMessage("✅ Account created! Please login.");
      setMode("login");
    }
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin();
    }
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("✅ Reset link sent! Check your email.");
    }
    setLoading(false);
  };

  if (showLegal) return <Legal page={showLegal} onBack={() => setShowLegal(null)} />;

  const allReviews = [...DEFAULT_REVIEWS, ...reviews];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; font-family: 'Inter', sans-serif; }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .auth-input {
          width: 100%; background: #0a0a0a; border: 1px solid #1f1f1f;
          border-radius: 10px; padding: 0.85rem 1rem; color: #f5f5f5;
          font-size: 0.9rem; font-family: 'Inter', sans-serif; outline: none;
          transition: all 0.2s; box-sizing: border-box;
        }
        .auth-input:focus { border-color: #6d28d9; background: #0d0d0d; box-shadow: 0 0 0 3px rgba(109,40,217,0.1); }
        .auth-input::placeholder { color: #404040; }
        .submit-btn {
          width: 100%; padding: 0.9rem; border-radius: 10px; border: none;
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(109,40,217,0.25); }
        .submit-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .mode-link { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .mode-link:hover { opacity: 0.75; }
        .marquee-track { display: flex; animation: marquee 40s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
        .hero-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(109,40,217,0.35) !important; }
        .auth-shell { height: 100vh; overflow: hidden; }
        @supports (height: 100dvh) { .auth-shell { height: 100dvh; } }
        @media (max-width: 900px) { .auth-left { display: none !important; } .auth-right { width: 100% !important; height: 100% !important; padding: 1.75rem 1.25rem !important; justify-content: flex-start !important; padding-top: 2.5rem !important; } .auth-right > div { max-width: 100% !important; width: 100% !important; } .auth-input { font-size: 1rem !important; padding: 0.9rem 1rem !important; -webkit-appearance: none; } .submit-btn { padding: 1rem !important; font-size: 0.95rem !important; } } @media (max-width: 400px) { .auth-right { padding: 1.5rem 1rem !important; } }
      `}</style>

      <div className="auth-shell" style={{ background: "#000000", display: "flex", fontFamily: "'Inter', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #0f0f0f", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#0f0f0f 1px, transparent 1px), linear-gradient(90deg, #0f0f0f 1px, transparent 1px)", backgroundSize: "44px 44px", opacity: 0.5 }} />
          <div style={{ position: "absolute", top: -80, left: "20%", width: 350, height: 350, background: "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "2.5rem 3rem", overflowY: "auto" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
              <div style={{ width: 30, height: 30, background: "#6d28d9", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>⚡</div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>VCI</span>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.06em" }}>VIRAL CONTENT INTELLIGENCE</span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "0.2rem 0.7rem", marginBottom: "1rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 500 }}>500+ creators, advertisers & agencies use VCI</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.7rem,2.6vw,2.35rem)", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.03em", marginBottom: "0.85rem", color: "#fff" }}>
                India's First <span style={{ color: "#6d28d9" }}>AI Growth Platform</span><br />
                for Creators &amp; Advertisers
              </h1>
              <p style={{ color: "#71717a", fontSize: "0.87rem", lineHeight: 1.85, maxWidth: 420, marginBottom: "1.25rem" }}>
                Generate viral hooks, scripts, captions, hashtags, ad copies, landing pages
                and AI voiceovers in <strong style={{ color: "#a1a1aa" }}>12 Indian languages</strong> —
                all from one dashboard.
              </p>

              {/* Hero CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" as const }}>
                <button className="hero-cta-btn" onClick={() => setMode("signup")}
                  style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: "#fff", padding: "0.75rem 1.4rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter',sans-serif", boxShadow: "0 6px 20px rgba(109,40,217,0.28)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  Get Started Free →
                </button>
                <span style={{ color: "#52525b", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  No credit card required
                </span>
              </div>
            </div>

            {/* Hero flow animation */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ color: "#52525b", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>SEE THE FULL FLOW — LIVE</span>
              </div>
              <HeroFlowAnimation />
            </div>

            {/* Live example output card */}
            <div style={{ marginBottom: "1.75rem" }}>
              <LiveExampleCard />
            </div>

            {/* Social proof stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "1.75rem" }}>
              {SOCIAL_PROOF_STATS.map((s, i) => (
                <div key={i} style={{ background: "#080808", border: "1px solid #141414", borderRadius: "12px", padding: "0.75rem 0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                    <span style={{ fontSize: "0.85rem" }}>{s.icon}</span>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: s.stat.length > 6 ? "0.78rem" : "1rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{s.stat}</span>
                  </div>
                  <div style={{ color: "#52525b", fontSize: "0.65rem", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Plan cards */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ color: "#3f3f46", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.65rem", fontFamily: "'DM Mono', monospace" }}>PLANS FOR EVERY GOAL</div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const }}>
                {PLAN_CARDS.map(p => (
                  <div key={p.name} style={{ flex: "1 1 140px", background: "#080808", border: `1px solid ${p.color}22`, borderRadius: "12px", padding: "0.85rem 0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "1rem" }}>{p.icon}</span>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{p.name}</span>
                    </div>
                    <p style={{ color: p.color, fontWeight: 700, fontSize: "0.72rem", marginBottom: "0.35rem" }}>{p.price}</p>
                    <p style={{ color: "#52525b", fontSize: "0.65rem", lineHeight: 1.5 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews marquee */}
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#3f3f46", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.65rem", fontFamily: "'DM Mono', monospace" }}>CREATOR &amp; ADVERTISER REVIEWS</div>
              <div className="marquee-track">
                {[...allReviews, ...allReviews].map((r, i) => (
                  <div key={i} style={{ background: "#080808", border: "1px solid #111", borderRadius: "8px", padding: "0.65rem 0.85rem", minWidth: "190px", maxWidth: "190px", marginRight: "0.5rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#d4d4d8", fontWeight: 600, fontSize: "0.7rem" }}>{r.name}</span>
                      <span style={{ color: "#713f12", fontSize: "0.55rem" }}>{"★".repeat(r.stars)}</span>
                    </div>
                    <div style={{ color: "#3f3f46", fontSize: "0.58rem", marginBottom: "0.25rem" }}>{r.role}</div>
                    <p style={{ color: "#52525b", fontSize: "0.65rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right" style={{ width: 500, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 3rem", background: "#000", overflowY: "auto", borderLeft: "1px solid #111", boxSizing: "border-box" }}>

          <div style={{ width: "100%", maxWidth: 400, animation: "slideUp 0.4s ease" }}>

            {/* Logo mark — mobile only feel */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6d28d9,#7c3aed)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>VCI</span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.55rem", letterSpacing: "-0.03em", marginBottom: "0.4rem", lineHeight: 1.2 }}>
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Get started for free" : "Reset your password"}
              </h2>
              <p style={{ color: "#52525b", fontSize: "0.84rem", lineHeight: 1.6 }}>
                {mode === "login" ? "Sign in to your VCI account to continue" : mode === "signup" ? "Join 500+ creators, advertisers & agencies using VCI" : "Enter your email and we'll send a reset link"}
              </p>
            </div>

            {/* Mode toggle pill */}
            {mode !== "forgot" && (
              <div style={{ display: "flex", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "3px", marginBottom: "1.5rem" }}>
                {(["login", "signup"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none", background: mode === m ? "#1a1a1a" : "transparent", color: mode === m ? "#fff" : "#52525b", fontWeight: mode === m ? 600 : 400, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}>
                    {m === "login" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {mode === "signup" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.65rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>First name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" className="auth-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Last name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Phone number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Email address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <label style={{ color: "#71717a", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.01em" }}>Password</label>
                    {mode === "login" && (
                      <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="mode-link"
                        style={{ color: "#6d28d9", fontSize: "0.72rem", fontWeight: 500 }}>Forgot password?</button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password}
                      onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      className="auth-input" style={{ paddingRight: "3.5rem" }} />
                    <button onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "0.65rem 0.85rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ color: "#f87171", fontSize: "0.8rem", lineHeight: 1.5 }}>{error}</span>
                </div>
              )}
              {message && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px", padding: "0.65rem 0.85rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ color: "#4ade80", fontSize: "0.8rem", lineHeight: 1.5 }}>{message}</span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="submit-btn"
                style={{ background: loading ? "#0d0d0d" : "linear-gradient(135deg,#6d28d9,#7c3aed)", color: loading ? "#3f3f46" : "#fff", border: loading ? "1px solid #1a1a1a" : "none", marginTop: "0.1rem", letterSpacing: "0.01em" }}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span style={{ width: 14, height: 14, border: "2px solid #333", borderTopColor: "#6d28d9", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Please wait...
                    </span>
                  : mode === "login" ? "Sign in" : mode === "signup" ? "Get Started Free" : "Send reset link"
                }
              </button>

              {mode === "signup" && (
                <p style={{ textAlign: "center" as const, color: "#3f3f46", fontSize: "0.7rem", marginTop: "-0.3rem" }}>
                  No credit card required · Cancel anytime
                </p>
              )}
            </div>

            {/* Back to login for forgot */}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center" as const, marginTop: "1rem", display: "block", width: "100%" }}>
                ← Back to sign in
              </button>
            )}

            {/* Free plan perks */}
            {mode !== "forgot" && (
              <div style={{ marginTop: "1.5rem", padding: "1rem 1.1rem", background: "#060606", border: "1px solid #141414", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ color: "#3f3f46", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                    {mode === "signup" ? "FREE PLAN INCLUDES" : "WHAT YOU GET"}
                  </span>
                  <span style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", color: "#8b5cf6", fontSize: "0.62rem", fontWeight: 600, padding: "0.1rem 0.5rem", borderRadius: "4px" }}>No credit card required</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {(mode === "signup"
                    ? ["25 free credits to start", "Viral hooks, scripts & captions", "Hook scoring (A–F grade)", "12 Indian languages + English"]
                    : ["All your generated content", "Hook scores & analytics", "30-day content calendar", "Creator, Advertiser & Agency plans"]
                  ).map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ color: "#52525b", fontSize: "0.72rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "1.75rem", textAlign: "center" as const }}>
              <p style={{ color: "#2a2a2a", fontSize: "0.63rem", lineHeight: 1.8 }}>
                © {new Date().getFullYear()} Global Web Info Vision &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("privacy")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Privacy</button>
                &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("terms")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Terms</button>
                &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("refund")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Refund</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VIRA AI Assistant — floating widget, all screens */}
      <ViraAssistant />
    </>
  );
}