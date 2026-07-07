import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const CREATOR_PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    priceNum: 0,
    priceUSD: 0,
    period: "",
    badge: "",
    color: "#6b7280",
    credits: 25,
    type: "creator",
    features: [
      "⚡ Viral Content Generator",
      "📊 Hook Score Analyzer",
      "📋 Caption & Hashtag Generator",
      "🔍 Niche Intelligence — Always Free",
      "📈 Live Trends Feed — Always Free",
      "30+ Languages",
      "Community Support",
    ],
    locked: [
      "Script Lab, Calendar, Content Pack",
      "Image AI, Repurpose, Competitor",
      "All Advertiser Tools",
    ],
  },
  {
    key: "creator_starter",
    name: "Creator Starter",
    price: "₹299",
    priceNum: 299.99,
    priceUSD: 9,
    period: "/month",
    badge: "🔥 Popular",
    color: "#22c55e",
    credits: 120,
    type: "creator",
    features: [
      "Everything in Free",
      "🎬 Script Lab — Script + Thumbnail + Voiceover",
      "🎛️ Mix Studio — Professional Audio Ducking",
      "📅 30-Day Content Calendar",
      "📦 Content Pack (50+ pieces)",
      "🖼️ Image AI",
      "All Social Platforms",
      "Email Support",
    ],
    locked: [
      "Repurpose Engine",
      "Competitor Analyzer",
      "All Advertiser Tools",
    ],
  },
  {
    key: "creator_pro",
    name: "Creator Pro",
    price: "₹999",
    priceNum: 999.99,
    priceUSD: 29,
    period: "/month",
    badge: "⚡ Best Value",
    color: "#a855f7",
    credits: 550,
    type: "creator",
    features: [
      "Everything in Creator Starter",
      "🔄 Auto-Repurpose Engine (8 platforms)",
      "🕵️ Competitor Hook Analyzer",
      "550 credits — 4× more than Starter",
      "Priority Email Support",
    ],
    locked: [
      "ROI Calculator",
      "A/B Ad Copy Generator",
      "Landing Page Copy",
    ],
  },
];

const BUSINESS_PLANS = [
  {
    key: "advertiser",
    name: "Advertiser",
    price: "₹1,999",
    priceNum: 1999.99,
    priceUSD: 49,
    period: "/month",
    badge: "📢 Advertiser Exclusive",
    color: "#06b6d4",
    credits: 1100,
    type: "business",
    features: [
      "Everything in Creator Pro",
      "📊 Ad ROI Calculator",
      "🧪 A/B Ad Copy Generator",
      "🖥️ Landing Page Copy Generator",
      "Google Ads + Meta Ads platforms",
      "1,100 credits — 2× Creator Pro",
      "Priority Email Support",
    ],
    locked: [],
  },
];

const AGENCY_PLANS = [
  {
    key: "agency",
    name: "Agency",
    price: "₹4,999",
    priceNum: 4999.99,
    priceUSD: 99,
    period: "/month",
    badge: "👑 All Access",
    color: "#f59e0b",
    credits: 2800,
    type: "agency",
    features: [
      "All Creator + Advertiser Tools",
      "2,800 credits — unlimited workflow",
      "Multiple clients, all platforms",
      "ROI Calculator, A/B Ads, Landing Page",
      "Script Lab, Repurpose, Competitor",
      "Priority Support (30-min response)",
    ],
    locked: [],
  },
];

const CREDIT_WEIGHTS = [
  { feature: "⚡ Generate Content",       credits: 1 },
  { feature: "📊 Hook Score Analyzer",    credits: 2 },
  { feature: "📋 Caption & Hashtags",     credits: 2 },
  { feature: "🕵️ Competitor Analyzer",   credits: 2 },
  { feature: "🔄 Repurpose Engine",       credits: 5 },
  { feature: "✨ Script Lab — Improve",   credits: 5 },
  { feature: "🔊 AI Voiceover",           credits: 3 },
  { feature: "🧪 A/B Ad Copy",            credits: 3 },
  { feature: "🖥️ Landing Page Copy",     credits: 4 },
  { feature: "📦 Content Pack",           credits: 5 },
  { feature: "📅 30-Day Calendar",        credits: 6 },
  { feature: "🖼️ Image AI",              credits: 6 },
  { feature: "🎬 Script Lab — Generate",  credits: 8 },
  { feature: "🔍 Intelligence + Trends",  credits: 0 },
];

const COMPARE_ROWS = [
  { label: "Credits / Month",              keys: ["credits"],                    type: "credits" },
  { label: "Viral Content Generator",      keys: ["generate"],                   type: "all" },
  { label: "Hook Score Analyzer",          keys: ["hookScore"],                  type: "all" },
  { label: "Caption & Hashtags",           keys: ["captions"],                   type: "all" },
  { label: "Niche Intelligence + Trends",  keys: ["intelligence"],               type: "all" },
  { label: "Script Lab (Full Pipeline)",   keys: ["scriptLab"],                  type: "starter+" },
  { label: "30-Day Content Calendar",      keys: ["calendar"],                   type: "starter+" },
  { label: "Content Pack",                 keys: ["pack"],                       type: "starter+" },
  { label: "Image AI",                     keys: ["image"],                      type: "starter+" },
  { label: "Mix Studio + Voiceover",       keys: ["mix"],                        type: "starter+" },
  { label: "Repurpose Engine",             keys: ["repurpose"],                  type: "pro+" },
  { label: "Competitor Hook Analyzer",     keys: ["competitor"],                 type: "pro+" },
  { label: "Ad ROI Calculator",            keys: ["roi"],                        type: "advertiser+" },
  { label: "A/B Ad Copy Generator",        keys: ["abtest"],                     type: "advertiser+" },
  { label: "Landing Page Copy",            keys: ["landing"],                    type: "advertiser+" },
];

const PLAN_ACCESS: Record<string, Record<string, boolean>> = {
  free:            { generate:true, hookScore:true, captions:true, intelligence:true, scriptLab:false, calendar:false, pack:false, image:false, mix:false, repurpose:false, competitor:false, roi:false, abtest:false, landing:false },
  creator_starter: { generate:true, hookScore:true, captions:true, intelligence:true, scriptLab:true,  calendar:true,  pack:true,  image:true,  mix:true,  repurpose:false, competitor:false, roi:false, abtest:false, landing:false },
  creator_pro:     { generate:true, hookScore:true, captions:true, intelligence:true, scriptLab:true,  calendar:true,  pack:true,  image:true,  mix:true,  repurpose:true,  competitor:true,  roi:false, abtest:false, landing:false },
  advertiser:      { generate:true, hookScore:true, captions:true, intelligence:true, scriptLab:true,  calendar:true,  pack:true,  image:true,  mix:true,  repurpose:true,  competitor:true,  roi:true,  abtest:true,  landing:true  },
  agency:          { generate:true, hookScore:true, captions:true, intelligence:true, scriptLab:true,  calendar:true,  pack:true,  image:true,  mix:true,  repurpose:true,  competitor:true,  roi:true,  abtest:true,  landing:true  },
};

export default function Plans({ onBack, onUpgrade, currentPlan, currency }: {
  onBack: () => void;
  onUpgrade: (plan: string) => void;
  currentPlan: string;
  currency?: "INR" | "USD";
}) {
  const isUSD = currency === "USD";
  const fmt = (plan: any) => isUSD ? `$${plan.priceUSD}` : plan.price;

  const [credits, setCredits]           = useState<number | null>(null);
  const [creditsTotal, setCreditsTotal] = useState<number | null>(null);
  const [view, setView]                 = useState<"cards" | "compare">("cards");
  const [category, setCategory]         = useState<"creator" | "business" | "agency">("creator");

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

  const allPlans       = [...CREATOR_PLANS, ...BUSINESS_PLANS, ...AGENCY_PLANS];
  const currentData    = allPlans.find(p => p.key === currentPlan) || CREATOR_PLANS[0];
  const credPct        = creditsTotal && credits !== null ? Math.round((credits / creditsTotal) * 100) : 100;
  const displayPlans   = category === "creator" ? CREATOR_PLANS : category === "business" ? BUSINESS_PLANS : AGENCY_PLANS;

  const sectionColor = { creator:"#a855f7", business:"#06b6d4", agency:"#f59e0b" };
  const sectionLabel = { creator:"🎨 Creator Plans", business:"📢 Advertiser Plan", agency:"👑 Agency Plan" };
  const sectionDesc  = { creator:"For Instagram, YouTube & TikTok creators", business:"For Google Ads, Meta Ads & performance marketers", agency:"For agencies managing multiple clients" };

  const credColor = (pct: number) => pct > 50 ? "#22c55e" : pct > 20 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        .pc:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,.5) !important; }
        .ub:hover { transform:translateY(-2px); filter:brightness(1.08); }
        .pc,.ub { transition:all .25s; }
        ::-webkit-scrollbar { height:4px; width:4px; }
        ::-webkit-scrollbar-thumb { background:#7c3aed; border-radius:2px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#030306", fontFamily:"'Inter',sans-serif", color:"#fff", position:"relative", overflow:"hidden" }}>

        {/* BG glow */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", top:"-15%", left:"-8%", background:"radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%)", animation:"glow 14s ease-in-out infinite", filter:"blur(80px)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(124,58,237,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.025) 1px,transparent 1px)", backgroundSize:"64px 64px" }} />
        </div>

        {/* Header */}
        <div style={{ position:"relative", zIndex:1, background:"rgba(3,3,6,.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(124,58,237,.15)", padding:".9rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".65rem" }}>
            <div style={{ background:"linear-gradient(135deg,#6d28d9,#a855f7)", borderRadius:"10px", padding:".35rem .65rem", fontSize:"1rem" }}>⚡</div>
            <span style={{ fontWeight:900, fontSize:".95rem", background:"linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VCI — Viral Content Intelligence</span>
          </div>
          <button onClick={onBack} style={{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.28)", color:"#a855f7", padding:".4rem .9rem", borderRadius:"8px", cursor:"pointer", fontSize:".78rem", fontWeight:700, fontFamily:"inherit" }}>← Dashboard</button>
        </div>

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.25rem", position:"relative", zIndex:1 }}>

          {/* Current plan bar */}
          <div style={{ background:"rgba(255,255,255,.02)", border:`1px solid ${currentData.color}35`, borderRadius:"14px", padding:"1rem 1.4rem", marginBottom:"2rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", animation:"slideUp .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
              <span style={{ background:`${currentData.color}18`, border:`1px solid ${currentData.color}40`, color:currentData.color, fontWeight:800, fontSize:".78rem", padding:".25rem .7rem", borderRadius:"7px" }}>{currentData.name}</span>
              <span style={{ color:"#3f3f46", fontSize:".75rem" }}>Active Plan</span>
            </div>
            {credits !== null && creditsTotal !== null && (
              <div style={{ display:"flex", alignItems:"center", gap:".85rem" }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".25rem" }}>
                    <span style={{ color:"#3f3f46", fontSize:".65rem", fontWeight:600 }}>Credits remaining</span>
                    <span style={{ color:credColor(credPct), fontSize:".65rem", fontWeight:800 }}>{credits} / {creditsTotal}</span>
                  </div>
                  <div style={{ width:180, height:5, background:"#0d0d18", borderRadius:"3px", overflow:"hidden" }}>
                    <div style={{ width:`${credPct}%`, height:"100%", background:credColor(credPct), borderRadius:"3px", transition:"width .5s" }} />
                  </div>
                </div>
                <span style={{ color:credColor(credPct), fontWeight:900, fontSize:".9rem" }}>{credPct}%</span>
              </div>
            )}
          </div>

          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:"2rem", animation:"slideUp .4s ease" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:".4rem", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"20px", padding:".28rem .9rem", marginBottom:".9rem" }}>
              <span style={{ fontSize:".62rem", color:"#a855f7", fontWeight:800, letterSpacing:".1em" }}>💎 CHOOSE YOUR PLAN</span>
            </div>
            <h1 style={{ fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, margin:"0 0 .65rem", background:"linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#a855f7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-.02em" }}>Upgrade & Create More</h1>
            <p style={{ color:"#52525b", fontSize:".9rem", maxWidth:440, margin:"0 auto 1.4rem", lineHeight:1.7 }}>Credits reset monthly. No hidden charges. Cancel anytime.</p>

            {/* Category tabs */}
            <div style={{ display:"inline-flex", background:"rgba(255,255,255,.03)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"12px", padding:".28rem", marginBottom:".75rem", gap:".2rem" }}>
              {(["creator","business","agency"] as const).map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ padding:".45rem 1.1rem", borderRadius:"9px", border:"none", cursor:"pointer", fontWeight:700, fontSize:".8rem", fontFamily:"inherit", transition:"all .2s",
                    background: category === cat ? `linear-gradient(135deg,${sectionColor[cat]},${sectionColor[cat]}bb)` : "transparent",
                    color: category === cat ? "#fff" : "#52525b" }}>
                  {cat === "creator" ? "🎨 Creator" : cat === "business" ? "📢 Advertiser" : "👑 Agency"}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div style={{ display:"inline-flex", background:"rgba(255,255,255,.03)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"10px", padding:".22rem", gap:".18rem" }}>
                {(["cards","compare"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    style={{ padding:".38rem 1rem", borderRadius:"7px", border:"none", cursor:"pointer", fontWeight:700, fontSize:".75rem", fontFamily:"inherit", transition:"all .2s",
                      background: view === v ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "transparent",
                      color: view === v ? "#fff" : "#52525b" }}>
                    {v === "cards" ? "🃏 Cards" : "📊 Compare"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section label */}
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div style={{ display:"inline-block", background:`${sectionColor[category]}10`, border:`1px solid ${sectionColor[category]}30`, borderRadius:"20px", padding:".28rem .9rem" }}>
              <span style={{ color:sectionColor[category], fontSize:".75rem", fontWeight:700 }}>{sectionLabel[category]}</span>
              <span style={{ color:"#3f3f46", fontSize:".72rem" }}> — {sectionDesc[category]}</span>
            </div>
          </div>

          {/* ── CARDS VIEW ── */}
          {view === "cards" && (
            <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fit,minmax(260px,1fr))`, gap:"1rem", marginBottom:"3rem", animation:"slideUp .5s ease",
              maxWidth: displayPlans.length === 1 ? 360 : "none", marginLeft: displayPlans.length === 1 ? "auto" : 0, marginRight: displayPlans.length === 1 ? "auto" : 0 }}>
              {displayPlans.map((plan, i) => {
                const isCurrent = currentPlan === plan.key;
                return (
                  <div key={plan.key} className="pc" style={{ background: isCurrent ? `${plan.color}07` : "#080810", border:`${isCurrent?"2":"1"}px solid ${isCurrent ? plan.color : "#141426"}`, borderRadius:"20px", padding:"1.6rem", position:"relative", boxShadow: isCurrent ? `0 0 40px ${plan.color}18` : "none", animation:`slideUp ${.3+i*.1}s ease` }}>

                    {/* Badges */}
                    {plan.badge && <div style={{ position:"absolute", top:"-12px", left:"50%", transform:"translateX(-50%)", background:plan.color, color:"#fff", borderRadius:"20px", padding:".18rem .8rem", fontSize:".65rem", fontWeight:800, whiteSpace:"nowrap" }}>{plan.badge}</div>}
                    {isCurrent && <div style={{ position:"absolute", top:"-12px", right:"1rem", background:"#22c55e", color:"#000", borderRadius:"20px", padding:".18rem .65rem", fontSize:".6rem", fontWeight:800 }}>✓ Active</div>}

                    {/* Top accent */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", borderRadius:"20px 20px 0 0", background:plan.color }} />

                    <h3 style={{ fontSize:"1.1rem", fontWeight:800, color:"#fff", margin:"0 0 .3rem" }}>{plan.name}</h3>
                    <div style={{ marginBottom:".65rem" }}>
                      <span style={{ fontSize:"2rem", fontWeight:900, color:plan.color }}>{fmt(plan)}</span>
                      <span style={{ color:"#3f3f46", fontSize:".78rem" }}>{plan.period}</span>
                    </div>

                    {/* Credits pill */}
                    <div style={{ background:`${plan.color}14`, border:`1px solid ${plan.color}30`, borderRadius:"8px", padding:".38rem .75rem", marginBottom:"1.1rem", display:"inline-flex", alignItems:"center", gap:".35rem" }}>
                      <span style={{ color:plan.color, fontSize:".8rem", fontWeight:800 }}>⚡ {plan.credits} credits/month</span>
                    </div>

                    {/* Features */}
                    <div style={{ display:"flex", flexDirection:"column", gap:".42rem", marginBottom:"1.1rem" }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:".4rem" }}>
                          <span style={{ color:"#22c55e", fontSize:".7rem", flexShrink:0, marginTop:".15rem" }}>✓</span>
                          <span style={{ color:"#a1a1aa", fontSize:".76rem", lineHeight:1.45 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Locked (if any) */}
                    {plan.locked.length > 0 && (
                      <div style={{ borderTop:"1px solid #0f0f1e", paddingTop:".75rem", marginBottom:"1rem" }}>
                        {plan.locked.map((f, j) => (
                          <div key={j} style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".3rem" }}>
                            <span style={{ color:"#2a2a3a", fontSize:".7rem", flexShrink:0 }}>🔒</span>
                            <span style={{ color:"#2a2a3a", fontSize:".72rem" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {plan.key === "free" ? (
                      <button onClick={onBack} style={{ width:"100%", padding:".7rem", borderRadius:"10px", background:"#0d0d18", border:"1px solid #1a1a2e", color:"#3f3f46", fontWeight:700, fontSize:".82rem", cursor:"pointer", fontFamily:"inherit" }}>
                        {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                      </button>
                    ) : isCurrent ? (
                      <button style={{ width:"100%", padding:".7rem", borderRadius:"10px", background:`${plan.color}10`, border:`1px solid ${plan.color}`, color:plan.color, fontWeight:700, fontSize:".82rem", cursor:"default", fontFamily:"inherit" }}>
                        ✓ Active Plan
                      </button>
                    ) : (
                      <button onClick={() => onUpgrade(plan.key)} className="ub" style={{ width:"100%", padding:".75rem", borderRadius:"10px", background:`linear-gradient(135deg,${plan.color},${plan.color}cc)`, border:"none", color:"#fff", fontWeight:800, fontSize:".85rem", cursor:"pointer", fontFamily:"inherit", boxShadow:`0 6px 20px ${plan.color}30` }}>
                        Get {plan.name} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── COMPARE VIEW ── */}
          {view === "compare" && (
            <div style={{ overflowX:"auto", marginBottom:"3rem", animation:"slideUp .5s ease" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
                <thead>
                  <tr>
                    <th style={{ padding:"1rem .9rem", textAlign:"left", color:"#3f3f46", fontSize:".7rem", fontWeight:800, borderBottom:"1px solid #141426", letterSpacing:".08em", textTransform:"uppercase", width:200 }}>Feature</th>
                    {displayPlans.map(plan => (
                      <th key={plan.key} style={{ padding:"1rem .75rem", textAlign:"center", borderBottom:`2px solid ${currentPlan===plan.key?plan.color:"#141426"}` }}>
                        <div style={{ fontWeight:800, fontSize:".85rem", color:plan.color, marginBottom:".2rem" }}>{plan.name}</div>
                        <div style={{ fontWeight:900, fontSize:"1.05rem", color:"#fff" }}>{fmt(plan)}<span style={{ color:"#3f3f46", fontSize:".68rem", fontWeight:400 }}>{plan.period}</span></div>
                        {currentPlan===plan.key && <div style={{ fontSize:".58rem", color:"#22c55e", fontWeight:800, marginTop:".2rem" }}>✓ ACTIVE</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: i%2===0 ? "rgba(255,255,255,.012)" : "transparent" }}>
                      <td style={{ padding:".75rem .9rem", color:"#94a3b8", fontSize:".77rem", fontWeight:600, borderBottom:"1px solid #0d0d18" }}>
                        {row.label}
                        {row.type !== "all" && row.type !== "credits" && (
                          <span style={{ fontSize:".55rem", marginLeft:".35rem", color: row.type==="starter+"?"#22c55e":row.type==="pro+"?"#a855f7":"#06b6d4", fontWeight:800 }}>
                            {row.type==="starter+"?"Starter+":row.type==="pro+"?"Pro+":"Advertiser+"}
                          </span>
                        )}
                      </td>
                      {displayPlans.map(plan => {
                        const key  = row.keys[0];
                        const acc  = PLAN_ACCESS[plan.key];
                        const has  = key === "credits" ? plan.credits : acc?.[key] ?? false;
                        return (
                          <td key={plan.key} style={{ padding:".75rem", textAlign:"center", borderBottom:"1px solid #0d0d18" }}>
                            {key === "credits"
                              ? <span style={{ color:plan.color, fontWeight:900, fontSize:".88rem" }}>⚡ {plan.credits}</span>
                              : has
                                ? <span style={{ color:"#22c55e", fontSize:"1rem" }}>✓</span>
                                : <span style={{ color:"#1e1e2e", fontSize:"1rem" }}>✗</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding:"1rem .9rem" }} />
                    {displayPlans.map(plan => (
                      <td key={plan.key} style={{ padding:".9rem .75rem", textAlign:"center" }}>
                        {plan.key==="free" ? (
                          <button onClick={onBack} style={{ padding:".55rem .9rem", borderRadius:"8px", background:"#0d0d18", border:"1px solid #1a1a2e", color:"#3f3f46", fontWeight:700, fontSize:".75rem", cursor:"pointer", width:"100%", fontFamily:"inherit" }}>
                            {currentPlan==="free"?"Current":"Downgrade"}
                          </button>
                        ) : currentPlan===plan.key ? (
                          <button style={{ padding:".55rem .9rem", borderRadius:"8px", background:`${plan.color}10`, border:`1px solid ${plan.color}`, color:plan.color, fontWeight:700, fontSize:".75rem", cursor:"default", width:"100%", fontFamily:"inherit" }}>✓ Active</button>
                        ) : (
                          <button onClick={() => onUpgrade(plan.key)} className="ub" style={{ padding:".55rem .9rem", borderRadius:"8px", background:`linear-gradient(135deg,${plan.color},${plan.color}cc)`, border:"none", color:"#fff", fontWeight:800, fontSize:".75rem", cursor:"pointer", width:"100%", fontFamily:"inherit", boxShadow:`0 4px 14px ${plan.color}28` }}>
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

          {/* Credits How it Works */}
          <div style={{ background:"rgba(255,255,255,.015)", border:"1px solid rgba(124,58,237,.15)", borderRadius:"16px", padding:"1.4rem", marginBottom:"2rem" }}>
            <h3 style={{ fontWeight:800, fontSize:".95rem", color:"#fff", margin:"0 0 1rem", textAlign:"center" }}>⚡ How Credits Work</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:".6rem" }}>
              {CREDIT_WEIGHTS.map((cw, i) => (
                <div key={i} style={{ background:"#080810", border:"1px solid #141426", borderRadius:"10px", padding:".65rem .75rem", textAlign:"center" }}>
                  <div style={{ color:"#cbd5e1", fontSize:".74rem", fontWeight:600, marginBottom:".25rem", lineHeight:1.3 }}>{cw.feature}</div>
                  <div style={{ color: cw.credits===0?"#22c55e":"#a855f7", fontWeight:900, fontSize:"1rem" }}>
                    {cw.credits===0 ? "Free" : `${cw.credits} cr`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <h2 style={{ fontWeight:800, fontSize:"1.1rem", margin:"0 0 1.1rem", color:"#fff", textAlign:"center" }}>❓ Frequently Asked Questions</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:".65rem" }}>
              {[
                ["What are credits?","Each feature uses a different number of credits based on the work involved. Generate uses 1 credit, Script Lab Generate uses 8. Credits reset automatically at the start of each billing cycle."],
                ["Creator vs Advertiser vs Agency?","Creator plans are built for social content — Instagram, YouTube, TikTok. Advertiser plan adds exclusive tools: ROI Calculator, A/B Ad Copy, Landing Page Copy, and Google/Meta Ads platforms. Agency includes everything with 2,800 credits for multiple clients."],
                ["What new tools does Advertiser plan include?","ROI Calculator (enter budget + CPC + conversion rate → see ROAS instantly), A/B Ad Copy Generator (2 completely different ad angles for the same product), and Landing Page Copy Generator (full above-the-fold copy matching your ad)."],
                ["How do I upgrade?","Select your plan and click Get [Plan]. Payment via UPI (GPay, PhonePe, Paytm). Plan activates within 2 hours of payment confirmation."],
                ["Can I switch plans?","Yes — upgrade or downgrade anytime. Contact support on WhatsApp and we'll handle the transition with prorated credits."],
                ["Refund policy?","Cancel within 24 hours for a full refund minus credits already used. Requests after 24 hours are not eligible."],
              ].map(([q, a], i) => (
                <div key={i} style={{ background:"rgba(255,255,255,.015)", border:"1px solid rgba(124,58,237,.1)", borderRadius:"12px", padding:".9rem 1.1rem" }}>
                  <p style={{ margin:"0 0 .3rem", fontWeight:700, color:"#fff", fontSize:".82rem" }}>Q: {q}</p>
                  <p style={{ margin:0, color:"#52525b", fontSize:".78rem", lineHeight:1.65 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.25rem", borderTop:"1px solid rgba(124,58,237,.08)", marginTop:"2rem" }}>
          <p style={{ color:"#1e1e2e", fontSize:".68rem", margin:0 }}>© {new Date().getFullYear()} Global Web Info Vision — VCI. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
}