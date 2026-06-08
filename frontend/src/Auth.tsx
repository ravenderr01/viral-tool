import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [reviews, setReviews] = useState<any[]>([]);
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

      // Profile save karo
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
        input::placeholder { color: #6b7280; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        background: "#06040f", position: "relative", overflow: "hidden",
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

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: mode === "signup" ? 520 : 460,
          position: "relative", zIndex: 1,
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

          {/* Reviews — signup only */}
          {mode === "signup" && (
            <div style={{ marginBottom: "1rem" }}>
              {[
                { name: "Rahul S.", role: "Instagram Creator 🇮🇳", review: "Generated 20 viral hooks in 10 seconds. My reel hit 100K views!", stars: 5 },
                { name: "Priya M.", role: "Digital Marketer", review: "The Google Ads copy saved me hours of work. Highly recommend VCI!", stars: 5 },
                { name: "Arjun K.", role: "YouTuber 🎬", review: "30-day content calendar changed my posting strategy completely.", stars: 5 },
                { name: "Sneha R.", role: "Fitness Coach", review: "Hook Score feature helped me understand why my content wasn't performing. Game changer!", stars: 5 },
                { name: "Vikram T.", role: "Agency Owner", review: "We use VCI for all our clients. Saves 5+ hours per week on content creation.", stars: 5 },
                { name: "Ananya D.", role: "Lifestyle Blogger", review: "Instagram captions are so good! My engagement doubled in 2 weeks.", stars: 5 },
                { name: "Mohit G.", role: "E-commerce Owner", review: "Meta Ads copy feature is incredible. Our ROAS improved by 3x!", stars: 5 },
                { name: "Deepak N.", role: "LinkedIn Consultant", review: "Best tool for LinkedIn content. Professional hooks every single time.", stars: 5 },
              ].map((r, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.5rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                    <div>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{r.name}</span>
                      <span style={{ color: "#555", fontSize: "0.7rem", marginLeft: "0.4rem" }}>· {r.role}</span>
                    </div>
                    <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>{"★".repeat(r.stars)}</span>
                  </div>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.5, fontStyle: "italic" }}>"{r.review}"</p>
                </div>
              ))}

              {/* Real user reviews */}
              {reviews.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ color: "#444", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 0.5rem" }}>⭐ FROM OUR USERS</p>
                  {reviews.map((r, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.5rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                    <div>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{r.name}</span>
                      <span style={{ color: "#555", fontSize: "0.7rem", marginLeft: "0.4rem" }}>· {r.role}</span>
                    </div>
                    <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>{"★".repeat(r.stars)}</span>
                  </div>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.5, fontStyle: "italic" }}>"{r.review}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

            {/* Signup extra fields */}
            {mode === "signup" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>FIRST NAME *</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="John" className="auth-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>LAST NAME *</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Doe" className="auth-input" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>PHONE NUMBER *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210" className="auth-input" style={inputStyle} />
                </div>
              </>
            )}

            <div>
              {mode === "signup" && <label style={{ color: "#6b7280", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>EMAIL ADDRESS *</label>}
              <input type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input" style={inputStyle} />
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
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                  style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                    fontFamily: "'DM Sans',sans-serif"
                  }}>
                  Don't have an account? <strong>Sign Up Free →</strong>
                </button>
                <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                  style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif" }}>
                  Forgot your password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: "10px", color: "#c084fc", cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem",
                  fontFamily: "'DM Sans',sans-serif"
                }}>
                Already have an account? <strong>Login →</strong>
              </button>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
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
    </>
  );
}