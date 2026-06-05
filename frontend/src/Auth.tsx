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
    { icon: "⚡", text: "20 Viral Hooks in 10 seconds" },
    { icon: "📊", text: "Hook Score Analyzer" },
    { icon: "📅", text: "30-Day Content Calendar" },
    { icon: "📦", text: "One-Click Content Pack" },
    { icon: "🌐", text: "Multi-language support" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse2 { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.05)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-30px,50px) scale(0.9)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,60px) scale(1.15)} 66%{transform:translate(70px,-30px) scale(0.85)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,40px)} }
        input::placeholder { color: #6b7280; }
        input:focus { outline: none; }
        .auth-input { transition: all 0.3s; }
        .auth-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5) !important; }
        .submit-btn { transition: all 0.3s; }
        .feature-item { animation: slideUp 0.6s ease both; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex",
        fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
        background: "#06040f"
      }}>
        {/* Animated orbs background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <div style={{
            position: "absolute", width: 600, height: 600,
            borderRadius: "50%", top: "-10%", left: "-10%",
            background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
            animation: "orb1 12s ease-in-out infinite", filter: "blur(40px)"
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%", bottom: "-10%", right: "-5%",
            background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
            animation: "orb2 15s ease-in-out infinite", filter: "blur(50px)"
          }} />
          <div style={{
            position: "absolute", width: 400, height: 400,
            borderRadius: "50%", top: "40%", left: "40%",
            background: "radial-gradient(circle, rgba(217,70,239,0.2) 0%, transparent 70%)",
            animation: "orb3 10s ease-in-out infinite", filter: "blur(60px)"
          }} />
          {/* Grid pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        {/* Left side — Features */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "3rem 4rem", position: "relative", zIndex: 1,
          display: "none" as any
        }} className="auth-left">
          <style>{`.auth-left { display: none !important; } @media(min-width:900px){ .auth-left { display: flex !important; } }`}</style>
        </div>

        {/* Full screen centered form */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "2rem", position: "relative", zIndex: 1, minHeight: "100vh", width: "100%"
        }}>
          <div style={{
            width: "100%", maxWidth: 460,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "28px",
            padding: "2.5rem",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            animation: "slideUp 0.5s ease"
          }}>
            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
              }}>
                <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Outfit',sans-serif" }}>⚡ AI-POWERED VIRAL ENGINE</span>
              </div>

              <h1 style={{
                fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 900,
                margin: "0 0 0.4rem", lineHeight: 1.1,
                background: "linear-gradient(135deg, #fff 0%, #c084fc 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                Viral Content<br />Intelligence
              </h1>
              <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                {mode === "login" ? "Welcome back! Login karo 👋" : mode === "signup" ? "Join 1000+ creators — free hai! 🚀" : "Password reset karo 🔐"}
              </p>
            </div>

            {/* Features pills — only on signup */}
            {mode === "signup" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem", justifyContent: "center" }}>
                {features.map((f, i) => (
                  <div key={i} className="feature-item" style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "20px", padding: "0.25rem 0.7rem",
                    fontSize: "0.72rem", color: "#c084fc", fontWeight: 600,
                    animationDelay: `${i * 0.08}s`
                  }}>
                    {f.icon} {f.text}
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <input type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", padding: "0.9rem 1.1rem", color: "#fff",
                  fontSize: "0.92rem", fontFamily: "'DM Sans',sans-serif", width: "100%"
                }} />

              {mode !== "forgot" && (
                <input type="password" placeholder="Password (min 6 characters)" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="auth-input"
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px", padding: "0.9rem 1.1rem", color: "#fff",
                    fontSize: "0.92rem", fontFamily: "'DM Sans',sans-serif", width: "100%"
                  }} />
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
                  letterSpacing: "0.02em",
                  boxShadow: loading ? "none" : "0 8px 32px rgba(139,92,246,0.4)"
                }}>
                {loading ? "⚡ Loading..." : mode === "login" ? "🚀 Login Karo" : mode === "signup" ? "✨ Free Account Banao" : "📧 Reset Email Bhejo"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "#374151", fontSize: "0.75rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Mode switcher */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {mode === "login" && (<>
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                  style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s"
                  }}>
                  Don't have an Account ? <strong>Free Sign Up karo →</strong>