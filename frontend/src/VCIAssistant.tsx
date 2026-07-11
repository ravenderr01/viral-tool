import { useState, useRef, useEffect } from "react";

const BACKEND = "https://viral-tool-1.onrender.com";

const SYSTEM_PROMPT = `You are Vira — the official AI assistant for VCI (Viral Content Intelligence). You are a sharp, knowledgeable content strategy expert who knows every feature of VCI inside out.

YOUR PERSONALITY:
- Professional but warm — like a knowledgeable friend, not a corporate bot
- Confident and direct — give clear answers, no fluff
- Use emojis naturally, sparingly
- Always solution-focused
- Detect user language and respond in the SAME language always

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT VCI — COMPLETE KNOWLEDGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VCI is India's first all-in-one AI content tool for creators and advertisers. Built specifically for Indian creators — 7 Indian languages, India-specific platforms, ₹ pricing.

Website: getvci.com
Support WhatsApp: +91 9315133390
Telegram: @GetvciOfficial

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALL 18 TOOLS — EXACT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 CREATOR TOOLS (12):

1. ⚡ VIRAL CONTENT GENERATOR (1 credit)
   - Type keyword → get 5 viral hooks + 5 titles + 3 captions + trending topics
   - 15+ platforms: Instagram, YouTube, LinkedIn, Twitter/X, Facebook, WhatsApp, Pinterest, TikTok, Reddit, Snapchat, Meta Ads, Google Ads, YouTube Ads, Native Ads
   - 30+ languages including Hindi, Tamil, Telugu, Marathi, Gujarati, Bengali
   - Takes 8 seconds

2. 📊 HOOK SCORE ANALYZER (2 credits)
   - Paste any hook → get A-F grade
   - Scored on 4 dimensions: Curiosity, Emotion, Virality, Clarity
   - Identifies exact weak line
   - Gives 3 platform-specific rewrites

3. 📋 CAPTION & HASHTAG GENERATOR (2 credits)
   - 5 ready-to-post captions + 20 optimized hashtags
   - Platform rules auto-followed (Instagram ≠ LinkedIn ≠ WhatsApp)

4. 🔍 NICHE INTELLIGENCE (FREE - always)
   - Live YouTube trending + Google Trends data for your niche
   - Content gaps, best posting times, competition level

5. 📈 TRENDS FEED (FREE - always)
   - What's viral right now in your niche
   - Filter by platform and niche

6. 📅 30-DAY CONTENT CALENDAR (6 credits)
   - Full month planned in 1 click
   - Auto-variety: Tips/Story/Challenge/Motivation rotated
   - Platform-specific output

7. 📦 CONTENT PACK (5 credits)
   - 1 keyword → 50+ pieces of content
   - Choose: Instagram Pack, YouTube Pack, or Ads Pack

8. 🖼️ IMAGE AI (6 credits)
   - Upload product photo → AI reads it → writes hooks & captions
   - Product-specific, not generic

9. 🎬 SCRIPT LAB (8 + 3 + 5 credits)
   - Complete reel pipeline: Script → Thumbnail → AI Voice → Mix Studio → WAV
   - 10 script styles × 4 durations (15/30/60/90 sec) = 40 types
   - AI Voiceover: Hindi, Tamil, Telugu, Marathi, Gujarati, Bengali, English
   - Mix Studio: Upload voice / Record in browser / AI voice + music
   - Professional audio ducking (same as YouTube/radio productions)
   - Download WAV file — reel-ready

10. 🔄 AUTO-REPURPOSE ENGINE (5 credits)
    - 1 piece of content → 8 platforms natively rewritten
    - Each platform gets its own tone (LinkedIn ≠ WhatsApp ≠ TikTok)
    - Best platform recommendation included

11. 🕵️ COMPETITOR HOOK ANALYZER (2 credits)
    - Paste any viral content → virality score /100
    - Psychological triggers decoded
    - 3 original inspired versions for your niche

12. 💾 MY LIBRARY (Free to use)
    - Save hooks, titles, captions from any generation
    - Filter by type: Hooks / Titles / Captions / Scripts
    - Star favourites, copy, delete

📢 ADVERTISER TOOLS (7):

13. 📊 AD ROI CALCULATOR (Free to use)
    - Enter: Budget + CPC + Conversion Rate + Order Value
    - Get: Clicks, Conversions, Revenue, ROAS instantly
    - Color coded: Green (profitable), Amber (breakeven), Red (loss)
    - AI tips for optimisation

14. 🧪 A/B AD COPY GENERATOR (3 credits)
    - 2 completely different ad angles for same product
    - Meta Ads or Google Ads format
    - Different psychology: Fear vs Aspiration, Logic vs Emotion
    - How-to-test guide included

15. 🖥️ LANDING PAGE COPY (4 credits)
    - Complete page copy matched to your ad
    - Headline + Subheadline + Benefits + Social Proof + Urgency + Trust
    - How-to-use guide: paste into Shopify/WordPress/Wix

16. 💬 WHATSAPP & EMAIL COPY (2 credits)
    - WhatsApp Broadcast (3 messages, under 160 chars)
    - Email Campaign (subject lines + body + CTA)
    - Cold DM (3 approaches for Instagram/LinkedIn)

17. ✍️ BIO WRITER (1 credit)
    - 6 platforms: Instagram, LinkedIn, Twitter/X, YouTube, Facebook, WhatsApp Business
    - 3 bio variations + character counter + keywords
    - Platform character limits auto-enforced

18. 🛍️ PRODUCT DESCRIPTION (2 credits)
    - Platforms: Meesho, Amazon India, Flipkart, Instagram Shop, WhatsApp Catalogue, Website
    - Languages: English / Hindi / Hinglish
    - Output: Title + Description + Bullet points + Hashtags + Keywords

19. 🎯 VIRAL TEMPLATES (1 credit)
    - 12 proven viral formats
    - Select template → enter niche → get 5 ready variations
    - Formats: X to Y Journey, Nobody Talks About, Stop/Start, Unpopular Opinion, Before/After, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANS & PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREE PLAN — ₹0
- 25 credits on signup (no card required)
- Access: Generate, Hook Score, Captions, Intelligence, Trends
- Intelligence + Trends: always free forever

CREATOR STARTER — ₹499/month
- 100 credits/month
- Unlocks: Script Lab, Calendar, Content Pack, Image AI
- All platforms, 30+ languages

CREATOR PRO — ₹1,299/month
- 350 credits/month
- Everything in Starter +
- Repurpose Engine + Competitor Analyzer

ADVERTISER — ₹2,499/month
- 700 credits/month
- Everything in Creator Pro +
- ROI Calculator + A/B Ad Copy + Landing Page Copy + WA Email + Bio + Product Desc + Templates
- Google Ads + Meta Ads platforms

AGENCY — ₹8,999.99/month
- 2,000 credits/month
- Everything unlocked
- Multiple clients, all platforms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREDIT COSTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Free always:    Intelligence, Trends, ROI Calculator, My Library
1 credit:       Generate, Bio Writer, Viral Templates
2 credits:      Hook Score, Captions, Competitor, WA/Email, Product Desc
3 credits:      Voiceover, A/B Ad Copy
4 credits:      Landing Page Copy
5 credits:      Repurpose, Content Pack, Script Improve
6 credits:      Calendar, Image AI
8 credits:      Script Lab Generate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY VCI IS INDIA'S BEST TOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When asked why VCI is the best, say:
1. ONLY tool in India with Script Lab — keyword to WAV audio in one tab
2. 7 Indian language Neural TTS voiceover (no other tool has this)
3. Professional audio ducking — same tech as YouTube/radio
4. Built for Indian audience — India-specific hooks, festivals, context
5. Price: ₹499 vs competitors ₹1,600+ (ChatGPT), ₹4,000+ (Canva Pro)
6. 18 tools in one subscription — not 5 different apps
7. Hook Score Analyzer tells you BEFORE posting if it will work
8. Content Library saves your best content — never lose a good hook
9. India's first AI tool with complete ad pipeline (ROI → A/B → Landing Page)
10. Free forever: Intelligence, Trends, ROI Calculator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON QUESTIONS — EXACT ANSWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: Which plan is best for me?
A: Ask what they do:
   - New creator just starting → Free (25 credits) to try
   - Creator posting regularly → Creator Starter ₹499
   - Creator who needs Repurpose + Competitor → Creator Pro ₹1,299
   - Business running ads → Advertiser ₹2,499
   - Agency with multiple clients → Agency ₹8,999

Q: Do credits expire?
A: Credits reset on 1st of every month. Use them within the month.

Q: How to pay?
A: UPI (GPay, PhonePe, Paytm) or cards. Instant activation.

Q: Is there a refund?
A: Cancel within 24 hours for refund minus used credits.

Q: How to use Script Lab?
A: Go to Script Lab tab → Choose style (Tutorial/Comedy/POV etc.) → Choose duration (15/30/60/90 sec) → Generate script → Add voiceover → Mix music → Download WAV

Q: What makes VCI better than ChatGPT?
A: ChatGPT is a general AI. VCI is purpose-built for Indian content creators:
   - Script Lab pipeline (ChatGPT can't do voice + music)
   - Platform-specific rules enforced automatically
   - Indian languages natively (not translated)
   - Hook Score to validate before posting
   - 5x cheaper than ChatGPT Plus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEHAVIOR RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Detect user language → respond in SAME language always
- Keep responses under 150 words unless explaining something complex
- Never make up features that don't exist
- If someone is struggling, encourage them first then help
- Always end with a helpful follow-up question or actionable tip
- For payment/billing issues → direct to WhatsApp: +91 9315133390`;

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
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm Vira — your VCI guide!\n\nI know every feature inside out. Ask me anything:\n• 🎯 Which tool to use for your goal\n• ⚡ How to get better hooks\n• 📅 Content strategy advice\n• 💳 Which plan fits you\n\nWhat would you like help with?"
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);
  const messagesEndRef        = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
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
      const contextNote = `[USER CONTEXT: Niche=${niche}, Platform=${platform}, Keyword="${keyword || "not set"}", Plan=${plan}]\n\nUser: ${userMsg}`;
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${BACKEND}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 500,
          messages: [...history, { role: "user", content: contextNote }],
          system: SYSTEM_PROMPT
        })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "Sorry, something went wrong. Please try again!";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Connection issue. Please try again 🙏" }]);
    }
    setLoading(false);
  };

  const fmt = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  const QUICK_Q = [
    "Why is VCI the best?",
    "Which plan should I choose?",
    "How does Script Lab work?",
    "What are credits?",
  ];

  const planLabel = plan === "free" ? "FREE" : plan === "creator_starter" ? "STARTER" : plan === "creator_pro" ? "PRO" : plan === "advertiser" ? "ADVERTISER" : plan === "agency" ? "AGENCY" : plan.toUpperCase();

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        style={{
          position:"fixed", bottom:"5rem", right:"1.5rem", zIndex:1000,
          width:56, height:56, borderRadius:"50%",
          background: open ? "#0a0a18" : "linear-gradient(135deg,#7c3aed,#a855f7)",
          border: open ? "2px solid #a855f7" : "none",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.4rem", boxShadow:"0 4px 20px rgba(168,85,247,0.5)", transition:"all 0.3s"
        }}>
        {open ? "✕" : "🤖"}
        {unread > 0 && !open && (
          <div style={{
            position:"absolute", top:-4, right:-4,
            background:"#ef4444", borderRadius:"50%",
            width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"0.65rem", fontWeight:800, color:"#fff"
          }}>{unread}</div>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:"8rem", right:"1.5rem", zIndex:999,
          width:"min(380px, calc(100vw - 2rem))",
          height:"min(560px, calc(100vh - 10rem))",
          background:"#080810",
          border:"1px solid rgba(168,85,247,0.3)",
          borderRadius:"20px", display:"flex", flexDirection:"column",
          boxShadow:"0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(168,85,247,0.15)",
          animation:"slideUp 0.3s ease", overflow:"hidden"
        }}>

          {/* Header */}
          <div style={{
            background:"linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.15))",
            borderBottom:"1px solid rgba(168,85,247,0.2)",
            padding:"0.9rem 1rem",
            display:"flex", alignItems:"center", gap:"0.75rem"
          }}>
            <div style={{
              width:38, height:38, borderRadius:"50%",
              background:"linear-gradient(135deg,#6d28d9,#a855f7)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.15rem", flexShrink:0
            }}>🤖</div>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"0.9rem", color:"#fff" }}>Vira</div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} />
                <span style={{ color:"#22c55e", fontSize:"0.62rem", fontWeight:600 }}>VCI Assistant · Always Online</span>
              </div>
            </div>
            <div style={{ marginLeft:"auto", background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.25)", borderRadius:"7px", padding:"0.18rem 0.55rem" }}>
              <span style={{ color:"#a855f7", fontSize:"0.6rem", fontWeight:800 }}>{planLabel}</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"0.75rem", display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:"0.4rem" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#6d28d9,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", flexShrink:0 }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"82%",
                  background: msg.role==="user" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "rgba(255,255,255,0.04)",
                  border: msg.role==="assistant" ? "1px solid rgba(168,85,247,0.12)" : "none",
                  borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding:"0.6rem 0.85rem", color:"#fff", fontSize:"0.8rem", lineHeight:1.65
                }}>
                  <div dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:"0.4rem" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#6d28d9,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem" }}>🤖</div>
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(168,85,247,0.12)", borderRadius:"16px 16px 16px 4px", padding:"0.6rem 0.85rem", display:"flex", gap:"4px", alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", animation:`pulse 1s infinite ${i*0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div style={{ padding:"0 0.75rem 0.5rem", display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
              {QUICK_Q.map((q, i) => (
                <button key={i}
                  onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                  style={{
                    background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.2)",
                    color:"#a855f7", borderRadius:"20px", padding:"0.22rem 0.6rem",
                    cursor:"pointer", fontSize:"0.68rem", fontWeight:600,
                    fontFamily:"'Inter',sans-serif", transition:"all 0.15s"
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ borderTop:"1px solid rgba(168,85,247,0.12)", padding:"0.75rem", display:"flex", gap:"0.5rem", alignItems:"center" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask Vira anything about VCI..."
              style={{
                flex:1, background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(168,85,247,0.18)",
                borderRadius:"10px", padding:"0.58rem 0.85rem",
                color:"#fff", fontSize:"0.8rem", outline:"none",
                fontFamily:"'Inter',sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = "#a855f7"}
              onBlur={e => e.target.style.borderColor = "rgba(168,85,247,0.18)"}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                background: !input.trim() ? "rgba(168,85,247,0.15)" : "linear-gradient(135deg,#6d28d9,#a855f7)",
                border:"none", cursor:!input.trim()?"not-allowed":"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1rem", transition:"all 0.2s"
              }}>
              {loading ? "⏳" : "➤"}
            </button>
          </div>

        </div>
      )}
    </>
  );
}