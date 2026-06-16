import { useState, useEffect } from "react";
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
  const [activeFeature, setActiveFeature] = useState(0);

  const FEATURES = [
    { icon: "⚡", title: "Viral Hook Generator", desc: "Platform-specific hooks that stop the scroll", color: "#6d28d9" },
    { icon: "📊", title: "Content Score /100", desc: "AI grades your content with line-by-line fixes", color: "#0891b2" },
    { icon: "🎬", title: "Script Lab", desc: "Generate & improve reel scripts instantly", color: "#059669" },
    { icon: "📅", title: "30-Day Calendar", desc: "Auto-plan your entire month of content", color: "#b45309" },
    { icon: "📈", title: "Real Trend Data", desc: "Live YouTube + Google trends injected", color: "#be185d" },
    { icon: "🌐", title: "30+ Languages", desc: "Hindi, Tamil, Telugu & 27 more languages", color: "#7c3aed" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(i => (i + 1) % FEATURES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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
        
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        
        .auth-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          color: #f5f5f5;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: #6d28d9;
          background: #0d0d0d;
          box-shadow: 0 0 0 3px rgba(109,40,217,0.1);
        }
        .auth-input::placeholder { color: #404040; }
        
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) { 
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(109,40,217,0.25);
        }
        .submit-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        
        .mode-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .mode-link:hover { opacity: 0.8; }
        
        .feature-item { transition: all 0.2s; cursor: default; }
        
        .marquee-track {
          display: flex;
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
        
        @media (max-width: 900px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; min-height: 100vh; }
        }
        
        .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #6d28d9;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s infinite;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", fontFamily: "'Inter', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #111", position: "relative", overflow: "hidden" }}>

          {/* Subtle grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5 }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "3rem 3.5rem" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "4rem" }}>
              <div style={{ width: 32, height: 32, background: "#6d28d9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⚡</div>
              <div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}>VCI</span>
                <span style={{ color: "#3f3f46", fontSize: "0.7rem", fontWeight: 500, marginLeft: "0.4rem", letterSpacing: "0.06em" }}>VIRAL CONTENT INTELLIGENCE</span>
              </div>
            </div>

            {/* Main headline */}
            <div style={{ marginBottom: "3rem", flex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "6px", padding: "0.25rem 0.75rem", marginBottom: "1.5rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#71717a", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.04em" }}>Used by 500+ creators & agencies</span>
              </div>

              <h1 style={{ fontSize: "clamp(2rem,3vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.25rem", color: "#fff" }}>
                Stop guessing.<br />
                <span style={{ color: "#6d28d9" }}>Start going viral.</span>
              </h1>

              <p style={{ color: "#52525b", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 420, fontWeight: 400 }}>
                Platform-specific content powered by real YouTube and Google trend data. Not templates — actual intelligence.
              </p>

              {/* Animated feature highlight */}
              <div style={{ marginTop: "2.5rem", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "1.25rem", maxWidth: 420 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>CURRENTLY ACTIVE</span>
                </div>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ display: i === activeFeature ? "flex" : "none", alignItems: "center", gap: "0.75rem", animation: "fadeIn 0.4s ease" }}>
                    <div style={{ width: 36, height: 36, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem" }}>{f.title}</div>
                      <div style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.15rem" }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.85rem" }}>
                  {FEATURES.map((_, i) => (
                    <div key={i} style={{ height: 2, flex: 1, background: i === activeFeature ? "#6d28d9" : "#1f1f1f", borderRadius: "2px", transition: "background 0.3s" }} />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.5rem" }}>
                {[
                  { num: "10x", label: "Faster" },
                  { num: "15+", label: "Platforms" },
                  { num: "30+", label: "Languages" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>{s.num}</div>
                    <div style={{ color: "#3f3f46", fontSize: "0.72rem", fontWeight: 500, marginTop: "0.15rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews marquee */}
            <div style={{ overflow: "hidden", marginBottom: "2rem" }}>
              <div style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.75rem", fontFamily: "'DM Mono', monospace" }}>WHAT CREATORS SAY</div>
              <div className="marquee-track">
                {[...allReviews, ...allReviews].map((r, i) => (
                  <div key={i} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem 1rem", minWidth: "200px", maxWidth: "200px", marginRight: "0.6rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span style={{ color: "#d4d4d8", fontWeight: 600, fontSize: "0.75rem" }}>{r.name}</span>
                      <span style={{ color: "#854d0e", fontSize: "0.6rem" }}>{"★".repeat(r.stars)}</span>
                    </div>
                    <div style={{ color: "#3f3f46", fontSize: "0.62rem", marginBottom: "0.3rem" }}>{r.role}</div>
                    <p style={{ color: "#52525b", fontSize: "0.7rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom footer */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              {[["🔒", "Secure"], ["🇮🇳", "Made in India"], ["⚡", "Instant"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.8rem" }}>{icon}</span>
                  <span style={{ color: "#3f3f46", fontSize: "0.7rem", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — AUTH FORM ── */}
        <div className="auth-right" style={{ width: 460, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 2rem", background: "#000", overflowY: "auto" }}>

          <div style={{ width: "100%", maxWidth: 380, animation: "slideUp 0.4s ease" }}>

            {/* Form header */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
              </h2>
              <p style={{ color: "#52525b", fontSize: "0.85rem", fontWeight: 400 }}>
                {mode === "login" ? "Sign in to your VCI dashboard" : mode === "signup" ? "Start creating viral content for free" : "We'll send you a reset link"}
              </p>
            </div>

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              {mode === "signup" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>First name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" className="auth-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem" }}>Last name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem" }}>Phone number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" />
                  </div>
                </>
              )}

              <div>
                {mode === "signup" && <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem" }}>Email address</label>}
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
              </div>

              {mode !== "forgot" && (
                <div style={{ position: "relative" }}>
                  {mode === "signup" && <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem" }}>Password</label>}
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    className="auth-input"
                    style={{ paddingRight: "3rem" }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "0.75rem", top: mode === "signup" ? "calc(50% + 0.6rem)" : "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.75rem", padding: "0.25rem" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0.65rem 0.9rem", color: "#f87171", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>⚠</span> {error}
                </div>
              )}
              {message && (
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "0.65rem 0.9rem", color: "#4ade80", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>✓</span> {message}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="submit-btn"
                style={{ background: loading ? "#0a0a0a" : "#6d28d9", color: loading ? "#52525b" : "#fff", border: loading ? "1px solid #1f1f1f" : "none", marginTop: "0.25rem" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign in →" : mode === "signup" ? "Create free account →" : "Send reset link →"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "#111" }} />
              <span style={{ color: "#2a2a2a", fontSize: "0.75rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#111" }} />
            </div>

            {/* Mode switcher */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {mode === "login" && (
                <>
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="mode-link"
                    style={{ color: "#71717a", fontSize: "0.85rem", textAlign: "center" as const, padding: "0.5rem" }}>
                    Don't have an account? <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Sign up free</span>
                  </button>
                  <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="mode-link"
                    style={{ color: "#3f3f46", fontSize: "0.78rem", textAlign: "center" as const }}>
                    Forgot your password?
                  </button>
                </>
              )}
              {mode === "signup" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                  style={{ color: "#71717a", fontSize: "0.85rem", textAlign: "center" as const, padding: "0.5rem" }}>
                  Already have an account? <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Sign in</span>
                </button>
              )}
              {mode === "forgot" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                  style={{ color: "#71717a", fontSize: "0.85rem", textAlign: "center" as const, padding: "0.5rem" }}>
                  ← Back to sign in
                </button>
              )}
            </div>

            {/* Pricing note */}
            {mode !== "forgot" && (
              <div style={{ marginTop: "2rem", padding: "1rem", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#3f3f46", fontSize: "0.7rem", fontWeight: 500 }}>Free plan includes</span>
                  <span style={{ color: "#6d28d9", fontSize: "0.7rem", fontWeight: 600 }}>No card needed</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["10 credits", "Viral hooks", "Instagram + YouTube"].map(f => (
                    <span key={f} style={{ background: "#111", border: "1px solid #1f1f1f", color: "#71717a", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.68rem" }}>✓ {f}</span>
                  ))}
                </div>
                {mode === "login" && (
                  <div style={{ marginTop: "0.6rem", color: "#3f3f46", fontSize: "0.68rem" }}>
                    Pro plans from <strong style={{ color: "#71717a" }}>₹299/month</strong> · Cancel anytime
                  </div>
                )}
              </div>
            )}

            {/* Footer links */}
            <div style={{ marginTop: "2rem", textAlign: "center" as const }}>
              <p style={{ color: "#2a2a2a", fontSize: "0.68rem" }}>
                © {new Date().getFullYear()} Global Web Info Vision
                <span style={{ margin: "0 0.4rem" }}>·</span>
                <button onClick={() => setShowLegal("privacy")} className="mode-link" style={{ color: "#3f3f46", fontSize: "0.68rem" }}>Privacy</button>
                <span style={{ margin: "0 0.4rem", color: "#1a1a1a" }}>·</span>
                <button onClick={() => setShowLegal("terms")} className="mode-link" style={{ color: "#3f3f46", fontSize: "0.68rem" }}>Terms</button>
                <span style={{ margin: "0 0.4rem", color: "#1a1a1a" }}>·</span>
                <button onClick={() => setShowLegal("refund")} className="mode-link" style={{ color: "#3f3f46", fontSize: "0.68rem" }}>Refund</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}