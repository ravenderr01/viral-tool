import Onboarding from "./Onboarding";
import AdminDashboard from "./AdminDashboard";
import ImageContent from "./ImageContent";
import { useState, useEffect, useRef } from "react";
import VCIAssistant from "./VCIAssistant";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Contact from "./Contact";
import Trends from "./Trends";
import Legal from "./Legal";
import Plans from "./plans";
import { Helmet } from 'react-helmet-async';
import {
  Zap, BarChart2, FileText, CalendarDays, Package, TrendingUp, Image, Film,
  Sparkles, ArrowRight, Tag, RefreshCw, Search, Flame,
  BookOpen, MousePointerClick, Type, Check, Layers, Wand2, Hash, Clock
} from "lucide-react";

const YOUR_UPI_ID    = "9315133390@ptyes";
const YOUR_PAYPAL_ME = "https://paypal.me/yourname";
const SUPPORT_PHONE = "+91 9315133390";

const PLANS = {
  free:        { label: "Free",        limit: 100,  priceINR: 0,    priceUSD: 0  },
  starter:     { label: "Starter",     limit: 100,  priceINR: 299,  priceUSD: 4,  badge: "🔥 Popular" },
  pro_creator: { label: "Pro Creator", limit: 400,  priceINR: 999,  priceUSD: 12, badge: "⚡ Best Value" },
  growth:      { label: "Growth",      limit: 150,  priceINR: 799,  priceUSD: 10, badge: "📈 Business" },
  business:    { label: "Business",    limit: 400,  priceINR: 1999, priceUSD: 24, badge: "💎 Pro" },
  agency:      { label: "Agency",      limit: 1000, priceINR: 4999, priceUSD: 59, badge: "👑 Premium" },
};

const detectNiche = (keyword: string, currentNiche: string): string => {
  const kw = keyword.toLowerCase();
  if (kw.match(/weight|gym|fitness|workout|diet|protein|fat|muscle|exercise|yoga/)) return "Fitness";
  if (kw.match(/money|income|invest|business|startup|freelanc|passive|earn|profit|revenue/)) return "Business";
  if (kw.match(/\bai\b|tech|code|app|software|chatgpt|programming|developer|crypto|saas/)) return "Tech";
  if (kw.match(/food|recipe|cook|eat|meal|biryani|street food|restaurant|bake|chef/)) return "Food";
  if (kw.match(/travel|trip|tour|vacation|hotel|flight|destination|backpack|explore/)) return "Travel";
  if (kw.match(/fashion|style|outfit|clothes|wear|dress|skincare|beauty|makeup|glow/)) return "Fashion & Style";
  if (kw.match(/cricket|football|sport|match|player|team|ipl|fifa|basketball|badminton/)) return "Sports";
  if (kw.match(/motivation|mindset|success|hustle|inspire|goal|discipline|growth/)) return "Motivational";
  if (kw.match(/meditation|spiritual|manifest|chakra|astrology|mindful|universe/)) return "Spirituality";
  if (kw.match(/mental|anxiety|stress|depression|therapy|self care|emotion|healing/)) return "Mental Health";
  if (kw.match(/real estate|property|house|rent|flat|plot|home buying|apartment/)) return "Real Estate";
  if (kw.match(/study|learn|education|course|exam|college|school|skill|tutorial/)) return "Education";
  if (kw.match(/facebook ads|google ads|marketing|campaign|funnel|conversion|copywriting/)) return "Ads & Marketing";
  if (kw.match(/gaming|pubg|free fire|esport|minecraft|stream|gamer|valorant/)) return "Gaming";
  if (kw.match(/vlog|day in my life|daily routine|morning routine|night routine|lifestyle vlog/)) return "Daily Vlog";
  if (kw.match(/comedy|funny|meme|joke|prank|skit|humor|roast/)) return "Comedy & Entertainment";
  if (kw.match(/budget|save money|tax|mutual fund|sip|loan|personal finance|stock market/)) return "Personal Finance";
  if (kw.match(/lifestyle|minimalism|productivity|habit|self improvement|declutter/)) return "Lifestyle";
  if (kw.match(/health|wellness|immune|vitamin|nutrition|sleep|detox|ayurveda/)) return "Health & Wellness";
  // E-commerce / product-selling categories (for advertisers selling physical products)
  if (kw.match(/\bbag|handbag|backpack|purse|luggage|wallet\b/)) return "Bags & Accessories";
  if (kw.match(/shoe|sneaker|sandal|footwear|boots|heels/)) return "Footwear";
  if (kw.match(/jewelry|jewellery|necklace|earring|bracelet|ring\b/)) return "Jewelry";
  if (kw.match(/furniture|sofa|table|chair|decor|home decor|interior/)) return "Home & Furniture";
  if (kw.match(/electronics|gadget|laptop|mobile|phone|headphone|camera|smartwatch/)) return "Electronics";
  if (kw.match(/toy|kids product|baby product|stroller|playset/)) return "Toys & Kids";
  if (kw.match(/pet|dog food|cat food|pet accessories|pet care/)) return "Pet Products";
  if (kw.match(/supplement|vitamin tablets|protein powder|herbal product/)) return "Supplements";
  if (kw.match(/jewelry|watch|sunglasses|accessories|cosmetics product/)) return "Fashion Accessories";
  if (kw.match(/sell|product|ecommerce|e-commerce|online store|shop|dropship|amazon|flipkart/)) return "E-commerce";
  return currentNiche;
};

const NICHE_EXAMPLES: Record<string, string[]> = {
  Fitness:              ["weight loss", "gym motivation", "protein diet", "HIIT workout"],
  Business:             ["passive income", "side hustle", "startup tips", "freelancing"],
  Tech:                 ["AI tools", "ChatGPT hacks", "coding tips", "app development"],
  Lifestyle:            ["morning routine", "productivity hacks", "minimalism", "self care"],
  Food:                 ["meal prep", "healthy recipes", "street food", "viral recipes"],
  "Daily Vlog":         ["day in my life", "vlog ideas", "daily routine", "life update"],
  "Comedy & Entertainment": ["funny skits", "comedy reels", "meme content", "trending jokes"],
  "Sports":             ["cricket tips", "football highlights", "sports motivation", "fitness training"],
  "Spirituality":       ["meditation tips", "manifestation", "spiritual growth", "mindfulness"],
  "AI & Automation":    ["AI tools", "automation hacks", "ChatGPT tips", "AI side hustle"],
  "Personal Finance":   ["invest money", "save money fast", "passive income", "budget tips"],
  "Mental Health":      ["anxiety tips", "self care routine", "mindfulness", "stress relief"],
  "Beauty & Skincare":  ["skincare routine", "glow up tips", "makeup hacks", "anti aging"],
  "Ads & Marketing":    ["facebook ads", "google ads", "ad copywriting", "marketing strategy"],
  Education:            ["online course", "study tips", "e-learning", "skill development"],
  Travel:               ["travel tips", "budget travel", "solo travel", "travel vlog"],
  "Fashion & Style":    ["outfit ideas", "fashion tips", "style guide", "trendy outfits"],
  "Real Estate":        ["property investment", "home buying tips", "real estate India", "rental income"],
  Motivational:         ["success mindset", "morning motivation", "self improvement", "hustle tips"],
  "Health & Wellness":  ["healthy lifestyle", "nutrition tips", "yoga benefits", "sleep tips"],
  Gaming:               ["gaming tips", "game review", "gaming setup", "mobile gaming"],
  "Bags & Accessories": ["leather handbags", "travel backpacks", "designer wallets", "gym bags"],
  "Footwear":           ["running shoes", "casual sneakers", "formal shoes", "sandals for women"],
  "Jewelry":            ["gold necklace set", "silver earrings", "diamond rings", "fashion bracelets"],
  "Home & Furniture":   ["modern sofa sets", "dining table sets", "home decor ideas", "wall art"],
  "Electronics":        ["wireless earbuds", "smartwatch deals", "laptop accessories", "phone cases"],
  "Toys & Kids":        ["educational toys", "baby strollers", "kids playsets", "newborn essentials"],
  "Pet Products":       ["dog food brands", "cat toys", "pet grooming kit", "pet carriers"],
  "Supplements":        ["whey protein", "multivitamin tablets", "ayurvedic supplements", "weight gain powder"],
  "Fashion Accessories": ["sunglasses for men", "designer watches", "scarves for women", "belts for men"],
  "E-commerce":         ["dropshipping products", "online store ideas", "best selling products", "ecommerce marketing"],
};

// Cross-selling: jo niche hai uske related niches suggest karo
const CROSS_SELL_NICHES: Record<string, { niche: string; reason: string; keywords: string[] }[]> = {
  Fitness:           [{ niche: "Health & Wellness", reason: "Fitness creators ka wellness content bhi trend karta hai", keywords: ["nutrition tips", "sleep tips", "detox"] }, { niche: "Motivational", reason: "Gym motivation content viral hota hai", keywords: ["success mindset", "discipline", "hustle tips"] }, { niche: "Food", reason: "Meal prep aur diet content fitness ke saath fit hota hai", keywords: ["meal prep", "protein meals", "healthy recipes"] }],
  Business:          [{ niche: "Personal Finance", reason: "Business creators ko finance content bhi follow karte hain", keywords: ["invest money", "passive income", "budget tips"] }, { niche: "Motivational", reason: "Entrepreneur motivation viral hota hai", keywords: ["success mindset", "hustle tips", "growth"] }, { niche: "Tech", reason: "AI tools aur automation business ke liye hot topic hai", keywords: ["AI tools", "ChatGPT hacks", "automation"] }],
  Tech:              [{ niche: "Business", reason: "Tech creators startup content bhi banate hain", keywords: ["startup tips", "side hustle", "freelancing"] }, { niche: "Education", reason: "Coding tutorials aur e-learning popular hai", keywords: ["coding tips", "online course", "skill development"] }, { niche: "Gaming", reason: "Tech aur gaming audience overlap hoti hai", keywords: ["gaming setup", "game review", "esports"] }],
  Lifestyle:         [{ niche: "Mental Health", reason: "Lifestyle audience wellness content pasand karta hai", keywords: ["self care", "anxiety tips", "mindfulness"] }, { niche: "Fashion & Style", reason: "Lifestyle aur fashion content overlap karta hai", keywords: ["outfit ideas", "style guide", "trendy outfits"] }, { niche: "Daily Vlog", reason: "Lifestyle creators vlogs bhi banate hain", keywords: ["day in my life", "morning routine", "life update"] }],
  Food:              [{ niche: "Health & Wellness", reason: "Healthy food content viral hota hai", keywords: ["nutrition tips", "healthy lifestyle", "detox"] }, { niche: "Fitness", reason: "Diet aur fitness content saath kaam karta hai", keywords: ["protein diet", "meal prep", "weight loss"] }, { niche: "Travel", reason: "Food travel content ka growing trend hai", keywords: ["street food", "food tour", "travel vlog"] }],
  "Daily Vlog":      [{ niche: "Lifestyle", reason: "Vloggers ke liye lifestyle content natural hai", keywords: ["morning routine", "productivity", "self improvement"] }, { niche: "Travel", reason: "Travel vlogs bahut popular hain", keywords: ["travel tips", "solo travel", "budget travel"] }, { niche: "Mental Health", reason: "Vlog audience se connect ke liye", keywords: ["self care", "stress relief", "mindfulness"] }],
  Travel:            [{ niche: "Food", reason: "Food travel content ka growing trend hai", keywords: ["street food", "local cuisine", "food tour"] }, { niche: "Photography", reason: "Travel photographers ki demand hai", keywords: ["travel photos", "camera tips", "reels"] }, { niche: "Lifestyle", reason: "Travel aur lifestyle overlap karta hai", keywords: ["minimalism", "digital nomad", "slow living"] }],
  "Personal Finance": [{ niche: "Business", reason: "Finance creators business content bhi banate hain", keywords: ["startup tips", "side hustle", "passive income"] }, { niche: "Motivational", reason: "Financial freedom motivation viral hai", keywords: ["success mindset", "discipline", "goal setting"] }, { niche: "Real Estate", reason: "Property investment finance ke saath overlap karta hai", keywords: ["property investment", "rental income", "real estate India"] }],
  "Mental Health":   [{ niche: "Lifestyle", reason: "Wellness aur lifestyle connected hain", keywords: ["self care", "morning routine", "productivity"] }, { niche: "Spirituality", reason: "Mental health aur spirituality ka deep connection hai", keywords: ["meditation", "mindfulness", "spiritual growth"] }, { niche: "Motivational", reason: "Healing aur growth motivation create karta hai", keywords: ["self improvement", "healing journey", "positive mindset"] }],
  Motivational:      [{ niche: "Business", reason: "Entrepreneur motivation content popular hai", keywords: ["startup tips", "side hustle", "passive income"] }, { niche: "Fitness", reason: "Gym motivation viral hota hai", keywords: ["gym motivation", "discipline", "workout"] }, { niche: "Mental Health", reason: "Mindset aur mental wellness overlap karta hai", keywords: ["self care", "anxiety tips", "healing"] }],
  Gaming:            [{ niche: "Tech", reason: "Gaming aur tech audience ek hi hai", keywords: ["gaming setup", "tech review", "best gadgets"] }, { niche: "Comedy & Entertainment", reason: "Gaming comedy content bhi popular hai", keywords: ["funny gaming", "meme content", "gaming fails"] }, { niche: "Education", reason: "Game tutorials aur reviews educational hote hain", keywords: ["game guide", "how to win", "gaming tips"] }],
  Education:         [{ niche: "Tech", reason: "EdTech content ka growing trend hai", keywords: ["AI tools", "coding tips", "app development"] }, { niche: "Business", reason: "Skill development aur business overlap karta hai", keywords: ["freelancing", "side hustle", "startup"] }, { niche: "Motivational", reason: "Students ke liye motivation viral hota hai", keywords: ["study motivation", "success mindset", "goal setting"] }],
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const LANGUAGE_GROUPS = [
  { country: "🇮🇳 India", code: "IN", languages: [
    { code: "hi", label: "Hindi" }, { code: "bn", label: "Bengali" },
    { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
    { code: "mr", label: "Marathi" }, { code: "gu", label: "Gujarati" },
    { code: "kn", label: "Kannada" }, { code: "ml", label: "Malayalam" },
    { code: "pa", label: "Punjabi" }, { code: "or", label: "Odia" },
    { code: "as", label: "Assamese" }, { code: "ur", label: "Urdu" },
  ]},
  { country: "🇬🇧 English", code: "EN", languages: [{ code: "en", label: "English" }]},
  { country: "🇺🇸 USA", code: "US", languages: [
    { code: "en-us", label: "American English" }, { code: "es-us", label: "Spanish (US)" },
  ]},
  { country: "🇩🇪 Germany", code: "DE", languages: [{ code: "de", label: "German" }]},
  { country: "🇫🇷 France", code: "FR", languages: [{ code: "fr", label: "French" }]},
  { country: "🇪🇸 Spain", code: "ES", languages: [{ code: "es", label: "Spanish" }]},
  { country: "🇮🇹 Italy", code: "IT", languages: [{ code: "it", label: "Italian" }]},
  { country: "🇷🇺 Russia", code: "RU", languages: [{ code: "ru", label: "Russian" }]},
  { country: "🇨🇳 China", code: "CN", languages: [
    { code: "zh", label: "Chinese (Mandarin)" }, { code: "zh-yue", label: "Cantonese" },
  ]},
  { country: "🇯🇵 Japan", code: "JP", languages: [{ code: "ja", label: "Japanese" }]},
  { country: "🇰🇷 Korea", code: "KR", languages: [{ code: "ko", label: "Korean" }]},
  { country: "🇸🇦 Arabic", code: "AR", languages: [
    { code: "ar", label: "Arabic" }, { code: "ar-eg", label: "Egyptian Arabic" },
  ]},
  { country: "🇵🇰 Pakistan", code: "PK", languages: [{ code: "ur-pk", label: "Urdu (Pakistan)" }]},
  { country: "🇹🇭 Thailand", code: "TH", languages: [{ code: "th", label: "Thai" }]},
  { country: "🇧🇷 Brazil", code: "BR", languages: [{ code: "pt", label: "Portuguese" }]},
  { country: "🇮🇩 Indonesia", code: "ID", languages: [{ code: "id", label: "Indonesian" }]},
  { country: "🇹🇷 Turkey", code: "TR", languages: [{ code: "tr", label: "Turkish" }]},
];

const LANG_LABELS: Record<string, string> = {
  en: "English", "en-us": "American English", "es-us": "Spanish (US)",
  hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
  mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  pa: "Punjabi", or: "Odia", as: "Assamese", ur: "Urdu", "ur-pk": "Urdu (Pakistan)",
  es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", ar: "Arabic", "ar-eg": "Egyptian Arabic",
  zh: "Chinese (Mandarin)", "zh-yue": "Cantonese",
  ja: "Japanese", ko: "Korean", ru: "Russian",
  tr: "Turkish", id: "Indonesian", th: "Thai",
};

const LANG_STRICT: Record<string, string> = {
  en: "English only",
  "en-us": "American English only",
  hi: "Hindi only — use Devanagari script (हिंदी में लिखें)",
  bn: "Bengali only — use Bengali script (বাংলায় লিখুন)",
  ta: "Tamil only — use Tamil script (தமிழில் எழுதவும்)",
  te: "Telugu only — use Telugu script (తెలుగులో రాయండి)",
  mr: "Marathi only — use Devanagari script (मराठीत लिहा)",
  gu: "Gujarati only — use Gujarati script (ગુજરાતીમાં લખો)",
  kn: "Kannada only — use Kannada script (ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ)",
  ml: "Malayalam only — use Malayalam script (മലയാളത്തിൽ എഴുതുക)",
  pa: "Punjabi only — use Gurmukhi script (ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ)",
  or: "Odia only — use Odia script (ଓଡ଼ିଆରେ ଲେଖ)",
  as: "Assamese only — use Assamese script (অসমীয়াত লিখক)",
  ur: "Urdu only — use Urdu script (اردو میں لکھیں)",
  "ur-pk": "Urdu only — use Urdu script (اردو میں لکھیں)",
  es: "Spanish only", "es-us": "Spanish only",
  fr: "French only", de: "German only", it: "Italian only",
  pt: "Portuguese only",
  ar: "Arabic only — use Arabic script (اكتب بالعربية)",
  "ar-eg": "Egyptian Arabic only — use Arabic script",
  zh: "Simplified Chinese only — use Chinese characters (用中文写)",
  "zh-yue": "Cantonese only — use Traditional Chinese characters",
  ja: "Japanese only — use Japanese script (日本語で書いてください)",
  ko: "Korean only — use Korean script (한국어로 작성하세요)",
  ru: "Russian only — use Cyrillic script (пишите на русском)",
  tr: "Turkish only", id: "Indonesian only",
  th: "Thai only — use Thai script (เขียนเป็นภาษาไทย)",
};

function getLangLabel(code: string) { return LANG_LABELS[code] || "English"; }
function getLangStrict(code: string) { return LANG_STRICT[code] || `${LANG_LABELS[code] || "English"} only`; }

function getBrowserLang() {
  const raw = navigator.language || navigator.languages?.[0] || "en";
  return raw.split("-")[0].toLowerCase();
}

function getUPIQR(upiId: string, amount: number) {
  const upiUrl = `upi://pay?pa=${upiId}&pn=ViralTool&am=${amount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}&bgcolor=0a0a0a&color=ff6b35&margin=12`;
}

const CONTENT_TYPES = ["Tips","Story","Mistakes","Behind the Scenes","Q&A","Tutorial","Motivation","Trend","Case Study","Poll","Review","Challenge"];

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span style={{ color, fontWeight: 800, fontSize: "1.4rem", fontFamily: "'Inter',sans-serif" }}>{val}</span>;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, cx = 36, cy = 36, stroke = 5;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => { setTimeout(() => setProgress(score / 10), 100); }, [score]);
  const dash = circ * progress;
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnimatedScore target={score} color={color} />
        </div>
      </div>
      <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}
function ScriptLab({ plan, usageCount, limit, onUpgrade, langStrict, onSaveHistory }: any) {
  const [mode, setMode] = useState<"improve" | "generate">("improve");

  // Improve mode states
  const [script, setScript] = useState("");
  const [improveResult, setImproveResult] = useState<any>(null);
  const [improveLoading, setImproveLoading] = useState(false);

  // Generate mode states
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState("Tutorial");
  const [duration, setDuration] = useState("30 sec");
  const [generateResult, setGenerateResult] = useState<any>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState("Hindi");
  const [voiceGender, setVoiceGender] = useState<"Female" | "Male">("Female");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const [platform, setPlatform] = useState("Instagram");
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
  ];

  const STYLES = ["Tutorial", "Story", "POV", "Challenge", "Before/After", "Motivation", "Tips", "Review", "Day in Life", "Comedy"];
  const DURATIONS = ["15 sec", "30 sec", "60 sec", "90 sec"];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gradeColor = (g: string) => ({ A: "#22c55e", B: "#06b6d4", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[g] || "#6d28d9");
  const lineColor = (type: string) => type === "strong" ? "#22c55e" : type === "weak" ? "#ef4444" : "#71717a";

  const analyzeScript = async () => {
    if (!script.trim()) { setError("Apna script paste karo."); return; }
    if (script.trim().split(" ").length < 5) { setError("Script thodi lambi honi chahiye."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setImproveLoading(true); setError(""); setImproveResult(null);

    const prompt = `You are an expert content coach. Analyze this ${platform} script and provide before/after comparison.

ORIGINAL SCRIPT:
"""${script}"""

PLATFORM: ${platform}
LANGUAGE: Detect and respond in same language as the script.

Respond ONLY in JSON:
{
  "before": {
    "score": 0,
    "grade": "C",
    "lines": [{"text": "line", "score": 0, "issue": "problem", "type": "weak/strong/neutral"}],
    "summary": "verdict"
  },
  "after": {
    "score": 0,
    "grade": "A",
    "script": "complete improved script",
    "lines": [{"text": "line", "reason": "why it works"}],
    "summary": "why better"
  },
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "score_jump": "+X points",
  "platform_tips": ["tip 1", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setImproveResult(parsed);
      if (onSaveHistory) onSaveHistory("scriptimprove", { platform, inputSummary: script.slice(0, 80), resultData: parsed });
    } catch { setError("Analysis failed. Try again."); }
    setImproveLoading(false);
  };


  const AZURE_VOICES: Record<string, { Female: string; Male: string; code: string }> = {
    "Hindi":    { Female: "hi-IN-SwaraNeural",    Male: "hi-IN-MadhurNeural",    code: "hi-IN" },
    "Tamil":    { Female: "ta-IN-PallaviNeural",  Male: "ta-IN-ValluvarNeural",  code: "ta-IN" },
    "Telugu":   { Female: "te-IN-ShrutiNeural",   Male: "te-IN-MohanNeural",     code: "te-IN" },
    "Marathi":  { Female: "mr-IN-AarohiNeural",   Male: "mr-IN-ManoharNeural",   code: "mr-IN" },
    "Gujarati": { Female: "gu-IN-DhwaniNeural",   Male: "gu-IN-NiranjanNeural",  code: "gu-IN" },
    "Bengali":  { Female: "bn-IN-TanishaaNeural", Male: "bn-IN-BashkarNeural",   code: "bn-IN" },
    "English":  { Female: "en-US-JennyNeural",    Male: "en-US-GuyNeural",       code: "en-US" },
  };

  const convertToVoice = async (text: string) => {
    if (!text || !text.trim()) { setVoiceError("No script text to convert."); return; }
    setVoiceLoading(true); setVoiceError(""); setAudioUrl(null);
    try {
      const voiceInfo = AZURE_VOICES[voiceLang];
      const res = await fetch("https://viral-tool-1.onrender.com/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.replace(/\[.*?\]/g, ""), // strip [PAUSE], [SHOW X] stage directions before speaking
          voiceName: voiceInfo[voiceGender],
          languageCode: voiceInfo.code,
        }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch {
      setVoiceError("Voice generation failed. Try again.");
    }
    setVoiceLoading(false);
  };

  const generateThumbnail = (title: string, hook: string, plt: string, sty: string, dur: string): string => {
    const canvas = document.createElement("canvas");
    // Platform-specific aspect ratio
    const isVertical = ["Instagram", "TikTok"].includes(plt);
    canvas.width = isVertical ? 1080 : 1280;
    canvas.height = isVertical ? 1920 : 720;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;

    const wrap = (text: string, x: number, y: number, maxW: number, lh: number, fs: number) => {
      ctx.font = "bold " + fs + "px Arial";
      const words = text.split(" "); let line = ""; let cy = y;
      for (const w of words) {
        const t = line + w + " ";
        if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line.trim(), x, cy); line = w + " "; cy += lh; }
        else line = t;
      }
      ctx.fillText(line.trim(), x, cy); return cy;
    };

    if (plt === "Instagram") {
      // Instagram Reel — vertical, gradient purple-pink
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#1a0030"); bg.addColorStop(0.5, "#6d1060"); bg.addColorStop(1, "#c2185b");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // Diagonal stripe overlay
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 2;
      for (let i = -H; i < W + H; i += 60) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
      // Glow center
      const g = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, 600);
      g.addColorStop(0, "rgba(255,100,180,0.3)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // Instagram gradient pill badge
      const badgeGrad = ctx.createLinearGradient(60, 0, 400, 0);
      badgeGrad.addColorStop(0, "#833ab4"); badgeGrad.addColorStop(0.5, "#fd1d1d"); badgeGrad.addColorStop(1, "#fcb045");
      ctx.fillStyle = badgeGrad;
      ctx.beginPath(); (ctx as any).roundRect(60, 80, 360, 54, 27); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 24px Arial"; ctx.textAlign = "left";
      ctx.fillText("📸 Instagram Reel  ·  " + sty, 85, 114);
      // Duration
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath(); (ctx as any).roundRect(60, 152, 130, 40, 20); ctx.fill();
      ctx.fillStyle = "#fcb045"; ctx.font = "bold 20px Arial"; ctx.fillText(dur, 80, 178);
      // Title
      ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = 30;
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
      const te = wrap(title.toUpperCase(), 60, 520, W - 120, 90, 76);
      // Hook
      ctx.shadowBlur = 12; ctx.fillStyle = "rgba(255,220,255,0.75)";
      ctx.font = "italic 32px Arial"; wrap('"' + hook + '"', 60, te + 60, W - 120, 48, 32);
      // Bottom gradient + CTA
      const bot = ctx.createLinearGradient(0, H - 220, 0, H);
      bot.addColorStop(0, "transparent"); bot.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = bot; ctx.fillRect(0, H - 220, W, 220);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px Arial"; ctx.textAlign = "center";
      ctx.fillText("Follow for more 🔥", W/2, H - 100);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "22px Arial"; ctx.fillText("getvci.com", W/2, H - 60);

    } else if (plt === "YouTube") {
      // YouTube — 16:9, dark red cinematic
      ctx.fillStyle = "#0a0000"; ctx.fillRect(0, 0, W, H);
      // Cinematic bars
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, 40); ctx.fillRect(0, H - 40, W, 40);
      // Red side accent
      const redL = ctx.createLinearGradient(0, 0, 300, 0);
      redL.addColorStop(0, "rgba(255,0,0,0.35)"); redL.addColorStop(1, "transparent");
      ctx.fillStyle = redL; ctx.fillRect(0, 40, 300, H - 80);
      // Play button bg glow
      const playGlow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 350);
      playGlow.addColorStop(0, "rgba(255,0,0,0.2)"); playGlow.addColorStop(1, "transparent");
      ctx.fillStyle = playGlow; ctx.fillRect(0, 0, W, H);
      // Play button
      ctx.fillStyle = "rgba(255,0,0,0.9)";
      ctx.beginPath(); (ctx as any).roundRect(W/2 - 50, H/2 - 35, 100, 70, 14); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 36px Arial"; ctx.textAlign = "center"; ctx.fillText("▶", W/2 + 3, H/2 + 13);
      // YouTube badge
      ctx.fillStyle = "#ff0000";
      ctx.beginPath(); (ctx as any).roundRect(50, 50, 200, 46, 8); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText("▶  YouTube", 68, 81);
      // Style + Duration
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); (ctx as any).roundRect(50, 108, 220, 36, 6); ctx.fill();
      ctx.fillStyle = "#aaa"; ctx.font = "16px Arial"; ctx.fillText(sty + "  ·  " + dur, 65, 131);
      // Title — bottom third
      ctx.shadowColor = "rgba(0,0,0,1)"; ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff"; ctx.textAlign = "left";
      const te2 = wrap(title.toUpperCase(), 50, H - 230, W - 100, 70, 58);
      ctx.shadowBlur = 8; ctx.fillStyle = "rgba(255,180,180,0.7)";
      ctx.font = "italic 24px Arial"; wrap('"' + hook + '"', 50, te2 + 30, W - 100, 36, 24);
      // Bottom bar
      ctx.shadowBlur = 0; ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, H - 42, W, 42);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "15px Arial"; ctx.textAlign = "right"; ctx.fillText("getvci.com", W - 30, H - 16);

    } else if (plt === "TikTok") {
      // TikTok — vertical 9:16, black with cyan+red duotone
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      // Scanline effect
      for (let y2 = 0; y2 < H; y2 += 4) {
        ctx.fillStyle = y2 % 8 === 0 ? "rgba(105,201,208,0.03)" : "rgba(238,29,82,0.02)";
        ctx.fillRect(0, y2, W, 2);
      }
      // Cyan left glow, red right glow
      const cyanG = ctx.createRadialGradient(0, H/2, 0, 0, H/2, 500);
      cyanG.addColorStop(0, "rgba(105,201,208,0.25)"); cyanG.addColorStop(1, "transparent");
      ctx.fillStyle = cyanG; ctx.fillRect(0, 0, W, H);
      const redG2 = ctx.createRadialGradient(W, H/2, 0, W, H/2, 500);
      redG2.addColorStop(0, "rgba(238,29,82,0.25)"); redG2.addColorStop(1, "transparent");
      ctx.fillStyle = redG2; ctx.fillRect(0, 0, W, H);
      // TikTok badge
      ctx.fillStyle = "#000";
      ctx.beginPath(); (ctx as any).roundRect(60, 80, 280, 54, 10); ctx.fill();
      ctx.strokeStyle = "#69c9d0"; ctx.lineWidth = 2;
      ctx.beginPath(); (ctx as any).roundRect(60, 80, 280, 54, 10); ctx.stroke();
      ctx.fillStyle = "#69c9d0"; ctx.font = "bold 24px Arial"; ctx.textAlign = "left"; ctx.fillText("♪ TikTok  ·  " + sty, 80, 115);
      ctx.fillStyle = "rgba(238,29,82,0.15)";
      ctx.beginPath(); (ctx as any).roundRect(60, 152, 120, 38, 19); ctx.fill();
      ctx.strokeStyle = "#ee1d52"; ctx.lineWidth = 1.5;
      ctx.beginPath(); (ctx as any).roundRect(60, 152, 120, 38, 19); ctx.stroke();
      ctx.fillStyle = "#ee1d52"; ctx.font = "bold 19px Arial"; ctx.fillText(dur, 80, 177);
      // Title
      ctx.shadowColor = "#69c9d0"; ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
      const te3 = wrap(title.toUpperCase(), 60, 500, W - 120, 90, 72);
      ctx.shadowColor = "#ee1d52"; ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "italic 30px Arial"; wrap('"' + hook + '"', 60, te3 + 55, W - 120, 46, 30);
      // Bottom TikTok UI simulation
      ctx.shadowBlur = 0;
      const botG2 = ctx.createLinearGradient(0, H - 300, 0, H);
      botG2.addColorStop(0, "transparent"); botG2.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = botG2; ctx.fillRect(0, H - 300, W, 300);
      ctx.fillStyle = "#fff"; ctx.font = "bold 26px Arial"; ctx.textAlign = "left"; ctx.fillText("@creator", 60, H - 120);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "22px Arial"; ctx.fillText("getvci.com · #viral", 60, H - 82);
      // Right side icons
      const icons = ["❤️", "💬", "↪️", "🎵"];
      icons.forEach((ic, ii) => {
        ctx.font = "40px Arial"; ctx.textAlign = "center"; ctx.fillText(ic, W - 65, H - 420 + ii * 90);
      });

    } else if (plt === "LinkedIn") {
      // LinkedIn — professional blue, clean
      ctx.fillStyle = "#012a4a"; ctx.fillRect(0, 0, W, H);
      const liGrad = ctx.createLinearGradient(0, 0, W, H);
      liGrad.addColorStop(0, "#013a5c"); liGrad.addColorStop(1, "#001d3d");
      ctx.fillStyle = liGrad; ctx.fillRect(0, 0, W, H);
      // Blue accent bar left
      ctx.fillStyle = "#0077b5"; ctx.fillRect(0, 0, 8, H);
      // Grid dots
      for (let gx = 60; gx < W; gx += 80) {
        for (let gy = 60; gy < H; gy += 80) {
          ctx.fillStyle = "rgba(0,119,181,0.12)"; ctx.beginPath(); ctx.arc(gx, gy, 2, 0, Math.PI*2); ctx.fill();
        }
      }
      // LinkedIn badge
      ctx.fillStyle = "#0077b5";
      ctx.beginPath(); (ctx as any).roundRect(50, 48, 230, 50, 6); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText("in  LinkedIn  ·  " + sty, 70, 80);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); (ctx as any).roundRect(50, 112, 140, 36, 6); ctx.fill();
      ctx.fillStyle = "#00a0dc"; ctx.font = "16px Arial"; ctx.fillText(dur, 68, 135);
      // Horizontal divider
      ctx.strokeStyle = "rgba(0,119,181,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(50, 190); ctx.lineTo(W - 50, 190); ctx.stroke();
      // Title
      ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
      const te4 = wrap(title, 50, 250, W - 100, 72, 62);
      ctx.shadowBlur = 8; ctx.fillStyle = "rgba(180,220,255,0.8)";
      ctx.font = "26px Arial"; wrap('"' + hook + '"', 50, te4 + 40, W - 100, 40, 26);
      // Bottom
      ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(0,119,181,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(50, H - 60); ctx.lineTo(W - 50, H - 60); ctx.stroke();
      ctx.fillStyle = "#0077b5"; ctx.font = "bold 16px Arial"; ctx.textAlign = "left"; ctx.fillText("Viral Content Intelligence", 50, H - 28);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "15px Arial"; ctx.textAlign = "right"; ctx.fillText("getvci.com", W - 50, H - 28);

    } else if (plt === "Twitter / X") {
      // Twitter/X — pure black, bold typography
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      // Subtle noise texture
      for (let i = 0; i < 3000; i++) {
        const nx = Math.random() * W, ny = Math.random() * H;
        ctx.fillStyle = "rgba(255,255,255,0.015)"; ctx.fillRect(nx, ny, 1, 1);
      }
      // X logo watermark
      ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.font = "bold 500px Arial"; ctx.textAlign = "center"; ctx.fillText("𝕏", W/2, H/2 + 160);
      // Blue accent line top
      ctx.fillStyle = "#1da1f2"; ctx.fillRect(0, 0, W, 5);
      // Badge
      ctx.fillStyle = "#1da1f2";
      ctx.beginPath(); (ctx as any).roundRect(50, 40, 200, 48, 24); ctx.fill();
      ctx.fillStyle = "#000"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText("𝕏  Twitter  ·  " + sty, 68, 72);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath(); (ctx as any).roundRect(50, 104, 110, 34, 17); ctx.fill();
      ctx.fillStyle = "#1da1f2"; ctx.font = "bold 16px Arial"; ctx.fillText(dur, 67, 126);
      // Title — huge bold
      ctx.shadowColor = "rgba(29,161,242,0.3)"; ctx.shadowBlur = 30;
      ctx.fillStyle = "#fff"; ctx.textAlign = "left";
      const te5 = wrap(title, 50, 230, W - 100, 78, 66);
      ctx.shadowBlur = 8; ctx.fillStyle = "rgba(150,200,255,0.7)";
      ctx.font = "italic 26px Arial"; wrap('"' + hook + '"', 50, te5 + 36, W - 100, 38, 26);
      // Bottom
      ctx.shadowBlur = 0; ctx.fillStyle = "rgba(29,161,242,0.12)"; ctx.fillRect(0, H - 52, W, 52);
      ctx.fillStyle = "#1da1f2"; ctx.font = "bold 16px Arial"; ctx.textAlign = "left"; ctx.fillText("𝕏 getvci.com", 50, H - 20);

    } else if (plt === "Facebook") {
      // Facebook — blue gradient, community feel
      const fbBg = ctx.createLinearGradient(0, 0, W, H);
      fbBg.addColorStop(0, "#001848"); fbBg.addColorStop(0.6, "#1a3a7a"); fbBg.addColorStop(1, "#0d2261");
      ctx.fillStyle = fbBg; ctx.fillRect(0, 0, W, H);
      // Circle pattern
      for (let ci = 0; ci < 8; ci++) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 80 + ci * 70, 0, Math.PI * 2); ctx.stroke();
      }
      // FB badge
      const fbGrad = ctx.createLinearGradient(50, 0, 290, 0);
      fbGrad.addColorStop(0, "#1877f2"); fbGrad.addColorStop(1, "#42a5f5");
      ctx.fillStyle = fbGrad;
      ctx.beginPath(); (ctx as any).roundRect(50, 48, 260, 50, 8); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 23px Arial"; ctx.textAlign = "left"; ctx.fillText("f  Facebook  ·  " + sty, 70, 81);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath(); (ctx as any).roundRect(50, 112, 130, 36, 6); ctx.fill();
      ctx.fillStyle = "#90caf9"; ctx.font = "bold 17px Arial"; ctx.fillText(dur, 68, 135);
      // Title
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
      const te6 = wrap(title.toUpperCase(), 50, 250, W - 100, 75, 62);
      ctx.shadowBlur = 10; ctx.fillStyle = "rgba(200,230,255,0.75)";
      ctx.font = "italic 26px Arial"; wrap('"' + hook + '"', 50, te6 + 40, W - 100, 40, 26);
      // Bottom
      ctx.shadowBlur = 0; ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, H - 50, W, 50);
      ctx.fillStyle = "#1877f2"; ctx.font = "bold 16px Arial"; ctx.textAlign = "left"; ctx.fillText("f  VCI — Viral Content Intelligence", 50, H - 20);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "15px Arial"; ctx.textAlign = "right"; ctx.fillText("getvci.com", W - 50, H - 20);

    } else {
      // Default — VCI purple (other platforms)
      const defBg = ctx.createLinearGradient(0, 0, W, H);
      defBg.addColorStop(0, "#050010"); defBg.addColorStop(0.6, "#1a0a3a"); defBg.addColorStop(1, "#050010");
      ctx.fillStyle = defBg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(109,40,217,0.08)"; ctx.lineWidth = 1;
      for (let x2 = 0; x2 < W; x2 += 80) { ctx.beginPath(); ctx.moveTo(x2,0); ctx.lineTo(x2,H); ctx.stroke(); }
      for (let y2 = 0; y2 < H; y2 += 80) { ctx.beginPath(); ctx.moveTo(0,y2); ctx.lineTo(W,y2); ctx.stroke(); }
      const glow2 = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 450);
      glow2.addColorStop(0, "rgba(109,40,217,0.35)"); glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(109,40,217,0.8)";
      ctx.beginPath(); (ctx as any).roundRect(50, 48, 280, 48, 24); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText(plt + "  ·  " + sty, 70, 80);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); (ctx as any).roundRect(50, 110, 120, 36, 18); ctx.fill();
      ctx.fillStyle = "#a78bfa"; ctx.font = "bold 17px Arial"; ctx.fillText(dur, 68, 133);
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 24;
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
      const ted = wrap(title.toUpperCase(), 50, 250, W - 100, 78, 66);
      ctx.shadowBlur = 10; ctx.fillStyle = "rgba(200,180,255,0.7)";
      ctx.font = "italic 28px Arial"; wrap('"' + hook + '"', 50, ted + 44, W - 100, 42, 28);
      ctx.shadowBlur = 0; ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, H - 50, W, 50);
      ctx.fillStyle = "#7c3aed"; ctx.font = "bold 16px Arial"; ctx.textAlign = "left"; ctx.fillText("VCI", 50, H - 20);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "15px Arial"; ctx.textAlign = "right"; ctx.fillText("getvci.com", W - 50, H - 20);
    }

    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const generateScript = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setGenerateLoading(true); setError(""); setGenerateResult(null); setThumbnailUrl(null);

    const durationGuide: Record<string, string> = {
      "15 sec": "VERY SHORT. Hook (0-3s, 1-2 sentences) + Key Point (3-12s, 2-3 sentences) + CTA (12-15s, 1 sentence). Total: ~30-40 words spoken.",
      "30 sec": "Hook (0-3s) + Problem (3-8s) + Solution (8-25s, 3-4 sentences with details) + CTA (25-30s). Total: ~70-90 words spoken.",
      "60 sec": "Hook (0-5s) + Problem (5-15s, 2-3 sentences) + 3 Key Points (15-50s, each point 2-3 sentences with example) + CTA (50-60s, 2 sentences). Total: ~150-180 words spoken.",
      "90 sec": "LONG FORM. Hook (0-5s, powerful opener) + Story/Context (5-20s, set the scene with 3-4 sentences) + Main Content (20-70s, 5-6 detailed tips or story beats, each 2-3 sentences with real examples) + Recap (70-80s, summarize key points) + CTA (80-90s, strong call to action). Total: ~220-260 words spoken. WRITE FULL DETAILED CONTENT for each section.",
      "3 min": "Full tutorial: Hook (0-10s) + Problem (10-30s) + Step-by-step solution (30-150s, 5-7 detailed steps) + Results/Proof (150-165s) + CTA (165-180s). Total: ~400-450 words.",
    };

    const platformGuide: Record<string, string> = {
      "Instagram": "Instagram Reels — vertical 9:16, hook in first 3 seconds, trending audio suggestion, end with save/share CTA",
      "YouTube": "YouTube Shorts or Long form — strong hook, value delivery, subscribe CTA",
      "TikTok": "TikTok — fast paced, trending sounds, pattern interrupt hook, duet/stitch friendly",
      "LinkedIn": "LinkedIn — professional story format, insight-driven, no trending audio needed",
      "Twitter / X": "Twitter/X — punchy thread format or video script, controversial hook",
      "Facebook": "Facebook Reels — emotional hook, community focused, share CTA",
    };

    const prompt = `You are a viral ${platform} content creator and script writer.

Create a complete ${duration} ${style} script for ${platform} about: "${keyword}"

Platform: ${platform}
Style: ${style}
Duration: ${duration}
Format Guide: ${durationGuide[duration]}
Platform Guide: ${platformGuide[platform]}
Language: ${langStrict}

Create a script that will go VIRAL. Be specific, emotional, and platform-perfect.

Respond ONLY in JSON:
{
  "title": "Catchy title for this script",
  "hook": "First 3 seconds — attention grabbing opener",
  "script": "Complete word-for-word script with [PAUSE], [SHOW X], [CUT TO] stage directions",
  "sections": [
    {"time": "0-3s", "label": "HOOK", "content": "exact words to say", "direction": "what to show/do"},
    {"time": "3-10s", "label": "PROBLEM", "content": "exact words", "direction": "visual direction"},
    {"time": "10-25s", "label": "SOLUTION", "content": "exact words", "direction": "visual direction"},
    {"time": "25-30s", "label": "CTA", "content": "exact words", "direction": "visual direction"}
  ],
  "caption": "Ready-to-post caption with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "thumbnail_idea": "What to show in thumbnail/cover",
  "audio_suggestion": "Type of music/sound that works best",
  "pro_tips": ["tip 1", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setGenerateResult(parsed);
      const thumb = generateThumbnail(parsed.title || keyword, parsed.hook || "", platform, style, duration);
      setThumbnailUrl(thumb);
      if (onSaveHistory) onSaveHistory("scriptlab", { platform, keyword, inputSummary: `${keyword} (${style}, ${duration})`, resultData: parsed });
    } catch { setError("Generation failed. Try again."); }
    setGenerateLoading(false);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Mode Toggle */}
      <div style={{ display: "flex", background: "#0f0f0f", borderRadius: "14px", padding: "0.35rem", marginBottom: "1rem", border: "1px solid #1f1f1f" }}>
        {[
          { id: "generate", label: "🎬 Generate Script", desc: "Fresh reel script banao" },
          { id: "improve", label: "✨ Improve Script", desc: "Existing script better banao" },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id as any); setError(""); }}
            style={{ flex: 1, padding: "0.65rem 1rem", borderRadius: "10px", border: "none", cursor: "pointer", transition: "all 0.2s", background: mode === m.id ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "transparent", color: mode === m.id ? "#fff" : "#52525b", fontWeight: mode === m.id ? 800 : 500, fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", textAlign: "center" as const }}>
            <div>{m.label}</div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, marginTop: "0.1rem" }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Platform Selector */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "1rem" }}>
        <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.5rem" }}>SELECT PLATFORM</label>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              style={{ background: platform === p.id ? `${p.color}15` : "#080808", border: `1px solid ${platform === p.id ? p.color : "#1f1f1f"}`, color: platform === p.id ? p.color : "#52525b", padding: "0.35rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s" }}>
              {p.emoji} {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* GENERATE MODE */}
      {mode === "generate" && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🎬</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Generate Reel Script</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Keyword daalo → complete word-for-word script ready</p>
            </div>
          </div>

          {/* Keyword */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>KEYWORD / TOPIC</label>
            <input value={keyword} onChange={e => { setKeyword(e.target.value); setError(""); }}
              placeholder={`e.g. weight loss, morning routine, AI tools...`}
              style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.8rem 1rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", fontFamily: "'Inter',sans-serif", transition: "border 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#6d28d9"}
              onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
          </div>

          {/* Style */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>SCRIPT STYLE</label>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)}
                  style={{ background: style === s ? "rgba(109,40,217,0.15)" : "#080808", border: `1px solid ${style === s ? "#6d28d9" : "#1f1f1f"}`, color: style === s ? "#8b5cf6" : "#52525b", padding: "0.28rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, transition: "all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>DURATION</label>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{ background: duration === d ? "rgba(109,40,217,0.15)" : "#080808", border: `1px solid ${duration === d ? "#6d28d9" : "#1f1f1f"}`, color: duration === d ? "#8b5cf6" : "#52525b", padding: "0.28rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.2s" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

          <button onClick={generateScript} disabled={generateLoading}
            style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: generateLoading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: generateLoading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.92rem", cursor: generateLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
            {generateLoading ? "🎬 Writing your script..." : `🎬 Generate ${duration} ${style} Script for ${platform}`}
          </button>
        </div>
      )}

      {/* GENERATE RESULT */}
      {mode === "generate" && generateResult && (
        <div style={{ animation: "slideUp 0.5s ease" }}>

          {/* Title + Hook */}
          <div style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.12),rgba(109,40,217,0.06))", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "14px", padding: "1.1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎬 SCRIPT TITLE</p>
                <p style={{ margin: 0, color: "#fff", fontSize: "1rem", fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>{generateResult.title}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)", color: "#8b5cf6", borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.68rem", fontWeight: 700 }}>{platform}</span>
                <span style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)", color: "#8b5cf6", borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.68rem", fontWeight: 700 }}>{duration}</span>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.6rem 0.85rem", marginTop: "0.5rem" }}>
              <p style={{ margin: "0 0 0.2rem", fontSize: "0.62rem", color: "#8b5cf6", fontWeight: 700 }}>⚡ HOOK (First 3 seconds)</p>
              <p style={{ margin: 0, color: "#f1f5f9", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.5 }}>{generateResult.hook}</p>
            </div>
          </div>

          {/* Script Sections */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎙️ SCRIPT BREAKDOWN</p>
            {(generateResult.sections || []).map((sec: any, i: number) => {
              const sectionColors: Record<string, string> = { HOOK: "#8b5cf6", PROBLEM: "#ef4444", SOLUTION: "#22c55e", CTA: "#f59e0b", INTRO: "#8b5cf6", TIPS: "#06b6d4", STORY: "#f59e0b", BODY: "#22c55e" };
              const color = sectionColors[sec.label] || "#8b5cf6";
              return (
                <div key={i} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "0.75rem 0.85rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ color, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em" }}>{sec.label}</span>
                    <span style={{ color: "#3f3f46", fontSize: "0.62rem" }}>{sec.time}</span>
                  </div>
                  <p style={{ margin: "0 0 0.3rem", color: "#f1f5f9", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 500 }}>{sec.content}</p>
                  {sec.direction && <p style={{ margin: 0, color: "#52525b", fontSize: "0.68rem", lineHeight: 1.4 }}>📷 {sec.direction}</p>}
                </div>
              );
            })}
          </div>

          {/* Full Script */}
          <div style={{ background: "linear-gradient(135deg,#080f08,#0a0f0a)", border: "1px solid #22c55e25", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>📝 COMPLETE WORD-FOR-WORD SCRIPT</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => copyText(generateResult.script, "fullscript")}
                  style={{ background: copiedKey === "fullscript" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "fullscript" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "fullscript" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                  {copiedKey === "fullscript" ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button onClick={() => { setScript(generateResult.script); setMode("improve"); window.scrollTo(0, 0); }}
                  style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.4)", color: "#8b5cf6", padding: "0.2rem 0.75rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                  ✨ Send to Improve →
                </button>
              </div>
            </div>
            <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{generateResult.script}</p>
          </div>

          {/* Caption + Hashtags */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700 }}>💬 CAPTION</p>
                <button onClick={() => copyText(generateResult.caption, "caption")} style={{ background: "none", border: "none", color: copiedKey === "caption" ? "#22c55e" : "#555", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>{copiedKey === "caption" ? "✓" : "Copy"}</button>
              </div>
              <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.78rem", lineHeight: 1.6 }}>{generateResult.caption}</p>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#06b6d4", fontWeight: 700 }}>#️⃣ HASHTAGS</p>
                <button onClick={() => copyText((generateResult.hashtags || []).join(" "), "hashtags")} style={{ background: "none", border: "none", color: copiedKey === "hashtags" ? "#22c55e" : "#555", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>{copiedKey === "hashtags" ? "✓" : "Copy"}</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {(generateResult.hashtags || []).map((tag: string, i: number) => (
                  <span key={i} style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4", padding: "0.15rem 0.45rem", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          {thumbnailUrl && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "0.9rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.06em" }}>🖼️ THUMBNAIL PREVIEW</p>
                <a href={thumbnailUrl} download={`vci-thumbnail-${keyword.replace(/\s+/g,"-")}.jpg`}
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.2rem 0.7rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, textDecoration: "none" }}>
                  ⬇ Download
                </a>
              </div>
              <img src={thumbnailUrl} alt="Generated Thumbnail" style={{ width: "100%", borderRadius: "10px", display: "block", border: "1px solid #222" }} />
              {generateResult.thumbnail_idea && (
                <p style={{ margin: "0.5rem 0 0", color: "#52525b", fontSize: "0.68rem", lineHeight: 1.5 }}>💡 {generateResult.thumbnail_idea}</p>
              )}
            </div>
          )}

          {/* AI Voice — Convert script to spoken audio */}
          <div style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(6,182,212,0.02))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.7rem", fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>🔊 CONVERT TO AI VOICE</p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>LANGUAGE</label>
                <select value={voiceLang} onChange={e => setVoiceLang(e.target.value)}
                  style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "8px", padding: "0.5rem 0.6rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
                  {Object.keys(AZURE_VOICES).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>VOICE</label>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {(["Female", "Male"] as const).map(g => (
                    <button key={g} onClick={() => setVoiceGender(g)}
                      style={{ flex: 1, background: voiceGender === g ? "rgba(6,182,212,0.15)" : "#080808", border: `1px solid ${voiceGender === g ? "#06b6d4" : "#1f1f1f"}`, color: voiceGender === g ? "#06b6d4" : "#52525b", padding: "0.5rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {voiceError && <p style={{ color: "#ef4444", fontSize: "0.72rem", margin: "0 0 0.5rem" }}>{voiceError}</p>}

            <button onClick={() => convertToVoice(generateResult.script)} disabled={voiceLoading}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", background: voiceLoading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: voiceLoading ? "#444" : "#000", fontWeight: 700, fontSize: "0.82rem", cursor: voiceLoading ? "not-allowed" : "pointer" }}>
              {voiceLoading ? "🎙️ Generating voice..." : "🎙️ Generate Voiceover"}
            </button>

            {audioUrl && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <audio controls src={audioUrl} style={{ width: "100%" }} />
                <a href={audioUrl} download={`vci-voiceover-${voiceLang}-${voiceGender}.mp3`}
                  style={{ textAlign: "center", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                  ⬇ Download MP3
                </a>
              </div>
            )}
          </div>

          {/* Audio */}
          {generateResult.audio_suggestion && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.35rem", fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>🎵 AUDIO SUGGESTION</p>
              <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{generateResult.audio_suggestion}</p>
            </div>
          )}

          {/* Pro Tips */}
          {generateResult.pro_tips && (
            <div style={{ background: "linear-gradient(135deg,#08080f,#0a0a14)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "14px", padding: "1rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>💡 PRO TIPS</p>
              {generateResult.pro_tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#8b5cf6", fontSize: "0.75rem", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMPROVE MODE */}
      {mode === "improve" && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.3rem" }}>✨</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Improve Existing Script</h3>
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Paste your script → Before/After comparison + improved version</p>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>YOUR SCRIPT / CONTENT</label>
            <textarea value={script} onChange={e => { setScript(e.target.value); setError(""); }}
              placeholder={`Paste your ${platform} script here...\n\nExamples:\n• "5 tips for weight loss that actually work"\n• Your complete reel script\n• Instagram caption or ad copy`}
              rows={7}
              style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#f1f5f9", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, transition: "border 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#6d28d9"}
              onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem" }}>Hook, caption, reel script or ad copy</span>
              <span style={{ color: "#3f3f46", fontSize: "0.65rem" }}>{script.length} chars</span>
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

          <button onClick={analyzeScript} disabled={improveLoading}
            style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: improveLoading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: improveLoading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.92rem", cursor: improveLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
            {improveLoading ? "✨ Analyzing & Improving..." : `✨ Analyze & Improve for ${platform}`}
          </button>
        </div>
      )}

      {/* IMPROVE RESULT */}
      {mode === "improve" && improveResult && (
        <div style={{ animation: "slideUp 0.5s ease" }}>
          {/* Score Jump */}
          <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(109,40,217,0.08))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "1rem", color: "#fff" }}>🚀 Script Improved!</div>
              <div style={{ color: "#71717a", fontSize: "0.72rem", marginTop: "0.2rem" }}>Your script got significantly better</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "1.8rem", color: gradeColor(improveResult.before?.grade), lineHeight: 1 }}>{improveResult.before?.score}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>BEFORE</div>
              </div>
              <div style={{ color: "#22c55e", fontWeight: 900, fontSize: "1.5rem" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "1.8rem", color: gradeColor(improveResult.after?.grade), lineHeight: 1 }}>{improveResult.after?.score}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>AFTER</div>
              </div>
              <div style={{ background: "#22c55e12", border: "1px solid #22c55e25", borderRadius: "8px", padding: "0.4rem 0.75rem", textAlign: "center" }}>
                <div style={{ color: "#22c55e", fontWeight: 900, fontSize: "1rem", fontFamily: "'Inter',sans-serif" }}>{improveResult.score_jump}</div>
                <div style={{ color: "#52525b", fontSize: "0.6rem", fontWeight: 700 }}>JUMP</div>
              </div>
            </div>
          </div>

          {/* Before / After Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #ef444325", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid #ef444420", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.8rem" }}>❌ BEFORE</span>
                <span style={{ color: gradeColor(improveResult.before?.grade), fontWeight: 900, fontSize: "1rem" }}>{improveResult.before?.grade} · {improveResult.before?.score}/100</span>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <p style={{ margin: "0 0 0.6rem", color: "#71717a", fontSize: "0.7rem", fontStyle: "italic", lineHeight: 1.5 }}>{improveResult.before?.summary}</p>
                {(improveResult.before?.lines || []).map((line: any, i: number) => (
                  <div key={i} style={{ borderLeft: `2px solid ${lineColor(line.type)}`, paddingLeft: "0.5rem", marginBottom: "0.4rem" }}>
                    <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{line.text}</p>
                    {line.issue && <p style={{ margin: "0.2rem 0 0", color: lineColor(line.type), fontSize: "0.62rem" }}>⚠️ {line.issue}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #22c55e25", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid #22c55e20", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "0.8rem" }}>✅ AFTER</span>
                <span style={{ color: gradeColor(improveResult.after?.grade), fontWeight: 900, fontSize: "1rem" }}>{improveResult.after?.grade} · {improveResult.after?.score}/100</span>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <p style={{ margin: "0 0 0.6rem", color: "#71717a", fontSize: "0.7rem", fontStyle: "italic", lineHeight: 1.5 }}>{improveResult.after?.summary}</p>
                {(improveResult.after?.lines || []).map((line: any, i: number) => (
                  <div key={i} style={{ borderLeft: "2px solid #22c55e", paddingLeft: "0.5rem", marginBottom: "0.4rem" }}>
                    <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.75rem", lineHeight: 1.5 }}>{line.text}</p>
                    {line.reason && <p style={{ margin: "0.2rem 0 0", color: "#22c55e", fontSize: "0.62rem" }}>✓ {line.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Improved Script */}
          <div style={{ background: "linear-gradient(135deg,#080f08,#0a0f0a)", border: "1px solid #22c55e25", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>✨ FULL IMPROVED SCRIPT</p>
              <button onClick={() => copyText(improveResult.after?.script || "", "improved")}
                style={{ background: copiedKey === "improved" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "improved" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "improved" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                {copiedKey === "improved" ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{improveResult.after?.script}</p>
          </div>

          {/* Improvements + Tips */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700 }}>📈 IMPROVEMENTS</p>
              {(improveResult.improvements || []).map((imp: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#22c55e", fontSize: "0.72rem", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.72rem", lineHeight: 1.5 }}>{imp}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700 }}>💡 PLATFORM TIPS</p>
              {(improveResult.platform_tips || []).map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#8b5cf6", fontSize: "0.72rem", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.72rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function HookScoreAnalyzer({ plan, usageCount, limit, onUpgrade, langStrict, onSaveHistory }: any) {
  const [contentInput, setContentInput] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const SCORE_PLATFORMS = [
    { id: "Instagram", emoji: "📸" }, { id: "YouTube", emoji: "▶️" },
    { id: "LinkedIn", emoji: "💼" }, { id: "Twitter / X", emoji: "🐦" },
    { id: "Facebook", emoji: "📘" }, { id: "TikTok", emoji: "🎵" },
    { id: "Google Ads", emoji: "📢" }, { id: "Meta Ads", emoji: "📘" },
  ];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const analyze = async () => {
    if (!contentInput.trim()) { setError("Apna content ya hook paste karo."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are an expert viral content analyst and coach. Analyze this content for ${platform}:

CONTENT TO ANALYZE:
"""
${contentInput}
"""

PLATFORM: ${platform}

LANGUAGE RULE: Detect the language of the content and respond in the SAME language. Hindi content = Hindi response. English = English.

ANALYSIS RULES:
- Score out of 100 (not 10). Be strict — average content scores 40-60.
- Analyze the FULL content, not just first line
- Give LINE-BY-LINE feedback on weak parts
- Give 3 platform-specific improved versions
- Identify exactly what's strong and what's weak

Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "scores": {
    "curiosity": 0,
    "emotion": 0,
    "virality": 0,
    "clarity": 0,
    "overall": 0
  },
  "grade": "A/B/C/D/F",
  "verdict": "2-3 line honest verdict",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "line_fixes": [
    {"original": "exact weak line or phrase from content (never write 'none')", "problem": "specific reason why this line is weak", "fixed": "completely rewritten better version"}
  ],
  "platform_versions": {
    "version1": {"label": "Curiosity Version", "content": "complete rewritten content"},
    "version2": {"label": "Emotion Version", "content": "complete rewritten content"},
    "version3": {"label": "Power Version", "content": "complete rewritten content"}
  },
  "pro_tips": ["tip 1 specific to ${platform}", "tip 2", "tip 3"]
}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setResult(parsed);
      if (onSaveHistory) onSaveHistory("hookscore", { platform, inputSummary: contentInput.slice(0, 80), resultData: parsed });
    } catch { setError("Analysis failed. Try again."); }
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";
  const gradeColor = (g: string) => g === "A" ? "#22c55e" : g === "B" ? "#06b6d4" : g === "C" ? "#f59e0b" : g === "D" ? "#f97316" : "#ef4444";
  const gradeLabel = (g: string) => g === "A" ? "🔥 Viral Ready!" : g === "B" ? "⚡ Almost There" : g === "C" ? "📈 Needs Work" : g === "D" ? "⚠️ Weak Content" : "💀 Rewrite Needed";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Input Card */}
      <div style={{ background: "linear-gradient(135deg,#0d0d0d,#111)", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.4rem" }}>📊</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff" }}>Content Score Analyzer</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Poora content paste karo → detailed analysis + fixes + 3 improved versions</p>
          </div>
        </div>

        {/* Platform selector */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#333", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {SCORE_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                style={{ background: platform === p.id ? "rgba(124,58,237,0.1)" : "#0a0a0a", border: `1px solid ${platform === p.id ? "#6d28d9" : "#1a1a1a"}`, color: platform === p.id ? "#6d28d9" : "#555", padding: "0.25rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, transition: "all 0.2s" }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Content textarea */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#333", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>
            APNA CONTENT PASTE KARO
            <span style={{ color: "#222", fontWeight: 400, marginLeft: "0.5rem" }}>
              (caption, hook, script, ad copy — kuch bhi)
            </span>
          </label>
          <textarea value={contentInput} onChange={e => { setContentInput(e.target.value); setError(""); }}
            placeholder={`Paste your ${platform} content here...\n\nFor example:\n"5 tips to lose weight fast without gym"\n\nYa poora caption/script bhi paste kar sakte ho!`}
            rows={6}
            style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'Inter',sans-serif", lineHeight: 1.6, transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#6d28d9"}
            onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
            <span style={{ color: "#222", fontSize: "0.65rem" }}>Hook, caption, script, ad copy — sab analyze hoga</span>
            <span style={{ color: "#52525b", fontSize: "0.68rem" }}>{contentInput.length} chars</span>
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}

        <button onClick={analyze} disabled={loading}
          style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#8b8cf8,#6366f1)", border: "none", color: loading ? "#333" : "#fff", fontWeight: 800, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.3s" }}>
          {loading ? "🔍 Analyzing your content..." : `🔍 Analyze for ${platform}`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ animation: "slideUp 0.5s ease" }}>

          {/* Overall Score Banner */}
          <div style={{ background: `${gradeColor(result.grade)}15`, border: `2px solid ${gradeColor(result.grade)}40`, borderRadius: "16px", padding: "1.25rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#fff" }}>{gradeLabel(result.grade)}</div>
                <div style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.2rem" }}>{result.verdict}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "3rem", color: gradeColor(result.grade), lineHeight: 1 }}>{result.grade}</div>
                <div style={{ color: "#555", fontSize: "0.65rem", fontWeight: 700 }}>GRADE</div>
              </div>
            </div>
          </div>

          {/* Score Bars — /100 */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 1rem", fontSize: "0.7rem", color: "#444", fontWeight: 700, letterSpacing: "0.06em" }}>📊 DETAILED SCORES /100</p>
            {[
              ["Curiosity", result.scores?.curiosity, "#6d28d9"],
              ["Emotion", result.scores?.emotion, "#ec4899"],
              ["Virality", result.scores?.virality, "#f59e0b"],
              ["Clarity", result.scores?.clarity, "#06b6d4"],
              ["Overall", result.scores?.overall, "#22c55e"],
            ].map(([label, score, color]: any) => (
              <div key={label} style={{ marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ color: "#888", fontSize: "0.72rem", fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 800, fontSize: "0.78rem" }}>{score}/100</span>
                </div>
                <div style={{ background: "#141414", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "4px", background: color, width: `${score}%`, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#081a08", border: "1px solid #22c55e30", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>✅ STRONG POINTS</p>
              {(result.strengths || []).map((s: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#22c55e", fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#aaa", fontSize: "0.72rem", lineHeight: 1.4 }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#1a0808", border: "1px solid #ef444430", borderRadius: "12px", padding: "0.85rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#ef4444", fontWeight: 700 }}>❌ WEAK POINTS</p>
              {(result.weaknesses || []).map((w: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#ef4444", fontSize: "0.7rem", flexShrink: 0 }}>✗</span>
                  <span style={{ color: "#aaa", fontSize: "0.72rem", lineHeight: 1.4 }}>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line by Line Fixes */}
          {result.line_fixes && result.line_fixes.length > 0 && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>🔧 LINE-BY-LINE FIXES</p>
              {result.line_fixes.map((fix: any, i: number) => (
                <div key={i} style={{ background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem", marginBottom: "0.5rem" }}>
                  <div style={{ color: "#ef4444", fontSize: "0.75rem", fontStyle: "italic", marginBottom: "0.25rem" }}>
                    {fix.original && fix.original !== "none" && fix.original !== "None" ? `"${fix.original}"` : "📝 General Improvement"}
                  </div>
                  <div style={{ color: "#555", fontSize: "0.68rem", marginBottom: "0.4rem" }}>
                    ⚠️ {fix.problem && fix.problem !== "no specific lines to fix" ? fix.problem : "Content mein yeh improvements karo"}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                    <span style={{ color: "#22c55e", fontSize: "0.68rem", flexShrink: 0, marginTop: "0.1rem" }}>✅ Fixed:</span>
                    <span style={{ color: "#22c55e", fontSize: "0.78rem", lineHeight: 1.5 }}>{fix.fixed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3 Platform Versions */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", color: "#6d28d9", fontWeight: 700, letterSpacing: "0.06em" }}>✨ 3 IMPROVED VERSIONS FOR {platform.toUpperCase()}</p>
            {result.platform_versions && Object.entries(result.platform_versions).map(([key, ver]: any, i) => {
              const colors = ["#6d28d9", "#06b6d4", "#22c55e"];
              const color = colors[i] || "#6d28d9";
              return (
                <div key={key} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: "10px", padding: "0.85rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ color, fontSize: "0.7rem", fontWeight: 700 }}>✨ {ver.label}</span>
                    <button onClick={() => copyText(ver.content, key)}
                      style={{ background: copiedKey === key ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === key ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === key ? "#22c55e" : "#555", padding: "0.15rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700 }}>
                      {copiedKey === key ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ margin: 0, color: "#ddd", fontSize: "0.83rem", lineHeight: 1.6 }}>{ver.content}</p>
                </div>
              );
            })}
          </div>

          {/* Pro Tips */}
          {result.pro_tips && result.pro_tips.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#0d0a1a,#0a0814)", border: "1px solid #8b8cf830", borderRadius: "14px", padding: "1rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", color: "#8b8cf8", fontWeight: 700, letterSpacing: "0.06em" }}>💡 PRO TIPS FOR {platform.toUpperCase()}</p>
              {result.pro_tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#8b8cf8", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContentCalendar({ plan, usageCount, limit, onUpgrade, keyword, niche, langStrict, onSaveHistory }: any) {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [calKeyword, setCalKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [calPlatform, setCalPlatform] = useState("Instagram");

  const CAL_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" }, { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" }, { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" }, { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
  ];

  const generate = async () => {
    if (!calKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setCalendar([]);

    const prompt = `You are a ${calPlatform} content strategist. Create a 30-day content calendar.
Platform: ${calPlatform}
Keyword: "${calKeyword}"
Niche: ${niche}
OUTPUT LANGUAGE: ${langStrict} — Write ALL hooks and notes in this language/script only. No English mixing.

STRICT RULES:
- Every hook must be platform-specific for ${calPlatform}
- Use varied content types: ${CONTENT_TYPES.join(", ")}
- All hooks must be in the specified language

Respond ONLY in JSON (no markdown):
{"days":[{"day":1,"type":"Tips","hook":"hook here","platform_note":"tip here"},...]}
Generate exactly 30 days.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      const days = parsed.days || [];
      setCalendar(days);
      if (onSaveHistory) onSaveHistory("calendar", { niche, platform: calPlatform, keyword: calKeyword, inputSummary: calKeyword, resultData: { days } });
    } catch { setError("Calendar generation failed. Try again."); }
    setLoading(false);
  };

  useEffect(() => { setCalKeyword(keyword || ""); }, [keyword]);

  const TYPE_COLORS: Record<string, string> = {
    Tips: "#8b8cf8", Story: "#f59e0b", Mistakes: "#ef4444", Tutorial: "#22c55e",
    Motivation: "#6d28d9", Trend: "#06b6d4", "Case Study": "#6d28d9",
    Poll: "#ec4899", Review: "#84cc16", Challenge: "#f97316",
    "Behind the Scenes": "#64748b", "Q&A": "#14b8a6"
  };

  const getWeek = (day: number) => Math.ceil(day / 7);
  const weeks = calendar.length ? Array.from(new Set(calendar.map(d => getWeek(d.day)))) : [];

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff" }}>30-Day Content Calendar</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>AI auto-plans your entire month of content</p>
          </div>
        </div>
        <input value={calKeyword} onChange={e => { setCalKeyword(e.target.value); setError(""); }}
          placeholder="Topic or keyword (e.g. weight loss)"
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "'Inter',sans-serif", transition: "border 0.2s", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#06b6d4"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {CAL_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setCalPlatform(p.id)} style={{ background: calPlatform === p.id ? `${p.color}18` : "#0a0a0a", border: `1px solid ${calPlatform === p.id ? p.color : "#1a1a1a"}`, color: calPlatform === p.id ? p.color : "#444", padding: "0.28rem 0.75rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", background: loading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: loading ? "#333" : "#fff", fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "⚡ Planning 30 days..." : "📅 Generate My Content Calendar"}
        </button>
      </div>
      {calendar.length > 0 && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#555", fontSize: "0.75rem" }}>30 days of content ready</span>
            <button onClick={() => navigator.clipboard.writeText(calendar.map(d => `Day ${d.day} (${d.type}): ${d.hook}`).join("\n"))} style={{ background: "#ffffff0a", border: "1px solid #2a2a2a", color: "#666", padding: "0.25rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Copy All</button>
          </div>
          {weeks.map(week => (
            <div key={week} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#333", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.4rem" }}>WEEK {week}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {calendar.filter(d => getWeek(d.day) === week).map((day) => {
                  const color = TYPE_COLORS[day.type] || "#6d28d9";
                  return (
                    <div key={day.day} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.65rem 0.85rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = color + "40")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                      onClick={() => { navigator.clipboard.writeText(day.hook); setCopiedDay(day.day); setTimeout(() => setCopiedDay(null), 1500); }}>
                      <div style={{ flexShrink: 0, textAlign: "center", minWidth: "36px" }}>
                        <div style={{ fontSize: "0.6rem", color: "#333", fontWeight: 700 }}>{DAYS[(day.day - 1) % 7]}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", fontFamily: "'Inter',sans-serif" }}>{day.day}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, background: color + "18", border: `1px solid ${color}30`, color, borderRadius: "4px", padding: "0.08rem 0.4rem" }}>{day.type}</span>
                          {copiedDay === day.day && <span style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 700 }}>✓ Copied!</span>}
                        </div>
                        <p style={{ margin: 0, color: "#bbb", fontSize: "0.8rem", lineHeight: 1.5 }}>{day.hook}</p>
                        {day.platform_note && <p style={{ margin: "0.2rem 0 0", color: "#333", fontSize: "0.68rem" }}>💡 {day.platform_note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentPack({ plan, usageCount, limit, onUpgrade, keyword, niche, platform, langStrict, onSaveHistory }: any) {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<any>(null);
  const [packKeyword, setPackKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [packType, setPackType] = useState<"ads" | "youtube" | "instagram">("instagram");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const PACK_TYPES = [
    { id: "instagram", label: "📸 Instagram & TikTok", desc: "Hooks, Reels, Captions, Hashtags" },
    { id: "youtube", label: "▶️ YouTube", desc: "Titles, Scripts, Descriptions, Tags" },
    { id: "ads", label: "📢 Google & Meta Ads", desc: "Headlines, Ad Copy, CTAs" },
  ];

  const generate = async () => {
    if (!packKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setPack(null);

    const packPrompts: Record<string, string> = {
      instagram: `You are an Instagram & TikTok viral content expert. Generate:
- hooks: 10 viral opening lines
- titles: 8 post/reel title ideas
- captions: 5 full captions with emojis and CTA
- scripts: 5 Reel/TikTok scripts
- hashtags: 15 relevant hashtags`,
      youtube: `You are a YouTube content strategist. Generate:
- hooks: 8 video hook lines
- titles: 10 SEO-optimized video titles
- captions: 5 video descriptions
- scripts: 5 full intro scripts
- hashtags: 10 YouTube tags`,
      ads: `You are a Google Ads & Meta Ads expert. Generate:
- hooks: 10 Google Ad headlines (MAX 30 chars each)
- titles: 8 Meta Ad headlines (MAX 40 chars each)
- captions: 5 ad descriptions (MAX 90 chars each)
- scripts: 5 Meta ad primary texts
- hashtags: []`,
    };

    const prompt = `${packPrompts[packType]}

KEYWORD: ${packKeyword}
NICHE: ${niche}
OUTPUT LANGUAGE: ${langStrict} — Write EVERYTHING in this language/script. No English mixing.

Respond ONLY in JSON:
{"hooks":[],"titles":[],"captions":[],"scripts":[],"hashtags":[]}`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const packData = JSON.parse(text.replace(/```json|```/g, "").trim());
      setPack(packData);
      if (onSaveHistory) onSaveHistory("pack", { niche, platform, keyword: packKeyword, inputSummary: `${packKeyword} (${packType})`, resultData: packData });
    } catch { setError("Pack generation failed. Try again."); }
    setLoading(false);
  };

  useEffect(() => { setPackKeyword(keyword || ""); }, [keyword]);

  const sectionLabels: Record<string, any[]> = {
    instagram: [
      { key: "hooks", label: "Viral Hooks", emoji: "🎣", color: "#6d28d9" },
      { key: "titles", label: "Post Titles", emoji: "📝", color: "#8b8cf8" },
      { key: "captions", label: "Captions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Reel Scripts", emoji: "🎬", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags", emoji: "#️⃣", color: "#06b6d4" },
    ],
    youtube: [
      { key: "hooks", label: "Video Hooks", emoji: "🎬", color: "#6d28d9" },
      { key: "titles", label: "SEO Titles", emoji: "📝", color: "#8b8cf8" },
      { key: "captions", label: "Descriptions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Intro Scripts", emoji: "🎙️", color: "#f59e0b" },
      { key: "hashtags", label: "YouTube Tags", emoji: "#️⃣", color: "#06b6d4" },
    ],
    ads: [
      { key: "hooks", label: "Google Headlines", emoji: "📢", color: "#6d28d9" },
      { key: "titles", label: "Meta Headlines", emoji: "📘", color: "#8b8cf8" },
      { key: "captions", label: "Ad Descriptions", emoji: "💬", color: "#22c55e" },
      { key: "scripts", label: "Meta Ad Copies", emoji: "🎯", color: "#f59e0b" },
      { key: "hashtags", label: "Hashtags", emoji: "#️⃣", color: "#06b6d4" },
    ],
  };

  const copySection = (key: string, items: string[]) => {
    navigator.clipboard.writeText(items.join("\n"));
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📦</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff" }}>One-Click Content Pack</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Choose your platform — get complete content pack</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {PACK_TYPES.map(pt => (
            <button key={pt.id} onClick={() => { setPackType(pt.id as any); setPack(null); }}
              style={{ background: packType === pt.id ? "rgba(124,58,237,0.1)" : "#0a0a0a", border: `1px solid ${packType === pt.id ? "#6d28d9" : "#1a1a1a"}`, borderRadius: "10px", padding: "0.65rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ color: packType === pt.id ? "#6d28d9" : "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{pt.label}</span>
              <span style={{ color: "#444", fontSize: "0.72rem" }}>{pt.desc}</span>
            </button>
          ))}
        </div>
        <input value={packKeyword} onChange={e => { setPackKeyword(e.target.value); setError(""); }}
          placeholder="Enter keyword (e.g. meal prep)"
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "'Inter',sans-serif", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}
        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", background: loading ? "#111" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: loading ? "#333" : "#000", fontWeight: 800, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "⚡ Building your pack..." : "📦 Generate Full Content Pack"}
        </button>
      </div>
      {pack && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {sectionLabels[packType].map(({ key, label, emoji, color }) => {
            const items = pack[key] || [];
            const isOpen = openSection === key;
            return (
              <div key={key} style={{ background: "#0f0f0f", border: `1px solid ${isOpen ? color + "40" : "#1a1a1a"}`, borderRadius: "12px", marginBottom: "0.5rem", overflow: "hidden" }}>
                <div onClick={() => setOpenSection(isOpen ? null : key)} style={{ padding: "0.85rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{emoji}</span>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>{label}</span>
                    <span style={{ background: color + "18", border: `1px solid ${color}30`, color, borderRadius: "20px", padding: "0.1rem 0.5rem", fontSize: "0.65rem", fontWeight: 700 }}>{items.length}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button onClick={e => { e.stopPropagation(); copySection(key, items); }} style={{ background: copiedSection === key ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedSection === key ? "#22c55e" : "#2a2a2a"}`, color: copiedSection === key ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
                      {copiedSection === key ? "✓" : "Copy"}
                    </button>
                    <span style={{ color: "#333" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${color}20`, padding: "0 1rem 1rem" }}>
                    {items.map((item: string, i: number) => (
                      <div key={i} style={{ padding: "0.5rem 0", borderBottom: i < items.length - 1 ? "1px solid #111" : "none", display: "flex", gap: "0.75rem" }}>
                        <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                        <p style={{ margin: 0, color: "#ccc", fontSize: "0.83rem", lineHeight: 1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function CaptionHashtags({ plan, usageCount, limit, onUpgrade, keyword, niche, langStrict, onCreditUsed, onSaveHistory }: any) {
  const [kw, setKw] = useState(keyword || "");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
    { id: "WhatsApp", emoji: "💬", color: "#25d366" },
  ];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => { setKw(keyword || ""); }, [keyword]);

  const generate = async () => {
    if (!kw.trim()) { setError("Please enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are a ${platform} content expert.
Keyword: "${kw}"
Platform: ${platform}
OUTPUT LANGUAGE: ${langStrict}

IMPORTANT: Generate content ONLY about the keyword "${kw}". Ignore any other context.

Generate ONLY:
1. 5 ready-to-post captions (with emojis, CTA, engaging tone) — all about "${kw}"
2. 20 relevant hashtags specific to "${kw}"

Respond ONLY in JSON:
{"captions":["caption 1","caption 2","caption 3","caption 4","caption 5"],"hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15","#tag16","#tag17","#tag18","#tag19","#tag20"]}`;

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse"); }
      setResult(parsed);
      if (onCreditUsed) onCreditUsed();
      if (onSaveHistory) onSaveHistory("caption", { niche, platform, keyword: kw, inputSummary: kw, resultData: parsed });
    } catch { setError("Generation failed. Try again."); }
    setLoading(false);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <div style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "10px", padding: "0.4rem 0.6rem", fontSize: "1.2rem" }}>📋</div>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 700 }}>Caption & Hashtags</h3>
            <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Platform select karo → keyword daalo → ready-to-post! (2 credits)</p>
          </div>
        </div>
        <div style={{ marginBottom: "0.85rem" }}>
          <label style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                style={{ background: platform === p.id ? `${p.color}15` : "#080808", border: `1px solid ${platform === p.id ? p.color : "#1f1f1f"}`, color: platform === p.id ? p.color : "#52525b", padding: "0.3rem 0.75rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, transition: "all 0.2s" }}>
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "0.85rem" }}>
          <label style={{ color: "#71717a", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>KEYWORD / TOPIC</label>
          <input value={kw} onChange={e => { setKw(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="e.g. weight loss, morning routine, travel..."
            style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.8rem 1rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", fontFamily: "'Inter',sans-serif", transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#6d28d9"}
            onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}
        <button onClick={generate} disabled={loading}
          style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: loading ? "#404040" : "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "✨ Generating..." : `📋 Generate Captions & Hashtags for ${platform}`}
        </button>
      </div>

      {result && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.7rem", fontWeight: 700 }}>✓ Ready for {platform}</span>
            <span style={{ color: "#3f3f46", fontSize: "0.68rem" }}>Copy & post directly!</span>
          </div>
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>💬 CAPTIONS (5 ready-to-post)</p>
              <button onClick={() => copyText((result.captions || []).join("\n\n"), "allcaptions")}
                style={{ background: copiedKey === "allcaptions" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "allcaptions" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "allcaptions" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                {copiedKey === "allcaptions" ? "✓ Copied!" : "Copy All"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {(result.captions || []).map((cap: string, i: number) => (
                <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", lineHeight: 1.7, flex: 1 }}>{cap}</p>
                    <button onClick={() => copyText(cap, `cap${i}`)}
                      style={{ background: copiedKey === `cap${i}` ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === `cap${i}` ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === `cap${i}` ? "#22c55e" : "#555", padding: "0.2rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                      {copiedKey === `cap${i}` ? "✓" : "📋"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>#️⃣ HASHTAGS (20 optimized)</p>
              <button onClick={() => copyText((result.hashtags || []).join(" "), "allhash")}
                style={{ background: copiedKey === "allhash" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === "allhash" ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === "allhash" ? "#22c55e" : "#555", padding: "0.2rem 0.65rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                {copiedKey === "allhash" ? "✓ Copied!" : "Copy All"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {(result.hashtags || []).map((tag: string, i: number) => (
                <button key={i} onClick={() => copyText(tag, `tag${i}`)}
                  style={{ background: copiedKey === `tag${i}` ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.06)", border: `1px solid ${copiedKey === `tag${i}` ? "#06b6d4" : "rgba(6,182,212,0.2)"}`, color: copiedKey === `tag${i}` ? "#06b6d4" : "#52525b", padding: "0.25rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, transition: "all 0.15s" }}>
                  {copiedKey === `tag${i}` ? "✓ " : ""}{tag}
                </button>
              ))}
            </div>
            <p style={{ margin: "0.75rem 0 0", color: "#3f3f46", fontSize: "0.65rem" }}>💡 Click any hashtag to copy · Copy All for all at once</p>
          </div>
        </div>
      )}
    </div>
  );
}


function NicheIntelligence({ niche, keyword, langLabel }: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const searchQuery = keyword && keyword.trim() ? `${keyword} ${niche}` : niche;

  const analyze = async () => {
    setLoading(true); setError(""); setData(null);

    try {
      const ytRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/youtube-search?q=${encodeURIComponent(searchQuery)}&country=IN`);
      let ytVideos: any[] = [];
      if (ytRes.ok) {
        const d = await ytRes.json();
        ytVideos = (d.items || []).slice(0, 5).map((v: any) => ({
          title: v.snippet?.title || "",
          channel: v.snippet?.channelTitle || "",
        }));
      }

      const gRes = await fetch(`https://viral-tool-1.onrender.com/api/trends/google?q=${encodeURIComponent(searchQuery)}&country=IN`);
      let rising: string[] = [];
      if (gRes.ok) {
        const d = await gRes.json();
        rising = (d.related_queries?.rising || []).slice(0, 8).map((q: any) => q.query);
      }

      const subjectLabel = keyword ? `${keyword} (${niche} niche)` : niche;
      const prompt = `You are a content strategy analyst. Based on this REAL data for "${subjectLabel}" in India:

TRENDING YOUTUBE VIDEOS:
${ytVideos.map((v, i) => `${i+1}. ${v.title} (by ${v.channel})`).join("\n") || "No data"}

RISING GOOGLE SEARCHES:
${rising.join(", ") || "No data"}

Analyze this and respond ONLY in JSON:
{
  "competition": "Low/Medium/High",
  "trend_score": 7,
  "best_content_types": ["type1", "type2", "type3"],
  "content_gaps": ["gap idea 1", "gap idea 2", "gap idea 3"],
  "best_posting_times": "specific advice for India",
  "summary": "2-3 line honest analysis right now",
  "opportunity": "one clear actionable opportunity for a creator"
}

CRITICAL: trend_score MUST be an integer between 0 and 10 only. Never output a number above 10 for trend_score.`;

      const aiRes = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const aiData = await aiRes.json();
      const text = aiData.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else parsed = {}; }

      if (typeof parsed.trend_score === "number") {
        parsed.trend_score = Math.max(0, Math.min(10, Math.round(parsed.trend_score)));
      }

      setData({ ...parsed, ytVideos, rising });
    } catch { setError("Analysis failed. Try again."); }
    setLoading(false);
  };

  const compColor = (c: string) => c === "Low" ? "#22c55e" : c === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "linear-gradient(135deg,#0d0d0d,#111)", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.4rem" }}>🔍</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff" }}>Niche Intelligence</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Real YouTube + Google data analysis for your niche</p>
          </div>
        </div>
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.85rem" }}>
          <p style={{ margin: "0 0 0.5rem", color: "#888", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em" }}>ANALYZING</p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {keyword && keyword.trim() && (
              <span style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>📝 {keyword}</span>
            )}
            <span style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.3)", color: "#8b5cf6", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>🏷️ {niche}</span>
          </div>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.5rem" }}>{error}</p>}
        <button onClick={analyze} disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#0891b2,#06b6d4)", border: "none", color: loading ? "#333" : "#000", fontWeight: 800, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "🔍 Analyzing real trending data..." : `🔍 Analyze "${keyword && keyword.trim() ? keyword : niche}"`}
        </button>
      </div>

      {data && (
        <div style={{ animation: "slideUp 0.5s ease" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#0f0f0f", border: `1px solid ${compColor(data.competition)}30`, borderRadius: "14px", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.62rem", color: "#555", fontWeight: 700 }}>COMPETITION</p>
              <p style={{ margin: 0, color: compColor(data.competition), fontWeight: 900, fontSize: "1.3rem" }}>{data.competition || "N/A"}</p>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #22c55e30", borderRadius: "14px", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.62rem", color: "#555", fontWeight: 700 }}>TREND SCORE</p>
              <p style={{ margin: 0, color: "#22c55e", fontWeight: 900, fontSize: "1.3rem" }}>{Math.min(10, data.trend_score || 0)}/10</p>
            </div>
          </div>

          {data.summary && (
            <div style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.08),rgba(6,182,212,0.08))", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>📊 SUMMARY</p>
              <p style={{ margin: 0, color: "#d4d4d8", fontSize: "0.85rem", lineHeight: 1.6 }}>{data.summary}</p>
            </div>
          )}

          {data.ytVideos && data.ytVideos.length > 0 && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", color: "#ef4444", fontWeight: 700, letterSpacing: "0.06em" }}>▶️ TRENDING ON YOUTUBE RIGHT NOW</p>
              {data.ytVideos.map((v: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", padding: "0.5rem 0", borderBottom: i < data.ytVideos.length - 1 ? "1px solid #161616" : "none" }}>
                  <span style={{ color: "#333", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <div>
                    <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.82rem", lineHeight: 1.4 }}>{v.title}</p>
                    <p style={{ margin: "0.15rem 0 0", color: "#444", fontSize: "0.68rem" }}>by {v.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.rising && data.rising.length > 0 && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>📈 RISING SEARCHES (REAL DATA)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {data.rising.map((r: string, i: number) => (
                  <span key={i} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", padding: "0.25rem 0.65rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>{r}</span>
                ))}
              </div>
            </div>
          )}

          {data.best_content_types && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>🎯 BEST CONTENT TYPES</p>
              {data.best_content_types.map((t: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#f59e0b", fontSize: "0.72rem", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#bbb", fontSize: "0.78rem" }}>{t}</span>
                </div>
              ))}
            </div>
          )}

          {data.content_gaps && (
            <div style={{ background: "linear-gradient(135deg,#0a0a14,#0d0d1a)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.06em" }}>💡 CONTENT GAPS</p>
              {data.content_gaps.map((g: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#a855f7", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#d4d4d8", fontSize: "0.8rem", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))}
            </div>
          )}

          {data.best_posting_times && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>⏰ BEST POSTING TIME</p>
              <p style={{ margin: 0, color: "#bbb", fontSize: "0.8rem", lineHeight: 1.5 }}>{data.best_posting_times}</p>
            </div>
          )}

          {data.opportunity && (
            <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(6,182,212,0.06))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "14px", padding: "1.1rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>🚀 YOUR OPPORTUNITY</p>
              <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 600 }}>{data.opportunity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentModal({ plan, onClose, onPaid }: any) {
  const [currency, setCurrency] = useState("INR");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const planData = PLANS[plan as keyof typeof PLANS];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
      <div style={{ background: "#080808", border: "1px solid #6d28d9", borderRadius: "20px", padding: "1.75rem", maxWidth: "460px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem" }}>💳</div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "1.3rem", margin: "0.5rem 0", color: "#6d28d9" }}>Complete Payment</h2>
          <div style={{ display: "inline-block", background: "#6d28d918", border: "1px solid #6d28d940", borderRadius: "20px", padding: "0.3rem 1rem" }}>
            <span style={{ fontWeight: 800 }}>{planData?.label} — <span style={{ color: "#6d28d9" }}>₹{planData?.priceINR} / ${planData?.priceUSD}</span></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", background: "#111111", borderRadius: "10px", padding: "0.3rem", marginBottom: "1.25rem" }}>
          {[["INR", "🇮🇳 UPI (India)"], ["USD", "🌍 PayPal (Worldwide)"]].map(([c, label]) => (
            <button key={c} onClick={() => setCurrency(c)} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none", background: currency === c ? "#6d28d9" : "transparent", color: currency === c ? "#000" : "#666", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>{label}</button>
          ))}
        </div>
        {currency === "INR" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <p style={{ color: "#555", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>📱 Scan with PhonePe / GPay / Paytm</p>
            <div style={{ background: "#111111", border: "2px solid #6d28d930", borderRadius: "14px", padding: "1rem", display: "inline-block", marginBottom: "0.75rem" }}>
              <img src={getUPIQR(YOUR_UPI_ID, planData?.priceINR)} alt="UPI QR" style={{ width: "160px", height: "160px", borderRadius: "8px", display: "block" }} />
            </div>
            <div style={{ background: "#080808", border: "1px solid #6d28d925", borderRadius: "10px", padding: "0.6rem 1rem", margin: "0 auto 0.75rem", maxWidth: "300px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <span style={{ color: "#6d28d9", fontWeight: 700, wordBreak: "break-all" }}>{YOUR_UPI_ID}</span>
              <button onClick={() => { navigator.clipboard.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: copied ? "#22c55e22" : "#6d28d918", border: `1px solid ${copied ? "#22c55e" : "#6d28d940"}`, color: copied ? "#22c55e" : "#6d28d9", padding: "0.25rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
        {currency === "USD" && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ background: "#0a1628", border: "1px solid #003087", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "3rem" }}>🅿️</div>
              <a href={`${YOUR_PAYPAL_ME}/${planData?.priceUSD}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg,#003087,#009cde)", color: "#fff", padding: "0.8rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 800 }}>
                Pay ${planData?.priceUSD} via PayPal →
              </a>
            </div>
          </div>
        )}
        {!paid ? (
          <button onClick={() => { setPaid(true); setTimeout(() => onPaid(plan), 1800); }} style={{ width: "100%", padding: "0.9rem", borderRadius: "10px", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginBottom: "0.5rem" }}>
            ✅ I've Paid — Request Activation
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "0.9rem", background: "#22c55e18", border: "1px solid #22c55e", borderRadius: "10px", marginBottom: "0.5rem", color: "#22c55e", fontWeight: 800 }}>
            🎉 Activating your plan...
          </div>
        )}
        <p style={{ color: "#333", fontSize: "0.72rem", textAlign: "center", margin: "0 0 0.75rem" }}>Access granted after manual verification.</p>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
      </div>
    </div>
  );
}

function PaywallModal({ onClose, onSelectPlan }: any) {
  const [selected, setSelected] = useState("starter");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#080808", border: "1px solid #6d28d9", borderRadius: "20px", padding: "1.75rem", maxWidth: "480px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🚀</div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "1.4rem", margin: "0.5rem 0", color: "#6d28d9" }}>Free Limit Reached!</h2>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>Upgrade to unlock Hook Scoring, 30-Day Calendars, Content Packs & more.</p>
        </div>
        <div style={{ display: "grid", gap: "0.65rem", marginBottom: "1.25rem" }}>
          {Object.entries(PLANS).filter(([k]) => k !== "free").map(([key, plan]: any) => (
            <div key={key} onClick={() => setSelected(key)} style={{ border: `${selected === key ? "2" : "1"}px solid ${selected === key ? "#6d28d9" : "#1e1e1e"}`, borderRadius: "12px", padding: "0.9rem 1rem", background: selected === key ? "rgba(168,85,247,0.07)" : "#0d0d0d", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{plan.label} {plan.badge}</div>
                <div style={{ color: "#444", fontSize: "0.76rem" }}>{plan.limit} credits/mo</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6d28d9" }}>₹{plan.priceINR}</div>
                <div style={{ color: "#333", fontSize: "0.72rem" }}>${plan.priceUSD} / mo</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onSelectPlan(selected)} style={{ width: "100%", padding: "0.9rem", borderRadius: "10px", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginBottom: "0.5rem" }}>
          Get {PLANS[selected as keyof typeof PLANS]?.label} — ₹{PLANS[selected as keyof typeof PLANS]?.priceINR} →
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Maybe later</button>
      </div>
    </div>
  );
}

// Auto-detect hook style for tagging — used for performance pattern matching
function detectHookStyle(text: string): string {
  const t = text.toLowerCase();
  if (t.match(/\?$|kya|why|how|kaise|kyun/)) return "Question";
  if (t.match(/never|always|secret|nobody|hidden|shocking|truth/)) return "Curiosity";
  if (t.match(/before|after|transformation|from.*to/)) return "Before/After";
  if (t.match(/\d+\s*(tips|ways|reasons|steps|mistakes|hacks)/)) return "Listicle";
  if (t.match(/stop|don't|avoid|mistake|wrong/)) return "Warning";
  if (t.match(/i |my |me\b/)) return "Personal Story";
  if (t.match(/free|today|now|limited|last chance/)) return "Urgency";
  return "Statement";
}

// Crowd-intelligence: shows what's trending across ALL users in this niche, last 7 days
// Smart keyword suggestions: real crowd search data, falls back to static curated list
function SmartKeywordSuggestions({ niche, currentKeyword, onSelect }: any) {
  const [smartKeywords, setSmartKeywords] = useState<{ keyword: string; users: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        // Try recent (last 7 days) trending keywords first
        const { data: recent, error: e1 } = await supabase.rpc("get_smart_keywords", { p_niche: niche, p_limit: 6 });
        if (!active) return;

        if (!e1 && recent && recent.length >= 3) {
          setSmartKeywords(recent.map((r: any) => ({ keyword: r.keyword, users: r.unique_users })));
          setLoading(false);
          return;
        }

        // Fallback: all-time popular keywords for this niche
        const { data: allTime, error: e2 } = await supabase.rpc("get_alltime_keywords", { p_niche: niche, p_limit: 6 });
        if (!active) return;

        if (!e2 && allTime && allTime.length >= 2) {
          setSmartKeywords(allTime.map((r: any) => ({ keyword: r.keyword, users: r.unique_users })));
        } else {
          setSmartKeywords([]); // not enough data yet — will fall back to static list in render
        }
      } catch {
        setSmartKeywords([]);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [niche]);

  // Use crowd data if available, otherwise fall back to the static curated examples
  const showingSmart = !loading && smartKeywords.length >= 2;
  const displayList = showingSmart
    ? smartKeywords
    : (NICHE_EXAMPLES[niche] || []).map(k => ({ keyword: k, users: 0 }));

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.35rem" }}>
        {showingSmart ? <Flame size={11} color="#f59e0b" /> : <Tag size={11} color="#52525b" />}
        <span style={{ color: showingSmart ? "#f59e0b" : "#52525b", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em" }}>
          {showingSmart ? "TRENDING SEARCHES" : "RELATED KEYWORDS"}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
        {displayList.map(({ keyword: ex, users }) => (
          <button key={ex} onClick={() => onSelect(ex)}
            style={{ background: currentKeyword === ex ? "rgba(109,40,217,0.12)" : "#0d0d0d", border: `1px solid ${currentKeyword === ex ? "#6d28d9" : "#1e1e1e"}`, color: currentKeyword === ex ? "#8b5cf6" : "#444", padding: "0.25rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            onMouseEnter={e => { if (currentKeyword !== ex) { (e.currentTarget as any).style.borderColor = "#333"; (e.currentTarget as any).style.color = "#888"; } }}
            onMouseLeave={e => { if (currentKeyword !== ex) { (e.currentTarget as any).style.borderColor = "#1e1e1e"; (e.currentTarget as any).style.color = "#444"; } }}>
            {users >= 5 && <span style={{ fontSize: "0.6rem" }}>🔥</span>}
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrendingNowCard({ niche, platform }: any) {
  const [trend, setTrend] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        // Prefer a trend specific to the selected platform
        const { data: platformData } = await supabase
          .from("trending_styles")
          .select("*")
          .eq("niche", niche)
          .eq("platform", platform)
          .order("generation_count", { ascending: false })
          .limit(1);

        if (!active) return;

        if (platformData && platformData.length > 0) {
          setTrend(platformData[0]);
          setLoading(false);
          return;
        }

        // Fall back to the top trend across any platform for this niche
        const { data: anyData, error } = await supabase
          .from("trending_styles")
          .select("*")
          .eq("niche", niche)
          .order("generation_count", { ascending: false })
          .limit(1);

        if (!active) return;
        if (error || !anyData || anyData.length === 0) { setTrend(null); setLoading(false); return; }
        setTrend(anyData[0]);
      } catch {
        if (active) setTrend(null);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [niche, platform]);

  if (loading || !trend) return null;

  const samePlatform = trend.platform === platform;

  return (
    <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.03))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px", padding: "0.9rem 1.1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontSize: "1.4rem" }}>🔥</span>
      <div>
        <p style={{ margin: 0, color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700 }}>
          Trending now on <strong>{trend.platform}</strong>: <strong>{trend.style}</strong> style hooks <span style={{ color: "#71717a", fontWeight: 500 }}>in {niche}</span>
        </p>
        <p style={{ margin: "0.15rem 0 0", color: "#52525b", fontSize: "0.68rem" }}>
          {trend.pct_share}% of creators used this style in the last 7 days · Based on {trend.generation_count} generations
          {!samePlatform && <span style={{ color: "#3f3f46" }}> · Showing top platform overall</span>}
        </p>
      </div>
    </div>
  );
}

// Keyword research table for Ads platforms — AI-estimated volume/competition, clearly labeled
function KeywordResearchCard({ keywords }: { keywords: any[] }) {
  const [copied, setCopied] = useState(false);
  if (!Array.isArray(keywords) || keywords.length === 0) return null;

  const levelColor = (lvl: string) => lvl === "High" ? "#ef4444" : lvl === "Medium" ? "#f59e0b" : "#22c55e";
  const intentColor: Record<string, string> = { Commercial: "#8b5cf6", Informational: "#06b6d4", Navigational: "#71717a", Transactional: "#22c55e" };

  const copyAll = () => {
    const text = keywords.map(k => `${k.keyword}\t${k.matchType}\tVolume: ${k.volume}\tCompetition: ${k.competition}\tIntent: ${k.intent}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", color: "#06b6d4", fontSize: "0.88rem" }}>🔑 Keyword Research</h3>
        <button onClick={copyAll} style={{ background: copied ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied ? "#22c55e" : "#2a2a2a"}`, color: copied ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
          {copied ? "✓ Copied!" : "Copy all"}
        </button>
      </div>
      <p style={{ margin: "0 0 0.75rem", color: "#3f3f46", fontSize: "0.65rem", lineHeight: 1.5 }}>
        AI-estimated relative volume & competition — for directional guidance, not exact Google data. Policy-checked: no unverifiable claims or banned terms.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {keywords.map((k, i) => (
          <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.7rem 0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ color: "#e4e4e7", fontSize: "0.82rem", fontWeight: 700 }}>{k.keyword}</span>
              <span style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.25)", color: "#8b5cf6", fontSize: "0.6rem", fontWeight: 700, padding: "0.08rem 0.4rem", borderRadius: "8px" }}>{k.matchType}</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.65rem", color: "#52525b" }}>Volume: <strong style={{ color: levelColor(k.volume) }}>{k.volume}</strong></span>
              <span style={{ fontSize: "0.65rem", color: "#52525b" }}>Competition: <strong style={{ color: levelColor(k.competition) }}>{k.competition}</strong></span>
              <span style={{ fontSize: "0.65rem", color: "#52525b" }}>Intent: <strong style={{ color: intentColor[k.intent] || "#71717a" }}>{k.intent}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ title, items, emoji, color, charLimit }: any) {
  const [copied, setCopied] = useState(false);
  const safeItems: string[] = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  return (
    <div style={{ background: "#0f0f0f", border: `1px solid ${color}22`, borderRadius: "14px", padding: "1.1rem", marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", color, fontSize: "0.88rem" }}>{emoji} {title}</h3>
        <button onClick={() => { navigator.clipboard.writeText(safeItems.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: copied ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied ? "#22c55e" : "#2a2a2a"}`, color: copied ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
          {copied ? "✓ Copied!" : "Copy all"}
        </button>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
        {safeItems.map((item: string, i: number) => {
          const len = item.length;
          const overLimit = charLimit && len > charLimit;
          return (
            <li key={i} style={{ color: "#ccc", fontSize: "0.83rem", marginBottom: "0.35rem", lineHeight: 1.6, display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <span>{item}</span>
              {charLimit && (
                <span style={{ flexShrink: 0, fontSize: "0.65rem", fontWeight: 700, color: overLimit ? "#ef4444" : "#22c55e", whiteSpace: "nowrap" }}>
                  {len}/{charLimit}{overLimit ? " ⚠" : ""}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TabBtn({ id, label, Icon, active, onClick, isPro }: any) {
  return (
    <button onClick={() => onClick(id)}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(109,40,217,0.08)"; e.currentTarget.style.color = "#6d28d9"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3f3f46"; }}}
      style={{ flex: 1, padding: "0.55rem 0.2rem", borderRadius: "8px", border: "none", background: active ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "transparent", color: active ? "#ffffff" : "#3f3f46", fontWeight: active ? 700 : 500, fontSize: "0.68rem", cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.2s", position: "relative", boxShadow: active ? "0 2px 12px rgba(109,40,217,0.4)" : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
      {Icon && <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />}
      <span>{label}</span>
      {isPro && !active && (
        <span style={{ position: "absolute", top: 2, right: 2, fontSize: "0.45rem", background: "#6d28d920", border: "1px solid #6d28d940", color: "#6d28d9", borderRadius: "4px", padding: "0.05rem 0.2rem", fontWeight: 700 }}>PRO</span>
      )}
    </button>
  );
}

// History panel — shows past activity across all features, click any entry to restore it
function HistoryPanel({ userId, onClose, onRestore }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFeature, setFilterFeature] = useState<string>("all");

  const FEATURE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    generate: { label: "Generate", icon: "⚡", color: "#6d28d9" },
    hookscore: { label: "Hook Score", icon: "📊", color: "#06b6d4" },
    caption: { label: "Captions", icon: "📋", color: "#22c55e" },
    calendar: { label: "Calendar", icon: "📅", color: "#f59e0b" },
    pack: { label: "Pack", icon: "📦", color: "#ec4899" },
    scriptlab: { label: "Script Lab", icon: "🎬", color: "#f97316" },
    scriptimprove: { label: "Script Improve", icon: "✨", color: "#a855f7" },
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from("user_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(200);
        setHistory(data || []);
      } catch {}
      setLoading(false);
    })();
  }, [userId]);

  const filtered = filterFeature === "all" ? history : history.filter(h => h.feature === filterFeature);
  const usedFeatures = Array.from(new Set(history.map(h => h.feature)));

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#080808", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "20px", padding: "1.5rem", maxWidth: "560px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>🕘 History</h2>
            <p style={{ margin: "0.1rem 0 0", color: "#52525b", fontSize: "0.74rem" }}>Everything you've generated, across every tool</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1f1f1f", color: "#666", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: "1rem", flexShrink: 0 }}>✕</button>
        </div>

        {usedFeatures.length > 1 && (
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            <button onClick={() => setFilterFeature("all")} style={{ background: filterFeature === "all" ? "rgba(109,40,217,0.15)" : "#0d0d0d", border: `1px solid ${filterFeature === "all" ? "#6d28d9" : "#1a1a1a"}`, color: filterFeature === "all" ? "#8b5cf6" : "#555", padding: "0.25rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>All</button>
            {usedFeatures.map(f => {
              const meta = FEATURE_LABELS[f] || { label: f, icon: "•", color: "#71717a" };
              return (
                <button key={f} onClick={() => setFilterFeature(f)}
                  style={{ background: filterFeature === f ? meta.color + "20" : "#0d0d0d", border: `1px solid ${filterFeature === f ? meta.color : "#1a1a1a"}`, color: filterFeature === f ? meta.color : "#555", padding: "0.25rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <p style={{ color: "#444", fontSize: "0.8rem", textAlign: "center", padding: "2rem 0" }}>Loading history...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              <p style={{ color: "#444", fontSize: "0.82rem" }}>Nothing here yet. Generate something and it'll show up.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map(item => {
                const meta = FEATURE_LABELS[item.feature] || { label: item.feature, icon: "•", color: "#71717a" };
                return (
                  <button key={item.id} onClick={() => onRestore(item)}
                    style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "0.75rem 0.9rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color + "50"; e.currentTarget.style.background = "#111"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#0d0d0d"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ background: meta.color + "18", border: `1px solid ${meta.color}30`, color: meta.color, fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "10px" }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={{ color: "#3f3f46", fontSize: "0.65rem" }}>{timeAgo(item.created_at)}</span>
                    </div>
                    <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.input_summary || "Untitled"}
                    </p>
                    {(item.niche || item.platform) && (
                      <p style={{ margin: "0.15rem 0 0", color: "#52525b", fontSize: "0.68rem" }}>
                        {item.niche}{item.niche && item.platform ? " · " : ""}{item.platform}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #111", marginBottom: "0.1rem" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", padding: "0.85rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: "0.75rem" }}>
        <span style={{ color: open ? "#22c55e" : "#e4e4e7", fontWeight: 600, fontSize: "0.85rem", textAlign: "left" }}>{q}</span>
        <span style={{ color: open ? "#22c55e" : "#444", fontSize: "1rem", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: "0.85rem", animation: "slideUp 0.2s ease" }}>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// Tutorial: one feature card with icon, what-it-does line, and numbered visual steps
function TutorialFeature({ icon: Icon, color, name, tagline, steps, credit }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${open ? color + "40" : "#1a1a1a"}`, borderRadius: "14px", marginBottom: "0.6rem", overflow: "hidden", transition: "border-color 0.2s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 38, height: 38, borderRadius: "10px", background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>{name}</span>
            {credit && <span style={{ background: color + "15", border: `1px solid ${color}30`, color, fontSize: "0.6rem", fontWeight: 700, padding: "0.08rem 0.4rem", borderRadius: "10px", flexShrink: 0 }}>{credit}</span>}
          </div>
          <p style={{ margin: "0.1rem 0 0", color: "#52525b", fontSize: "0.72rem", lineHeight: 1.4 }}>{tagline}</p>
        </div>
        <span style={{ color: open ? color : "#444", fontSize: "1rem", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 1rem 1rem 1rem", animation: "slideUp 0.2s ease" }}>
          <div style={{ borderTop: `1px solid ${color}20`, paddingTop: "0.85rem" }}>
            {steps.map((step: { label: string; detail: string }, i: number) => (
              <div key={i} style={{ display: "flex", gap: "0.65rem", marginBottom: i < steps.length - 1 ? "0.7rem" : 0 }}>
                <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: color + "18", border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.78rem", fontWeight: 700 }}>{step.label}</p>
                  <p style={{ margin: "0.15rem 0 0", color: "#71717a", fontSize: "0.74rem", lineHeight: 1.5 }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViralContentTool() {
  // Persisted across refresh: keyword, platform, niche, results, and active tab
  const [keyword, setKeyword] = useState(() => {
    try { return localStorage.getItem("vci_keyword") || ""; } catch { return ""; }
  });
  const [platform, setPlatform] = useState(() => {
    try { return localStorage.getItem("vci_platform") || "Instagram"; } catch { return "Instagram"; }
  });
  const [niche, setNiche] = useState(() => {
    try { return localStorage.getItem("vci_niche") || "Fitness"; } catch { return "Fitness"; }
  });
  const [showNiche, setShowNiche] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(() => {
    try { const saved = localStorage.getItem("vci_results"); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [plan, setPlan] = useState("free");
  const [showPaywall, setShowPaywall] = useState(false);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("vci_activeTab") || "generate"; } catch { return "generate"; }
  });
  const [showContact, setShowContact] = useState(false);
  const [legalPage, setLegalPage] = useState<"privacy" | "terms" | "refund" | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRole, setReviewRole] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<any>(() => {
    try { const saved = localStorage.getItem("viral_profile"); return saved ? JSON.parse(saved) : null; }
    catch { return null; }
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setProfile(data ?? null);
        if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(data?.user_type || "creator"); }
        if (data?.referral_code) { localStorage.setItem("viral_profile", JSON.stringify(data)); }
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        if (session?.user?.email === ADMIN_EMAIL) { setPlan("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined) {
          setUsageCount((data.credits_total || 100) - data.credits_remaining);
        }
      }
      setProfileLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setUser(session.user);
        setProfile(data ?? null);
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        if (session.user.email === ADMIN_EMAIL) { setPlan("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined) {
          setUsageCount((data.credits_total || 100) - data.credits_remaining);
        }
        if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(data.user_type); }
        setProfileLoading(false);
      } else {
        setUser(null); setProfile(null); setPlan("free"); setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const limit = PLANS[plan as keyof typeof PLANS]?.limit || 100;

  // Persist key state to localStorage so a refresh doesn't lose progress
  useEffect(() => { try { localStorage.setItem("vci_keyword", keyword); } catch {} }, [keyword]);
  useEffect(() => { try { localStorage.setItem("vci_platform", platform); } catch {} }, [platform]);
  useEffect(() => { try { localStorage.setItem("vci_niche", niche); } catch {} }, [niche]);
  useEffect(() => { try { localStorage.setItem("vci_activeTab", activeTab); } catch {} }, [activeTab]);
  useEffect(() => {
    try {
      if (results) localStorage.setItem("vci_results", JSON.stringify(results));
      else localStorage.removeItem("vci_results");
    } catch {}
  }, [results]);
  const remaining = Math.max(0, limit - usageCount);
  const usedPct = Math.min(100, (usageCount / limit) * 100);
  const langLabel = getLangLabel(selectedLang);
  const langStrict = getLangStrict(selectedLang);

  const CREDIT_COSTS: Record<string, number> = { generate: 1, score: 1, image: 2, pack: 3, calendar: 5, scriptgenerate: 6, scriptimprove: 2 };

  const incrementUsage = (feature: string = "generate") => {
    const cost = CREDIT_COSTS[feature] || 1;
    setUsageCount(prev => prev + cost);
  };

  // Universal history saver — call this from any feature after a successful generation
  const saveToHistory = async (feature: string, data: { niche?: string; platform?: string; keyword?: string; inputSummary: string; resultData: any }) => {
    if (!user?.id) return;
    try {
      await supabase.from("user_history").insert({
        user_id: user.id,
        feature,
        niche: data.niche || null,
        platform: data.platform || null,
        keyword: data.keyword || null,
        input_summary: data.inputSummary,
        result_data: data.resultData,
      });
    } catch {}
  };

  // Maps a history feature key to its tab id
  const FEATURE_TO_TAB: Record<string, string> = {
    generate: "generate", hookscore: "score", caption: "caption",
    calendar: "calendar", pack: "pack", scriptlab: "scriptlab", scriptimprove: "scriptlab",
  };

  const restoreFromHistory = (item: any) => {
    if (item.niche) setNiche(item.niche);
    if (item.platform) setPlatform(item.platform);
    if (item.keyword) setKeyword(item.keyword);
    setActiveTab(FEATURE_TO_TAB[item.feature] || "generate");
    if (item.feature === "generate") {
      setResults(item.result_data);
    }
    setShowHistory(false);
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) { setError("Please enter a keyword first."); return; }
    const { data: userData } = await supabase.from("users").select("generations_used_today, last_reset_date, plan, credits_remaining").eq("id", user.id).single();
    if (userData) {
      const today = new Date().toISOString().split("T")[0];
      if (userData.last_reset_date !== today) {
        await supabase.from("users").update({ generations_used_today: 0, last_reset_date: today }).eq("id", user.id);
        userData.generations_used_today = 0;
      }
      if (userData.credits_remaining <= 0) { setShowPaywall(true); return; }
    }
    if (usageCount >= limit) { setShowPaywall(true); return; }
    setLoading(true); setError(""); setResults(null);

    const nicheContext: Record<string, string> = {
      "Fitness": "fitness, gym, workout, weight loss", "Business": "entrepreneurship, startup, business growth",
      "Tech": "technology, AI tools, coding", "Lifestyle": "daily routines, personal growth",
      "Food": "recipes, cooking, food trends", "Daily Vlog": "day in my life, vlog",
      "Comedy & Entertainment": "funny content, comedy", "Sports": "cricket, football, sports",
      "Spirituality": "meditation, manifestation", "AI & Automation": "AI tools, automation",
      "Personal Finance": "investing, saving, passive income", "Mental Health": "wellness, mindfulness",
      "Beauty & Skincare": "skincare, makeup, beauty", "Ads & Marketing": "digital marketing, ads",
      "Education": "online learning, courses", "Travel": "travel tips, destinations",
      "Fashion & Style": "fashion, style, outfits", "Real Estate": "property, investment",
      "Motivational": "success mindset, motivation", "Health & Wellness": "healthy lifestyle, yoga",
      "Gaming": "video games, esports, gaming",
    };

    try {
      const adsCopyGuide: Record<string, string> = {
        "Google Ads": `Generate professional Google Search Ads copy following these strict rules:
- viralHooks: 5 Search Ad headlines, EACH STRICTLY 25-30 characters (count carefully, never exceed 30). Each headline must use a DIFFERENT angle: one with a number/stat, one with urgency, one with a clear benefit, one as a question, one with a direct CTA. Avoid generic filler words like "Today", "Now" stacked together — make each one sound like real Google Ads copy a paid ads professional would write.
- titles: 5 Display/Responsive headlines, EACH STRICTLY 25-30 characters, each highlighting a distinct unique selling point (price, quality, speed, guarantee, variety) — no two headlines should repeat the same angle.
- captions: 3 ad descriptions, EACH STRICTLY 80-90 characters, following a clear structure: specific benefit + supporting detail + soft call-to-action. Sound like a real advertiser, not a template.
- trendingTopics: skip, leave as short relevant search terms instead (max 5 words each)`,
        "Meta Ads": `Generate professional Meta (Facebook/Instagram) Ads copy:
- viralHooks: 5 primary text openers (80-125 characters each), each opening with a different pain point or desire specific to "${keyword}" — vary the emotional angle (curiosity, fear of missing out, social proof, savings, convenience).
- titles: 5 ad headlines (30-40 characters each), each a distinct, scroll-stopping benefit statement — no repeated phrasing across the 5.
- captions: 3 full ad copies (150-200 characters), each following Problem → Agitate → Solution → CTA, written like a real performance marketer, not generic filler.`,
        "YouTube Ads": `Generate professional YouTube Ads copy:
- viralHooks: 5 first-5-second hook lines that stop a viewer from skipping, each using a different technique (bold claim, question, visual tease, relatable problem, social proof).
- titles: 5 companion banner headlines (40-60 characters), each highlighting a different benefit.
- captions: 3 full :15-second ad scripts structured as Hook(0-5s) → Value(5-12s) → CTA(12-15s), written as natural spoken dialogue, not robotic.`,
        "Native Ads": `Generate professional Native Ads copy (editorial-style, blends with content):
- viralHooks: 5 curiosity-driven headlines that read like real editorial content, not obvious ads — each using a distinct hook style (listicle, question, bold claim, "how I", insider secret).
- titles: 5 article-style titles, each sounding like a genuine blog/news headline about "${keyword}".
- captions: 3 advertorial intros (120-160 characters), informational tone, no hard selling language.`,
      };

      const platformGuide: Record<string, string> = {
        "Instagram": "5 Reel opening lines, 5 post titles, 3 captions with hashtags, 5 trending topics",
        "YouTube": "5 video hooks, 5 SEO titles, 3 descriptions, 5 trending formats",
        "TikTok": "5 first-3-second hooks, 5 caption ideas, 3 video scripts, 5 trending sounds",
        "Facebook": "5 post hooks, 5 shareable headlines, 3 posts, 5 content formats",
        "Reddit": "5 post titles, 5 subreddit ideas, 3 post bodies, 5 trending topics",
        "LinkedIn": "5 post openers, 5 article titles, 3 posts, 5 trending topics",
        "Twitter / X": "5 tweet hooks, 5 thread titles, 3 tweet threads, 5 trending topics",
        "Pinterest": "5 pin titles, 5 board names, 3 pin descriptions, 5 trending searches",
        "WhatsApp": "5 broadcast openers, 5 status ideas, 3 messages, 5 content ideas",
        "Snapchat": "5 story hooks, 5 story ideas, 3 snap texts, 5 trending formats",
        "Google Ads": adsCopyGuide["Google Ads"],
        "Meta Ads": adsCopyGuide["Meta Ads"],
        "YouTube Ads": adsCopyGuide["YouTube Ads"],
        "Native Ads": adsCopyGuide["Native Ads"],
      };

      const isAdsplatform = ["Google Ads", "Meta Ads", "Native Ads", "YouTube Ads"].includes(platform);

      const keywordResearchInstruction = isAdsplatform ? `

ALSO generate a keyword research list for this campaign. Follow these rules strictly:
- The keyword "${keyword}" is what the advertiser is actually selling or promoting — treat it as the literal product/service/offer, not as a lifestyle topic.
- Suggest 8 keyword variations that stay directly relevant to "${keyword}" itself (synonyms, buyer-intent phrases, use-cases, related product terms) — mixing match types: broad, phrase, and exact.
- Do NOT force-fit unrelated themes onto the keyword. If "${keyword}" is a product (e.g. "sell bags"), all 8 suggestions must be about that product category — not about an unrelated lifestyle or fitness angle.
- Treat the niche label "${niche}" as a loose category hint only — if it doesn't genuinely match the keyword's actual subject, ignore it and stay faithful to the keyword instead.
- For each keyword, estimate relative search volume as "High", "Medium", or "Low" (relative comparison only — clearly an estimate, not exact data)
- For each keyword, estimate competition as "High", "Medium", or "Low"
- Classify search intent as "Commercial", "Informational", "Navigational", or "Transactional"
- COMPLY WITH GOOGLE ADS POLICY: do not suggest keywords containing superlative/unverifiable health, financial, or miracle claims (e.g. avoid "cure", "guaranteed", "best in the world", "#1"). Keep keywords factual and policy-safe.
- Do not suggest trademarked brand names unless the user's own keyword already contains one.` : "";

      const keywordJsonField = isAdsplatform
        ? `,"keywordSuggestions":[{"keyword":"kw1","matchType":"Broad","volume":"Medium","competition":"Low","intent":"Commercial"}]`
        : "";

      const adNicheNote = isAdsplatform
        ? `\nNote: the niche label "${niche}" is a rough category guess — if "${keyword}" is clearly a product/service that doesn't match this niche, write the ad copy and keywords based on the keyword itself, not the niche label.`
        : "";

      const expertPersona = isAdsplatform
        ? `You are a senior paid-ads copywriter with 10+ years writing high-converting Google, Meta, and YouTube ad campaigns. You write copy that real advertisers pay for — never generic, never templated, never repetitive across variations.`
        : `You are a ${platform} content expert for ${niche} niche.`;

      const charLimitReminder = isAdsplatform
        ? `\n\nCRITICAL: Before finalizing, count the characters in every headline/title/description and verify it fits the stated limit EXACTLY. If a line is too long, rewrite it shorter — never truncate mid-word. Each of the 5 headlines and 5 titles must use a genuinely different angle — no two should follow the same sentence structure or repeat words like "Today", "Now", "Sale" in more than one line.`
        : "";

      const prompt = `${expertPersona}
Keyword: "${keyword}"${adNicheNote}

Generate: ${platformGuide[platform] || platformGuide["Instagram"]}${keywordResearchInstruction}${charLimitReminder}

OUTPUT LANGUAGE: ${langStrict}
IMPORTANT: Write EVERYTHING in the specified language/script. No English mixing if non-English selected.
Keyword suggestions (if any) should stay in English/Latin script regardless of output language, since ad platforms require Latin-script targeting in most markets.

Respond ONLY in JSON:
{"trendingTopics":["t1","t2","t3","t4","t5"],"viralHooks":["h1","h2","h3","h4","h5"],"titles":["t1","t2","t3","t4","t5"],"captions":["c1","c2","c3"]${keywordJsonField}}`;

      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2200, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Parse failed");
      }
      // Normalize: ensure every array field is always an array, even if the AI omitted it
      const safeResults = {
        trendingTopics: Array.isArray(parsed.trendingTopics) ? parsed.trendingTopics : [],
        viralHooks: Array.isArray(parsed.viralHooks) ? parsed.viralHooks : [],
        titles: Array.isArray(parsed.titles) ? parsed.titles : [],
        captions: Array.isArray(parsed.captions) ? parsed.captions : [],
        keywordSuggestions: Array.isArray(parsed.keywordSuggestions) ? parsed.keywordSuggestions : [],
      };
      setResults(safeResults);
      incrementUsage();
      const detectedStyles = safeResults.viralHooks.map((h: string) => detectHookStyle(h));
      await supabase.from("generated_content").insert({ user_id: user.id, niche, platform, language: langLabel, keyword, hooks: safeResults.viralHooks, titles: safeResults.titles, captions: safeResults.captions, trending_topics: safeResults.trendingTopics, hook_styles: detectedStyles });
      await supabase.from("users").update({ generations_used_today: (userData?.generations_used_today || 0) + 1, credits_remaining: (userData?.credits_remaining || 0) - 1 }).eq("id", user.id);
      saveToHistory("generate", { niche, platform, keyword, inputSummary: keyword, resultData: safeResults });
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    await supabase.from("reviews").insert({ user_id: user.id, name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : user.email?.split("@")[0], role: reviewRole || "Content Creator", review: reviewText, stars: reviewStars, approved: false });
    setReviewSubmitted(true); setReviewLoading(false);
    setTimeout(() => { setShowReview(false); setReviewSubmitted(false); setReviewText(""); setReviewRole(""); setReviewStars(5); }, 2000);
  };

  const handleSelectPlan = (p: string) => { setShowPaywall(false); setPayingPlan(p); };
  const handlePaid = (p: string) => { setPayingPlan(null); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000); };

  const tabs = [
    { id: "generate", label: "Generate", Icon: Zap },
    { id: "score", label: "Hook Score", Icon: BarChart2 },
    { id: "caption", label: "Captions", Icon: FileText },
    { id: "intelligence", label: "Intelligence", Icon: Search },
    { id: "calendar", label: "Calendar", Icon: CalendarDays },
    { id: "pack", label: "Pack", Icon: Package },
    { id: "trends", label: "Trends", Icon: TrendingUp },
    { id: "image", label: "Image AI", Icon: Image },
    { id: "scriptlab", label: "Script Lab", Icon: Film },
  ];

  if (authLoading || profileLoading) return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6d28d9", fontFamily: "sans-serif", animation: "pulse 1s infinite" }}>⚡ Loading...</p>
    </div>
  );

  if (showContact) return <Contact onBack={() => setShowContact(false)} />;
  if (legalPage) return <Legal page={legalPage} onBack={() => setLegalPage(null)} />;
  if (showOnboarding && user) return <Onboarding userId={user.id} onComplete={(type: string) => { setUserType(type); setShowOnboarding(false); }} />;
  if (showAdmin) return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  if (showPlans) return <Plans onBack={() => setShowPlans(false)} onUpgrade={(selectedPlan: string) => { setShowPlans(false); setPayingPlan(selectedPlan); }} currentPlan={plan} />;
  if (!user) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))} />;

  const freeLangs = ["en"];
  const starterLangs = ["en", "hi"];

  return (
    <>
      <Helmet>
        <title>VCI — Viral Content Intelligence</title>
        <meta name="description" content="AI-powered tool to discover and predict viral content for creators and brands." />
      </Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #000000; max-width: 100vw; overflow-x: hidden; }
        #root { max-width: 100vw; overflow-x: hidden; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes floatUp { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes floatDown { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(8px)} }
        .sidebar-card { transition: all 0.3s; }
        .sidebar-card:hover { border-color: rgba(109,40,217,0.3) !important; transform: translateY(-2px); }
        @media (max-width: 1200px) { .left-sidebar, .right-sidebar { display: none !important; } }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.15)} 50%{box-shadow:0 0 24px rgba(124,58,237,0.25)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .gbtn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 4px 20px rgba(124,58,237,0.2) !important; }
        .tbtn:hover { border-color:#6d28d9!important; color:#6d28d9!important; }

        /* Tab bar — scrollable row on all screens, never wraps/squeezes */
        .tab-scroll-row {
          display: flex;
          gap: 0.25rem;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }
        .tab-scroll-row::-webkit-scrollbar { display: none; }
        .tab-scroll-row > button {
          flex: 0 0 auto !important;
          scroll-snap-align: start;
          min-width: 78px;
        }

        @media (max-width: 768px) {
          .desktop-btn { display: none !important; }
          .mobile-header { padding: 3.5rem 0.75rem 0.5rem !important; max-width: 100vw; overflow-x: hidden; }
          .mobile-top-bar { display: flex !important; }
          .tab-scroll-row > button { min-width: 68px; font-size: 0.62rem !important; padding: 0.5rem 0.15rem !important; }
          .platform-btn-row { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .platform-btn-row::-webkit-scrollbar { display: none; }
          .platform-btn-row > button { flex: 0 0 auto !important; white-space: nowrap; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .mobile-header { padding: 1.25rem 1.5rem 1rem !important; }
        }
        .mobile-top-bar { display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 999; align-items: center; padding: 0.5rem 0.75rem; background: #080808; border-bottom: 1px solid #1a1a1a; gap: 0.4rem; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .mobile-top-bar::-webkit-scrollbar { display: none; }
        .mobile-top-bar > button { flex-shrink: 0; }
        .profile-trigger { display: block; }
        @media (max-width: 768px) {
          .profile-trigger { top: 0.75rem !important; left: 0.75rem !important; }
        }
        input,textarea { box-sizing:border-box; max-width: 100%; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000000", color: "#f1f5f9", fontFamily: "'Inter',sans-serif", position: "relative" }}>

        {/* LEFT SIDEBAR */}
        <div className="left-sidebar" style={{ position: "fixed", left: "1.25rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "0.65rem", zIndex: 10, width: "155px" }}>
          {[
            { icon: "📸", label: "47.2K views", sub: "Instagram Reel", color: "#e1306c", anim: "floatUp 3.5s ease-in-out infinite" },
            { icon: "📊", label: "Grade A — 91/100", sub: "Hook Score", color: "#22c55e", anim: "floatDown 4s ease-in-out infinite" },
            { icon: "🎬", label: "Script Ready", sub: "30 sec reel", color: "#6d28d9", anim: "floatUp 4.5s ease-in-out infinite" },
            { icon: "📈", label: "Trending ↑", sub: "Google Trends", color: "#0891b2", anim: "floatDown 3.8s ease-in-out infinite" },
            { icon: "🌐", label: "30+ Languages", sub: "Hindi · Tamil · Telugu", color: "#f59e0b", anim: "floatUp 5s ease-in-out infinite" },
          ].map((item, i) => (
            <div key={i} className="sidebar-card" style={{ background: "#080808", border: `1px solid ${item.color}18`, borderRadius: "10px", padding: "0.6rem 0.75rem", animation: item.anim, opacity: 0.7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: "0.68rem", lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <div style={{ color: "#3f3f46", fontSize: "0.58rem", paddingLeft: "1.1rem" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar" style={{ position: "fixed", right: "1.25rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "0.65rem", zIndex: 10, width: "155px" }}>
          {[
            { icon: "⚡", label: "10 sec", sub: "Generation time", color: "#6d28d9", anim: "floatDown 3.5s ease-in-out infinite" },
            { icon: "▶️", label: "89.4K views", sub: "YouTube Short", color: "#ef4444", anim: "floatUp 4s ease-in-out infinite" },
            { icon: "📅", label: "30-Day Plan", sub: "Content Calendar", color: "#059669", anim: "floatDown 4.5s ease-in-out infinite" },
            { icon: "💎", label: "₹299/month", sub: "Starter Plan", color: "#22c55e", anim: "floatUp 3.8s ease-in-out infinite" },
            { icon: "🎯", label: "Platform-Specific", sub: "15+ Platforms", color: "#be185d", anim: "floatDown 5s ease-in-out infinite" },
          ].map((item, i) => (
            <div key={i} className="sidebar-card" style={{ background: "#080808", border: `1px solid ${item.color}18`, borderRadius: "10px", padding: "0.6rem 0.75rem", animation: item.anim, opacity: 0.7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: "0.68rem", lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <div style={{ color: "#3f3f46", fontSize: "0.58rem", paddingLeft: "1.1rem" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mobile-header" style={{ background: "#080808", borderBottom: "1px solid #1e1e1e", padding: "1.25rem 1.5rem 1rem", textAlign: "center", position: "relative" }}>

          

          {/* Mobile Top Bar */}
          <div style={{ display: "none" }} className="mobile-top-bar">
          </div>

          {/* Profile */}
          <div className="profile-trigger" style={{ position: "absolute", top: "0.75rem", left: "1rem" }} onClick={() => setShowProfile(!showProfile)}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 800, fontSize: "1rem", color: "#fff", boxShadow: "0 4px 15px rgba(109,40,217,0.25)" }}>
              {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            {showProfile && (
              <div style={{ position: "absolute", top: "48px", left: 0, background: "#0f0f0f", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "16px", padding: "1.25rem", minWidth: "260px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100, animation: "slideUp 0.2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.3rem", color: "#fff", flexShrink: 0 }}>
                    {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "User"}</div>
                    <div style={{ color: "#555", fontSize: "0.75rem" }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888", fontSize: "0.75rem" }}>Current Plan</span>
                  <span style={{ color: "#6d28d9", fontWeight: 700, fontSize: "0.82rem" }}>{plan} ✨</span>
                </div>
                {profile?.phone && <div style={{ color: "#555", fontSize: "0.75rem", marginBottom: "0.75rem" }}>📞 {profile.phone}</div>}
                <div style={{ color: "#333", fontSize: "0.72rem", marginBottom: "1rem" }}>📅 Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
                {profile?.plan === "free" && (
                  <button onClick={() => { setShowPaywall(true); setShowProfile(false); }} style={{ width: "100%", background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.75rem" }}>🚀 Upgrade Plan</button>
                )}

                <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "0.6rem", marginBottom: "0.6rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <button onClick={() => { setShowHistory(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#a1a1aa", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    🕘 History
                  </button>
                  <button onClick={() => { setShowPlans(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#a1a1aa", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    💎 Plans
                  </button>
                  <button onClick={() => { setShowFaq(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#a1a1aa", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    ❓ FAQ
                  </button>
                  <button onClick={() => { setShowReview(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#a1a1aa", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    ⭐ Review
                  </button>
                  <button onClick={() => { setShowContact(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#a1a1aa", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(109,40,217,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    💬 Support
                  </button>
                  {user?.email === "ravenderr01@gmail.com" && (
                    <button onClick={() => { setShowAdmin(true); setShowProfile(false); }} style={{ width: "100%", background: "none", border: "none", color: "#ef4444", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      🔧 Admin
                    </button>
                  )}
                </div>

                <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>Logout</button>
              </div>
            )}
          </div>

          {/* Title */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "0.2rem 0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.08em" }}>⚡ VCI — Viral Content Intelligence</span>
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(1.4rem,5vw,2.2rem)", fontWeight: 800, margin: "0 0 0.3rem", color: "#ffffff" }}>
            Viral Content Intelligence
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>Hook Score · 30-Day Calendar · Content Pack · Instant Generation</p>

          {/* Scrolling Ticker */}
          <div style={{ overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "0.25rem 0", marginBottom: "0.75rem", maxWidth: "500px", margin: "0 auto 0.75rem" }}>
            <style>{`.ticker{display:flex;animation:tickerScroll 20s linear infinite;white-space:nowrap} @keyframes tickerScroll{0%{transform:translateX(0)} 100%{transform:translateX(-50%)}}`}</style>
            <div className="ticker">
              {[...Array(2)].map((_, ri) => (
                <span key={ri}>
                  {["⚡ 500+ Creators", "🎣 Viral Hooks", "📅 30-Day Cal", "🌐 30+ Languages", "📦 Content Pack", "🖼️ Image AI", "🔥 20% OFF — First 100 Users"].map((item, i) => (
                    <span key={i} style={{ color: i === 6 ? "#8b5cf6" : "#3f3f46", fontSize: "0.68rem", fontWeight: i === 6 ? 800 : 600, padding: "0 1rem" }}>
                      {item} <span style={{ color: "#222" }}>·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* Global Language Selector */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}>🌐</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#6d28d9", padding: "0.3rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {LANGUAGE_GROUPS.find(g => g.languages.some(l => l.code === selectedLang))?.country} — {getLangLabel(selectedLang)} ▾
              </button>
              {showLangDropdown && (
                <div style={{ position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "0.75rem", zIndex: 200, width: "300px", boxShadow: "0 8px 40px rgba(0,0,0,0.7)", maxHeight: "400px", overflowY: "auto" }}>
                  <p style={{ color: "#333", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.5rem", letterSpacing: "0.06em" }}>SELECT LANGUAGE</p>
                  {LANGUAGE_GROUPS.map(group => (
                    <div key={group.code} style={{ marginBottom: "0.5rem" }}>
                      <p style={{ color: "#555", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{group.country}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {group.languages.map(lang => {
                          const isLocked = false; // All plans get all languages
                          return (
                            <button key={lang.code}
                              onClick={() => {
                                if (isLocked) { setShowPaywall(true); return; }
                                setSelectedLang(lang.code);
                                setShowLangDropdown(false);
                              }}
                              style={{ background: selectedLang === lang.code ? "rgba(124,58,237,0.12)" : "#111", border: `1px solid ${selectedLang === lang.code ? "#6d28d9" : "#1e1e1e"}`, color: selectedLang === lang.code ? "#6d28d9" : isLocked ? "#2a2a2a" : "#888", padding: "0.2rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>
                              {isLocked ? "🔒 " : ""}{lang.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Credits bar */}
          <div style={{ maxWidth: "260px", margin: "0 auto 1rem", background: "#0f0f0f", border: "1px solid #161616", borderRadius: "10px", padding: "0.6rem 0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "#444" }}>Plan: <strong style={{ color: "#8b5cf6" }}>{PLANS[plan as keyof typeof PLANS]?.label}</strong></span>
              <span style={{ color: remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                {remaining === 0 ? "⛔ Limit reached" : `${remaining} / ${limit} credits`}
              </span>
            </div>
            <div style={{ background: "#141414", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", background: remaining === 0 ? "#ef4444" : "linear-gradient(90deg,#6d28d9,#9d71f5)", width: `${usedPct}%`, transition: "width 0.5s" }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-scroll-row" style={{ maxWidth: "640px", margin: "0 auto", background: "#0a0a0a", borderRadius: "14px", padding: "0.35rem", border: "1px solid #1a1a1a", boxShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
            {tabs.map(t => (
              <TabBtn key={t.id} id={t.id} label={t.label} Icon={t.Icon} active={activeTab === t.id} onClick={setActiveTab}
                isPro={["calendar","pack","trends","image","scriptlab"].includes(t.id) && !["pro_creator","business","agency"].includes(plan)} />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>

          {/* TAB: GENERATE */}
          {activeTab === "generate" && (
            <div>
              {/* Niche */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", cursor: "pointer" }} onClick={() => setShowNiche(!showNiche)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}>NICHE</label>
                    <span style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.25)", color: "#8b5cf6", padding: "0.1rem 0.55rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>{niche}</span>
                    <span style={{ color: "#3f3f46", fontSize: "0.6rem" }}>auto-detected</span>
                  </div>
                  <span style={{ color: "#3f3f46", fontSize: "0.65rem", fontWeight: 600 }}>{showNiche ? "▲ Hide" : "▼ Change"}</span>
                </div>
                {showNiche && <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  {Object.keys(NICHE_EXAMPLES).map(n => {
                    const isLocked = false; // All niches open for all plans
                    return (
                      <button key={n} className="tbtn" onClick={() => isLocked ? setShowPaywall(true) : setNiche(n)}
                        style={{ background: niche === n ? "#6d28d912" : "#0d0d0d", border: `1px solid ${niche === n ? "#6d28d9" : "#1a1a1a"}`, color: niche === n ? "#8b5cf6" : isLocked ? "#2a2a2a" : "#52525b", padding: "0.4rem 1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, transition: "all 0.2s" }}>
                        {isLocked ? "🔒 " : ""}{n}
                      </button>
                    );
                  })}
                </div>}
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
                {[
                  { group: "📱 SOCIAL MEDIA", platforms: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"] },
                  { group: "📢 ADVERTISING", platforms: ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"] }
                ].map(({ group, platforms }) => (
                  <div key={group} style={{ marginBottom: "0.75rem" }}>
                    <p style={{ color: "#444", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.35rem" }}>{group}</p>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {platforms.map(p => {
                        const isLocked = false; // All platforms open for all plans
                        return (
                          <button key={p} className="tbtn" onClick={() => isLocked ? setShowPaywall(true) : setPlatform(p)}
                            style={{ background: platform === p ? "#6d28d912" : "#0d0d0d", border: `1px solid ${platform === p ? "#6d28d9" : "#1a1a1a"}`, color: platform === p ? "#8b5cf6" : isLocked ? "#2a2a2a" : "#52525b", padding: "0.4rem 1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, transition: "all 0.2s" }}>
                            {isLocked ? "🔒 " : ""}{p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Keyword */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>KEYWORD</label>
                <input value={keyword} onChange={e => {
                    const val = e.target.value;
                    setKeyword(val);
                    setError("");
                    if (val.length > 3) {
                      const detected = detectNiche(val, niche);
                      if (detected !== niche) setNiche(detected);
                    }
                  }} onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  placeholder={`e.g. ${NICHE_EXAMPLES[niche]?.[0] || "weight loss"}`}
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.8rem 1rem", color: "#fff", fontSize: "0.92rem", outline: "none", transition: "border 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#1a1a1a"} />

                {/* Smart keyword suggestions — crowd data + static fallback */}
                <SmartKeywordSuggestions niche={niche} currentKeyword={keyword} onSelect={setKeyword} />
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0 0 0.7rem" }}>{error}</p>}

              <TrendingNowCard niche={niche} platform={platform} />

              <button className="gbtn" onClick={handleGenerate} disabled={loading} style={{ width: "100%", padding: "0.95rem", borderRadius: "12px", background: loading ? "#111111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: loading ? "#404040" : "#ffffff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.3s", animation: "none", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {loading
                  ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> <span style={{ animation: "pulse 1s infinite" }}>Generating in {langLabel}...</span></>
                  : <><Zap size={17} fill="#fff" /> Generate Viral Content</>
                }
              </button>

              {results && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#6d28d908", border: "1px solid #6d28d920", borderRadius: "8px", fontSize: "0.75rem", color: "#6d28d9" }}>
                    🌐 Generated in <strong>{langLabel}</strong>
                    <span style={{ marginLeft: "auto", color: "#333", fontSize: "0.7rem" }}>💡 Try Hook Score tab</span>
                  </div>
                  {["Google Ads", "Meta Ads", "Native Ads", "YouTube Ads"].includes(platform) ? (
                    <>
                      <ResultCard title="Headlines" items={results.viralHooks} emoji="📢" color="#8b8cf8" charLimit={platform === "Google Ads" ? 30 : undefined} />
                      <ResultCard title="Ad Titles" items={results.titles} emoji="📝" color="#6d28d9" charLimit={platform === "Google Ads" ? 30 : undefined} />
                      <ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#22c55e" charLimit={platform === "Google Ads" ? 90 : undefined} />
                      <KeywordResearchCard keywords={results.keywordSuggestions} />
                    </>
                  ) : platform === "YouTube" ? (
                    <><ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" /><ResultCard title="Video Hooks" items={results.viralHooks} emoji="🎬" color="#6d28d9" /><ResultCard title="SEO Titles" items={results.titles} emoji="📝" color="#22c55e" /><ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#f59e0b" /></>
                  ) : platform === "Reddit" ? (
                    <><ResultCard title="Reddit Post Titles" items={results.viralHooks} emoji="🔴" color="#ff4500" /><ResultCard title="Subreddit Ideas" items={results.titles} emoji="📌" color="#ff6534" /><ResultCard title="Post Bodies" items={results.captions} emoji="💬" color="#6d28d9" /></>
                  ) : (
                    <><ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" /><ResultCard title="Viral Hooks" items={results.viralHooks} emoji="🎣" color="#6d28d9" /><ResultCard title="Title Ideas" items={results.titles} emoji="📝" color="#22c55e" /><ResultCard title="Captions" items={results.captions} emoji="💬" color="#f59e0b" /></>
                  )}
                  <div style={{ background: "#080808", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginTop: "0.5rem" }}>
                    <p style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", color: "#444", fontWeight: 600 }}>WANT MORE FROM THIS KEYWORD?</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {[["📊 Score my hooks", "score"], ["📅 Plan 30 days", "calendar"], ["📦 Full content pack", "pack"]].map(([label, tab]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "#111111", border: "1px solid #1f1f1f", color: "#555", padding: "0.35rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                          onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6d28d9"); (e.currentTarget.style.color = "#6d28d9"); }}
                          onMouseLeave={e => { (e.currentTarget.style.borderColor = "#1e1e1e"); (e.currentTarget.style.color = "#555"); }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CROSS-SELL: Similar niche suggestions */}
              {results && (() => {
                const crossItems = CROSS_SELL_NICHES[niche] || CROSS_SELL_NICHES["Fitness"];
                return (
                <div style={{ background: "linear-gradient(135deg,#0a0a14,#0d0d1a)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "16px", padding: "1.1rem", marginTop: "1rem", animation: "slideUp 0.5s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Sparkles size={14} color="#8b5cf6" />
                    <span style={{ color: "#8b5cf6", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>YOU MIGHT ALSO LIKE</span>
                  </div>
                  <p style={{ color: "#444", fontSize: "0.72rem", margin: "0 0 0.75rem" }}>
                    We've seen you're into <strong style={{ color: "#6d28d9" }}>{niche}</strong> — check these related niches that perform well together:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {crossItems.map((item: any, i: number) => (
                      <div key={i}
                        style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "0.75rem 1rem", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#6d28d940"; e.currentTarget.style.background = "#0d0d0d"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#080808"; }}
                        onClick={() => { setNiche(item.niche); setKeyword(item.keywords[0]); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{item.niche}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#6d28d9", fontSize: "0.68rem", fontWeight: 700 }}>
                            <span>Explore</span>
                            <ArrowRight size={11} />
                          </div>
                        </div>
                        <p style={{ color: "#444", fontSize: "0.68rem", margin: "0 0 0.4rem", lineHeight: 1.4 }}>{item.reason}</p>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {item.keywords.map((kw: string) => (
                            <span key={kw}
                              onClick={e => { e.stopPropagation(); setNiche(item.niche); setKeyword(kw); }}
                              style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.15)", color: "#6d28d9", padding: "0.1rem 0.45rem", borderRadius: "20px", fontSize: "0.62rem", fontWeight: 600, cursor: "pointer" }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })()}

              {plan === "free" && (
                <div style={{ background: "#6d28d908", border: "1px solid #6d28d918", borderRadius: "14px", padding: "1.1rem", marginTop: "1rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, marginBottom: "0.4rem", fontSize: "0.95rem" }}>🔥 Unlock Hook Score, Calendar & Content Packs</div>
                  <div style={{ color: "#444", fontSize: "0.77rem", marginBottom: "0.85rem" }}>Starter ₹299 · Pro Creator ₹999 · Business ₹1,999 · Agency ₹4,999</div>
                  <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", fontWeight: 800, padding: "0.55rem 1.5rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.82rem" }}>🚀 Upgrade Now</button>
                </div>
              )}
            </div>
          )}

          {/* TAB: HOOK SCORE */}
          {activeTab === "score" && (
            <HookScoreAnalyzer plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} onSaveHistory={saveToHistory} />
          )}

          {/* TAB: CALENDAR */}
          {activeTab === "calendar" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Creator / Business Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>30-Day Content Calendar uses 5 credits per generation.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <ContentCalendar plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} langStrict={langStrict} creditCost={5} onSaveHistory={saveToHistory} />
            )
          )}

          {/* TAB: IMAGE AI */}
          {activeTab === "image" && (
            <ImageContent plan={plan} onUpgrade={() => setShowPaywall(true)} credits={remaining} onCreditUsed={() => incrementUsage("image")} langLabel={langStrict} />
          )}

          {/* TAB: TRENDS */}
          {activeTab === "trends" && (
            (plan === "free" || plan === "starter") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Growth Plan Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>AI Trend Intelligence is available from Growth plan onwards.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <Trends niche={niche} keyword={keyword} langLabel={langLabel} />
            )
          )}

          {/* TAB: SCRIPT LAB */}
          {activeTab === "scriptlab" && (
            plan === "free" ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Starter Plan Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Script Lab unlocks from Starter ₹299 onwards.</p>
                <p style={{ color: "#444", fontSize: "0.78rem", marginBottom: "1.5rem" }}>Generate viral reel scripts + Before/After improvement</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade to Starter</button>
              </div>
            ) : (
              <ScriptLab plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} onSaveHistory={saveToHistory} />
            )
          )}

          {/* TAB: CAPTION & HASHTAGS */}
          {activeTab === "caption" && (
            <CaptionHashtags plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} langStrict={langStrict} onCreditUsed={() => incrementUsage("caption")} onSaveHistory={saveToHistory} />
          )}

          {/* TAB: NICHE INTELLIGENCE — FREE for everyone! */}
          {activeTab === "intelligence" && (
            <NicheIntelligence niche={niche} keyword={keyword} langLabel={langLabel} />
          )}

          {/* TAB: PACK */}
          {activeTab === "pack" && (
            (plan === "free" || plan === "starter" || plan === "growth") ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", color: "#fff", marginBottom: "0.5rem" }}>Pro Creator / Business Feature</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Content Pack uses 3 credits per generation.</p>
                <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Upgrade Now</button>
              </div>
            ) : (
              <ContentPack plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} platform={platform} langStrict={langStrict} creditCost={3} onSaveHistory={saveToHistory} />
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "1.5rem 1rem", borderTop: "1px solid rgba(139,92,246,0.1)", marginTop: "2rem" }}>
        <p style={{ color: "#2a2a2a", fontSize: "0.72rem", margin: 0 }}>
          Designed & Developed by <span style={{ color: "#6d28d9", fontWeight: 700 }}>Global Web Info Vision</span> © {new Date().getFullYear()} All Rights Reserved.
          {" "}<span style={{ margin: "0 0.5rem", color: "#1a1a1a" }}>|</span>
          <button onClick={() => setLegalPage("privacy")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Privacy Policy</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("terms")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Terms & Conditions</button>
          <span style={{ margin: "0 0.3rem", color: "#1a1a1a" }}>·</span>
          <button onClick={() => setLegalPage("refund")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.72rem" }}>Refund Policy</button>
        </p>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#080808", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "20px", padding: "2rem", maxWidth: "440px", width: "100%", animation: "slideUp 0.3s ease" }}>
            {!reviewSubmitted ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                  <h3 style={{ color: "#fff", margin: "0 0 0.3rem" }}>Share Your Experience</h3>
                  <p style={{ color: "#555", fontSize: "0.82rem", margin: 0 }}>Your review helps other creators discover VCI!</p>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewStars(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.8rem", color: s <= reviewStars ? "#f59e0b" : "#2a2a2a" }}>★</button>
                  ))}
                </div>
                <input value={reviewRole} onChange={e => setReviewRole(e.target.value)} placeholder="Your role (e.g. Instagram Creator)"
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", outline: "none", marginBottom: "0.75rem" }} />
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience with VCI..." rows={4}
                  style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.85rem", outline: "none", resize: "none", marginBottom: "1rem" }} />
                <button onClick={handleReviewSubmit} disabled={reviewLoading || !reviewText.trim()} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: !reviewText.trim() ? "rgba(251,191,36,0.2)" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: !reviewText.trim() ? "#555" : "#000", fontWeight: 800, cursor: !reviewText.trim() ? "not-allowed" : "pointer", marginBottom: "0.5rem" }}>
                  {reviewLoading ? "⚡ Submitting..." : "⭐ Submit Review"}
                </button>
                <button onClick={() => setShowReview(false)} style={{ width: "100%", background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                <h3 style={{ color: "#fff" }}>Thank You!</h3>
                <p style={{ color: "#555", fontSize: "0.85rem" }}>Your review will be published after approval.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSelectPlan={handleSelectPlan} />}
      {payingPlan && <PaymentModal plan={payingPlan} onClose={() => setPayingPlan(null)} onPaid={handlePaid} />}

      <VCIAssistant niche={niche} platform={platform} keyword={keyword} plan={plan} />

      {/* FAQ Modal */}
      {showTutorial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#080808", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "20px", padding: "1.75rem", maxWidth: "600px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={18} color="#f59e0b" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>How VCI Works</h2>
                  <p style={{ margin: "0.1rem 0 0", color: "#555", fontSize: "0.76rem" }}>Tap any feature to see exact steps</p>
                </div>
              </div>
              <button onClick={() => setShowTutorial(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1f1f1f", color: "#666", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>

            <p style={{ margin: "0.75rem 0 1.1rem", color: "#71717a", fontSize: "0.78rem", lineHeight: 1.6 }}>
              VCI has 9 tools that cover every stage of making content — from finding an idea to writing the script. Here's exactly what each one does and how to use it.
            </p>

            <TutorialFeature
              icon={Zap} color="#6d28d9" name="Generate" credit="1 credit"
              tagline="Turn a keyword into ready-to-post hooks, titles, and captions."
              steps={[
                { label: "Type a keyword", detail: "Enter any topic, like \"weight loss\" or \"crypto tips\". The niche is detected automatically." },
                { label: "Pick a platform", detail: "Choose Instagram, YouTube, Google Ads, or any of the 15+ supported platforms — the output format adapts to match." },
                { label: "Tap Generate", detail: "Get trending topics, viral hooks, titles, and captions in one go, ready to copy." },
              ]}
            />

            <TutorialFeature
              icon={BarChart2} color="#06b6d4" name="Hook Score" credit="1 credit"
              tagline="Paste any content and get an honest grade with line-by-line fixes."
              steps={[
                { label: "Paste your content", detail: "Drop in a hook, caption, or script you've already written." },
                { label: "Choose the platform", detail: "Scoring criteria adjusts for Instagram, YouTube, LinkedIn, and more." },
                { label: "Read the breakdown", detail: "Get a grade (A–F), see exactly which lines are weak, and get 3 rewritten versions." },
              ]}
            />

            <TutorialFeature
              icon={FileText} color="#22c55e" name="Captions" credit="2 credits"
              tagline="Get 5 ready-to-post captions and 20 matching hashtags."
              steps={[
                { label: "Select a platform", detail: "Hashtag style and caption tone change based on where you're posting." },
                { label: "Enter your keyword", detail: "The same keyword from Generate carries over automatically." },
                { label: "Copy and post", detail: "Tap any caption or hashtag to copy it instantly — no retyping." },
              ]}
            />

            <TutorialFeature
              icon={Search} color="#8b5cf6" name="Intelligence" credit="Free"
              tagline="See real YouTube and Google data before you commit to a topic."
              steps={[
                { label: "Tap Analyze", detail: "VCI pulls live trending YouTube videos and rising Google searches for your niche." },
                { label: "Check the competition score", detail: "See whether a topic is oversaturated or has room to grow." },
                { label: "Read the opportunity tip", detail: "Get one clear, actionable angle based on what's actually happening right now." },
              ]}
            />

            <TutorialFeature
              icon={CalendarDays} color="#06b6d4" name="Calendar" credit="5 credits"
              tagline="Generate a full 30-day content plan in a single tap."
              steps={[
                { label: "Enter your topic and platform", detail: "One keyword is enough — VCI plans variety across the month." },
                { label: "Tap Generate Calendar", detail: "Get 30 days of hooks, organized by week, each tagged with a content type." },
                { label: "Tap any day to copy", detail: "Grab that day's hook instantly when you're ready to post." },
              ]}
            />

            <TutorialFeature
              icon={Package} color="#f59e0b" name="Pack" credit="3 credits"
              tagline="One click for a complete bundle — hooks, titles, captions, scripts, hashtags."
              steps={[
                { label: "Choose a pack type", detail: "Instagram & TikTok, YouTube, or Google & Meta Ads — each tuned to that platform's needs." },
                { label: "Enter your keyword", detail: "VCI builds an entire content bundle around it." },
                { label: "Expand any section", detail: "Open hooks, titles, captions, or hashtags and copy what you need." },
              ]}
            />

            <TutorialFeature
              icon={TrendingUp} color="#22c55e" name="Trends" credit="Free"
              tagline="A live feed of what's trending in your niche right now."
              steps={[
                { label: "Open the Trends tab", detail: "It loads automatically based on your selected niche." },
                { label: "Scan for ideas", detail: "Use real trending topics as a starting point before you generate content." },
              ]}
            />

            <TutorialFeature
              icon={Image} color="#14b8a6" name="Image AI" credit="2 credits"
              tagline="Upload a photo and get hooks and captions written around it."
              steps={[
                { label: "Upload an image", detail: "A product photo, a workout shot, anything you plan to post." },
                { label: "Select your platform", detail: "Output adapts to Instagram, YouTube, or your chosen platform." },
                { label: "Get content based on what's in the photo", detail: "VCI reads the image and writes hooks and captions that actually match it." },
              ]}
            />

            <TutorialFeature
              icon={Film} color="#f97316" name="Script Lab" credit="6 credits"
              tagline="Write a full reel script, or grade and improve one you already have."
              steps={[
                { label: "Choose Generate or Improve", detail: "Write a brand-new script, or paste an existing one to get it scored and rewritten." },
                { label: "Set duration and style", detail: "15 to 90 seconds, in styles like Story, Tutorial, or POV." },
                { label: "Get the full breakdown", detail: "A word-for-word script with timing cues, a matching thumbnail, and an audio suggestion." },
              ]}
            />

            <div style={{ marginTop: "1.1rem", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
              <p style={{ margin: 0, fontSize: "0.76rem", color: "#a1a1aa", lineHeight: 1.6 }}>
                <strong style={{ color: "#f59e0b" }}>Tip:</strong> Start with Generate to find your angle, check it with Intelligence, then move to Calendar or Script Lab once you know what to post.
              </p>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <HistoryPanel userId={user?.id} onClose={() => setShowHistory(false)} onRestore={restoreFromHistory} />
      )}

      {showFaq && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#080808", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "20px", padding: "1.75rem", maxWidth: "560px", width: "100%", color: "#fff", animation: "slideUp 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>❓ Frequently Asked Questions</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#555", fontSize: "0.78rem" }}>Everything you need to know about VCI</p>
              </div>
              <button onClick={() => setShowFaq(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1f1f1f", color: "#666", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {[
              { q: "What is VCI?", a: "VCI (Viral Content Intelligence) is an AI-powered tool that generates viral content for creators and businesses — hooks, captions, hashtags, scripts, calendars, all in one place!" },
              { q: "What do I get in the free trial?", a: "You get 5 free credits. You can use Generate, Hook Score, and Caption & Hashtags features. All niches, platforms, and 30+ languages are open in the trial!" },
              { q: "What does 1 credit equal?", a: "Generate = 1 credit, Hook Score = 1 credit, Caption & Hashtags = 2 credits, Script Lab = 2 credits, Content Pack = 3 credits, 30-Day Calendar = 5 credits." },
              { q: "How soon will my plan be activated after payment?", a: "Send your payment screenshot on WhatsApp and your plan will be manually activated within 2 hours. UPI: 9315133390@ptyes" },
              { q: "Which plan should I choose?", a: "Just starting out? Starter ₹299 (100 credits + Script Lab). Serious creator? Pro Creator ₹999 (400 credits + Calendar + Pack + Trends). Running ads/business? Growth ₹799 or Business ₹1,999." },
              { q: "Do credits renew every month?", a: "Yes! Credits renew every month according to your plan. Unused credits do not carry forward to the next month." },
              { q: "Is there a refund policy?", a: "Yes, you can request a refund within 7 days if the tool doesn't work as expected. Contact support on WhatsApp: +91 9315133390" },
              { q: "How do I use VCI on mobile?", a: "Open getvci.com in your mobile browser. On Chrome, tap 'Add to Home Screen' to install it like an app. On iPhone, use Safari and tap 'Add to Home Screen'!" },
              { q: "Is Hindi and regional language content supported?", a: "Absolutely! 30+ languages are supported — Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam and many more." },
              { q: "What is Script Lab?", a: "Script Lab lets you generate complete word-for-word reel scripts for 15/30/60/90 seconds. You can also improve existing scripts with a Before/After comparison. Available from the Starter plan onwards." },
            ].map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
            <div style={{ marginTop: "1.25rem", background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>Have more questions? 🙋</p>
              <a href="https://wa.me/919315133390?text=Hi! VCI ke baare mein kuch poochna tha" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.82rem" }}>
                💬 WhatsApp karo
              </a>
            </div>
          </div>
        </div>
      )}

      <a href="https://wa.me/919315133390?text=Hi!%20I%20want%20to%20know%20more%20about%20Viral%20Content%20Tool" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999, background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", borderRadius: "50px", padding: "0.75rem 1.25rem", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        💬 WhatsApp
      </a>

      {showSuccess && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 800, zIndex: 9999, animation: "slideUp 0.3s ease", whiteSpace: "nowrap" }}>
          ✅ Payment received! We'll activate your plan within 2 hours.
        </div>
      )}

    </>
  );
}