import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Legal from "./Legal";

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

// Animated Demo Component
function LiveDemo() {
  const [phase, setPhase] = useState<"typing" | "selecting" | "generating" | "results" | "views">("typing");
  const [typedText, setTypedText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [visibleHooks, setVisibleHooks] = useState<number>(0);
  const [viewCount, setViewCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const keyword = "weight loss";
  const platform = "Instagram";
  const hooks = [
    "I lost 10kg without going to the gym once 🔥",
    "Nobody tells you this about weight loss...",
    "POV: You finally found what actually works 💀",
    "Stop doing this if you want to lose weight →",
    "The 5-minute morning habit that changed everything",
  ];

  useEffect(() => {
    let timeout: any;

    // Phase 1: Typing keyword
    if (phase === "typing") {
      setTypedText("");
      setSelectedPlatform("");
      setVisibleHooks(0);
      setViewCount(0);
      setIsGenerating(false);

      let i = 0;
      const typeInterval = setInterval(() => {
        if (i <= keyword.length) {
          setTypedText(keyword.slice(0, i));
          i++;
        } else {
          clearInterval(typeInterval);
          timeout = setTimeout(() => setPhase("selecting"), 600);
        }
      }, 80);
      return () => { clearInterval(typeInterval); clearTimeout(timeout); };
    }

    // Phase 2: Platform selecting
    if (phase === "selecting") {
      timeout = setTimeout(() => {
        setSelectedPlatform(platform);
        setTimeout(() => setPhase("generating"), 700);
      }, 400);
      return () => clearTimeout(timeout);
    }

    // Phase 3: Generating
    if (phase === "generating") {
      setIsGenerating(true);
      timeout = setTimeout(() => {
        setIsGenerating(false);
        setPhase("results");
      }, 1800);
      return () => clearTimeout(timeout);
    }

    // Phase 4: Results appearing
    if (phase === "results") {
      let count = 0;
      const hookInterval = setInterval(() => {
        count++;
        setVisibleHooks(count);
        if (count >= hooks.length) {
          clearInterval(hookInterval);
          timeout = setTimeout(() => setPhase("views"), 800);
        }
      }, 350);
      return () => { clearInterval(hookInterval); clearTimeout(timeout); };
    }

    // Phase 5: View counter
    if (phase === "views") {
      let count = 0;
      const target = 47200;
      const increment = target / 60;
      const viewInterval = setInterval(() => {
        count += increment;
        if (count >= target) {
          count = target;
          clearInterval(viewInterval);
          timeout = setTimeout(() => setPhase("typing"), 2000);
        }
        setViewCount(Math.floor(count));
      }, 30);
      return () => { clearInterval(viewInterval); clearTimeout(timeout); };
    }
  }, [phase]);

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden", width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>

      {/* Window chrome */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.7 }} />
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontFamily: "monospace" }}>getvci.com</span>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
      </div>

      {/* App content */}
      <div style={{ padding: "1.25rem" }}>

        {/* VCI badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
          <div style={{ width: 22, height: 22, background: "#6d28d9", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>⚡</div>
          <span style={{ color: "#71717a", fontSize: "0.7rem", fontWeight: 600 }}>VCI — Viral Content Intelligence</span>
        </div>

        {/* Platform selector */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ color: "#3f3f46", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.35rem", fontFamily: "monospace" }}>PLATFORM</div>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {["Instagram", "YouTube", "TikTok", "LinkedIn"].map(p => (
              <div key={p} style={{
                background: selectedPlatform === p ? "rgba(109,40,217,0.15)" : "#0d0d0d",
                border: `1px solid ${selectedPlatform === p ? "#6d28d9" : "#1a1a1a"}`,
                color: selectedPlatform === p ? "#8b5cf6" : "#3f3f46",
                padding: "0.2rem 0.55rem", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 600,
                transition: "all 0.3s",
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Keyword input */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ color: "#3f3f46", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.35rem", fontFamily: "monospace" }}>KEYWORD</div>
          <div style={{ background: "#0d0d0d", border: `1px solid ${phase === "typing" ? "#6d28d9" : "#1a1a1a"}`, borderRadius: "8px", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border 0.3s" }}>
            <span style={{ color: typedText ? "#f1f5f9" : "#3f3f46", fontSize: "0.82rem" }}>
              {typedText || "Enter keyword..."}
            </span>
            {phase === "typing" && (
              <span style={{ display: "inline-block", width: 2, height: "1em", background: "#6d28d9", animation: "blink 1s infinite", verticalAlign: "text-bottom" }} />
            )}
          </div>
        </div>

        {/* Generate button */}
        <button style={{
          width: "100%", padding: "0.65rem", borderRadius: "8px", border: "none",
          background: isGenerating ? "#111" : "linear-gradient(135deg,#6d28d9,#7c3aed)",
          color: isGenerating ? "#52525b" : "#fff",
          fontWeight: 700, fontSize: "0.82rem", cursor: "default",
          marginBottom: "1rem", transition: "all 0.3s",
          fontFamily: "'Inter', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
        }}>
          {isGenerating ? (
            <>
              <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #3f3f46", borderTopColor: "#6d28d9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Generating...
            </>
          ) : phase === "typing" || phase === "selecting" ? "⚡ Generate Viral Content" : "⚡ Generated!"}
        </button>

        {/* Results */}
        {(phase === "results" || phase === "views") && (
          <div>
            <div style={{ color: "#3f3f46", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.5rem", fontFamily: "monospace" }}>
              VIRAL HOOKS FOR INSTAGRAM
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {hooks.slice(0, visibleHooks).map((hook, i) => (
                <div key={i} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "7px", padding: "0.5rem 0.65rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", animation: "slideUp 0.3s ease" }}>
                  <span style={{ color: "#d4d4d8", fontSize: "0.72rem", lineHeight: 1.4 }}>{hook}</span>
                  <button style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", color: "#8b5cf6", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.55rem", cursor: "default", fontWeight: 700, flexShrink: 0 }}>Copy</button>
                </div>
              ))}
            </div>

            {/* View counter */}
            {phase === "views" && viewCount > 0 && (
              <div style={{ marginTop: "0.85rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "slideUp 0.4s ease" }}>
                <div>
                  <div style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>{formatViews(viewCount)} views</div>
                  <div style={{ color: "#3f3f46", fontSize: "0.62rem", marginTop: "0.1rem" }}>in 24 hours 🔥</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#22c55e", fontSize: "0.65rem", fontWeight: 700 }}>↑ 2,340%</div>
                  <div style={{ color: "#3f3f46", fontSize: "0.6rem" }}>vs last post</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("users").update({ first_name: firstName, last_name: lastName, phone }).eq("id", data.user.id);
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
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
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
          font-family: 'Inter', sans-serif; transition: all 0.2s; letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(109,40,217,0.25); }
        .submit-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .mode-link { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .mode-link:hover { opacity: 0.75; }
        .marquee-track { display: flex; animation: marquee 40s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
        @media (max-width: 900px) { .auth-left { display: none !important; } .auth-right { width: 100% !important; min-height: 100vh; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", fontFamily: "'Inter', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #0f0f0f", position: "relative", overflow: "hidden", background: "#000" }}>

          {/* Subtle grid background */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#0f0f0f 1px, transparent 1px), linear-gradient(90deg, #0f0f0f 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.6 }} />

          {/* Subtle purple glow top */}
          <div style={{ position: "absolute", top: -100, left: "30%", width: 300, height: 300, background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "2.5rem 3rem" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "3rem" }}>
              <div style={{ width: 30, height: 30, background: "#6d28d9", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>⚡</div>
              <div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>VCI</span>
                <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 500, marginLeft: "0.4rem", letterSpacing: "0.06em" }}>VIRAL CONTENT INTELLIGENCE</span>
              </div>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "0.2rem 0.7rem", marginBottom: "1.25rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.04em" }}>500+ creators & agencies use VCI</span>
              </div>

              <h1 style={{ fontSize: "clamp(1.8rem,2.8vw,2.6rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1rem", color: "#fff" }}>
                Stop guessing.<br />
                <span style={{ color: "#6d28d9" }}>Start going viral.</span>
              </h1>

              <p style={{ color: "#71717a", fontSize: "0.9rem", lineHeight: 1.8, maxWidth: 380, fontWeight: 400 }}>
                Platform-specific viral content powered by real YouTube and Google trend data. Not templates — actual intelligence.
              </p>
            </div>

            {/* LIVE DEMO */}
            <div style={{ marginBottom: "2rem", animation: "float 4s ease-in-out infinite" }}>
              <div style={{ color: "#52525b", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.75rem", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                LIVE DEMO
              </div>
              <LiveDemo />
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
              {[
                { num: "10x", label: "Faster than manual" },
                { num: "15+", label: "Platforms" },
                { num: "30+", label: "Languages" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em" }}>{s.num}</div>
                  <div style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 500, marginTop: "0.1rem" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Reviews marquee */}
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#3f3f46", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.65rem", fontFamily: "'DM Mono', monospace" }}>CREATOR REVIEWS</div>
              <div className="marquee-track">
                {[...allReviews, ...allReviews].map((r, i) => (
                  <div key={i} style={{ background: "#080808", border: "1px solid #111", borderRadius: "8px", padding: "0.65rem 0.85rem", minWidth: "190px", maxWidth: "190px", marginRight: "0.5rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#d4d4d8", fontWeight: 600, fontSize: "0.7rem" }}>{r.name}</span>
                      <span style={{ color: "#713f12", fontSize: "0.55rem" }}>{"★".repeat(r.stars)}</span>
                    </div>
                    <div style={{ color: "#2a2a2a", fontSize: "0.58rem", marginBottom: "0.25rem" }}>{r.role}</div>
                    <p style={{ color: "#3f3f46", fontSize: "0.65rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right" style={{ width: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 2.5rem", background: "#000000", overflowY: "auto", borderLeft: "1px solid #111" }}>

          <div style={{ width: "100%", maxWidth: 360, animation: "slideUp 0.4s ease" }}>

            {/* Form header */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
              </h2>
              <p style={{ color: "#52525b", fontSize: "0.82rem", fontWeight: 400 }}>
                {mode === "login" ? "Sign in to your VCI dashboard" : mode === "signup" ? "Start creating viral content for free" : "We'll send you a reset link"}
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>

              {mode === "signup" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.35rem" }}>First name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" className="auth-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.35rem" }}>Last name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.35rem" }}>Phone number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" />
                  </div>
                </>
              )}

              <div>
                {mode === "signup" && <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.35rem" }}>Email address</label>}
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
              </div>

              {mode !== "forgot" && (
                <div style={{ position: "relative" }}>
                  {mode === "signup" && <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.35rem" }}>Password</label>}
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    className="auth-input"
                    style={{ paddingRight: "3.5rem" }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "0.75rem", top: mode === "signup" ? "calc(50% + 0.75rem)" : "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.7rem", padding: "0.25rem", fontFamily: "'Inter', sans-serif" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "8px", padding: "0.6rem 0.85rem", color: "#f87171", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  ⚠ {error}
                </div>
              )}
              {message && (
                <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "8px", padding: "0.6rem 0.85rem", color: "#4ade80", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  ✓ {message}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="submit-btn"
                style={{ background: loading ? "#0a0a0a" : "#6d28d9", color: loading ? "#52525b" : "#fff", border: loading ? "1px solid #1f1f1f" : "none", marginTop: "0.25rem" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign in →" : mode === "signup" ? "Create free account →" : "Send reset link →"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "#0f0f0f" }} />
              <span style={{ color: "#1f1f1f", fontSize: "0.72rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#0f0f0f" }} />
            </div>

            {/* Mode switcher */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {mode === "login" && (
                <>
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="mode-link"
                    style={{ color: "#71717a", fontSize: "0.82rem", textAlign: "center" as const, padding: "0.5rem" }}>
                    Don't have an account? <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Sign up free</span>
                  </button>
                  <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="mode-link"
                    style={{ color: "#2a2a2a", fontSize: "0.75rem", textAlign: "center" as const }}>
                    Forgot your password?
                  </button>
                </>
              )}
              {mode === "signup" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                  style={{ color: "#71717a", fontSize: "0.82rem", textAlign: "center" as const, padding: "0.5rem" }}>
                  Already have an account? <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Sign in</span>
                </button>
              )}
              {mode === "forgot" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                  style={{ color: "#71717a", fontSize: "0.82rem", textAlign: "center" as const, padding: "0.5rem" }}>
                  ← Back to sign in
                </button>
              )}
            </div>

            {/* Free plan info */}
            {mode !== "forgot" && (
              <div style={{ marginTop: "2rem", padding: "1rem", background: "#080808", border: "1px solid #111", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#2a2a2a", fontSize: "0.68rem", fontWeight: 500 }}>Free plan includes</span>
                  <span style={{ color: "#6d28d9", fontSize: "0.68rem", fontWeight: 600 }}>No card needed</span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {["10 credits", "Viral hooks", "Instagram + YouTube"].map(f => (
                    <span key={f} style={{ background: "#0d0d0d", border: "1px solid #111", color: "#3f3f46", padding: "0.18rem 0.55rem", borderRadius: "5px", fontSize: "0.65rem" }}>✓ {f}</span>
                  ))}
                </div>
                {mode === "login" && (
                  <div style={{ marginTop: "0.6rem", color: "#1f1f1f", fontSize: "0.65rem" }}>
                    Pro plans from <strong style={{ color: "#2a2a2a" }}>₹299/month</strong> · Cancel anytime
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "2rem", textAlign: "center" as const }}>
              <p style={{ color: "#3f3f46", fontSize: "0.65rem" }}>
                © {new Date().getFullYear()} Global Web Info Vision
                <span style={{ margin: "0 0.4rem" }}>·</span>
                <button onClick={() => setShowLegal("privacy")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.65rem" }}>Privacy</button>
                <span style={{ margin: "0 0.4rem", color: "#111" }}>·</span>
                <button onClick={() => setShowLegal("terms")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.65rem" }}>Terms</button>
                <span style={{ margin: "0 0.4rem", color: "#111" }}>·</span>
                <button onClick={() => setShowLegal("refund")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.65rem" }}>Refund</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}