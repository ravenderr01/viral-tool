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
    color: "#52525b",
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
      scriptLab: false,
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
    color: "#16a34a",
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
      scriptLab: true,
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
    color: "#7c3aed",
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
      scriptLab: true,
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
    color: "#0891b2",
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
      scriptLab: false,
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
    color: "#b45309",
    credits: 400,
    type: "business",
    features: {
      niches: "All Niches including Ads & Marketing",
      platforms: "All Platforms + All Ad Platforms",
      languages: "All 30+ Languages",
      hookScore: true,
      trends: true,
      calendar: true,
      contentPack: true,
      imageAI: true,
      scriptLab: true,
      adsPlatforms: true,
      support: "Priority Support (2hr response)",
    },
  },
  {
    key: "agency",
    name: "Agency",
    price: "₹5,999",
    priceNum: 5999,
    period: "/month",
    badge: "👑 Premium",
    color: "#dc2626",
    credits: 1200,
    type: "business",
    features: {
      niches: "All Niches including Ads & Marketing",
      platforms: "All Platforms + Native Ads",
      languages: "All 30+ Languages",
      hookScore: true,
      trends: true,
      calendar: true,
      contentPack: true,
      imageAI: true,
      scriptLab: true,
      adsPlatforms: true,
      support: "Priority Support (30-min response)",
    },
  },
];

const CREDIT_WEIGHTS = [
  { feature: "⚡ Generate Content", credits: 1, color: "#7c3aed" },
  { feature: "📊 Hook Score", credits: 1, color: "#0891b2" },
  { feature: "🖼️ Image AI", credits: 2, color: "#059669" },
  { feature: "📦 Content Pack", credits: 3, color: "#b45309" },
  { feature: "🎬 Script Generate", credits: 3, color: "#dc2626" },
  { feature: "🎬 Script Improve", credits: 2, color: "#be185d" },
  { feature: "📅 30-Day Calendar", credits: 5, color: "#7c3aed" },
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
  { key: "scriptLab", label: "🎬 Script Lab", isBool: true },
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
        supabase.from("users").select("credits_remaining, credits_total")
          .eq("id", data.user.id).single()
          .then(({ data: u }) => {
            if (u) { setCredits(u.credits_remaining); setCreditsTotal(u.credits_total); }
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #000; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); }
        .upgrade-btn { transition: all 0.2s; }
        .upgrade-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

        {/* Header */}
        <div style={{ background: "#000", borderBottom: "1px solid #111", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 28, height: 28, background: "#6d28d9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>⚡</div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>VCI</span>
            <span style={{ color: "#3f3f46", fontSize: "0.75rem", fontWeight: 400 }}>/ Plans</span>
          </div>
          <button onClick={onBack} style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", color: "#71717a", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}>
            ← Dashboard
          </button>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Current Plan Status */}
          {credits !== null && creditsTotal !== null && (
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", animation: "slideUp 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: `${currentPlanData.color}18`, border: `1px solid ${currentPlanData.color}30`, borderRadius: "6px", padding: "0.3rem 0.75rem" }}>
                  <span style={{ color: currentPlanData.color, fontWeight: 700, fontSize: "0.8rem" }}>{currentPlanData.name}</span>
                </div>
                <span style={{ color: "#52525b", fontSize: "0.78rem" }}>Current plan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ color: "#3f3f46", fontSize: "0.68rem" }}>Credits remaining</span>
                    <span style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, marginLeft: "1rem" }}>{credits} / {creditsTotal}</span>
                  </div>
                  <div style={{ width: 180, height: 4, background: "#111", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${creditsPercent}%`, height: "100%", background: creditsPercent > 50 ? "#16a34a" : creditsPercent > 20 ? "#ca8a04" : "#dc2626", borderRadius: "2px", transition: "width 0.5s" }} />
                  </div>
                </div>
                <span style={{ color: creditsPercent > 50 ? "#16a34a" : creditsPercent > 20 ? "#ca8a04" : "#dc2626", fontWeight: 700, fontSize: "0.82rem" }}>{creditsPercent}%</span>
              </div>
            </div>
          )}

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem", animation: "slideUp 0.4s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "6px", padding: "0.25rem 0.75rem", marginBottom: "1.25rem" }}>
              <span style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.04em", fontFamily: "'DM Mono', monospace" }}>CHOOSE YOUR PLAN</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 0.75rem", color: "#fff" }}>
              Simple, transparent pricing
            </h1>
            <p style={{ color: "#52525b", fontSize: "0.95rem", maxWidth: 440, margin: "0 auto 1.75rem", lineHeight: 1.7 }}>
              Credits reset every month. No hidden charges. Cancel anytime.
            </p>

            {/* Toggle buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.25rem" }}>
                <button onClick={() => setCategory("creator")}
                  style={{ padding: "0.45rem 1.25rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", background: category === "creator" ? "#6d28d9" : "transparent", color: category === "creator" ? "#fff" : "#52525b", transition: "all 0.2s" }}>
                  🎨 Creator
                </button>
                <button onClick={() => setCategory("business")}
                  style={{ padding: "0.45rem 1.25rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", background: category === "business" ? "#6d28d9" : "transparent", color: category === "business" ? "#fff" : "#52525b", transition: "all 0.2s" }}>
                  📢 Business
                </button>
              </div>
              <div style={{ display: "inline-flex", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.25rem" }}>
                <button onClick={() => setView("cards")}
                  style={{ padding: "0.45rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", fontFamily: "'Inter', sans-serif", background: view === "cards" ? "#1a1a1a" : "transparent", color: view === "cards" ? "#fff" : "#52525b", transition: "all 0.2s" }}>
                  Cards
                </button>
                <button onClick={() => setView("compare")}
                  style={{ padding: "0.45rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", fontFamily: "'Inter', sans-serif", background: view === "compare" ? "#1a1a1a" : "transparent", color: view === "compare" ? "#fff" : "#52525b", transition: "all 0.2s" }}>
                  Compare
                </button>
              </div>
            </div>
          </div>

          {/* Category label */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span style={{ color: "#3f3f46", fontSize: "0.75rem", fontWeight: 500 }}>
              {category === "creator" ? "For Instagram, YouTube & TikTok creators" : "For agencies, marketers & businesses"}
            </span>
          </div>

          {/* CARDS VIEW */}
          {view === "cards" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1rem", marginBottom: "3rem", animation: "slideUp 0.4s ease" }}>
              {displayPlans.map((plan, i) => {
                const isActive = currentPlan === plan.key;
                const isPopular = plan.badge === "🔥 Popular" || plan.badge === "⚡ Best Value";
                return (
                  <div key={plan.key} className="plan-card" style={{
                    background: isActive ? "#0a0a0a" : "#080808",
                    border: `1px solid ${isActive ? plan.color : isPopular ? "#1f1f1f" : "#111"}`,
                    borderRadius: "16px",
                    padding: "1.75rem",
                    position: "relative",
                    animation: `slideUp ${0.3 + i * 0.08}s ease`,
                    boxShadow: isActive ? `0 0 30px ${plan.color}15` : "none",
                  }}>
                    {/* Badge */}
                    {plan.badge && (
                      <div style={{ position: "absolute", top: "-11px", left: "1.25rem", background: plan.color, color: "#fff", borderRadius: "4px", padding: "0.15rem 0.65rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        {plan.badge}
                      </div>
                    )}
                    {isActive && (
                      <div style={{ position: "absolute", top: "-11px", right: "1.25rem", background: "#16a34a", color: "#fff", borderRadius: "4px", padding: "0.15rem 0.65rem", fontSize: "0.62rem", fontWeight: 700 }}>✓ Active</div>
                    )}

                    {/* Plan name */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#d4d4d8", margin: "0 0 0.75rem", letterSpacing: "-0.01em" }}>{plan.name}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{plan.price}</span>
                        <span style={{ color: "#52525b", fontSize: "0.8rem" }}>{plan.period}</span>
                      </div>
                    </div>

                    {/* Credits */}
                    <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#71717a", fontSize: "0.75rem" }}>Credits / month</span>
                      <span style={{ color: plan.color, fontWeight: 700, fontSize: "0.85rem" }}>⚡ {plan.credits}</span>
                    </div>

                    {/* Features list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.5rem" }}>
                      {[
                        { show: true, text: plan.features.niches },
                        { show: true, text: plan.features.platforms },
                        { show: true, text: plan.features.languages },
                        { show: plan.features.hookScore, text: "Hook Score Analyzer" },
                        { show: plan.features.trends, text: "AI Trend Intelligence" },
                        { show: plan.features.calendar, text: "30-Day Content Calendar (5 cr)" },
                        { show: plan.features.contentPack, text: "Content Pack (3 cr)" },
                        { show: plan.features.imageAI, text: "Image AI (2 cr)" },
                        { show: plan.features.scriptLab, text: "Script Lab — Generate & Improve" },
                        { show: plan.features.adsPlatforms, text: "Google & Meta Ads Copy" },
                        { show: true, text: plan.features.support },
                      ].filter(f => f.show).map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ color: "#16a34a", fontSize: "0.7rem", flexShrink: 0, marginTop: "0.15rem" }}>✓</span>
                          <span style={{ color: "#71717a", fontSize: "0.78rem", lineHeight: 1.5 }}>{f.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {plan.key === "free" ? (
                      <button onClick={onBack} className="upgrade-btn" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: "#52525b", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                        {currentPlan === "free" ? "Current plan" : "Downgrade"}
                      </button>
                    ) : isActive ? (
                      <button style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: `${plan.color}12`, border: `1px solid ${plan.color}30`, color: plan.color, fontWeight: 700, fontSize: "0.82rem", cursor: "default", fontFamily: "'Inter', sans-serif" }}>
                        ✓ Current plan
                      </button>
                    ) : (
                      <button onClick={() => onUpgrade(plan.key)} className="upgrade-btn" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: plan.color, border: "none", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                        Get {plan.name} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* COMPARE VIEW */}
          {view === "compare" && (
            <div style={{ overflowX: "auto", marginBottom: "3rem", animation: "slideUp 0.4s ease" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "left", color: "#3f3f46", fontSize: "0.7rem", fontWeight: 600, borderBottom: "1px solid #111", width: 160, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>FEATURE</th>
                    {displayPlans.map(plan => (
                      <th key={plan.key} style={{ padding: "0.85rem 0.75rem", textAlign: "center", borderBottom: `1px solid ${currentPlan === plan.key ? plan.color : "#111"}` }}>
                        <div style={{ color: currentPlan === plan.key ? plan.color : "#d4d4d8", fontWeight: 700, fontSize: "0.85rem" }}>{plan.name}</div>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>{plan.price}<span style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 400 }}>{plan.period}</span></div>
                        {currentPlan === plan.key && <div style={{ fontSize: "0.58rem", color: "#16a34a", fontWeight: 700, marginTop: "0.2rem" }}>✓ ACTIVE</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => (
                    <tr key={row.key} style={{ background: i % 2 === 0 ? "#050505" : "transparent" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "#71717a", fontSize: "0.78rem", fontWeight: 500, borderBottom: "1px solid #0a0a0a" }}>{row.label}</td>
                      {displayPlans.map(plan => {
                        const val = row.isCredits ? plan.credits : (plan.features as any)[row.key];
                        return (
                          <td key={plan.key} style={{ padding: "0.75rem", textAlign: "center", borderBottom: "1px solid #0a0a0a" }}>
                            {row.isBool ? (
                              <span style={{ color: val ? "#16a34a" : "#1f1f1f", fontSize: "0.9rem" }}>{val ? "✓" : "✗"}</span>
                            ) : row.isCredits ? (
                              <span style={{ color: plan.color, fontWeight: 700, fontSize: "0.82rem" }}>⚡ {val}</span>
                            ) : (
                              <span style={{ color: "#52525b", fontSize: "0.72rem" }}>{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "1rem" }}></td>
                    {displayPlans.map(plan => (
                      <td key={plan.key} style={{ padding: "0.75rem", textAlign: "center" }}>
                        {plan.key === "free" ? (
                          <button onClick={onBack} style={{ padding: "0.55rem 1rem", borderRadius: "6px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: "#52525b", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", width: "100%", fontFamily: "'Inter', sans-serif" }}>
                            {currentPlan === "free" ? "Current" : "Downgrade"}
                          </button>
                        ) : currentPlan === plan.key ? (
                          <button style={{ padding: "0.55rem 1rem", borderRadius: "6px", background: `${plan.color}12`, border: `1px solid ${plan.color}30`, color: plan.color, fontWeight: 700, fontSize: "0.75rem", cursor: "default", width: "100%", fontFamily: "'Inter', sans-serif" }}>✓ Active</button>
                        ) : (
                          <button onClick={() => onUpgrade(plan.key)} className="upgrade-btn" style={{ padding: "0.55rem 1rem", borderRadius: "6px", background: plan.color, border: "none", color: "#fff", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", width: "100%", fontFamily: "'Inter', sans-serif" }}>
                            Get {plan.name}
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* How Credits Work */}
          <div style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: "14px", padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>HOW CREDITS WORK</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.6rem" }}>
              {CREDIT_WEIGHTS.map((cw, i) => (
                <div key={i} style={{ background: "#050505", border: "1px solid #111", borderRadius: "8px", padding: "0.75rem", textAlign: "center" }}>
                  <div style={{ color: "#71717a", fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.4rem" }}>{cw.feature}</div>
                  <div style={{ color: cw.color, fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}>{cw.credits} cr</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "1rem", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>FAQ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                ["What are credits?", "1 credit = 1 basic generation. Advanced features use more credits. Credits reset on the 1st of every month."],
                ["Creator vs Business plans?", "Creator plans are for social media content creators. Business plans include advertising platforms (Google Ads, Meta Ads) for agencies and marketers."],
                ["What is Script Lab?", "Script Lab lets you generate complete word-for-word reel scripts (15-90 sec) and improve existing scripts with Before/After comparison. Available from Starter plan."],
                ["How do I upgrade?", "Click 'Get [Plan]', complete payment, and your plan activates within 2 hours. Contact support on WhatsApp for instant activation."],
                ["Can I switch plans?", "Yes! Upgrade or downgrade anytime. Contact support on WhatsApp for plan changes."],
                ["Is there a refund?", "Yes — 24-hour money-back guarantee. No questions asked. Contact support immediately after purchase."],
              ].map(([q, a], i) => (
                <div key={i} style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: "10px", padding: "1rem 1.25rem" }}>
                  <p style={{ margin: "0 0 0.35rem", fontWeight: 600, color: "#d4d4d8", fontSize: "0.82rem" }}>{q}</p>
                  <p style={{ margin: 0, color: "#52525b", fontSize: "0.78rem", lineHeight: 1.7 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "1.5rem", borderTop: "1px solid #0a0a0a", marginTop: "2rem" }}>
          <p style={{ color: "#2a2a2a", fontSize: "0.7rem", margin: 0 }}>
            © {new Date().getFullYear()} Global Web Info Vision — VCI · Payments secured by Razorpay
          </p>
        </div>
      </div>
    </>
  );
}