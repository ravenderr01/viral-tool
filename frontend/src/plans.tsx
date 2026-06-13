import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const CREATOR_PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    priceNum: 0,
    period: "",
    badge: "",
    color: "#6b7280",
    credits: 10,
    type: "creator",
    features: {
      niches: "2 Niches (Fitness, Business)",
      platforms: "Instagram + YouTube only",
      languages: "English only",
      hookScore: false,
      trends: false,
      calendar: false,
      contentPack: false,
      imageAI: false,
      adsPlatforms: false,
      support: "Community Support",
    },
  },
  {
    key: "starter",
    name: "Starter",
    price: "₹299",
    priceNum: 299,
    period: "/month",
    badge: "🔥 Popular",
    color: "#22c55e",
    credits: 100,
    type: "creator",
    features: {
      niches: "All Niches (except Ads & Marketing)",
      platforms: "All Social Media Platforms",
      languages: "Hindi + English",
      hookScore: true,
      trends: false,
      calendar: false,
      contentPack: false,
      imageAI: false,
      adsPlatforms: false,
      support: "Email Support",
    },
  },
  {
    key: "pro_creator",
    name: "Pro Creator",
    price: "₹999",
    priceNum: 999,
    period: "/month",
    badge: "⚡ Best Value",
    color: "#a855f7",
    credits: 400,
    type: "creator",
    features: {
      niches: "All Niches (except Ads & Marketing)",
      platforms: "All Social Media Platforms",
      languages: "Hindi + English",
      hookScore: true,
      trends: true,
      calendar: true,
      contentPack: true,
      imageAI: true,
      adsPlatforms: false,
      support: "Priority Email Support",
    },
  },
];

const BUSINESS_PLANS = [
  {
    key: "growth",
    name: "Growth",
    price: "₹799",
    priceNum: 799,
    period: "/month",
    badge: "📈 Business",
    color: "#06b6d4",
    credits: 150,
    type: "business",
    features: {
      niches: "All Niches including Ads & Marketing",
      platforms: "All Platforms + Google/Meta Ads",
      languages: "Hindi + English",
      hookScore: true,
      trends: true,
      calendar: false,
      contentPack: false,
      imageAI: false,
      adsPlatforms: true,
      support: "Priority Email Support",
    },
  },
  {
    key: "business",
    name: "Business",
    price: "₹1,999",
    priceNum: 1999,
    period: "/month",
    badge: "💎 Pro",
    color: "#f59e0b",
    credits: 400,
    type: "business",
    features: {
      niches: "All Niches including Ads & Marketing",
      platforms: "All Platforms + All Ad Platforms",
      languages: "All 15 Languages",
      hookScore: true,
      trends: true,
      calendar: true,
      contentPack: true,
      imageAI: true,
      adsPlatforms: true,
      support: "Priority Support (2hr response)",
    },
  },
  {
    key: "agency",
    name: "Agency",
    price: "₹4,999",
    priceNum: 4999,
    period: "/month",
    badge: "👑 Premium",
    color: "#ef4444",
    credits: 1000,
    type: "business",
    features: {
      niches: "All Niches including Ads & Marketing",
      platforms: "All Platforms + Native Ads",
      languages: "All 15 Languages",
      hookScore: true,
      trends: true,
      calendar: true,
      contentPack: true,
      imageAI: true,
      adsPlatforms: true,
      support: "Priority Support (30-min response)",
    },
  },
];

const CREDIT_WEIGHTS = [
  { feature: "⚡ Generate Content", credits: 1 },
  { feature: "📊 Hook Score Analyzer", credits: 1 },
  { feature: "🖼️ Image AI", credits: 2 },
  { feature: "📦 Content Pack", credits: 3 },
  { feature: "📅 30-Day Calendar", credits: 5 },
];

const FEATURE_ROWS = [
  { key: "niches", label: "🎯 Niches" },
  { key: "platforms", label: "📱 Platforms" },
  { key: "languages", label: "🌐 Languages" },
  { key: "credits", label: "⚡ Credits/Month", isCredits: true },
  { key: "hookScore", label: "📊 Hook Score", isBool: true },
  { key: "trends", label: "📈 AI Trends", isBool: true },
  { key: "calendar", label: "📅 Content Calendar", isBool: true },
  { key: "contentPack", label: "📦 Content Pack", isBool: true },
  { key: "imageAI", label: "🖼️ Image AI", isBool: true },
  { key: "adsPlatforms", label: "📢 Google/Meta Ads", isBool: true },
  { key: "support", label: "💬 Support" },
];

export default function Plans({ onBack, onUpgrade, currentPlan }: {
  onBack: () => void;
  onUpgrade: (plan: string) => void;
  currentPlan: string;
}) {
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsTotal, setCreditsTotal] = useState<number | null>(null);
  const [view, setView] = useState<"cards" | "compare">("cards");
  const [category, setCategory] = useState<"creator" | "business">("creator");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("users").select("credits_remaining, credits_total, plan_expiry")
          .eq("id", data.user.id).single()
          .then(({ data: u }) => {
            if (u) {
              setCredits(u.credits_remaining);
              setCreditsTotal(u.credits_total);
            }
          });
      }
    });
  }, []);

  const allPlans = [...CREATOR_PLANS, ...BUSINESS_PLANS];
  const currentPlanData = allPlans.find(p => p.key === currentPlan) || CREATOR_PLANS[0];
  const creditsPercent = creditsTotal && credits !== null ? Math.round((credits / creditsTotal) * 100) : 100;
  const displayPlans = category === "creator" ? CREATOR_PLANS : BUSINESS_PLANS;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        .plan-card { transition: all 0.3s; }
        .plan-card:hover { transform: translateY(-6px); }
        .upgrade-btn { transition: all 0.3s; }
        .upgrade-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Header */}
        <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(139,92,246,0.15)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "10px", padding: "0.4rem 0.7rem", fontSize: "1rem" }}>⚡</div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI — Viral Content Intelligence</span>
          </div>
          <button onClick={onBack} style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>← Back to Dashboard</button>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem", position: "relative", zIndex: 1 }}>

          {/* Current Plan Status */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${currentPlanData.color}40`, borderRadius: "16px", padding: "1.25rem 1.75rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", animation: "slideUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: `${currentPlanData.color}20`, border: `1px solid ${currentPlanData.color}50`, borderRadius: "10px", padding: "0.5rem 0.9rem" }}>
                <span style={{ color: currentPlanData.color, fontWeight: 800, fontSize: "0.85rem", fontFamily: "'Outfit',sans-serif" }}>{currentPlanData.name} Plan</span>
              </div>
              <span style={{ color: "#555", fontSize: "0.78rem" }}>
                Type: <strong style={{ color: currentPlanData.type === "creator" ? "#a855f7" : "#06b6d4" }}>{currentPlanData.type === "creator" ? "🎨 Creator" : "📢 Business"}</strong>
              </span>
            </div>
            {credits !== null && creditsTotal !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#6b7280", fontSize: "0.72rem" }}>Credits Remaining</span>
                    <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>{credits} / {creditsTotal}</span>
                  </div>
                  <div style={{ width: 200, height: 6, background: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${creditsPercent}%`, height: "100%", background: creditsPercent > 50 ? "#22c55e" : creditsPercent > 20 ? "#f59e0b" : "#ef4444", borderRadius: "3px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
                <span style={{ color: creditsPercent > 50 ? "#22c55e" : creditsPercent > 20 ? "#f59e0b" : "#ef4444", fontWeight: 800, fontSize: "0.85rem" }}>{creditsPercent}%</span>
              </div>
            )}
          </div>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "2rem", animation: "slideUp 0.4s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>💎 CHOOSE YOUR PLAN</span>
            </div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, margin: "0 0 0.75rem", background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Upgrade & Create More
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
              Credits reset every month. No hidden charges. Cancel anytime.
            </p>

            {/* Category Toggle */}
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "0.3rem", marginBottom: "1rem" }}>
              <button onClick={() => setCategory("creator")} style={{ padding: "0.5rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif", background: category === "creator" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: category === "creator" ? "#fff" : "#6b7280", transition: "all 0.2s" }}>
                🎨 Creator
              </button>
              <button onClick={() => setCategory("business")} style={{ padding: "0.5rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif", background: category === "business" ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "transparent", color: category === "business" ? "#fff" : "#6b7280", transition: "all 0.2s" }}>
                📢 Business
              </button>
            </div>

            {/* View Toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "10px", padding: "0.25rem" }}>
                <button onClick={() => setView("cards")} style={{ padding: "0.4rem 1.2rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif", background: view === "cards" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: view === "cards" ? "#fff" : "#6b7280" }}>
                  🃏 Cards
                </button>
                <button onClick={() => setView("compare")} style={{ padding: "0.4rem 1.2rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", fontFamily: "'DM Sans',sans-serif", background: view === "compare" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: view === "compare" ? "#fff" : "#6b7280" }}>
                  📊 Compare
                </button>
              </div>
            </div>
          </div>

          {/* Category Label */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span style={{ background: category === "creator" ? "rgba(168,85,247,0.1)" : "rgba(6,182,212,0.1)", border: `1px solid ${category === "creator" ? "rgba(168,85,247,0.3)" : "rgba(6,182,212,0.3)"}`, color: category === "creator" ? "#a855f7" : "#06b6d4", borderRadius: "20px", padding: "0.3rem 1rem", fontSize: "0.78rem", fontWeight: 700 }}>
              {category === "creator" ? "🎨 For Instagram, YouTube, TikTok Creators" : "📢 For Agencies, Marketers & Businesses"}
            </span>
          </div>

          {/* CARDS VIEW */}
          {view === "cards" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem", animation: "slideUp 0.5s ease" }}>
              {displayPlans.map((plan, i) => (
                <div key={plan.key} className="plan-card" style={{
                  background: currentPlan === plan.key ? `${plan.color}08` : "#0c0c0c",
                  border: `${currentPlan === plan.key ? "2" : "1"}px solid ${currentPlan === plan.key ? plan.color : "#1a1a1a"}`,
                  borderRadius: "20px", padding: "1.75rem",
                  position: "relative",
                  boxShadow: currentPlan === plan.key ? `0 0 40px ${plan.color}20` : "none",
                  animation: `slideUp ${0.3 + i * 0.1}s ease`
                }}>
                  {plan.badge && (
                    <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: "20px", padding: "0.2rem 0.85rem", fontSize: "0.7rem", fontWeight: 800, whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif" }}>
                      {plan.badge}
                    </div>
                  )}
                  {currentPlan === plan.key && (
                    <div style={{ position: "absolute", top: "-13px", right: "1rem", background: "#22c55e", color: "#000", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.65rem", fontWeight: 800 }}>✓ Active</div>
                  )}

                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.4rem" }}>{plan.name}</h3>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: "2.2rem", fontWeight: 900, color: plan.color }}>{plan.price}</span>
                    <span style={{ color: "#555", fontSize: "0.8rem" }}>{plan.period}</span>
                  </div>

                  {/* Credits badge */}
                  <div style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}35`, borderRadius: "8px", padding: "0.4rem 0.75rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: plan.color, fontSize: "0.82rem", fontWeight: 800 }}>⚡ {plan.credits} credits/month</span>
                  </div>

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {[
                      plan.features.niches,
                      plan.features.platforms,
                      plan.features.languages,
                      plan.features.hookScore ? "✓ Hook Score Analyzer" : null,
                      plan.features.trends ? "✓ AI Trends" : null,
                      plan.features.calendar ? "✓ Content Calendar (5 credits)" : null,
                      plan.features.contentPack ? "✓ Content Pack (3 credits)" : null,
                      plan.features.imageAI ? "✓ Image AI (2 credits)" : null,
                      plan.features.adsPlatforms ? "✓ Google/Meta Ads" : null,
                      plan.features.support,
                    ].filter(Boolean).map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                        <span style={{ color: "#22c55e", fontSize: "0.75rem", flexShrink: 0, marginTop: "0.1rem" }}>✓</span>
                        <span style={{ color: "#aaa", fontSize: "0.78rem", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {plan.key === "free" ? (
                    <button onClick={onBack} style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: "#111", border: "1px solid #222", color: "#555", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                      {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                    </button>
                  ) : currentPlan === plan.key ? (
                    <button style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: `${plan.color}18`, border: `1px solid ${plan.color}`, color: plan.color, fontWeight: 700, fontSize: "0.85rem", cursor: "default", fontFamily: "'Outfit',sans-serif" }}>
                      ✓ Active Plan
                    </button>
                  ) : (
                    <button onClick={() => onUpgrade(plan.key)} className="upgrade-btn" style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`, border: "none", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: `0 6px 20px ${plan.color}35` }}>
                      Get {plan.name} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* COMPARE VIEW */}
          {view === "compare" && (
            <div style={{ overflowX: "auto", marginBottom: "3rem", animation: "slideUp 0.5s ease" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#6b7280", fontSize: "0.78rem", fontWeight: 700, borderBottom: "1px solid #1a1a1a", width: 180 }}>FEATURES</th>
                    {displayPlans.map(plan => (
                      <th key={plan.key} style={{ padding: "1rem 0.75rem", textAlign: "center", borderBottom: `2px solid ${currentPlan === plan.key ? plan.color : "#1a1a1a"}` }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.95rem", color: plan.color }}>{plan.name}</div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#fff" }}>{plan.price}<span style={{ color: "#555", fontSize: "0.7rem", fontWeight: 400 }}>{plan.period}</span></div>
                        {currentPlan === plan.key && <div style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 800 }}>✓ ACTIVE</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => (
                    <tr key={row.key} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#aaa", fontSize: "0.8rem", fontWeight: 600, borderBottom: "1px solid #111" }}>{row.label}</td>
                      {displayPlans.map(plan => {
                        const val = row.isCredits ? plan.credits : (plan.features as any)[row.key];
                        return (
                          <td key={plan.key} style={{ padding: "0.85rem 0.75rem", textAlign: "center", borderBottom: "1px solid #111" }}>
                            {row.isBool ? (
                              <span style={{ color: val ? "#22c55e" : "#2a2a2a", fontSize: "1rem" }}>{val ? "✓" : "✗"}</span>
                            ) : row.isCredits ? (
                              <span style={{ color: plan.color, fontWeight: 800, fontSize: "0.85rem" }}>⚡ {val}</span>
                            ) : (
                              <span style={{ color: "#aaa", fontSize: "0.75rem" }}>{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "1rem" }}></td>
                    {displayPlans.map(plan => (
                      <td key={plan.key} style={{ padding: "1rem 0.75rem", textAlign: "center" }}>
                        {plan.key === "free" ? (
                          <button onClick={onBack} style={{ padding: "0.6rem 1rem", borderRadius: "8px", background: "#111", border: "1px solid #222", color: "#555", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", width: "100%" }}>
                            {currentPlan === "free" ? "Current" : "Downgrade"}
                          </button>
                        ) : currentPlan === plan.key ? (
                          <button style={{ padding: "0.6rem 1rem", borderRadius: "8px", background: `${plan.color}18`, border: `1px solid ${plan.color}`, color: plan.color, fontWeight: 700, fontSize: "0.78rem", cursor: "default", width: "100%" }}>✓ Active</button>
                        ) : (
                          <button onClick={() => onUpgrade(plan.key)} className="upgrade-btn" style={{ padding: "0.6rem 1rem", borderRadius: "8px", background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`, border: "none", color: "#fff", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", width: "100%", boxShadow: `0 4px 15px ${plan.color}30` }}>
                            Get {plan.name} →
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Credit Weight Info */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff", margin: "0 0 1rem", textAlign: "center" }}>⚡ How Credits Work</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {CREDIT_WEIGHTS.map((cw, i) => (
                <div key={i} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem", textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>{cw.feature}</div>
                  <div style={{ color: "#a855f7", fontWeight: 800, fontSize: "1.1rem", fontFamily: "'Outfit',sans-serif" }}>{cw.credits} credit{cw.credits > 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.2rem", margin: "0 0 1.25rem", color: "#fff", textAlign: "center" }}>❓ Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                ["What are credits?", "1 credit = 1 basic generation. Advanced features use more: Content Pack = 3 credits, Calendar = 5 credits, Image AI = 2 credits. Credits reset on 1st of every month."],
                ["Creator vs Business plans?", "Creator plans are for social media content creators (Instagram, YouTube, TikTok). Business plans include advertising platforms (Google Ads, Meta Ads) for agencies and marketers."],
                ["How do I upgrade?", "Click 'Get [Plan]', complete payment, and your plan activates. Contact support on WhatsApp for instant activation."],
                ["Can I switch plans?", "Yes! Upgrade or downgrade anytime. Contact support on WhatsApp for plan changes."],
                ["What payment methods?", "UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking — all via Razorpay."],
                ["Is there a refund?", "Yes! 24-hour money-back guarantee. No questions asked. Contact support immediately after purchase."],
              ].map(([q, a], i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "12px", padding: "1rem 1.25rem" }}>
                  <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: "#fff", fontSize: "0.85rem" }}>Q: {q}</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "1.5rem", borderTop: "1px solid rgba(139,92,246,0.1)", marginTop: "2rem" }}>
          <p style={{ color: "#333", fontSize: "0.72rem", margin: 0 }}>
            © {new Date().getFullYear()} Global Web Info Vision — VCI. All Rights Reserved. · Payments secured by Razorpay
          </p>
        </div>
      </div>
    </>
  );
}