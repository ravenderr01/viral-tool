import { useState } from "react";
import { supabase } from "./supabaseClient";

const QUIZ_QUESTIONS = [
  {
    id: "interest",
    question: "What topics excite you the most?",
    emoji: "🎯",
    options: [
      { value: "ai_tech", label: "AI & Technology", emoji: "🤖" },
      { value: "finance", label: "Finance & Money", emoji: "💰" },
      { value: "fitness", label: "Fitness & Health", emoji: "💪" },
      { value: "entertainment", label: "Comedy & Entertainment", emoji: "😂" },
      { value: "education", label: "Education & Skills", emoji: "📚" },
      { value: "lifestyle", label: "Lifestyle & Vlogs", emoji: "✨" },
      { value: "business", label: "Business & Startup", emoji: "🚀" },
      { value: "food", label: "Food & Cooking", emoji: "🍳" },
    ]
  },
  {
    id: "time",
    question: "How much time can you give daily?",
    emoji: "⏰",
    options: [
      { value: "30min", label: "30 minutes", emoji: "⚡" },
      { value: "1-2hr", label: "1-2 hours", emoji: "🕐" },
      { value: "3hr+", label: "3+ hours", emoji: "🔥" },
    ]
  },
  {
    id: "goal",
    question: "What's your main goal?",
    emoji: "🏆",
    options: [
      { value: "income", label: "Extra Income", emoji: "💸" },
      { value: "fulltime", label: "Full-time Creator", emoji: "🎬" },
      { value: "branding", label: "Personal Brand", emoji: "👑" },
      { value: "business", label: "Grow My Business", emoji: "📈" },
    ]
  },
  {
    id: "audience",
    question: "Who is your target audience?",
    emoji: "🌍",
    options: [
      { value: "india", label: "India Only", emoji: "🇮🇳" },
      { value: "worldwide", label: "Worldwide", emoji: "🌐" },
      { value: "hindi", label: "Hindi Speaking", emoji: "🗣️" },
      { value: "regional", label: "Regional Language", emoji: "📍" },
    ]
  },
  {
    id: "face",
    question: "Are you comfortable showing your face?",
    emoji: "🎭",
    options: [
      { value: "yes", label: "Yes, on camera!", emoji: "😊" },
      { value: "no", label: "No — Faceless content", emoji: "🎭" },
      { value: "maybe", label: "Maybe later", emoji: "🤔" },
    ]
  }
];

const NICHE_MAP: Record<string, any> = {
  ai_tech: {
    niche: "AI & Technology",
    platform: "YouTube Shorts + Instagram",
    trend: "9.8/10",
    competition: "Medium",
    income: "₹50K–3L/month",
    why: "AI content is exploding in 2026. Hindi mein bahut kam creators hain — huge opportunity!",
    ideas: [
      "Top 5 AI tools Indians must use in 2026",
      "ChatGPT se paise kaise kamaye — Step by step",
      "Free AI tools that replace paid software",
      "AI se YouTube channel kaise banaye",
      "Best AI image tools for Indians",
      "AI news weekly — Hindi mein",
      "Make money with AI from home 2026",
      "AI vs Human — who wins?",
      "ChatGPT hacks nobody tells you",
      "AI tools for students — Free"
    ]
  },
  finance: {
    niche: "Personal Finance",
    platform: "YouTube + Twitter/X",
    trend: "9.2/10",
    competition: "Medium-High",
    income: "₹40K–2L/month",
    why: "10Cr+ Indians searching for investment tips daily. SIP, stocks, crypto — all trending!",
    ideas: [
      "5 investment mistakes Indians make",
      "SIP vs FD — which is better 2026",
      "How to start investing with ₹500",
      "Best mutual funds for beginners",
      "Stock market basics Hindi mein",
      "Crypto guide for Indians 2026",
      "Tax saving tips for salaried people",
      "Emergency fund — how much to save",
      "Side income ideas that actually work",
      "Financial freedom by 35 — roadmap"
    ]
  },
  fitness: {
    niche: "Fitness & Wellness",
    platform: "Instagram Reels + YouTube",
    trend: "8.5/10",
    competition: "High",
    income: "₹30K–1.5L/month",
    why: "Post-COVID fitness awareness is huge. Home workout content is evergreen!",
    ideas: [
      "Home workout — no gym needed",
      "Lose weight in 30 days — realistic",
      "Indian diet plan for weight loss",
      "5 min morning routine that works",
      "Protein rich Indian foods",
      "Gym beginner guide — Hindi",
      "Yoga for beginners at home",
      "Before/After transformation story",
      "Why you are not losing weight",
      "Best budget supplements India"
    ]
  },
  entertainment: {
    niche: "Comedy & Entertainment",
    platform: "Instagram Reels + YouTube Shorts",
    trend: "8.8/10",
    competition: "High",
    income: "₹20K–5L/month",
    why: "Entertainment has the highest viral potential. One viral video = massive growth!",
    ideas: [
      "Relatable Indian office life skits",
      "Day in life of Indian student",
      "Indian mom vs reality — comedy",
      "Trending meme format videos",
      "Indian wedding chaos — funny",
      "Boss vs employee Indian version",
      "Online vs offline India difference",
      "Indian festivals funny side",
      "Gen Z vs Millennials India",
      "Indian food opinions — hot takes"
    ]
  },
  education: {
    niche: "Education & Skills",
    platform: "YouTube + LinkedIn",
    trend: "8.7/10",
    competition: "Medium",
    income: "₹40K–2L/month",
    why: "Online learning boom is real. Teaching one skill can build a massive audience!",
    ideas: [
      "Learn Python in 30 days — free",
      "English speaking tips for Indians",
      "Graphic design basics — free tools",
      "Digital marketing course Hindi",
      "Excel tricks that save hours",
      "Public speaking kaise improve kare",
      "Study techniques that actually work",
      "UPSC preparation strategy 2026",
      "Freelancing skills highest paid",
      "Resume tips for freshers India"
    ]
  },
  lifestyle: {
    niche: "Lifestyle & Daily Vlogs",
    platform: "Instagram + YouTube",
    trend: "8.3/10",
    competition: "Medium",
    income: "₹25K–1.5L/month",
    why: "Authentic lifestyle content builds deep connections. Brand deals come easily!",
    ideas: [
      "Day in my life — Indian student",
      "Morning routine that changed my life",
      "Minimalism in Indian household",
      "Budget living in metro city",
      "Work from home setup tour",
      "Productivity hacks I actually use",
      "Solo travel India on budget",
      "Skincare routine for Indian skin",
      "Weekend routine vlog",
      "My honest monthly expenses"
    ]
  },
  business: {
    niche: "Business & Entrepreneurship",
    platform: "LinkedIn + YouTube",
    trend: "9.0/10",
    competition: "Medium",
    income: "₹50K–3L/month",
    why: "Indian startup ecosystem is booming. Business advice content has huge brand deal potential!",
    ideas: [
      "How I started business with ₹10K",
      "Side hustle ideas that work in India",
      "Dropshipping India guide 2026",
      "Freelancing secrets — ₹1L/month",
      "Business ideas for college students",
      "How to get first client — zero experience",
      "Indian startup mistakes to avoid",
      "Work smart not hard — strategies",
      "Passive income India — realistic",
      "From job to business — my story"
    ]
  },
  food: {
    niche: "Food & Cooking",
    platform: "Instagram + YouTube",
    trend: "8.6/10",
    competition: "Medium-High",
    income: "₹25K–1.5L/month",
    why: "Food content is universally loved. Regional Indian recipes are massively trending!",
    ideas: [
      "10 min Indian breakfast ideas",
      "Street food recipes at home",
      "Healthy Indian meal prep — week",
      "Regional recipe series — state by state",
      "Budget meals for students",
      "Air fryer Indian recipes",
      "Biryani variations across India",
      "Desserts with 3 ingredients",
      "Protein rich Indian vegetarian meals",
      "Restaurant style food at home"
    ]
  }
};

export default function Onboarding({ userId, onComplete }: { userId: string; onComplete: (type: string) => void }) {
  const [step, setStep] = useState<"select" | "quiz" | "result">("select");
  const [selected, setSelected] = useState<"creator" | "business" | "new" | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleContinue = async () => {
    if (!selected) return;
    if (selected === "new") { setStep("quiz"); return; }
    setLoading(true);
    await supabase.from("users").update({ user_type: selected }).eq("id", userId);
    onComplete(selected);
    setLoading(false);
  };

  const handleQuizAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setQuizStep(quizStep + 1), 300);
    } else {
      setTimeout(() => setStep("result"), 300);
    }
  };

  const handleStartCreating = async () => {
    setLoading(true);
    await supabase.from("users").update({ user_type: "creator" }).eq("id", userId);
    onComplete("creator");
    setLoading(false);
  };

  const nicheData = NICHE_MAP[answers.interest] || NICHE_MAP.ai_tech;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .card-hover { transition: all 0.25s; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); }
        .option-btn { transition: all 0.2s; cursor: pointer; }
        .option-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden", padding: "1rem" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", bottom: "-15%", right: "-5%", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* STEP 1: SELECT ROLE */}
        {step === "select" && (
          <div style={{ maxWidth: 720, width: "100%", position: "relative", zIndex: 1, animation: "slideUp 0.5s ease" }}>

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
                Tell us about yourself so we can personalize your experience
              </p>
            </div>

            {/* 3 Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>

              {/* Creator */}
              <div className="card-hover" onClick={() => setSelected("creator")} style={{ background: selected === "creator" ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)", border: `2px solid ${selected === "creator" ? "#a855f7" : "rgba(255,255,255,0.06)"}`, borderRadius: "20px", padding: "1.75rem 1.25rem", textAlign: "center", boxShadow: selected === "creator" ? "0 0 40px rgba(168,85,247,0.2)" : "none" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎨</div>
                <h2 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: "0 0 0.5rem" }}>Content Creator</h2>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 1rem" }}>I create content for Instagram, YouTube, TikTok & more</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {["📸 Instagram Reels", "▶️ YouTube Videos", "🎵 TikTok Content"].map((f, i) => (
                    <span key={i} style={{ color: selected === "creator" ? "#a855f7" : "#444", fontSize: "0.72rem" }}>{f}</span>
                  ))}
                </div>
                {selected === "creator" && <div style={{ marginTop: "0.75rem", background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", borderRadius: "8px", padding: "0.3rem", color: "#a855f7", fontSize: "0.72rem", fontWeight: 700 }}>✓ Selected</div>}
              </div>

              {/* New Creator — CENTER HERO */}
              <div className="card-hover" onClick={() => setSelected("new")} style={{ background: selected === "new" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)", border: `2px solid ${selected === "new" ? "#22c55e" : "rgba(255,255,255,0.06)"}`, borderRadius: "20px", padding: "1.75rem 1.25rem", textAlign: "center", boxShadow: selected === "new" ? "0 0 40px rgba(34,197,94,0.2)" : "none", position: "relative" }}>
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", borderRadius: "20px", padding: "0.2rem 0.85rem", fontSize: "0.65rem", fontWeight: 800, whiteSpace: "nowrap" }}>🌟 NEW HERE</div>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🧭</div>
                <h2 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: "0 0 0.5rem" }}>I'm New — Guide Me!</h2>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 1rem" }}>Just starting out? We'll find your perfect niche & platform in 60 seconds!</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {["🎯 Find your niche", "📱 Best platform for you", "💡 First 10 content ideas"].map((f, i) => (
                    <span key={i} style={{ color: selected === "new" ? "#22c55e" : "#444", fontSize: "0.72rem" }}>{f}</span>
                  ))}
                </div>
                {selected === "new" && <div style={{ marginTop: "0.75rem", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "8px", padding: "0.3rem", color: "#22c55e", fontSize: "0.72rem", fontWeight: 700 }}>✓ Selected</div>}
              </div>

              {/* Business */}
              <div className="card-hover" onClick={() => setSelected("business")} style={{ background: selected === "business" ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.02)", border: `2px solid ${selected === "business" ? "#06b6d4" : "rgba(255,255,255,0.06)"}`, borderRadius: "20px", padding: "1.75rem 1.25rem", textAlign: "center", boxShadow: selected === "business" ? "0 0 40px rgba(6,182,212,0.2)" : "none" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📢</div>
                <h2 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: "0 0 0.5rem" }}>Business / Agency</h2>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 1rem" }}>I run ads, manage marketing or handle multiple clients</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {["📢 Google Ads", "📘 Meta Ads", "🎯 Ad Campaigns"].map((f, i) => (
                    <span key={i} style={{ color: selected === "business" ? "#06b6d4" : "#444", fontSize: "0.72rem" }}>{f}</span>
                  ))}
                </div>
                {selected === "business" && <div style={{ marginTop: "0.75rem", background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "8px", padding: "0.3rem", color: "#06b6d4", fontSize: "0.72rem", fontWeight: 700 }}>✓ Selected</div>}
              </div>
            </div>

            {/* Both option */}
            <div className="card-hover" onClick={() => setSelected("business")} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🚀</span>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>I do both — Content + Marketing</p>
                <p style={{ margin: 0, color: "#555", fontSize: "0.72rem" }}>Choose Business for full access to all features</p>
              </div>
            </div>

            {/* Continue */}
            <button onClick={handleContinue} disabled={!selected || loading} style={{ width: "100%", padding: "1rem", borderRadius: "14px", background: !selected ? "rgba(139,92,246,0.15)" : selected === "creator" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : selected === "new" ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: !selected ? "#555" : "#fff", fontWeight: 800, fontSize: "1rem", cursor: !selected || loading ? "not-allowed" : "pointer", boxShadow: selected ? "0 8px 32px rgba(139,92,246,0.3)" : "none", transition: "all 0.3s" }}>
              {loading ? "⚡ Setting up your workspace..." : selected === "new" ? "🧭 Find My Perfect Niche →" : selected ? `Continue as ${selected === "creator" ? "🎨 Creator" : "📢 Business"} →` : "Select your role to continue"}
            </button>

            <p style={{ textAlign: "center", color: "#333", fontSize: "0.7rem", marginTop: "1rem" }}>You can change this anytime from your profile settings</p>
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {step === "quiz" && (
          <div style={{ maxWidth: 560, width: "100%", position: "relative", zIndex: 1, animation: "slideUp 0.4s ease" }}>

            {/* Progress */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#6b7280", fontSize: "0.72rem" }}>Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</span>
                <span style={{ color: "#22c55e", fontSize: "0.72rem", fontWeight: 700 }}>{Math.round(((quizStep) / QUIZ_QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#22c55e)", borderRadius: "4px", width: `${(quizStep / QUIZ_QUESTIONS.length) * 100}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* Question */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{QUIZ_QUESTIONS[quizStep].emoji}</div>
              <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff", margin: 0 }}>
                {QUIZ_QUESTIONS[quizStep].question}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: QUIZ_QUESTIONS[quizStep].options.length > 4 ? "1fr 1fr" : "1fr", gap: "0.65rem" }}>
              {QUIZ_QUESTIONS[quizStep].options.map(opt => (
                <button key={opt.value} className="option-btn" onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[quizStep].id, opt.value)}
                  style={{ background: answers[QUIZ_QUESTIONS[quizStep].id] === opt.value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${answers[QUIZ_QUESTIONS[quizStep].id] === opt.value ? "#7c3aed" : "rgba(255,255,255,0.08)"}`, borderRadius: "12px", padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: "1.3rem" }}>{opt.emoji}</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem" }}>{opt.label}</span>
                </button>
              ))}
            </div>

            <p style={{ textAlign: "center", color: "#333", fontSize: "0.7rem", marginTop: "1.5rem" }}>
              Click to select — automatically goes to next question
            </p>
          </div>
        )}

        {/* STEP 3: RESULT — CREATOR ROADMAP */}
        {step === "result" && (
          <div style={{ maxWidth: 680, width: "100%", position: "relative", zIndex: 1, animation: "slideUp 0.5s ease", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.65rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em" }}>🧭 YOUR CREATOR ROADMAP IS READY!</span>
              </div>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2rem)", margin: "0 0 0.5rem", background: "linear-gradient(135deg,#fff,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Perfect Niche Found! 🎯
              </h1>
              <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>Based on your answers — personalized just for you</p>
            </div>

            {/* Niche Card */}
            <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(139,92,246,0.08))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "20px", padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                {[
                  { label: "🎯 Your Niche", value: nicheData.niche, color: "#a855f7" },
                  { label: "📱 Best Platform", value: nicheData.platform, color: "#06b6d4" },
                  { label: "📈 Trend Score", value: nicheData.trend, color: "#22c55e" },
                  { label: "💰 Income Potential", value: nicheData.income, color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.2rem", fontSize: "0.62rem", color: "#555", fontWeight: 600 }}>{item.label}</p>
                    <p style={{ margin: 0, color: item.color, fontWeight: 700, fontSize: "0.85rem" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.85rem" }}>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.62rem", color: "#22c55e", fontWeight: 700 }}>💡 WHY THIS IS PERFECT FOR YOU</p>
                <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.82rem", lineHeight: 1.6 }}>{nicheData.why}</p>
              </div>
            </div>

            {/* First 10 Ideas */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
              <p style={{ margin: "0 0 0.85rem", fontSize: "0.68rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.06em" }}>💡 YOUR FIRST 10 CONTENT IDEAS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {nicheData.ideas.map((idea: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#a855f7", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0, marginTop: "0.1rem" }}>{String(i + 1).padStart(2, "0")}.</span>
                    <span style={{ color: "#d4d4d8", fontSize: "0.8rem", lineHeight: 1.5 }}>{idea}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 30 Day Plan */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ margin: "0 0 0.85rem", fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>📅 YOUR 30-DAY ACTION PLAN</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { week: "Week 1", title: "Setup & Research", color: "#6d28d9", tasks: ["Channel/profile banao", "Bio & branding setup karo", "First 3 content ideas finalize karo"] },
                  { week: "Week 2", title: "First Content Live!", color: "#06b6d4", tasks: ["Video/reel 1 publish karo", "VCI se hooks generate karo", "Captions & hashtags ready karo"] },
                  { week: "Week 3", title: "Consistency Mode", color: "#22c55e", tasks: ["Roz 1 short post karo", "Trending topics use karo", "Audience se engage karo"] },
                  { week: "Week 4", title: "Analyze & Grow", color: "#f59e0b", tasks: ["Analytics dekho", "Best content zyada banao", "Collaboration dhundho"] },
                ].map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ background: `${w.color}18`, border: `1px solid ${w.color}30`, borderRadius: "8px", padding: "0.3rem 0.6rem", height: "fit-content", flexShrink: 0 }}>
                      <span style={{ color: w.color, fontSize: "0.62rem", fontWeight: 800 }}>{w.week}</span>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 0.3rem", color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{w.title}</p>
                      {w.tasks.map((t, j) => (
                        <p key={j} style={{ margin: "0 0 0.15rem", color: "#6b7280", fontSize: "0.72rem" }}>→ {t}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleStartCreating} disabled={loading} style={{ width: "100%", padding: "1rem", borderRadius: "14px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 8px 32px rgba(139,92,246,0.4)", marginBottom: "0.75rem" }}>
              {loading ? "⚡ Setting up..." : "⚡ Start Creating with VCI Now →"}
            </button>

            <p style={{ textAlign: "center", color: "#333", fontSize: "0.7rem", margin: 0 }}>
              VCI will use your niche to generate better content for you!
            </p>
          </div>
        )}
      </div>
    </>
  );
}