import { useState, useRef, useEffect } from "react";

const BACKEND = "https://viral-tool-1.onrender.com";

const SYSTEM_PROMPT = `You are  — the official AI guide for VCI (Viral Content Intelligence), a powerful content creation tool for creators, marketers, and agencies.

YOUR PERSONALITY:
- Friendly, helpful, enthusiastic about content creation
- Speak like a knowledgeable friend, not a robot
- Use emojis naturally to make conversations engaging
- Always be encouraging and solution-focused

ABOUT VCI TOOL — YOU KNOW EVERYTHING:
VCI has these features:
1. ⚡ VIRAL CONTENT GENERATOR — Generates viral hooks, titles, captions for any platform. Supports Instagram, YouTube, TikTok, LinkedIn, Twitter/X, Facebook, Pinterest, WhatsApp, Snapchat, Reddit, Meta Ads, Google Ads, YouTube Ads, Native Ads
2. 📊 HOOK SCORE ANALYZER — Analyzes any hook and gives scores for Curiosity, Emotion, Virality with improvement suggestions
3. 📅 30-DAY CONTENT CALENDAR — Creates a full month content plan for any platform (Instagram, YouTube, Facebook, TikTok, LinkedIn, Twitter/X, Pinterest)
4. 📦 ONE-CLICK CONTENT PACK — Generates complete content pack: hooks, titles, captions, scripts, hashtags for Instagram/TikTok, YouTube, or Ads
5. 📈 TREND INTELLIGENCE — Real Google Trends + YouTube trending data, country-wise

PLANS:
- Free: 10 credits (Instagram + YouTube only, English only)
- Starter ₹299: 75 credits/month (4 platforms, Hindi + English)
- Growth ₹799: 250 credits/month (Hook Score + AI Trends unlocked)
- Pro ₹1,999: 600 credits/month (Calendar + Content Pack unlocked)
- Agency ₹4,999: 1500 credits/month (Everything unlocked, all 15 languages)

HOW TO USE VCI:
1. Select your Niche (Fitness, Business, Tech, Lifestyle, Food, Daily Vlog, Comedy, Sports, Spirituality, etc.)
2. Select Platform (Social Media or Advertising)
3. Select Output Language
4. Enter your keyword/topic
5. Click Generate!

CREDITS SYSTEM:
- 1 credit = 1 generation
- Credits reset on 1st of every month
- Referral: Share your code → friend joins → both get +10 credits

LANGUAGE DETECTION:
- Detect the language the user is writing in
- Respond in THE SAME LANGUAGE always
- If Hindi → respond in Hindi, if English → respond in English, etc.

YOUR CAPABILITIES:
- Guide users on how to use any feature
- Suggest best platform for their content goals
- Give content strategy advice
- Help with niche selection
- Explain credit system and plans
- Troubleshoot issues
- Give viral content tips specific to their niche
- Suggest best posting times
- Help improve their hooks and captions

IMPORTANT RULES:
- ALWAYS detect user language and respond in same language
- Never make up features that don't exist in VCI
- Be encouraging — if someone is struggling, motivate them
- Keep responses concise but helpful (max 150 words unless explaining something complex)
- Use bullet points for lists
- Always end with a helpful follow-up question or tip`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VCIAssistant({ niche, platform, keyword, plan }: {
  niche: string;
  platform: string;
  keyword: string;
  plan: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm **** — your personal content strategy guide!\n\nI can help you:\n• 🎯 Choose the right platform & niche\n• ⚡ Generate better viral hooks\n• 📅 Plan your content strategy\n• 💡 Understand any VCI feature\n\nWhat would you like to create today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const contextNote = `
[USER CONTEXT — use this to give personalized advice:
- Currently selected Niche: ${niche}
- Currently selected Platform: ${platform}
- Current keyword: ${keyword || "not set yet"}
- User's Plan: ${plan}
]`;

      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${BACKEND}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            ...conversationHistory,
            { role: "user", content: contextNote + "\n\nUser message: " + userMsg }
          ],
          system: SYSTEM_PROMPT
        })
      });

      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "Sorry, I couldn't process that. Please try again!";

      setMessages(prev => [...prev, { role: "assistant", content: text }]);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again! 🙏" }]);
    }
    setLoading(false);
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '•');
  };

  const QUICK_QUESTIONS = [
    "How do I get viral hooks?",
    "Which plan should I choose?",
    "How to use content calendar?",
    "What are credits?",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "1.5rem",
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "#1a1a2e" : "linear-gradient(135deg, #7c3aed, #a855f7)",
          border: open ? "2px solid #a855f7" : "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          boxShadow: "0 4px 20px rgba(168,85,247,0.5)",
          transition: "all 0.3s",
        }}
      >
        {open ? "✕" : "🤖"}
        {unread > 0 && !open && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", borderRadius: "50%",
            width: 18, height: 18, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: 800, color: "#fff"
          }}>{unread}</div>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "8rem",
          right: "1.5rem",
          zIndex: 999,
          width: "min(380px, calc(100vw - 2rem))",
          height: "min(560px, calc(100vh - 10rem))",
          background: "#0a0a0f",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(168,85,247,0.15)",
          animation: "slideUp 0.3s ease",
          overflow: "hidden"
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2))",
            borderBottom: "1px solid rgba(168,85,247,0.2)",
            padding: "0.9rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", flexShrink: 0
            }}>🤖</div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#22c55e", fontSize: "0.65rem", fontWeight: 600 }}>Online — Ready to help</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", padding: "0.2rem 0.5rem" }}>
              <span style={{ color: "#a855f7", fontSize: "0.65rem", fontWeight: 700 }}>{plan.toUpperCase()}</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem"
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "0.4rem"
              }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                    : "rgba(255,255,255,0.05)",
                  border: msg.role === "assistant" ? "1px solid rgba(168,85,247,0.15)" : "none",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "0.6rem 0.85rem",
                  color: "#fff",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>🤖</div>
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "16px 16px 16px 4px", padding: "0.6rem 0.85rem", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", animation: `pulse 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 0.75rem 0.5rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); setTimeout(() => sendMessage(), 100); }}
                  style={{
                    background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
                    color: "#a855f7", borderRadius: "20px", padding: "0.25rem 0.65rem",
                    cursor: "pointer", fontSize: "0.7rem", fontWeight: 600,
                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s"
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            borderTop: "1px solid rgba(168,85,247,0.15)",
            padding: "0.75rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center"
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about VCI..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: "12px",
                padding: "0.6rem 0.9rem",
                color: "#fff",
                fontSize: "0.82rem",
                outline: "none",
                fontFamily: "'DM Sans',sans-serif",
                transition: "border 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#a855f7"}
              onBlur={e => e.target.style.borderColor = "rgba(168,85,247,0.2)"}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: !input.trim() ? "rgba(168,85,247,0.2)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                border: "none", cursor: !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", transition: "all 0.2s", flexShrink: 0
              }}>
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
