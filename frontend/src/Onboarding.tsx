import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Onboarding({ userId, onComplete }: { userId: string; onComplete: (type: string) => void | Promise<void> }) {
  const [step, setStep]           = useState<1 | 2 | 3 | 4>(1);
  const [selected, setSelected]   = useState<"creator" | "business" | "agency" | null>(null);

  // Personalize step
  const [niche, setNiche]         = useState("");
  const [platform, setPlatform]   = useState("");
  const [keyword, setKeyword]     = useState("");
  const [goal, setGoal]           = useState("");
  const [language, setLanguage]   = useState("English");
  // Business-only extra fields
  const [businessType, setBusinessType]   = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [ageGroup, setAgeGroup]           = useState("");
  const [targetLocation, setTargetLocation] = useState("India");

  const [loading, setLoading]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks]         = useState<string[]>([]);
  const [savedIdx, setSavedIdx]   = useState<Set<number>>(new Set());
  const [error, setError]         = useState("");
  const [userName, setUserName]   = useState("");
  const [credits, setCredits]     = useState(25);

  const CARDS = [
    { id: "creator"  as const, emoji:"🎨", title:"Content Creator",      desc:"I create content for Instagram, YouTube, TikTok & more", color:"#a855f7", bg:"rgba(168,85,247,0.1)", glow:"rgba(168,85,247,0.2)" },
    { id: "business" as const, emoji:"📢", title:"Advertiser / Business", desc:"I run ads and need ad copy, headlines, keywords",          color:"#06b6d4", bg:"rgba(6,182,212,0.1)",  glow:"rgba(6,182,212,0.2)"  },
    { id: "agency"   as const, emoji:"👑", title:"Agency",                desc:"I manage multiple clients — content and advertising",      color:"#f59e0b", bg:"rgba(245,158,11,0.1)", glow:"rgba(245,158,11,0.2)" },
  ];

  const NICHES     = ["Fitness","Fashion","Food","Finance","Education","Tech","Travel","Beauty","Business","Motivation","Health","Entertainment"];
  const PLATFORMS  = selected === "business"
    ? ["Google Ads","Meta Ads","YouTube Ads","LinkedIn Ads"]
    : ["Instagram","YouTube","LinkedIn","Twitter/X","TikTok","Facebook","WhatsApp"];

  const LANGUAGES = ["English","Hindi","Tamil","Telugu","Bengali","Marathi","Gujarati","Kannada","Malayalam","Punjabi","Odia","Assamese","Urdu"];

  const GOALS: Record<string, { emoji: string; label: string }[]> = {
    creator: [
      { emoji: "📈", label: "Grow Followers" },
      { emoji: "💬", label: "Increase Engagement" },
      { emoji: "🎯", label: "Build Personal Brand" },
      { emoji: "🤝", label: "Get Brand Deals" },
    ],
    business: [
      { emoji: "🎯", label: "Get More Leads" },
      { emoji: "💰", label: "Increase Sales" },
      { emoji: "🌐", label: "Boost Website Traffic" },
      { emoji: "📢", label: "Build Brand Awareness" },
    ],
    agency: [
      { emoji: "👥", label: "Manage Multiple Clients" },
      { emoji: "⚡", label: "Scale Content Production" },
      { emoji: "🏆", label: "Win More Clients" },
      { emoji: "📊", label: "Improve Client Results" },
    ],
  };
  const currentGoals = GOALS[selected || "creator"];

  const BUDGETS = ["₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000+"];
  const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"];

  const continueColor = selected === "creator" ? "#a855f7" : selected === "business" ? "#06b6d4" : "#f59e0b";

  // Step 1 → Step 2 (Choose Workspace → Personalize)
  const goToStep2 = async () => {
    if (!selected) return;
    setLoading(true);
    const { data: userRow } = await supabase.from("users").select("first_name").eq("id", userId).single();
    if (userRow?.first_name) setUserName(userRow.first_name);
    await supabase.from("users").update({ user_type: selected }).eq("id", userId);
    setLoading(false);
    setStep(2);
  };

  // Step 2 → Generate first hooks (Personalize → First Generate)
  const generateFirstHook = async () => {
    if (!keyword.trim() || !niche || !platform) return;
    setGenerating(true);
    setError("");

    // Persist personalization — niche, goal, language, and (for business) campaign context.
    // Stored as a jsonb blob so we don't need repeated schema migrations as this grows.
    const onboarding_profile: Record<string, string> = { goal, preferred_language: language };
    if (selected === "business") {
      onboarding_profile.business_type = businessType;
      onboarding_profile.monthly_budget = monthlyBudget;
      onboarding_profile.age_group = ageGroup;
      onboarding_profile.target_location = targetLocation;
    }
    await supabase.from("users").update({ niche, onboarding_profile }).eq("id", userId);

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content:
            `Generate 5 viral hooks for "${keyword}" on ${platform} in the ${niche} niche.
             ${goal ? `The goal is: ${goal}.` : ""}
             Return ONLY a JSON array of 5 hook strings. No explanation.
             Example: ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"]`
          }],
          max_tokens: 600
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setHooks(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
      setStep(3);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setGenerating(false);
  };

  // Save hook to library
  const saveHook = async (hook: string, idx: number) => {
    await supabase.from("content_library").insert({
      user_id: userId, content: hook,
      type: "hook", niche, platform
    });
    setSavedIdx(prev => new Set(Array.from(prev).concat(idx)));
  };

  // Step 3 → Step 4 (First Generate → Dashboard Ready)
  const goToStep4 = async () => {
    const { data: userRow } = await supabase.from("users").select("credits_remaining").eq("id", userId).single();
    if (userRow?.credits_remaining != null) setCredits(userRow.credits_remaining);
    setStep(4);
  };

  // Finish onboarding
  const finish = () => onComplete(selected!);

  const roleLabel = CARDS.find(c => c.id === selected)?.title || "Creator";
  const roleEmoji = CARDS.find(c => c.id === selected)?.emoji || "🎨";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .ch { transition:all .22s; cursor:pointer; }
        .ch:hover { transform:translateY(-4px); }
        @media(max-width:640px){.three-grid{grid-template-columns:1fr!important} .two-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#06040f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden", padding:"1rem" }}>

        {/* BG */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", top:"-20%", left:"-10%", background:"radial-gradient(circle,rgba(139,92,246,.25) 0%,transparent 70%)", animation:"orb1 12s ease-in-out infinite", filter:"blur(80px)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(139,92,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.03) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        </div>

        <div style={{ maxWidth:680, width:"100%", position:"relative", zIndex:1, animation:"slideUp .5s ease" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:".65rem", marginBottom:"1.25rem" }}>
              <div style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:"12px", padding:".5rem .8rem", fontSize:"1.2rem" }}>⚡</div>
              <span style={{ fontWeight:800, fontSize:"1.1rem", background:"linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VCI — Viral Content Intelligence</span>
            </div>

            {/* Step indicator — now 4 steps */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".4rem", marginBottom:"1.25rem" }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".65rem", fontWeight:800,
                    background: step >= s ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "rgba(255,255,255,.06)",
                    color: step >= s ? "#fff" : "#444",
                    border: step === s ? "2px solid #a855f7" : "none"
                  }}>{step > s ? "✓" : s}</div>
                  {s < 4 && <div style={{ width:28, height:1, background: step > s ? "#7c3aed" : "#1a1a2e" }} />}
                </div>
              ))}
            </div>
            <p style={{ textAlign:"center", color:"#3f3f46", fontSize:".62rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", margin:0 }}>
              {["", "Choose Workspace", "Personalize", "First Generate", "Dashboard Ready"][step]}
            </p>
          </div>

          {/* ─── STEP 1: Choose Workspace ─── */}
          {step === 1 && (
            <div style={{ animation:"slideUp .4s ease", marginTop:"1.25rem" }}>
              <h1 style={{ fontWeight:900, fontSize:"clamp(1.6rem,3.5vw,2.2rem)", margin:"0 0 .5rem", textAlign:"center", background:"linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                How will you use VCI?
              </h1>
              <p style={{ color:"#52525b", fontSize:".88rem", textAlign:"center", margin:"0 0 1.75rem", lineHeight:1.7 }}>
                This helps us show the right tools and platforms for you.
              </p>

              <div className="three-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".85rem", marginBottom:"1.5rem" }}>
                {CARDS.map(card => (
                  <div key={card.id} className="ch" onClick={() => setSelected(card.id)}
                    style={{ background:selected===card.id?card.bg:"rgba(255,255,255,.02)", border:`2px solid ${selected===card.id?card.color:"rgba(255,255,255,.06)"}`, borderRadius:"18px", padding:"1.5rem 1.1rem", textAlign:"center", boxShadow:selected===card.id?`0 0 40px ${card.glow}`:"none" }}>
                    <div style={{ fontSize:"2.2rem", marginBottom:".65rem" }}>{card.emoji}</div>
                    <h2 style={{ fontWeight:800, fontSize:".95rem", color:"#fff", margin:"0 0 .4rem" }}>{card.title}</h2>
                    <p style={{ color:"#52525b", fontSize:".72rem", lineHeight:1.6, margin:0 }}>{card.desc}</p>
                    {selected===card.id && <div style={{ marginTop:".65rem", background:card.bg, border:`1px solid ${card.color}66`, borderRadius:"7px", padding:".25rem", color:card.color, fontSize:".68rem", fontWeight:700 }}>✓ Selected</div>}
                  </div>
                ))}
              </div>

              <button onClick={goToStep2} disabled={!selected||loading}
                style={{ width:"100%", padding:".9rem", borderRadius:"12px", background:!selected?"rgba(139,92,246,.1)":`linear-gradient(135deg,${continueColor},${continueColor}cc)`, border:"none", color:!selected?"#555":"#fff", fontWeight:800, fontSize:".95rem", cursor:!selected||loading?"not-allowed":"pointer", boxShadow:selected?`0 8px 28px ${continueColor}40`:"none", transition:"all .25s" }}>
                {loading ? "Setting up..." : selected ? `Continue as ${CARDS.find(c=>c.id===selected)?.title} →` : "Select your role to continue"}
              </button>
              <p style={{ textAlign:"center", color:"#27272a", fontSize:".68rem", marginTop:".75rem" }}>You can change this anytime from settings</p>
            </div>
          )}

          {/* ─── STEP 2: Personalize ─── */}
          {step === 2 && (
            <div style={{ animation:"slideUp .4s ease" }}>
              <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
                <div style={{ fontSize:"2rem", marginBottom:".5rem" }}>{roleEmoji}</div>
                <h1 style={{ fontWeight:900, fontSize:"clamp(1.4rem,3vw,2rem)", margin:"0 0 .4rem", color:"#fff" }}>
                  Tell us a bit about you
                </h1>
                <p style={{ color:"#52525b", fontSize:".85rem", margin:0, lineHeight:1.7 }}>
                  We'll tailor content and suggestions to match your goals.
                </p>
              </div>

              <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:"16px", padding:"1.4rem", display:"flex", flexDirection:"column", gap:"1rem" }}>

                {/* Niche */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>What do you create?</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                    {NICHES.map(n => (
                      <button key={n} onClick={() => setNiche(n)}
                        style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${niche===n?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:niche===n?"rgba(124,58,237,.12)":"transparent", color:niche===n?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Platform</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${platform===p?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:platform===p?"rgba(124,58,237,.12)":"transparent", color:platform===p?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Your Main Goal</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                    {currentGoals.map(g => (
                      <button key={g.label} onClick={() => setGoal(g.label)}
                        style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${goal===g.label?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:goal===g.label?"rgba(124,58,237,.12)":"transparent", color:goal===g.label?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                        {g.emoji} {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Language */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Preferred Language</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                    {LANGUAGES.map(l => (
                      <button key={l} onClick={() => setLanguage(l)}
                        style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${language===l?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:language===l?"rgba(124,58,237,.12)":"transparent", color:language===l?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business-only fields */}
                {selected === "business" && (
                  <>
                    <div style={{ height:1, background:"#141426", margin:".2rem 0" }} />
                    <div>
                      <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Business / Product Type</label>
                      <input value={businessType} onChange={e => setBusinessType(e.target.value)}
                        placeholder="e.g. Real Estate, Fashion Store, SaaS..."
                        style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".7rem .9rem", color:"#fff", fontSize:".85rem", fontFamily:"inherit", outline:"none" }} />
                    </div>
                    <div className="two-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".8rem" }}>
                      <div>
                        <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Target Location</label>
                        <input value={targetLocation} onChange={e => setTargetLocation(e.target.value)}
                          placeholder="e.g. India, Mumbai..."
                          style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".7rem .9rem", color:"#fff", fontSize:".85rem", fontFamily:"inherit", outline:"none" }} />
                      </div>
                      <div>
                        <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Age Group</label>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                          {AGE_GROUPS.map(a => (
                            <button key={a} onClick={() => setAgeGroup(a)}
                              style={{ padding:".3rem .55rem", borderRadius:"6px", border:`1px solid ${ageGroup===a?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:ageGroup===a?"rgba(124,58,237,.12)":"transparent", color:ageGroup===a?"#a855f7":"#52525b", fontWeight:700, fontSize:".68rem", cursor:"pointer", fontFamily:"inherit" }}>
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Monthly Ad Budget (optional)</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                        {BUDGETS.map(b => (
                          <button key={b} onClick={() => setMonthlyBudget(b)}
                            style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${monthlyBudget===b?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:monthlyBudget===b?"rgba(124,58,237,.12)":"transparent", color:monthlyBudget===b?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit" }}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ height:1, background:"#141426", margin:".2rem 0" }} />
                  </>
                )}

                {/* Keyword */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Your Keyword or Topic</label>
                  <input
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder={selected==="business" ? "e.g. running shoes, weight loss supplement..." : "e.g. weight loss, saree styling, home cooking..."}
                    style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".7rem .9rem", color:"#fff", fontSize:".85rem", fontFamily:"inherit", outline:"none" }}
                    onKeyDown={e => e.key === "Enter" && generateFirstHook()}
                  />
                </div>

                {error && <p style={{ color:"#f87171", fontSize:".75rem", margin:0 }}>⚠️ {error}</p>}

                <button onClick={generateFirstHook}
                  disabled={!keyword.trim()||!niche||!platform||generating}
                  style={{ width:"100%", padding:".85rem", borderRadius:"11px", background:(!keyword.trim()||!niche||!platform)?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:(!keyword.trim()||!niche||!platform)?"#3f3f46":"#fff", fontWeight:800, fontSize:".9rem", cursor:(!keyword.trim()||!niche||!platform)||generating?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", transition:"all .2s" }}>
                  {generating
                    ? <><span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block" }} /> Generating your first hooks...</>
                    : "⚡ Continue"
                  }
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: First Generate Results ─── */}
          {step === 3 && (
            <div style={{ animation:"slideUp .4s ease" }}>
              <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"2rem", marginBottom:".4rem" }}>🎉</div>
                <h1 style={{ fontWeight:900, fontSize:"clamp(1.4rem,3vw,1.9rem)", margin:"0 0 .35rem", color:"#fff" }}>
                  Your first hooks are ready
                </h1>
                <p style={{ color:"#52525b", fontSize:".82rem", margin:0 }}>
                  Save the ones you like — they'll be in your Library forever.
                </p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:".55rem", marginBottom:"1.25rem" }}>
                {hooks.map((hook, i) => {
                  const isSaved = savedIdx.has(i);
                  return (
                    <div key={i} style={{ background:"#080810", border:`1px solid ${isSaved?"rgba(34,197,94,.3)":"#141426"}`, borderRadius:"12px", padding:".9rem 1rem", display:"flex", gap:".75rem", alignItems:"flex-start", transition:"border-color .2s" }}>
                      <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#6d28d9,#7c3aed)",color:"#fff",fontSize:".62rem",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:".1rem" }}>{i+1}</div>
                      <p style={{ flex:1, color:"#e2e8f0", fontSize:".83rem", lineHeight:1.7, margin:0 }}>{hook}</p>
                      <button onClick={() => saveHook(hook, i)}
                        style={{ flexShrink:0, background:isSaved?"rgba(34,197,94,.1)":"rgba(124,58,237,.08)", border:`1px solid ${isSaved?"rgba(34,197,94,.3)":"rgba(124,58,237,.2)"}`, color:isSaved?"#22c55e":"#a855f7", padding:".25rem .65rem", borderRadius:"7px", cursor:isSaved?"default":"pointer", fontSize:".68rem", fontWeight:800, fontFamily:"inherit", transition:"all .18s", whiteSpace:"nowrap" }}>
                        {isSaved ? "✓ Saved" : "💾 Save"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {savedIdx.size > 0 && (
                <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:"10px", padding:".65rem 1rem", marginBottom:"1rem", display:"flex", gap:".5rem", alignItems:"center" }}>
                  <span style={{ fontSize:".85rem" }}>💾</span>
                  <p style={{ color:"#4ade80", fontSize:".78rem", margin:0 }}>
                    <strong>{savedIdx.size} hook{savedIdx.size>1?"s":""} saved</strong> to your Library. They'll always be there when you need them.
                  </p>
                </div>
              )}

              <button onClick={goToStep4}
                style={{ width:"100%", padding:".9rem", borderRadius:"12px", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", fontWeight:800, fontSize:".95rem", cursor:"pointer", boxShadow:"0 8px 28px rgba(109,40,217,.4)" }}>
                Continue →
              </button>
            </div>
          )}

          {/* ─── STEP 4: Dashboard Ready ─── */}
          {step === 4 && (
            <div style={{ animation:"slideUp .4s ease", textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(34,197,94,0.1)", border:"2px solid rgba(34,197,94,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.1rem", fontSize:"1.8rem" }}>
                ✅
              </div>
              <h1 style={{ fontWeight:900, fontSize:"clamp(1.5rem,3.2vw,2rem)", margin:"0 0 .5rem", color:"#fff" }}>
                Your dashboard is ready{userName ? `, ${userName}` : ""}! 🎉
              </h1>
              <p style={{ color:"#52525b", fontSize:".88rem", margin:"0 0 1.75rem", lineHeight:1.7 }}>
                Everything's set up as a <strong style={{ color:continueColor }}>{roleLabel}</strong> workspace — you're ready to start creating.
              </p>

              <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:"16px", padding:"1.4rem", marginBottom:"1.5rem", textAlign:"left" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                  <span style={{ color:"#3f3f46", fontSize:".62rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase" }}>Your Setup</span>
                  <span style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", color:"#22c55e", fontSize:".65rem", fontWeight:700, padding:".15rem .55rem", borderRadius:"20px" }}>{credits} credits ready</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
                  {[
                    { icon: roleEmoji, label: "Workspace", value: roleLabel },
                    { icon: "🎯", label: "Niche", value: niche || "—" },
                    { icon: "🌐", label: "Platform", value: platform || "—" },
                    ...(goal ? [{ icon: "🏁", label: "Goal", value: goal }] : []),
                    { icon: "🗣️", label: "Language", value: language },
                  ].map(row => (
                    <div key={row.label} style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
                      <span style={{ fontSize:".9rem", width:20, textAlign:"center", flexShrink:0 }}>{row.icon}</span>
                      <span style={{ color:"#52525b", fontSize:".72rem", width:80, flexShrink:0 }}>{row.label}</span>
                      <span style={{ color:"#e2e8f0", fontSize:".78rem", fontWeight:600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={finish}
                style={{ width:"100%", padding:".95rem", borderRadius:"12px", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", fontWeight:800, fontSize:".95rem", cursor:"pointer", boxShadow:"0 8px 28px rgba(109,40,217,.4)" }}>
                Go to Dashboard — Start Creating →
              </button>
              <p style={{ textAlign:"center", color:"#27272a", fontSize:".68rem", marginTop:".75rem" }}>
                You have {credits} free credits remaining · No card required
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}