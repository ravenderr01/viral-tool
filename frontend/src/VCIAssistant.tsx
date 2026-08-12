import { useState, useRef, useEffect } from "react";

const BACKEND = "https://viral-tool-1.onrender.com";

const SYSTEM_PROMPT = `You are Vira — the super-intelligent AI assistant for VCI (Viral Content Intelligence). You know everything about the tool and you give smart, contextual advice.

ABOUT VCI — CREATOR TOOLS:
- Generate (1cr): quick hooks+titles+captions+hashtags
- Hook Score (2cr): pastes content, gets a strict A-F grade + line-by-line fixes + 3 rewritten versions
- Captions (2cr): standalone caption+hashtag generator
- Intelligence (free): real-time trending keywords/topics for the user's niche
- My Library (free): saved content history
- Calendar (6cr): 30-day content calendar, organized by week, each day tagged with a content type
- Content Pack (5cr): 50+ pieces (hooks/titles/captions/hashtags/ideas) from one keyword
- Image AI (currently disabled — "coming soon", vision model being upgraded)
- Script Lab (8/5/3cr): the flagship tool — a 5-step guided wizard (Topic → AI Generate → Customize → Preview → Export). Writes a full word-for-word script in 13 styles (Tutorial, Story, POV, Comedy, Awareness, etc.), each with genuine platform-native pacing rules. Also generates a thumbnail using a real topic-relevant photo, and has a Mix Studio for recording/uploading voice + background music (AI voiceover itself is temporarily disabled, but record/upload works)
- Repurpose (5cr, Pro+): converts one piece of content into another platform's format
- Competitor (2cr, Pro+): analyzes competitor's best-performing content

ADVERTISER TOOLS (Advertiser+ only):
- Ad Wizard: a 5-step guided campaign builder (Goal → Audience → AI Generate → Review → Launch). Produces a full campaign package — audience avatar, 3 ad angles, platform-specific ad copy (Google Ads gets 15 headlines + 4 descriptions per Google's real RSA spec, Meta/Instagram/LinkedIn get A/B tested copy with real character limits for that platform), USP, landing page headline, honest ROI note. All copy is written to be Google/Meta policy-compliant (no banned superlatives, no personal-attribute targeting).
- Generate (free for advertisers): quick ad-platform-formatted content
- ROI Calculator (free), A/B Ad Copy, Ad Angles, Audience Builder, Bulk Copy, Video Hooks, USP Builder, Landing Page Copy, WA & Email templates, Bio Writer, Product Description, Viral Templates

AGENCY EXCLUSIVE:
- Clients: manage multiple clients from one dashboard, each gets their own workspace; content generated while a client is "active" gets tagged to them automatically
- Local Business Kit: generates a complete Google Business Profile kit (description, 5 posts, 10 FAQs, review-reply templates, local SEO keywords, hashtags) plus an honest, verification-first setup checklist — this tool does NOT auto-create or auto-verify the Google listing (Google doesn't allow that for any tool), it prepares everything and guides the user through Google's own required manual verification

LANGUAGES: Content generation supports 30+ languages including all 12 major Indian languages. AI Voiceover (when active) supports 12 Indian languages + English.

PLANS:
Free: 25 credits | ₹0
Creator Starter: 100 credits | ₹499/month
Creator Pro: 350 credits | ₹1,299/month
Advertiser: 700 credits | ₹2,499/month
Agency: 2,000 credits | ₹8,999.99/month — includes Clients + Local Business Kit + full Creator+Advertiser access

YOUR PERSONALITY:
- Smart, helpful, friendly — like a knowledgeable friend
- Give specific actionable tips, not generic advice
- Use Hinglish naturally (mix of Hindi and English)
- When user is on a specific tool — give tips for THAT tool
- When credits are low — naturally suggest upgrade
- Remember context throughout conversation
- Always end with a follow-up question or next step

SMART NAVIGATION — this is important: when you recommend the user go use a specific tool right now to take action (not just general advice), end your entire response with an action tag on its own line, in this exact format:
[ACTION:tabid|Button Label]
Only use one of these exact tabid values: generate, score, caption, intelligence, calendar, pack, scriptlab, repurpose, competitor, roi, abtest, adangles, audiencebuild, adscale, videohooks, uspbuilder, landingpage, whatsapp, bio, product, templates, localbusiness, adwizard, clients
Only include this tag when you are actually directing them to open that tool now — omit it entirely for general/informational answers, small talk, or when comparing options without a clear single next step. Never invent a tabid outside this list. The tag must be the very last line, nothing after it.

Example: "...try Script Lab with the Story style — it tends to perform best for emotional niches like yours! 🎬
[ACTION:scriptlab|Open Script Lab]"

INTELLIGENCE BEHAVIOUR:
- Learn from what user tells you in conversation
- If they say their niche — give niche-specific advice
- If they share a hook — analyze it
- If they seem stuck — proactively suggest next steps, using the ACTION tag when appropriate
- If they've used multiple tools — connect the dots for them
`;

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: { tabid: string; label: string };
}

// Extracts a trailing [ACTION:tabid|Label] tag from the AI's raw response,
// returning the cleaned display text plus the parsed action (if any).
function parseAction(raw: string): { text: string; action?: { tabid: string; label: string } } {
  const match = raw.match(/\[ACTION:([a-z]+)\|([^\]]+)\]\s*$/i);
  if (!match) return { text: raw };
  const tabid = match[1].toLowerCase();
  const label = match[2].trim();
  const text = raw.slice(0, match.index).trim();
  return { text, action: { tabid, label } };
}

export default function VCIAssistant({ niche, platform, keyword, plan, activeTab, usageCount, limit, userType, onNavigate }: {
  niche: string;
  platform: string;
  keyword: string;
  plan: string;
  activeTab?: string;
  usageCount?: number;
  limit?: number;
  userType?: string | null;
  onNavigate?: (tabId: string) => void;
}) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm Vira — your VCI guide!\n\nI know every feature inside out. Ask me anything, and I'll take you straight to the right tool:\n• 🎯 Which tool to use for your goal\n• ⚡ How to get better hooks\n• 📅 Content strategy advice\n• 💳 Which plan fits you\n\nWhat would you like help with?"
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

  const sendMessage = async (overrideInput?: string) => {
    const raw = (overrideInput ?? input).trim();
    if (!raw || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: raw }]);
    setLoading(true);
    try {
      const remaining = Math.max(0, (limit||25) - (usageCount||0));
      const tabLabels: Record<string,string> = {
        generate:"Generate",score:"Hook Score",caption:"Captions",
        intelligence:"Niche Intelligence",trends:"Trends",library:"My Library",
        calendar:"Content Calendar",pack:"Content Pack",image:"Image AI",
        scriptlab:"Script Lab",repurpose:"Repurpose Engine",competitor:"Competitor Analyzer",
        roi:"ROI Calculator",abtest:"A/B Ad Copy",adangles:"Ad Angles",audiencebuild:"Audience Builder",
        adscale:"Bulk Ad Copy",videohooks:"Video Hooks",uspbuilder:"USP Builder",
        landingpage:"Landing Page",whatsapp:"WA & Email",bio:"Bio Writer",product:"Product Description",
        templates:"Viral Templates",localbusiness:"Local Business Kit",
        adwizard:"Ad Wizard",clients:"Clients"
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
6. Agar user koi tool use karna chahta hai — seedha steps batao AND include the [ACTION:tabid|Label] tag so they can jump there directly
7. Never say "I don't know" — always give actionable advice

User: ${raw}`;
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
      const rawText = data.content?.map((i: any) => i.text || "").join("") || "Sorry, something went wrong. Please try again!";
      const { text, action } = parseAction(rawText);
      setMessages(prev => [...prev, { role: "assistant", content: text, action }]);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Connection issue. Please try again 🙏" }]);
    }
    setLoading(false);
  };

  const handleActionClick = (tabid: string) => {
    onNavigate?.(tabid);
    setOpen(false);
  };

  const fmt = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  const QUICK_Q = [
    "Which tool should I use right now?",
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
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: msg.role==="user"?"flex-end":"flex-start", gap:"0.35rem" }}>
                <div style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:"0.4rem", width:"100%" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#6d28d9,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", flexShrink:0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth:"82%",
                    background: msg.role==="user" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "rgba(255,255,255,0.04)",
                    border: msg.role==="assistant" ? "1px solid rgba(168,85,247,0.12)" : "none",
                    borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding:"0.6rem 0.85rem", color:"#fff", fontSize:"0.8rem", lineHeight:1.65,
                    marginLeft: msg.role==="user" ? "auto" : 0
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
                  </div>
                </div>
                {/* Smart action button — jumps straight to the recommended tool */}
                {msg.action && (
                  <button onClick={() => handleActionClick(msg.action!.tabid)}
                    style={{
                      marginLeft: "1.75rem",
                      display:"flex", alignItems:"center", gap:"0.4rem",
                      background:"linear-gradient(135deg,#6d28d9,#a855f7)", border:"none",
                      color:"#fff", borderRadius:"10px", padding:"0.5rem 0.85rem",
                      cursor:"pointer", fontSize:"0.76rem", fontWeight:700,
                      fontFamily:"'Inter',sans-serif", boxShadow:"0 2px 12px rgba(168,85,247,0.35)"
                    }}>
                    ⚡ {msg.action.label} →
                  </button>
                )}
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
                  onClick={() => sendMessage(q)}
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
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
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