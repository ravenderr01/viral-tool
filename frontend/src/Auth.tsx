import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Legal from "./Legal";

const DEFAULT_REVIEWS = [
  { name: "Rahul S.", role: "Instagram Creator", review: "Generated 20 viral hooks in 10 seconds. My reel hit 100K views!", stars: 5 },
  { name: "Priya M.", role: "Digital Marketer", review: "The Google Ads copy saved me hours. Highly recommend VCI!", stars: 5 },
  { name: "Arjun K.", role: "YouTuber", review: "30-day calendar changed my posting strategy completely.", stars: 5 },
  { name: "Sneha R.", role: "Fitness Coach", review: "Hook Score helped me understand why content wasn't performing!", stars: 5 },
  { name: "Vikram T.", role: "Agency Owner", review: "We use VCI for all clients. Saves 5+ hours per week!", stars: 5 },
  { name: "Ananya D.", role: "Lifestyle Blogger", review: "Instagram captions doubled my engagement in 2 weeks.", stars: 5 },
  { name: "Mohit G.", role: "E-commerce Owner", review: "Meta Ads copy is incredible. ROAS improved by 3x!", stars: 5 },
  { name: "Deepak N.", role: "LinkedIn Consultant", review: "Best tool for LinkedIn content. Professional hooks every time.", stars: 5 },
];

const DEMO_CASES = [
  {
    platform: "Instagram",
    emoji: "📸",
    color: "#e1306c",
    before: {
      hook: "5 weight loss tips that work",
      views: 234,
      grade: "D",
      score: 28,
      issues: ["Too generic", "No emotion", "Boring opener"],
    },
    after: {
      hook: "I lost 10kg without the gym — here's exactly what I did 🔥",
      views: 47200,
      grade: "A",
      score: 91,
      wins: ["Emotional & personal", "Curiosity gap", "Platform-perfect"],
    },
  },
  {
    platform: "YouTube",
    emoji: "▶️",
    color: "#ef4444",
    before: {
      hook: "How to make money online in 2024",
      views: 412,
      grade: "D",
      score: 31,
      issues: ["Overused title", "No specificity", "Zero intrigue"],
    },
    after: {
      hook: "I made ₹1.2L in 30 days with zero investment (Full breakdown)",
      views: 89400,
      grade: "A",
      score: 94,
      wins: ["Specific numbers", "Personal proof", "Promise of value"],
    },
  },
  {
    platform: "LinkedIn",
    emoji: "💼",
    color: "#0077b5",
    before: {
      hook: "Here are some tips for productivity",
      views: 89,
      grade: "F",
      score: 19,
      issues: ["Vague opener", "No hook", "Forgettable"],
    },
    after: {
      hook: "I work 4 hours a day and out-earn most people working 12. Here's the system:",
      views: 34700,
      grade: "A",
      score: 96,
      wins: ["Bold claim", "Creates curiosity", "Professional tone"],
    },
  },
];

function BeforeAfterDemo() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState<"before" | "transforming" | "after" | "counting">("before");
  const [displayViews, setDisplayViews] = useState(0);
  const [progress, setProgress] = useState(0);

  const demo = DEMO_CASES[demoIndex];

  useEffect(() => {
    let t1: any, t2: any, t3: any, t4: any;

    if (phase === "before") {
      setDisplayViews(demo.before.views);
      setProgress(0);
      t1 = setTimeout(() => setPhase("transforming"), 2500);
    }

    if (phase === "transforming") {
      // Progress bar animation
      let p = 0;
      const pInterval = setInterval(() => {
        p += 2;
        setProgress(p);
        if (p >= 100) {
          clearInterval(pInterval);
          setPhase("after");
        }
      }, 30);
      return () => clearInterval(pInterval);
    }

    if (phase === "after") {
      setDisplayViews(0);
      t2 = setTimeout(() => setPhase("counting"), 300);
    }

    if (phase === "counting") {
      const target = demo.after.views;
      const duration = 1800;
      const steps = 60;
      const increment = target / steps;
      let current = demo.before.views;
      const countInterval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(countInterval);
          t3 = setTimeout(() => {
            setPhase("before");
            t4 = setTimeout(() => setDemoIndex(i => (i + 1) % DEMO_CASES.length), 100);
          }, 2800);
        }
        setDisplayViews(Math.floor(current));
      }, duration / steps);
      return () => clearInterval(countInterval);
    }

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [phase, demoIndex]);

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const gradeColor = (g: string) => ({
    A: "#22c55e", B: "#06b6d4", C: "#f59e0b", D: "#f97316", F: "#ef4444"
  }[g] || "#71717a");

  const isAfter = phase === "after" || phase === "counting";

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>

      {/* Platform indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {DEMO_CASES.map((d, i) => (
            <div key={i} style={{
              width: i === demoIndex ? 20 : 6, height: 6,
              borderRadius: "3px",
              background: i === demoIndex ? demo.color : "#1f1f1f",
              transition: "all 0.4s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.75rem" }}>{demo.emoji}</span>
          <span style={{ color: demo.color, fontSize: "0.7rem", fontWeight: 700 }}>{demo.platform}</span>
        </div>
      </div>

      {/* Main demo card */}
      <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden" }}>

        {/* Card header */}
        <div style={{ background: "#0d0d0d", borderBottom: "1px solid #111", padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", opacity: 0.6 }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", opacity: 0.6 }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.6 }} />
          </div>
          <span style={{ color: "#3f3f46", fontSize: "0.62rem", fontFamily: "monospace", flex: 1, textAlign: "center" }}>getvci.com</span>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
        </div>

        <div style={{ padding: "1.1rem" }}>

          {/* BEFORE section */}
          <div style={{ marginBottom: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <span style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "4px", letterSpacing: "0.04em" }}>BEFORE VCI</span>
              <div style={{ flex: 1, height: 1, background: "#111" }} />
            </div>

            <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "10px", padding: "0.75rem" }}>
              <p style={{ margin: "0 0 0.6rem", color: "#71717a", fontSize: "0.8rem", lineHeight: 1.5, fontStyle: "italic" }}>"{demo.before.hook}"</p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: gradeColor(demo.before.grade), fontWeight: 900, fontSize: "1.2rem", lineHeight: 1 }}>{demo.before.grade}</div>
                    <div style={{ color: "#2a2a2a", fontSize: "0.55rem", fontWeight: 600 }}>GRADE</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.9rem" }}>{demo.before.score}/100</div>
                    <div style={{ color: "#2a2a2a", fontSize: "0.55rem", fontWeight: 600 }}>SCORE</div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ef4444", fontWeight: 800, fontSize: "1rem" }}>
                    {formatViews(demo.before.views)}
                  </div>
                  <div style={{ color: "#2a2a2a", fontSize: "0.6rem" }}>views 😢</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {demo.before.issues.map((issue, i) => (
                  <span key={i} style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "0.58rem", padding: "0.1rem 0.45rem", borderRadius: "4px", fontWeight: 500 }}>✗ {issue}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Transform section */}
          <div style={{ marginBottom: "0.85rem" }}>
            {phase === "transforming" ? (
              <div style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: 14, height: 14, border: "2px solid #3f3f46", borderTopColor: "#6d28d9", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                  <span style={{ color: "#8b5cf6", fontSize: "0.75rem", fontWeight: 600 }}>VCI is analyzing & rewriting...</span>
                </div>
                <div style={{ background: "#0a0a0a", borderRadius: "4px", height: 4, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6d28d9, #8b5cf6)", borderRadius: "4px", transition: "width 0.05s linear" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                  <span style={{ color: "#3f3f46", fontSize: "0.58rem" }}>Real trend data injected</span>
                  <span style={{ color: "#6d28d9", fontSize: "0.6rem", fontWeight: 700 }}>{progress}%</span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: 1, background: "#111" }} />
                <div style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "20px", padding: "0.2rem 0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.6rem" }}>⚡</span>
                  <span style={{ color: "#8b5cf6", fontSize: "0.62rem", fontWeight: 600 }}>VCI transformed</span>
                </div>
                <div style={{ flex: 1, height: 1, background: "#111" }} />
              </div>
            )}
          </div>

          {/* AFTER section */}
          {isAfter && (
            <div style={{ animation: "slideUp 0.4s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "4px", letterSpacing: "0.04em" }}>AFTER VCI</span>
                <div style={{ flex: 1, height: 1, background: "#111" }} />
              </div>

              <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "10px", padding: "0.75rem" }}>
                <p style={{ margin: "0 0 0.6rem", color: "#e4e4e7", fontSize: "0.82rem", lineHeight: 1.5, fontWeight: 500 }}>"{demo.after.hook}"</p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: gradeColor(demo.after.grade), fontWeight: 900, fontSize: "1.2rem", lineHeight: 1 }}>{demo.after.grade}</div>
                      <div style={{ color: "#3f3f46", fontSize: "0.55rem", fontWeight: 600 }}>GRADE</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#22c55e", fontWeight: 800, fontSize: "0.9rem" }}>{demo.after.score}/100</div>
                      <div style={{ color: "#3f3f46", fontSize: "0.55rem", fontWeight: 600 }}>SCORE</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", transition: "all 0.1s" }}>
                      {formatViews(displayViews)}
                    </div>
                    <div style={{ color: "#3f3f46", fontSize: "0.6rem" }}>views 🔥</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {demo.after.wins.map((win, i) => (
                    <span key={i} style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "0.58rem", padding: "0.1rem 0.45rem", borderRadius: "4px", fontWeight: 500 }}>✓ {win}</span>
                  ))}
                </div>

                {/* Growth badge */}
                {phase === "counting" && displayViews > demo.before.views * 5 && (
                  <div style={{ marginTop: "0.6rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "0.4rem 0.65rem", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideUp 0.3s ease" }}>
                    <span style={{ color: "#52525b", fontSize: "0.65rem" }}>Growth vs before</span>
                    <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "0.82rem" }}>
                      +{Math.round((demo.after.views / demo.before.views - 1) * 100).toLocaleString()}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [reviews, setReviews] = useState<any[]>([]);
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | "refund" | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      if (!firstName || !lastName || !phone) { setError("Please fill all fields."); setLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("users").update({ first_name: firstName, last_name: lastName, phone }).eq("id", data.user.id);
      }
      setMessage("✅ Account created! Please login.");
      setMode("login");
    }
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin();
    }
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("✅ Reset link sent! Check your email.");
    }
    setLoading(false);
  };

  if (showLegal) return <Legal page={showLegal} onBack={() => setShowLegal(null)} />;

  const allReviews = [...DEFAULT_REVIEWS, ...reviews];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; font-family: 'Inter', sans-serif; }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .auth-input {
          width: 100%; background: #0a0a0a; border: 1px solid #1f1f1f;
          border-radius: 10px; padding: 0.85rem 1rem; color: #f5f5f5;
          font-size: 0.9rem; font-family: 'Inter', sans-serif; outline: none;
          transition: all 0.2s; box-sizing: border-box;
        }
        .auth-input:focus { border-color: #6d28d9; background: #0d0d0d; box-shadow: 0 0 0 3px rgba(109,40,217,0.1); }
        .auth-input::placeholder { color: #404040; }
        .submit-btn {
          width: 100%; padding: 0.9rem; border-radius: 10px; border: none;
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(109,40,217,0.25); }
        .submit-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .mode-link { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .mode-link:hover { opacity: 0.75; }
        .marquee-track { display: flex; animation: marquee 40s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
        @media (max-width: 900px) { .auth-left { display: none !important; } .auth-right { width: 100% !important; min-height: 100vh; padding: 1.75rem 1.25rem !important; justify-content: flex-start !important; padding-top: 2.5rem !important; } .auth-right > div { max-width: 100% !important; width: 100% !important; } .auth-input { font-size: 1rem !important; padding: 0.9rem 1rem !important; -webkit-appearance: none; } .submit-btn { padding: 1rem !important; font-size: 0.95rem !important; } } @media (max-width: 400px) { .auth-right { padding: 1.5rem 1rem !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", fontFamily: "'Inter', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #0f0f0f", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#0f0f0f 1px, transparent 1px), linear-gradient(90deg, #0f0f0f 1px, transparent 1px)", backgroundSize: "44px 44px", opacity: 0.5 }} />
          <div style={{ position: "absolute", top: -80, left: "20%", width: 350, height: 350, background: "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "2.5rem 3rem", overflowY: "auto" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2.5rem" }}>
              <div style={{ width: 30, height: 30, background: "#6d28d9", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>⚡</div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>VCI</span>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.06em" }}>VIRAL CONTENT INTELLIGENCE</span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "0.2rem 0.7rem", marginBottom: "1rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 500 }}>500+ creators & agencies use VCI</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem,2.8vw,2.5rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "0.75rem", color: "#fff" }}>
                Stop guessing.<br />
                <span style={{ color: "#6d28d9" }}>Start going viral.</span>
              </h1>
              <p style={{ color: "#71717a", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: 380 }}>
                See exactly how VCI transforms weak content into viral posts — backed by real YouTube & Google trend data.
              </p>
            </div>

            {/* Before/After Demo */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ color: "#52525b", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>LIVE BEFORE / AFTER DEMO</span>
              </div>
              <BeforeAfterDemo />
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
              {[
                { num: "10x", label: "Faster than manual" },
                { num: "15+", label: "Platforms" },
                { num: "30+", label: "Languages" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em" }}>{s.num}</div>
                  <div style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 500, marginTop: "0.1rem" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Reviews marquee */}
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#3f3f46", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.65rem", fontFamily: "'DM Mono', monospace" }}>CREATOR REVIEWS</div>
              <div className="marquee-track">
                {[...allReviews, ...allReviews].map((r, i) => (
                  <div key={i} style={{ background: "#080808", border: "1px solid #111", borderRadius: "8px", padding: "0.65rem 0.85rem", minWidth: "190px", maxWidth: "190px", marginRight: "0.5rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#d4d4d8", fontWeight: 600, fontSize: "0.7rem" }}>{r.name}</span>
                      <span style={{ color: "#713f12", fontSize: "0.55rem" }}>{"★".repeat(r.stars)}</span>
                    </div>
                    <div style={{ color: "#3f3f46", fontSize: "0.58rem", marginBottom: "0.25rem" }}>{r.role}</div>
                    <p style={{ color: "#52525b", fontSize: "0.65rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>"{r.review}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right" style={{ width: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 3rem", background: "#000", overflowY: "auto", borderLeft: "1px solid #111", boxSizing: "border-box" }}>

          <div style={{ width: "100%", maxWidth: 400, animation: "slideUp 0.4s ease" }}>

            {/* Logo mark — mobile only feel */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6d28d9,#7c3aed)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>VCI</span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.55rem", letterSpacing: "-0.03em", marginBottom: "0.4rem", lineHeight: 1.2 }}>
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Get started for free" : "Reset your password"}
              </h2>
              <p style={{ color: "#52525b", fontSize: "0.84rem", lineHeight: 1.6 }}>
                {mode === "login" ? "Sign in to your VCI account to continue" : mode === "signup" ? "Join 500+ creators already using VCI" : "Enter your email and we'll send a reset link"}
              </p>
            </div>

            {/* Mode toggle pill */}
            {mode !== "forgot" && (
              <div style={{ display: "flex", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "3px", marginBottom: "1.5rem" }}>
                {(["login", "signup"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none", background: mode === m ? "#1a1a1a" : "transparent", color: mode === m ? "#fff" : "#52525b", fontWeight: mode === m ? 600 : 400, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}>
                    {m === "login" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {mode === "signup" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.65rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>First name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" className="auth-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Last name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Phone number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="auth-input" />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: "block", color: "#71717a", fontSize: "0.72rem", fontWeight: 500, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>Email address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <label style={{ color: "#71717a", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.01em" }}>Password</label>
                    {mode === "login" && (
                      <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="mode-link"
                        style={{ color: "#6d28d9", fontSize: "0.72rem", fontWeight: 500 }}>Forgot password?</button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password}
                      onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      className="auth-input" style={{ paddingRight: "3.5rem" }} />
                    <button onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "0.65rem 0.85rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ color: "#f87171", fontSize: "0.8rem", lineHeight: 1.5 }}>{error}</span>
                </div>
              )}
              {message && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px", padding: "0.65rem 0.85rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ color: "#4ade80", fontSize: "0.8rem", lineHeight: 1.5 }}>{message}</span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="submit-btn"
                style={{ background: loading ? "#0d0d0d" : "linear-gradient(135deg,#6d28d9,#7c3aed)", color: loading ? "#3f3f46" : "#fff", border: loading ? "1px solid #1a1a1a" : "none", marginTop: "0.1rem", letterSpacing: "0.01em" }}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span style={{ width: 14, height: 14, border: "2px solid #333", borderTopColor: "#6d28d9", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Please wait...
                    </span>
                  : mode === "login" ? "Sign in" : mode === "signup" ? "Create free account" : "Send reset link"
                }
              </button>
            </div>

            {/* Back to login for forgot */}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="mode-link"
                style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center" as const, marginTop: "1rem", display: "block", width: "100%" }}>
                ← Back to sign in
              </button>
            )}

            {/* Free plan perks */}
            {mode !== "forgot" && (
              <div style={{ marginTop: "1.5rem", padding: "1rem 1.1rem", background: "#060606", border: "1px solid #141414", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ color: "#3f3f46", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                    {mode === "signup" ? "FREE PLAN INCLUDES" : "WHAT YOU GET"}
                  </span>
                  <span style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", color: "#8b5cf6", fontSize: "0.62rem", fontWeight: 600, padding: "0.1rem 0.5rem", borderRadius: "4px" }}>No card required</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {(mode === "signup"
                    ? ["10 free credits to start", "Viral hooks & title ideas", "Hook scoring (A–F grade)", "Instagram, YouTube & more"]
                    : ["All your generated content", "Hook scores & analytics", "30-day content calendar", "Pro plans from ₹299/mo"]
                  ).map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ color: "#52525b", fontSize: "0.72rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "1.75rem", textAlign: "center" as const }}>
              <p style={{ color: "#2a2a2a", fontSize: "0.63rem", lineHeight: 1.8 }}>
                © {new Date().getFullYear()} Global Web Info Vision &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("privacy")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Privacy</button>
                &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("terms")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Terms</button>
                &nbsp;·&nbsp;
                <button onClick={() => setShowLegal("refund")} className="mode-link" style={{ color: "#2a2a2a", fontSize: "0.63rem" }}>Refund</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}