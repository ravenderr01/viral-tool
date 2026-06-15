import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Legal from "./Legal";

const DEFAULT_REVIEWS = [
  { name: "Rahul S.", role: "Instagram Creator", review: "Generated 20 viral hooks in 10 seconds. My reel hit 100K views!", stars: 5 },
  { name: "Priya M.", role: "Digital Marketer", review: "The Google Ads copy saved me hours. Highly recommend VCI!", stars: 5 },
  { name: "Arjun K.", role: "YouTuber", review: "30-day calendar changed my posting strategy completely.", stars: 5 },
  { name: "Sneha R.", role: "Fitness Coach", review: "Hook Score feature helped me understand why content wasn't performing!", stars: 5 },
  { name: "Vikram T.", role: "Agency Owner", review: "We use VCI for all clients. Saves 5+ hours per week!", stars: 5 },
  { name: "Ananya D.", role: "Lifestyle Blogger", review: "Instagram captions doubled my engagement in 2 weeks.", stars: 5 },
  { name: "Mohit G.", role: "E-commerce Owner", review: "Meta Ads copy feature is incredible. ROAS improved by 3x!", stars: 5 },
  { name: "Deepak N.", role: "LinkedIn Consultant", review: "Best tool for LinkedIn content. Professional hooks every time.", stars: 5 },
];

function ReviewMarquee({ reviews }: { reviews: any[] }) {
  const all = [...DEFAULT_REVIEWS, ...reviews];
  return (
    <div style={{ overflow: "hidden", position: "relative", marginBottom: "1.5rem" }}>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee { display:flex; animation:marquee 35s linear infinite; width:max-content; }
        .marquee:hover { animation-play-state:paused; }
      `}</style>
      <div className="marquee">
        {[...all, ...all].map((r, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "12px", padding: "0.75rem 1rem", minWidth: "220px", maxWidth: "220px", marginRight: "0.75rem", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.78rem" }}>{r.name}</span>
              <span style={{ color: "#f59e0b", fontSize: "0.65rem" }}>{"★".repeat(r.stars)}</span>
            </div>
            <p style={{ margin: "0 0 0.2rem", color: "#555", fontSize: "0.65rem" }}>{r.role}</p>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.72rem", lineHeight: 1.4, fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
          </div>
        ))}
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
  const [wordIndex, setWordIndex] = useState(0);

  const rotatingWords = ["Viral", "Engaging", "Powerful", "Converting", "Trending"];

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(i => (i + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      if (!firstName || !lastName || !phone) { setError("Please fill all fields."); setLoading(false); return; }
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
      else setMessage("✅ Password reset email sent!");
    }
    setLoading(false);
  };

  if (showLegal) return <Legal page={showLegal} onBack={() => setShowLegal(null)} />;

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", padding: "0.9rem 1.1rem", color: "#fff", fontSize: "0.92rem",
    fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.3s",
    boxSizing: "border-box",
  };

  const FEATURES = [
    { emoji: "🎣", title: "Viral Hook Generator", desc: "Stop-scroll hooks for every platform" },
    { emoji: "📊", title: "Hook Score Analyzer", desc: "AI rates & rewrites your hooks instantly" },
    { emoji: "📅", title: "30-Day Content Calendar", desc: "Auto-plan your entire month" },
    { emoji: "📢", title: "Google & Meta Ads", desc: "High-converting ad copy in seconds" },
    { emoji: "📈", title: "AI Trend Intelligence", desc: "Real YouTube + Google trends data" },
    { emoji: "🖼️", title: "Image AI", desc: "Upload image → get viral content" },
    { emoji: "🌐", title: "30+ Languages", desc: "Hindi, Tamil, Telugu & 27 more" },
    { emoji: "📦", title: "Content Pack", desc: "40+ pieces of content in one click" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06040f; }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,-40px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,60px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes wordFlip { 0%{opacity:0;transform:translateY(10px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .auth-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .submit-btn { transition: all 0.3s; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5) !important; }
        .feature-pill:hover { border-color: rgba(168,85,247,0.5) !important; transform: translateX(4px); background: rgba(168,85,247,0.08) !important; }
        .feature-pill { transition: all 0.2s; }
        @media (max-width: 768px) { .auth-split { flex-direction: column !important; } .auth-left { display: none !important; } .auth-right { min-height: 100vh; padding: 1.5rem !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", top: "-25%", left: "-15%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", animation: "orb1 14s ease-in-out infinite", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", bottom: "-20%", right: "-10%", background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)", animation: "orb2 18s ease-in-out infinite", filter: "blur(70px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="auth-split" style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>

          {/* ── LEFT SIDE ── */}
          <div className="auth-left" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 3rem 3rem 4rem", overflowY: "auto" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3.5rem" }}>
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "14px", padding: "0.6rem 0.9rem", fontSize: "1.3rem", boxShadow: "0 8px 24px rgba(139,92,246,0.4)" }}>⚡</div>
              <div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.2rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI</div>
                <div style={{ color: "#555", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em" }}>VIRAL CONTENT INTELLIGENCE</div>
              </div>
            </div>

            {/* Hero Headline */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1.25rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#a855f7", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em" }}>TRUSTED BY 500+ CREATORS & AGENCIES</span>
              </div>

              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(2rem,3.5vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "0.75rem" }}>
                <span style={{ background: "linear-gradient(135deg,#fff,#e2d9f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stop Guessing.</span>
                <br />
                <span style={{ background: "linear-gradient(135deg,#a855f7,#c084fc,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start Going Viral.</span>
              </h1>

              <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.75, maxWidth: 440 }}>
                Your competitors are already using AI to create viral content. VCI gives you <strong style={{ color: "#a855f7" }}>platform-specific hooks, captions & ad copy</strong> in seconds — not hours.
              </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
              {[
                { number: "10x", label: "Faster Content", color: "#a855f7" },
                { number: "30+", label: "Languages", color: "#22c55e" },
                { number: "15+", label: "Platforms", color: "#06b6d4" },
                { number: "40+", label: "Content Pieces", color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{s.number}</div>
                  <div style={{ color: "#4b5563", fontSize: "0.72rem", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "2.5rem" }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-pill" style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "10px", padding: "0.6rem 0.8rem", cursor: "default" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{f.emoji}</span>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}>{f.title}</div>
                    <div style={{ color: "#4b5563", fontSize: "0.65rem" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why VCI */}
            <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "14px", padding: "1.25rem", marginBottom: "2rem" }}>
              <p style={{ color: "#a855f7", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.75rem" }}>💡 WHY TOP CREATORS CHOOSE VCI</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  "Real YouTube + Google Trends data — not made up content",
                  "Platform-specific — Instagram hooks ≠ LinkedIn hooks",
                  "Native Indian languages — Hindi, Tamil, Telugu & more",
                  "Image AI — upload any photo, get viral content instantly",
                ].map((point, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ color: "#22c55e", fontSize: "0.8rem", flexShrink: 0, marginTop: "0.1rem" }}>✓</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust avatars */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex" }}>
                {["R","P","A","S","V","M","D"].map((l, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${i*40+240},70%,50%), hsl(${i*40+270},70%,60%))`, border: "2px solid #06040f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#fff", marginLeft: i > 0 ? "-10px" : 0 }}>{l}</div>
                ))}
              </div>
              <div>
                <div style={{ color: "#f59e0b", fontSize: "0.7rem" }}>★★★★★</div>
                <div style={{ color: "#6b7280", fontSize: "0.7rem" }}>Loved by <strong style={{ color: "#a855f7" }}>500+</strong> creators</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE — Auth Form ── */}
          <div className="auth-right" style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", background: "rgba(0,0,0,0.4)", borderLeft: "1px solid rgba(139,92,246,0.1)", backdropFilter: "blur(20px)", overflowY: "auto" }}>

            <div style={{ width: "100%", maxWidth: 420, animation: "slideUp 0.5s ease" }}>

              {/* Form Card */}
              <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "28px", padding: "2.25rem", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>

                {/* Form Header */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(168,85,247,0.1))", border: "1px solid rgba(139,92,246,0.35)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>⚡ VCI — Viral Content Intelligence</span>
                  </div>
                  <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.75rem", fontWeight: 900, margin: "0 0 0.4rem", background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {mode === "signup" ? "Create Account" : mode === "login" ? "Welcome Back" : "Reset Password"}
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                    {mode === "login" ? "Login to access your dashboard 👋" : mode === "signup" ? "Start creating viral content for free ⚡" : "We'll send you a reset link 🔐"}
                  </p>
                </div>

                {/* Reviews Marquee — only on login */}
                {mode === "login" && <ReviewMarquee reviews={reviews} />}

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {mode === "signup" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>FIRST NAME *</label>
                          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="auth-input" style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>LAST NAME *</label>
                          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="auth-input" style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>PHONE *</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" style={inputStyle} />
                      </div>
                    </>
                  )}

                  <div>
                    {mode === "signup" && <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>EMAIL *</label>}
                    <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" style={inputStyle} />
                  </div>

                  {mode !== "forgot" && (
                    <div>
                      {mode === "signup" && <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>PASSWORD *</label>}
                      <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} className="auth-input" style={inputStyle} />
                    </div>
                  )}

                  {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#f87171", fontSize: "0.82rem" }}>{error}</div>}
                  {message && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#4ade80", fontSize: "0.82rem" }}>{message}</div>}

                  <button onClick={handleSubmit} disabled={loading} className="submit-btn" style={{ padding: "0.95rem", borderRadius: "12px", background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)", border: "none", color: loading ? "#6b7280" : "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: loading ? "none" : "0 8px 32px rgba(139,92,246,0.4)" }}>
                    {loading ? "⚡ Loading..." : mode === "login" ? "🚀 Login to Dashboard" : mode === "signup" ? "✨ Start Free — No Card Needed" : "📧 Send Reset Email"}
                  </button>
                </div>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                  <span style={{ color: "#374151", fontSize: "0.75rem" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Mode switcher */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {mode === "login" && (
                    <>
                      <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "10px", color: "#c084fc", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem", fontFamily: "'DM Sans',sans-serif" }}>
                        New here? <strong>Create Free Account →</strong>
                      </button>
                      <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif" }}>
                        Forgot your password?
                      </button>
                    </>
                  )}
                  {mode === "signup" && (
                    <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "10px", color: "#c084fc", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem", fontFamily: "'DM Sans',sans-serif" }}>
                      Already have an account? <strong>Login →</strong>
                    </button>
                  )}
                  {mode === "forgot" && (
                    <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                      ← Back to Login
                    </button>
                  )}
                </div>

                {/* Trust badges */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[["🔒", "Secure"], ["⚡", "Instant"], ["🆓", "Free Trial"], ["🇮🇳", "Made in India"]].map(([icon, label]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1rem" }}>{icon}</div>
                      <div style={{ fontSize: "0.6rem", color: "#4b5563", fontWeight: 600, marginTop: "0.2rem" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing hint */}
              {mode === "login" && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <p style={{ color: "#374151", fontSize: "0.72rem" }}>
                    Plans start at <strong style={{ color: "#a855f7" }}>₹299/month</strong> · Cancel anytime · No hidden fees
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "1rem", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <p style={{ color: "#374151", fontSize: "0.72rem", margin: 0 }}>
            © {new Date().getFullYear()} Global Web Info Vision — VCI. All Rights Reserved.
            <span style={{ margin: "0 0.5rem" }}>·</span>
            <button onClick={() => setShowLegal("privacy")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.72rem" }}>Privacy</button>
            <span style={{ margin: "0 0.3rem", color: "#1f2937" }}>·</span>
            <button onClick={() => setShowLegal("terms")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.72rem" }}>Terms</button>
            <span style={{ margin: "0 0.3rem", color: "#1f2937" }}>·</span>
            <button onClick={() => setShowLegal("refund")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.72rem" }}>Refund</button>
          </p>
        </div>
      </div>
    </>
  );
}