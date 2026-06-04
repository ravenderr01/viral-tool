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
      else setMessage("✅ Account bana! Ab login karo.");
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

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh", background: "#050505", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "1rem"
      }}>
        <div style={{
          background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "20px",
          padding: "2rem", maxWidth: "420px", width: "100%",
          boxShadow: "0 0 60px rgba(255,107,53,0.15)"
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "#ff6b3510", border: "1px solid #ff6b3525",
              borderRadius: "20px", padding: "0.2rem 0.85rem", marginBottom: "0.75rem"
            }}>
              <span style={{ fontSize: "0.65rem", color: "#ff6b35", fontWeight: 700, letterSpacing: "0.08em" }}>⚡ AI-POWERED VIRAL ENGINE</span>
            </div>
            <h1 style={{
              fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800,
              margin: "0 0 0.3rem",
              background: "linear-gradient(135deg,#ffffff 10%, #ff9a6c 50%, #ff6b35 90%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Viral Content Intelligence
            </h1>
            <p style={{ color: "#444", fontSize: "0.8rem", margin: 0 }}>
              {mode === "login" ? "Welcome back! Login karo" : mode === "signup" ? "Naya account banao — free hai!" : "Password reset karo"}
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "10px",
                padding: "0.8rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none",
                fontFamily: "'DM Sans',sans-serif", transition: "border 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#ff6b35"}
              onBlur={e => e.target.style.borderColor = "#1e1e1e"}
            />

            {mode !== "forgot" && (
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{
                  background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "10px",
                  padding: "0.8rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none",
                  fontFamily: "'DM Sans',sans-serif", transition: "border 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#1e1e1e"}
              />
            )}

            {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            {message && <p style={{ color: "#22c55e", fontSize: "0.8rem", margin: 0 }}>{message}</p>}

            <button onClick={handleSubmit} disabled={loading}
              style={{
                padding: "0.85rem", borderRadius: "10px",
                background: loading ? "#111" : "linear-gradient(135deg,#ff6b35,#f7c59f)",
                border: "none", color: loading ? "#333" : "#000",
                fontWeight: 800, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
              }}>
              {loading ? "⚡ Loading..." : mode === "login" ? "🚀 Login" : mode === "signup" ? "✨ Account Banao" : "📧 Reset Email Bhejo"}
            </button>
          </div>

          {/* Mode switcher */}
          <div style={{ marginTop: "1.25rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                  style={{ background: "none", border: "none", color: "#ff6b35", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                  Account nahi hai? Sign up karo →
                </button>
                <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                  style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "0.78rem" }}>
                  Password bhool gaye?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{ background: "none", border: "none", color: "#ff6b35", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                Pehle se account hai? Login karo →
              </button>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{ background: "none", border: "none", color: "#ff6b35", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                ← Wapas login pe jao
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}