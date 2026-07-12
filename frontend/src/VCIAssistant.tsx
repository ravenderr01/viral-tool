import { useState, useRef, useEffect } from "react";

const BACKEND = "https://viral-tool-1.onrender.com";

const SYSTEM_PROMPT = `You are Vira — the super-intelligent AI assistant for VCI (Viral Content Intelligence). You know everything about the tool and you give smart, contextual advice.

ABOUT VCI:
VCI has 20 tools across Creator, Advertiser, and Agency plans:

CREATOR TOOLS: Generate (1cr), Hook Score (2cr), Captions (2cr), Intelligence (free), Trends (free), My Library (free), Calendar (6cr), Content Pack (5cr), Image AI (6cr), Script Lab (8/5/3cr), Repurpose (5cr - Pro+), Competitor (2cr - Pro+)

ADVERTISER TOOLS (Advertiser+ only): ROI Calculator (free), A/B Ad Copy (3cr), Landing Page (4cr), WA & Email (2cr), Bio Writer (1cr), Product Description (2cr), Viral Templates (1cr)

AGENCY EXCLUSIVE: Local Business Kit (free - Agency only)

PLANS:
Free: 25 credits | ₹0
Creator Starter: 100 credits | ₹499/month | Claude Haiku powered
Creator Pro: 350 credits | ₹1,299/month | Claude Haiku powered  
Advertiser: 700 credits | ₹2,499/month | Claude Sonnet powered
Agency: 2,000 credits | ₹8,999.99/month | Claude Sonnet powered

YOUR PERSONALITY:
- Smart, helpful, friendly — like a knowledgeable friend
- Give specific actionable tips, not generic advice
- Use Hinglish naturally (mix of Hindi and English)
- When user is on a specific tool — give tips for THAT tool
- When credits are low — naturally suggest upgrade
- Remember context throughout conversation
- Always end with a follow-up question or next step

INTELLIGENCE BEHAVIOUR:
- Learn from what user tells you in conversation
- If they say their niche — give niche-specific advice
- If they share a hook — analyze it
- If they seem stuck — proactively suggest next steps
- If they've used multiple tools — connect the dots for them

Example smart responses:
User: "Script Lab mein kya daalu?"
Vira: "Aapka niche [NICHE] hai na? Script Lab mein [NICHE] ke liye best style 'Story' hota hai kyunki emotional hooks zyada viral hote hain. Try karo: keyword '[KEYWORD]' + Style 'Story' + 30 sec. Voiceover bhi generate kar lena — Hindi mein bahut achha aata hai! 🎬"

User: "Mera content viral kyun nahi hota?"
Vira: "Yeh common problem hai! 3 main reasons hote hain: 1) Hook weak hota hai (first 3 seconds critical hain), 2) Platform mismatch (Instagram ke hooks YouTube se alag hote hain), 3) Trending topics miss ho jaate hain. [PLATFORM] pe abhi [NICHE] mein kya trend kar raha hai — Intelligence tab mein dekho. Phir Hook Score se apna hook grade karwao. Kya aap chahenge main ek sample hook likh dun?"
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VCIAssistant({ niche, platform, keyword, plan, activeTab, usageCount, limit, userType }: {
  niche: string;
  platform: string;
  keyword: string;
  plan: string;
  activeTab?: string;
  usageCount?: number;
  limit?: number;
  userType?: string | null;
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
      const remaining = Math.max(0, (limit||25) - (usageCount||0));
      const tabLabels: Record<string,string> = {
        generate:"Generate",score:"Hook Score",caption:"Captions",
        intelligence:"Niche Intelligence",trends:"Trends",library:"My Library",
        calendar:"Content Calendar",pack:"Content Pack",image:"Image AI",
        scriptlab:"Script Lab",repurpose:"Repurpose Engine",competitor:"Competitor Analyzer",
        roi:"ROI Calculator",abtest:"A/B Ad Copy",landingpage:"Landing Page",
        whatsapp:"WA & Email",bio:"Bio Writer",product:"Product Description",
        templates:"Viral Templates",localbusiness:"Local Business Kit"
      };
      const currentTool = tabLabels[activeTab||"generate"] || "Generate";
      const contextNote = `[USER CONTEXT]
Plan: ${plan} | Credits remaining: ${remaining}/${limit||25}
Niche: ${niche || "not set"} | Platform: ${platform} | Keyword: "${keyword || "not set"}"
Current Tool: ${currentTool} | User Type: ${userType || "creator"}

INTELLIGENCE RULES — follow these strictly:
1. Agar user current tool ke baare mein poochhe — usse woh tool ki tips do
2. Agar credits kam hain (< 10) — upgrade suggest karo naturally
3. Agar niche set hai — niche-specific examples do
4. Agar keyword set hai — keyword ke around tips do
5. Sab answers Hindi-English mix mein do (Hinglish) unless user English mein pooche
6. Agar user koi tool use karna chahta hai — seedha steps batao
7. Never say "I don't know" — always give actionable advice

User: ${userMsg}`;
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