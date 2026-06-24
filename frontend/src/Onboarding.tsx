import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Onboarding({ userId, onComplete }: { userId: string; onComplete: (type: string) => void }) {
  const [selected, setSelected] = useState<"creator" | "business" | "agency" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase.from("users").update({ user_type: selected }).eq("id", userId);
    onComplete(selected);
    setLoading(false);
  };

  const CARDS = [
    {
      id: "creator" as const,
      emoji: "🎨",
      title: "Content Creator",
      desc: "I create content for Instagram, YouTube, TikTok & more",
      features: ["📸 Instagram Reels", "▶️ YouTube Videos", "🎵 TikTok Content"],
      color: "#a855f7",
      glow: "rgba(168,85,247,0.2)",
      bg: "rgba(168,85,247,0.1)",
    },
    {
      id: "business" as const,
      emoji: "📢",
      title: "Advertiser / Business",
      desc: "I run ads and need ad copy — headlines, descriptions, keywords",
      features: ["📢 Google Ads", "📘 Meta Ads", "🎯 Ad Campaigns"],
      color: "#06b6d4",
      glow: "rgba(6,182,212,0.2)",
      bg: "rgba(6,182,212,0.1)",
    },
    {
      id: "agency" as const,
      emoji: "👑",
      title: "Agency",
      desc: "I manage multiple clients — both content and advertising",
      features: ["🎨 All Content Tools", "📢 All Ad Tools", "🚀 Full Access"],
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.2)",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  const continueColor = selected === "creator" ? "#a855f7" : selected === "business" ? "#06b6d4" : selected === "agency" ? "#f59e0b" : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        .card-hover { transition: all 0.25s; cursor: pointer; }
        @media (max-width: 640px) { .three-grid { grid-template-columns: 1fr !important; } }
        .card-hover:hover { transform: translateY(-4px); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden", padding: "1rem" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", bottom: "-15%", right: "-5%", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div style={{ maxWidth: 760, width: "100%", position: "relative", zIndex: 1, animation: "slideUp 0.5s ease" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "14px", padding: "0.6rem 0.9rem", fontSize: "1.4rem" }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI — Viral Content Intelligence</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>👋 WELCOME TO VCI</span>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.5rem)", margin: "0 0 0.75rem", lineHeight: 1.1, background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              How will you use VCI?
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: 0, lineHeight: 1.7 }}>
              This determines which tools and platforms you'll see
            </p>
          </div>

          {/* 3 Cards */}
          <div className="three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
            {CARDS.map(card => (
              <div key={card.id} className="card-hover" onClick={() => setSelected(card.id)}
                style={{ background: selected === card.id ? card.bg : "rgba(255,255,255,0.02)", border: `2px solid ${selected === card.id ? card.color : "rgba(255,255,255,0.06)"}`, borderRadius: "20px", padding: "1.75rem 1.25rem", textAlign: "center", boxShadow: selected === card.id ? `0 0 40px ${card.glow}` : "none" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{card.emoji}</div>
                <h2 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: "0 0 0.5rem" }}>{card.title}</h2>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 1rem" }}>{card.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {card.features.map((f, i) => (
                    <span key={i} style={{ color: selected === card.id ? card.color : "#444", fontSize: "0.72rem" }}>{f}</span>
                  ))}
                </div>
                {selected === card.id && <div style={{ marginTop: "0.75rem", background: card.bg, border: `1px solid ${card.color}66`, borderRadius: "8px", padding: "0.3rem", color: card.color, fontSize: "0.72rem", fontWeight: 700 }}>✓ Selected</div>}
              </div>
            ))}
          </div>

          {/* Continue */}
          <button onClick={handleContinue} disabled={!selected || loading}
            style={{ width: "100%", padding: "1rem", borderRadius: "14px", background: !selected ? "rgba(139,92,246,0.15)" : `linear-gradient(135deg, ${continueColor}, ${continueColor}cc)`, border: "none", color: !selected ? "#555" : "#fff", fontWeight: 800, fontSize: "1rem", cursor: !selected || loading ? "not-allowed" : "pointer", boxShadow: selected ? `0 8px 32px ${continueColor}40` : "none", transition: "all 0.3s" }}>
            {loading ? "⚡ Setting up your workspace..." : selected ? `Continue as ${CARDS.find(c => c.id === selected)?.title} →` : "Select your role to continue"}
          </button>

          <p style={{ textAlign: "center", color: "#333", fontSize: "0.7rem", marginTop: "1rem" }}>You can change this anytime from your profile settings</p>
        </div>
      </div>
    </>
  );
}