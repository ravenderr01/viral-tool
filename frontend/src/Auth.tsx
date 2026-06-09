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

function ReviewCarousel({ reviews }: { reviews: any[] }) {
  const allReviews = [...DEFAULT_REVIEWS, ...reviews];
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPos(p => (p + 1) % allReviews.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [allReviews.length]);

  return (
    <div style={{ marginBottom: "1rem", overflow: "hidden" }}>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-track { display:flex; animation: marquee 30s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div className="marquee-track">
          {[...allReviews, ...allReviews].map((r, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "10px", padding: "0.75rem 1rem",
              minWidth: "220px", maxWidth: "220px", marginRight: "0.75rem", flexShrink: 0
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.78rem" }}>{r.name}</span>
                <span style={{ color: "#f59e0b", fontSize: "0.65rem" }}>{"★".repeat(r.stars)}</span>
              </div>
              <p style={{ margin: "0 0 0.2rem", color: "#555", fontSize: "0.65rem" }}>{r.role}</p>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.72rem", lineHeight: 1.4, fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
            </div>
          ))}
        </div>
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

  useEffect(() => {
    supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");

    if (mode === "signup") {
      if (!firstName || !lastName || !phone) {
        setError("Please fill all fields.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("users").update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        }).eq("id", data.user.id);
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

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
    padding: "0.9rem 1.1rem", color: "#fff", fontSize: "0.92rem",
    fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.3s"
  };

  if (showLegal) {
    return <Legal page={showLegal} onBack={() => setShowLegal(null)} />;
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(60px,-40px)} 66%{transform:translate(-30px,50px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-50px,60px)} 66%{transform:translate(70px,-30px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .auth-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5) !important; }
        .submit-btn { transition: all 0.3s; }
        .feature-item:hover { border-color: rgba(168,85,247,0.4) !important; transform: translateX(4px); }
        .feature-item { transition: all 0.2s; }
        input::placeholder { color: #6b7280; }
        @media (max-width: 768px) { .auth-left { display: none !important; } .auth-right { max-width: 100% !important; flex: 1 !important; } }
      `}</style>

      {/* ── OUTER WRAPPER ── */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#06040f",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif"
      }}>

        {/* Background orbs */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 700, height: 700, borderRadius: "50%",
            top: "-20%", left: "-15%",
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            animation: "orb1 12s ease-in-out infinite", filter: "blur(50px)"
          }} />
          <div style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            bottom: "-15%", right: "-10%",
            background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
            animation: "orb2 15s ease-in-out infinite", filter: "blur(60px)"
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        
        {/* ── MAIN ROW (left + right side by side) ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",   /* KEY FIX — row not column */
          position: "relative",
          zIndex: 1
        }}>

          {/* ── LEFT SIDE — Features ── */}
          {mode === "login" && (
            <div className="auth-left" style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "5rem 3rem 3rem",
              overflowY: "auto"
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
                <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "12px", padding: "0.5rem 0.8rem", fontSize: "1.2rem" }}>⚡</div>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI</span>
              </div>

              {/* Headline */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{
                  fontFamily: "'Outfit',sans-serif", fontSize: "clamp(2rem,3.5vw,3rem)",
                  fontWeight: 900, margin: "0 0 1rem", lineHeight: 1.1,
                  background: "linear-gradient(135deg,#fff 0%,#c084fc 60%,#a855f7 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  Get Viral Content<br />10x Faster
                </h1>
                <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.7, maxWidth: 420 }}>
                  Stop spending hours on content creation. VCI generates platform-specific viral hooks, captions, ad copy and more — instantly.
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
                {[
                  { number: "10x", label: "Faster Content" },
                  { number: "15+", label: "Languages" },
                  { number: "9+", label: "Platforms" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg,#a855f7,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.number}</div>
                    <div style={{ color: "#555", fontSize: "0.78rem", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Features list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2.5rem" }}>
                {[
                  { icon: "🎣", title: "Viral Hook Generator", desc: "Platform-specific hooks that stop the scroll" },
                  { icon: "📊", title: "Hook Score Analyzer", desc: "AI scores your hooks & suggests improvements" },
                  { icon: "📢", title: "Google & Meta Ads Copy", desc: "Professional ad headlines & descriptions" },
                  { icon: "📅", title: "30-Day Content Calendar", desc: "Auto-plan your entire month of content" },
                  { icon: "📈", title: "AI Trend Intelligence", desc: "Google + YouTube + Instagram trends" },
                  { icon: "🌐", title: "15+ Languages", desc: "Generate content in any language" },
                ].map((f, i) => (
                  <div key={i} className="feature-item" style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)",
                    borderRadius: "10px", padding: "0.65rem 0.9rem"
                  }}>
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{f.title}</p>
                      <p style={{ margin: 0, color: "#555", fontSize: "0.72rem", marginTop: "0.1rem" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex" }}>
                  {["R","P","A","S","V"].map((l, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "2px solid #06040f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#fff", marginLeft: i > 0 ? "-8px" : 0 }}>{l}</div>
                  ))}
                </div>
                <span style={{ color: "#555", fontSize: "0.78rem" }}>Trusted by <strong style={{ color: "#a855f7" }}>500+</strong> creators & marketers</span>
              </div>
            </div>
          )}

          {/* ── RIGHT SIDE — Form ── */}
          <div className="auth-right" style={{
            flex: mode === "login" ? "0 0 480px" : 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: mode === "login" ? "5rem 2rem 2rem" : "2rem",
            background: mode === "login" ? "rgba(0,0,0,0.3)" : "transparent",
            borderLeft: mode === "login" ? "1px solid rgba(139,92,246,0.1)" : "none",
            backdropFilter: mode === "login" ? "blur(10px)" : "none",
            overflowY: "auto"
          }}>

            {/* Card */}
            <div style={{
              width: "100%", maxWidth: mode === "signup" ? 520 : 420,
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "28px", padding: "2.5rem",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              animation: "slideUp 0.5s ease",
              transition: "max-width 0.3s"
            }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                  border: "1px solid rgba(139,92,246,0.35)",
                  borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
                }}>
                  <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Outfit',sans-serif" }}>⚡ VCI — Viral Content Intelligence</span>
                </div>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 900,
                  margin: "0 0 0.5rem", lineHeight: 1.1,
                  background: "linear-gradient(135deg, #fff 0%, #c084fc 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  {mode === "signup" ? "Create Account" : mode === "login" ? "Welcome Back" : "Reset Password"}
                </h1>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                  {mode === "login" ? "Login to access your dashboard 👋" : mode === "signup" ? "Create your free account & start generating viral content ⚡" : "We'll send you a reset link 🔐"}
                </p>
              </div>

              {/* Reviews */}
              {(mode === "signup" || mode === "login") && (
                <div style={{ marginBottom: "1rem" }}>
                  <ReviewCarousel reviews={reviews} />
                </div>
              )}

              {/* Form fields */}
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
                      <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>PHONE NUMBER *</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" style={inputStyle} />
                    </div>
                  </>
                )}

                <div>
                  {mode === "signup" && <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>EMAIL ADDRESS *</label>}
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" style={inputStyle} />
                </div>

                {mode !== "forgot" && (
                  <div>
                    {mode === "signup" && <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>PASSWORD *</label>}
                    <input type="password" placeholder="Password (min 6 characters)" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      className="auth-input" style={inputStyle} />
                  </div>
                )}

                {error && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#f87171", fontSize: "0.82rem" }}>{error}</div>
                )}
                {message && (
                  <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#4ade80", fontSize: "0.82rem" }}>{message}</div>
                )}

                <button onClick={handleSubmit} disabled={loading} className="submit-btn" style={{
                  padding: "0.95rem", borderRadius: "12px",
                  background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
                  border: "none", color: loading ? "#6b7280" : "#fff",
                  fontWeight: 800, fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: loading ? "none" : "0 8px 32px rgba(139,92,246,0.4)"
                }}>
                  {loading ? "⚡ Loading..." : mode === "login" ? "🚀 Login" : mode === "signup" ? "✨ Create Free Account" : "📧 Send Reset Email"}
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
                    <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{
                      background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                      borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                      fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                      fontFamily: "'DM Sans',sans-serif"
                    }}>
                      Don't have an account? <strong>Sign Up Free →</strong>
                    </button>
                    <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif" }}>
                      Forgot your password?
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                    fontFamily: "'DM Sans',sans-serif"
                  }}>
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
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.5rem" }}>
                {[["🔒", "Secure"], ["⚡", "Fast"], ["🆓", "Free Trial"]].map(([icon, label]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem" }}>{icon}</div>
                    <div style={{ fontSize: "0.65rem", color: "#4b5563", fontWeight: 600, marginTop: "0.2rem" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {mode === "login" && (
          <div style={{
            textAlign: "center", padding: "1rem",
            borderTop: "1px solid rgba(139,92,246,0.1)",
            position: "relative", zIndex: 1
          }}>
            <p style={{ color: "#6b7280", fontSize: "0.72rem", margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
              Designed & Developed by{" "}
              <span style={{ color: "#a855f7", fontWeight: 700 }}>Global Web Info Vision</span>
              {" "}© {new Date().getFullYear()} All Rights Reserved.{" "}
              <span style={{ margin: "0 0.3rem", color: "#4b5563" }}>|</span>
              <button onClick={() => setShowLegal("privacy")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Privacy Policy</button>
              <span style={{ margin: "0 0.3rem", color: "#4b5563" }}>·</span>
              <button onClick={() => setShowLegal("terms")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Terms & Conditions</button>
              <span style={{ margin: "0 0.3rem", color: "#4b5563" }}>·</span>
              <button onClick={() => setShowLegal("refund")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif" }}>Refund Policy</button>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
