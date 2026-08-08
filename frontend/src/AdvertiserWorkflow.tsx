import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════
// ADVERTISER WORKFLOW — 5-step guided campaign builder
// 1. Goal  2. Audience  3. AI Generate  4. Review  5. Launch
// Self-contained (own API call) so it doesn't depend on / risk breaking
// any existing Advertiser tool component.
// ═══════════════════════════════════════════════════════════════════════
export default function AdvertiserWorkflow({ plan, usageCount, limit, onUpgrade, langStrict, onSaveHistory, onCreditUsed }: any) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 — Goal
  const [goal, setGoal] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // Step 2 — Audience
  const [targetLocation, setTargetLocation] = useState("India");
  const [ageGroup, setAgeGroup] = useState<string[]>([]);
  const [interest, setInterest] = useState("");

  // Step 3 — Generate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [selectedAd, setSelectedAd] = useState<"A" | "B">("A");

  // Step 5 — Launch
  const [platform, setPlatform] = useState("Google Ads");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const GOALS = [
    { emoji: "🎯", label: "Get More Leads" },
    { emoji: "💰", label: "Increase Sales" },
    { emoji: "🌐", label: "Boost Website Traffic" },
    { emoji: "📢", label: "Build Brand Awareness" },
  ];
  const BUDGETS = ["₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000+"];
  const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"];
  const PLATFORMS = [
    { id: "Google Ads", emoji: "📢", color: "#4285f4" },
    { id: "Meta Ads", emoji: "📘", color: "#1877f2" },
    { id: "Instagram Ads", emoji: "📸", color: "#e1306c" },
    { id: "LinkedIn Ads", emoji: "💼", color: "#0077b5" },
  ];

  const PLATFORM_GUIDE: Record<string, string> = {
    "Google Ads": "Search-intent driven — the reader is actively searching, not scrolling passively. Headline must be tight (~30 characters), lead with the exact benefit or keyword match. Description (~90 characters) should add a supporting detail + CTA. No fluff, no scroll-stopping tricks — clarity wins on search.",
    "Meta Ads": "Scroll-stopping for a passive social feed — the reader wasn't looking for this. Headline should create curiosity or state a clear benefit fast. Body can be slightly longer and more conversational, native to a Facebook/Instagram feed tone. Avoid anything that reads like traditional 'ad language'.",
    "Instagram Ads": "Visual-first, aesthetic, aspirational or relatable tone — this runs in Instagram feed/Reels/Stories. Short, punchy copy that works even if the reader only reads the first line. Emoji use is natural here. CTA should feel like a natural next step, not a hard sell.",
    "LinkedIn Ads": "Professional, B2B-credible tone — no consumer-style hype or emojis. Lead with a business outcome or insight, not an entertainment hook. Headline should state a clear professional benefit (ROI, efficiency, growth). Body can be slightly longer, data/credibility-oriented. CTA should be professional (Request Demo, Download Report, Book a Call).",
  };

  const CHAR_LIMITS: Record<string, { headline: number; body: number; headlineCount?: number; descCount?: number }> = {
    "Google Ads":    { headline: 30, body: 90, headlineCount: 15, descCount: 4 }, // Responsive Search Ads spec
    "Meta Ads":      { headline: 40, body: 125 },
    "Instagram Ads": { headline: 40, body: 125 },
    "LinkedIn Ads":  { headline: 70, body: 150 },
  };
  const isGoogleRSA = platform === "Google Ads";

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const wizardBox = { background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem" } as const;
  const label = { color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.45rem" } as const;
  const chip = (active: boolean, col = "#06b6d4") => ({ background: active ? `${col}18` : "#080808", border: `1px solid ${active ? col : "#1f1f1f"}`, color: active ? col : "#52525b", padding: "0.4rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.2s" } as const);
  const input = { width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.8rem 1rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", fontFamily: "'Inter',sans-serif" } as const;
  const nextBtn = (enabled: boolean) => ({ flex: 1, padding: "0.95rem", borderRadius: "12px", background: enabled ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#111", border: "none", color: enabled ? "#000" : "#404040", fontWeight: 800, fontSize: "0.9rem", cursor: enabled ? "pointer" : "not-allowed", fontFamily: "'Inter',sans-serif" } as const);
  const backBtn = { padding: "0.95rem 1.1rem", borderRadius: "12px", background: "transparent", border: "1px solid #1f1f1f", color: "#71717a", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" } as const;

  const generate = async () => {
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const limits = CHAR_LIMITS[platform];

    const outputSchema = isGoogleRSA
      ? `{
  "audience_avatar": "2-3 sentence persona description",
  "ad_angles": ["angle 1", "angle 2", "angle 3"],
  "headlines": ["h1", "h2", ... exactly 15 headlines, EACH 30 characters or fewer],
  "descriptions": ["d1", "d2", "d3", "d4" — exactly 4 descriptions, EACH 90 characters or fewer],
  "usp": "one sentence USP",
  "landing_page_headline": "...",
  "roi_note": "1-2 honest sentences about what to expect"
}`
      : `{
  "audience_avatar": "2-3 sentence persona description",
  "ad_angles": ["angle 1", "angle 2", "angle 3"],
  "ad_copy_a": {"headline": "max ${limits.headline} characters", "body": "max ${limits.body} characters", "cta": "..."},
  "ad_copy_b": {"headline": "max ${limits.headline} characters", "body": "max ${limits.body} characters", "cta": "..."},
  "usp": "one sentence USP",
  "landing_page_headline": "...",
  "roi_note": "1-2 honest sentences about what to expect"
}`;

    const formatInstruction = isGoogleRSA
      ? `OUTPUT FORMAT — Google Responsive Search Ads: Generate EXACTLY 15 distinct headlines, each STRICTLY 30 characters or fewer (count characters carefully — this is a hard platform limit, not a suggestion). Generate EXACTLY 4 distinct descriptions, each STRICTLY 90 characters or fewer.

HEADLINE QUALITY BAR — this is critical: headlines must be genuinely persuasive ad copy, NOT generic category labels or store-directory-style tags. 
BANNED style: plain nouns or category names with no benefit or hook ("Women's Kurtas", "Men's Shirts", "Clothing Store", "Fashion Sale", "Shop Now" alone) — these are directory listings, not ads.
REQUIRED style: each headline should do ONE of — state a specific concrete benefit ("Save 2Hrs Every Week"), a real number/stat/offer specific to THIS business (not invented), a sharp question, a clear differentiator, or a strong CTA paired with a benefit ("Get 20% Off Today"). Use the business/product, goal, and interest details given below to make headlines SPECIFIC to this business — a stranger reading them should learn something concrete, not just the product category.
Cover a genuine mix of angles across the 15: some benefit-led, some offer/urgency-led (only if real), some question-led, some social-proof-led, some CTA-led. No near-duplicate headlines, no two headlines saying the same thing in different words.`
      : `OUTPUT FORMAT — ${platform}: Generate 2 ad copy variations (A/B test). Each headline must be STRICTLY ${limits.headline} characters or fewer. Each body must be STRICTLY ${limits.body} characters or fewer. Count characters carefully — these are real platform limits, not suggestions. If a draft runs long, tighten the wording rather than exceeding the limit.

HEADLINE QUALITY BAR: headlines must be specific and persuasive — a concrete benefit, number, question, or differentiator tied to THIS business — never a generic category label like "Clothing Store" or "Shop Now" with nothing else. Use the business/product and goal details below to make it specific, not generic template copy.`;

    const prompt = `You are an expert performance marketing strategist who writes ad copy that passes Google Ads and Meta Ads policy review on the first submission. Build a complete ad campaign package specifically for ${platform}.

GOAL: ${goal}
BUSINESS/PRODUCT: ${businessType || "not specified"}
MONTHLY BUDGET: ${monthlyBudget || "not specified"}
TARGET LOCATION: ${targetLocation}
AGE GROUP(S): ${ageGroup.length ? ageGroup.join(", ") : "broad"}
INTEREST/NICHE: ${interest || "general"}
LANGUAGE: ${langStrict}

PLATFORM: ${platform}
PLATFORM-SPECIFIC WRITING RULES (the ad copy must feel native to ${platform}, not generic — follow this closely):
${PLATFORM_GUIDE[platform]}

${formatInstruction}

PLATFORM COMPLIANCE RULES — the ad copy MUST follow these, no exceptions:
- No unverifiable superlative or absolute claims ("best", "#1", "guaranteed", "cure", "instant results") — Google Ads rejects these without third-party proof
- Never imply knowledge of the reader's personal attributes, health conditions, financial situation, or body — no "Struggling with X?" style personal call-outs. This is a hard Meta Ads and Google Ads policy violation (personalized attribute targeting/insinuation)
- No before/after body image framing, no shock or fear-based hooks, no discriminatory or exclusionary language
- No fake urgency or fake scarcity ("only 3 left", "offer ends in 1 hour") unless it is a real, verifiable fact about this specific business
- Google Ads headline should work within a ~30 character feel (short, punchy) and description within a ~90 character feel — write concisely even though this isn't a strict platform character-count field
- Claims must be specific and honest — a real benefit or feature, not a vague promise
- CTA text should be a standard, platform-recognized action (Learn More, Shop Now, Sign Up, Book Now, Get Quote, Contact Us) rather than an invented phrase

Generate a complete, ready-to-launch, policy-safe campaign package:
- One detailed audience avatar (name, daily pain points, desires, buying triggers) — this is for internal targeting reference only, never copied into ad text
- 3 distinct ad angles (different policy-safe psychological approaches: e.g. concrete benefit, social proof, real limited-time offer)
- One clear USP (unique selling point) statement, stated as a specific fact/feature, not a superlative
- One landing page headline suggestion
- A brief, honest ROI expectation note (qualitative, not a fake guaranteed number)

Respond ONLY in JSON:
${outputSchema}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2400, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setResult(parsed);
      setStep(4);
      if (onCreditUsed) onCreditUsed();
      if (onSaveHistory) onSaveHistory("adwizard", { platform, inputSummary: `${goal} — ${businessType}`, resultData: parsed });
    } catch { setError("Generation failed. Try again."); }
    setLoading(false);
  };

  const reset = () => {
    setStep(1); setGoal(""); setBusinessType(""); setMonthlyBudget("");
    setTargetLocation("India"); setAgeGroup([]); setInterest("");
    setResult(null); setError("");
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Progress Stepper */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "2px" }}>
        {[
          { n: 1, label: "Goal" },
          { n: 2, label: "Audience" },
          { n: 3, label: "AI Generate" },
          { n: 4, label: "Review" },
          { n: 5, label: "Launch" },
        ].map((s, i, arr) => {
          const done = step > s.n;
          const active = step === s.n;
          const reachable = s.n === 1 || !!result || step >= s.n;
          return (
            <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : "none", minWidth: "fit-content" }}>
              <button onClick={() => reachable && setStep(s.n as any)} disabled={!reachable}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: reachable ? "pointer" : "default", padding: 0 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, background: done ? "#22c55e" : active ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#0f0f0f", border: `1.5px solid ${done ? "#22c55e" : active ? "#06b6d4" : "#1f1f1f"}`, color: done || active ? "#000" : "#3f3f46" }}>
                  {done ? "✓" : s.n}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: active ? 800 : 600, color: active ? "#fff" : done ? "#22c55e" : "#3f3f46", whiteSpace: "nowrap" }}>{s.label}</span>
              </button>
              {i < arr.length - 1 && <div style={{ flex: 1, height: 1.5, minWidth: 16, margin: "0 0.5rem", background: done ? "#22c55e" : "#1a1a1a" }} />}
            </div>
          );
        })}
      </div>

      {/* STEP 1 — GOAL */}
      {step === 1 && (
        <div style={wizardBox}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🎯</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>What is your main goal?</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>This shapes every ad angle we write</p>
            </div>
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label style={label}>GOAL</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {GOALS.map(g => (
                <button key={g.label} onClick={() => setGoal(g.label)} style={chip(goal === g.label)}>{g.emoji} {g.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label style={label}>BUSINESS / PRODUCT</label>
            <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g. Real Estate, Fashion Store, SaaS..." style={input} />
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label style={label}>PLATFORM</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  style={{ background: platform === p.id ? `${p.color}18` : "#080808", border: `1px solid ${platform === p.id ? p.color : "#1f1f1f"}`, color: platform === p.id ? p.color : "#52525b", padding: "0.4rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
                  {p.emoji} {p.id}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={label}>MONTHLY BUDGET (optional)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {BUDGETS.map(b => (
                <button key={b} onClick={() => setMonthlyBudget(b)} style={chip(monthlyBudget === b, "#8b5cf6")}>{b}</button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!goal || !businessType.trim()} style={{ ...nextBtn(!!goal && !!businessType.trim()), marginTop: "1rem" }}>
            Continue to Audience →
          </button>
        </div>
      )}

      {/* STEP 2 — AUDIENCE */}
      {step === 2 && (
        <div style={wizardBox}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>👤</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Who are you targeting?</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Rough details are fine — AI will build the full persona</p>
            </div>
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label style={label}>TARGET LOCATION</label>
            <input value={targetLocation} onChange={e => setTargetLocation(e.target.value)} placeholder="e.g. India, Mumbai..." style={input} />
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label style={label}>AGE GROUP (select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {AGE_GROUPS.map(a => (
                <button key={a}
                  onClick={() => setAgeGroup(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                  style={chip(ageGroup.includes(a), "#8b5cf6")}>{a}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={label}>INTEREST / NICHE</label>
            <input value={interest} onChange={e => setInterest(e.target.value)} placeholder="e.g. Property, Investment, Fitness..." style={input} />
          </div>

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
            <button onClick={() => setStep(1)} style={backBtn}>← Back</button>
            <button onClick={() => setStep(3)} style={nextBtn(true)}>Continue to AI Generate →</button>
          </div>
        </div>
      )}

      {/* STEP 3 — AI GENERATE */}
      {step === 3 && (
        <div style={wizardBox}>
          {!loading ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "1.3rem" }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Ready to generate your campaign</h3>
                  <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>{goal} · {businessType} · {targetLocation}</p>
                </div>
              </div>

              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.85rem", marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.4rem", color: "#3f3f46", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em" }}>VCI WILL BUILD</p>
                {["Audience Avatar", "3 Ad Angles", "A/B Ad Copy Variations", "USP", "Landing Page Headline", "ROI Expectations"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.2rem 0" }}>
                    <span style={{ color: "#06b6d4", fontSize: "0.7rem" }}>✓</span>
                    <span style={{ color: "#a1a1aa", fontSize: "0.78rem" }}>{item}</span>
                  </div>
                ))}
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button onClick={() => setStep(2)} style={backBtn}>← Back</button>
                <button onClick={generate} style={nextBtn(true)}>⚡ Generate Campaign</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ width: 56, height: 56, border: "3px solid #1f1f1f", borderTopColor: "#06b6d4", borderRadius: "50%", margin: "0 auto 1.25rem", animation: "spin 0.9s linear infinite" }} />
              <p style={{ color: "#06b6d4", fontWeight: 800, fontSize: "0.95rem", margin: "0 0 0.3rem" }}>VCI is generating your campaign...</p>
              <p style={{ color: "#3f3f46", fontSize: "0.72rem" }}>Usually takes 10-15 seconds</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 — REVIEW */}
      {step === 4 && result && (
        <div>
          {/* Campaign parameters summary — so budget/age/platform aren't lost after generation */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "0.85rem 1rem", marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              { icon: "🎯", val: goal },
              { icon: (PLATFORMS.find(p => p.id === platform)?.emoji || "📢"), val: platform },
              { icon: "📍", val: targetLocation },
              ...(ageGroup.length ? [{ icon: "👤", val: ageGroup.join(", ") }] : []),
              ...(monthlyBudget ? [{ icon: "💰", val: monthlyBudget }] : []),
            ].map((tag, i) => (
              <span key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "0.3rem 0.7rem", fontSize: "0.72rem", color: "#a1a1aa", fontWeight: 600 }}>
                {tag.icon} {tag.val}
              </span>
            ))}
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.65rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>👤 AUDIENCE AVATAR</p>
            <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.82rem", lineHeight: 1.6 }}>{result.audience_avatar}</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.6rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎯 AD ANGLES</p>
            {(result.ad_angles || []).map((a: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "#8b5cf6", fontSize: "0.72rem", flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>

          <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            {isGoogleRSA ? "🧪 15 HEADLINES + 4 DESCRIPTIONS FOR GOOGLE ADS" : `🧪 A/B AD COPY FOR ${platform.toUpperCase()}`}
            <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "10px", letterSpacing: "normal" }}>✓ Google & Meta policy-safe</span>
          </p>

          {isGoogleRSA ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#4285f4", fontWeight: 800, fontSize: "0.78rem" }}>Headlines ({(result.headlines || []).length}/15 · max 30 chars)</span>
                  <button onClick={() => copyText((result.headlines || []).join("\n"), "allheadlines")}
                    style={{ background: copiedKey === "allheadlines" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "allheadlines" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "allheadlines" ? "#22c55e" : "#555", padding: "0.15rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700 }}>
                    {copiedKey === "allheadlines" ? "✓ Copied!" : "Copy All"}
                  </button>
                </div>
                {(result.headlines || []).map((h: string, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0", borderBottom: i < result.headlines.length - 1 ? "1px solid #141414" : "none" }}>
                    <span style={{ color: "#d4d4d8", fontSize: "0.8rem" }}>{h}</span>
                    <span style={{ color: h.length > 30 ? "#ef4444" : "#3f3f46", fontSize: "0.62rem", fontWeight: 700, flexShrink: 0, marginLeft: "0.5rem" }}>{h.length}/30</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#4285f4", fontWeight: 800, fontSize: "0.78rem" }}>Descriptions ({(result.descriptions || []).length}/4 · max 90 chars)</span>
                  <button onClick={() => copyText((result.descriptions || []).join("\n"), "alldescs")}
                    style={{ background: copiedKey === "alldescs" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "alldescs" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "alldescs" ? "#22c55e" : "#555", padding: "0.15rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700 }}>
                    {copiedKey === "alldescs" ? "✓ Copied!" : "Copy All"}
                  </button>
                </div>
                {(result.descriptions || []).map((d: string, i: number) => (
                  <div key={i} style={{ padding: "0.35rem 0", borderBottom: i < result.descriptions.length - 1 ? "1px solid #141414" : "none" }}>
                    <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.78rem", lineHeight: 1.5 }}>{d}</p>
                    <span style={{ color: d.length > 90 ? "#ef4444" : "#3f3f46", fontSize: "0.62rem", fontWeight: 700 }}>{d.length}/90</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.75rem" }}>
            {(["A", "B"] as const).map(v => {
              const ad = v === "A" ? result.ad_copy_a : result.ad_copy_b;
              const isSel = selectedAd === v;
              const lim = CHAR_LIMITS[platform];
              return (
                <div key={v} onClick={() => setSelectedAd(v)}
                  style={{ background: isSel ? "rgba(6,182,212,0.08)" : "#0f0f0f", border: `1.5px solid ${isSel ? "#06b6d4" : "#1f1f1f"}`, borderRadius: "12px", padding: "0.85rem", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ color: isSel ? "#06b6d4" : "#71717a", fontWeight: 800, fontSize: "0.78rem" }}>Ad Copy {v}</span>
                    {isSel && <span style={{ color: "#06b6d4", fontSize: "0.68rem" }}>✓ Selected</span>}
                  </div>
                  <p style={{ margin: "0 0 0.15rem", color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>{ad?.headline}</p>
                  <p style={{ margin: "0 0 0.35rem", color: (ad?.headline?.length || 0) > lim.headline ? "#ef4444" : "#3f3f46", fontSize: "0.62rem", fontWeight: 700 }}>{ad?.headline?.length || 0}/{lim.headline} chars</p>
                  <p style={{ margin: "0 0 0.15rem", color: "#a1a1aa", fontSize: "0.75rem", lineHeight: 1.5 }}>{ad?.body}</p>
                  <p style={{ margin: "0 0 0.5rem", color: (ad?.body?.length || 0) > lim.body ? "#ef4444" : "#3f3f46", fontSize: "0.62rem", fontWeight: 700 }}>{ad?.body?.length || 0}/{lim.body} chars</p>
                  <span style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", fontSize: "0.68rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "6px" }}>{ad?.cta} →</span>
                </div>
              );
            })}
          </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.62rem", color: "#22c55e", fontWeight: 700 }}>💎 USP</p>
              <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{result.usp}</p>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.62rem", color: "#ec4899", fontWeight: 700 }}>🖥️ LANDING PAGE</p>
              <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{result.landing_page_headline}</p>
            </div>
          </div>

          {result.roi_note && (
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", padding: "0.75rem 0.9rem", marginBottom: "1rem" }}>
              <p style={{ margin: 0, color: "#fbbf24", fontSize: "0.75rem", lineHeight: 1.5 }}>📊 {result.roi_note}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => setStep(3)} style={backBtn}>← Back</button>
            <button onClick={() => setStep(5)} style={{ ...nextBtn(true), background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#000" }}>Looks Good — Continue to Launch →</button>
          </div>
        </div>
      )}

      {/* STEP 5 — LAUNCH */}
      {step === 5 && result && (
        <div>
          <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.03))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀</div>
            <p style={{ margin: "0 0 0.3rem", color: "#fff", fontWeight: 800, fontSize: "1rem" }}>Ready to launch!</p>
            <p style={{ margin: 0, color: "#52525b", fontSize: "0.78rem" }}>Choose your platform, then copy your campaign assets.</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={label}>PLATFORM (selected in Step 1)</label>
            {(() => { const p = PLATFORMS.find(pl => pl.id === platform); return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${p?.color}18`, border: `1px solid ${p?.color}`, color: p?.color, padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.82rem", fontWeight: 700 }}>
                {p?.emoji} {p?.id}
              </span>
            ); })()}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
            {(isGoogleRSA ? [
              { k: "headline", label: "📝 Copy All 15 Headlines", text: (result.headlines || []).join("\n") },
              { k: "body", label: "💬 Copy All 4 Descriptions", text: (result.descriptions || []).join("\n") },
              { k: "landing", label: "🖥️ Copy Landing Page Headline", text: result.landing_page_headline },
            ] : [
              { k: "headline", label: "📝 Copy Selected Ad Headline", text: (selectedAd === "A" ? result.ad_copy_a : result.ad_copy_b)?.headline },
              { k: "body", label: "💬 Copy Selected Ad Body", text: (selectedAd === "A" ? result.ad_copy_a : result.ad_copy_b)?.body },
              { k: "landing", label: "🖥️ Copy Landing Page Headline", text: result.landing_page_headline },
            ]).map(row => (
              <button key={row.k} onClick={() => copyText(row.text || "", row.k)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", cursor: "pointer", color: "#fff" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{row.label}</span>
                <span style={{ color: copiedKey === row.k ? "#22c55e" : "#52525b", fontSize: "0.75rem", fontWeight: 700 }}>{copiedKey === row.k ? "✓ Copied" : "Copy"}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => setStep(4)} style={backBtn}>← Back</button>
            <button onClick={reset} style={nextBtn(true)}>🚀 Build Another Campaign</button>
          </div>
        </div>
      )}
    </div>
  );
}