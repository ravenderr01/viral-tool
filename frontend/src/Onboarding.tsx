import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Onboarding({ userId, onComplete }: { userId: string; onComplete: (type: string) => void | Promise<void> }) {
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [selected, setSelected]   = useState<"creator" | "business" | "agency" | null>(null);
  const [niche, setNiche]         = useState("");
  const [platform, setPlatform]   = useState("");
  const [keyword, setKeyword]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks]         = useState<string[]>([]);
  const [savedIdx, setSavedIdx]   = useState<Set<number>>(new Set());
  const [error, setError]         = useState("");

  const CARDS = [
    { id: "creator"  as const, emoji:"🎨", title:"Content Creator",      desc:"I create content for Instagram, YouTube, TikTok & more", color:"#a855f7", bg:"rgba(168,85,247,0.1)", glow:"rgba(168,85,247,0.2)" },
    { id: "business" as const, emoji:"📢", title:"Advertiser / Business", desc:"I run ads and need ad copy, headlines, keywords",          color:"#06b6d4", bg:"rgba(6,182,212,0.1)",  glow:"rgba(6,182,212,0.2)"  },
    { id: "agency"   as const, emoji:"👑", title:"Agency",                desc:"I manage multiple clients — content and advertising",      color:"#f59e0b", bg:"rgba(245,158,11,0.1)", glow:"rgba(245,158,11,0.2)" },
  ];

  const NICHES     = ["Fitness","Fashion","Food","Finance","Education","Tech","Travel","Beauty","Business","Motivation","Health","Entertainment"];
  const PLATFORMS  = selected === "business"
    ? ["Google Ads","Meta Ads","YouTube Ads","LinkedIn Ads"]
    : ["Instagram","YouTube","LinkedIn","Twitter/X","TikTok","Facebook","WhatsApp"];

  const continueColor = selected === "creator" ? "#a855f7" : selected === "business" ? "#06b6d4" : "#f59e0b";

  // Step 1 → Step 2
  const goToStep2 = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase.from("users").update({ user_type: selected }).eq("id", userId);
    setLoading(false);
    setStep(2);
  };

  // Step 2 → Generate first hooks
  const generateFirstHook = async () => {
    if (!keyword.trim() || !niche || !platform) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content:
            `Generate 5 viral hooks for "${keyword}" on ${platform} in the ${niche} niche.
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

  // Finish onboarding
  const finish = () => onComplete(selected!);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        .ch { transition:all .22s; cursor:pointer; }
        .ch:hover { transform:translateY(-4px); }
        @media(max-width:640px){.three-grid{grid-template-columns:1fr!important}}
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

            {/* Step indicator */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".4rem", marginBottom:"1.25rem" }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".65rem", fontWeight:800,
                    background: step >= s ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "rgba(255,255,255,.06)",
                    color: step >= s ? "#fff" : "#444",
                    border: step === s ? "2px solid #a855f7" : "none"
                  }}>{step > s ? "✓" : s}</div>
                  {s < 3 && <div style={{ width:32, height:1, background: step > s ? "#7c3aed" : "#1a1a2e" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ─── STEP 1: Role Selection ─── */}
          {step === 1 && (
            <div style={{ animation:"slideUp .4s ease" }}>
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

          {/* ─── STEP 2: First Generation Setup ─── */}
          {step === 2 && (
            <div style={{ animation:"slideUp .4s ease" }}>
              <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
                <div style={{ fontSize:"2rem", marginBottom:".5rem" }}>⚡</div>
                <h1 style={{ fontWeight:900, fontSize:"clamp(1.4rem,3vw,2rem)", margin:"0 0 .4rem", color:"#fff" }}>
                  Let's generate your first hooks
                </h1>
                <p style={{ color:"#52525b", fontSize:".85rem", margin:0, lineHeight:1.7 }}>
                  Takes 8 seconds. You'll see exactly what VCI does.
                </p>
              </div>

              <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:"16px", padding:"1.4rem", display:"flex", flexDirection:"column", gap:"1rem" }}>

                {/* Niche */}
                <div>
                  <label style={{ fontSize:".68rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".45rem", letterSpacing:".05em", textTransform:"uppercase" }}>Your Niche</label>
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
                    : "⚡ Generate My First Hooks (Free)"
                  }
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Show Results + Save ─── */}
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

              <button onClick={finish}
                style={{ width:"100%", padding:".9rem", borderRadius:"12px", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", fontWeight:800, fontSize:".95rem", cursor:"pointer", boxShadow:"0 8px 28px rgba(109,40,217,.4)" }}>
                Go to Dashboard — Start Creating →
              </button>
              <p style={{ textAlign:"center", color:"#27272a", fontSize:".68rem", marginTop:".65rem" }}>
                You have 25 free credits remaining · No card required
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}