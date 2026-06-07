export default function Plans({ onBack, onUpgrade, currentPlan }: { onBack: () => void; onUpgrade: () => void; currentPlan: string }) {

  const plans = [
    {
      key: "free",
      name: "Free",
      price: "₹0",
      period: "",
      badge: "",
      color: "#555",
      borderColor: "#1e1e1e",
      generations: "3 total",
      features: [
        { text: "2 Niches (Fitness, Business)", included: true },
        { text: "2 Platforms (Instagram, YouTube)", included: true },
        { text: "English language only", included: true },
        { text: "3 total generations", included: true },
        { text: "Hook Score Analyzer", included: false },
        { text: "AI Trends", included: false },
        { text: "Content Calendar", included: false },
        { text: "Content Pack", included: false },
        { text: "Ads & Marketing niche", included: false },
        { text: "Google/Meta Ads platforms", included: false },
      ]
    },
    {
      key: "starter",
      name: "Starter",
      price: "₹499",
      period: "/month",
      badge: "🔥 Popular",
      color: "#22c55e",
      borderColor: "#22c55e",
      generations: "50/month",
      features: [
        { text: "All Niches (except Ads & Marketing)", included: true },
        { text: "4 Platforms (Instagram, YouTube, LinkedIn, X)", included: true },
        { text: "Hindi + English", included: true },
        { text: "50 generations/month", included: true },
        { text: "Hook Score Analyzer", included: false },
        { text: "AI Trends", included: false },
        { text: "Content Calendar", included: false },
        { text: "Content Pack", included: false },
        { text: "Ads & Marketing niche", included: false },
        { text: "Google/Meta Ads platforms", included: false },
      ]
    },
    {
      key: "pro",
      name: "Pro",
      price: "₹1,499",
      period: "/month",
      badge: "⚡ Best Value",
      color: "#a855f7",
      borderColor: "#a855f7",
      generations: "150/month",
      features: [
        { text: "All Niches including Ads & Marketing", included: true },
        { text: "All Platforms including Google/Meta Ads", included: true },
        { text: "Hindi + English", included: true },
        { text: "150 generations/month", included: true },
        { text: "Hook Score Analyzer", included: true },
        { text: "AI Trends", included: true },
        { text: "Content Calendar", included: false },
        { text: "Content Pack", included: false },
        { text: "Priority Support", included: true },
        { text: "Google/Meta Ads platforms", included: true },
      ]
    },
    {
      key: "agency",
      name: "Agency",
      price: "₹4,999",
      period: "/month",
      badge: "👑 Premium",
      color: "#f59e0b",
      borderColor: "#f59e0b",
      generations: "1000/month",
      features: [
        { text: "All Niches including Ads & Marketing", included: true },
        { text: "All Platforms including Google/Meta Ads", included: true },
        { text: "All 15 Languages", included: true },
        { text: "1000 generations/month", included: true },
        { text: "Hook Score Analyzer", included: true },
        { text: "AI Trends", included: true },
        { text: "30-Day Content Calendar", included: true },
        { text: "One-Click Content Pack", included: true },
        { text: "Priority Support (30-min response)", included: true },
        { text: "Google/Meta/Native Ads platforms", included: true },
      ]
    }
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card { transition: all 0.3s; }
        .upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5) !important; }
        .upgrade-btn { transition: all 0.3s; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Header */}
        <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(139,92,246,0.15)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "10px", padding: "0.4rem 0.7rem", fontSize: "1rem" }}>⚡</div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI — Viral Content Intelligence</span>
          </div>
          <button onClick={onBack} style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem", animation: "slideUp 0.5s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>💎 PRICING PLANS</span>
            </div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, margin: "0 0 0.75rem", background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Choose Your Plan
            </h1>
            <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
              Start free, upgrade when you're ready. No hidden charges.
            </p>
          </div>

          {/* Plans Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
            {plans.map((plan, i) => (
              <div key={plan.key} className="plan-card" style={{
                background: currentPlan === plan.key ? `${plan.color}08` : "#0d0d0d",
                border: `${currentPlan === plan.key ? "2" : "1"}px solid ${currentPlan === plan.key ? plan.color : "#1a1a1a"}`,
                borderRadius: "20px", padding: "1.75rem",
                position: "relative", animation: `slideUp ${0.3 + i * 0.1}s ease`
              }}>
                {/* Badge */}
                {plan.badge && (
                  <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#000", borderRadius: "20px", padding: "0.2rem 0.85rem", fontSize: "0.72rem", fontWeight: 800, whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif" }}>
                    {plan.badge}
                  </div>
                )}

                {/* Current plan indicator */}
                {currentPlan === plan.key && (
                  <div style={{ position: "absolute", top: "-12px", right: "1rem", background: "#22c55e", color: "#000", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.65rem", fontWeight: 800 }}>
                    ✓ Current
                  </div>
                )}

                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem" }}>{plan.name}</h3>

                <div style={{ marginBottom: "1.25rem" }}>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: "2.2rem", fontWeight: 900, color: plan.color }}>{plan.price}</span>
                  <span style={{ color: "#555", fontSize: "0.85rem" }}>{plan.period}</span>
                </div>

                <div style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30`, borderRadius: "8px", padding: "0.4rem 0.75rem", marginBottom: "1.25rem", display: "inline-block" }}>
                  <span style={{ color: plan.color, fontSize: "0.78rem", fontWeight: 700 }}>⚡ {plan.generations}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                      <span style={{ color: f.included ? "#22c55e" : "#2a2a2a", fontSize: "0.85rem", flexShrink: 0, marginTop: "0.05rem" }}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      <span style={{ color: f.included ? "#ccc" : "#333", fontSize: "0.78rem", lineHeight: 1.4 }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {plan.key === "free" ? (
                  <button onClick={onBack} style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: "#111", border: "1px solid #1e1e1e", color: "#555", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                    Current Plan
                  </button>
                ) : currentPlan === plan.key ? (
                  <button style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: "#22c55e18", border: "1px solid #22c55e", color: "#22c55e", fontWeight: 700, fontSize: "0.85rem", cursor: "default", fontFamily: "'Outfit',sans-serif" }}>
                    ✓ Active Plan
                  </button>
                ) : (
                  <button onClick={onUpgrade} className="upgrade-btn" style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, border: "none", color: plan.key === "starter" ? "#000" : "#fff", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: `0 8px 25px ${plan.color}40` }}>
                    Upgrade to {plan.name} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.3rem", margin: "0 0 1.25rem", color: "#fff", textAlign: "center" }}>❓ Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                ["How do I upgrade?", "Click 'Upgrade' on your desired plan, complete UPI/PayPal payment, and send screenshot on WhatsApp. Plan activated within 30-60 minutes."],
                ["Can I switch plans?", "Yes! You can upgrade or downgrade anytime. Contact us on WhatsApp for plan changes."],
                ["What payment methods?", "UPI (GPay, PhonePe, Paytm) for India. PayPal for international payments."],
                ["Is there a refund?", "Yes! 24-hour money-back guarantee. No questions asked. Contact us on WhatsApp."],
                ["Do generations reset monthly?", "Yes! All paid plan generations reset on the 1st of every month."],
              ].map(([q, a], i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "12px", padding: "1rem 1.25rem" }}>
                  <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>Q: {q}</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.82rem", lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "1.5rem", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
          <p style={{ color: "#2a2a2a", fontSize: "0.72rem", margin: 0 }}>© {new Date().getFullYear()} Global Web Info Vision — VCI. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
}