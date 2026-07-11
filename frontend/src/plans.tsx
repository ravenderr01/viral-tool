import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const CREATOR_PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0", priceNum: 0, priceUSD: 0,
    wasPrice: "", wasUSD: 0,
    period: "", badge: "", color: "#6b7280",
    credits: 25, type: "creator",
    features: [
      "⚡ Viral Content Generator",
      "📊 Hook Score Analyzer",
      "📋 Caption & Hashtag Generator",
      "🔍 Niche Intelligence — Always Free",
      "📈 Live Trends Feed — Always Free",
      "💾 My Content Library",
      "30+ Languages · 15+ Platforms",
      "Community Support",
    ],
    locked: [
      "Script Lab, Calendar, Content Pack, Image AI",
      "Repurpose Engine, Competitor Analyzer",
      "All 7 Advertiser Tools",
    ],
  },
  {
    key: "creator_starter",
    name: "Creator Starter",
    price: "₹499", priceNum: 499, priceUSD: 9,
    wasPrice: "₹699", wasUSD: 12,
    period: "/month", badge: "🔥 Popular", color: "#22c55e",
    credits: 100, type: "creator",
    features: [
      "Everything in Free",
      "🎬 Script Lab — Full Pipeline",
      "🎙️ AI Voiceover — 7 Indian Languages",
      "🎛️ Mix Studio + Audio Ducking",
      "📅 30-Day Content Calendar",
      "📦 Content Pack (50+ pieces)",
      "🖼️ Image AI",
      "All 15+ Platforms",
      "Email Support",
    ],
    locked: [
      "Repurpose Engine, Competitor Analyzer",
      "All 7 Advertiser Tools",
    ],
  },
  {
    key: "creator_pro",
    name: "Creator Pro",
    price: "₹1,299", priceNum: 1299, priceUSD: 29,
    wasPrice: "₹1,799", wasUSD: 35,
    period: "/month", badge: "⚡ Best Value", color: "#a855f7",
    credits: 350, type: "creator",
    features: [
      "Everything in Creator Starter",
      "🔄 Auto-Repurpose Engine (8 platforms)",
      "🕵️ Competitor Hook Analyzer",
      "350 credits — 3× more than Starter",
      "Priority Email Support",
    ],
    locked: [
      "All 7 Advertiser Tools",
    ],
  },
];

const BUSINESS_PLANS = [
  {
    key: "advertiser",
    name: "Advertiser",
    price: "₹2,499", priceNum: 2499, priceUSD: 49,
    wasPrice: "₹3,499", wasUSD: 59,
    period: "/month", badge: "📢 Advertiser Exclusive", color: "#06b6d4",
    credits: 700, type: "business",
    features: [
      "Everything in Creator Pro",
      "📊 Ad ROI Calculator (Free)",
      "🧪 A/B Ad Copy Generator",
      "🖥️ Landing Page Copy Generator",
      "💬 WhatsApp & Email Copy",
      "✍️ Bio Writer (6 platforms)",
      "🛍️ Product Description Writer",
      "🎯 Viral Templates (12 formats)",
      "Google Ads + Meta Ads platforms",
      "700 credits — 2× Creator Pro",
      "Priority Support",
    ],
    locked: [],
  },
];

const AGENCY_PLANS = [
  {
    key: "agency",
    name: "Agency",
    price: "₹8,999.99", priceNum: 8999.99, priceUSD: 119,
    wasPrice: "₹9,999", wasUSD: 149,
    period: "/month", badge: "👑 All Access", color: "#f59e0b",
    credits: 2000, type: "agency",
    features: [
      "All 18 Creator + Advertiser Tools",
      "2,000 credits — unlimited workflow",
      "Multiple clients, all platforms",
      "Script Lab + Repurpose + Competitor",
      "ROI Calc + A/B Ads + Landing Page",
      "WA/Email + Bio + Product Desc + Templates",
      "Priority Support (30-min response)",
      "Early access to new features",
    ],
    locked: [],
  },
];

const CREDIT_WEIGHTS = [
  { feature: "🔍 Intelligence + Trends", credits: 0 },
  { feature: "📊 ROI Calculator",        credits: 0 },
  { feature: "💾 My Library",            credits: 0 },
  { feature: "⚡ Generate Content",       credits: 1 },
  { feature: "✍️ Bio Writer",            credits: 1 },
  { feature: "🎯 Viral Templates",        credits: 1 },
  { feature: "📊 Hook Score",             credits: 2 },
  { feature: "📋 Captions",              credits: 2 },
  { feature: "🕵️ Competitor Analyzer",  credits: 2 },
  { feature: "💬 WA & Email Copy",        credits: 2 },
  { feature: "🛍️ Product Description",  credits: 2 },
  { feature: "🔊 AI Voiceover",           credits: 3 },
  { feature: "🧪 A/B Ad Copy",           credits: 3 },
  { feature: "🖥️ Landing Page Copy",    credits: 4 },
  { feature: "🔄 Repurpose Engine",       credits: 5 },
  { feature: "📦 Content Pack",           credits: 5 },
  { feature: "✨ Script Improve",         credits: 5 },
  { feature: "📅 30-Day Calendar",        credits: 6 },
  { feature: "🖼️ Image AI",             credits: 6 },
  { feature: "🎬 Script Lab Generate",    credits: 8 },
];

const COMPARE_ROWS = [
  { label: "Credits / Month",             key: "credits",       type: "credits" },
  { label: "Viral Content Generator",     key: "generate",      type: "all" },
  { label: "Hook Score Analyzer",         key: "hookScore",     type: "all" },
  { label: "Caption & Hashtags",          key: "captions",      type: "all" },
  { label: "Niche Intelligence + Trends", key: "intelligence",  type: "all" },
  { label: "My Content Library",          key: "library",       type: "all" },
  { label: "Script Lab (Full Pipeline)",  key: "scriptLab",     type: "starter+" },
  { label: "AI Voiceover 7 Languages",    key: "voiceover",     type: "starter+" },
  { label: "Mix Studio + Ducking",        key: "mix",           type: "starter+" },
  { label: "30-Day Content Calendar",     key: "calendar",      type: "starter+" },
  { label: "Content Pack (50+ pieces)",   key: "pack",          type: "starter+" },
  { label: "Image AI",                    key: "image",         type: "starter+" },
  { label: "Auto-Repurpose Engine",       key: "repurpose",     type: "pro+" },
  { label: "Competitor Hook Analyzer",    key: "competitor",    type: "pro+" },
  { label: "Ad ROI Calculator",           key: "roi",           type: "adv+" },
  { label: "A/B Ad Copy Generator",       key: "abtest",        type: "adv+" },
  { label: "Landing Page Copy",           key: "landing",       type: "adv+" },
  { label: "WhatsApp & Email Copy",       key: "whatsapp",      type: "adv+" },
  { label: "Bio Writer (6 platforms)",    key: "bio",           type: "adv+" },
  { label: "Product Description Writer",  key: "product",       type: "adv+" },
  { label: "Viral Templates (12 types)",  key: "templates",     type: "adv+" },
];

const PLAN_ACCESS: Record<string, Record<string, boolean>> = {
  free:            { generate:true,  hookScore:true,  captions:true,  intelligence:true,  library:true,  scriptLab:false, voiceover:false, mix:false,  calendar:false, pack:false,  image:false, repurpose:false, competitor:false, roi:true,  abtest:false, landing:false, whatsapp:false, bio:false, product:false, templates:false },
  creator_starter: { generate:true,  hookScore:true,  captions:true,  intelligence:true,  library:true,  scriptLab:true,  voiceover:true,  mix:true,   calendar:true,  pack:true,   image:true,  repurpose:false, competitor:false, roi:true,  abtest:false, landing:false, whatsapp:false, bio:false, product:false, templates:false },
  creator_pro:     { generate:true,  hookScore:true,  captions:true,  intelligence:true,  library:true,  scriptLab:true,  voiceover:true,  mix:true,   calendar:true,  pack:true,   image:true,  repurpose:true,  competitor:true,  roi:true,  abtest:false, landing:false, whatsapp:false, bio:false, product:false, templates:false },
  advertiser:      { generate:true,  hookScore:true,  captions:true,  intelligence:true,  library:true,  scriptLab:true,  voiceover:true,  mix:true,   calendar:true,  pack:true,   image:true,  repurpose:true,  competitor:true,  roi:true,  abtest:true,  landing:true,  whatsapp:true,  bio:true,  product:true,  templates:true  },
  agency:          { generate:true,  hookScore:true,  captions:true,  intelligence:true,  library:true,  scriptLab:true,  voiceover:true,  mix:true,   calendar:true,  pack:true,   image:true,  repurpose:true,  competitor:true,  roi:true,  abtest:true,  landing:true,  whatsapp:true,  bio:true,  product:true,  templates:true  },
};

export default function Plans({ onBack, onUpgrade, currentPlan, currency }: {
  onBack: () => void;
  onUpgrade: (plan: string) => void;
  currentPlan: string;
  currency?: "INR" | "USD";
}) {
  const isUSD = currency === "USD";
  const fmt = (plan: any) => isUSD ? `$${plan.priceUSD}` : plan.price;
  const fmtWas = (plan: any) => isUSD ? (plan.wasUSD ? `$${plan.wasUSD}` : "") : plan.wasPrice;
  const discount = (plan: any) => {
    if (!plan.priceNum || !plan.wasUSD) return 0;
    const was = isUSD ? plan.wasUSD : (plan.wasPrice ? parseInt(plan.wasPrice.replace(/[₹,]/g, "")) : 0);
    if (!was) return 0;
    return Math.round(((was - plan.priceNum) / was) * 100);
  };

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

  const allPlans     = [...CREATOR_PLANS, ...BUSINESS_PLANS, ...AGENCY_PLANS];
  const currentData  = allPlans.find(p => p.key === currentPlan) || CREATOR_PLANS[0];
  const credPct      = creditsTotal && credits !== null ? Math.round((credits / creditsTotal) * 100) : 100;
  const displayPlans = category === "creator" ? CREATOR_PLANS : category === "business" ? BUSINESS_PLANS : AGENCY_PLANS;

  const CAT_COLOR = { creator:"#a855f7", business:"#06b6d4", agency:"#f59e0b" };
  const CAT_LABEL = { creator:"🎨 Creator Plans", business:"📢 Advertiser Plan", agency:"👑 Agency Plan" };
  const CAT_DESC  = { creator:"For Instagram, YouTube & other social platforms", business:"For performance marketers running Google & Meta Ads", agency:"For agencies managing multiple clients" };
  const credColor = (p: number) => p > 50 ? "#22c55e" : p > 20 ? "#f59e0b" : "#ef4444";

  const typeColor = { "all":"#3f3f46", "starter+":"#22c55e", "pro+":"#a855f7", "adv+":"#06b6d4", "credits":"#f59e0b" };
  const typeLabel = { "all":"All", "starter+":"Starter+", "pro+":"Pro+", "adv+":"Adv+", "credits":"" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box}
        body{margin:0}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .pc{transition:all .25s;cursor:default}
        .pc:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.5)!important}
        .ub{transition:all .2s}
        .ub:hover{transform:translateY(-2px);filter:brightness(1.08)}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:2px}
        @media(max-width:640px){
          .plan-grid{grid-template-columns:1fr!important}
          .credit-grid{grid-template-columns:repeat(2,1fr)!important}
          .cat-btn span.cat-desc{display:none}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#030306", fontFamily:"'Inter',sans-serif", color:"#fff", position:"relative", overflow:"hidden" }}>

        {/* BG */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", top:"-15%", left:"-8%", background:"radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%)", animation:"glow 14s ease-in-out infinite", filter:"blur(80px)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(124,58,237,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.025) 1px,transparent 1px)", backgroundSize:"64px 64px" }} />
        </div>

        {/* Header */}
        <div style={{ position:"relative", zIndex:1, background:"rgba(3,3,6,.88)", backdropFilter:"blur(14px)", borderBottom:"1px solid rgba(124,58,237,.15)", padding:".85rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ background:"linear-gradient(135deg,#6d28d9,#a855f7)", borderRadius:"10px", padding:".3rem .6rem", fontSize:"1rem" }}>⚡</div>
            <span style={{ fontWeight:900, fontSize:".9rem", background:"linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VCI — Viral Content Intelligence</span>
          </div>
          <button onClick={onBack}
            style={{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.28)", color:"#a855f7", padding:".38rem .85rem", borderRadius:"8px", cursor:"pointer", fontSize:".75rem", fontWeight:700, fontFamily:"inherit" }}>
            ← Dashboard
          </button>
        </div>

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"1.75rem 1.25rem 3rem", position:"relative", zIndex:1 }}>

          {/* Launch Offer Banner */}
          <div style={{ background:"linear-gradient(135deg,rgba(109,40,217,.2),rgba(168,85,247,.12))", border:"1px solid rgba(168,85,247,.3)", borderRadius:"12px", padding:".75rem 1.1rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", justifyContent:"center", gap:".6rem", animation:"slideUp .3s ease" }}>
            <span style={{ fontSize:"1rem" }}>🎉</span>
            <span style={{ fontWeight:800, fontSize:".82rem", color:"#c4b5fd" }}>Launch Offer — First 100 Users Get Special Pricing</span>
            <span style={{ fontSize:".7rem", color:"#6d28d9" }}>·</span>
            <span style={{ fontWeight:600, fontSize:".75rem", color:"#71717a" }}>Original prices crossed out below</span>
          </div>

          {/* Current Plan Bar */}
          <div style={{ background:"rgba(255,255,255,.02)", border:`1px solid ${currentData.color}35`, borderRadius:"14px", padding:"1rem 1.4rem", marginBottom:"1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", animation:"slideUp .35s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
              <span style={{ background:`${currentData.color}18`, border:`1px solid ${currentData.color}40`, color:currentData.color, fontWeight:800, fontSize:".75rem", padding:".22rem .65rem", borderRadius:"7px" }}>{currentData.name}</span>
              <span style={{ color:"#3f3f46", fontSize:".72rem" }}>Active Plan</span>
            </div>
            {credits !== null && creditsTotal !== null && (
              <div style={{ display:"flex", alignItems:"center", gap:".85rem" }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".25rem" }}>
                    <span style={{ color:"#3f3f46", fontSize:".62rem", fontWeight:600 }}>Credits remaining</span>
                    <span style={{ color:credColor(credPct), fontSize:".62rem", fontWeight:800, marginLeft:".5rem" }}>{credits}/{creditsTotal}</span>
                  </div>
                  <div style={{ width:160, height:4, background:"#0d0d18", borderRadius:"3px", overflow:"hidden" }}>
                    <div style={{ width:`${credPct}%`, height:"100%", background:credColor(credPct), borderRadius:"3px", transition:"width .5s" }} />
                  </div>
                </div>
                <span style={{ color:credColor(credPct), fontWeight:900, fontSize:".88rem" }}>{credPct}%</span>
              </div>
            )}
          </div>

          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:"1.75rem", animation:"slideUp .4s ease" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:".4rem", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"20px", padding:".25rem .85rem", marginBottom:".75rem" }}>
              <span style={{ fontSize:".62rem", color:"#a855f7", fontWeight:800, letterSpacing:".1em" }}>💎 18 AI TOOLS · INDIA'S BEST PRICING</span>
            </div>
            <h1 style={{ fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:900, margin:"0 0 .55rem", background:"linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#a855f7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-.02em" }}>
              Choose Your Plan
            </h1>
            <p style={{ color:"#52525b", fontSize:".85rem", maxWidth:400, margin:"0 auto 1.25rem", lineHeight:1.7 }}>Credits reset monthly. Cancel anytime. No hidden charges.</p>

            {/* Category tabs */}
            <div style={{ display:"inline-flex", background:"rgba(255,255,255,.03)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"12px", padding:".25rem", marginBottom:".65rem", gap:".2rem" }}>
              {(["creator","business","agency"] as const).map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className="cat-btn"
                  style={{ padding:".42rem 1rem", borderRadius:"9px", border:"none", cursor:"pointer", fontWeight:700, fontSize:".78rem", fontFamily:"inherit", transition:"all .2s",
                    background: category === cat ? `linear-gradient(135deg,${CAT_COLOR[cat]},${CAT_COLOR[cat]}bb)` : "transparent",
                    color: category === cat ? "#fff" : "#52525b" }}>
                  {cat === "creator" ? "🎨 Creator" : cat === "business" ? "📢 Advertiser" : "👑 Agency"}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div style={{ display:"inline-flex", background:"rgba(255,255,255,.03)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"10px", padding:".2rem", gap:".15rem" }}>
                {(["cards","compare"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    style={{ padding:".35rem .9rem", borderRadius:"7px", border:"none", cursor:"pointer", fontWeight:700, fontSize:".73rem", fontFamily:"inherit", transition:"all .2s",
                      background: view === v ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "transparent",
                      color: view === v ? "#fff" : "#52525b" }}>
                    {v === "cards" ? "🃏 Cards" : "📊 Compare"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section label */}
          <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
            <div style={{ display:"inline-block", background:`${CAT_COLOR[category]}10`, border:`1px solid ${CAT_COLOR[category]}30`, borderRadius:"20px", padding:".25rem .85rem" }}>
              <span style={{ color:CAT_COLOR[category], fontSize:".75rem", fontWeight:700 }}>{CAT_LABEL[category]}</span>
              <span style={{ color:"#3f3f46", fontSize:".7rem" }}> — {CAT_DESC[category]}</span>
            </div>
          </div>

          {/* ── CARDS VIEW ── */}
          {view === "cards" && (
            <div className="plan-grid" style={{ display:"grid", gridTemplateColumns:`repeat(auto-fit,minmax(260px,1fr))`, gap:"1rem", marginBottom:"2.5rem", animation:"slideUp .5s ease",
              maxWidth: displayPlans.length === 1 ? 380 : "none",
              marginLeft: displayPlans.length === 1 ? "auto" : undefined,
              marginRight: displayPlans.length === 1 ? "auto" : undefined }}>
              {displayPlans.map((plan, i) => {
                const isCurrent = currentPlan === plan.key;
                const disc = discount(plan);
                return (
                  <div key={plan.key} className="pc"
                    style={{ background: isCurrent ? `${plan.color}07` : "#080810", border:`${isCurrent?"2":"1"}px solid ${isCurrent ? plan.color : "#141426"}`, borderRadius:"20px", padding:"1.5rem", position:"relative", boxShadow: isCurrent ? `0 0 40px ${plan.color}18` : "none", animation:`slideUp ${.3+i*.1}s ease` }}>

                    {/* Top accent line */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2.5px", borderRadius:"20px 20px 0 0", background:plan.color }} />

                    {/* Badges */}
                    {plan.badge && (
                      <div style={{ position:"absolute", top:"-11px", left:"50%", transform:"translateX(-50%)", background:plan.color, color:"#fff", borderRadius:"20px", padding:".15rem .75rem", fontSize:".62rem", fontWeight:800, whiteSpace:"nowrap" }}>
                        {plan.badge}
                      </div>
                    )}
                    {isCurrent && (
                      <div style={{ position:"absolute", top:"-11px", right:"1rem", background:"#22c55e", color:"#000", borderRadius:"20px", padding:".15rem .6rem", fontSize:".58rem", fontWeight:800 }}>
                        ✓ Active
                      </div>
                    )}
                    {disc > 0 && !isCurrent && (
                      <div style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", color:"#f87171", borderRadius:"7px", padding:".12rem .45rem", fontSize:".6rem", fontWeight:800 }}>
                        {disc}% OFF
                      </div>
                    )}

                    {/* Name */}
                    <h3 style={{ fontSize:"1.05rem", fontWeight:800, color:"#fff", margin:"0 0 .5rem" }}>{plan.name}</h3>

                    {/* Price */}
                    <div style={{ marginBottom:".65rem" }}>
                      {fmtWas(plan) && (
                        <span style={{ fontSize:".8rem", color:"#3f3f46", textDecoration:"line-through", marginRight:".4rem" }}>
                          {fmtWas(plan)}
                        </span>
                      )}
                      <span style={{ fontSize:"2rem", fontWeight:900, color:plan.color }}>{fmt(plan)}</span>
                      <span style={{ color:"#3f3f46", fontSize:".75rem" }}>{plan.period}</span>
                    </div>

                    {/* Credits pill */}
                    <div style={{ background:`${plan.color}14`, border:`1px solid ${plan.color}30`, borderRadius:"8px", padding:".35rem .7rem", marginBottom:"1rem", display:"inline-flex", alignItems:"center", gap:".3rem" }}>
                      <span style={{ color:plan.color, fontSize:".78rem", fontWeight:800 }}>⚡ {plan.credits} credits/month</span>
                    </div>

                    {/* Features */}
                    <div style={{ display:"flex", flexDirection:"column", gap:".4rem", marginBottom:"1rem" }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:".4rem" }}>
                          <span style={{ color:"#22c55e", fontSize:".68rem", flexShrink:0, marginTop:".15rem" }}>✓</span>
                          <span style={{ color:"#94a3b8", fontSize:".74rem", lineHeight:1.45 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Locked */}
                    {plan.locked.length > 0 && (
                      <div style={{ borderTop:"1px solid #0d0d18", paddingTop:".7rem", marginBottom:"1rem" }}>
                        {plan.locked.map((f, j) => (
                          <div key={j} style={{ display:"flex", alignItems:"center", gap:".35rem", marginBottom:".28rem" }}>
                            <span style={{ color:"#1e1e2e", fontSize:".65rem" }}>🔒</span>
                            <span style={{ color:"#1e1e2e", fontSize:".7rem" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {plan.key === "free" ? (
                      <button onClick={onBack}
                        style={{ width:"100%", padding:".65rem", borderRadius:"10px", background:"#0d0d18", border:"1px solid #1a1a2e", color:"#3f3f46", fontWeight:700, fontSize:".8rem", cursor:"pointer", fontFamily:"inherit" }}>
                        {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                      </button>
                    ) : isCurrent ? (
                      <button style={{ width:"100%", padding:".65rem", borderRadius:"10px", background:`${plan.color}10`, border:`1px solid ${plan.color}`, color:plan.color, fontWeight:700, fontSize:".8rem", cursor:"default", fontFamily:"inherit" }}>
                        ✓ Active Plan
                      </button>
                    ) : (
                      <button onClick={() => onUpgrade(plan.key)} className="ub"
                        style={{ width:"100%", padding:".7rem", borderRadius:"10px", background:`linear-gradient(135deg,${plan.color},${plan.color}bb)`, border:"none", color:"#fff", fontWeight:800, fontSize:".83rem", cursor:"pointer", fontFamily:"inherit", boxShadow:`0 6px 20px ${plan.color}28` }}>
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
            <div style={{ overflowX:"auto", marginBottom:"2.5rem", animation:"slideUp .5s ease" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
                <thead>
                  <tr>
                    <th style={{ padding:".9rem .9rem", textAlign:"left", color:"#3f3f46", fontSize:".65rem", fontWeight:800, borderBottom:"1px solid #141426", letterSpacing:".08em", textTransform:"uppercase", width:210 }}>Feature</th>
                    {displayPlans.map(plan => (
                      <th key={plan.key} style={{ padding:".9rem .65rem", textAlign:"center", borderBottom:`2px solid ${currentPlan===plan.key?plan.color:"#141426"}` }}>
                        <div style={{ fontWeight:800, fontSize:".82rem", color:plan.color, marginBottom:".15rem" }}>{plan.name}</div>
                        {(plan as any).wasPrice && (
                          <div style={{ fontSize:".62rem", color:"#3f3f46", textDecoration:"line-through" }}>{isUSD ? `$${(plan as any).wasUSD}` : (plan as any).wasPrice}</div>
                        )}
                        <div style={{ fontWeight:900, fontSize:"1rem", color:"#fff" }}>{fmt(plan)}<span style={{ color:"#3f3f46", fontSize:".65rem", fontWeight:400 }}>{plan.period}</span></div>
                        {currentPlan===plan.key && <div style={{ fontSize:".56rem", color:"#22c55e", fontWeight:800, marginTop:".15rem" }}>✓ ACTIVE</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background:i%2===0?"rgba(255,255,255,.012)":"transparent" }}>
                      <td style={{ padding:".65rem .9rem", color:"#94a3b8", fontSize:".74rem", fontWeight:600, borderBottom:"1px solid #0d0d18" }}>
                        {row.label}
                        {row.type !== "all" && row.type !== "credits" && (
                          <span style={{ fontSize:".52rem", marginLeft:".3rem", color:(typeColor as any)[row.type], fontWeight:800 }}>
                            {(typeLabel as any)[row.type]}
                          </span>
                        )}
                      </td>
                      {displayPlans.map(plan => {
                        const acc = PLAN_ACCESS[plan.key];
                        const has = row.key === "credits" ? plan.credits : acc?.[row.key] ?? false;
                        return (
                          <td key={plan.key} style={{ padding:".65rem", textAlign:"center", borderBottom:"1px solid #0d0d18" }}>
                            {row.key === "credits"
                              ? <span style={{ color:plan.color, fontWeight:900, fontSize:".85rem" }}>⚡ {plan.credits}</span>
                              : has
                                ? <span style={{ color:"#22c55e", fontSize:".95rem" }}>✓</span>
                                : <span style={{ color:"#1e1e2e", fontSize:".95rem" }}>✗</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding:".9rem" }} />
                    {displayPlans.map(plan => (
                      <td key={plan.key} style={{ padding:".8rem .65rem", textAlign:"center" }}>
                        {plan.key==="free" ? (
                          <button onClick={onBack} style={{ padding:".5rem .8rem", borderRadius:"8px", background:"#0d0d18", border:"1px solid #1a1a2e", color:"#3f3f46", fontWeight:700, fontSize:".72rem", cursor:"pointer", width:"100%", fontFamily:"inherit" }}>
                            {currentPlan==="free"?"Current":"Downgrade"}
                          </button>
                        ) : currentPlan===plan.key ? (
                          <button style={{ padding:".5rem .8rem", borderRadius:"8px", background:`${plan.color}10`, border:`1px solid ${plan.color}`, color:plan.color, fontWeight:700, fontSize:".72rem", cursor:"default", width:"100%", fontFamily:"inherit" }}>✓ Active</button>
                        ) : (
                          <button onClick={() => onUpgrade(plan.key)} className="ub"
                            style={{ padding:".5rem .8rem", borderRadius:"8px", background:`linear-gradient(135deg,${plan.color},${plan.color}bb)`, border:"none", color:"#fff", fontWeight:800, fontSize:".72rem", cursor:"pointer", width:"100%", fontFamily:"inherit", boxShadow:`0 4px 14px ${plan.color}25` }}>
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
          <div style={{ background:"rgba(255,255,255,.015)", border:"1px solid rgba(124,58,237,.15)", borderRadius:"16px", padding:"1.3rem", marginBottom:"2rem" }}>
            <h3 style={{ fontWeight:800, fontSize:".9rem", color:"#fff", margin:"0 0 .9rem", textAlign:"center" }}>⚡ Credits Per Feature</h3>
            <div className="credit-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:".5rem" }}>
              {CREDIT_WEIGHTS.map((cw, i) => (
                <div key={i} style={{ background:"#080810", border:"1px solid #141426", borderRadius:"10px", padding:".6rem .7rem", textAlign:"center" }}>
                  <div style={{ color:"#94a3b8", fontSize:".7rem", fontWeight:600, marginBottom:".22rem", lineHeight:1.3 }}>{cw.feature}</div>
                  <div style={{ color:cw.credits===0?"#22c55e":"#a855f7", fontWeight:900, fontSize:".95rem" }}>
                    {cw.credits===0 ? "FREE" : `${cw.credits} cr`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <h2 style={{ fontWeight:800, fontSize:"1rem", margin:"0 0 1rem", color:"#fff", textAlign:"center" }}>❓ Frequently Asked Questions</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
              {[
                ["What are credits?", "Credits are used per generation. Simple tasks use fewer (Generate = 1 cr), complex pipelines use more (Script Lab = 8 cr). Intelligence, Trends, ROI Calculator, and My Library are always free — no credits needed."],
                ["What's new in the Advertiser plan?", "7 exclusive tools: Ad ROI Calculator (see ROAS before launching), A/B Ad Copy (2 different psychological angles), Landing Page Copy (matched to your ad), WhatsApp & Email Copy, Bio Writer (6 platforms), Product Description Writer (Meesho, Amazon, Flipkart), and 12 Viral Post Templates."],
                ["Creator vs Advertiser vs Agency?", "Creator plans are for social content — Instagram, YouTube, TikTok. Advertiser adds tools for running Google and Meta ad campaigns. Agency includes everything with 2,000 credits for managing multiple clients."],
                ["How do I pay?", "UPI (GPay, PhonePe, Paytm) or debit/credit cards. Plan activates within 2 hours of payment. For any issues contact WhatsApp: +91 9315133390."],
                ["Can I upgrade or downgrade?", "Yes — anytime. Upgrade instantly through the app. To downgrade, contact support on WhatsApp and we'll handle the transition with prorated credits."],
                ["Refund policy?", "Full refund if cancelled within 24 hours of purchase, minus credits already used. Requests after 24 hours are not eligible."],
                ["Is the launch pricing permanent?", "No — these are special launch prices for the first 100 users. Prices will increase once we reach 100 paid users. Lock in your plan now to keep the lower rate."],
              ].map(([q, a], i) => (
                <div key={i} style={{ background:"rgba(255,255,255,.015)", border:"1px solid rgba(124,58,237,.1)", borderRadius:"12px", padding:".85rem 1rem" }}>
                  <p style={{ margin:"0 0 .28rem", fontWeight:700, color:"#fff", fontSize:".8rem" }}>Q: {q}</p>
                  <p style={{ margin:0, color:"#52525b", fontSize:".75rem", lineHeight:1.65 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support strip */}
          <div style={{ textAlign:"center", marginTop:"1.75rem", padding:".9rem", background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.12)", borderRadius:"12px" }}>
            <p style={{ color:"#3f3f46", fontSize:".75rem", margin:0 }}>
              Questions? <a href="https://wa.me/919315133390" target="_blank" rel="noopener noreferrer" style={{ color:"#a855f7", fontWeight:700, textDecoration:"none" }}>WhatsApp +91 9315133390</a>
              {" · "}
              <a href="https://t.me/GetvciOfficial" target="_blank" rel="noopener noreferrer" style={{ color:"#60a5fa", fontWeight:700, textDecoration:"none" }}>@GetvciOfficial</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1rem", borderTop:"1px solid rgba(124,58,237,.08)" }}>
          <p style={{ color:"#1e1e2e", fontSize:".65rem", margin:0 }}>© {new Date().getFullYear()} Global Web Info Vision — VCI. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
}