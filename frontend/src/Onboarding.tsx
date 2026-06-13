import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Onboarding({ userId, onComplete }: { userId: string; onComplete: (type: string) => void }) {
  const [selected, setSelected] = useState<"creator" | "business" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase.from("users").update({ user_type: selected }).eq("id", userId);
    onComplete(selected);
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .card-hover { transition: all 0.3s; }
        .card-hover:hover { transform: translateY(-4px); }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#06040f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden",
        padding: "1rem"
      }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", bottom: "-15%", right: "-5%", background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div style={{ maxWidth: 680, width: "100%", position: "relative", zIndex: 1, animation: "slideUp 0.5s ease" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "14px", padding: "0.6rem 0.9rem", fontSize: "1.4rem" }}>⚡</div>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.3rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI</span>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>👋 WELCOME TO VCI</span>
            </div>

            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontSize: "clamp(1.8rem,4vw,2.5rem)",
              fontWeight: 900, margin: "0 0 0.75rem", lineHeight: 1.1,
              background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              How will you use VCI?
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: 0, lineHeight: 1.7 }}>
              Tell us about yourself so we can personalize your experience
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>

            {/* Creator Card */}
            <div className="card-hover" onClick={() => setSelected("creator")}
              style={{
                background: selected === "creator" ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)",
                border: `2px solid ${selected === "creator" ? "#a855f7" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "20px", padding: "2rem 1.5rem",
                cursor: "pointer", textAlign: "center",
                boxShadow: selected === "creator" ? "0 0 40px rgba(168,85,247,0.2)" : "none"
              }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎨</div>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: "0 0 0.75rem" }}>
                Content Creator
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.82rem", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
                I create content for social media platforms like Instagram, YouTube, TikTok, and more.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {["📸 Instagram & Reels", "▶️ YouTube Videos", "🎵 TikTok Content", "📌 Pinterest Pins", "🐦 Twitter/X Threads"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                    <span style={{ color: selected === "creator" ? "#a855f7" : "#555", fontSize: "0.78rem" }}>{f}</span>
                  </div>
                ))}
              </div>
              {selected === "creator" && (
                <div style={{ marginTop: "1rem", background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", borderRadius: "8px", padding: "0.4rem", color: "#a855f7", fontSize: "0.78rem", fontWeight: 700 }}>
                  ✓ Selected
                </div>
              )}
            </div>

            {/* Business Card */}
            <div className="card-hover" onClick={() => setSelected("business")}
              style={{
                background: selected === "business" ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.02)",
                border: `2px solid ${selected === "business" ? "#06b6d4" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "20px", padding: "2rem 1.5rem",
                cursor: "pointer", textAlign: "center",
                boxShadow: selected === "business" ? "0 0 40px rgba(6,182,212,0.2)" : "none"
              }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📢</div>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: "0 0 0.75rem" }}>
                Business / Marketer
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.82rem", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
                I run ads, manage marketing campaigns, or work at an agency handling multiple clients.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {["📢 Google Ads", "📘 Meta Ads (Facebook/Instagram)", "🎯 Native Ads", "📊 Marketing Campaigns", "🏢 Agency Management"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                    <span style={{ color: selected === "business" ? "#06b6d4" : "#555", fontSize: "0.78rem" }}>{f}</span>
                  </div>
                ))}
              </div>
              {selected === "business" && (
                <div style={{ marginTop: "1rem", background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "8px", padding: "0.4rem", color: "#06b6d4", fontSize: "0.78rem", fontWeight: 700 }}>
                  ✓ Selected
                </div>
              )}
            </div>
          </div>

          {/* Both option */}
          <div className="card-hover" onClick={() => setSelected("business")}
            style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px", padding: "1rem 1.5rem",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem",
              marginBottom: "2rem"
            }}>
            <span style={{ fontSize: "1.5rem" }}>🚀</span>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>I do both — Content + Marketing</p>
              <p style={{ margin: 0, color: "#555", fontSize: "0.75rem" }}>Choose Business plan for full access to all features</p>
            </div>
          </div>

          {/* Continue Button */}
          <button onClick={handleContinue} disabled={!selected || loading}
            style={{
              width: "100%", padding: "1rem", borderRadius: "14px",
              background: !selected ? "rgba(168,85,247,0.2)" : selected === "creator"
                ? "linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)"
                : "linear-gradient(135deg,#06b6d4,#0891b2)",
              border: "none", color: !selected ? "#555" : "#fff",
              fontWeight: 800, fontSize: "1rem",
              cursor: !selected || loading ? "not-allowed" : "pointer",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: selected ? "0 8px 32px rgba(168,85,247,0.4)" : "none",
              transition: "all 0.3s"
            }}>
            {loading ? "⚡ Setting up your workspace..." : selected ? `Continue as ${selected === "creator" ? "🎨 Creator" : "📢 Business"} →` : "Select your role to continue"}
          </button>

          <p style={{ textAlign: "center", color: "#333", fontSize: "0.72rem", marginTop: "1rem" }}>
            You can change this anytime from your profile settings
          </p>
        </div>
      </div>
    </>
  );
}
