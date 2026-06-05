import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("✅ Account ban gaya! Ab login karo.");
    }
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin();
    }
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("✅ Password reset email bhej diya!");
    }
    setLoading(false);
  };

  const features = [
    { icon: "⚡", text: "20 Viral Hooks instantly" },
    { icon: "📊", text: "Hook Score Analyzer" },
    { icon: "📅", text: "30-Day Calendar" },
    { icon: "📦", text: "Content Pack" },
    { icon: "🌐", text: "Multi-language" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-30px,50px) scale(0.9)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,60px) scale(1.15)} 66%{transform:translate(70px,-30px) scale(0.85)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .auth-input { transition: all 0.3s; outline: none; }
        .auth-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .submit-btn { transition: all 0.3s; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5) !important; }
        .switch-btn { transition: all 0.2s; }
        .switch-btn:hover { background: rgba(139,92,246,0.2) !important; }
        input::placeholder { color: #6b7280; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        background: "#06040f", position: "relative", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        {/* Animated background orbs */}
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

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 460, position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "28px", padding: "2.5rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          animation: "slideUp 0.5s ease"
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
              border: "1px solid rgba(139,92,246,0.35)",
              borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
            }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Outfit',sans-serif" }}>⚡ AI-POWERED VIRAL ENGINE</span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "2.1rem", fontWeight: 900,
              margin: "0 0 0.5rem", lineHeight: 1.1,
              background: "linear-gradient(135deg, #fff 0%, #c084fc 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Viral Content<br />Intelligence
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
              {mode === "login" ? "Welcome back! Login karo 👋" : mode === "signup" ? "Join 1000+ creators — free hai! 🚀" : "Password reset karo 🔐"}
            </p>
          </div>

          {/* Feature pills on signup */}
          {mode === "signup" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem", justifyContent: "center" }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "20px", padding: "0.25rem 0.7rem",
                  fontSize: "0.72rem", color: "#c084fc", fontWeight: 600
                }}>
                  {f.icon} {f.text}
                </div>
              ))}
            </div>
          )}

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input
              type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", padding: "0.9rem 1.1rem", color: "#fff",
                fontSize: "0.92rem", fontFamily: "'DM Sans',sans-serif", width: "100%"
              }}
            />
            {mode !== "forgot" && (
              <input
                type="password" placeholder="Password (min 6 characters)" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="auth-input"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", padding: "0.9rem 1.1rem", color: "#fff",
                  fontSize: "0.92rem", fontFamily: "'DM Sans',sans-serif", width: "100%"
                }}
              />
            )}

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px", padding: "0.6rem 0.9rem",
                color: "#f87171", fontSize: "0.82rem"
              }}>{error}</div>
            )}
            {message && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "8px", padding: "0.6rem 0.9rem",
                color: "#4ade80", fontSize: "0.82rem"
              }}>{message}</div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="submit-btn"
              style={{
                padding: "0.95rem", borderRadius: "12px",
                background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
                border: "none", color: loading ? "#6b7280" : "#fff",
                fontWeight: 800, fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Outfit',sans-serif",
                boxShadow: loading ? "none" : "0 8px 32px rgba(139,92,246,0.4)"
              }}>
              {loading ? "⚡ Loading..." : mode === "login" ? "🚀 Login Karo" : mode === "signup" ? "✨ Free Account Banao" : "📧 Reset Email Bhejo"}
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
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                  className="switch-btn"
                  style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                    fontFamily: "'DM Sans',sans-serif"
                  }}>
                  Account nahi hai? <strong>Free Sign Up karo →</strong>
                </button>
                <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                  style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif" }}>
                  Password bhool gaye?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                className="switch-btn"
                style={{
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                  fontFamily: "'DM Sans',sans-serif"
                }}>
                Pehle se account hai? <strong>Login karo →</strong>
              </button>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                ← Wapas login pe jao
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
    </>
  );
}