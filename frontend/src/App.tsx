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

const YOUR_UPI_ID      = "9315133390@ptyes";
const YOUR_PAYPAL_ME   = "https://paypal.me/yourname";
const SUPPORT_PHONE    = "+91 9315133390";
const RAZORPAY_KEY_ID  = "rzp_live_OHQHt6nXnBolPG";

// ── Razorpay Checkout loader ─────────────────────────────────────────────────
function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const PLANS = {
  free:             { label: "Free",             limit: 25,    priceINR: 0,       priceUSD: 0,   wasINR: 0,    wasUSD: 0   },
  creator_starter:  { label: "Creator Starter",  limit: 100,   priceINR: 499,     priceUSD: 9,   wasINR: 699,  wasUSD: 12, badge: "🔥 Popular",    segment: "creator"  },
  creator_pro:      { label: "Creator Pro",      limit: 350,   priceINR: 1299,    priceUSD: 29,  wasINR: 1799, wasUSD: 35, badge: "⚡ Best Value",  segment: "creator"  },
  advertiser:       { label: "Advertiser",       limit: 700,   priceINR: 2499,    priceUSD: 49,  wasINR: 3499, wasUSD: 59, badge: "📢 For Ads",     segment: "business" },
  agency:           { label: "Agency",           limit: 2000,  priceINR: 8999.99, priceUSD: 119, wasINR: 9999, wasUSD: 149, badge: "👑 All Access", segment: "agency"   },
};

// Safe call into the globally-exposed copy-signal tracker (no-op if not yet mounted)
const fireCopySignal = (feature: string, contentType: string, text: string, extra?: { niche?: string; platform?: string }) => {
  try { (window as any).__vciTrackCopy?.(feature, contentType, text, extra); } catch {}
};

const detectNiche = (keyword: string, currentNiche: string): string => {
  const kw = keyword.toLowerCase();
  if (kw.match(/weight|gym|fitness|workout|diet|protein|fat|muscle|exercise|yoga|zumba|cardio|abs|bicep|squat|deadlift|bench press|gains|cut|bulk|shred/)) return "Fitness";
  if (kw.match(/money|income|invest|business|startup|freelanc|passive|earn|profit|revenue|entrepreneur|side hustle|self employed|b2b|b2c|sales|client|agency|dropship/)) return "Business";
  if (kw.match(/\bai\b|tech|code|app|software|chatgpt|programming|developer|crypto|saas|python|javascript|web dev|machine learning|data science|automation|no code/)) return "Tech";
  if (kw.match(/food|recipe|cook|eat|meal|biryani|street food|restaurant|bake|chef|snack|breakfast|lunch|dinner|thali|curry|dal|roti|dessert|sweet|chaat/)) return "Food";
  if (kw.match(/travel|trip|tour|vacation|hotel|flight|destination|backpack|explore|road trip|himalaya|goa|manali|kashmir|rajasthan|kerala|hills|beach|visa/)) return "Travel";
  if (kw.match(/fashion|style|outfit|clothes|wear|dress|skincare|beauty|makeup|glow|ootd|haul|thrift|ethnic|saree|kurta|western|accessori/)) return "Fashion & Style";
  if (kw.match(/cricket|football|sport|match|player|team|ipl|fifa|basketball|badminton|kabaddi|hockey|virat|rohit|dhoni|messi|ronaldo|nba|isl/)) return "Sports";
  if (kw.match(/motivation|mindset|success|hustle|inspire|goal|discipline|growth|grind|winner|champion|believe|attitude|positive|consistency/)) return "Motivational";
  if (kw.match(/meditation|spiritual|manifest|chakra|astrology|mindful|universe|zodiac|tarot|numerology|awakening|consciousness|divine|karma/)) return "Spirituality";
  if (kw.match(/mental|anxiety|stress|depression|therapy|self care|emotion|healing|overthink|burnout|loneliness|confidence|self love|self worth/)) return "Mental Health";
  if (kw.match(/real estate|property|house|rent|flat|plot|home buying|apartment|builder|construction|interior|vastu|bhk|society|gated community/)) return "Real Estate";
  if (kw.match(/study|learn|education|course|exam|college|school|skill|tutorial|upsc|jee|neet|gate|mba|ielts|online learning|degree|scholarship/)) return "Education";
  if (kw.match(/facebook ads|google ads|marketing|campaign|funnel|conversion|copywriting|meta ads|digital marketing|seo|email marketing|influencer/)) return "Ads & Marketing";
  if (kw.match(/gaming|pubg|bgmi|battleground|free fire|freefire|esport|minecraft|stream|gamer|valorant|cod|call of duty|fortnite|roblox|gta|league|mobile legend|clash|gameplay|squad|rank push|clutch|headshot|pochinki|noobs/)) return "Gaming";
  if (kw.match(/vlog|day in my life|daily routine|morning routine|night routine|lifestyle vlog|a day|24 hours|week in my life/)) return "Daily Vlog";
  if (kw.match(/comedy|funny|meme|joke|prank|skit|humor|roast|troll|viral video|react|cringe|relatable/)) return "Comedy & Entertainment";
  if (kw.match(/budget|save money|tax|mutual fund|sip|loan|personal finance|stock market|demat|zerodha|groww|fd|ppf|insurance|emi|credit card/)) return "Personal Finance";
  if (kw.match(/lifestyle|minimalism|productivity|habit|self improvement|declutter|morning|routine|journal|notion|planner|life hack|work life/)) return "Lifestyle";
  if (kw.match(/health|wellness|immune|vitamin|nutrition|sleep|detox|ayurveda|gut|digestion|diabetes|thyroid|bp|sugar|natural remedy|home remedy/)) return "Health & Wellness";
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
  { country: "🇮🇳 India", code: "IN", category: "indian", languages: [
    { code: "hi", label: "Hindi" }, { code: "bn", label: "Bengali" },
    { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
    { code: "mr", label: "Marathi" }, { code: "gu", label: "Gujarati" },
    { code: "kn", label: "Kannada" }, { code: "ml", label: "Malayalam" },
    { code: "pa", label: "Punjabi" }, { code: "or", label: "Odia" },
    { code: "as", label: "Assamese" }, { code: "ur", label: "Urdu" },
  ]},
  { country: "🇬🇧 English", code: "EN", category: "global", languages: [{ code: "en", label: "English" }]},
  { country: "🇺🇸 USA", code: "US", category: "global", languages: [
    { code: "en-us", label: "American English" }, { code: "es-us", label: "Spanish (US)" },
  ]},
  { country: "🇩🇪 Germany", code: "DE", category: "global", languages: [{ code: "de", label: "German" }]},
  { country: "🇫🇷 France", code: "FR", category: "global", languages: [{ code: "fr", label: "French" }]},
  { country: "🇪🇸 Spain", code: "ES", category: "global", languages: [{ code: "es", label: "Spanish" }]},
  { country: "🇮🇹 Italy", code: "IT", category: "global", languages: [{ code: "it", label: "Italian" }]},
  { country: "🇷🇺 Russia", code: "RU", category: "global", languages: [{ code: "ru", label: "Russian" }]},
  { country: "🇨🇳 China", code: "CN", category: "global", languages: [
    { code: "zh", label: "Chinese (Mandarin)" }, { code: "zh-yue", label: "Cantonese" },
  ]},
  { country: "🇯🇵 Japan", code: "JP", category: "global", languages: [{ code: "ja", label: "Japanese" }]},
  { country: "🇰🇷 Korea", code: "KR", category: "global", languages: [{ code: "ko", label: "Korean" }]},
  { country: "🇸🇦 Arabic", code: "AR", category: "global", languages: [
    { code: "ar", label: "Arabic" }, { code: "ar-eg", label: "Egyptian Arabic" },
  ]},
  { country: "🇹🇭 Thailand", code: "TH", category: "global", languages: [{ code: "th", label: "Thai" }]},
  { country: "🇧🇷 Brazil", code: "BR", category: "global", languages: [{ code: "pt", label: "Portuguese" }]},
  { country: "🇮🇩 Indonesia", code: "ID", category: "global", languages: [{ code: "id", label: "Indonesian" }]},
  { country: "🇹🇷 Turkey", code: "TR", category: "global", languages: [{ code: "tr", label: "Turkish" }]},
];

// Languages where Azure TTS voiceover is available (used to show a hint in the dropdown)
const VOICE_SUPPORTED_LANGS = new Set(["hi", "bn", "ta", "te", "mr", "gu", "en", "en-us"]);

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
// ── AD ROI CALCULATOR (Advertiser Exclusive) ────────────────────────────────
function AdROICalculator({ plan, onUpgrade }: any) {
  const isUnlocked = ["advertiser","agency"].includes(plan);
  const [budget, setBudget]       = useState(10000);
  const [cpc, setCpc]             = useState(12);
  const [cvRate, setCvRate]       = useState(3);
  const [orderVal, setOrderVal]   = useState(800);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<any>(null);

  if (!isUnlocked) return (
    <div style={{ background:"#080810", border:"1px solid #1a1a2e", borderRadius:"16px", padding:"2rem", textAlign:"center" }}>
      <div style={{ fontSize:"2rem", marginBottom:".75rem" }}>📊</div>
      <p style={{ fontWeight:800, fontSize:".95rem", marginBottom:".4rem" }}>Ad ROI Calculator</p>
      <p style={{ color:"#52525b", fontSize:".8rem", marginBottom:"1.25rem" }}>Enter budget → get estimated clicks, leads, revenue and ROAS. Advertiser plan only.</p>
      <button onClick={onUpgrade} style={{ background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".7rem 1.5rem", borderRadius:"10px", fontWeight:800, cursor:"pointer" }}>Unlock — Advertiser Plan ₹2,499</button>
    </div>
  );

  const clicks   = Math.round(budget / cpc);
  const leads    = Math.round(clicks * cvRate / 100);
  const revenue  = leads * orderVal;
  const roas     = revenue / budget;
  const cpl      = leads > 0 ? Math.round(budget / leads) : 0;
  const profit   = revenue - budget;
  const roasColor = roas >= 3 ? "#22c55e" : roas >= 1.5 ? "#f59e0b" : "#ef4444";
  const verdict  = roas >= 3 ? "✅ Profitable — Scale this campaign" : roas >= 1.5 ? "⚠️ Breakeven zone — Optimise first" : "❌ Loss-making — Reduce CPC or improve CVR";

  const generate = async () => {
    setLoading(true);
    const prompt = `You are a paid ads expert. Give a realistic analysis for:
Budget: ₹${budget}/month | Avg CPC: ₹${cpc} | Conversion rate: ${cvRate}% | Avg order value: ₹${orderVal}
Estimated: ${clicks} clicks, ${leads} conversions, ₹${revenue} revenue, ROAS: ${roas.toFixed(2)}x

Return JSON only:
{
  "verdict": "one line verdict",
  "top_optimisation": "single most impactful thing to improve ROAS",
  "cpc_benchmark": "typical CPC range for this type of campaign in India",
  "scale_trigger": "at what ROAS/metrics should they scale budget",
  "warning": "one risk to watch"
}`;
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:600 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g,"").trim();
      setResult(JSON.parse(clean));
    } catch { setResult(null); }
    setLoading(false);
  };

  const row = (label: string, value: string, color?: string) => (
    <div style={{ display:"flex", justifyContent:"space-between", padding:".55rem 0", borderBottom:"1px solid #0d0d18" }}>
      <span style={{ fontSize:".78rem", color:"#94a3b8" }}>{label}</span>
      <span style={{ fontSize:".82rem", fontWeight:800, color: color || "#fff" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background:"#080810", border:"1px solid rgba(109,40,217,.25)", borderRadius:"16px", padding:"1.4rem" }}>
      <p style={{ fontSize:".68rem", fontWeight:800, letterSpacing:".1em", color:"#6d28d9", marginBottom:".85rem" }}>📊 AD ROI CALCULATOR</p>

      {/* Inputs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".75rem", marginBottom:"1rem" }}>
        {[
          { label:"Monthly Budget (₹)", val:budget, set:setBudget, min:1000, max:500000, step:1000 },
          { label:"Avg CPC — Cost Per Click (₹)", val:cpc, set:setCpc, min:1, max:500, step:1 },
          { label:"Conversion Rate (%)", val:cvRate, set:setCvRate, min:0.1, max:30, step:0.1 },
          { label:"Avg Order Value (₹)", val:orderVal, set:setOrderVal, min:100, max:50000, step:100 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label}>
            <label style={{ fontSize:".6rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".25rem" }}>{label}</label>
            <input type="number" value={val} min={min} max={max} step={step}
              onChange={e => set(Number(e.target.value))}
              style={{ width:"100%", background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"8px", padding:".5rem .7rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit" }} />
          </div>
        ))}
      </div>

      {/* Live results */}
      <div style={{ background:"#050508", border:"1px solid #0d0d18", borderRadius:"12px", padding:"1rem", marginBottom:"1rem" }}>
        {row("Estimated Clicks", clicks.toLocaleString("en-IN"))}
        {row("Estimated Leads / Conversions", leads.toLocaleString("en-IN"))}
        {row("Cost Per Lead (CPL)", `₹${cpl.toLocaleString("en-IN")}`)}
        {row("Estimated Revenue", `₹${revenue.toLocaleString("en-IN")}`)}
        {row("Estimated Profit", `₹${profit.toLocaleString("en-IN")}`, profit >= 0 ? "#22c55e" : "#ef4444")}
        <div style={{ display:"flex", justifyContent:"space-between", padding:".55rem 0" }}>
          <span style={{ fontSize:".78rem", color:"#94a3b8" }}>ROAS (Return on Ad Spend)</span>
          <span style={{ fontSize:"1.05rem", fontWeight:900, color:roasColor }}>{roas.toFixed(2)}×</span>
        </div>
      </div>

      {/* Verdict bar */}
      <div style={{ background: roas>=3?"rgba(34,197,94,.08)":roas>=1.5?"rgba(245,158,11,.08)":"rgba(239,68,68,.08)", border:`1px solid ${roas>=3?"rgba(34,197,94,.25)":roas>=1.5?"rgba(245,158,11,.25)":"rgba(239,68,68,.25)"}`, borderRadius:"10px", padding:".7rem 1rem", marginBottom:"1rem" }}>
        <p style={{ fontSize:".78rem", fontWeight:700, color:roasColor, margin:0 }}>{verdict}</p>
      </div>

      <button onClick={generate} disabled={loading}
        style={{ width:"100%", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".8rem 1rem", borderRadius:"10px", fontWeight:800, fontSize:".85rem", cursor:"pointer", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem" }}>
        {loading
          ? <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} /> Analysing your numbers...</>
          : <><span>🤖</span><span>Get AI Optimisation Tips</span><span style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"6px", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem" }}>Free</span></>
        }
      </button>

      {result && (
        <div style={{ background:"#050508", border:"1px solid rgba(109,40,217,.15)", borderRadius:"12px", padding:"1rem" }}>
          {[
            { label:"📌 Top Optimisation", value:result.top_optimisation },
            { label:"💰 CPC Benchmark", value:result.cpc_benchmark },
            { label:"📈 Scale Trigger", value:result.scale_trigger },
            { label:"⚠️ Risk to Watch", value:result.warning },
          ].map(({ label, value }) => (
            <div key={label} style={{ marginBottom:".65rem" }}>
              <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .2rem", letterSpacing:".06em" }}>{label}</p>
              <p style={{ fontSize:".78rem", color:"#cbd5e1", margin:0, lineHeight:1.6 }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── A/B AD COPY GENERATOR (Advertiser Exclusive) ─────────────────────────────
function ABAdCopyGenerator({ plan, onUpgrade, onCreditUsed, onSaveHistory }: any) {
  const isUnlocked = ["advertiser","agency"].includes(plan);
  const [product, setProduct]   = useState("");
  const [platform, setPlatform] = useState("Meta Ads");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [copied, setCopied]     = useState("");
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  if (!isUnlocked) return (
    <div style={{ background:"#080810", border:"1px solid #1a1a2e", borderRadius:"16px", padding:"2rem", textAlign:"center" }}>
      <div style={{ fontSize:"2rem", marginBottom:".75rem" }}>🧪</div>
      <p style={{ fontWeight:800, fontSize:".95rem", marginBottom:".4rem" }}>A/B Ad Copy Generator</p>
      <p style={{ color:"#52525b", fontSize:".8rem", marginBottom:"1.25rem" }}>Generate 2 completely different ad angles for the same product. Test which psychology wins.</p>
      <button onClick={onUpgrade} style={{ background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".7rem 1.5rem", borderRadius:"10px", fontWeight:800, cursor:"pointer" }}>Unlock — Advertiser Plan ₹2,499</button>
    </div>
  );

  const generate = async () => {
    if (!product.trim()) return;
    setLoading(true); setResult(null);
    const isGoogle = platform === "Google Ads";
    const prompt = `You are a senior performance marketing copywriter specializing in Indian market paid advertising. Generate 2 completely different A/B test ad copies for ${platform}.

Product/Service: ${product}

PLATFORM RULES + COMPLIANCE:
${isGoogle ? `Google Search Ads — Policy Compliant:
CHARACTER LIMITS (STRICT — count every character including spaces):
- Headline 1: max 30 characters
- Headline 2: max 30 characters
- Headline 3: max 30 characters
- Description 1: max 90 characters
- Description 2: max 90 characters

GOOGLE ADS POLICY COMPLIANCE (mandatory):
- No superlatives unless you can prove them: NO "best", "cheapest", "#1" unless verified
- No clickbait or misleading claims
- No excessive punctuation (max 1 exclamation per ad, NOT in headlines)
- No ALL CAPS words (except established abbreviations like UPI, EMI, GST)
- Prices must be accurate — if you mention ₹999, that must be real price
- No "Click here", "Click now" — use action verbs instead
- Landing page must match the ad promise exactly
- No competitor brand names unless you have rights` 
: `Meta Ads (Facebook/Instagram) — Policy Compliant:
CHARACTER LIMITS:
- Primary Text: 125 chars for preview (keep key message in first 125)
- Headline: max 40 characters
- Description: max 30 characters

META ADS POLICY COMPLIANCE (mandatory):
- No "before/after" images implying dramatic physical changes
- No discriminatory targeting language in copy
- Health/finance claims must be accurate and not misleading  
- No guarantee language: avoid "guaranteed results", "100% success"
- No urgency manipulation: "You MUST act now or LOSE everything" type = rejected
- Personal attributes: do NOT imply you know user's condition ("Are you diabetic?")
- Financial products: must include required disclaimers if applicable
- No sensationalist or shocking content
- Alcohol/tobacco/gambling: special approval needed — avoid if not eligible
- Prices must be real and landing page must reflect same price`}

The two variants MUST use completely DIFFERENT psychological angles:
Variant A: Choose from — Fear of Loss, FOMO, Urgency, Problem Agitation
Variant B: Choose from — Aspiration, Social Proof, Curiosity, Value/ROI

Return ONLY valid JSON:
{
  "variant_a": {
    "angle": "specific psychological angle name",
    ${isGoogle ? `"headline_1": "max 30 chars",
    "headline_2": "max 30 chars", 
    "headline_3": "max 30 chars",
    "description_1": "max 90 chars",
    "description_2": "max 90 chars",` : `"headline": "max 40 chars",
    "primary_text": "125 chars for preview, hook in first line",
    "description": "max 30 chars",`}
    "cta": "CTA button text",
    "why_it_works": "1 sentence — specific reason this angle works for this product"
  },
  "variant_b": {
    "angle": "different psychological angle",
    ${isGoogle ? `"headline_1": "max 30 chars",
    "headline_2": "max 30 chars",
    "headline_3": "max 30 chars", 
    "description_1": "max 90 chars",
    "description_2": "max 90 chars",` : `"headline": "max 40 chars",
    "primary_text": "completely different angle, hook in first line",
    "description": "max 30 chars",`}
    "cta": "different CTA",
    "why_it_works": "1 sentence — specific reason"
  },
  "test_recommendation": "Specific metric to measure and why (e.g. Test for 7 days, minimum 1000 impressions each. Declare winner on CTR if brand awareness goal, CPL if lead gen goal)",
  "budget_split": "How to split budget between variants (e.g. 50/50 for week 1, then 70/30 to winner)"
}`;
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:800 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
      onCreditUsed?.();
    } catch { }
    setLoading(false);
  };

  const VariantCard = ({ variant, label, color }: any) => {
    const isGoogle = platform === "Google Ads";
    const fields = isGoogle
      ? [
          { label:"Headline 1", value:variant.headline_1, limit:30 },
          { label:"Headline 2", value:variant.headline_2, limit:30 },
          { label:"Headline 3", value:variant.headline_3, limit:30 },
          { label:"Description 1", value:variant.description_1, limit:90 },
          { label:"Description 2", value:variant.description_2, limit:90 },
          { label:"CTA", value:variant.cta, limit:null },
          { label:"Why It Works", value:variant.why_it_works, limit:null },
        ]
      : [
          { label:"Headline", value:variant.headline, limit:40 },
          { label:"Primary Text", value:variant.primary_text, limit:125 },
          { label:"Description", value:variant.description, limit:30 },
          { label:"CTA", value:variant.cta, limit:null },
          { label:"Why It Works", value:variant.why_it_works, limit:null },
        ];
    return (
    <div style={{ background:"#050508", border:`1px solid ${color}30`, borderRadius:"12px", padding:"1rem", flex:1, minWidth:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".75rem" }}>
        <span style={{ fontSize:".65rem", fontWeight:800, color, letterSpacing:".08em" }}>{label}</span>
        <span style={{ background:`${color}15`, border:`1px solid ${color}30`, color, fontSize:".6rem", fontWeight:700, padding:".12rem .5rem", borderRadius:"6px" }}>{variant.angle}</span>
      </div>
      {fields.map(({ label:l, value, limit }) => value && (
        <div key={l} style={{ marginBottom:".6rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".18rem" }}>
            <p style={{ fontSize:".57rem", fontWeight:800, color:"#3f3f46", margin:0, letterSpacing:".08em", textTransform:"uppercase" as const }}>{l}</p>
            {limit && value && (
              <span style={{ fontSize:".55rem", color: (value?.length||0) > limit ? "#ef4444" : "#22c55e", fontWeight:700 }}>
                {value?.length||0}/{limit}
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:".4rem", alignItems:"flex-start" }}>
            <p style={{ fontSize:".78rem", color:"#cbd5e1", margin:0, flex:1, lineHeight:1.55 }}>{value}</p>
            <button onClick={() => copy(value, l+label)} style={{ background:"none", border:"1px solid #1a1a2e", color: copied === l+label ? color : "#52525b", borderRadius:"6px", padding:".15rem .4rem", cursor:"pointer", fontSize:".6rem", flexShrink:0 }}>
              {copied === l+label ? "✓" : "Copy"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );};

  return (
    <div style={{ background:"#080810", border:"1px solid rgba(109,40,217,.25)", borderRadius:"16px", padding:"1.4rem" }}>
      <p style={{ fontSize:".68rem", fontWeight:800, letterSpacing:".1em", color:"#6d28d9", marginBottom:".85rem" }}>🧪 A/B AD COPY GENERATOR</p>

      <textarea value={product} onChange={e => setProduct(e.target.value)}
        placeholder="Describe your product/service... e.g. 'Online yoga classes for busy working women in India, ₹999/month'"
        style={{ width:"100%", background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".75rem", color:"#fff", fontSize:".8rem", minHeight:"80px", resize:"vertical", fontFamily:"inherit", marginBottom:".75rem" }} />

      <div style={{ display:"flex", gap:".5rem", marginBottom:".85rem" }}>
        {["Meta Ads","Google Ads"].map(p => (
          <button key={p} onClick={() => setPlatform(p)}
            style={{ flex:1, padding:".5rem", borderRadius:"8px", border:`1px solid ${platform===p?"rgba(109,40,217,.4)":"#1a1a2e"}`, background:platform===p?"rgba(109,40,217,.12)":"transparent", color:platform===p?"#a855f7":"#52525b", fontWeight:700, fontSize:".75rem", cursor:"pointer" }}>
            {p === "Meta Ads" ? "📘 Meta Ads" : "📢 Google Ads"}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading || !product.trim()}
        style={{ width:"100%", background:!product.trim()?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:`1px solid ${!product.trim()?"#1a1a2e":"transparent"}`, color:!product.trim()?"#3f3f46":"#fff", padding:".8rem 1rem", borderRadius:"10px", fontWeight:800, fontSize:".85rem", cursor:!product.trim()?"not-allowed":"pointer", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", transition:"all .2s" }}>
        {loading
          ? <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} /> Generating your A/B variants...</>
          : <>
              <span>🧪</span>
              <span>Generate 2 Ad Variants</span>
              <span style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"6px", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", display:"flex", alignItems:"center", gap:".2rem" }}>
                <span style={{ fontSize:".6rem" }}>⚡</span> 3 cr
              </span>
            </>
        }
      </button>

      {result && (
        <div>
          <div style={{ display:"flex", gap:".75rem", marginBottom:".75rem", flexWrap:"wrap" }}>
            <VariantCard variant={result.variant_a} label="VARIANT A" color="#06b6d4" />
            <VariantCard variant={result.variant_b} label="VARIANT B" color="#f59e0b" />
          </div>
          <div style={{ background:"rgba(109,40,217,.06)", border:"1px solid rgba(109,40,217,.18)", borderRadius:"10px", padding:".75rem 1rem" }}>
            <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .25rem", letterSpacing:".06em" }}>📈 TESTING STRATEGY</p>
            <p style={{ fontSize:".78rem", color:"#cbd5e1", margin:"0 0 .5rem" }}>{result.test_recommendation}</p>
            {result.budget_split && (
              <>
                <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .2rem", letterSpacing:".06em" }}>💰 BUDGET SPLIT</p>
                <p style={{ fontSize:".78rem", color:"#cbd5e1", margin:0 }}>{result.budget_split}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LANDING PAGE COPY GENERATOR (Advertiser Exclusive) ───────────────────────
function LandingPageCopy({ plan, onUpgrade, onCreditUsed, onSaveHistory }: any) {
  const isUnlocked = ["advertiser","agency"].includes(plan);
  const [product, setProduct]   = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal]         = useState("leads");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [copied, setCopied]     = useState("");
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  if (!isUnlocked) return (
    <div style={{ background:"#080810", border:"1px solid #1a1a2e", borderRadius:"16px", padding:"2rem", textAlign:"center" }}>
      <div style={{ fontSize:"2rem", marginBottom:".75rem" }}>🖥️</div>
      <p style={{ fontWeight:800, fontSize:".95rem", marginBottom:".4rem" }}>Landing Page Copy</p>
      <p style={{ color:"#52525b", fontSize:".8rem", marginBottom:"1.25rem" }}>Generate complete landing page copy that matches your ad — headline, subheadline, benefits, CTA. Reduces bounce, increases conversions.</p>
      <button onClick={onUpgrade} style={{ background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".7rem 1.5rem", borderRadius:"10px", fontWeight:800, cursor:"pointer" }}>Unlock — Advertiser Plan ₹2,499</button>
    </div>
  );

  const generate = async () => {
    if (!product.trim()) return;
    setLoading(true); setResult(null);
    const prompt = `You are a senior conversion copywriter for Indian market landing pages.

Product/Service: ${product}
Target Audience: ${audience || "Indian consumers and business owners"}
Primary Goal: ${goal === "leads" ? "Lead Generation — capture contacts" : goal === "sales" ? "Direct Sales — drive purchase" : goal === "signup" ? "App Signup — free trial" : "Phone Call / Consultation"}

RULES:
- Headline: under 10 words, specific benefit (not generic)
- Pain points: real daily frustrations, be specific and emotional
- Benefits: outcome-based not feature-based ("Save 3 hours" not "time-saving")
- Social proof: use specific numbers
- FAQs: real objections that stop Indian buyers (price, trust, results)

Return ONLY valid JSON:
{
  "hero_headline": "Under 10 words — bold specific claim",
  "hero_subheadline": "15-25 words — expand the promise",
  "hero_cta": "3-5 word action CTA",
  "pain_section_heading": "Section heading e.g. 'Sound Familiar?'",
  "pain_points": ["specific emotional pain 1", "specific pain 2", "specific pain 3"],
  "benefits_heading": "Benefits section heading",
  "benefits": ["Outcome benefit 1 with number/time", "Outcome benefit 2", "Outcome benefit 3", "Outcome benefit 4"],
  "social_proof": "Specific credibility with numbers",
  "urgency_line": "Genuine scarcity or deadline line",
  "faq": [
    {"q": "Price objection", "a": "Value reframe answer"},
    {"q": "Trust concern", "a": "Proof-based answer"},
    {"q": "Results timeline", "a": "Specific honest answer"}
  ],
  "footer_cta_headline": "Final push — different angle from hero",
  "footer_cta_button": "Final CTA button text",
  "meta_description": "150-160 char SEO description"
}`
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:900 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
      onCreditUsed?.();
    } catch { }
    setLoading(false);
  };

  const CopyRow = ({ label, value, key2 }: any) => (
    <div style={{ background:"#050508", border:"1px solid #0d0d18", borderRadius:"10px", padding:".8rem 1rem", marginBottom:".6rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:".5rem" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:".57rem", fontWeight:800, color:"#3f3f46", margin:"0 0 .25rem", letterSpacing:".08em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ fontSize:".82rem", color:"#fff", margin:0, fontWeight:700, lineHeight:1.5 }}>{value}</p>
        </div>
        <button onClick={() => copy(value, key2)} style={{ background:"none", border:"1px solid #1a1a2e", color: copied===key2?"#22c55e":"#52525b", borderRadius:"6px", padding:".2rem .5rem", cursor:"pointer", fontSize:".62rem", flexShrink:0 }}>
          {copied===key2 ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background:"#080810", border:"1px solid rgba(109,40,217,.25)", borderRadius:"16px", padding:"1.4rem" }}>
      <p style={{ fontSize:".68rem", fontWeight:800, letterSpacing:".1em", color:"#6d28d9", marginBottom:".85rem" }}>🖥️ LANDING PAGE COPY</p>

      <textarea value={product} onChange={e => setProduct(e.target.value)}
        placeholder="Product/service description... e.g. 'Digital marketing course for small business owners, ₹4,999 one-time'"
        style={{ width:"100%", background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".75rem", color:"#fff", fontSize:".8rem", minHeight:"75px", resize:"vertical", fontFamily:"inherit", marginBottom:".6rem" }} />

      <input value={audience} onChange={e => setAudience(e.target.value)}
        placeholder="Target audience... e.g. 'Small business owners 30-50 in Tier 2 cities'"
        style={{ width:"100%", background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"10px", padding:".6rem .75rem", color:"#fff", fontSize:".8rem", fontFamily:"inherit", marginBottom:".6rem" }} />

      <div style={{ display:"flex", gap:".4rem", marginBottom:".85rem" }}>
        {[["leads","📋 Generate Leads"],["sales","🛒 Drive Sales"],["signups","✍️ App Signups"]].map(([v,l]) => (
          <button key={v} onClick={() => setGoal(v)}
            style={{ flex:1, padding:".45rem .4rem", borderRadius:"8px", border:`1px solid ${goal===v?"rgba(109,40,217,.4)":"#1a1a2e"}`, background:goal===v?"rgba(109,40,217,.12)":"transparent", color:goal===v?"#a855f7":"#52525b", fontWeight:700, fontSize:".68rem", cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading || !product.trim()}
        style={{ width:"100%", background:!product.trim()?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:`1px solid ${!product.trim()?"#1a1a2e":"transparent"}`, color:!product.trim()?"#3f3f46":"#fff", padding:".8rem 1rem", borderRadius:"10px", fontWeight:800, fontSize:".85rem", cursor:!product.trim()?"not-allowed":"pointer", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", transition:"all .2s" }}>
        {loading
          ? <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} /> Writing your landing page copy...</>
          : <>
              <span>🖥️</span>
              <span>Generate Landing Page Copy</span>
              <span style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"6px", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", display:"flex", alignItems:"center", gap:".2rem" }}>
                <span style={{ fontSize:".6rem" }}>⚡</span> 4 cr
              </span>
            </>
        }
      </button>

      {result && (
        <div>
          <CopyRow label="Hero Headline" value={result.hero_headline} key2="h1" />
          <CopyRow label="Subheadline" value={result.hero_subheadline} key2="sub" />
          <CopyRow label="Primary CTA" value={result.hero_cta} key2="cta1" />
          <CopyRow label="Problem Statement" value={result.problem_statement} key2="prob" />
          <CopyRow label="Solution Intro" value={result.solution_intro} key2="sol" />

          <div style={{ background:"#050508", border:"1px solid #0d0d18", borderRadius:"10px", padding:".8rem 1rem", marginBottom:".6rem" }}>
            <p style={{ fontSize:".57rem", fontWeight:800, color:"#3f3f46", margin:"0 0 .6rem", letterSpacing:".08em", textTransform:"uppercase" }}>Key Benefits</p>
            {result.benefits?.map((b: any, i: number) => (
              <div key={i} style={{ display:"flex", gap:".6rem", marginBottom:".5rem" }}>
                <span style={{ fontSize:"1.1rem" }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize:".78rem", fontWeight:700, color:"#fff", margin:"0 0 .1rem" }}>{b.title}</p>
                  <p style={{ fontSize:".74rem", color:"#94a3b8", margin:0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <CopyRow label="Social Proof / Testimonial" value={result.social_proof} key2="sp" />
          <CopyRow label="Urgency Line" value={result.urgency_line} key2="urg" />
          <CopyRow label="Final CTA" value={result.final_cta} key2="cta2" />

          <div style={{ background:"rgba(34,197,94,.05)", border:"1px solid rgba(34,197,94,.15)", borderRadius:"10px", padding:".75rem 1rem" }}>
            <p style={{ fontSize:".57rem", fontWeight:800, color:"#22c55e", margin:"0 0 .4rem", letterSpacing:".08em" }}>TRUST ELEMENTS</p>
            <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
              {result.trust_elements?.map((t: string, i: number) => (
                <span key={i} style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", color:"#4ade80", fontSize:".68rem", fontWeight:700, padding:".18rem .55rem", borderRadius:"6px" }}>✓ {t}</span>
              ))}
            </div>
          </div>

          {/* HOW TO USE — next steps for the user */}
          <div style={{ background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"12px", padding:"1rem 1.1rem", marginTop:".75rem" }}>
            <p style={{ fontSize:".62rem", fontWeight:800, color:"#a855f7", margin:"0 0 .7rem", letterSpacing:".08em" }}>📋 HOW TO USE THIS COPY</p>
            <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
              {[
                { step:"1", icon:"📋", title:"Copy each section", desc:'Click the "Copy" button next to each section above — Hero Headline, Subheadline, CTA, etc.' },
                { step:"2", icon:"🌐", title:"Open your website builder", desc:"Paste into Shopify, WordPress, Wix, Webflow, or any HTML page. Each section maps directly to a page section." },
                { step:"3", icon:"🔗", title:"Match your ad exactly", desc:"Your ad headline should match your Hero Headline word-for-word. Same promise → visitor trusts → higher conversion." },
                { step:"4", icon:"📊", title:"Check ROI before spending", desc:"Use the ROI Calculator tab to estimate ROAS before launching your ad campaign." },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} style={{ display:"flex", gap:".7rem", alignItems:"flex-start" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", color:"#fff", fontSize:".6rem", fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:".1rem" }}>{step}</div>
                  <div>
                    <p style={{ margin:"0 0 .1rem", fontSize:".76rem", fontWeight:700, color:"#e4e4e7" }}>{icon} {title}</p>
                    <p style={{ margin:0, fontSize:".72rem", color:"#52525b", lineHeight:1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick platform links */}
            <div style={{ borderTop:"1px solid rgba(124,58,237,.15)", marginTop:".75rem", paddingTop:".75rem" }}>
              <p style={{ fontSize:".58rem", fontWeight:800, color:"#52525b", margin:"0 0 .45rem", letterSpacing:".08em" }}>PASTE INTO</p>
              <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
                {["Shopify","WordPress","Wix","Webflow","HTML Page","Google Sites"].map(platform => (
                  <span key={platform} style={{ background:"rgba(255,255,255,.04)", border:"1px solid #1a1a2e", color:"#52525b", fontSize:".65rem", fontWeight:600, padding:".15rem .5rem", borderRadius:"6px" }}>{platform}</span>
                ))}
              </div>
            </div>

            {/* Pro tip */}
            <div style={{ background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.18)", borderRadius:"8px", padding:".6rem .8rem", marginTop:".65rem", display:"flex", gap:".5rem", alignItems:"flex-start" }}>
              <span style={{ fontSize:".85rem", flexShrink:0 }}>💡</span>
              <p style={{ margin:0, fontSize:".72rem", color:"#92400e", lineHeight:1.55 }}>
                <strong style={{ color:"#fbbf24" }}>Pro Tip:</strong> Run your ad using the <strong style={{ color:"#fbbf24" }}>A/B Ad Copy</strong> tab first. Then create a matching landing page for each variant. Test both — the winning combination gives you 2-3× more conversions from the same ad budget.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WHATSAPP & EMAIL COPY GENERATOR ─────────────────────────────────────────
function WhatsAppEmailCopy({ onCreditUsed, onSaveHistory, plan }: any) {
  const [type, setType]           = useState<"whatsapp"|"email"|"colddm">("whatsapp");
  const [emailStyle, setEmailStyle] = useState("sales");
  const [brandName, setBrandName] = useState("");
  const [offer, setOffer]         = useState("");
  const [audience, setAudience]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<any>(null);
  const [copied, setCopied]       = useState("");
  const [occasion, setOccasion]   = useState("Diwali Sale");

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const EMAIL_STYLES = [
    { id:"sales",     icon:"💰", label:"Sales Email",     desc:"Promote an offer or product" },
    { id:"upsell",    icon:"⬆️", label:"Upsell Email",    desc:"Sell more to existing customers" },
    { id:"renewal",   icon:"🔄", label:"Renewal Email",   desc:"Remind to renew subscription/service" },
    { id:"welcome",   icon:"👋", label:"Welcome Email",   desc:"Greet new customer or subscriber" },
    { id:"nurture",   icon:"🌱", label:"Nurture Email",   desc:"Build relationship, add value" },
    { id:"winback",   icon:"💔", label:"Win-Back Email",  desc:"Re-engage inactive customers" },
    { id:"awareness", icon:"📢", label:"Awareness Email", desc:"Introduce your brand or new product" },
    { id:"event",     icon:"🗓️", label:"Event Email",     desc:"Invite to webinar, sale, or event" },
  ];

  const OCCASIONS = ["Diwali Sale","New Year Offer","Product Launch","Weekend Sale",
    "Festival Discount","New Arrival","Flash Sale","Anniversary Offer"];

  const EMAIL_STYLE_PROMPTS: Record<string, string> = {
    sales: `Write a high-converting SALES EMAIL for an Indian business.
Goal: Drive immediate purchase or inquiry.
Structure: 
1. Subject lines that create desire
2. Opening that connects with a pain or desire (2-3 sentences)
3. Introduce the solution naturally (2-3 sentences)
4. Present the offer with full details — price, what's included, deadline (3-4 sentences)
5. Social proof — specific result or customer story (2-3 sentences)
6. Handle the main objection (2-3 sentences)
7. Clear CTA with urgency (2-3 sentences)
8. P.S. line with bonus or deadline

Tone: Confident, warm, professional. Like a trusted business friend writing to you.`,

    upsell: `Write a persuasive UPSELL EMAIL for an Indian business.
Goal: Get existing customer to upgrade or buy more.
Structure:
1. Subject lines that feel exclusive (for existing customers only)
2. Open by appreciating their loyalty (2-3 sentences)
3. Reference what they already have/use (2-3 sentences)
4. Introduce the upgrade with clear comparison — what they have vs what they'll get (4-5 sentences)
5. Make the upgrade feel like a natural next step (2-3 sentences)
6. Exclusive price or offer for existing customers (2-3 sentences)
7. Soft CTA — not pushy (2-3 sentences)
8. P.S. — Remind this offer is only for existing customers

Tone: Appreciative, exclusive, not pushy.`,

    renewal: `Write a RENEWAL EMAIL for an Indian business.
Goal: Remind customer to renew before expiry.
Structure:
1. Subject lines with urgency but not alarming
2. Open with what they've achieved/used (positive) (2-3 sentences)
3. Mention renewal date approaching (2-3 sentences)
4. What they'll lose if they don't renew (briefly, not fear-mongering) (2-3 sentences)
5. Renewal offer — early renewal discount or bonus (3-4 sentences)
6. Simple renewal process (1-2 sentences)
7. CTA — Renew Now button
8. P.S. — What happens after expiry / grace period

Tone: Helpful, friendly, clear — like a reminder from a friend.`,

    welcome: `Write a WELCOME EMAIL for a new customer/subscriber.
Goal: Make excellent first impression, set expectations, build trust.
Structure:
1. Subject lines that feel warm and personal
2. Warm welcome — make them feel great about their decision (3-4 sentences)
3. What to expect from this relationship (3-4 sentences)
4. Quick win — something immediately useful or valuable (3-4 sentences)
5. How to get the best experience (2-3 sentences)
6. Invitation to connect (reply, follow, WhatsApp) (2-3 sentences)
7. CTA — Guide them to first action
8. P.S. — Personal touch or founder note

Tone: Warm, excited, genuine. Like welcoming a friend home.`,

    nurture: `Write a VALUE NURTURE EMAIL for an Indian business.
Goal: Build trust, educate, strengthen relationship — NOT sell directly.
Structure:
1. Subject lines based on curiosity or value (not salesy)
2. Open with a relevant insight or tip (3-4 sentences)
3. Tell a brief story or case study (4-5 sentences)
4. Share actionable advice they can use today (4-5 sentences)
5. Soft mention of how your product/service relates (2-3 sentences)
6. Ask a question or invite reply (1-2 sentences)
7. Gentle CTA — low friction (read more, reply, etc.)
8. P.S. — Personal note or upcoming content preview

Tone: Helpful, educational, genuine. Zero selling pressure.`,

    winback: `Write a WIN-BACK EMAIL for inactive customers.
Goal: Re-engage customers who haven't bought/visited in a while.
Structure:
1. Subject lines that acknowledge the gap with humor or honesty
2. Acknowledge the silence honestly (2-3 sentences)
3. Show what's changed or improved since they left (3-4 sentences)
4. Make them feel missed and valued (2-3 sentences)
5. Special win-back offer — make it worth coming back (3-4 sentences)
6. Remove friction — make returning easy (2-3 sentences)
7. CTA — Come Back button
8. P.S. — What if they don't want to? (unsubscribe gracefully)

Tone: Honest, a little humble, warm. Not desperate.`,

    awareness: `Write an AWARENESS EMAIL to introduce brand or new product.
Goal: Educate, create interest, plant the seed.
Structure:
1. Subject lines that spark curiosity
2. Open with the problem your audience faces (3-4 sentences)
3. Introduce yourself/brand naturally (3-4 sentences)
4. Present your solution with key benefits (4-5 sentences)
5. Show proof you're credible (3-4 sentences)
6. Paint the picture of life with your solution (3-4 sentences)
7. Low-friction CTA — Learn more, Watch demo, etc.
8. P.S. — Free resource or introductory offer

Tone: Educational, inspiring, confident. Not pushy.`,

    event: `Write an EVENT INVITATION EMAIL for an Indian business.
Goal: Drive registrations or attendance for webinar/sale/event.
Structure:
1. Subject lines that create excitement and urgency
2. Open with what they'll gain from attending (3-4 sentences)
3. Event details — what, when, where, who (4-5 sentences)
4. Why this event is worth their time — specific outcomes (3-4 sentences)
5. Who else is coming / speaker credentials (2-3 sentences)
6. Overcome "I'm too busy" objection (2-3 sentences)
7. Register Now CTA with deadline
8. P.S. — Replay available? Early bird bonus?

Tone: Exciting, clear, persuasive. Make them feel they'll miss out if they skip.`,
  };

  const generate = async () => {
    if (!brandName.trim()) return;
    setLoading(true); setResult(null);

    let prompt = "";

    if (type === "whatsapp") {
      prompt = `You are a senior WhatsApp Business marketing expert for Indian SMBs.

Business: ${brandName}
Occasion/Offer: ${occasion} — ${offer || "Special offer"}

WHATSAPP BUSINESS POLICY COMPLIANCE:
- Messages for opted-in customers only
- No spam trigger words or excessive caps
- Include business name naturally
- Max 3 emojis per message
- No misleading offers

Write 3 professional WhatsApp broadcast messages:
Message 1 — Soft Announce (friendly, no hard sell)
Message 2 — Value Highlight (specific benefit + offer)  
Message 3 — Urgency + CTA (genuine deadline, clear action)

Return ONLY valid JSON:
{
  "messages": [
    {
      "tone": "Soft Announce",
      "text": "Full professional message",
      "char_count": 0,
      "best_time": "Best send time for Indian audience"
    },
    {
      "tone": "Value Highlight",
      "text": "Full professional message",
      "char_count": 0,
      "best_time": "Best send time"
    },
    {
      "tone": "Urgency + CTA",
      "text": "Full professional message",
      "char_count": 0,
      "best_time": "Best send time"
    }
  ],
  "compliance_note": "Key WhatsApp policy reminder for this campaign",
  "pro_tip": "One tip to improve response rate for Indian audience"
}`;

    } else if (type === "email") {
      const styleLabel = EMAIL_STYLES.find(s => s.id === emailStyle)?.label || "Sales";
      const styleGoals: Record<string,string> = {
        sales:    "Drive purchase — offer + urgency + social proof",
        upsell:   "Get existing customer to upgrade — show new value",
        renewal:  "Remind to renew before expiry — positive + gentle urgency",
        welcome:  "Warm welcome — make first impression excellent",
        nurture:  "Add value, build trust — no direct selling",
        winback:  "Re-engage inactive customer — acknowledge gap, offer incentive",
        awareness:"Introduce brand/product — educate and inspire",
        event:    "Drive event registration — excitement + clear details",
      };

      prompt = `Write a professional ${styleLabel} for an Indian business. Goal: ${styleGoals[emailStyle] || "drive action"}.

DETAILS:
Brand: ${brandName}
${offer ? `Offer/Campaign: ${offer}` : ""}
${audience ? `Audience: ${audience}` : "Audience: Indian customers"}

RULES:
- Complete professional email — minimum 300 words body
- Flowing paragraphs — NO labels like "Hook:" or "Para 1:"
- Start body with "Hi [First Name],"
- Use "${brandName}" naturally
- End with warm sign-off + brand name
- Indian cultural context, warm professional tone
- Subject lines: 35-50 characters each

Return ONLY this JSON (no extra text):
{
  "subject_lines": [
    {"text": "subject 1 (curiosity/question)", "strategy": "why this works"},
    {"text": "subject 2 (benefit/offer)", "strategy": "why this works"},
    {"text": "subject 3 (urgency/deadline)", "strategy": "why this works"}
  ],
  "preview_text": "preview text 80-100 chars",
  "email_body": "Complete email body starting with Hi [First Name], — write 300+ words as flowing professional email paragraphs. NO section labels. Real content that can be sent as-is.",
  "cta_button": "Action CTA 3-5 words",
  "ps_line": "P.S. compelling bonus line",
  "best_send_time": "Best day and time for Indian audience",
  "compliance_note": "Key compliance reminder"
}`;

    } else {
      prompt = `You are an expert at writing high-converting cold outreach for Indian professionals.

Your Business/Service: ${brandName}
Goal: ${offer || "Find new clients or collaborations"}
${audience ? `Target: ${audience}` : ""}

Write 3 personalized cold DM templates:
DM 1 — Creator Collaboration (Instagram, under 280 chars)
DM 2 — B2B Client Outreach (LinkedIn, under 300 chars)
DM 3 — Follow-up Message (after no reply, 5-7 days later)

Rules: Start with THEM not "I", use [Name] token, genuine not salesy, soft CTA.

Return ONLY valid JSON:
{
  "dms": [
    {
      "situation": "Creator Collaboration",
      "platform": "Instagram",
      "text": "Complete DM with [Name] token",
      "char_count": 0,
      "approach": "Genuine compliment → shared value → soft ask",
      "personalization_tip": "What to research before sending"
    },
    {
      "situation": "B2B Client Outreach",
      "platform": "LinkedIn",
      "text": "Complete DM with [Name] and [Company] tokens",
      "char_count": 0,
      "approach": "Specific problem → your solution → low-commitment CTA",
      "personalization_tip": "What to check on their profile first"
    },
    {
      "situation": "Follow-up (No Reply)",
      "platform": "Instagram or LinkedIn",
      "text": "Short non-pushy follow-up",
      "char_count": 0,
      "approach": "Add new value → restate ask simply",
      "personalization_tip": "Best timing for follow-up"
    }
  ],
  "response_rate_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;
    }

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content: prompt }], max_tokens:2500 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      // Clean and extract JSON safely
      let cleanText = text.replace(/```json|```/g,"").trim();
      // Find JSON object boundaries
      const jsonStart = cleanText.indexOf("{");
      const jsonEnd = cleanText.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON in response");
      cleanText = cleanText.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(cleanText);
      setResult(parsed);
      onCreditUsed?.();
      onSaveHistory?.("whatsapp", { inputSummary: `${type}: ${brandName}`, resultData: parsed });
    } catch (err) {
      console.error("WA/Email generate error:", err);
      setResult({ _error: true });
    }
    setLoading(false);
  };

  const TYPE_CONFIG = {
    whatsapp: { label:"💬 WhatsApp Broadcast", color:"#25d366" },
    email:    { label:"📧 Email Campaign",      color:"#6d28d9" },
    colddm:   { label:"📩 Cold DM / Outreach",  color:"#06b6d4" },
  };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>💬 WhatsApp & Email Copy</h2>
      <p style={{ color:"#52525b", fontSize:".78rem", margin:"0 0 1rem" }}>Professional marketing copy for WhatsApp broadcasts, email campaigns, and cold outreach.</p>

      {/* Type Tabs */}
      <div style={{ display:"flex", gap:".4rem", marginBottom:"1.25rem" }}>
        {(Object.entries(TYPE_CONFIG) as any).map(([key, val]: any) => (
          <button key={key} onClick={() => { setType(key); setResult(null); }}
            style={{ flex:1, padding:".55rem .5rem", borderRadius:"10px", border:`1px solid ${type===key?val.color+"60":"#1a1a2e"}`, background:type===key?val.color+"14":"transparent", color:type===key?val.color:"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Email Style Selector — only for email */}
      {type === "email" && (
        <div style={{ marginBottom:"1rem" }}>
          <label style={{ fontSize:".62rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".5rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>📧 Email Type</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:".4rem" }}>
            {EMAIL_STYLES.map(s => (
              <button key={s.id} onClick={() => { setEmailStyle(s.id); setResult(null); }}
                style={{ padding:".55rem .75rem", borderRadius:"9px", border:`1px solid ${emailStyle===s.id?"rgba(109,40,217,.5)":"#1a1a2e"}`, background:emailStyle===s.id?"rgba(109,40,217,.12)":"#050508", cursor:"pointer", fontFamily:"inherit", textAlign:"left" as const, transition:"all .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                  <span style={{ fontSize:".9rem" }}>{s.icon}</span>
                  <div>
                    <p style={{ margin:0, fontSize:".72rem", fontWeight:800, color:emailStyle===s.id?"#c4b5fd":"#e2e8f0" }}>{s.label}</p>
                    <p style={{ margin:0, fontSize:".6rem", color:"#52525b" }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Occasion */}
      {type === "whatsapp" && (
        <div style={{ marginBottom:".85rem" }}>
          <label style={{ fontSize:".62rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".4rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Campaign Occasion</label>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:".35rem" }}>
            {OCCASIONS.map(o => (
              <button key={o} onClick={() => setOccasion(o)}
                style={{ padding:".28rem .65rem", borderRadius:"6px", border:`1px solid ${occasion===o?"rgba(37,211,102,.4)":"#1a1a2e"}`, background:occasion===o?"rgba(37,211,102,.1)":"transparent", color:occasion===o?"#25d366":"#52525b", fontWeight:700, fontSize:".68rem", cursor:"pointer", fontFamily:"inherit" }}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div style={{ display:"flex", flexDirection:"column" as const, gap:".65rem", marginBottom:".85rem" }}>
        <div>
          <label style={{ fontSize:".62rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>
            {type === "colddm" ? "Your Business / Service" : "Brand / Business Name"}
          </label>
          <input value={brandName} onChange={e => setBrandName(e.target.value)}
            placeholder={type === "colddm" ? "e.g. Digital Marketing Agency, VCI Tool, Fitness Coach..." : "e.g. FitZone Gym, Ramesh Sarees, TechSoft Solutions..."}
            style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit", outline:"none" }}
            onFocus={e => e.target.style.borderColor="#6d28d9"}
            onBlur={e => e.target.style.borderColor="#1a1a2e"} />
        </div>

        <div>
          <label style={{ fontSize:".62rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>
            {type === "colddm" ? "Your Goal / Pitch" : type === "email" ? "Offer / Campaign Details" : "Offer Details"}
          </label>
          <input value={offer} onChange={e => setOffer(e.target.value)}
            placeholder={
              type === "colddm" ? "e.g. Get brand collaboration, find social media clients..." :
              type === "email" && emailStyle === "renewal" ? "e.g. Annual subscription ₹2,999 expiring, 10% early renewal discount..." :
              type === "email" && emailStyle === "upsell" ? "e.g. Currently on Basic plan, upgrade to Pro at ₹1,299 for 3x features..." :
              type === "email" && emailStyle === "welcome" ? "e.g. New subscriber, free resource to share, what to expect next..." :
              "e.g. 40% off on all products, Buy 2 Get 1 free, ₹500 discount on orders above ₹2,000..."
            }
            style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit", outline:"none" }}
            onFocus={e => e.target.style.borderColor="#6d28d9"}
            onBlur={e => e.target.style.borderColor="#1a1a2e"} />
        </div>

        {type === "email" && (
          <div>
            <label style={{ fontSize:".62rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Target Audience <span style={{ color:"#27272a", fontWeight:400 }}>(optional)</span></label>
            <input value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Small business owners in Mumbai, fitness enthusiasts 25-40, existing customers..."
              style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit", outline:"none" }}
              onFocus={e => e.target.style.borderColor="#6d28d9"}
              onBlur={e => e.target.style.borderColor="#1a1a2e"} />
          </div>
        )}
      </div>

      <button onClick={generate} disabled={loading||!brandName.trim()}
        style={{ width:"100%", padding:".85rem", borderRadius:"11px", background:!brandName.trim()?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:!brandName.trim()?"#3f3f46":"#fff", fontWeight:800, fontSize:".9rem", cursor:!brandName.trim()?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", marginBottom:"1.25rem", boxShadow:!brandName.trim()?"none":"0 6px 24px rgba(109,40,217,.3)" }}>
        {loading
          ? <><span style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite" }} /> Generating your copy...</>
          : type === "email"
            ? `✍️ Generate ${EMAIL_STYLES.find(s=>s.id===emailStyle)?.label || "Email"}`
            : type === "whatsapp"
              ? "💬 Generate WhatsApp Messages"
              : "📩 Generate Cold DM Scripts"
        }
      </button>

      {result?._error && (
        <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.25)", borderRadius:"10px", padding:".75rem 1rem", marginBottom:".75rem" }}>
          <p style={{ margin:0, color:"#f87171", fontSize:".8rem", fontWeight:600 }}>
            ⚠️ Something went wrong. Please try again with shorter/simpler input, or check your connection.
          </p>
        </div>
      )}

      {/* ── WHATSAPP RESULT ── */}
      {result && type === "whatsapp" && (
        <div style={{ display:"flex", flexDirection:"column" as const, gap:".75rem" }}>
          {result.messages?.map((m: any, i: number) => {
            const charCount = (m.text||"").length;
            return (
            <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"12px", padding:"1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".5rem" }}>
                <span style={{ fontSize:".6rem", fontWeight:800, color:"#25d366", textTransform:"uppercase" as const, letterSpacing:".06em" }}>{m.tone}</span>
                <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                  <span style={{ fontSize:".6rem", fontWeight:700, color: charCount > 300 ? "#ef4444" : charCount > 160 ? "#f59e0b" : "#22c55e" }}>
                    {charCount} chars
                  </span>
                  <button onClick={() => copy(m.text, `wa${i}`)}
                    style={{ background:copied===`wa${i}`?"rgba(37,211,102,.1)":"transparent", border:`1px solid ${copied===`wa${i}`?"rgba(37,211,102,.3)":"#1a1a2e"}`, color:copied===`wa${i}`?"#22c55e":"#52525b", padding:".15rem .55rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit" }}>
                    {copied===`wa${i}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p style={{ color:"#e2e8f0", fontSize:".84rem", lineHeight:1.75, margin:"0 0 .4rem", whiteSpace:"pre-line" as const }}>{m.text}</p>
              {m.best_time && <p style={{ margin:0, color:"#3f3f46", fontSize:".65rem" }}>⏰ Best time: <span style={{ color:"#52525b" }}>{m.best_time}</span></p>}
            </div>
          );})}
          {result.compliance_note && (
            <div style={{ background:"rgba(239,68,68,.05)", border:"1px solid rgba(239,68,68,.18)", borderRadius:"8px", padding:".65rem .9rem" }}>
              <p style={{ margin:0, color:"#f87171", fontSize:".72rem" }}>⚖️ <strong>Compliance:</strong> {result.compliance_note}</p>
            </div>
          )}
          {result.pro_tip && (
            <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.15)", borderRadius:"8px", padding:".65rem .9rem" }}>
              <p style={{ margin:0, color:"#a16207", fontSize:".72rem" }}>💡 <strong style={{ color:"#fbbf24" }}>Pro Tip:</strong> {result.pro_tip}</p>
            </div>
          )}
        </div>
      )}

      {/* ── EMAIL RESULT ── */}
      {result && type === "email" && (
        <div style={{ display:"flex", flexDirection:"column" as const, gap:".85rem" }}>

          {/* Subject Lines */}
          <div style={{ background:"#050508", border:"1px solid #141426", borderRadius:"12px", padding:"1rem" }}>
            <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .65rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>📧 Subject Lines — Pick & A/B Test</p>
            {(result.subject_lines||[]).map((s: any, i: number) => {
              const text = typeof s === "string" ? s : s.text;
              const strategy = typeof s === "object" ? s.strategy : null;
              return (
              <div key={i} style={{ background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"8px", padding:".6rem .85rem", marginBottom:".4rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:".5rem" }}>
                  <p style={{ color:"#e2e8f0", fontSize:".84rem", fontWeight:600, margin:0, flex:1 }}>{text}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:".35rem", flexShrink:0 }}>
                    <span style={{ fontSize:".6rem", fontWeight:700, color:(text?.length||0)>50?"#f59e0b":"#22c55e" }}>{text?.length||0}/50</span>
                    <button onClick={() => copy(text, `sub${i}`)}
                      style={{ background:"transparent", border:"1px solid #1a1a2e", color:copied===`sub${i}`?"#22c55e":"#52525b", padding:".12rem .45rem", borderRadius:"5px", cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit" }}>
                      {copied===`sub${i}` ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
                {strategy && <p style={{ margin:".25rem 0 0", color:"#3f3f46", fontSize:".62rem" }}>💡 {strategy}</p>}
              </div>
            );})}
          </div>

          {/* Preview Text */}
          {result.preview_text && (
            <div style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".85rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center", gap:".5rem" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:".58rem", fontWeight:800, color:"#52525b", margin:"0 0 .2rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Preview Text <span style={{ color:"#27272a" }}>(shows in inbox before opening)</span></p>
                <p style={{ color:"#94a3b8", fontSize:".8rem", margin:0 }}>{result.preview_text}</p>
              </div>
              <button onClick={() => copy(result.preview_text, "prev")}
                style={{ background:"transparent", border:"1px solid #1a1a2e", color:copied==="prev"?"#22c55e":"#52525b", padding:".15rem .5rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit", flexShrink:0 }}>
                {copied==="prev" ? "✓" : "Copy"}
              </button>
            </div>
          )}

          {/* Full Email Preview */}
          <div style={{ background:"#050508", border:"1px solid rgba(109,40,217,.25)", borderRadius:"14px", overflow:"hidden" }}>
            {/* Email toolbar */}
            <div style={{ background:"rgba(109,40,217,.08)", borderBottom:"1px solid rgba(109,40,217,.15)", padding:".65rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, color:"#a855f7", fontWeight:800, fontSize:".7rem" }}>
                  {EMAIL_STYLES.find(s=>s.id===emailStyle)?.icon} {EMAIL_STYLES.find(s=>s.id===emailStyle)?.label}
                </p>
                <p style={{ margin:".1rem 0 0", color:"#52525b", fontSize:".6rem" }}>From: {brandName}</p>
              </div>
              <button onClick={() => copy(
                `Subject: ${(result.subject_lines?.[0]?.text || result.subject_lines?.[0]) || ""}\n\n${result.email_body || ""}\n\n${result.cta_button ? `[ ${result.cta_button} ]` : ""}\n\n${result.ps_line || ""}`,
                "full_email"
              )}
                style={{ background: copied==="full_email"?"rgba(34,197,94,.1)":"rgba(109,40,217,.1)", border:`1px solid ${copied==="full_email"?"rgba(34,197,94,.3)":"rgba(109,40,217,.3)"}`, color:copied==="full_email"?"#22c55e":"#a855f7", padding:".35rem .85rem", borderRadius:"8px", cursor:"pointer", fontSize:".7rem", fontWeight:800, fontFamily:"inherit" }}>
                {copied==="full_email" ? "✓ Copied!" : "📋 Copy Full Email"}
              </button>
            </div>

            {/* Email content */}
            <div style={{ padding:"1.25rem" }}>
              {/* Full email body as one block */}
              <div style={{ color:"#e2e8f0", fontSize:".84rem", lineHeight:1.85, whiteSpace:"pre-line" as const, marginBottom:"1.25rem" }}>
                {result.email_body || ""}
              </div>

              {/* CTA Button visual */}
              {result.cta_button && (
                <div style={{ textAlign:"center" as const, margin:"1.5rem 0" }}>
                  <div style={{ display:"inline-block", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", color:"#fff", fontWeight:800, fontSize:".9rem", padding:".75rem 2.25rem", borderRadius:"9px", cursor:"pointer", boxShadow:"0 4px 16px rgba(109,40,217,.35)", letterSpacing:".02em" }}
                    onClick={() => copy(result.cta_button, "cta_copy")}>
                    {result.cta_button} →
                  </div>
                  <p style={{ color:copied==="cta_copy"?"#22c55e":"#3f3f46", fontSize:".62rem", margin:".4rem 0 0", cursor:"pointer" }}
                    onClick={() => copy(result.cta_button, "cta_copy")}>
                    {copied==="cta_copy" ? "✓ CTA Copied" : "Click to copy CTA text"}
                  </p>
                </div>
              )}

              {/* PS Line */}
              {result.ps_line && (
                <div style={{ borderTop:"1px solid #141426", paddingTop:".85rem", marginTop:".5rem" }}>
                  <p style={{ color:"#f59e0b", fontSize:".82rem", fontStyle:"italic", margin:0, lineHeight:1.7 }}>{result.ps_line}</p>
                </div>
              )}

              {/* Email footer */}
              <div style={{ borderTop:"1px solid #0d0d18", paddingTop:".65rem", marginTop:"1rem" }}>
                <p style={{ color:"#27272a", fontSize:".62rem", margin:0 }}>
                  © {new Date().getFullYear()} {brandName} · You received this because you subscribed · <span style={{ color:"#3f3f46", textDecoration:"underline" }}>Unsubscribe</span>
                </p>
              </div>
            </div>
          </div>

          {/* Send time + compliance */}
          <div style={{ display:"flex", gap:".65rem", flexWrap:"wrap" as const, marginBottom:".65rem" }}>
            {result.best_send_time && (
              <div style={{ flex:1, minWidth:150, background:"rgba(34,197,94,.04)", border:"1px solid rgba(34,197,94,.15)", borderRadius:"9px", padding:".6rem .85rem" }}>
                <p style={{ margin:"0 0 .2rem", fontSize:".6rem", fontWeight:800, color:"#22c55e", textTransform:"uppercase" as const }}>⏰ Best Send Time</p>
                <p style={{ margin:0, color:"#86efac", fontSize:".75rem" }}>{result.best_send_time}</p>
              </div>
            )}
            {result.compliance_note && (
              <div style={{ flex:1, minWidth:150, background:"rgba(239,68,68,.04)", border:"1px solid rgba(239,68,68,.15)", borderRadius:"9px", padding:".6rem .85rem" }}>
                <p style={{ margin:"0 0 .2rem", fontSize:".6rem", fontWeight:800, color:"#f87171", textTransform:"uppercase" as const }}>⚖️ Compliance Note</p>
                <p style={{ margin:0, color:"#fca5a5", fontSize:".72rem" }}>{result.compliance_note}</p>
              </div>
            )}
          </div>

          {/* Static compliance checklist */}
          <div style={{ background:"rgba(239,68,68,.04)", border:"1px solid rgba(239,68,68,.15)", borderRadius:"9px", padding:".75rem .9rem" }}>
            <p style={{ margin:"0 0 .5rem", fontSize:".6rem", fontWeight:800, color:"#f87171", textTransform:"uppercase" as const, letterSpacing:".06em" }}>✅ Pre-Send Compliance Checklist</p>
            {[
              "Unsubscribe link added to email footer",
              "Business name clearly visible in From field",
              "Subject line is not misleading or deceptive",
              "All offers/prices match your actual website",
              "Only sending to opted-in subscribers",
              "No ALL CAPS words or excessive exclamation marks",
            ].map((item, i) => (
              <p key={i} style={{ margin:"0 0 .25rem", color:"#94a3b8", fontSize:".72rem" }}>□ {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── COLD DM RESULT ── */}
      {result && type === "colddm" && (
        <div style={{ display:"flex", flexDirection:"column" as const, gap:".75rem" }}>
          {result.dms?.map((dm: any, i: number) => (
            <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"12px", padding:"1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:".5rem" }}>
                <div>
                  <span style={{ fontSize:".62rem", fontWeight:800, color:"#06b6d4", textTransform:"uppercase" as const, letterSpacing:".06em", display:"block", marginBottom:".1rem" }}>{dm.situation}</span>
                  <span style={{ fontSize:".6rem", color:"#3f3f46", background:"#0a0a18", border:"1px solid #1a1a2e", padding:".05rem .35rem", borderRadius:"4px" }}>{dm.platform}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                  <span style={{ fontSize:".62rem", fontWeight:700, color:(dm.text?.length||0) > 300 ? "#ef4444" : "#22c55e" }}>
                    {dm.text?.length||0} chars
                  </span>
                  <button onClick={() => copy(dm.text, `dm${i}`)}
                    style={{ background:copied===`dm${i}`?"rgba(6,182,212,.1)":"transparent", border:`1px solid ${copied===`dm${i}`?"rgba(6,182,212,.3)":"#1a1a2e"}`, color:copied===`dm${i}`?"#22c55e":"#52525b", padding:".15rem .55rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit" }}>
                    {copied===`dm${i}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p style={{ color:"#e2e8f0", fontSize:".84rem", lineHeight:1.75, margin:"0 0 .5rem", whiteSpace:"pre-line" as const }}>{dm.text}</p>
              {dm.approach && <p style={{ margin:"0 0 .2rem", color:"#52525b", fontSize:".65rem" }}>Strategy: <span style={{ color:"#3f3f46" }}>{dm.approach}</span></p>}
              {dm.personalization_tip && (
                <p style={{ margin:0, color:"#3f3f46", fontSize:".65rem" }}>🔍 <span style={{ color:"#52525b" }}>{dm.personalization_tip}</span></p>
              )}
            </div>
          ))}
          {result.response_rate_tips?.length > 0 && (
            <div style={{ background:"rgba(6,182,212,.05)", border:"1px solid rgba(6,182,212,.15)", borderRadius:"9px", padding:".7rem .9rem" }}>
              <p style={{ margin:"0 0 .4rem", fontSize:".6rem", fontWeight:800, color:"#06b6d4", textTransform:"uppercase" as const }}>💡 Response Rate Tips</p>
              {result.response_rate_tips.map((t: string, i: number) => (
                <p key={i} style={{ margin:"0 0 .2rem", color:"#94a3b8", fontSize:".72rem" }}>• {t}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── BIO WRITER ───────────────────────────────────────────────────────────────
function BioWriter({ onCreditUsed, onSaveHistory, plan }: any) {
  const [platform, setPlatform] = useState("Instagram");
  const [name, setName]         = useState("");
  const [profession, setProfession] = useState("");
  const [usp, setUsp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [copied, setCopied]     = useState("");

  const PLATFORMS = ["Instagram","LinkedIn","Twitter/X","YouTube","Facebook","WhatsApp Business"];
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  const generate = async () => {
    if (!profession.trim()) return;
    setLoading(true); setResult(null);
    const prompt = `You are a personal branding expert writing high-converting bios for Indian creators and professionals.

Platform: ${platform}
Name: ${name}
Profession/Niche: ${profession}
USP/Achievement: ${usp}

PLATFORM LIMITS:
${platform === "Instagram" ? "Instagram: 150 chars MAX. Emoji ok. End with CTA." : ""}${platform === "LinkedIn" ? "LinkedIn: 220 char headline + 2000 char summary. Professional tone. First line critical." : ""}${platform === "Twitter/X" ? "Twitter/X: 160 chars MAX. Punchy one-liner." : ""}${platform === "YouTube" ? "YouTube: 1000 chars. Include what channel is about + upload schedule + subscribe CTA." : ""}${platform === "Facebook" ? "Facebook: 255 chars. What you do + who you help." : ""}${platform === "Pinterest" ? "Pinterest: 160 chars. What you pin + keywords." : ""}

RULES:
- Open with outcome/identity, not job title
- Specific beats generic (numbers, achievements, niche)
- Natural human tone — not robotic
- Answer: what's in it for the follower?

Write 3 bios with different angles:
1. Professional/Achievement-focused
2. Personality/Story-led
3. Benefit/Outcome for audience

Return ONLY valid JSON:
{
  "bios": [
    {"angle": "Professional", "text": "bio text here", "char_count": 0},
    {"angle": "Personality", "text": "bio text here", "char_count": 0},
    {"angle": "Benefit-led", "text": "bio text here", "char_count": 0}
  ]
}`

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:800 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
      onCreditUsed?.();
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>✍️ Bio Writer</h2>
      <p style={{ color:"#52525b", fontSize:".78rem", margin:"0 0 1.1rem" }}>Professional bios for every platform — platform rules auto-followed.</p>

      <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem", marginBottom:"1rem" }}>
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setPlatform(p)}
            style={{ padding:".3rem .75rem", borderRadius:"7px", border:`1px solid ${platform===p?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:platform===p?"rgba(124,58,237,.12)":"transparent", color:platform===p?"#a855f7":"#52525b", fontWeight:700, fontSize:".7rem", cursor:"pointer", fontFamily:"inherit" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:".65rem", marginBottom:".85rem" }}>
        {[
          { label:"Your Name", val:name, set:setName, placeholder:"e.g. Priya Sharma" },
          { label:"Profession / Role", val:profession, set:setProfession, placeholder:"e.g. Fitness Coach, Digital Marketer, Saree Seller, Travel Blogger..." },
          { label:"Your USP — What makes you different?", val:usp, set:setUsp, placeholder:"e.g. Helping working women lose weight in 30 days, Organic handloom only..." },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label}>
            <label style={{ fontSize:".65rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
              style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit" }} />
          </div>
        ))}
      </div>

      <button onClick={generate} disabled={loading||!profession.trim()}
        style={{ width:"100%", padding:".82rem", borderRadius:"10px", background:!profession.trim()?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:!profession.trim()?"#3f3f46":"#fff", fontWeight:800, fontSize:".88rem", cursor:!profession.trim()?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", marginBottom:"1rem" }}>
        {loading
          ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite" }} /> Writing your bios...</>
          : <><span>✍️ Generate {platform} Bios</span></>
        }
      </button>

      {result && (
        <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
          {(result.bios || []).map((b: any, i: number) => {
            const text = b.text || b || "";
            const angle = b.angle || `Version ${i+1}`;
            const charCount = text.length;
            const limits: Record<string,number> = { Instagram:150, "Twitter/X":160, Facebook:255, Pinterest:160, LinkedIn:220, YouTube:1000 };
            const limit = limits[platform] || 300;
            const isOver = charCount > limit;
            return (
            <div key={i} style={{ background:"#050508", border:`1px solid ${isOver?"rgba(239,68,68,.25)":"#141426"}`, borderRadius:"12px", padding:"1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".5rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                  <span style={{ fontSize:".6rem", fontWeight:800, color:"#a855f7", textTransform:"uppercase" as const, letterSpacing:".06em" }}>{angle}</span>
                </div>
                <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
                  <span style={{ fontSize:".62rem", fontWeight:700, color: isOver ? "#ef4444" : "#22c55e" }}>
                    {charCount}/{limit} chars {isOver ? "⚠ Over limit" : "✓"}
                  </span>
                  <button onClick={() => copy(text, `bio${i}`)}
                    style={{ background: copied===`bio${i}`?"rgba(34,197,94,.1)":"transparent", border:`1px solid ${copied===`bio${i}`?"rgba(34,197,94,.3)":"#1a1a2e"}`, color:copied===`bio${i}`?"#22c55e":"#52525b", padding:".12rem .5rem", borderRadius:"6px", cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit" }}>
                    {copied===`bio${i}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p style={{ color:"#e2e8f0", fontSize:".84rem", lineHeight:1.7, margin:0, whiteSpace:"pre-line" as const }}>{text}</p>
            </div>
          );})}
          {result.keywords && (
            <div style={{ background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.15)", borderRadius:"8px", padding:".65rem .9rem" }}>
              <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .4rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Keywords to use</p>
              <div style={{ display:"flex", flexWrap:"wrap" as const, gap:".35rem" }}>
                {result.keywords.map((k: string, i: number) => (
                  <span key={i} style={{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", color:"#a855f7", fontSize:".68rem", fontWeight:700, padding:".15rem .5rem", borderRadius:"5px" }}>{k}</span>
                ))}
              </div>
            </div>
          )}
          {result.tip && <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.18)", borderRadius:"8px", padding:".65rem .9rem", fontSize:".75rem", color:"#a16207" }}><strong style={{ color:"#fbbf24" }}>💡 Tip:</strong> {result.tip}</div>}
        </div>
      )}
    </div>
  );
}

// ── PRODUCT DESCRIPTION WRITER ───────────────────────────────────────────────
function ProductDescWriter({ onCreditUsed, onSaveHistory, plan }: any) {
  const [platform, setPlatform] = useState("Instagram Shop");
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice]       = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [copied, setCopied]     = useState("");

  const PLATFORMS = ["Instagram Shop","Meesho","Amazon India","Flipkart","WhatsApp Catalogue","Website"];
  const LANGUAGES = ["English","Hindi","Hinglish"];
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  const generate = async () => {
    if (!productName.trim()) return;
    setLoading(true); setResult(null);
    const prompt = `You are an expert e-commerce copywriter for Indian sellers.
Platform: ${platform}
Product: ${productName}
Features/Details: ${features || "Premium quality, best price"}
Price: ${price ? "₹" + price : "Not specified"}
Language: ${language}

Write a complete ${platform} product listing. Follow ${platform}'s specific format:
- Meesho: Short title + simple bullet points + reseller-friendly
- Amazon India: SEO title (under 200 chars) + 5 bullet points + description
- Flipkart: Title + key highlights + description
- Instagram Shop: Hook + description + hashtags
- WhatsApp Catalogue: Short name + description (under 500 chars)
- Website: Full SEO product description

Return ONLY valid JSON:
{
  "title": "optimized product title",
  "description": "main description",
  "bullet_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tip": "one tip for better sales on ${platform}"
}`;

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:900 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
      onCreditUsed?.();
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>🛍️ Product Description Writer</h2>
      <p style={{ color:"#52525b", fontSize:".78rem", margin:"0 0 1.1rem" }}>Meesho, Amazon, Flipkart, Instagram Shop — SEO-optimized listing in seconds.</p>

      <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem", marginBottom:".75rem" }}>
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setPlatform(p)}
            style={{ padding:".28rem .7rem", borderRadius:"7px", border:`1px solid ${platform===p?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:platform===p?"rgba(124,58,237,.12)":"transparent", color:platform===p?"#a855f7":"#52525b", fontWeight:700, fontSize:".68rem", cursor:"pointer", fontFamily:"inherit" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:".4rem", marginBottom:".85rem" }}>
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => setLanguage(l)}
            style={{ flex:1, padding:".35rem", borderRadius:"7px", border:`1px solid ${language===l?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:language===l?"rgba(124,58,237,.12)":"transparent", color:language===l?"#a855f7":"#52525b", fontWeight:700, fontSize:".72rem", cursor:"pointer", fontFamily:"inherit" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:".65rem", marginBottom:".85rem" }}>
        {[
          { label:"Product Name", val:productName, set:setProductName, placeholder:"e.g. Banarasi Silk Saree, Whey Protein 1kg, LED Desk Lamp..." },
          { label:"Key Features", val:features, set:setFeatures, placeholder:"e.g. Pure silk, hand-woven, 5.5 meters, blouse piece included..." },
          { label:"Price (₹)", val:price, set:setPrice, placeholder:"e.g. 1299" },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label}>
            <label style={{ fontSize:".65rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
              style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit" }} />
          </div>
        ))}
      </div>

      <button onClick={generate} disabled={loading||!productName.trim()}
        style={{ width:"100%", padding:".82rem", borderRadius:"10px", background:!productName.trim()?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:!productName.trim()?"#3f3f46":"#fff", fontWeight:800, fontSize:".88rem", cursor:!productName.trim()?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", marginBottom:"1rem" }}>
        {loading
          ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite" }} /> Writing your listing...</>
          : <><span>🛍️ Generate {platform} Listing</span></>
        }
      </button>

      {result && (
        <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
          {[
            { label:"Product Title", value:result.title, key:"title" },
            { label:"Description", value:result.description, key:"desc" },
          ].map(({ label, value, key }) => value && (
            <div key={key} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".85rem 1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".4rem" }}>
                <p style={{ fontSize:".6rem", fontWeight:800, color:"#a855f7", margin:0, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</p>
                <button onClick={() => copy(value, key)} style={{ background:"transparent", border:"1px solid #1a1a2e", color:copied===key?"#22c55e":"#52525b", padding:".1rem .4rem", borderRadius:"5px", cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit" }}>{copied===key?"✓":"Copy"}</button>
              </div>
              <p style={{ color:"#e2e8f0", fontSize:".82rem", lineHeight:1.65, margin:0 }}>{value}</p>
            </div>
          ))}
          {result.bullet_points?.length > 0 && (
            <div style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".85rem 1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".4rem" }}>
                <p style={{ fontSize:".6rem", fontWeight:800, color:"#a855f7", margin:0, textTransform:"uppercase", letterSpacing:".06em" }}>Key Highlights</p>
                <button onClick={() => copy(result.bullet_points.join("\n"), "bullets")} style={{ background:"transparent", border:"1px solid #1a1a2e", color:copied==="bullets"?"#22c55e":"#52525b", padding:".1rem .4rem", borderRadius:"5px", cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit" }}>{copied==="bullets"?"✓":"Copy all"}</button>
              </div>
              {result.bullet_points.map((b: string, i: number) => (
                <div key={i} style={{ display:"flex", gap:".5rem", marginBottom:".3rem" }}>
                  <span style={{ color:"#22c55e", fontSize:".75rem", flexShrink:0 }}>✓</span>
                  <p style={{ color:"#e2e8f0", fontSize:".8rem", margin:0, lineHeight:1.55 }}>{b}</p>
                </div>
              ))}
            </div>
          )}
          {result.hashtags?.length > 0 && (
            <div style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".75rem 1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".4rem" }}>
                <p style={{ fontSize:".6rem", fontWeight:800, color:"#a855f7", margin:0, textTransform:"uppercase", letterSpacing:".06em" }}>Hashtags</p>
                <button onClick={() => copy(result.hashtags.join(" "), "tags")} style={{ background:"transparent", border:"1px solid #1a1a2e", color:copied==="tags"?"#22c55e":"#52525b", padding:".1rem .4rem", borderRadius:"5px", cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit" }}>{copied==="tags"?"✓":"Copy"}</button>
              </div>
              <p style={{ color:"#7c3aed", fontSize:".75rem", lineHeight:1.8, margin:0 }}>{result.hashtags.join(" ")}</p>
            </div>
          )}
          {result.tip && <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.18)", borderRadius:"8px", padding:".65rem .9rem", fontSize:".75rem", color:"#a16207" }}><strong style={{ color:"#fbbf24" }}>💡 Tip:</strong> {result.tip}</div>}
        </div>
      )}
    </div>
  );
}

// ── VIRAL TEMPLATES ──────────────────────────────────────────────────────────
// ── LOCAL BUSINESS KIT (Agency Only) ─────────────────────────────────────────
function LocalBusinessKit({ plan, onUpgrade }: any) {
  const isUnlocked = plan === "agency";

  // Use refs for inputs to avoid re-render on each keystroke
  const bizNameRef   = useRef<HTMLInputElement>(null);
  const cityRef      = useRef<HTMLInputElement>(null);
  const areaRef      = useRef<HTMLInputElement>(null);
  const zipRef       = useRef<HTMLInputElement>(null);
  const phoneRef     = useRef<HTMLInputElement>(null);
  const websiteRef   = useRef<HTMLInputElement>(null);
  const estYearRef   = useRef<HTMLInputElement>(null);
  const uspRef       = useRef<HTMLTextAreaElement>(null);
  const hoursRef     = useRef<HTMLInputElement>(null);

  const [subCat,      setSubCat]      = useState("");
  const [category,    setCategory]    = useState("");
  const [priceRange,  setPriceRange]  = useState("Affordable");
  const [step,        setStep]        = useState<1|2>(1);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<any>(null);
  const [copied,      setCopied]      = useState("");
  const [openSec,     setOpenSec]     = useState("description");
  const [catSearch,   setCatSearch]   = useState("");
  const [showCatDrop, setShowCatDrop] = useState(false);

  const CATEGORIES: Record<string, string[]> = {
    "🛒 Retail & E-Commerce":    ["Clothing & Apparel Store","Saree & Ethnic Wear","Footwear Store","Jewellery & Accessories","Electronics & Gadgets Shop","Mobile Store & Accessories","Computer & IT Accessories","Sports & Fitness Equipment","Toy & Baby Products","Home Decor & Furniture","Books & Stationery","Gift & Craft Store","Optical Store","Watch & Timepiece Shop","Luggage & Travel Accessories","Grocery & Kirana Store","Medical & Pharma Store"],
    "🍽️ Food & Beverage":        ["Restaurant","Cafe & Coffee Shop","Fast Food & Snacks","Bakery & Confectionery","Sweet Shop & Mithai","Juice & Health Bar","Cloud Kitchen / Tiffin Service","Catering Service","Dhaba","Bar & Lounge","Ice Cream Parlour","Pizza & Burger Outlet","Biryani & Non-Veg Restaurant"],
    "💅 Beauty & Wellness":       ["Hair Salon (Unisex)","Ladies Beauty Parlour","Barbershop & Men's Salon","Spa & Massage Centre","Nail Studio","Skin & Dermatology Clinic","Tattoo Studio","Makeup Artist","Mehndi Artist","Bridal Makeup Studio"],
    "🏋️ Health & Fitness":        ["Gym & Fitness Centre","Yoga Studio","Zumba & Dance Studio","Swimming Academy","Martial Arts Academy","CrossFit Box","Sports Academy","Physiotherapy Clinic","Dietitian & Nutrition Clinic","Ayurvedic Wellness Centre"],
    "🏥 Medical & Healthcare":    ["General Physician Clinic","Dental Clinic","Eye Clinic & Optometrist","Orthopaedic Clinic","Paediatric Clinic","Gynaecology Clinic","Homeopathy Clinic","Pharmacy & Medical Store","Diagnostic Lab & Pathology","Veterinary Clinic","Nursing Home","Blood Bank"],
    "💻 IT & Technology":         ["Software Development Company","Web Design & Development","Mobile App Development","Digital Marketing Agency","SEO & Content Agency","Social Media Marketing Agency","Graphic Design Studio","UI/UX Design Agency","IT Support & Maintenance","Cloud & Networking Services","Cybersecurity Services","E-Commerce Solutions","ERP & Software Consulting","Data Analytics & AI Services","Computer Repair & Service","CCTV & Security Systems"],
    "📚 Education & Coaching":    ["School (K-12)","College & University","Coaching Institute","Tuition Centre","Online Learning Platform","Spoken English Classes","Computer Training Institute","Music Academy","Dance Academy","Driving School","Vocational Training Centre","MBA & Professional Courses","UPSC & Competitive Exam Coaching"],
    "🏠 Home & Real Estate":      ["Real Estate Agency","Property Dealer","Interior Design Studio","Architecture Firm","Home Renovation & Construction","Plumbing & Electrical Services","Painting & Waterproofing","Pest Control Services","Packers & Movers","Cleaning & Housekeeping Services","HVAC & AC Services","Carpentry & Modular Kitchen","Solar Panel Installation"],
    "🚗 Automotive":              ["Car Dealership (New)","Used Car Dealer","Car Service & Workshop","Two-Wheeler Showroom","Bike Service Centre","Car Wash & Detailing","Tyre & Wheel Alignment","Auto Spare Parts","EV & CNG Conversion","Car Rental & Cab Service","Automobile Accessories"],
    "⚖️ Professional Services":   ["Chartered Accountant (CA)","Tax Consultant & GST Filing","Law Firm & Advocate","Company Registration","HR & Payroll Consulting","Business Consultant","Financial Planning & Investment","Insurance Agency","Import Export Consultant"],
    "✈️ Travel & Hospitality":    ["Travel Agency & Tour Operator","Hotel & Lodge","Homestay & Guesthouse","Resort & Retreat","Visa Assistance","Cab & Transport Service","Car Rental","Event Venue & Banquet Hall","Trekking & Adventure Tours"],
    "📸 Creative & Media":        ["Photography Studio","Videography & Film Production","Wedding Photographer","Printing & Branding Studio","Video Editing Services","Animation & Motion Graphics","Advertising Agency","Content Creation Studio","PR & Communications"],
    "🎉 Events & Entertainment":  ["Event Management Company","Wedding Planner","Catering & Decorations","DJ & Sound Systems","Kids Party Organiser","Corporate Event Planner","Balloon & Flower Decoration","Tent & Lighting Rentals"],
    "🔧 Repair & Services":       ["Mobile Repair Shop","Laptop & Computer Repair","AC & Appliance Repair","Water Purifier Service","Refrigerator & Washing Machine Repair","Generator & UPS Service","Inverter & Battery Shop"],
    "📦 Logistics & Supply":      ["Courier & Delivery Service","Warehouse & Storage","Freight & Cargo","Packers & Movers","Last-Mile Delivery","Import & Export Firm"],
  };

  const ALL_SUBS = Object.entries(CATEGORIES).flatMap(([cat, subs]) => subs.map(s => ({ cat, sub: s })));
  const filteredSubs = catSearch.trim()
    ? ALL_SUBS.filter(({ sub }) => sub.toLowerCase().includes(catSearch.toLowerCase()))
    : ALL_SUBS;

  const PRICE_RANGES = ["Budget-Friendly","Affordable","Mid-Range","Premium","Luxury"];
  const HOURS_PRESETS = ["Mon-Sat 9am-6pm","Mon-Sat 10am-8pm","Mon-Sun 8am-10pm","24 Hours / 7 Days","Mon-Fri 9am-5pm","Appointment Only"];

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (!isUnlocked) return (
    <div style={{ background:"#080810", border:"1px solid rgba(245,158,11,.2)", borderRadius:"20px", padding:"2.5rem 2rem", textAlign:"center" }}>
      <div style={{ fontSize:"3rem", marginBottom:".75rem" }}>🏪</div>
      <h2 style={{ fontWeight:900, fontSize:"1.15rem", color:"#fff", margin:"0 0 .5rem" }}>Local Business Kit</h2>
      <p style={{ color:"#52525b", fontSize:".82rem", lineHeight:1.75, maxWidth:360, margin:"0 auto 1rem" }}>
        Complete Google Business Profile optimization — description, posts, FAQs, review templates, local SEO keywords, hashtags and checklist. Free to use.
      </p>
      <div style={{ background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.2)", borderRadius:"12px", padding:".85rem 1.1rem", marginBottom:"1.5rem", maxWidth:340, margin:"0 auto 1.5rem" }}>
        <p style={{ color:"#f59e0b", fontWeight:800, fontSize:".82rem", margin:"0 0 .2rem" }}>👑 Agency Plan Exclusive</p>
        <p style={{ color:"#a16207", fontSize:".72rem", margin:0 }}>Available only with Agency plan — ₹5,999.99/month</p>
      </div>
      <button onClick={onUpgrade} style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", border:"none", color:"#000", padding:".8rem 2rem", borderRadius:"12px", fontWeight:800, cursor:"pointer", fontSize:".9rem" }}>
        Upgrade to Agency →
      </button>
    </div>
  );

  const handleGenerate = async () => {
    const bizName  = bizNameRef.current?.value.trim() || "";
    const city     = cityRef.current?.value.trim() || "";
    const area     = areaRef.current?.value.trim() || "";
    const zipCode  = zipRef.current?.value.trim() || "";
    const phone    = phoneRef.current?.value.trim() || "";
    const website  = websiteRef.current?.value.trim() || "";
    const estYear  = estYearRef.current?.value.trim() || "";
    const usp      = uspRef.current?.value.trim() || "";
    const hours    = hoursRef.current?.value.trim() || "Mon-Sat 10am-7pm";

    if (!bizName || !subCat || !city) return;

    setLoading(true); setResult(null);
    const locationStr = [area, city, zipCode].filter(Boolean).join(", ");

    const prompt = `You are India's top local SEO expert. Create a COMPLETE, PROFESSIONAL Google Business optimization kit.

BUSINESS:
- Name: ${bizName}
- Category: ${subCat}
- Location: ${locationStr}
- Phone: ${phone || "Not provided"}
- Website: ${website || "Not provided"}
- Hours: ${hours}
- Price Range: ${priceRange}
- USP: ${usp || "Quality products and excellent service"}
- ${estYear ? "Established: " + estYear : ""}

RULES:
1. Everything specific to ${bizName} — no generic filler
2. Use ${city}${area ? ", " + area : ""}${zipCode ? " PIN " + zipCode : ""} naturally for local SEO
3. Description: exactly 700-750 characters
4. Professional Indian business tone throughout
5. Hashtags: hyper-local with area/city/ZIP

Return ONLY valid JSON:
{
  "description": "700-750 char Google Business description",
  "tagline": "Tagline under 60 chars",
  "posts": [
    { "type": "Offer", "emoji": "🎉", "title": "...", "content": "...", "cta": "Call Now" },
    { "type": "Why Choose Us", "emoji": "⭐", "title": "...", "content": "...", "cta": "Visit Us" },
    { "type": "Product/Service", "emoji": "🏆", "title": "...", "content": "...", "cta": "Learn More" },
    { "type": "Seasonal", "emoji": "🎊", "title": "...", "content": "...", "cta": "Book Now" },
    { "type": "Announcement", "emoji": "📢", "title": "...", "content": "...", "cta": "Contact Us" }
  ],
  "faqs": [
    { "q": "question customers ask", "a": "helpful answer" }
  ],
  "review_templates": {
    "five_star": "personalised thank you mentioning ${bizName}",
    "three_star": "empathetic response with resolution offer and phone",
    "one_star": "professional apology with solution and direct contact"
  },
  "keywords": {
    "primary": ["3 main searches with city"],
    "secondary": ["5 supporting with locality"],
    "long_tail": ["4 full question-style searches"],
    "near_me": ["3 near me phrases with area/PIN"]
  },
  "hashtags": {
    "local": ["#${city.replace(/\s+/g,"")}","#${(area||city).replace(/\s+/g,"")}Business","#${zipCode||city.replace(/\s+/g,"")}","#${city.replace(/\s+/g,"")}Local","#${city.replace(/\s+/g,"")}${subCat.split(" ")[0].replace(/[^a-zA-Z]/g,"")}"],
    "category": ["5 business-type hashtags like #DigitalMarketing #ITServices"],
    "reach": ["#IndianBusiness","#LocalBusiness","#SupportLocal","#MadeInIndia","#SmallBusinessIndia"]
  },
  "attributes": ["4-5 Google attributes to enable e.g. Free parking, Wheelchair accessible"],
  "checklist": [
    { "step": 1, "action": "action title", "detail": "specific instruction", "time": "2 min" }
  ],
  "pro_tips": ["3 tips specific to ${subCat} in ${city}"]
}
Generate exactly 10 FAQs and 12 checklist steps.`;

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: 3000 })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setStep(2);
    } catch { }
    setLoading(false);
  };

  const Section = ({ id, label, emoji, badge, children }: any) => (
    <div style={{ background:"#080810", border:`1px solid ${openSec===id?"rgba(245,158,11,.4)":"#141426"}`, borderRadius:"14px", marginBottom:".6rem", overflow:"hidden", transition:"border-color .2s" }}>
      <button onClick={() => setOpenSec(openSec===id?"":id)}
        style={{ width:"100%", background:openSec===id?"rgba(245,158,11,.04)":"none", border:"none", padding:"1rem 1.1rem", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", gap:".5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <span style={{ fontSize:"1.1rem" }}>{emoji}</span>
          <span style={{ color:"#fff", fontWeight:700, fontSize:".85rem" }}>{label}</span>
          {badge && <span style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.22)", color:"#f59e0b", fontSize:".55rem", fontWeight:800, padding:".08rem .4rem", borderRadius:"5px" }}>{badge}</span>}
        </div>
        <span style={{ color:"#f59e0b", fontSize:".75rem", display:"inline-block", transform:openSec===id?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
      </button>
      {openSec === id && (
        <div style={{ padding:"0 1.1rem 1.1rem", borderTop:"1px solid #141426" }}>
          <div style={{ paddingTop:".85rem" }}>{children}</div>
        </div>
      )}
    </div>
  );

  const CopyBtn = ({ value, keyName }: any) => (
    <button onClick={() => copy(value, keyName)}
      style={{ background:copied===keyName?"rgba(34,197,94,.1)":"rgba(255,255,255,.04)", border:`1px solid ${copied===keyName?"rgba(34,197,94,.3)":"#1a1a2e"}`, color:copied===keyName?"#22c55e":"#52525b", padding:".15rem .55rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit", flexShrink:0, whiteSpace:"nowrap" }}>
      {copied===keyName ? "✓ Copied" : "Copy"}
    </button>
  );

  // Stable input style — no state-driven className to avoid re-render flicker
  const iStyle: React.CSSProperties = { width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".6rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"'Inter',sans-serif", outline:"none" };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:"1.25rem" }}>
        <div style={{ width:38, height:38, borderRadius:"10px", background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>🏪</div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:0 }}>Local Business Kit</h2>
          <p style={{ color:"#52525b", fontSize:".72rem", margin:0 }}>Google Business Profile — complete optimization kit</p>
        </div>
        <span style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", color:"#22c55e", fontSize:".6rem", fontWeight:800, padding:".15rem .55rem", borderRadius:"6px" }}>FREE</span>
      </div>

      {/* Step bar */}
      <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"1.25rem" }}>
        {["Business Info","Your Kit"].map((l, i) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:".4rem", flex: i===0 ? "none" : 1 }}>
            {i === 1 && <div style={{ flex:1, height:"1px", background: step > 1 ? "#f59e0b" : "#1a1a2e" }} />}
            <div style={{ width:22, height:22, borderRadius:"50%", background: step > i ? "linear-gradient(135deg,#f59e0b,#d97706)" : step===i+1 ? "rgba(245,158,11,.15)" : "#0d0d18", border:`1px solid ${step >= i+1 ? "#f59e0b" : "#1a1a2e"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".6rem", fontWeight:800, color: step > i ? "#000" : step===i+1 ? "#f59e0b" : "#3f3f46", flexShrink:0 }}>
              {step > i ? "✓" : i+1}
            </div>
            <span style={{ fontSize:".7rem", fontWeight:600, color: step===i+1 ? "#f59e0b" : "#3f3f46", whiteSpace:"nowrap" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:"16px", padding:"1.4rem" }}>

          {/* Category Searchable Dropdown */}
          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".35rem", textTransform:"uppercase", letterSpacing:".06em" }}>
              Business Category <span style={{ color:"#ef4444" }}>*</span>
            </label>
            <div style={{ position:"relative" }}>
              <input
                value={catSearch || subCat}
                onChange={e => { setCatSearch(e.target.value); setShowCatDrop(true); if (!e.target.value) setSubCat(""); }}
                onFocus={() => setShowCatDrop(true)}
                placeholder="Search or select category..."
                style={{ ...iStyle, paddingRight:"2rem" }}
              />
              <span style={{ position:"absolute", right:".75rem", top:"50%", transform:"translateY(-50%)", color:"#52525b", pointerEvents:"none" }}>▾</span>

              {showCatDrop && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#0a0a14", border:"1px solid rgba(245,158,11,.3)", borderRadius:"12px", zIndex:200, maxHeight:280, overflowY:"auto", boxShadow:"0 12px 40px rgba(0,0,0,.7)" }}>
                  {Object.entries(CATEGORIES).map(([cat, subs]) => {
                    const visible = subs.filter(s => !catSearch.trim() || s.toLowerCase().includes(catSearch.toLowerCase()));
                    if (!visible.length) return null;
                    return (
                      <div key={cat}>
                        <div style={{ padding:".5rem .85rem .2rem", fontSize:".58rem", fontWeight:800, color:"#3f3f46", letterSpacing:".08em", textTransform:"uppercase", position:"sticky", top:0, background:"#0a0a14" }}>{cat}</div>
                        {visible.map(sub => (
                          <button key={sub} onClick={() => { setSubCat(sub); setCategory(cat); setCatSearch(""); setShowCatDrop(false); }}
                            style={{ width:"100%", background:subCat===sub?"rgba(245,158,11,.1)":"transparent", border:"none", padding:".55rem .85rem", textAlign:"left", color:subCat===sub?"#f59e0b":"#94a3b8", fontSize:".8rem", cursor:"pointer", fontFamily:"inherit", fontWeight:subCat===sub?700:400, display:"block" }}
                            onMouseEnter={e => { if (subCat!==sub) e.currentTarget.style.background="rgba(255,255,255,.04)"; e.currentTarget.style.color="#fff"; }}
                            onMouseLeave={e => { if (subCat!==sub) e.currentTarget.style.background="transparent"; e.currentTarget.style.color=subCat===sub?"#f59e0b":"#94a3b8"; }}>
                            {sub}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  {filteredSubs.length === 0 && <p style={{ color:"#3f3f46", padding:"1rem", textAlign:"center", fontSize:".78rem" }}>No results found</p>}
                </div>
              )}
            </div>
            {subCat && !showCatDrop && (
              <div style={{ marginTop:".4rem", display:"flex", alignItems:"center", gap:".4rem" }}>
                <span style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.25)", color:"#f59e0b", fontSize:".7rem", fontWeight:700, padding:".15rem .55rem", borderRadius:"6px" }}>✓ {subCat}</span>
                <button onClick={() => { setSubCat(""); setCatSearch(""); }}
                  style={{ background:"none", border:"none", color:"#3f3f46", cursor:"pointer", fontSize:".65rem", fontFamily:"inherit" }}>✕ Change</button>
              </div>
            )}
          </div>

          {/* Close dropdown on outside click */}
          {showCatDrop && <div style={{ position:"fixed", inset:0, zIndex:199 }} onClick={() => setShowCatDrop(false)} />}

          {/* Fields — using uncontrolled refs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".7rem", marginBottom:".7rem" }}>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Business Name <span style={{ color:"#ef4444" }}>*</span></label>
              <input ref={bizNameRef} defaultValue="" placeholder="e.g. Sharma Digital Agency" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>City <span style={{ color:"#ef4444" }}>*</span></label>
              <input ref={cityRef} defaultValue="" placeholder="e.g. Delhi, Mumbai" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Area / Locality</label>
              <input ref={areaRef} defaultValue="" placeholder="e.g. Chandni Chowk, Bandra" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>PIN / ZIP Code</label>
              <input ref={zipRef} defaultValue="" placeholder="e.g. 110001" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Phone Number</label>
              <input ref={phoneRef} defaultValue="" placeholder="+91 98XXXXXXXX" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Website</label>
              <input ref={websiteRef} defaultValue="" placeholder="yourwebsite.com" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Established Year</label>
              <input ref={estYearRef} defaultValue="" placeholder="e.g. 2010" style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>Price Range</label>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
                style={{ ...iStyle }}>
                {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Hours */}
          <div style={{ marginBottom:".75rem" }}>
            <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".35rem", textTransform:"uppercase", letterSpacing:".06em" }}>Working Hours</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem", marginBottom:".4rem" }}>
              {HOURS_PRESETS.map(h => (
                <button key={h} onClick={() => { if (hoursRef.current) hoursRef.current.value = h; }}
                  style={{ padding:".25rem .6rem", borderRadius:"6px", border:"1px solid #1a1a2e", background:"transparent", color:"#52525b", fontSize:".68rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#f59e0b"; e.currentTarget.style.color="#f59e0b"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#1a1a2e"; e.currentTarget.style.color="#52525b"; }}>
                  {h}
                </button>
              ))}
            </div>
            <input ref={hoursRef} defaultValue="" placeholder="e.g. Mon-Sat 10am-8pm, Sunday Closed" style={iStyle} />
          </div>

          {/* USP */}
          <div style={{ marginBottom:"1.1rem" }}>
            <label style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", display:"block", marginBottom:".28rem", textTransform:"uppercase", letterSpacing:".06em" }}>What Makes You Special?</label>
            <textarea ref={uspRef} rows={2}
              defaultValue=""
              placeholder="e.g. 10 years experience, free home delivery, 500+ happy clients, certified professionals..."
              style={{ ...iStyle, resize:"none", minHeight:68 }} />
          </div>

          <button onClick={handleGenerate} disabled={loading || !subCat}
            style={{ width:"100%", padding:".9rem", borderRadius:"12px", background:!subCat?"#0d0d18":"linear-gradient(135deg,#f59e0b,#d97706)", border:"none", color:!subCat?"#3f3f46":"#000", fontWeight:800, fontSize:".9rem", cursor:!subCat?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem" }}>
            {loading
              ? <><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,.3)",borderTop:"2px solid #000",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0 }} /> Generating your complete kit...</>
              : <>🏪 Generate Business Kit →</>
            }
          </button>
          {!subCat && <p style={{ color:"#3f3f46", fontSize:".65rem", textAlign:"center", margin:".4rem 0 0" }}>Select a business category to continue</p>}
        </div>
      )}

      {/* ── STEP 2 — Results ── */}
      {step === 2 && result && (
        <div style={{ animation:"slideUp .4s ease" }}>
          <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.2)", borderRadius:"12px", padding:".85rem 1.1rem", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:".5rem" }}>
            <div>
              <p style={{ color:"#f59e0b", fontWeight:800, fontSize:".88rem", margin:"0 0 .15rem" }}>✅ {result.tagline || subCat}</p>
              <p style={{ color:"#52525b", fontSize:".7rem", margin:0 }}>{subCat}</p>
            </div>
            <button onClick={() => { setStep(1); setResult(null); }}
              style={{ background:"transparent", border:"1px solid #1a1a2e", color:"#52525b", padding:".28rem .7rem", borderRadius:"7px", cursor:"pointer", fontSize:".7rem", fontWeight:600, fontFamily:"inherit" }}>← Edit</button>
          </div>

          {/* Description */}
          <Section id="description" label="Google Business Description" emoji="📝" badge={`${result.description?.length||0}/750`}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".4rem" }}>
              <span style={{ fontSize:".62rem", color:"#3f3f46" }}>Edit Profile → Description</span>
              <CopyBtn value={result.description} keyName="desc" />
            </div>
            <p style={{ color:"#e2e8f0", fontSize:".82rem", lineHeight:1.8, margin:0, background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".85rem 1rem" }}>{result.description}</p>
          </Section>

          {/* Posts */}
          <Section id="posts" label="5 Google Posts" emoji="📢" badge="Ready to publish">
            <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
              {result.posts?.map((post: any, i: number) => (
                <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".85rem 1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".35rem" }}>
                    <span style={{ fontSize:".88rem" }}>{post.emoji} <span style={{ fontSize:".62rem", fontWeight:800, color:"#f59e0b", textTransform:"uppercase" }}>{post.type}</span></span>
                    <CopyBtn value={`${post.title}

${post.content}`} keyName={`post${i}`} />
                  </div>
                  <p style={{ color:"#fff", fontWeight:700, fontSize:".82rem", margin:"0 0 .3rem" }}>{post.title}</p>
                  <p style={{ color:"#94a3b8", fontSize:".78rem", lineHeight:1.65, margin:"0 0 .4rem" }}>{post.content}</p>
                  <span style={{ background:"rgba(109,40,217,.08)", border:"1px solid rgba(109,40,217,.2)", color:"#a855f7", fontSize:".62rem", fontWeight:700, padding:".1rem .45rem", borderRadius:"5px" }}>CTA: {post.cta}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* FAQ */}
          <Section id="faq" label="10 Customer FAQs" emoji="❓">
            <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
              {result.faqs?.map((faq: any, i: number) => (
                <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".75rem 1rem", display:"flex", gap:".6rem" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#fff", fontWeight:700, fontSize:".77rem", margin:"0 0 .2rem" }}>Q: {faq.q}</p>
                    <p style={{ color:"#94a3b8", fontSize:".75rem", lineHeight:1.6, margin:0 }}>A: {faq.a}</p>
                  </div>
                  <CopyBtn value={faq.a} keyName={`faq${i}`} />
                </div>
              ))}
            </div>
          </Section>

          {/* Review Templates */}
          <Section id="reviews" label="Review Response Templates" emoji="⭐">
            {[
              { key:"five_star",  stars:"⭐⭐⭐⭐⭐", label:"5-Star",  color:"#22c55e" },
              { key:"three_star", stars:"⭐⭐⭐",     label:"3-Star",  color:"#f59e0b" },
              { key:"one_star",   stars:"⭐",         label:"1-Star",  color:"#ef4444" },
            ].map(({ key, stars, label, color }) => (
              <div key={key} style={{ background:"#050508", border:`1px solid ${color}18`, borderRadius:"10px", padding:".85rem 1rem", marginBottom:".5rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".4rem" }}>
                  <span style={{ color, fontWeight:800, fontSize:".72rem" }}>{stars} {label}</span>
                  <CopyBtn value={result.review_templates?.[key]} keyName={`rev_${key}`} />
                </div>
                <p style={{ color:"#e2e8f0", fontSize:".8rem", lineHeight:1.7, margin:0 }}>{result.review_templates?.[key]}</p>
              </div>
            ))}
            <p style={{ color:"#3f3f46", fontSize:".65rem", margin:".25rem 0 0", textAlign:"center" }}>Replace [Name] with reviewer's actual name before posting</p>
          </Section>

          {/* Keywords */}
          <Section id="keywords" label="Local SEO Keywords" emoji="🔑">
            {[
              { key:"primary",   label:"Primary",   color:"#a855f7" },
              { key:"secondary", label:"Secondary", color:"#06b6d4" },
              { key:"long_tail", label:"Long-Tail", color:"#22c55e" },
              { key:"near_me",   label:"Near Me",   color:"#f59e0b" },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ marginBottom:".7rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".32rem" }}>
                  <span style={{ fontSize:".6rem", fontWeight:800, color, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</span>
                  <CopyBtn value={(result.keywords?.[key]||[]).join(", ")} keyName={`kw_${key}`} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                  {(result.keywords?.[key]||[]).map((kw: string, i: number) => (
                    <span key={i} style={{ background:`${color}10`, border:`1px solid ${color}22`, color, fontSize:".7rem", fontWeight:600, padding:".18rem .55rem", borderRadius:"6px" }}>{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* Hashtags */}
          <Section id="hashtags" label="Local Hashtags" emoji="#️⃣" badge="ZIP + Category + Reach">
            {[
              { key:"local",    label:"📍 Local Area",    color:"#f59e0b" },
              { key:"category", label:"🏪 Business Type", color:"#a855f7" },
              { key:"reach",    label:"🌐 Broad Reach",   color:"#06b6d4" },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ marginBottom:".75rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".32rem" }}>
                  <span style={{ fontSize:".62rem", fontWeight:800, color }}>{label}</span>
                  <CopyBtn value={(result.hashtags?.[key]||[]).join(" ")} keyName={`ht_${key}`} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                  {(result.hashtags?.[key]||[]).map((tag: string, i: number) => (
                    <button key={i} onClick={() => copy(tag, `htag_${i}_${key}`)}
                      style={{ background:`${color}08`, border:`1px solid ${color}20`, color, fontSize:".72rem", fontWeight:700, padding:".18rem .55rem", borderRadius:"6px", cursor:"pointer", fontFamily:"inherit" }}>
                      {copied===`htag_${i}_${key}` ? "✓" : tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* Attributes */}
          {result.attributes?.length > 0 && (
            <Section id="attributes" label="Google Business Attributes" emoji="✔️" badge="Enable in profile">
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                {result.attributes.map((attr: string, i: number) => (
                  <span key={i} style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", color:"#22c55e", fontSize:".75rem", fontWeight:600, padding:".25rem .7rem", borderRadius:"7px" }}>✓ {attr}</span>
                ))}
              </div>
              <p style={{ color:"#3f3f46", fontSize:".65rem", margin:".5rem 0 0" }}>Edit Profile → More → Attributes → enable these</p>
            </Section>
          )}

          {/* Checklist */}
          <Section id="checklist" label="Setup Checklist" emoji="📋" badge="12 steps · ~30 min">
            <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
              {result.checklist?.map((item: any, i: number) => (
                <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"10px", padding:".7rem 1rem", display:"flex", gap:".65rem", alignItems:"flex-start" }}>
                  <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:".62rem",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:".05rem" }}>{item.step}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#fff", fontWeight:700, fontSize:".78rem", margin:"0 0 .15rem" }}>{item.action}</p>
                    <p style={{ color:"#71717a", fontSize:".72rem", margin:"0 0 .15rem", lineHeight:1.5 }}>{item.detail}</p>
                    <span style={{ fontSize:".6rem", color:"#f59e0b", fontWeight:700 }}>⏱ {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Pro Tips */}
          {result.pro_tips && (
            <div style={{ background:"rgba(245,158,11,.04)", border:"1px solid rgba(245,158,11,.15)", borderRadius:"14px", padding:"1rem 1.1rem", marginTop:".5rem" }}>
              <p style={{ fontSize:".65rem", fontWeight:800, color:"#f59e0b", margin:"0 0 .65rem", letterSpacing:".08em", textTransform:"uppercase" }}>💡 Pro Tips</p>
              {result.pro_tips.map((tip: string, i: number) => (
                <div key={i} style={{ display:"flex", gap:".5rem", marginBottom:".4rem" }}>
                  <span style={{ color:"#f59e0b", fontWeight:800, fontSize:".7rem", flexShrink:0 }}>{i+1}.</span>
                  <p style={{ color:"#94a3b8", fontSize:".76rem", lineHeight:1.6, margin:0 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setStep(1); setResult(null); setCatSearch(""); setSubCat(""); }}
            style={{ width:"100%", padding:".7rem", borderRadius:"10px", background:"transparent", border:"1px solid rgba(245,158,11,.2)", color:"#f59e0b", fontWeight:700, fontSize:".8rem", cursor:"pointer", fontFamily:"inherit", marginTop:".75rem" }}>
            🔄 Generate for Another Business
          </button>
        </div>
      )}
    </div>
  );
}

function ViralTemplates({ niche, platform, onCreditUsed, onSaveHistory }: any) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customNiche, setCustomNiche] = useState(niche || "");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any[]>([]);
  const [copied, setCopied]     = useState("");

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  const TEMPLATES = [
    { id:0, icon:"📈", label:"X to Y Journey",    formula:"I went from [X] to [Y] in [Z days]. Here's exactly what I did.",     example:"I went from 0 to 10K followers in 90 days. Here's exactly what I did.", where:"Instagram Reel caption, YouTube description, LinkedIn post" },
    { id:1, icon:"🤫", label:"Nobody Talks About", formula:"Nobody talks about [uncomfortable truth in your niche] — but they should.",  example:"Nobody talks about how much time creators waste on production — but they should.", where:"Instagram Reel hook, Twitter/X post, LinkedIn" },
    { id:2, icon:"🔄", label:"Stop/Start",         formula:"Stop doing [wrong thing]. Start doing [right thing] instead.",         example:"Stop writing generic captions. Start writing platform-specific hooks instead.", where:"Instagram carousel, Reel caption, Facebook post" },
    { id:3, icon:"📋", label:"3 Things I Wish",    formula:"3 things I wish I knew before [starting/doing X]:",                   example:"3 things I wish I knew before starting my Instagram page:", where:"Instagram carousel, YouTube video title, LinkedIn" },
    { id:4, icon:"🎯", label:"Unpopular Opinion",  formula:"Unpopular opinion: [contrarian take on your niche].",                  example:"Unpopular opinion: Posting more frequently is why your reach is declining.", where:"Twitter/X, Instagram Reel, LinkedIn — high engagement" },
    { id:5, icon:"⚡", label:"Before/After",        formula:"Before: [painful situation]. After: [transformation]. Here's what changed:", example:"Before: 3 hours to make one reel. After: 10 minutes. Here's what changed:", where:"Instagram Reel, Facebook ad, Landing page" },
    { id:6, icon:"💡", label:"How I [Result]",      formula:"How I [achieved result] with [simple method/tool].",                  example:"How I planned 30 days of content in under 5 minutes.", where:"YouTube title, Instagram Reel caption, Blog post" },
    { id:7, icon:"🔑", label:"Truth Nobody Tells",  formula:"The [niche] truth nobody tells you:",                                 example:"The content creation truth nobody tells you:", where:"Instagram Reel, YouTube Short, Twitter/X thread" },
    { id:8, icon:"🧵", label:"Thread Starter",      formula:"[Bold claim]. A thread 🧵",                                           example:"I analyzed 500 viral Indian reels. Here's the pattern. A thread 🧵", where:"Twitter/X thread, LinkedIn carousel" },
    { id:9, icon:"❓", label:"Ask Me Anything",      formula:"I've been [doing X] for [Y years]. Ask me anything 👇",               example:"I've been creating content for 3 years. Ask me anything 👇", where:"Instagram Story, LinkedIn post, community engagement" },
    { id:10, icon:"😮", label:"Confession",          formula:"Confession: I [did something unexpected/vulnerable] and it [result].", example:"Confession: I didn't post for 30 days and my engagement actually went up.", where:"Instagram Reel, YouTube vlog, authentic storytelling" },
    { id:11, icon:"📊", label:"Data/Stats Hook",    formula:"[Specific number] [surprising stat about your niche]. Here's why:",   example:"80% of Indian creators quit in 6 months. Here's why:", where:"LinkedIn, Twitter/X, Instagram carousel, ads" },
  ];

  const generate = async () => {
    if (selected === null || !customNiche.trim()) return;
    setLoading(true); setResult([]);
    const template = TEMPLATES[selected];
    const plat = platform || "Instagram";
    const prompt = `You are a viral content expert for Indian social media. Generate 5 complete, ready-to-post content pieces using this viral template for ${customNiche} niche on ${plat}.

Template: "${template.formula}"

IMPORTANT RULES:
- Each variation must be COMPLETE and READY TO POST (not just a hook line)
- Include: Hook line + 2-4 body lines + CTA
- Make it specific to ${customNiche} niche
- Indian audience, relatable tone
- Write naturally for Indian audience
- Each should be 4-8 lines total

Return ONLY a valid JSON array of 5 objects:
[
  {
    "hook": "The opening line (most important)",
    "body": "2-4 lines of content body",
    "cta": "Call to action line",
    "full": "Complete post ready to copy"
  }
]`;

    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }], max_tokens:1500 })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
      onCreditUsed?.();
      onSaveHistory?.("templates", { inputSummary: `${template.label}: ${customNiche}`, resultData: { variations: parsed } });
    } catch { setResult([]); }
    setLoading(false);
  };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>🎯 Viral Post Templates</h2>
      <p style={{ color:"#52525b", fontSize:".78rem", margin:"0 0 1rem" }}>12 proven viral formats → complete ready-to-post content. Pick template → add your niche → get 5 full posts.</p>

      {/* Template grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".4rem", marginBottom:"1rem" }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => { setSelected(t.id); setResult([]); }}
            style={{ padding:".55rem .4rem", borderRadius:"9px", border:`1px solid ${selected===t.id?"rgba(124,58,237,.45)":"#1a1a2e"}`, background:selected===t.id?"rgba(124,58,237,.12)":"#080810", cursor:"pointer", fontFamily:"inherit", transition:"all .15s", textAlign:"center" as const }}>
            <div style={{ fontSize:"1.1rem", marginBottom:".2rem" }}>{t.icon}</div>
            <div style={{ fontSize:".6rem", fontWeight: selected===t.id?800:600, color:selected===t.id?"#c4b5fd":"#52525b", lineHeight:1.3 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"10px", padding:".75rem 1rem", marginBottom:".85rem" }}>
          <p style={{ fontSize:".6rem", fontWeight:800, color:"#6d28d9", margin:"0 0 .3rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Formula</p>
          <p style={{ color:"#a1a1aa", fontSize:".8rem", margin:"0 0 .4rem", fontStyle:"italic", lineHeight:1.6 }}>"{TEMPLATES[selected].formula}"</p>
          <p style={{ fontSize:".6rem", fontWeight:700, color:"#3f3f46", margin:"0 0 .2rem" }}>Example output:</p>
          <p style={{ color:"#52525b", fontSize:".76rem", margin:"0 0 .4rem", lineHeight:1.55 }}>{TEMPLATES[selected].example}</p>
          <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.15)", borderRadius:"7px", padding:".35rem .65rem" }}>
            <p style={{ margin:0, color:"#22c55e", fontSize:".65rem", fontWeight:700 }}>
              📍 Best for: {TEMPLATES[selected].where}
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom:".85rem" }}>
        <label style={{ fontSize:".65rem", fontWeight:700, color:"#52525b", display:"block", marginBottom:".3rem", textTransform:"uppercase" as const, letterSpacing:".06em" }}>Your Niche / Topic</label>
        <input value={customNiche} onChange={e => setCustomNiche(e.target.value)}
          placeholder="e.g. Fitness, Saree Business, Digital Marketing, BGMI Gaming..."
          style={{ width:"100%", background:"#050508", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".65rem .85rem", color:"#fff", fontSize:".82rem", fontFamily:"inherit", outline:"none" }} />
      </div>

      <button onClick={generate} disabled={loading||selected===null||!customNiche.trim()}
        style={{ width:"100%", padding:".82rem", borderRadius:"10px", background:(selected===null||!customNiche.trim())?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:(selected===null||!customNiche.trim())?"#3f3f46":"#fff", fontWeight:800, fontSize:".88rem", cursor:(selected===null||!customNiche.trim())?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", marginBottom:"1rem" }}>
        {loading
          ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite" }} /> Generating complete posts...</>
          : <>🎯 Generate 5 Complete Posts</>
        }
      </button>

      {result.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
          {result.map((r: any, i: number) => (
            <div key={i} style={{ background:"#050508", border:"1px solid #141426", borderRadius:"12px", padding:"1rem", position:"relative" as const }}>
              {/* Number badge */}
              <div style={{ position:"absolute" as const, top:"-10px", left:"12px", width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#6d28d9,#7c3aed)",color:"#fff",fontSize:".62rem",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>

              {/* Hook */}
              <div style={{ marginBottom:".5rem", paddingTop:".25rem" }}>
                <span style={{ fontSize:".58rem", fontWeight:800, color:"#f59e0b", letterSpacing:".06em", textTransform:"uppercase" as const }}>🎣 Hook</span>
                <p style={{ color:"#fff", fontSize:".85rem", fontWeight:700, lineHeight:1.55, margin:".2rem 0 0" }}>{r.hook || ""}</p>
              </div>

              {/* Body */}
              {r.body && (
                <div style={{ marginBottom:".5rem" }}>
                  <span style={{ fontSize:".58rem", fontWeight:800, color:"#a855f7", letterSpacing:".06em", textTransform:"uppercase" as const }}>📝 Body</span>
                  <p style={{ color:"#a1a1aa", fontSize:".8rem", lineHeight:1.65, margin:".2rem 0 0", whiteSpace:"pre-line" as const }}>{r.body}</p>
                </div>
              )}

              {/* CTA */}
              {r.cta && (
                <div style={{ marginBottom:".65rem" }}>
                  <span style={{ fontSize:".58rem", fontWeight:800, color:"#22c55e", letterSpacing:".06em", textTransform:"uppercase" as const }}>👉 CTA</span>
                  <p style={{ color:"#86efac", fontSize:".78rem", fontWeight:600, lineHeight:1.5, margin:".2rem 0 0" }}>{r.cta}</p>
                </div>
              )}

              {/* Copy full post button */}
              <button onClick={() => copy(r.full || `${r.hook}\n\n${r.body}\n\n${r.cta}`, `tpl${i}`)}
                style={{ width:"100%", background: copied===`tpl${i}`?"rgba(34,197,94,.1)":"rgba(124,58,237,.08)", border:`1px solid ${copied===`tpl${i}`?"rgba(34,197,94,.3)":"rgba(124,58,237,.2)"}`, color:copied===`tpl${i}`?"#22c55e":"#a855f7", padding:".4rem", borderRadius:"8px", cursor:"pointer", fontSize:".72rem", fontWeight:700, fontFamily:"inherit" }}>
                {copied===`tpl${i}` ? "✓ Copied!" : "📋 Copy Complete Post"}
              </button>
            </div>
          ))}

          {/* Usage tip */}
          <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.15)", borderRadius:"10px", padding:".65rem .85rem" }}>
            <p style={{ margin:0, color:"#f59e0b", fontSize:".72rem", fontWeight:700, marginBottom:".2rem" }}>💡 Best used for:</p>
            <p style={{ margin:0, color:"#78716c", fontSize:".7rem", lineHeight:1.6 }}>
              {selected !== null ? TEMPLATES[selected].where : ""} — Copy the complete post → paste on your platform → post. Use the hook in Script Lab to create a full reel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ContentLibrary ──────────────────────────────────────────────────────────
function ContentLibrary({ userId, supabase }: any) {
  const [items, setItems]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const FILTERS = ["all", "hook", "title", "caption", "script"];
  const FILTER_LABELS: Record<string, string> = {
    all: "All", hook: "Hooks", title: "Titles",
    caption: "Captions", script: "Scripts"
  };

  useEffect(() => {
    if (!userId) return;
    loadLibrary();
  }, [userId, filter]);

  const loadLibrary = async () => {
    setLoading(true);
    let query = supabase
      .from("content_library")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") query = query.eq("type", filter);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  };

  const copyItem = (item: any) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFav = async (item: any) => {
    await supabase.from("content_library")
      .update({ is_favourite: !item.is_favourite })
      .eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_favourite: !i.is_favourite } : i));
  };

  const deleteItem = async (id: string) => {
    setDeletingId(id);
    await supabase.from("content_library").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    setDeletingId(null);
  };

  const typeColor: Record<string, string> = {
    hook: "#a855f7", title: "#22c55e",
    caption: "#06b6d4", script: "#f59e0b"
  };

  return (
    <div style={{ animation:"slideUp .4s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:".75rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:"1.1rem", color:"#fff", margin:"0 0 .2rem" }}>💾 My Content Library</h2>
          <p style={{ color:"#52525b", fontSize:".75rem", margin:0 }}>{items.length} saved items — your best content, always here</p>
        </div>
        <div style={{ display:"flex", gap:".35rem", flexWrap:"wrap" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:".32rem .75rem", borderRadius:"7px", border:`1px solid ${filter===f?"rgba(124,58,237,.4)":"#1a1a2e"}`, background:filter===f?"rgba(124,58,237,.12)":"transparent", color:filter===f?"#a855f7":"#52525b", fontWeight:700, fontSize:".7rem", cursor:"pointer", fontFamily:"inherit" }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign:"center", padding:"3rem 1rem", background:"#080810", border:"1px dashed #1a1a2e", borderRadius:"16px" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:".75rem" }}>💾</div>
          <p style={{ fontWeight:700, color:"#fff", fontSize:".9rem", marginBottom:".4rem" }}>No saved content yet</p>
          <p style={{ color:"#52525b", fontSize:".78rem", lineHeight:1.6 }}>
            Go to Generate tab → Click <strong style={{ color:"#6d28d9" }}>💾 Save</strong> next to any hook, title or caption.<br />
            It will appear here instantly.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:"center", padding:"2rem", color:"#52525b", fontSize:".8rem" }}>
          Loading your library...
        </div>
      )}

      {/* Items */}
      {!loading && items.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
          {items.map(item => (
            <div key={item.id} style={{ background:"#080810", border:`1px solid ${item.is_favourite?"rgba(245,158,11,.25)":"#141426"}`, borderRadius:"12px", padding:".9rem 1rem", display:"flex", gap:".75rem", alignItems:"flex-start", transition:"border-color .15s" }}>
              {/* Type badge */}
              <div style={{ flexShrink:0, marginTop:".1rem" }}>
                <span style={{ background:`${typeColor[item.type]||"#6d28d9"}15`, border:`1px solid ${typeColor[item.type]||"#6d28d9"}30`, color:typeColor[item.type]||"#a855f7", fontSize:".55rem", fontWeight:800, padding:".1rem .4rem", borderRadius:"5px", textTransform:"uppercase", letterSpacing:".06em" }}>
                  {item.type}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:"#e2e8f0", fontSize:".82rem", lineHeight:1.65, margin:"0 0 .4rem", wordBreak:"break-word" }}>{item.content}</p>
                <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                  {item.niche && <span style={{ fontSize:".6rem", color:"#3f3f46", background:"#0d0d18", border:"1px solid #1a1a2e", borderRadius:"4px", padding:".05rem .35rem" }}>{item.niche}</span>}
                  {item.platform && <span style={{ fontSize:".6rem", color:"#3f3f46", background:"#0d0d18", border:"1px solid #1a1a2e", borderRadius:"4px", padding:".05rem .35rem" }}>{item.platform}</span>}
                  {item.hook_score && <span style={{ fontSize:".6rem", color:"#a855f7", background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)", borderRadius:"4px", padding:".05rem .35rem" }}>Score: {item.hook_score}</span>}
                  <span style={{ fontSize:".6rem", color:"#27272a" }}>{new Date(item.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:".35rem", flexShrink:0 }}>
                <button onClick={() => toggleFav(item)}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:".9rem", opacity:item.is_favourite?1:.3, transition:"opacity .15s" }}
                  title={item.is_favourite?"Remove from favourites":"Add to favourites"}>
                  ⭐
                </button>
                <button onClick={() => copyItem(item)}
                  style={{ background: copiedId===item.id?"rgba(34,197,94,.1)":"rgba(255,255,255,.04)", border:`1px solid ${copiedId===item.id?"rgba(34,197,94,.3)":"#1a1a2e"}`, color:copiedId===item.id?"#22c55e":"#52525b", padding:".2rem .55rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit" }}>
                  {copiedId===item.id ? "✓" : "Copy"}
                </button>
                <button onClick={() => deleteItem(item.id)}
                  style={{ background:"none", border:"1px solid #1a1a2e", color: deletingId===item.id?"#ef4444":"#27272a", padding:".2rem .45rem", borderRadius:"6px", cursor:"pointer", fontSize:".65rem", fontFamily:"inherit" }}>
                  {deletingId===item.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats bar */}
      {!loading && items.length > 0 && (
        <div style={{ background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.12)", borderRadius:"10px", padding:".65rem 1rem", marginTop:"1rem", display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
          {FILTERS.filter(f=>f!=="all").map(f => {
            const count = items.filter(i => i.type === f).length;
            if (!count) return null;
            return (
              <div key={f} style={{ display:"flex", gap:".4rem", alignItems:"center" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:typeColor[f], display:"inline-block" }} />
                <span style={{ fontSize:".7rem", color:"#71717a", fontWeight:600 }}>{FILTER_LABELS[f]}: <strong style={{ color:"#a855f7" }}>{count}</strong></span>
              </div>
            );
          })}
          <span style={{ fontSize:".7rem", color:"#27272a", marginLeft:"auto" }}>⭐ {items.filter(i=>i.is_favourite).length} favourited</span>
        </div>
      )}
    </div>
  );
}

// ── AutoRepurposeEngine ─────────────────────────────────────────────────────
function AutoRepurposeEngine({ usageCount, limit, onUpgrade, onCreditUsed, langStrict }: any) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); };

  const repurpose = async () => {
    if (!content.trim()) { setError("Please paste some content first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResults(null);
    const prompt = `You are an expert content repurposing strategist. Take this original content and repurpose it professionally for each platform.
ORIGINAL CONTENT: """${content}"""
LANGUAGE: ${langStrict}
Repurpose natively for all 8 platforms: Instagram Reel Hook, Twitter/X Thread, LinkedIn Post, YouTube Short Hook, Pinterest Pin, WhatsApp Broadcast, Facebook Post, TikTok Hook.
Respond ONLY in JSON:
{"original_summary":"2-line summary","repurposed":{"instagram":"...","twitter":"Tweet 1: ...","linkedin":"...","youtube":"...","pinterest":"...","whatsapp":"...","facebook":"...","tiktok":"..."},"best_platform":"which platform and why","tips":["tip 1","tip 2","tip 3"]}`;
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed; try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setResults(parsed); if (onCreditUsed) onCreditUsed();
    } catch { setError("Repurpose failed. Try again."); }
    setLoading(false);
  };

  const PLATFORM_META: Record<string, { emoji: string; color: string; label: string }> = {
    instagram: { emoji: "📸", color: "#e1306c", label: "Instagram Reel" }, twitter: { emoji: "🐦", color: "#1da1f2", label: "Twitter/X Thread" },
    linkedin: { emoji: "💼", color: "#0077b5", label: "LinkedIn Post" }, youtube: { emoji: "▶️", color: "#ef4444", label: "YouTube Short" },
    pinterest: { emoji: "📌", color: "#e60023", label: "Pinterest Pin" }, whatsapp: { emoji: "💬", color: "#25d366", label: "WhatsApp Broadcast" },
    facebook: { emoji: "📘", color: "#1877f2", label: "Facebook Post" }, tiktok: { emoji: "🎵", color: "#69c9d0", label: "TikTok Hook" },
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.3rem" }}>🔄</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Auto-Repurpose Engine</h3>
            <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>One piece of content → automatically adapted for all 8 platforms</p>
          </div>
        </div>
        <div style={{ background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.15)", borderRadius: "10px", padding: "0.6rem 0.85rem", marginBottom: "0.85rem" }}>
          <p style={{ margin: 0, color: "#8b5cf6", fontSize: "0.72rem", lineHeight: 1.5 }}>💡 Paste any content — a blog post, YouTube script, Instagram caption, or email — and VCI will natively rewrite it for all 8 platforms.</p>
        </div>
        <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>PASTE YOUR CONTENT</label>
        <textarea value={content} onChange={e => { setContent(e.target.value); setError(""); }} placeholder={"Paste your content here:\n• A YouTube script\n• An Instagram caption\n• A blog post intro"} rows={7}
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#f1f5f9", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, transition: "border 0.2s", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}
        <button onClick={repurpose} disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: loading ? "#404040" : "#fff", fontWeight: 800, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "🔄 Repurposing for all platforms..." : "🔄 Repurpose for All 8 Platforms"}
        </button>
      </div>
      {results && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {results.original_summary && <div style={{ background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "12px", padding: "0.85rem", marginBottom: "0.75rem" }}><p style={{ margin: "0 0 0.25rem", fontSize: "0.65rem", color: "#8b5cf6", fontWeight: 700 }}>📝 ORIGINAL SUMMARY</p><p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.8rem", lineHeight: 1.5 }}>{results.original_summary}</p></div>}
          {results.best_platform && <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "0.85rem", marginBottom: "0.75rem" }}><p style={{ margin: "0 0 0.25rem", fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>🏆 BEST PLATFORM</p><p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.82rem", lineHeight: 1.5 }}>{results.best_platform}</p></div>}
          <p style={{ margin: "0 0 0.6rem", fontSize: "0.68rem", color: "#52525b", fontWeight: 700, letterSpacing: "0.06em" }}>REPURPOSED FOR ALL 8 PLATFORMS</p>
          {results.repurposed && Object.entries(results.repurposed).map(([plt, cnt]: any) => { const meta = PLATFORM_META[plt]; if (!meta) return null; return (
            <div key={plt} style={{ background: "#0f0f0f", border: `1px solid ${meta.color}20`, borderLeft: `3px solid ${meta.color}`, borderRadius: "12px", padding: "0.85rem", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ color: meta.color, fontSize: "0.72rem", fontWeight: 700 }}>{meta.emoji} {meta.label}</span>
                <button onClick={() => copyText(cnt, plt)} style={{ background: copiedKey === plt ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === plt ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === plt ? "#22c55e" : "#555", padding: "0.2rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>{copiedKey === plt ? "✓ Copied!" : "Copy"}</button>
              </div>
              <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.83rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{cnt}</p>
            </div>); })}
          {results.tips && <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.85rem", marginTop: "0.5rem" }}><p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700 }}>💡 REPURPOSING TIPS</p>{results.tips.map((tip: string, i: number) => <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}><span style={{ color: "#f59e0b", fontSize: "0.72rem" }}>{i + 1}.</span><span style={{ color: "#a1a1aa", fontSize: "0.75rem", lineHeight: 1.5 }}>{tip}</span></div>)}</div>}
        </div>
      )}
    </div>
  );
}

// ── CompetitorHookAnalyzer ──────────────────────────────────────────────────
function CompetitorHookAnalyzer({ usageCount, limit, onUpgrade, onCreditUsed, platform }: any) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState(platform || "Instagram");
  const PLATFORMS = [{ id: "Instagram", emoji: "📸" }, { id: "YouTube", emoji: "▶️" }, { id: "TikTok", emoji: "🎵" }, { id: "LinkedIn", emoji: "💼" }, { id: "Twitter / X", emoji: "🐦" }, { id: "Facebook", emoji: "📘" }];
  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); };

  const analyze = async () => {
    if (!content.trim()) { setError("Please paste the competitor's content first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);
    const prompt = `You are an expert viral content analyst. Analyze this competitor content from ${selectedPlatform} and reverse-engineer exactly why it works.
COMPETITOR CONTENT: """${content}"""
PLATFORM: ${selectedPlatform}
Respond ONLY in JSON:
{"virality_score":0,"why_it_works":{"primary_technique":"the most powerful thing this content does","psychological_triggers":["trigger 1","trigger 2","trigger 3"],"platform_fit":"why this format works on ${selectedPlatform}"},"replicate_formula":"step-by-step formula to recreate this style WITHOUT copying","your_versions":["Version 1 — same technique, your own angle","Version 2 — different emotional trigger, same structure","Version 3 — curiosity-gap variation"],"avoid":"what NOT to copy","verdict":"one honest sentence about whether this technique is worth replicating"}`;
    try {
      const res = await fetch("https://viral-tool-1.onrender.com/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      let parsed; try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setResult(parsed); if (onCreditUsed) onCreditUsed();
    } catch { setError("Analysis failed. Try again."); }
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.3rem" }}>🔍</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: 800 }}>Competitor Hook Analyzer</h3>
            <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Paste viral content → find out exactly why it worked → create your own version</p>
          </div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "0.6rem 0.85rem", marginBottom: "0.85rem" }}>
          <p style={{ margin: 0, color: "#f87171", fontSize: "0.72rem", lineHeight: 1.5 }}>💡 Paste any competitor's viral hook, caption, or reel script. VCI will reverse-engineer the exact techniques and show you how to create your own original version without copying.</p>
        </div>
        <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
          {PLATFORMS.map(p => <button key={p.id} onClick={() => setSelectedPlatform(p.id)} style={{ background: selectedPlatform === p.id ? "rgba(109,40,217,0.12)" : "#080808", border: `1px solid ${selectedPlatform === p.id ? "#6d28d9" : "#1f1f1f"}`, color: selectedPlatform === p.id ? "#8b5cf6" : "#52525b", padding: "0.3rem 0.75rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>{p.emoji} {p.id}</button>)}
        </div>
        <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>COMPETITOR CONTENT</label>
        <textarea value={content} onChange={e => { setContent(e.target.value); setError(""); }} placeholder={"Paste competitor's viral content here:\n• A viral hook or opening line\n• A complete caption that got thousands of likes\n• A reel script that went viral"} rows={6}
          style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "0.9rem 1rem", color: "#f1f5f9", fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, transition: "border 0.2s", marginBottom: "0.75rem" }}
          onFocus={e => e.target.style.borderColor = "#ef4444"} onBlur={e => e.target.style.borderColor = "#1f1f1f"} />
        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}
        <button onClick={analyze} disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", background: loading ? "#111" : "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", color: loading ? "#404040" : "#fff", fontWeight: 800, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif" }}>
          {loading ? "🔍 Analyzing viral content..." : "🔍 Reverse Engineer This Content"}
        </button>
      </div>
      {result && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ background: `${scoreColor(result.virality_score)}10`, border: `2px solid ${scoreColor(result.virality_score)}30`, borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><p style={{ margin: "0 0 0.2rem", color: "#fff", fontWeight: 800, fontSize: "1rem" }}>Virality Score</p><p style={{ margin: 0, color: "#71717a", fontSize: "0.72rem" }}>{result.verdict}</p></div>
            <div style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: "2.5rem", color: scoreColor(result.virality_score), lineHeight: 1 }}>{result.virality_score}</div><div style={{ color: "#555", fontSize: "0.6rem" }}>/100</div></div>
          </div>
          {result.why_it_works && <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>✅ WHY IT WORKS</p>
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "10px", padding: "0.75rem", marginBottom: "0.6rem" }}><p style={{ margin: "0 0 0.2rem", color: "#22c55e", fontSize: "0.65rem", fontWeight: 700 }}>PRIMARY TECHNIQUE</p><p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", fontWeight: 600 }}>{result.why_it_works.primary_technique}</p></div>
            {result.why_it_works.psychological_triggers && <div style={{ marginBottom: "0.6rem" }}><p style={{ margin: "0 0 0.35rem", color: "#f59e0b", fontSize: "0.65rem", fontWeight: 700 }}>🧠 PSYCHOLOGICAL TRIGGERS</p><div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>{result.why_it_works.psychological_triggers.map((t: string, i: number) => <span key={i} style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>{t}</span>)}</div></div>}
            {result.why_it_works.platform_fit && <p style={{ margin: 0, color: "#71717a", fontSize: "0.75rem", lineHeight: 1.5 }}>📱 {result.why_it_works.platform_fit}</p>}
          </div>}
          {result.replicate_formula && <div style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.08),rgba(109,40,217,0.02))", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}><p style={{ margin: "0 0 0.5rem", fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>🎯 REPLICATE FORMULA</p><p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.83rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.replicate_formula}</p></div>}
          {result.your_versions && result.your_versions.length > 0 && <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>✨ YOUR ORIGINAL VERSIONS</p>
            {result.your_versions.map((ver: string, i: number) => <div key={i} style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "8px", padding: "0.65rem 0.85rem", marginBottom: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <p style={{ margin: 0, color: "#e4e4e7", fontSize: "0.83rem", lineHeight: 1.6, flex: 1 }}>{ver}</p>
              <button onClick={() => copyText(ver, `ver${i}`)} style={{ background: copiedKey === `ver${i}` ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copiedKey === `ver${i}` ? "#22c55e" : "#2a2a2a"}`, color: copiedKey === `ver${i}` ? "#22c55e" : "#555", padding: "0.2rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>{copiedKey === `ver${i}` ? "✓" : "Copy"}</button>
            </div>)}
          </div>}
          {result.avoid && <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "0.85rem" }}><p style={{ margin: "0 0 0.3rem", fontSize: "0.65rem", color: "#ef4444", fontWeight: 700 }}>⚠️ AVOID DOING THIS</p><p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.78rem", lineHeight: 1.5 }}>{result.avoid}</p></div>}
        </div>
      )}
    </div>
  );
}

// ── BackgroundMusicMixer ────────────────────────────────────────────────────
const BG_TRACKS = [
  { name: "Lo-fi Chill",     mood: "🎧 Relaxed", genre: "Lo-fi beats",   styles: ["Tutorial","Tips","Review","Day in Life"] },
  { name: "Upbeat Energy",   mood: "⚡ Hype",     genre: "Pop / EDM",     styles: ["Challenge","Comedy","Before/After"] },
  { name: "Ambient Pad",     mood: "🌊 Calm",     genre: "Cinematic Pad", styles: ["Story","POV","Day in Life"] },
  { name: "Dramatic Rise",   mood: "🔥 Epic",     genre: "Cinematic",     styles: ["Motivation","Before/After","Challenge"] },
  { name: "Corporate Clean", mood: "💼 Pro",      genre: "Corporate",     styles: ["Tutorial","Review","Tips"] },
];

// Fetch real music from Pixabay via our backend proxy (handles CORS)
// Falls back to synthesized if network fails — so it always works
// Session-level cache — same track not re-fetched on Remix
const _musicCache = new Map<number, ArrayBuffer>();

async function fetchRealMusicBuffer(
  audioCtx: AudioContext,
  trackIdx: number,
  durationSec: number,
  volPct: number,
  onStatus?: (s: string) => void
): Promise<{ buf: AudioBuffer; source: "real" | "synth" }> {

  // ── Try to get the raw MP3 bytes (with 3 retries) ────────────────────────
  const getRaw = async (): Promise<ArrayBuffer | null> => {
    if (_musicCache.has(trackIdx)) return _musicCache.get(trackIdx)!;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        onStatus?.(`Fetching music${attempt > 1 ? ` (retry ${attempt - 1}/2)` : ""}...`);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(`https://viral-tool-1.onrender.com/api/music/${trackIdx}`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.arrayBuffer();
        if (raw.byteLength < 8000) throw new Error("Response too small");
        _musicCache.set(trackIdx, raw);
        return raw;
      } catch {
        if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1200));
      }
    }
    return null;
  };

  const raw = await getRaw();

  if (raw) {
    try {
      onStatus?.("Decoding music...");
      const decoded = await audioCtx.decodeAudioData(raw.slice(0)); // slice = detach-safe copy
      const sr = audioCtx.sampleRate;
      const targetLen = Math.ceil(sr * durationSec);
      const srcLen = decoded.length;
      const numCh = Math.min(decoded.numberOfChannels, 2);
      const vol = Math.min((volPct / 100) * 0.72, 0.82);

      const out: AudioBuffer = new (window as any).AudioBuffer({ numberOfChannels: 2, length: targetLen, sampleRate: sr });
      for (let ch = 0; ch < 2; ch++) {
        const src = decoded.getChannelData(Math.min(ch, numCh - 1));
        const d   = out.getChannelData(ch);
        for (let i = 0; i < targetLen; i++) {
          const fi = Math.min(i / (0.6 * sr), 1);
          const fo = Math.min((targetLen - i) / (2.5 * sr), 1);
          d[i] = src[i % srcLen] * vol * fi * fo;
        }
      }
      return { buf: out, source: "real" };
    } catch {
      _musicCache.delete(trackIdx); // corrupt entry — remove
    }
  }

  // ── Synth fallback — zero network dependency, always works ───────────────
  onStatus?.("Using built-in music (server unavailable)...");
  return { buf: makeMusicBuffer(audioCtx.sampleRate, durationSec, trackIdx, volPct), source: "synth" };
}

// makeMusicBuffer — generates clearly audible music using harmonic additive synthesis
// Key fix: amplitude boosted, more harmonics added, no soft swells that make sound inaudible
function makeMusicBuffer(sampleRate: number, durationSec: number, trackIdx: number, volPct: number): AudioBuffer {
  const len = Math.ceil(sampleRate * durationSec);
  const buf: AudioBuffer = new (window as any).AudioBuffer({ numberOfChannels: 2, length: len, sampleRate });
  // Volume: higher base so all tracks are clearly audible
  const vol = Math.min((volPct / 100) * 1.4, 0.92);

  // --- Waveform helpers ---
  // Sawtooth: rich harmonics, much louder than sine
  const saw = (f: number, t: number, a: number) => {
    let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(2*Math.PI*f*h*t)/h;
    return s * a * (2/Math.PI);
  };
  // Square: very punchy
  const sqr = (f: number, t: number, a: number) => {
    let s = 0; for (let h = 1; h <= 9; h += 2) s += Math.sin(2*Math.PI*f*h*t)/h;
    return s * a * (4/Math.PI);
  };
  // Triangle: softer but audible (good for pads)
  const tri = (f: number, t: number, a: number) => {
    let s = 0; for (let h = 1; h <= 7; h += 2) s += (h%4===1?1:-1) * Math.sin(2*Math.PI*f*h*t)/(h*h);
    return s * a * (8/(Math.PI*Math.PI));
  };
  // Kick drum
  const kick = (ph: number, a: number) =>
    ph < 0.15 ? Math.sin(2*Math.PI*(100 - 80*ph*6)*ph) * Math.exp(-ph*22) * a : 0;
  // Snare
  const snare = (ph: number, a: number) =>
    ph < 0.09 ? (Math.random()*2-1) * Math.exp(-ph*35) * a : 0;
  // Hi-hat
  const hh = (ph: number, a: number) =>
    ph < 0.045 ? (Math.random()*2-1) * 0.6 * Math.exp(-ph*60) * a : 0;

  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    // Stereo: L slightly different phase from R for width
    const phOff = ch === 0 ? 0 : Math.PI * 0.03;

    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      let s = 0;

      if (trackIdx === 0) {
        // ── Lo-fi Chill (75 BPM) ─────────────────────────────────────
        // Warm lo-fi hip-hop feel: mellow chords + lazy kick + vinyl hiss
        const bpm = 75, bl = 60/bpm;
        const bp = (t % bl) / bl;
        const bar = (t % (bl*4)) / (bl*4);
        // Warm pad chord — Cmaj7 using triangle (audible but smooth)
        s += tri(261.6, t+phOff*0.5, 0.55) + tri(329.6, t+phOff*0.3, 0.45) + tri(392.0, t+phOff*0.2, 0.38) + tri(493.9, t+phOff*0.1, 0.25);
        // Bass — alternates C2/G2
        const bn = bar < 0.5 ? 65.4 : 98.0;
        s += saw(bn, t, bp < 0.5 ? 0.65 : 0.0);
        // Lazy kick on 1 and 3
        if (bp < 0.15) s += kick(bp, 0.85);
        const bp3 = (t % (bl*2) ) / bl; if (bp3 > 1 && bp3 < 1.15) s += kick(bp3-1, 0.7);
        // Hi-hat 8ths
        const hhP = (t % (bl/2)) / (bl/2); s += hh(hhP, 0.35);
        // Subtle vinyl crackle
        if (Math.random() < 0.002) s += (Math.random()*2-1)*0.08;

      } else if (trackIdx === 1) {
        // ── Upbeat Energy (128 BPM) ───────────────────────────────────
        // Modern pop/EDM: 4-on-floor, bright synth stabs
        const bpm = 128, bl = 60/bpm;
        const bp = (t % bl) / bl;
        const bar4 = (t % (bl*4)) / (bl*4);
        // 4-on-floor kick — loud
        s += kick(bp, 1.0);
        // Snare 2+4
        if (Math.abs(bar4-0.25)<0.008 || Math.abs(bar4-0.75)<0.008) s += snare(0.001, 0.85);
        // Open hi-hat 16ths
        const hh16 = (t % (bl/4)) / (bl/4); s += hh(hh16, 0.28);
        // Synth chord stab — hits on 1 and 3
        const stabOn = bp < 0.18 || (bar4 > 0.5 && bp < 0.18);
        s += sqr(392.0, t+phOff, stabOn ? 0.55 : 0.12) + sqr(493.9, t+phOff, stabOn ? 0.42 : 0.08) + sqr(587.3, t+phOff, stabOn ? 0.32 : 0.06);
        // Punchy bass
        s += sqr(82.4, t, bp < 0.35 ? 0.65 : bp < 0.5 ? 0.2 : 0.0);
        // Riser hi-freq noise for energy
        s += (Math.random()*2-1) * 0.04;

      } else if (trackIdx === 2) {
        // ── Ambient Pad ───────────────────────────────────────────────
        // FIX: use sawtooth + triangle (not pure sine) so it's actually loud
        // Slow chord breathing using LFO on amplitude
        const lfo1 = 0.55 + 0.45 * Math.sin(2*Math.PI*0.08*t + phOff);
        const lfo2 = 0.55 + 0.45 * Math.sin(2*Math.PI*0.11*t + phOff + 1.2);
        const lfo3 = 0.55 + 0.45 * Math.sin(2*Math.PI*0.06*t + phOff + 2.4);
        // Main chord layers — using SAW for guaranteed audibility
        s += saw(130.8, t+phOff*0.1, 0.50 * lfo1);   // C3 root
        s += saw(196.0, t+phOff*0.2, 0.42 * lfo2);   // G3 fifth
        s += saw(246.9, t+phOff*0.15, 0.36 * lfo3);  // B3 major 7th
        s += saw(261.6, t+phOff*0.1, 0.30 * lfo1);   // C4 octave
        // Detuned layer for thickness
        s += saw(130.8 * 1.007, t, 0.28 * lfo2);
        s += saw(196.0 * 0.994, t, 0.22 * lfo3);
        // Triangle layer for smoothness on top
        s += tri(392.0, t+phOff*0.3, 0.25 * lfo1);   // G4
        s += tri(523.3, t+phOff*0.2, 0.18 * lfo2);   // C5
        // Sub drone — triangle so it's deep but not muddy
        s += tri(65.4, t, 0.50);  // C2 sub bass drone — always on

      } else if (trackIdx === 3) {
        // ── Dramatic Rise (90→120 BPM) ────────────────────────────────
        // Builds from quiet to full intensity — cinematic
        const progress = Math.min(t / Math.max(durationSec, 1), 1.0);
        const bpm = 90 + progress * 30; // tempo builds
        const bl = 60/bpm;
        const bp = (t % bl) / bl;
        const bar4 = (t % (bl*4)) / (bl*4);
        const intensity = 0.25 + progress * 0.75;
        // Kick gets louder
        s += kick(bp, 0.9 * intensity);
        // Snare appears after halfway
        if (progress > 0.4 && (Math.abs(bar4-0.25)<0.01 || Math.abs(bar4-0.75)<0.01)) s += snare(0.001, 0.8 * intensity);
        // Rising sawtooth pad
        s += saw(196.0, t+phOff, 0.45 * intensity) + saw(246.9, t+phOff*0.5, 0.38 * intensity) + saw(293.7, t, 0.32 * intensity);
        // Epic brass stab
        const stabA = bp < 0.2 ? 0.5*intensity : 0.04*intensity;
        s += sqr(130.8, t+phOff, stabA) + sqr(196.0, t, stabA*0.7);
        // Sub bass pulse
        s += saw(65.4, t, bp < 0.4 ? 0.55*intensity : 0.0);
        // White noise riser after 60%
        if (progress > 0.6) s += (Math.random()*2-1) * 0.05 * (progress-0.6)/0.4;

      } else {
        // ── Corporate Clean (100 BPM) ─────────────────────────────────
        // Professional, bright, motivational
        const bpm = 100, bl = 60/bpm;
        const bp = (t % bl) / bl;
        const bar4 = (t % (bl*4)) / (bl*4);
        // Kick
        s += kick(bp, 0.7);
        // Snare 2+4
        if (Math.abs(bar4-0.25)<0.009 || Math.abs(bar4-0.75)<0.009) s += snare(0.001, 0.55);
        // Piano-style chord — triangle for brightness
        s += tri(261.6, t+phOff*0.2, 0.50) + tri(329.6, t+phOff*0.15, 0.42) + tri(392.0, t, 0.35) + tri(493.9, t, 0.22);
        // Walking bass pattern C-E-G-B
        const bassNotes = [130.8, 164.8, 196.0, 246.9];
        const bassIdx = Math.floor(bar4 * 4);
        s += saw(bassNotes[bassIdx] || 130.8, t, bp < 0.42 ? 0.50 : 0.0);
        // Hi-hat
        const hh8 = (t % (bl/2)) / (bl/2); s += hh(hh8, 0.30);
        // Ride cymbal feel on quarter notes
        if (bp < 0.03) s += (Math.random()*2-1) * 0.15;
      }

      // Fade in 0.15s, fade out 1.0s
      const fi = Math.min(i / (0.15 * sampleRate), 1);
      const fo = Math.min((len - i) / (1.0 * sampleRate), 1);
      // Soft clip with tanh for clean limiting
      d[i] = Math.tanh(s * vol * fi * fo * 0.85);
    }
  }
  return buf;
}

function BackgroundMusicMixer({ audioUrl: aiAudioUrl, scriptStyle }: { audioUrl: string; scriptStyle: string }) {
  const suggestedIdx = BG_TRACKS.findIndex(t => t.styles.includes(scriptStyle));
  const defaultIdx   = suggestedIdx >= 0 ? suggestedIdx : 0;

  // Voice source
  const [voiceMode,     setVoiceMode]     = useState<"ai"|"upload"|"record">("ai");
  const [userVoiceUrl,  setUserVoiceUrl]  = useState<string|null>(null);
  const [userVoiceName, setUserVoiceName] = useState("");
  const [recording,     setRecording]     = useState(false);
  const [recSeconds,    setRecSeconds]    = useState(0);
  const mediaRecRef  = useRef<MediaRecorder|null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recTimerRef  = useRef<any>(null);

  // Music source
  const [musicMode,     setMusicMode]     = useState<"synth"|"upload">("synth");
  const [userMusicUrl,  setUserMusicUrl]  = useState<string|null>(null);
  const [userMusicName, setUserMusicName] = useState("");

  // Built-in track
  const [selected,   setSelected]   = useState<number>(defaultIdx);
  const [volume,     setVolume]     = useState(28);
  const [previewing, setPreviewing] = useState(false);
  const [mixing,     setMixing]     = useState(false);
  const [mixStatus,  setMixStatus]  = useState("");
  const [mixedUrl,   setMixedUrl]   = useState<string|null>(null);
  const [error,      setError]      = useState("");
  const previewCtxRef = useRef<AudioContext|null>(null);
  const abortRef      = useRef(false);

  const activeVoiceUrl = voiceMode === "ai" ? aiAudioUrl : userVoiceUrl;

  const stopPreview = () => {
    try { previewCtxRef.current?.close(); } catch {}
    previewCtxRef.current = null;
    setPreviewing(false);
  };

  // Preview — uses makeMusicBuffer directly (no network, always works)
  const preview = async (idx: number) => {
    stopPreview(); setError("");
    try {
      const ACtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx  = new ACtx() as AudioContext;
      previewCtxRef.current = ctx;
      setPreviewing(true);
      const buf  = makeMusicBuffer(ctx.sampleRate, 10, idx, Math.max(volume, 50));
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -10; comp.knee.value = 6;
      comp.ratio.value = 4; comp.attack.value = 0.001; comp.release.value = 0.15;
      gain.gain.value = 1.5;
      src.buffer = buf;
      src.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
      src.start(0); src.onended = stopPreview;
      setTimeout(stopPreview, 11000);
    } catch(e) { console.error(e); setError("Preview failed."); setPreviewing(false); }
  };

  const previewUserMusic = () => {
    if (!userMusicUrl) return;
    const audio = new Audio(userMusicUrl);
    audio.volume = Math.min(volume / 50, 1);
    audio.play().catch(() => setError("Could not play file."));
    setTimeout(() => audio.pause(), 10000);
  };

  // Record voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRecRef.current = rec; recChunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: "audio/webm" });
        setUserVoiceUrl(URL.createObjectURL(blob));
        setUserVoiceName("Recorded voice");
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setRecording(true); setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch { setError("Microphone access denied."); }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    clearInterval(recTimerRef.current);
    setRecording(false);
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) { setError("Please upload an audio file."); return; }
    setUserVoiceUrl(URL.createObjectURL(file));
    setUserVoiceName(file.name); setError("");
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) { setError("Please upload an audio file."); return; }
    setUserMusicUrl(URL.createObjectURL(file));
    setUserMusicName(file.name); setMusicMode("upload"); setError("");
  };

  // Mix
  const doMix = async (): Promise<string|null> => {
    if (!activeVoiceUrl) { setError("Please add a voiceover first."); return null; }
    try {
      const ACtx = window.AudioContext || (window as any).webkitAudioContext;
      setMixStatus("Loading voiceover...");
      const voiceRaw = await fetch(activeVoiceUrl).then(r => r.arrayBuffer()).catch(() => null);
      if (!voiceRaw) throw new Error("Voiceover could not be loaded.");
      const vCtx = new ACtx() as AudioContext;
      let voiceDec: AudioBuffer;
      try { voiceDec = await vCtx.decodeAudioData(voiceRaw); }
      catch { await vCtx.close(); throw new Error("Voiceover format not supported. Use MP3 or WAV."); }
      await vCtx.close();
      if (abortRef.current) return null;

      const sr = voiceDec.sampleRate;
      const totalDur = voiceDec.duration + 2.5;
      const totalSamples = Math.ceil(sr * totalDur);

      setMixStatus("Loading music...");
      let musicBuf: AudioBuffer;
      if (musicMode === "upload" && userMusicUrl) {
        const mRaw = await fetch(userMusicUrl).then(r => r.arrayBuffer()).catch(() => null);
        if (!mRaw) throw new Error("Could not load music file.");
        const mCtx = new ACtx() as AudioContext;
        try {
          const mDec = await mCtx.decodeAudioData(mRaw);
          const vol  = Math.min((volume / 100) * 0.72, 0.82);
          const outM: AudioBuffer = new (window as any).AudioBuffer({ numberOfChannels: 2, length: totalSamples, sampleRate: sr });
          for (let ch = 0; ch < 2; ch++) {
            const src = mDec.getChannelData(Math.min(ch, mDec.numberOfChannels - 1));
            const out = outM.getChannelData(ch);
            for (let i = 0; i < totalSamples; i++) {
              const fi = Math.min(i / (0.6 * sr), 1);
              const fo = Math.min((totalSamples - i) / (2.5 * sr), 1);
              out[i]   = src[i % mDec.length] * vol * fi * fo;
            }
          }
          musicBuf = outM; await mCtx.close();
        } catch { await mCtx.close(); throw new Error("Music format not supported. Use MP3 or WAV."); }
      } else {
        musicBuf = makeMusicBuffer(sr, totalDur, selected, volume);
      }
      if (abortRef.current) return null;

      setMixStatus("Applying ducking...");
      const WIN    = Math.max(1, Math.ceil(0.008 * sr));
      const voiceL = voiceDec.getChannelData(0);
      const voiceR = voiceDec.numberOfChannels > 1 ? voiceDec.getChannelData(1) : voiceL;
      const env    = new Float32Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        const s = Math.max(0, i - (WIN >> 1)), e = Math.min(voiceDec.length, i + (WIN >> 1));
        let rms = 0;
        for (let j = s; j < e; j++) rms += ((Math.abs(voiceL[j]) + Math.abs(voiceR[j])) * 0.5) ** 2;
        env[i] = e > s ? Math.sqrt(rms / (e - s)) : 0;
      }
      const FLOOR = 0.18, CEIL = 0.82, THR = 0.013;
      const ATK = Math.ceil(0.012 * sr), REL = Math.ceil(0.340 * sr);
      const duck = new Float32Array(totalSamples);
      let g = CEIL;
      for (let i = 0; i < totalSamples; i++) {
        const t = env[i] > THR ? FLOOR : CEIL;
        g += (t - g) / (t < g ? ATK : REL);
        duck[i] = g;
      }

      setMixStatus("Mixing...");
      const outBuf: AudioBuffer = new (window as any).AudioBuffer({ numberOfChannels: 2, length: totalSamples, sampleRate: sr });
      for (let ch = 0; ch < 2; ch++) {
        const out   = outBuf.getChannelData(ch);
        const vData = ch === 0 ? voiceL : voiceR;
        const mData = musicBuf.getChannelData(Math.min(ch, musicBuf.numberOfChannels - 1));
        for (let i = 0; i < totalSamples; i++) {
          const v = i < voiceDec.length ? vData[i] : 0;
          const m = i < mData.length    ? mData[i] * duck[i] : 0;
          out[i]  = Math.tanh((v * 0.91 + m) * 0.87);
        }
      }

      setMixStatus("Encoding WAV...");
      const nCh = 2, nS = totalSamples;
      const wav = new ArrayBuffer(44 + nS * nCh * 2);
      const dv  = new DataView(wav);
      const ws  = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o+i, s.charCodeAt(i)); };
      ws(0,"RIFF"); dv.setUint32(4,36+nS*nCh*2,true);
      ws(8,"WAVE"); ws(12,"fmt "); dv.setUint32(16,16,true);
      dv.setUint16(20,1,true); dv.setUint16(22,nCh,true);
      dv.setUint32(24,sr,true); dv.setUint32(28,sr*nCh*2,true);
      dv.setUint16(32,nCh*2,true); dv.setUint16(34,16,true);
      ws(36,"data"); dv.setUint32(40,nS*nCh*2,true);
      let off = 44;
      for (let i = 0; i < nS; i++) for (let ch = 0; ch < nCh; ch++) {
        const s = Math.max(-1, Math.min(1, outBuf.getChannelData(ch)[i]));
        dv.setInt16(off, s < 0 ? s*0x8000 : s*0x7fff, true); off += 2;
      }
      return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
    } catch(err: any) { setError(err?.message || "Mix failed."); return null; }
  };

  const runMix = async () => {
    abortRef.current = false;
    setMixing(true); setError(""); setMixedUrl(null);
    const url = await doMix();
    if (!abortRef.current && url) setMixedUrl(url);
    setMixing(false); setMixStatus("");
  };

  const sBox  = { background:"#080810", border:"1px solid #1a1a2a", borderRadius:"12px", padding:"1rem", marginBottom:"0.75rem" } as const;
  const sLbl  = { margin:"0 0 0.6rem", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.06em" } as const;
  const mBtn  = (active: boolean, col = "#a855f7") => ({ flex:1, padding:"0.5rem 0.5rem", borderRadius:"8px", border:`1px solid ${active?col:"#1a1a2a"}`, background:active?`${col}15`:"transparent", color:active?col:"#52525b", fontWeight:700, fontSize:"0.7rem", cursor:"pointer", fontFamily:"'Inter',sans-serif" } as const);

  return (
    <div style={{ border:"1px solid rgba(168,85,247,0.3)", borderRadius:"16px", padding:"1.1rem", marginBottom:"0.75rem", background:"linear-gradient(135deg,rgba(168,85,247,0.06),rgba(168,85,247,0.02))", animation:"slideUp 0.4s ease" }}>
      <p style={{ margin:"0 0 1rem", fontSize:"0.7rem", color:"#a855f7", fontWeight:800, letterSpacing:"0.06em" }}>🎛️ MIX STUDIO</p>

      {/* ── VOICE ── */}
      <div style={sBox}>
        <p style={{ ...sLbl, color:"#06b6d4" }}>🎙️ VOICE / VOICEOVER</p>
        <div style={{ display:"flex", gap:"0.4rem", marginBottom:"0.75rem" }}>
          {([["ai","🤖 AI Voice"],["upload","📁 Upload File"],["record","🎤 Record"]] as const).map(([m,l])=>(
            <button key={m} onClick={()=>{setVoiceMode(m);setError("");}} style={mBtn(voiceMode===m,"#06b6d4")}>{l}</button>
          ))}
        </div>
        {voiceMode==="ai" && (
          <div style={{ background:"#050508", border:"1px solid rgba(6,182,212,0.15)", borderRadius:"8px", padding:"0.6rem" }}>
            <p style={{ margin:"0 0 0.3rem", color:"#3f3f46", fontSize:"0.62rem" }}>AI-generated voiceover</p>
            <audio controls src={aiAudioUrl} style={{ width:"100%", height:"32px" }} />
          </div>
        )}
        {voiceMode==="upload" && (
          <div>
            <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", background:"#050508", border:"2px dashed rgba(6,182,212,0.3)", borderRadius:"10px", padding:"1rem", cursor:"pointer", color:"#06b6d4", fontSize:"0.78rem", fontWeight:700 }}>
              📁 Click to upload (MP3, WAV, M4A)
              <input type="file" accept="audio/*" style={{ display:"none" }} onChange={handleVoiceUpload} />
            </label>
            {userVoiceUrl && (
              <div style={{ marginTop:"0.5rem", background:"#050508", border:"1px solid rgba(6,182,212,0.2)", borderRadius:"8px", padding:"0.6rem" }}>
                <p style={{ margin:"0 0 0.3rem", color:"#06b6d4", fontSize:"0.65rem", fontWeight:700 }}>✓ {userVoiceName}</p>
                <audio controls src={userVoiceUrl} style={{ width:"100%", height:"32px" }} />
              </div>
            )}
          </div>
        )}
        {voiceMode==="record" && (
          <div>
            {!recording ? (
              <button onClick={startRecording} style={{ width:"100%", padding:"0.8rem", borderRadius:"10px", background:"linear-gradient(135deg,#06b6d4,#0891b2)", border:"none", color:"#000", fontWeight:800, fontSize:"0.85rem", cursor:"pointer" }}>
                🔴 Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} style={{ width:"100%", padding:"0.8rem", borderRadius:"10px", background:"rgba(239,68,68,0.12)", border:"2px solid #ef4444", color:"#ef4444", fontWeight:800, fontSize:"0.85rem", cursor:"pointer", animation:"pulse 1s infinite" }}>
                ⏹ Stop · {recSeconds}s recorded
              </button>
            )}
            {userVoiceUrl && !recording && (
              <div style={{ marginTop:"0.5rem", background:"#050508", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"8px", padding:"0.6rem" }}>
                <p style={{ margin:"0 0 0.3rem", color:"#22c55e", fontSize:"0.65rem", fontWeight:700 }}>✓ Recording ready ({recSeconds}s)</p>
                <audio controls src={userVoiceUrl} style={{ width:"100%", height:"32px" }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MUSIC ── */}
      <div style={sBox}>
        <p style={{ ...sLbl, color:"#a855f7" }}>🎵 BACKGROUND MUSIC</p>
        <div style={{ display:"flex", gap:"0.4rem", marginBottom:"0.75rem" }}>
          <button onClick={()=>{setMusicMode("synth");setError("");}} style={mBtn(musicMode==="synth")}>🎹 Built-in</button>
          <button onClick={()=>{setMusicMode("upload");setError("");}} style={mBtn(musicMode==="upload")}>📁 Upload My Music</button>
        </div>
        {musicMode==="synth" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", marginBottom:"0.6rem" }}>
            {BG_TRACKS.map((track,i)=>{
              const isSel=selected===i, isSugg=suggestedIdx===i, isPrev=previewing&&selected===i;
              return (
                <div key={i} onClick={()=>{setSelected(i);setMixedUrl(null);setError("");}}
                  style={{ background:isSel?"rgba(168,85,247,0.1)":"#050508", border:`1px solid ${isSel?"#a855f7":"#1a1a2a"}`, borderRadius:"10px", padding:"0.5rem 0.75rem", display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                      <span style={{ color:isSel?"#a855f7":"#e4e4e7", fontSize:"0.8rem", fontWeight:isSel?700:500 }}>{track.name}</span>
                      {isSugg&&<span style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:"#22c55e", fontSize:"0.55rem", fontWeight:700, padding:"0.05rem 0.3rem", borderRadius:"5px" }}>Best match</span>}
                    </div>
                    <span style={{ color:"#52525b", fontSize:"0.62rem" }}>{track.mood} · {track.genre}</span>
                  </div>
                  <button onClick={e=>{e.stopPropagation(); isPrev?stopPreview():preview(i);}}
                    style={{ background:isPrev?"rgba(168,85,247,0.2)":"#111", border:`1px solid ${isPrev?"#a855f7":"#222"}`, color:isPrev?"#a855f7":"#666", padding:"0.25rem 0.55rem", borderRadius:"7px", cursor:"pointer", fontSize:"0.7rem", fontWeight:700, flexShrink:0 }}>
                    {isPrev?"⏹ Stop":"▶ Preview"}
                  </button>
                  <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${isSel?"#a855f7":"#2a2a2a"}`, background:isSel?"#a855f7":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {isSel&&<span style={{ color:"#fff", fontSize:"0.55rem" }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {musicMode==="upload" && (
          <div>
            <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", background:"#050508", border:"2px dashed rgba(168,85,247,0.3)", borderRadius:"10px", padding:"1rem", cursor:"pointer", color:"#a855f7", fontSize:"0.78rem", fontWeight:700 }}>
              📁 Click to upload music (MP3, WAV, M4A)
              <input type="file" accept="audio/*" style={{ display:"none" }} onChange={handleMusicUpload} />
            </label>
            {userMusicUrl && (
              <div style={{ marginTop:"0.5rem", background:"#050508", border:"1px solid rgba(168,85,247,0.2)", borderRadius:"8px", padding:"0.6rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ margin:0, color:"#a855f7", fontSize:"0.65rem", fontWeight:700 }}>✓ {userMusicName}</p>
                  <button onClick={previewUserMusic} style={{ background:"none", border:"none", color:"#a855f7", cursor:"pointer", fontSize:"0.7rem", fontWeight:700 }}>▶ Preview</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop:"0.6rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.2rem" }}>
            <label style={{ color:"#52525b", fontSize:"0.6rem", fontWeight:700 }}>MUSIC VOLUME</label>
            <span style={{ color:"#a855f7", fontSize:"0.6rem", fontWeight:700 }}>{volume}%</span>
          </div>
          <input type="range" min={10} max={55} value={volume} onChange={e=>setVolume(Number(e.target.value))} style={{ width:"100%", accentColor:"#a855f7", cursor:"pointer" }} />
        </div>
      </div>

      {/* ── MIX BUTTON ── */}
      {error&&<p style={{ color:"#ef4444", fontSize:"0.72rem", margin:"0 0 0.6rem", textAlign:"center" }}>{error}</p>}

      {!mixedUrl&&!mixing&&(
        <button onClick={runMix} disabled={!activeVoiceUrl}
          style={{ width:"100%", padding:"0.9rem", borderRadius:"12px", background:!activeVoiceUrl?"#111":"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", color:!activeVoiceUrl?"#444":"#fff", fontWeight:800, fontSize:"0.9rem", cursor:!activeVoiceUrl?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", boxShadow:activeVoiceUrl?"0 4px 20px rgba(168,85,247,0.3)":"none" }}>
          🎛️ Mix Voice + Music
        </button>
      )}

      {mixing&&(
        <div style={{ background:"#080810", border:"1px solid rgba(168,85,247,0.2)", borderRadius:"10px", padding:"0.85rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"#a855f7", fontSize:"0.78rem", marginBottom:"0.5rem" }}>
            <RefreshCw size={13} style={{ animation:"spin 1s linear infinite", flexShrink:0 }} />
            <span style={{ fontWeight:600 }}>{mixStatus||"Mixing..."}</span>
          </div>
          <div style={{ background:"#1a1a2a", borderRadius:"4px", height:"3px", overflow:"hidden" }}>
            <div style={{ height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:"4px", animation:"progressBar 15s linear forwards" }} />
          </div>
        </div>
      )}

      {mixedUrl&&!mixing&&(
        <div style={{ animation:"slideUp 0.3s ease" }}>
          <div style={{ background:"#080810", border:"1px solid rgba(168,85,247,0.2)", borderRadius:"12px", padding:"0.75rem", marginBottom:"0.6rem" }}>
            <p style={{ margin:"0 0 0.4rem", fontSize:"0.65rem", color:"#a855f7", fontWeight:700 }}>🎧 FINAL MIX PREVIEW</p>
            <audio controls src={mixedUrl} style={{ width:"100%" }} />
          </div>
          <a href={mixedUrl} download={`vci-${scriptStyle.toLowerCase()}-final-mix.wav`}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"#fff", padding:"0.85rem", borderRadius:"12px", fontSize:"0.88rem", fontWeight:800, textDecoration:"none", boxShadow:"0 4px 20px rgba(168,85,247,0.3)", marginBottom:"0.5rem" }}>
            ⬇ Download Final Mix (WAV)
          </a>
          <button onClick={()=>{abortRef.current=true; setTimeout(runMix,80);}}
            style={{ width:"100%", padding:"0.6rem", borderRadius:"10px", background:"transparent", border:"1px solid rgba(168,85,247,0.3)", color:"#a855f7", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>
            🔄 Remix Again
          </button>
          <p style={{ margin:"0.4rem 0 0", color:"#3f3f46", fontSize:"0.6rem", textAlign:"center" }}>WAV · 16-bit Stereo · Professional Ducking</p>
        </div>
      )}
    </div>
  );
}

function ScriptLab({ plan, usageCount, limit, onUpgrade, langStrict, langLabel, onSaveHistory, onCreditUsedGenerate, onCreditUsedImprove, onCreditUsedVoice, userType }: any) {
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
  const [voiceLangAutoSet, setVoiceLangAutoSet] = useState(true);
  const [voiceGender, setVoiceGender] = useState<"Female" | "Male">("Female");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const [platform, setPlatform] = useState("Instagram");
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (userType === "business" && platform === "Instagram") setPlatform("Google Ads");
  }, [userType]);

  const ALL_SOCIAL_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
  ];
  const ALL_ADS_PLATFORMS = [
    { id: "Google Ads", emoji: "📢", color: "#4285f4" },
    { id: "Meta Ads", emoji: "📘", color: "#1877f2" },
    { id: "YouTube Ads", emoji: "▶️", color: "#ef4444" },
    { id: "Native Ads", emoji: "📰", color: "#f59e0b" },
  ];
  const PLATFORMS = userType === "business" ? ALL_ADS_PLATFORMS : ALL_SOCIAL_PLATFORMS;

  const STYLES = ["Tutorial", "Story", "POV", "Challenge", "Before/After", "Motivation", "Tips", "Review", "Day in Life", "Comedy"];
  const DURATIONS = ["15 sec", "30 sec", "60 sec", "90 sec"];

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    fireCopySignal("scriptlab", key, text, { platform });
  };

  const gradeColor = (g: string) => ({ A: "#22c55e", B: "#06b6d4", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[g] || "#6d28d9");
  const lineColor = (type: string) => type === "strong" ? "#22c55e" : type === "weak" ? "#ef4444" : "#71717a";

  const analyzeScript = async () => {
    if (!script.trim()) { setError("Please paste your script first."); return; }
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

    // Retry with backoff if the backend is rate-limited (Groq free tier: 30 requests/minute)
    const attemptRequest = async (retriesLeft: number): Promise<any> => {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";

      if (!text && retriesLeft > 0) {
        await new Promise(r => setTimeout(r, 2500));
        return attemptRequest(retriesLeft - 1);
      }
      if (!text) throw new Error("RATE_LIMITED");
      return text;
    };

    try {
      const text = await attemptRequest(2);
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { const m = text.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error("Parse failed"); }
      setImproveResult(parsed);
      if (onCreditUsedImprove) onCreditUsedImprove();
      if (onSaveHistory) onSaveHistory("scriptimprove", { platform, inputSummary: script.slice(0, 80), resultData: parsed });
    } catch (err: any) {
      if (err?.message === "RATE_LIMITED") {
        setError("Server is busy right now. Please wait 10–15 seconds and try again.");
      } else {
        setError("Analysis failed. Try again.");
      }
    }
    setImproveLoading(false);
  };


  const AZURE_VOICES: Record<string, { Female: string; Male: string; code: string; styles?: string[] }> = {
    "Hindi":    { Female: "hi-IN-SwaraNeural",    Male: "hi-IN-MadhurNeural",    code: "hi-IN", styles: ["Default", "Cheerful", "Newscast", "Empathetic"] },
    "Tamil":    { Female: "ta-IN-PallaviNeural",  Male: "ta-IN-ValluvarNeural",  code: "ta-IN" },
    "Telugu":   { Female: "te-IN-ShrutiNeural",   Male: "te-IN-MohanNeural",     code: "te-IN" },
    "Marathi":  { Female: "mr-IN-AarohiNeural",   Male: "mr-IN-ManoharNeural",   code: "mr-IN" },
    "Gujarati": { Female: "gu-IN-DhwaniNeural",   Male: "gu-IN-NiranjanNeural",  code: "gu-IN" },
    "Bengali":  { Female: "bn-IN-TanishaaNeural", Male: "bn-IN-BashkarNeural",   code: "bn-IN" },
    "English":  { Female: "en-US-AvaNeural",      Male: "en-US-AndrewNeural",    code: "en-US", styles: ["Default", "Cheerful", "Friendly", "Excited"] },
  };

  // Auto-select the voice language to match whatever language the script was generated in,
  // as long as the user hasn't manually picked a different voice language themselves.
  useEffect(() => {
    if (!voiceLangAutoSet) return;
    const matched = AZURE_VOICES[langLabel] ? langLabel : "English"; // fallback if app supports a language Azure doesn't
    setVoiceLang(matched);
  }, [langLabel, voiceLangAutoSet]);

  const VOICE_SPEEDS = [
    { label: "Slow", value: "0.85" },
    { label: "Normal", value: "1.0" },
    { label: "Fast", value: "1.15" },
  ];

  const [voiceStyle, setVoiceStyle] = useState("Default");
  const [voiceSpeed, setVoiceSpeed] = useState("1.0");

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
          style: voiceInfo.styles ? voiceStyle : "Default",
          rate: voiceSpeed,
        }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (onCreditUsedVoice) onCreditUsedVoice();
    } catch {
      setVoiceError("Voice generation failed. Try again.");
    }
    setVoiceLoading(false);
  };

  const generateThumbnail = (title: string, hook: string, plt: string, sty: string, dur: string): string => {
    const canvas = document.createElement("canvas");
    const isVertical = ["Instagram","TikTok"].includes(plt);
    canvas.width  = isVertical ? 1080 : 1280;
    canvas.height = isVertical ? 1920 : 720;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;

    // ── Helpers ──────────────────────────────────────────────────────────────
    // Smart text wrap — returns final Y position
    const wrapText = (text: string, x: number, y: number, maxW: number, lineH: number, fontSize: number, weight = "900") => {
      ctx.font = `${weight} ${fontSize}px 'Arial Black', Arial`;
      const words = text.split(" "); let line = ""; let cy = y;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), x, cy); line = w + " "; cy += lineH; }
        else line = test;
      }
      if (line.trim()) ctx.fillText(line.trim(), x, cy);
      return cy;
    };

    // Draw a filled rounded rect (polyfill-safe)
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y); ctx.arcTo(x+w,y, x+w,y+r, r);
      ctx.lineTo(x + w, y + h - r); ctx.arcTo(x+w,y+h, x+w-r,y+h, r);
      ctx.lineTo(x + r, y + h); ctx.arcTo(x,y+h, x,y+h-r, r);
      ctx.lineTo(x, y + r); ctx.arcTo(x,y, x+r,y, r);
      ctx.closePath(); ctx.fill();
    };

    // Noise texture for depth
    const addNoise = (alpha = 0.025) => {
      for (let i = 0; i < W * H * 0.003; i++) {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
      }
    };

    // Draw bold stroke text (outline effect for readability)
    const strokeText = (text: string, x: number, y: number, strokeColor: string, strokeW: number) => {
      ctx.save();
      ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeW; ctx.lineJoin = "round";
      ctx.strokeText(text, x, y); ctx.restore();
    };

    // Pill badge
    const badge = (text: string, x: number, y: number, bg: string, fg: string, r = 22) => {
      ctx.font = `800 ${isVertical ? 26 : 18}px Arial`;
      const tw = ctx.measureText(text).width;
      const ph = isVertical ? 56 : 38, pw = tw + ph;
      ctx.fillStyle = bg; roundRect(x, y, pw, ph, r);
      ctx.fillStyle = fg; ctx.textAlign = "left";
      ctx.fillText(text, x + ph/2, y + ph * 0.68);
      return pw;
    };

    // Platform configs
    const CONFIGS: Record<string, { bg: [string,string], accent: string, badge: string, badgeFg: string, label: string }> = {
      "Instagram":  { bg:["#1a0030","#c2185b"], accent:"#fcb045", badge:"linear", badgeFg:"#fff", label:"📸 Instagram Reel" },
      "YouTube":    { bg:["#0a0000","#1a0000"], accent:"#ff0000", badge:"#ff0000", badgeFg:"#fff", label:"▶ YouTube" },
      "TikTok":     { bg:["#000000","#0a0a0a"], accent:"#69c9d0", badge:"#000",    badgeFg:"#69c9d0", label:"♪ TikTok" },
      "LinkedIn":   { bg:["#012a4a","#001828"], accent:"#0077b5", badge:"#0077b5", badgeFg:"#fff", label:"in LinkedIn" },
      "Twitter / X":{ bg:["#000000","#050505"], accent:"#1da1f2", badge:"#1da1f2", badgeFg:"#000", label:"𝕏 Twitter" },
      "Facebook":   { bg:["#001848","#0d2261"], accent:"#1877f2", badge:"#1877f2", badgeFg:"#fff", label:"f Facebook" },
    };
    const cfg = CONFIGS[plt] || { bg:["#050010","#1a0a3a"], accent:"#7c3aed", badge:"#6d28d9", badgeFg:"#fff", label:plt };

    // ── BACKGROUND ───────────────────────────────────────────────────────────
    // Base gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    bgGrad.addColorStop(0, cfg.bg[0]); bgGrad.addColorStop(1, cfg.bg[1]);
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    // Diagonal light streak (top-left to center)
    const streak = ctx.createLinearGradient(0, 0, W * 0.65, H * 0.55);
    streak.addColorStop(0, "rgba(255,255,255,0.07)");
    streak.addColorStop(0.4, "rgba(255,255,255,0.02)");
    streak.addColorStop(1, "transparent");
    ctx.fillStyle = streak; ctx.fillRect(0, 0, W, H);

    // Accent color radial glow (bottom-right)
    const accentR = Math.max(W, H) * 0.8;
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.75, 0, W * 0.85, H * 0.75, accentR);
    glow.addColorStop(0, cfg.accent + "28"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // Second glow top-left for depth
    const glow2 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(W,H) * 0.6);
    glow2.addColorStop(0, cfg.accent + "15"); glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);

    // Noise texture
    addNoise(0.018);

    // Geometric accent lines (diagonal)
    ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = "#fff"; ctx.lineWidth = isVertical ? 2 : 1.5;
    for (let i = -H; i < W + H; i += (isVertical ? 120 : 90)) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H * 0.8, H); ctx.stroke();
    }
    ctx.restore();

    // Accent accent bar (left edge)
    ctx.fillStyle = cfg.accent;
    ctx.fillRect(0, 0, isVertical ? 8 : 6, H);

    // ── PLATFORM BADGE (top) — minimal, no style/duration text ──────────────
    const pad = isVertical ? 70 : 48;

    // Just a small accent corner mark — no text badges that look generic
    ctx.fillStyle = cfg.accent;
    ctx.globalAlpha = 0.9;
    // Small decorative accent pill top-left (no text — clean look)
    roundRect(pad, isVertical ? 80 : 48, isVertical ? 8 : 6, isVertical ? 80 : 60, 4);
    ctx.globalAlpha = 1;

    // ── TITLE (large, center of canvas) ──────────────────────────────────────
    const titleFS  = isVertical ? Math.min(96, Math.max(72, Math.floor(1800 / title.length))) : Math.min(80, Math.max(52, Math.floor(1400 / title.length)));
    const titleY   = isVertical ? H * 0.38 : H * 0.35;
    const titleMaxW = W - pad * 2;
    const titleLineH = titleFS * 1.18;

    // Text shadow for depth
    ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = 28; ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
    strokeText(title.toUpperCase(), pad, titleY, "rgba(0,0,0,0.6)", isVertical ? 6 : 4);
    const titleEndY = wrapText(title.toUpperCase(), pad, titleY, titleMaxW, titleLineH, titleFS);

    // ── HOOK LINE ────────────────────────────────────────────────────────────
    const hookFS   = isVertical ? 34 : 24;
    const hookY    = titleEndY + (isVertical ? 52 : 36);
    ctx.shadowBlur = 12; ctx.shadowOffsetY = 2;
    ctx.fillStyle = cfg.accent + "ee";
    ctx.font = `italic 600 ${hookFS}px Arial`;
    wrapText(`"${hook}"`, pad, hookY, titleMaxW, hookFS * 1.4, hookFS, "600");

    // ── BOTTOM BAR ───────────────────────────────────────────────────────────
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    // Fade to black at bottom
    const botFade = ctx.createLinearGradient(0, H - (isVertical ? 280 : 160), 0, H);
    botFade.addColorStop(0, "transparent"); botFade.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = botFade; ctx.fillRect(0, H - (isVertical ? 280 : 160), W, isVertical ? 280 : 160);

    // Accent line above bottom bar
    ctx.fillStyle = cfg.accent + "80";
    ctx.fillRect(pad, H - (isVertical ? 96 : 62), W - pad * 2, 1.5);

    // Bottom text
    const botFS = isVertical ? 26 : 18;
    ctx.font = `700 ${botFS}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.textAlign = "left";
    ctx.fillText(plt === "Instagram" || plt === "TikTok" ? "Follow for more content 🔥" : "Watch now", pad, H - (isVertical ? 54 : 34));
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = `500 ${botFS - 4}px Arial`;
    ctx.textAlign = "right"; ctx.fillText("getvci.com", W - pad, H - (isVertical ? 54 : 34));

    return canvas.toDataURL("image/jpeg", 0.94);
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

    // Style-specific writing approach AND section labels — this is what was missing before.
    // Without this, every style (Story, Tutorial, Comedy...) used the same generic
    // HOOK/PROBLEM/SOLUTION/CTA structure, which made narrative styles like Story feel flat.
    const styleGuide: Record<string, { instruction: string; sectionLabels: string[] }> = {
      "Story": {
        instruction: `Write this as a genuine NARRATIVE STORY, not a sequence of events. These craft rules apply REGARDLESS of what language you write in — translate the techniques, not just the words:

BANNED — never write lines that simply LABEL an emotion instead of showing it. These exact patterns (in any language) are forbidden:
- "It was very scary" / "यह बहुत डरावना था" / any direct statement that something IS scary, weird, or strange
- A character saying "this is scary/strange" out loud as commentary
- "Suddenly a strange sound was heard" with no specific description of WHAT the sound actually was
Instead, SHOW the fear through: specific physical sensations (heart pounding against ribs, throat going dry, legs refusing to move), a precisely described sound/sight (not "a strange noise" but "a low dragging sound, like something heavy being pulled across stone"), and the character's involuntary reaction (stepping back, grabbing the other person's arm, going silent mid-sentence).

STRUCTURE — this must escalate, not just list events one after another:
- SETUP: establish the normal situation and ONE small wrong detail that the character almost ignores
- RISING TENSION: that small detail grows — describe specific sensory escalation (sound gets closer, shadow moves, temperature drops) while the characters try to rationalize it away — this is where most of the suspense should live, don't rush through it
- TWIST/CLIMAX: the moment understanding breaks — be specific and visual, not just "and then something scary happened"
- AFTERMATH: end on ONE precise, chilling final image or line — not a summary, not "and that's how X happened." The last line should leave a specific unsettling image in the viewer's mind.

EXAMPLE OF THE QUALITY BAR (structure, not content, to copy): "The torch flickered. Not from wind — there was no wind down here. Rahul's hand found mine in the dark, gripping too hard. 'Did you hear that?' I hadn't. Not yet. Then I did — a slow scrape, stone against stone, coming from behind the wall we'd just walked past." — Notice: no character says "this is scary," the fear is built through specific physical detail and held tension.

Write with this exact level of specificity and escalation, in whatever language is specified below — Hindi, English, or any other language must follow this SAME craft standard, not a simplified version of it.`,
        sectionLabels: ["HOOK", "SETUP", "RISING TENSION", "TWIST/CLIMAX", "AFTERMATH"],
      },
      "POV": {
        instruction: `Write entirely in first-person present tense, as if the viewer IS the character living this moment right now. Use "I" statements, real-time reactions, and immediate sensory detail. No narrator distance — the viewer should feel like they ARE there.`,
        sectionLabels: ["HOOK", "SITUATION", "ESCALATION", "RESOLUTION"],
      },
      "Tutorial": {
        instruction: `Write as a clear, confident teacher. Each step must be a concrete, actionable instruction — not vague advice. Use specific numbers, tools, or exact phrasing the viewer can copy directly.`,
        sectionLabels: ["HOOK", "PROBLEM", "SOLUTION", "CTA"],
      },
      "Challenge": {
        instruction: `Write with high energy and stakes — frame this as a genuine challenge/dare with a clear rule, a visible struggle, and a payoff moment. Use exclamatory, energetic phrasing throughout.`,
        sectionLabels: ["HOOK", "THE CHALLENGE", "THE STRUGGLE", "THE RESULT"],
      },
      "Before/After": {
        instruction: `Structure around a clear contrast — paint the "before" state vividly (specific pain points), then the "after" state vividly (specific wins). Make the transformation feel earned and concrete, with real specifics, not vague improvement claims.`,
        sectionLabels: ["HOOK", "BEFORE", "THE SHIFT", "AFTER"],
      },
      "Motivation": {
        instruction: `Write with rhythm and emotional build — short punchy lines, repetition for emphasis, and a clear emotional arc from struggle to empowerment. This should feel like it could be read aloud over dramatic music.`,
        sectionLabels: ["HOOK", "THE STRUGGLE", "THE TURNING POINT", "THE CALL TO ACTION"],
      },
      "Tips": {
        instruction: `Each tip must be specific and immediately useful — include a concrete example or number for every tip, never generic advice like "stay consistent." Rank tips from good to best for a satisfying build.`,
        sectionLabels: ["HOOK", "TIP BREAKDOWN", "BONUS TIP", "CTA"],
      },
      "Review": {
        instruction: `Write as an honest, opinionated reviewer — include at least one specific pro AND one specific con with real detail, not generic praise. End with a clear, confident verdict.`,
        sectionLabels: ["HOOK", "FIRST IMPRESSIONS", "PROS & CONS", "VERDICT"],
      },
      "Day in Life": {
        instruction: `Write as a chronological, lived-in narration of real moments — anchor each beat to a specific time of day and a concrete, relatable detail. Avoid generic "then I did X" listing; make each moment feel observed, not summarized.`,
        sectionLabels: ["HOOK", "MORNING/START", "MIDPOINT MOMENT", "WRAP-UP"],
      },
      "Comedy": {
        instruction: `Build toward a clear punchline or comedic twist — use specific, relatable absurdity rather than generic jokes. Timing matters: set up the premise quickly, then land the punch.`,
        sectionLabels: ["HOOK", "SETUP", "ESCALATION", "PUNCHLINE"],
      },
    };

    const currentStyleGuide = styleGuide[style] || styleGuide["Tutorial"];

    const platformGuide: Record<string, string> = {
      "Instagram": `Write this for an Instagram Reel specifically:
- Vertical 9:16 framing implied in every [SHOW X] direction (close-up, face-to-camera energy)
- Hook MUST work with sound OFF too — visual text overlay cues matter as much as spoken words
- Pacing is fast: short sentences, quick cuts implied every 2-3 seconds via [CUT TO]
- End with a save/share-worthy moment, not just "follow me" — Instagram rewards saves and shares over comments
- Tone: aesthetic, aspirational, or relatable — never corporate`,
      "YouTube": `Write this for a YouTube Short or long-form video specifically:
- Hook must promise a clear payoff ("by the end of this video you'll know X") — YouTube viewers expect to know what they're getting
- Slightly more explanatory and narrated than Instagram — YouTube audiences tolerate more setup/context
- Include a natural moment for a subscribe/notification-bell CTA mid-script, not just at the end
- Pacing can breathe more than Instagram — YouTube rewards watch time over raw speed
- Tone: informative, narrative, or entertaining depending on style — built for sustained attention, not a 1-second scroll-stop`,
      "TikTok": `Write this for TikTok specifically:
- Hook must be a pattern-interrupt within the first 1-2 seconds — TikTok's algorithm punishes slow starts harder than any other platform
- Built for trending sounds — leave a clear beat/pause moment where a trending audio drop or transition would hit
- Casual, raw, unpolished tone — overly scripted or "produced" language feels out of place on TikTok
- Should work as a duet or stitch — leave room for a reaction-style ending or open question
- Tone: playful, fast, Gen-Z-native phrasing where appropriate`,
      "LinkedIn": `Write this for LinkedIn specifically:
- Open with a professional insight or contrarian take, NOT an entertainment hook — LinkedIn audiences scroll for value, not entertainment
- No trending audio or fast cuts — this is talking-head or text-overlay style, slower and more deliberate pacing
- Include a clear professional/career/business takeaway, not just personal entertainment
- CTA should invite comments/discussion ("What's your experience with this?") rather than follows
- Tone: credible, insight-driven, first-person professional — never gimmicky`,
      "Twitter / X": `Write this for Twitter/X specifically:
- Hook must be a strong, quotable opening line — Twitter/X rewards shareable, screenshot-worthy statements
- Punchy, short sentences throughout — this is a platform of brevity, avoid long explanatory sentences
- Can include a controversial or strong opinion angle — X rewards engagement-bait more than other platforms
- Works as either a short video script OR could be read as a thread — keep each beat self-contained enough to stand alone
- Tone: direct, opinionated, conversational`,
      "Facebook": `Write this for Facebook Reels/video specifically:
- Hook should be emotionally warm or nostalgic — Facebook's audience skews older and responds to relatable, community-oriented content over trend-chasing
- Slightly slower pacing than Instagram/TikTok — less reliant on rapid cuts
- CTA should encourage sharing within groups/family, not just personal follows
- Tone: warm, community-focused, accessible to a broad age range — avoid niche internet slang`,
    };

    const prompt = `You are a viral ${platform} content creator and an experienced ${style.toLowerCase()} scriptwriter.

Create a complete ${duration} ${style} script for ${platform} about: "${keyword}"

Platform: ${platform}
Style: ${style}
Duration: ${duration}
Format Guide: ${durationGuide[duration]}
Language: ${langStrict}

PLATFORM-SPECIFIC RULES FOR "${platform}" (the script must feel native to this platform, not generic):
${platformGuide[platform] || platformGuide["Instagram"]}

STYLE-SPECIFIC WRITING RULES FOR "${style}" (follow these closely — this is what makes the script feel professional rather than generic):
${currentStyleGuide.instruction}

CRITICAL: The craft quality above (specificity, escalation, sensory detail, avoiding generic/labeled emotion) applies with FULL FORCE regardless of the output language. Writing in Hindi, Tamil, or any other language is NOT an excuse to simplify the storytelling craft — translate the technique fully, not just produce a simpler version because it's in another language. A native speaker reading this should feel genuine craft, not a watered-down translation.

Create a script that will go VIRAL. Be specific, emotional, and platform-perfect. Avoid vague, generic filler sentences — every line should earn its place.

Respond ONLY in JSON:
{
  "title": "Catchy title for this script",
  "hook": "First 3 seconds — attention grabbing opener",
  "script": "Complete word-for-word script with [PAUSE], [SHOW X], [CUT TO] stage directions, written fully in the ${style} style described above",
  "sections": [
    {"time": "0-3s", "label": "${currentStyleGuide.sectionLabels[0]}", "content": "exact words to say", "direction": "what to show/do"},
    {"time": "appropriate timing", "label": "${currentStyleGuide.sectionLabels[1]}", "content": "exact words", "direction": "visual direction"},
    {"time": "appropriate timing", "label": "${currentStyleGuide.sectionLabels[2]}", "content": "exact words", "direction": "visual direction"},
    {"time": "final timing", "label": "${currentStyleGuide.sectionLabels[3] || currentStyleGuide.sectionLabels[2]}", "content": "exact words", "direction": "visual direction"}
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
      if (onCreditUsedGenerate) onCreditUsedGenerate();
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
              <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Enter a keyword → get a complete word-for-word script</p>
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
                <button onClick={() => {
                  const link = document.createElement("a");
                  link.href = thumbnailUrl!;
                  link.download = `vci-thumbnail-${keyword.replace(/\s+/g,"-")}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.2rem 0.7rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, fontFamily: "inherit" }}>
                  ⬇ Download
                </button>
              </div>
              <img src={thumbnailUrl!} alt="Generated Thumbnail" style={{ width: "100%", borderRadius: "10px", display: "block", border: "1px solid #222" }} />
              {generateResult.thumbnail_idea && (
                <p style={{ margin: "0.5rem 0 0", color: "#52525b", fontSize: "0.68rem", lineHeight: 1.5 }}>💡 {generateResult.thumbnail_idea}</p>
              )}
            </div>
          )}

          {/* AI Voice — Convert script to spoken audio */}
          <div style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(6,182,212,0.02))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>🔊 CONVERT TO AI VOICE</p>
              <span style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "10px" }}>Neural TTS</span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  LANGUAGE
                  {voiceLangAutoSet && AZURE_VOICES[langLabel] && <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "0.05rem 0.4rem", borderRadius: "8px", fontSize: "0.58rem", fontWeight: 700 }}>auto-matched</span>}
                </label>
                <select value={voiceLang} onChange={e => { setVoiceLang(e.target.value); setVoiceStyle("Default"); setVoiceLangAutoSet(false); }}
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

            {/* Tone/Style — only shown when the selected voice supports it */}
            {AZURE_VOICES[voiceLang]?.styles && (
              <div style={{ marginBottom: "0.6rem" }}>
                <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>TONE</label>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {AZURE_VOICES[voiceLang]!.styles!.map(s => (
                    <button key={s} onClick={() => setVoiceStyle(s)}
                      style={{ background: voiceStyle === s ? "rgba(6,182,212,0.15)" : "#080808", border: `1px solid ${voiceStyle === s ? "#06b6d4" : "#1f1f1f"}`, color: voiceStyle === s ? "#06b6d4" : "#52525b", padding: "0.3rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speaking speed */}
            <div style={{ marginBottom: "0.7rem" }}>
              <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>SPEED</label>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {VOICE_SPEEDS.map(s => (
                  <button key={s.value} onClick={() => setVoiceSpeed(s.value)}
                    style={{ flex: 1, background: voiceSpeed === s.value ? "rgba(6,182,212,0.15)" : "#080808", border: `1px solid ${voiceSpeed === s.value ? "#06b6d4" : "#1f1f1f"}`, color: voiceSpeed === s.value ? "#06b6d4" : "#52525b", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.74rem", fontWeight: 600 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {voiceError && <p style={{ color: "#ef4444", fontSize: "0.72rem", margin: "0 0 0.5rem" }}>{voiceError}</p>}

            <button onClick={() => convertToVoice(generateResult.script)} disabled={voiceLoading}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: voiceLoading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: voiceLoading ? "#444" : "#000", fontWeight: 700, fontSize: "0.84rem", cursor: voiceLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              {voiceLoading ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating voice...</> : "🎙️ Generate Voiceover"}
            </button>

            {audioUrl && (
              <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", animation: "slideUp 0.3s ease" }}>
                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.6rem" }}>
                  <audio controls src={audioUrl} style={{ width: "100%" }} />
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <span style={{ flex: 1, textAlign: "center", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#52525b", padding: "0.4rem", borderRadius: "8px", fontSize: "0.68rem" }}>
                    {voiceLang} · {voiceGender}{voiceStyle !== "Default" ? ` · ${voiceStyle}` : ""}
                  </span>
                </div>
                <a href={audioUrl} download={`vci-voiceover-${voiceLang}-${voiceGender}.mp3`}
                  style={{ textAlign: "center", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                  ⬇ Download MP3
                </a>
              </div>
            )}
          </div>

          {/* Audio */}
          {/* 🎵 BACKGROUND MUSIC */}
          {/* 🎵 BACKGROUND MUSIC — auto-mixes on voiceover generation */}
          {audioUrl && <BackgroundMusicMixer audioUrl={audioUrl} scriptStyle={style} />}

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

          {/* AI Voice — Convert the IMPROVED script to spoken audio */}
          <div style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(6,182,212,0.02))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#06b6d4", fontWeight: 700, letterSpacing: "0.06em" }}>🔊 CONVERT IMPROVED SCRIPT TO AI VOICE</p>
              <span style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "10px" }}>Neural TTS</span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  LANGUAGE
                  {voiceLangAutoSet && AZURE_VOICES[langLabel] && <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "0.05rem 0.4rem", borderRadius: "8px", fontSize: "0.58rem", fontWeight: 700 }}>auto-matched</span>}
                </label>
                <select value={voiceLang} onChange={e => { setVoiceLang(e.target.value); setVoiceStyle("Default"); setVoiceLangAutoSet(false); }}
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

            {AZURE_VOICES[voiceLang]?.styles && (
              <div style={{ marginBottom: "0.6rem" }}>
                <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>TONE</label>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {AZURE_VOICES[voiceLang]!.styles!.map(s => (
                    <button key={s} onClick={() => setVoiceStyle(s)}
                      style={{ background: voiceStyle === s ? "rgba(6,182,212,0.15)" : "#080808", border: `1px solid ${voiceStyle === s ? "#06b6d4" : "#1f1f1f"}`, color: voiceStyle === s ? "#06b6d4" : "#52525b", padding: "0.3rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "0.7rem" }}>
              <label style={{ display: "block", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, marginBottom: "0.3rem" }}>SPEED</label>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {VOICE_SPEEDS.map(s => (
                  <button key={s.value} onClick={() => setVoiceSpeed(s.value)}
                    style={{ flex: 1, background: voiceSpeed === s.value ? "rgba(6,182,212,0.15)" : "#080808", border: `1px solid ${voiceSpeed === s.value ? "#06b6d4" : "#1f1f1f"}`, color: voiceSpeed === s.value ? "#06b6d4" : "#52525b", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.74rem", fontWeight: 600 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {voiceError && <p style={{ color: "#ef4444", fontSize: "0.72rem", margin: "0 0 0.5rem" }}>{voiceError}</p>}

            <button onClick={() => convertToVoice(improveResult.after?.script || "")} disabled={voiceLoading}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: voiceLoading ? "#111" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", color: voiceLoading ? "#444" : "#000", fontWeight: 700, fontSize: "0.84rem", cursor: voiceLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              {voiceLoading ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating voice...</> : "🎙️ Generate Voiceover for Improved Script"}
            </button>

            {audioUrl && (
              <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", animation: "slideUp 0.3s ease" }}>
                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.6rem" }}>
                  <audio controls src={audioUrl} style={{ width: "100%" }} />
                </div>
                <span style={{ textAlign: "center", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#52525b", padding: "0.4rem", borderRadius: "8px", fontSize: "0.68rem" }}>
                  {voiceLang} · {voiceGender}{voiceStyle !== "Default" ? ` · ${voiceStyle}` : ""}
                </span>
                <a href={audioUrl} download={`vci-voiceover-improved-${voiceLang}-${voiceGender}.mp3`}
                  style={{ textAlign: "center", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                  ⬇ Download MP3
                </a>
              </div>
            )}
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
function HookScoreAnalyzer({ plan, usageCount, limit, onUpgrade, langStrict, onSaveHistory, onCreditUsed, userType }: any) {
  const [contentInput, setContentInput] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ALL_SCORE_PLATFORMS = [
    { id: "Instagram", emoji: "📸" }, { id: "YouTube", emoji: "▶️" },
    { id: "LinkedIn", emoji: "💼" }, { id: "Twitter / X", emoji: "🐦" },
    { id: "Facebook", emoji: "📘" }, { id: "TikTok", emoji: "🎵" },
  ];
  const ADS_SCORE_PLATFORMS = [
    { id: "Google Ads", emoji: "📢" }, { id: "Meta Ads", emoji: "📘" },
    { id: "YouTube Ads", emoji: "▶️" }, { id: "Native Ads", emoji: "📰" },
  ];
  const SCORE_PLATFORMS = userType === "business" ? ADS_SCORE_PLATFORMS : ALL_SCORE_PLATFORMS;

  useEffect(() => {
    if (userType === "business" && platform === "Instagram") setPlatform("Google Ads");
  }, [userType]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    fireCopySignal("hookscore", key, text, { platform });
  };

  const SCORE_PLATFORM_GUIDE: Record<string, string> = {
    "Instagram": "Aesthetic, visual-first, fast-paced. Hooks must work as text overlay even with sound off.",
    "YouTube": "Hooks should promise a clear payoff. Slightly more explanatory tone, SEO-aware.",
    "LinkedIn": "Professional insight or contrarian-take tone. No slang, no entertainment framing.",
    "Twitter / X": "Punchy, quotable, opinionated one-liners — screenshot-worthy on their own.",
    "Facebook": "Warm, community/family-oriented tone for a slightly older audience.",
    "TikTok": "Raw, casual, pattern-interrupt energy within 1-2 seconds. Unpolished, trend-aware phrasing.",
    "Google Ads": "Search-intent driven, benefit + urgency in tight character limits (headlines max 30 chars), no fluff.",
    "Meta Ads": "Scroll-stopping, pain-point-led, written for a passive social feed audience rather than active searchers.",
  };

  const analyze = async () => {
    if (!contentInput.trim()) { setError("Please paste your content or hook first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are an expert viral content analyst and coach who deeply understands how content actually performs on ${platform} specifically. Analyze this content for ${platform}:

CONTENT TO ANALYZE:
"""
${contentInput}
"""

PLATFORM: ${platform}

PLATFORM-SPECIFIC TONE FOR "${platform}" (your 3 improved versions must genuinely sound native to this platform, not generic):
${SCORE_PLATFORM_GUIDE[platform] || SCORE_PLATFORM_GUIDE["Instagram"]}

LANGUAGE RULE: Detect the language of the content and respond in the SAME language. Hindi content = Hindi response. English = English.

ANALYSIS RULES:
- Score out of 100 (not 10). Be strict — average content scores 40-60.
- Analyze the FULL content, not just first line
- Give LINE-BY-LINE feedback on weak parts
- Give 3 platform-specific improved versions, written in the platform tone described above — not generic rewrites
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
      if (onCreditUsed) onCreditUsed();
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
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Paste your content → get detailed analysis, fixes, and 3 improved versions</p>
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
                    ⚠️ {fix.problem && fix.problem !== "no specific lines to fix" ? fix.problem : "Suggested improvements for your content"}
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

function ContentCalendar({ plan, usageCount, limit, onUpgrade, keyword, niche, langStrict, onSaveHistory, onCreditUsed, userType }: any) {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [calKeyword, setCalKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [calPlatform, setCalPlatform] = useState("Instagram");

  const ALL_CAL_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" }, { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" }, { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" }, { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
  ];
  const ADS_CAL_PLATFORMS = [
    { id: "Google Ads", emoji: "📢", color: "#4285f4" }, { id: "Meta Ads", emoji: "📘", color: "#1877f2" },
    { id: "YouTube Ads", emoji: "▶️", color: "#ef4444" }, { id: "Native Ads", emoji: "📰", color: "#f59e0b" },
  ];
  const CAL_PLATFORMS = userType === "business" ? ADS_CAL_PLATFORMS : ALL_CAL_PLATFORMS;

  useEffect(() => {
    if (userType === "business" && calPlatform === "Instagram") setCalPlatform("Google Ads");
  }, [userType]);

  const CAL_PLATFORM_GUIDE: Record<string, string> = {
    "Instagram": "Aesthetic, visual-first, fast-paced. Hooks must work as text overlay even with sound off.",
    "YouTube": "Hooks should promise a clear payoff. Slightly more explanatory tone, SEO-aware.",
    "Facebook": "Warm, community/family-oriented tone for a slightly older audience. Less trend-chasing slang.",
    "TikTok": "Raw, casual, pattern-interrupt energy within 1-2 seconds. Unpolished, trend-aware phrasing.",
    "LinkedIn": "Professional insight or contrarian-take tone. No slang, no entertainment framing — credible takeaways only.",
    "Twitter / X": "Punchy, quotable, opinionated one-liners — screenshot-worthy on their own.",
    "Pinterest": "Keyword-rich, benefit-stated clearly upfront — functions like search, not entertainment.",
    "Google Ads": "Search-intent driven, benefit + urgency in tight character limits, no fluff.",
    "Meta Ads": "Scroll-stopping, pain-point-led, written for a passive social feed audience rather than active searchers.",
    "YouTube Ads": "First-5-second hook that stops a skip, then a clear value statement.",
    "Native Ads": "Editorial-style, blends with content, curiosity-driven rather than promotional.",
  };

  const generate = async () => {
    if (!calKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setCalendar([]);

    const prompt = `You are an experienced ${calPlatform} content strategist who deeply understands how content is actually written and consumed on this specific platform. Create a 30-day content calendar.
Platform: ${calPlatform}
Keyword: "${calKeyword}"
Niche: ${niche}
OUTPUT LANGUAGE: ${langStrict} — Write ALL hooks and notes in this language/script only. No English mixing.

PLATFORM-SPECIFIC TONE FOR "${calPlatform}" (every hook must genuinely sound native to this platform, not generic):
${CAL_PLATFORM_GUIDE[calPlatform] || CAL_PLATFORM_GUIDE["Instagram"]}

STRICT RULES:
- Every hook must be platform-specific for ${calPlatform}, following the tone above
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
      if (onCreditUsed) onCreditUsed();
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
            <button onClick={() => { const allText = calendar.map(d => `Day ${d.day} (${d.type}): ${d.hook}`).join("\n"); navigator.clipboard.writeText(allText); fireCopySignal("calendar", "all", allText, { niche, platform: calPlatform }); }} style={{ background: "#ffffff0a", border: "1px solid #2a2a2a", color: "#666", padding: "0.25rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Copy All</button>
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
                      onClick={() => { navigator.clipboard.writeText(day.hook); setCopiedDay(day.day); setTimeout(() => setCopiedDay(null), 1500); fireCopySignal("calendar", "day_hook", day.hook, { niche, platform: calPlatform }); }}>
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

function ContentPack({ plan, usageCount, limit, onUpgrade, keyword, niche, platform, langStrict, onSaveHistory, onCreditUsed, userType }: any) {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<any>(null);
  const [packKeyword, setPackKeyword] = useState(keyword || "");
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [packType, setPackType] = useState<"ads" | "youtube" | "instagram">(userType === "business" ? "ads" : "instagram");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const ALL_PACK_TYPES = [
    { id: "instagram", label: "📸 Instagram & TikTok", desc: "Hooks, Reels, Captions, Hashtags" },
    { id: "youtube", label: "▶️ YouTube", desc: "Titles, Scripts, Descriptions, Tags" },
    { id: "ads", label: "📢 Google & Meta Ads", desc: "Headlines, Ad Copy, CTAs" },
  ];
  const PACK_TYPES = userType === "business" ? ALL_PACK_TYPES.filter(p => p.id === "ads") : ALL_PACK_TYPES;

  const generate = async () => {
    if (!packKeyword.trim()) { setError("Enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setPack(null);

    const packPrompts: Record<string, string> = {
      instagram: `You are an experienced Instagram & TikTok content strategist who understands these are two DIFFERENT platforms with different tones, even though you're creating one combined pack.
- For Instagram-style items: aesthetic, visual-first, aspirational/relatable tone — hooks must work as text overlay even with sound off.
- For TikTok-style items: raw, casual, pattern-interrupt energy in the first 1-2 seconds — unpolished, trend-aware phrasing.
Generate (clearly favor Instagram tone for hooks/captions and TikTok tone for scripts, since scripts are typically TikTok/Reel-style fast content):
- hooks: 10 viral opening lines (Instagram-style aesthetic/aspirational tone)
- titles: 8 post/reel title ideas
- captions: 5 full captions with emojis and CTA (Instagram tone — emojis used naturally not decoratively)
- scripts: 5 Reel/TikTok scripts (TikTok pacing — fast, pattern-interrupt hook, casual phrasing)
- hashtags: 15 relevant hashtags`,
      youtube: `You are an experienced YouTube content strategist. Write with YouTube's specific audience expectations in mind: viewers expect a clear payoff promised early, slightly more explanatory/narrative pacing than short-form platforms, and SEO-aware phrasing since YouTube is a search engine as much as a social platform.
Generate:
- hooks: 8 video hook lines (each promising a clear payoff, e.g. "by the end of this you'll know...")
- titles: 10 SEO-optimized video titles (curiosity-driven but also keyword-rich for search)
- captions: 5 video descriptions (slightly longer, narrative, search-friendly)
- scripts: 5 full intro scripts (paced for sustained watch time, not a 1-second scroll-stop)
- hashtags: 10 YouTube tags (treated as searchable keywords, not decoration)`,
      ads: `You are a senior paid-ads copywriter with deep experience writing for both Google Search Ads and Meta (Facebook/Instagram) Ads — and you know these are NOT interchangeable formats.
- Google Ads style: search-intent driven, benefit + urgency in tight character limits, no fluff.
- Meta Ads style: scroll-stopping, pain-point-led, written for a passive social feed audience rather than active searchers.
Generate:
- hooks: 10 Google Ad headlines (STRICTLY MAX 30 characters each, search-intent driven, each a genuinely different angle — not repetitive)
- titles: 8 Meta Ad headlines (STRICTLY MAX 40 characters each, scroll-stopping benefit statements)
- captions: 5 ad descriptions (STRICTLY MAX 90 characters each, benefit + soft CTA)
- scripts: 5 Meta ad primary texts (pain point → agitate → solution → CTA structure, 150-200 characters each)
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
      if (onCreditUsed) onCreditUsed();
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
    const text = items.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
    fireCopySignal("pack", key, text, { niche, platform });
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


function CaptionHashtags({ plan, usageCount, limit, onUpgrade, keyword, niche, langStrict, onCreditUsed, onSaveHistory, userType }: any) {
  const [kw, setKw] = useState(keyword || "");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ALL_CAPTION_PLATFORMS = [
    { id: "Instagram", emoji: "📸", color: "#e1306c" },
    { id: "YouTube", emoji: "▶️", color: "#ef4444" },
    { id: "TikTok", emoji: "🎵", color: "#69c9d0" },
    { id: "LinkedIn", emoji: "💼", color: "#0077b5" },
    { id: "Twitter / X", emoji: "🐦", color: "#1da1f2" },
    { id: "Facebook", emoji: "📘", color: "#1877f2" },
    { id: "Pinterest", emoji: "📌", color: "#e60023" },
    { id: "WhatsApp", emoji: "💬", color: "#25d366" },
  ];
  const ADS_CAPTION_PLATFORMS = [
    { id: "Google Ads", emoji: "📢", color: "#4285f4" },
    { id: "Meta Ads", emoji: "📘", color: "#1877f2" },
    { id: "YouTube Ads", emoji: "▶️", color: "#ef4444" },
    { id: "Native Ads", emoji: "📰", color: "#f59e0b" },
  ];
  const PLATFORMS = userType === "business" ? ADS_CAPTION_PLATFORMS : ALL_CAPTION_PLATFORMS;

  useEffect(() => {
    if (userType === "business" && platform === "Instagram") setPlatform("Google Ads");
  }, [userType]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    fireCopySignal("caption", key, text, { niche, platform });
  };

  useEffect(() => { setKw(keyword || ""); }, [keyword]);

  const CAPTION_PLATFORM_GUIDE: Record<string, string> = {
    "Instagram": "Aesthetic, visual-first tone. Emojis used naturally, not decoratively. Hashtags: mix of broad reach tags and niche-specific tags.",
    "YouTube": "Slightly longer, SEO-aware descriptions — written to also help search/discovery, not just engagement. Hashtags: fewer, more keyword-precise (YouTube treats hashtags as searchable tags, not decoration).",
    "TikTok": "Short, punchy, casual, trend-aware phrasing. Hashtags: mix of broad trending tags and niche tags, written the way TikTok captions actually look (lowercase, casual).",
    "LinkedIn": "Professional, insight-led tone — no slang, no emoji overload (1 max). Hashtags: industry/professional terms only, never entertainment-style tags.",
    "Twitter / X": "Punchy, opinionated, quotable one-liners — written like a real tweet, not a caption. Hashtags: very few (1-2 max), X culture treats heavy hashtag use as spammy.",
    "Facebook": "Warm, conversational, slightly longer-form storytelling tone suited to an older, community-oriented audience. Hashtags: minimal, Facebook doesn't reward heavy hashtag use.",
    "Pinterest": "Keyword-rich, benefit-stated clearly upfront — Pinterest captions function like search snippets, not entertainment hooks. Hashtags: descriptive, search-intent driven.",
    "WhatsApp": "Personal, direct, one-to-one message tone — written like something a friend would send, not a public post. Hashtags: not used at all on WhatsApp, generate empty array.",
    "Google Ads": "Search-intent driven, benefit + urgency in tight character limits, no fluff. Hashtags: not applicable, generate empty array.",
    "Meta Ads": "Scroll-stopping, pain-point-led ad copy for a passive feed audience. Hashtags: not applicable, generate empty array.",
    "YouTube Ads": "First-5-second hook that stops a skip, natural spoken tone. Hashtags: not applicable, generate empty array.",
    "Native Ads": "Editorial-style, blends with content, curiosity-driven. Hashtags: not applicable, generate empty array.",
  };

  const generate = async () => {
    if (!kw.trim()) { setError("Please enter a keyword first."); return; }
    if (usageCount >= limit) { onUpgrade(); return; }
    setLoading(true); setError(""); setResult(null);

    const prompt = `You are an experienced ${platform} content writer who deeply understands how content is actually written and consumed on this specific platform.
Keyword: "${kw}"
Platform: ${platform}
OUTPUT LANGUAGE: ${langStrict}

PLATFORM-SPECIFIC TONE FOR "${platform}" (the captions must feel native to this platform, not generic):
${CAPTION_PLATFORM_GUIDE[platform] || CAPTION_PLATFORM_GUIDE["Instagram"]}

IMPORTANT: Generate content ONLY about the keyword "${kw}". Ignore any other context.

Generate ONLY:
1. 5 ready-to-post captions (with emojis where platform-appropriate, CTA, engaging tone) — all about "${kw}", written in the platform tone described above
2. 20 relevant hashtags specific to "${kw}" (or an empty array if the platform tone above says hashtags aren't used)

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
            <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>Select platform → enter keyword → get ready-to-post captions</p>
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

function PaymentModal({ plan, onClose, onPaid, detectedCurrency }: any) {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [rzpReady, setRzpReady] = useState<boolean|null>(null);

  const planData = PLANS[plan as keyof typeof PLANS];
  const priceINR = Math.round(planData?.priceINR || 0);

  // Check if Razorpay is working on mount
  useEffect(() => {
    fetch("https://viral-tool-1.onrender.com/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100, plan: "test" })
    }).then(r => {
      // If backend responds (even with error) = backend ok
      setRzpReady(true);
    }).catch(() => setRzpReady(false));
  }, []);

  const payWithRazorpay = async () => {
    setLoading(true); setError("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK load failed.");

      const orderRes = await fetch("https://viral-tool-1.onrender.com/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: priceINR * 100, plan })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Order creation failed.");
      }

      const { data: { user } } = await (window as any).supabase?.auth?.getUser() || { data: { user: null } };

      const rzp = new (window as any).Razorpay({
        key:         RAZORPAY_KEY_ID,
        amount:      priceINR * 100,
        currency:    "INR",
        name:        "VCI — Viral Content Intelligence",
        description: `${planData?.label} Plan · ${planData?.limit} credits`,
        order_id:    orderData.orderId,
        prefill:     { email: user?.email || "", contact: "" },
        notes:       { plan, user_id: user?.id || "" },
        theme:       { color: "#7c3aed" },
        modal: { ondismiss: () => { setLoading(false); } },
        handler: async (response: any) => {
          try {
            const vRes = await fetch("https://viral-tool-1.onrender.com/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan, userId: user?.id || "", userEmail: user?.email || "",
                refCode: (() => { try { return localStorage.getItem("vci_ref") || ""; } catch { return ""; } })(),
              })
            });
            const result = await vRes.json();
            if (result.success) { setSuccess(true); setTimeout(() => onPaid(plan), 2500); }
            else { setError("Plan activation failed. Contact support: " + SUPPORT_PHONE); }
          } catch { setError("Payment received. Activation pending — contact support: " + SUPPORT_PHONE); }
          setLoading(false);
        }
      });
      rzp.on("payment.failed", (resp: any) => {
        setError("Payment failed: " + (resp?.error?.description || "Try UPI QR below."));
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.96)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#080810", border:"2px solid #22c55e", borderRadius:"20px", padding:"2.5rem 2rem", maxWidth:"380px", width:"100%", textAlign:"center", animation:"slideUp .3s ease" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(34,197,94,.1)", border:"2px solid #22c55e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", margin:"0 auto 1rem" }}>🎉</div>
        <h2 style={{ fontWeight:900, fontSize:"1.3rem", color:"#22c55e", margin:"0 0 .5rem" }}>Payment Successful!</h2>
        <p style={{ color:"#71717a", fontSize:".85rem", margin:"0 0 1.25rem" }}>{planData?.label} plan activating...</p>
        <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.18)", borderRadius:"12px", padding:"1rem" }}>
          <p style={{ color:"#22c55e", fontWeight:800, margin:"0 0 .25rem" }}>✓ {planData?.limit} credits added</p>
          <p style={{ color:"#52525b", fontSize:".75rem", margin:0 }}>Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.96)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#080810", border:"1px solid rgba(124,58,237,.3)", borderRadius:"20px", padding:"1.75rem", maxWidth:"420px", width:"100%", color:"#fff", animation:"slideUp .3s ease" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:".4rem", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"20px", padding:".25rem .85rem", marginBottom:".75rem" }}>
            <span style={{ fontSize:".65rem", color:"#a855f7", fontWeight:700 }}>🔒 Secured Payment</span>
          </div>
          <h2 style={{ fontWeight:900, fontSize:"1.2rem", margin:"0 0 .5rem" }}>Complete Your Purchase</h2>
          <div style={{ display:"inline-flex", alignItems:"baseline", gap:".4rem", background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.15)", borderRadius:"10px", padding:".4rem 1rem" }}>
            <span style={{ fontWeight:800, color:"#e2e8f0" }}>{planData?.label}</span>
            <span style={{ color:"#a855f7", fontWeight:900, fontSize:"1.3rem" }}>₹{priceINR}</span>
            <span style={{ color:"#3f3f46", fontSize:".72rem" }}>/month</span>
          </div>
        </div>

        {/* Credits pill */}
        <div style={{ background:"rgba(34,197,94,.04)", border:"1px solid rgba(34,197,94,.15)", borderRadius:"10px", padding:".6rem 1rem", marginBottom:"1.25rem", display:"flex", gap:".65rem", alignItems:"center" }}>
          <span style={{ fontSize:"1rem", flexShrink:0 }}>⚡</span>
          <p style={{ color:"#94a3b8", fontSize:".75rem", margin:0, lineHeight:1.6 }}>
            <strong style={{ color:"#22c55e" }}>{planData?.limit} credits/month</strong> · Instant activation · All features · Cancel anytime
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.22)", borderRadius:"10px", padding:".75rem 1rem", marginBottom:"1rem" }}>
            <p style={{ color:"#f87171", fontSize:".78rem", margin:0, lineHeight:1.5 }}>⚠️ {error}</p>
          </div>
        )}

        {/* ── OPTION A: Razorpay ── */}
        <div style={{ background:"#050508", border:"1px solid #1a1a2e", borderRadius:"14px", padding:"1.1rem", marginBottom:".75rem" }}>
          <p style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", letterSpacing:".08em", margin:"0 0 .75rem", textTransform:"uppercase" }}>Option 1 — Pay Online</p>
          <button onClick={payWithRazorpay} disabled={loading}
            style={{ width:"100%", padding:".9rem", borderRadius:"11px", background:loading?"#0d0d18":"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:loading?"#444":"#fff", fontWeight:800, fontSize:".95rem", cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".55rem", boxShadow:loading?"none":"0 6px 24px rgba(109,40,217,.3)", marginBottom:".65rem" }}>
            {loading
              ? <><span style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0 }} /> Processing...</>
              : <>💳 Pay ₹{priceINR} — UPI / Card / NetBanking</>
            }
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:".4rem", flexWrap:"wrap" }}>
            {["📱 PhonePe","🔵 GPay","🟡 Paytm","💳 Cards","🏦 NetBanking"].map(m => (
              <span key={m} style={{ color:"#3f3f46", fontSize:".6rem", fontWeight:600 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", margin:".75rem 0" }}>
          <div style={{ flex:1, height:"1px", background:"#141426" }} />
          <span style={{ color:"#27272a", fontSize:".62rem", fontWeight:700 }}>OR</span>
          <div style={{ flex:1, height:"1px", background:"#141426" }} />
        </div>

        {/* ── OPTION B: Direct UPI ── */}
        <div style={{ background:"#050508", border:"1px solid #1a1a2e", borderRadius:"14px", padding:"1.1rem", marginBottom:".75rem" }}>
          <p style={{ fontSize:".6rem", fontWeight:800, color:"#52525b", letterSpacing:".08em", margin:"0 0 .85rem", textTransform:"uppercase" }}>Option 2 — Direct UPI Transfer</p>

          {/* QR Code */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:".75rem" }}>
            <div style={{ background:"#fff", borderRadius:"12px", padding:"10px", boxShadow:"0 4px 20px rgba(0,0,0,.3)" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${YOUR_UPI_ID}&pn=VCI&am=${priceINR}&cu=INR&tn=VCI${planData?.label?.replace(/\s/g,"")}Plan`)}&bgcolor=ffffff&color=000000&margin=6`}
                alt="UPI QR Code"
                style={{ width:160, height:160, display:"block" }}
              />
            </div>
          </div>

          {/* UPI ID */}
          <div style={{ background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:"9px", padding:".55rem .9rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:".5rem", marginBottom:".5rem" }}>
            <div>
              <p style={{ color:"#52525b", fontSize:".58rem", fontWeight:700, margin:"0 0 .1rem", textTransform:"uppercase", letterSpacing:".05em" }}>UPI ID</p>
              <p style={{ color:"#a855f7", fontWeight:700, fontSize:".85rem", margin:0 }}>{YOUR_UPI_ID}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
              style={{ background:copied?"rgba(34,197,94,.1)":"rgba(124,58,237,.1)", border:`1px solid ${copied?"rgba(34,197,94,.3)":"rgba(124,58,237,.25)"}`, color:copied?"#22c55e":"#a855f7", padding:".25rem .65rem", borderRadius:"7px", cursor:"pointer", fontSize:".68rem", fontWeight:800, fontFamily:"inherit", flexShrink:0 }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div style={{ background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.15)", borderRadius:"8px", padding:".5rem .75rem", marginBottom:".75rem" }}>
            <p style={{ color:"#a16207", fontSize:".7rem", margin:0, lineHeight:1.5 }}>
              💡 Amount <strong style={{ color:"#f59e0b" }}>₹{priceINR}</strong> — Add this amount manually if not auto-filled
            </p>
          </div>

          {/* After UPI — WhatsApp */}
          <button onClick={() => {
            const msg = encodeURIComponent(`Hi! I've paid ₹${priceINR} for VCI ${planData?.label} plan via UPI.

My registered email: (type here)
UPI Transaction ID: (paste here)

Please activate my account. Thank you!`);
            window.open(`https://wa.me/${SUPPORT_PHONE.replace(/[^0-9]/g,"")}?text=${msg}`, "_blank");
          }}
            style={{ width:"100%", padding:".75rem", borderRadius:"10px", background:"rgba(37,211,102,.06)", border:"1px solid rgba(37,211,102,.22)", color:"#25d366", fontWeight:800, fontSize:".82rem", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem" }}>
            <span style={{ fontSize:"1rem" }}>💬</span> Done Paying — Send Screenshot on WhatsApp
          </button>
          <p style={{ color:"#3f3f46", fontSize:".62rem", textAlign:"center", margin:".4rem 0 0", lineHeight:1.5 }}>
            Send screenshot → activated within 2 hours
          </p>
        </div>

        {/* Trust */}
        <div style={{ display:"flex", justifyContent:"center", gap:"1rem", marginBottom:".6rem", flexWrap:"wrap" }}>
          {["🔒 SSL Secured","✓ Instant Activation","↩️ 24hr Refund"].map(t => (
            <span key={t} style={{ color:"#27272a", fontSize:".6rem", fontWeight:600 }}>{t}</span>
          ))}
        </div>

        <button onClick={onClose}
          style={{ width:"100%", background:"none", border:"none", color:"#3f3f46", cursor:"pointer", fontSize:".75rem", padding:".4rem", fontFamily:"inherit" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}


function PaywallModal({ onClose, onSelectPlan, currency }: any) {
  const [selected, setSelected] = useState("creator_starter");
  const isUSD = currency === "USD";
  const selectedPlan = PLANS[selected as keyof typeof PLANS];

  const PLAN_FEATURES: Record<string, { features: string[]; highlight?: string; section: "creator" | "advertiser" | "agency" }> = {
    creator_starter: {
      section: "creator",
      highlight: "🔥 Most Popular",
      features: [
        "⚡ Viral Content Generator",
        "📊 Hook Score Analyzer",
        "📋 Caption & Hashtag Generator",
        "🎬 Script Lab — Full Reel Pipeline",
        "🖼️ Auto Thumbnail Generator",
        "🎙️ AI Voiceover — 7 Indian Languages",
        "🎛️ Mix Studio — Professional Audio Ducking",
        "📅 30-Day Content Calendar",
        "📦 Content Pack (50+ pieces)",
        "🖼️ Image AI",
        "🔍 Niche Intelligence — Free",
        "📈 Trends Feed — Free",
      ],
    },
    creator_pro: {
      section: "creator",
      highlight: "⚡ Best Value",
      features: [
        "Everything in Creator Starter",
        "🔄 Auto-Repurpose Engine (8 platforms)",
        "🕵️ Competitor Hook Analyzer",
        "550 credits — 4× more than Starter",
      ],
    },
    advertiser: {
      section: "advertiser",
      highlight: "📢 Advertiser Exclusive",
      features: [
        "Everything in Creator Pro",
        "📊 Ad ROI Calculator",
        "🧪 A/B Ad Copy Generator",
        "🖥️ Landing Page Copy Generator",
        "Google Ads + Meta Ads platforms",
        "1,100 credits — 2× Creator Pro",
      ],
    },
    agency: {
      section: "agency",
      highlight: "👑 All Access",
      features: [
        "All Creator + Advertiser tools",
        "2,800 credits — unlimited workflow",
        "Multiple clients, all platforms",
      ],
    },
  };

  const sectionColor = {
    creator:    { border: "#a855f7", bg: "rgba(168,85,247,0.07)", badge: "rgba(168,85,247,0.12)", badgeText: "#a855f7" },
    advertiser: { border: "#06b6d4", bg: "rgba(6,182,212,0.07)",  badge: "rgba(6,182,212,0.12)",  badgeText: "#06b6d4" },
    agency:     { border: "#f59e0b", bg: "rgba(245,158,11,0.07)", badge: "rgba(245,158,11,0.12)", badgeText: "#f59e0b" },
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#080810", border:"1px solid #1a1a2e", borderRadius:"24px", padding:"1.75rem", maxWidth:"520px", width:"100%", color:"#fff", animation:"slideUp 0.3s ease" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"1.75rem", marginBottom:".4rem" }}>⚡</div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.3rem", fontWeight:900, margin:"0 0 .35rem", color:"#fff" }}>Unlock VCI</h2>
          <p style={{ color:"#52525b", fontSize:".8rem", margin:0 }}>Choose the plan that fits your workflow</p>
        </div>

        {/* SECTION: Creator Plans */}
        <div style={{ marginBottom:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".6rem" }}>
            <span style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", color:"#a855f7", textTransform:"uppercase" }}>📱 Creator Plans</span>
            <div style={{ flex:1, height:"1px", background:"rgba(168,85,247,.2)" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            {(["creator_starter","creator_pro"] as const).map(key => {
              const plan   = PLANS[key] as any;
              const meta   = PLAN_FEATURES[key];
              const col    = sectionColor.creator;
              const isSel  = selected === key;
              return (
                <div key={key} onClick={() => setSelected(key)}
                  style={{ border:`${isSel?"2":"1"}px solid ${isSel ? col.border : "#1a1a2e"}`, borderRadius:"14px", padding:".9rem 1rem", background: isSel ? col.bg : "#0a0a14", cursor:"pointer", transition:"all .2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".2rem" }}>
                        <span style={{ fontWeight:800, fontSize:".9rem", color:"#fff" }}>{plan.label}</span>
                        {meta.highlight && <span style={{ fontSize:".55rem", fontWeight:800, background: col.badge, color: col.badgeText, padding:".1rem .45rem", borderRadius:"5px" }}>{meta.highlight}</span>}
                        {(plan as any).wasINR > 0 && <span style={{ fontSize:".52rem", fontWeight:800, background:"rgba(34,197,94,.12)", color:"#22c55e", border:"1px solid rgba(34,197,94,.25)", padding:".08rem .4rem", borderRadius:"5px" }}>🎉 Launch Price</span>}
                      </div>
                      <span style={{ fontSize:".72rem", color:"#52525b" }}>{plan.limit} credits/month</span>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      {(plan as any).wasINR > 0 && (
                        <div style={{ fontSize:".7rem", color:"#3f3f46", textDecoration:"line-through", marginBottom:".1rem" }}>
                          {isUSD ? `$${(plan as any).wasUSD}` : `₹${(plan as any).wasINR}`}
                        </div>
                      )}
                      <div style={{ fontSize:"1.15rem", fontWeight:900, color: isSel ? col.badgeText : "#22c55e" }}>{isUSD ? `$${plan.priceUSD}` : `₹${plan.priceINR}`}</div>
                      <div style={{ fontSize:".65rem", color:"#3f3f46" }}>/month</div>
                    </div>
                  </div>
                  {isSel && (
                    <div style={{ marginTop:".75rem", display:"flex", flexDirection:"column", gap:".28rem" }}>
                      {meta.features.map((f,i) => (
                        <div key={i} style={{ display:"flex", gap:".5rem", alignItems:"flex-start" }}>
                          <span style={{ color:col.badgeText, fontSize:".65rem", marginTop:".1rem", flexShrink:0 }}>✓</span>
                          <span style={{ fontSize:".75rem", color:"#cbd5e1", lineHeight:1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: Advertiser Plan */}
        <div style={{ marginBottom:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".6rem" }}>
            <span style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", color:"#06b6d4", textTransform:"uppercase" }}>📢 Advertiser Plan</span>
            <div style={{ flex:1, height:"1px", background:"rgba(6,182,212,.2)" }} />
          </div>
          {(["advertiser"] as const).map(key => {
            const plan  = PLANS[key] as any;
            const meta  = PLAN_FEATURES[key];
            const col   = sectionColor.advertiser;
            const isSel = selected === key;
            return (
              <div key={key} onClick={() => setSelected(key)}
                style={{ border:`${isSel?"2":"1"}px solid ${isSel ? col.border : "#1a1a2e"}`, borderRadius:"14px", padding:".9rem 1rem", background: isSel ? col.bg : "#0a0a14", cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".2rem" }}>
                      <span style={{ fontWeight:800, fontSize:".9rem", color:"#fff" }}>{plan.label}</span>
                      <span style={{ fontSize:".55rem", fontWeight:800, background: col.badge, color: col.badgeText, padding:".1rem .45rem", borderRadius:"5px" }}>{meta.highlight}</span>
                    </div>
                    <span style={{ fontSize:".72rem", color:"#52525b" }}>{plan.limit} credits/month</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"1.15rem", fontWeight:900, color: isSel ? col.badgeText : "#fff" }}>{isUSD ? `$${plan.priceUSD}` : `₹${plan.priceINR}`}</div>
                    <div style={{ fontSize:".65rem", color:"#3f3f46" }}>/month</div>
                  </div>
                </div>
                {isSel && (
                  <div style={{ marginTop:".75rem", display:"flex", flexDirection:"column", gap:".28rem" }}>
                    {meta.features.map((f,i) => (
                      <div key={i} style={{ display:"flex", gap:".5rem", alignItems:"flex-start" }}>
                        <span style={{ color:col.badgeText, fontSize:".65rem", marginTop:".1rem", flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:".75rem", color:"#cbd5e1", lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SECTION: Agency Plan */}
        <div style={{ marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".6rem" }}>
            <span style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", color:"#f59e0b", textTransform:"uppercase" }}>👑 Agency Plan</span>
            <div style={{ flex:1, height:"1px", background:"rgba(245,158,11,.2)" }} />
          </div>
          {(["agency"] as const).map(key => {
            const plan  = PLANS[key] as any;
            const meta  = PLAN_FEATURES[key];
            const col   = sectionColor.agency;
            const isSel = selected === key;
            return (
              <div key={key} onClick={() => setSelected(key)}
                style={{ border:`${isSel?"2":"1"}px solid ${isSel ? col.border : "#1a1a2e"}`, borderRadius:"14px", padding:".9rem 1rem", background: isSel ? col.bg : "#0a0a14", cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".2rem" }}>
                      <span style={{ fontWeight:800, fontSize:".9rem", color:"#fff" }}>{plan.label}</span>
                      <span style={{ fontSize:".55rem", fontWeight:800, background: col.badge, color: col.badgeText, padding:".1rem .45rem", borderRadius:"5px" }}>{meta.highlight}</span>
                    </div>
                    <span style={{ fontSize:".72rem", color:"#52525b" }}>{plan.limit} credits/month</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"1.15rem", fontWeight:900, color: isSel ? col.badgeText : "#fff" }}>{isUSD ? `$${plan.priceUSD}` : `₹${plan.priceINR}`}</div>
                    <div style={{ fontSize:".65rem", color:"#3f3f46" }}>/month</div>
                  </div>
                </div>
                {isSel && (
                  <div style={{ marginTop:".75rem", display:"flex", flexDirection:"column", gap:".28rem" }}>
                    {meta.features.map((f,i) => (
                      <div key={i} style={{ display:"flex", gap:".5rem", alignItems:"flex-start" }}>
                        <span style={{ color:col.badgeText, fontSize:".65rem", marginTop:".1rem", flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:".75rem", color:"#cbd5e1", lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button onClick={() => onSelectPlan(selected)}
          style={{ width:"100%", padding:"0.95rem", borderRadius:"12px", background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", fontWeight:800, fontSize:".95rem", cursor:"pointer", marginBottom:".5rem", boxShadow:"0 8px 24px rgba(109,40,217,.35)" }}>
          Get {selectedPlan?.label} — {isUSD ? `$${selectedPlan?.priceUSD}` : `₹${selectedPlan?.priceINR}`} /month →
        </button>
        <button onClick={onClose}
          style={{ width:"100%", background:"none", border:"none", color:"#3f3f46", cursor:"pointer", fontSize:".78rem", padding:".4rem" }}>
          Maybe later
        </button>
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
        // Try generated_content table directly (no RPC needed)
        const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
        const { data: recent } = await supabase
          .from("generated_content")
          .select("keyword, user_id")
          .eq("niche", niche)
          .gte("created_at", sevenDaysAgo)
          .not("keyword", "is", null)
          .neq("keyword", "");

        if (!active) return;

        if (recent && recent.length >= 3) {
          // Count unique users per keyword
          const counts: Record<string, Set<string>> = {};
          recent.forEach((r: any) => {
            if (!counts[r.keyword]) counts[r.keyword] = new Set();
            counts[r.keyword].add(r.user_id);
          });
          const sorted = Object.entries(counts)
            .map(([kw, users]) => ({ keyword: kw, users: users.size }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 6);
          setSmartKeywords(sorted);
          setLoading(false);
          return;
        }

        // Fallback: all-time from generated_content
        const { data: allTime } = await supabase
          .from("generated_content")
          .select("keyword, user_id")
          .eq("niche", niche)
          .not("keyword", "is", null)
          .neq("keyword", "");

        if (!active) return;

        if (allTime && allTime.length >= 2) {
          const counts: Record<string, Set<string>> = {};
          allTime.forEach((r: any) => {
            if (!counts[r.keyword]) counts[r.keyword] = new Set();
            counts[r.keyword].add(r.user_id);
          });
          const sorted = Object.entries(counts)
            .map(([kw, users]) => ({ keyword: kw, users: users.size }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 6);
          setSmartKeywords(sorted);
        } else {
          setSmartKeywords([]);
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
          {showingSmart ? "🔥 TRENDING IN YOUR NICHE" : "RELATED KEYWORDS"}
        </span>
        {showingSmart && <span style={{ color:"#3f3f46", fontSize:"0.58rem" }}>last 7 days</span>}
      </div>
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
        {displayList.map(({ keyword: ex, users }) => (
          <button key={ex} onClick={() => onSelect(ex)}
            style={{ background: currentKeyword === ex ? "rgba(109,40,217,0.12)" : "#0d0d0d", border: `1px solid ${currentKeyword === ex ? "#6d28d9" : "#1e1e1e"}`, color: currentKeyword === ex ? "#8b5cf6" : "#444", padding: "0.25rem 0.7rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            onMouseEnter={e => { if (currentKeyword !== ex) { (e.currentTarget as any).style.borderColor = "#333"; (e.currentTarget as any).style.color = "#888"; } }}
            onMouseLeave={e => { if (currentKeyword !== ex) { (e.currentTarget as any).style.borderColor = "#1e1e1e"; (e.currentTarget as any).style.color = "#444"; } }}>
            {users >= 5 && <span style={{ fontSize: "0.6rem" }}>🔥</span>}
            {users >= 2 && users < 5 && <span style={{ fontSize: "0.6rem" }}>⬆</span>}
            {ex}
            {users >= 2 && <span style={{ color:"#3f3f46", fontSize:"0.55rem" }}>{users} users</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrendingNowCard({ niche, platform }: any) {
  const [trend, setTrend] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Curated trending formats by niche — shown when no real data yet
  const CURATED_TRENDS: Record<string, { style: string; tip: string }> = {
    "Fitness":        { style: "Before/After Transformation", tip: "Showing physical results in first 3 seconds drives highest saves" },
    "Gaming":         { style: "POV Gameplay Moment",         tip: "First-person perspective hooks get 2x more watch time" },
    "Food":           { style: "Satisfying Process Reveal",   tip: "The 'reveal' moment at the end drives 80% of shares" },
    "Business":       { style: "Specific Number Proof",       tip: "Exact figures (₹47,230 not ₹47K) increase credibility by 40%" },
    "Tech":           { style: "Problem → Solution Demo",     tip: "Live screen demos have 3x higher completion rate" },
    "Travel":         { style: "Hidden Gem Reveal",           tip: "Location tags + 'you won't believe' hooks drive discovery" },
    "Fashion & Style":{ style: "Outfit Transformation",       tip: "Mirror shots with direct eye contact get highest saves" },
    "Motivational":   { style: "Contrarian Truth",            tip: "Going against popular advice gets 5x more comments" },
    "Education":      { style: "Myth vs Reality",             tip: "Debunking common beliefs drives shares and saves" },
    "Personal Finance":{ style: "Specific ₹ Amount Reveal",  tip: "Exact money numbers outperform vague claims by 60%" },
    "Mental Health":  { style: "Relatable Confession",        tip: "Vulnerability + solution format gets highest saves" },
    "Comedy & Entertainment": { style: "Unexpected Twist Ending", tip: "Twist in last 2 seconds drives 90% rewatch rate" },
    "Daily Vlog":     { style: "Morning Routine Peek",        tip: "'Day in my life' with timestamps keeps viewers till end" },
    "Real Estate":    { style: "Property Tour Reveal",        tip: "Price reveal at the end gets highest engagement" },
    "Spirituality":   { style: "One Powerful Truth",          tip: "Single insight with pause gets highest save rate" },
    "Sports":         { style: "Unbelievable Skill Moment",   tip: "Slow-motion replays increase rewatch by 3x" },
    "Health & Wellness": { style: "Quick Tip with Proof",     tip: "Before/after with timeline drives most saves" },
    "Ads & Marketing":{ style: "Results Screenshot Reveal",   tip: "Actual numbers/metrics outperform claims by 70%" },
    "Lifestyle":      { style: "Aesthetic Day Reveal",        tip: "Soft music + clean visuals drives highest shares" },
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
        const { data } = await supabase
          .from("generated_content")
          .select("hook_styles, platform, niche")
          .eq("niche", niche)
          .eq("platform", platform)
          .gte("created_at", sevenDaysAgo)
          .not("hook_styles", "is", null);

        if (!active) return;

        if (data && data.length >= 3) {
          const styleCounts: Record<string, number> = {};
          data.forEach((row: any) => {
            if (Array.isArray(row.hook_styles)) {
              row.hook_styles.forEach((style: string) => {
                styleCounts[style] = (styleCounts[style] || 0) + 1;
              });
            }
          });
          const topStyle = Object.entries(styleCounts).sort((a,b) => b[1]-a[1])[0];
          if (topStyle) {
            setTrend({
              style: topStyle[0],
              platform,
              generation_count: data.length,
              pct_share: Math.round((topStyle[1]/data.length)*100),
              isReal: true
            });
          }
        } else {
          // Show curated trend for this niche
          const curated = CURATED_TRENDS[niche];
          if (curated) {
            setTrend({ style: curated.style, tip: curated.tip, isReal: false, platform });
          }
        }
      } catch {
        const curated = CURATED_TRENDS[niche];
        if (active && curated) {
          setTrend({ style: curated.style, tip: curated.tip, isReal: false, platform });
        }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [niche, platform]);

  if (loading || !trend) return null;

  return (
    <div style={{ background: trend.isReal ? "linear-gradient(135deg,rgba(245,158,11,.1),rgba(245,158,11,.03))" : "linear-gradient(135deg,rgba(109,40,217,.08),rgba(109,40,217,.02))", border: `1px solid ${trend.isReal ? "rgba(245,158,11,.25)" : "rgba(109,40,217,.2)"}`, borderRadius: "14px", padding: "0.85rem 1rem", marginBottom: "0.75rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
        <span style={{ fontSize: "1.2rem", flexShrink:0 }}>{trend.isReal ? "🔥" : "💡"}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:".5rem", flexWrap:"wrap" as const }}>
            <p style={{ margin: 0, color: trend.isReal ? "#f59e0b" : "#a855f7", fontSize: "0.78rem", fontWeight: 700 }}>
              {trend.isReal ? "Trending on" : "Top format for"} <strong>{niche}</strong>
              {trend.isReal && <> on <strong>{platform}</strong></>}:
              {" "}<strong>{trend.style}</strong>
            </p>
            <span style={{ fontSize:".58rem", color:"#3f3f46", background:"#0d0d18", border:"1px solid #1a1a2e", borderRadius:"4px", padding:".08rem .4rem", flexShrink:0 }}>
              {trend.isReal ? `${trend.pct_share}% of creators · ${trend.generation_count} this week` : "Editor's pick"}
            </span>
          </div>
          <p style={{ margin: "0.2rem 0 0", color: "#52525b", fontSize: "0.68rem", lineHeight:1.5 }}>
            {trend.isReal ? `${trend.pct_share}% of ${niche} creators on ${platform} used this format this week` : trend.tip}
          </p>
        </div>
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
    fireCopySignal("generate", "keyword_research", text);
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

function ResultCard({ title, items, emoji, color, charLimit, onSaveToLibrary, niche, platform, type }: any) {
  const [copied, setCopied]       = useState(false);
  const [savedKeys, setSavedKeys] = useState<Set<number>>(new Set());
  const safeItems: string[]       = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  const handleSave = async (item: string, idx: number) => {
    if (onSaveToLibrary) {
      await onSaveToLibrary({ content: item, type: type || "hook", niche, platform });
      setSavedKeys(prev => new Set(Array.from(prev).concat(idx)));
    }
  };

  return (
    <div style={{ background:"#0f0f0f", border:`1px solid ${color}22`, borderRadius:"14px", padding:"1.1rem", marginBottom:"0.9rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
        <h3 style={{ margin:0, fontFamily:"'Inter',sans-serif", color, fontSize:"0.88rem" }}>{emoji} {title}</h3>
        <button onClick={() => { const text = safeItems.join("\n"); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); fireCopySignal("generate", title, text); }}
          style={{ background:copied?"#22c55e18":"#ffffff0a", border:`1px solid ${copied?"#22c55e":"#2a2a2a"}`, color:copied?"#22c55e":"#555", padding:"0.2rem 0.6rem", borderRadius:"6px", cursor:"pointer", fontSize:"0.7rem" }}>
          {copied ? "✓ Copied!" : "Copy all"}
        </button>
      </div>
      <ul style={{ margin:0, padding:"0 0 0 1rem" }}>
        {safeItems.map((item: string, i: number) => {
          const len      = item.length;
          const overLimit = charLimit && len > charLimit;
          const isSaved  = savedKeys.has(i);
          return (
            <li key={i} style={{ color:"#ccc", fontSize:"0.83rem", marginBottom:"0.45rem", lineHeight:1.6, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"0.5rem" }}>
              <span style={{ flex:1 }}>{item}</span>
              <div style={{ display:"flex", gap:"0.35rem", alignItems:"center", flexShrink:0 }}>
                {charLimit && (
                  <span style={{ fontSize:"0.65rem", fontWeight:700, color:overLimit?"#ef4444":"#22c55e", whiteSpace:"nowrap" }}>
                    {len}/{charLimit}{overLimit?" ⚠":""}
                  </span>
                )}
                {onSaveToLibrary && (
                  <button onClick={() => handleSave(item, i)}
                    style={{ background: isSaved?"rgba(34,197,94,.1)":"rgba(109,40,217,.08)", border:`1px solid ${isSaved?"rgba(34,197,94,.3)":"rgba(109,40,217,.2)"}`, color:isSaved?"#22c55e":"#6d28d9", padding:"0.1rem 0.45rem", borderRadius:"5px", cursor:isSaved?"default":"pointer", fontSize:"0.6rem", fontWeight:800, whiteSpace:"nowrap", transition:"all .15s" }}>
                    {isSaved ? "✓ Saved" : "💾 Save"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Shows a compelling preview of a locked feature to drive curiosity/upgrades,
// instead of a flat "this is locked" wall.
function LockedFeaturePreview({ emoji, title, tagline, previewItems, onUpgrade }: any) {
  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ background: "linear-gradient(135deg,#0d0d0d,#111)", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem", position: "relative", overflow: "hidden" }}>

        {/* Blurred preview content behind a lock overlay */}
        <div style={{ filter: "blur(3px)", opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1rem", color: "#fff" }}>{title}</h3>
              <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>{tagline}</p>
            </div>
          </div>
          {previewItems.map((item: string, i: number) => (
            <div key={i} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.5rem", color: "#888", fontSize: "0.85rem" }}>
              {item}
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, rgba(13,13,13,0.4) 0%, rgba(13,13,13,0.92) 60%)", padding: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔒</div>
          <h3 style={{ margin: "0 0 0.4rem", fontFamily: "'Inter',sans-serif", fontSize: "1.1rem", color: "#fff", fontWeight: 800, textAlign: "center" }}>{title} is a Premium Feature</h3>
          <p style={{ margin: "0 0 1.1rem", color: "#a1a1aa", fontSize: "0.8rem", textAlign: "center", maxWidth: "320px", lineHeight: 1.6 }}>{tagline}</p>
          <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", color: "#fff", padding: "0.75rem 1.75rem", borderRadius: "12px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(109,40,217,0.4)" }}>
            🚀 Unlock with Creator Starter — ₹399
          </button>
          <p style={{ margin: "0.75rem 0 0", color: "#444", fontSize: "0.68rem" }}>Or upgrade to any paid plan to access this</p>
        </div>
      </div>
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
    try { return localStorage.getItem("vci_niche") || "Lifestyle"; } catch { return "Lifestyle"; }
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
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langCategoryTab, setLangCategoryTab] = useState<"indian" | "global">("indian");
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

  // ── Streak System ─────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("vci_streak") || "{}");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now()-86400000).toDateString();
      if (s.lastDate === today) return s.count || 1;
      if (s.lastDate === yesterday) return s.count || 1;
      return 0;
    } catch { return 0; }
  });

  const updateStreak = () => {
    try {
      const s = JSON.parse(localStorage.getItem("vci_streak") || "{}");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now()-86400000).toDateString();
      let newCount = 1;
      if (s.lastDate === today) newCount = s.count || 1;
      else if (s.lastDate === yesterday) newCount = (s.count || 0) + 1;
      localStorage.setItem("vci_streak", JSON.stringify({ count: newCount, lastDate: today }));
      setStreak(newCount);
    } catch {}
  };

  // ── Viral Score per hook ──────────────────────────────────────────────────
  const [hookScores, setHookScores] = useState<Record<number,number>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<number[]>([]);
  const [showWow, setShowWow] = useState(false);
  const [isFirstGeneration, setIsFirstGeneration] = useState(() => {
    try { return !localStorage.getItem("vci_generated_once"); } catch { return true; }
  });
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

  // Geo-based currency detection: USA/Canada see USD pricing, everyone else sees INR.
  // Uses a free IP-geolocation API; falls back silently to INR on any failure.
  useEffect(() => {
    let cached: string | null = null;
    try { cached = localStorage.getItem("vci_currency"); } catch {}
    if (cached === "USD" || cached === "INR") { setCurrency(cached); return; }

    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const detected = (data?.country_code === "US" || data?.country_code === "CA") ? "USD" : "INR";
        setCurrency(detected);
        try { localStorage.setItem("vci_currency", detected); } catch {}
      })
      .catch(() => { /* silent fallback — stays INR */ });
  }, []);

  // ── Affiliate ref code capture ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref") || urlParams.get("affiliate");
      if (ref) {
        localStorage.setItem("vci_ref", ref.toUpperCase());
        // Clean URL without removing ref from memory
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Safety timeout — agar 5 sec mein load nahi hua to force complete
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
      setProfileLoading(false);
    }, 5000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(safetyTimer);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setProfile(data ?? null);
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        const isAdmin = session?.user?.email === ADMIN_EMAIL;
        if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(isAdmin ? "agency" : (data?.user_type || "creator")); }
        if (data?.referral_code) { localStorage.setItem("viral_profile", JSON.stringify(data)); }
        if (isAdmin) { setPlan("agency"); setUserType("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined && data?.plan) {
          // Use PLANS as source of truth for total — Supabase credits_total may be stale
          const planLimit = PLANS[data.plan as keyof typeof PLANS]?.limit || 25;
          const used = Math.max(0, planLimit - data.credits_remaining);
          setUsageCount(used);
        }
      }
      setProfileLoading(false);
    }).catch(() => {
      // Network error — clear loading immediately
      clearTimeout(safetyTimer);
      setAuthLoading(false);
      setProfileLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setUser(session.user);
        setProfile(data ?? null);
        const ADMIN_EMAIL = "ravenderr01@gmail.com";
        const isAdmin = session.user.email === ADMIN_EMAIL;
        if (isAdmin) { setPlan("agency"); }
        else if (data?.plan) { setPlan(data.plan); }
        if (data?.credits_remaining !== undefined && data?.plan) {
          const planLimit = PLANS[data.plan as keyof typeof PLANS]?.limit || 25;
          const used = Math.max(0, planLimit - data.credits_remaining);
          setUsageCount(used);
        }
        if (isAdmin) { setUserType("agency"); }
        else if (!data?.user_type) { setShowOnboarding(true); } else { setUserType(data.user_type); }
        setProfileLoading(false);
      } else {
        setUser(null); setProfile(null); setPlan("free"); setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const limit = PLANS[plan as keyof typeof PLANS]?.limit || 25;

  // Safety: if the saved platform (from localStorage) doesn't match the user's type
  // (e.g. a Creator had "Google Ads" selected from before), snap to a sensible default.
  const SOCIAL_PLATFORMS = ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"];
  const ADS_PLATFORMS = ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"];
  useEffect(() => {
    if (!userType) return;
    const isSocial = SOCIAL_PLATFORMS.includes(platform);
    const isAds = ADS_PLATFORMS.includes(platform);
    if (userType === "creator" && isAds) setPlatform("Instagram");
    if (userType === "business" && isSocial) setPlatform("Google Ads");
  }, [userType]);

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

  const CREDIT_COSTS: Record<string, number> = { generate: 1, score: 2, caption: 2, image: 6, pack: 5, calendar: 6, scriptgenerate: 8, scriptimprove: 5, voiceover: 3 };

  // Credit toast — shows what was just deducted
  const [creditToast, setCreditToast] = useState<{feature: string; cost: number; remaining: number} | null>(null);
  const creditToastTimer = useRef<any>(null);

  const FEATURE_LABELS: Record<string, string> = {
    generate: "Generate", score: "Hook Score", caption: "Captions",
    image: "Image AI", pack: "Content Pack", calendar: "Calendar",
    scriptgenerate: "Script Lab", scriptimprove: "Script Improve",
    voiceover: "AI Voice", generate3: "A/B Ads", generate4: "Landing Page",
  };

  const incrementUsage = (feature: string = "generate") => {
    const cost = CREDIT_COSTS[feature] || 1;
    setUsageCount(prev => {
      const newCount = prev + cost;
      const planLimit = PLANS[plan as keyof typeof PLANS]?.limit || 25;
      const newRemaining = Math.max(0, planLimit - newCount);

      // Show toast notification
      if (creditToastTimer.current) clearTimeout(creditToastTimer.current);
      setCreditToast({ feature, cost, remaining: newRemaining });
      creditToastTimer.current = setTimeout(() => setCreditToast(null), 3500);

      // Sync to Supabase — profile credits update instantly
      if (user?.id) {
        supabase.from("users").update({
          credits_remaining: newRemaining,
          credits_total: planLimit,
          generations_used_today: newCount,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id).then(() => {});
      }
      return newCount;
    });
  };

  // Universal history saver — call this from any feature after a successful generation
  const saveToLibrary = async ({ content, type, niche: n, platform: p, hookScore }: { content: string; type: string; niche?: string; platform?: string; hookScore?: number }) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("content_library").insert({
        user_id:    user.id,
        content,
        type,
        niche:      n || niche || null,
        platform:   p || platform || null,
        hook_score: hookScore || null,
      });
      if (error) console.error("Library save error:", error.message);
    } catch (e) {
      console.error("Library save exception:", e);
    }
  };

  const saveToHistory = async (feature: string, data: { niche?: string; platform?: string; keyword?: string; inputSummary: string; resultData: any }) => {
    if (!user?.id) return;
    try {
      const safeResult = data.resultData ?? {};
      const { error } = await supabase.from("user_history").insert({
        user_id:       user.id,
        feature,
        niche:         data.niche    || null,
        platform:      data.platform || null,
        keyword:       data.keyword  || null,
        input_summary: data.inputSummary || "",
        result_data:   typeof safeResult === "object" ? safeResult : { raw: String(safeResult) },
      });
      if (error) console.error("History save error:", error.message, error.code);
    } catch (e) {
      console.error("History save exception:", e);
    }
  };

  // Silent background signal — fires whenever a user copies generated content.
  // No UI, no confirmation beyond the existing "Copied!" feedback. Used only
  // as a proxy "this was useful" signal for future fine-tuning data collection.
  const trackCopySignal = (feature: string, contentType: string, text: string, extra?: { niche?: string; platform?: string }) => {
    if (!user?.id || !text) return;
    supabase.from("copy_signals").insert({
      user_id: user.id,
      feature,
      content_type: contentType,
      content_text: text.slice(0, 2000), // cap length defensively
      niche: extra?.niche || null,
      platform: extra?.platform || null,
    }).then(() => {}, () => {});
  };

  // Expose globally so deeply-nested components (ResultCard, ContentCalendar, etc.)
  // can fire this signal without prop-drilling through every level.
  useEffect(() => {
    (window as any).__vciTrackCopy = trackCopySignal;
    return () => { delete (window as any).__vciTrackCopy; };
  }, [user?.id]);

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

      const socialPlatformStyle: Record<string, string> = {
        "Instagram": "Visual, aesthetic, fast-paced. Hooks must work as text-overlay even with sound off. Tone: aspirational/relatable, never corporate. Captions should be scroll-stopping with emoji used naturally, not decoratively.",
        "YouTube": "Slightly more explanatory than other platforms — hooks should promise a clear payoff ('by the end you'll know X'). Titles should be SEO-aware and curiosity-driven. Descriptions can be longer and more narrative.",
        "TikTok": "Raw, fast, pattern-interrupt energy. Hooks must work in under 2 seconds. Casual, unpolished, Gen-Z-native phrasing where appropriate — overly polished language feels out of place here.",
        "Facebook": "Warm, community/family-oriented, slightly older-skewing audience. Less trend-chasing slang than Instagram/TikTok. Hooks should feel emotionally relatable rather than aesthetic.",
        "Reddit": "Conversational, no marketing language at all — Reddit punishes anything that reads like an ad. Post titles should sound like a genuine question or confession, not a headline.",
        "LinkedIn": "Professional insight or contrarian-take energy, not entertainment. No slang, no trend-chasing. Should read like a credible person sharing a real lesson, with a clear professional takeaway.",
        "Twitter / X": "Punchy, quotable, opinionated. Every hook should be screenshot-worthy on its own. Short sentences, direct tone, can lean into a strong opinion or controversial angle.",
        "Pinterest": "Keyword-rich and benefit-led since Pinterest functions like visual search — titles must describe the outcome/result clearly, not just tease curiosity.",
        "WhatsApp": "Personal, direct, one-to-one conversational tone — written like a message from a friend, not a broadcast ad.",
        "Snapchat": "Fun, casual, FOMO-driven, very short. Written for a younger, fast-scrolling audience — no long sentences.",
      };

      const platformGuide: Record<string, string> = {
        "Instagram": `5 Reel opening lines, 5 post titles, 3 captions with hashtags, 5 trending topics.\nPLATFORM TONE: ${socialPlatformStyle["Instagram"]}`,
        "YouTube": `5 video hooks, 5 SEO titles, 3 descriptions, 5 trending formats.\nPLATFORM TONE: ${socialPlatformStyle["YouTube"]}`,
        "TikTok": `5 first-3-second hooks, 5 caption ideas, 3 video scripts, 5 trending sounds.\nPLATFORM TONE: ${socialPlatformStyle["TikTok"]}`,
        "Facebook": `5 post hooks, 5 shareable headlines, 3 posts, 5 content formats.\nPLATFORM TONE: ${socialPlatformStyle["Facebook"]}`,
        "Reddit": `5 post titles, 5 subreddit ideas, 3 post bodies, 5 trending topics.\nPLATFORM TONE: ${socialPlatformStyle["Reddit"]}`,
        "LinkedIn": `5 post openers, 5 article titles, 3 posts, 5 trending topics.\nPLATFORM TONE: ${socialPlatformStyle["LinkedIn"]}`,
        "Twitter / X": `5 tweet hooks, 5 thread titles, 3 tweet threads, 5 trending topics.\nPLATFORM TONE: ${socialPlatformStyle["Twitter / X"]}`,
        "Pinterest": `5 pin titles, 5 board names, 3 pin descriptions, 5 trending searches.\nPLATFORM TONE: ${socialPlatformStyle["Pinterest"]}`,
        "WhatsApp": `5 broadcast openers, 5 status ideas, 3 messages, 5 content ideas.\nPLATFORM TONE: ${socialPlatformStyle["WhatsApp"]}`,
        "Snapchat": `5 story hooks, 5 story ideas, 3 snap texts, 5 trending formats.\nPLATFORM TONE: ${socialPlatformStyle["Snapchat"]}`,
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
Keyword: "${keyword}"
Niche: ${niche}
Platform: ${platform}${adNicheNote}

Generate: ${platformGuide[platform] || platformGuide["Instagram"]}${keywordResearchInstruction}${charLimitReminder}

OUTPUT LANGUAGE: ${langStrict}
IMPORTANT: Write EVERYTHING in ${langStrict}. No English mixing if non-English selected.
Keyword suggestions (if any) stay in English/Latin script regardless of output language.

QUALITY REQUIREMENTS — every output must pass these checks:
1. Each hook must be DIFFERENT — different angle, different structure, different emotion
2. No hook/title can start with the same word as another in the same array
3. No banned phrases: "In this video", "Today I will", "Welcome back", "Don't forget to like"
4. Every hook must include at least ONE of: specific number, specific result, specific timeframe, or specific situation
5. Hooks must feel written by a human expert — not by an AI following a template
6. Indian context where relevant: cities, festivals, ₹ pricing, Indian names/scenarios

Respond ONLY in valid JSON:
{"trendingTopics":["t1","t2","t3","t4","t5"],"viralHooks":["h1","h2","h3","h4","h5"],"titles":["t1","t2","t3","t4","t5"],"captions":["c1","c2","c3"]${keywordJsonField}}`;

      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2200, messages: [{ role: "user", content: prompt }], plan })
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

      // ── Viral Score per hook ────────────────────────────────────────────
      const calcViralScore = (hook: string): number => {
        let score = 50;
        const h = hook.toLowerCase();
        // Positive signals
        if (/\d+/.test(h)) score += 8;                          // Has number
        if (h.includes("?")) score += 6;                        // Question hook
        if (/secret|nobody|truth|reveal|hidden/.test(h)) score += 10; // Curiosity gap
        if (/before|after|transform|result/.test(h)) score += 7;     // Transformation
        if (/mistake|wrong|stop|quit/.test(h)) score += 8;           // Pattern interrupt
        if (hook.length >= 20 && hook.length <= 60) score += 5;      // Ideal length
        if (/₹|rs\.|rupee/.test(h)) score += 5;                      // Price mention
        if (/day|week|month|year|minutes|hours/.test(h)) score += 5; // Timeframe
        if (/i |my |i've |i was /.test(h)) score += 6;               // Personal story
        if (/\b1\b|\b3\b|\b5\b|\b7\b|\b10\b/.test(h)) score += 4;  // Specific number
        // Negative signals
        if (/click here|like and|subscribe|welcome back/.test(h)) score -= 15;
        if (hook.length > 100) score -= 8;
        if (hook.length < 15) score -= 10;
        if (/^today |^in this /.test(h)) score -= 8;
        return Math.max(10, Math.min(99, score));
      };

      const scores: Record<number,number> = {};
      safeResults.viralHooks.forEach((h: string, i: number) => {
        scores[i] = calcViralScore(h);
      });
      setHookScores(scores);
      setCompareMode(false);
      setCompareSelected([]);

      // ── Streak update ───────────────────────────────────────────────────
      updateStreak();

      // ── First generation WOW ───────────────────────────────────────────
      if (isFirstGeneration) {
        setIsFirstGeneration(false);
        setShowWow(true);
        try { localStorage.setItem("vci_generated_once", "1"); } catch {}
        setTimeout(() => setShowWow(false), 4000);
      }

      const detectedStyles = safeResults.viralHooks.map((h: string) => detectHookStyle(h));

      // Fire-and-forget — failures don't block history
      supabase.from("generated_content").insert({
        user_id: user.id, niche, platform,
        language: langLabel, keyword,
        hooks: safeResults.viralHooks,
        titles: safeResults.titles,
        captions: safeResults.captions,
        trending_topics: safeResults.trendingTopics,
        hook_styles: detectedStyles,
      }).then(({ error }) => {
        if (error) console.warn("generated_content insert:", error.message);
      });

      supabase.from("users").update({
        generations_used_today: (userData?.generations_used_today || 0) + 1,
        credits_remaining: (userData?.credits_remaining || 0) - 1,
      }).eq("id", user.id);

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
  const handlePaid = async (p: string) => {
    setPayingPlan(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

    // Wait a moment for Supabase to process, then refresh
    await new Promise(r => setTimeout(r, 1500));

    if (user?.id) {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        const newPlan = data.plan || "free";
        // Use PLANS limit as source of truth
        const planLimit = PLANS[newPlan as keyof typeof PLANS]?.limit || 25;
        // If credits_remaining not set yet, give full plan limit
        const creditsRemaining = data.credits_remaining !== undefined
          ? data.credits_remaining
          : planLimit;
        const creditsUsed = Math.max(0, planLimit - creditsRemaining);
        setPlan(newPlan);
        setUsageCount(creditsUsed);
        // Show upgrade toast
        setCreditToast({ feature: "plan_upgrade", cost: 0, remaining: creditsRemaining });
        setTimeout(() => setCreditToast(null), 6000);
      }
    }
  };

  const tabs = [
    { id: "generate",     label: "Generate",    Icon: Zap },
    { id: "score",        label: "Hook Score",  Icon: BarChart2 },
    // Caption tab merged into Generate — removed
    { id: "intelligence", label: "Intelligence", Icon: Search },
    { id: "calendar",     label: "Calendar",    Icon: CalendarDays },
    { id: "pack",         label: "Pack",        Icon: Package },
    // Trends tab merged into Intelligence — removed
    { id: "image",        label: "Image AI",    Icon: Image },
    { id: "scriptlab",    label: "Script Lab",  Icon: Film },
    { id: "repurpose",    label: "Repurpose",   Icon: Layers },
    { id: "competitor",   label: "Competitor",  Icon: MousePointerClick },
    { id: "library",      label: "My Library",  Icon: Package },
  ];

  if (authLoading || profileLoading) return (
    <div style={{ minHeight:"100vh", background:"#040410", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.5rem" }}>
      <div style={{ position:"relative", width:72, height:72 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid rgba(124,58,237,.15)" }} />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#7c3aed", animation:"spin .8s linear infinite" }} />
        <div style={{ position:"absolute", inset:"50%", transform:"translate(-50%,-50%)", fontSize:"1.6rem", lineHeight:1 }}>⚡</div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"#fff", fontFamily:"sans-serif", fontWeight:700, fontSize:"1rem", margin:"0 0 .3rem" }}>VCI</p>
        <p style={{ color:"#52525b", fontFamily:"sans-serif", fontSize:".75rem", margin:0 }}>Loading your workspace...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (showContact) return <Contact onBack={() => setShowContact(false)} />;
  if (legalPage) return <Legal page={legalPage} onBack={() => setLegalPage(null)} />;
  if (showOnboarding && user) return <Onboarding userId={user.id} onComplete={async (type: string) => {
    // Step 1: Set userType immediately
    setUserType(type);

    // Step 2: Set niche BEFORE hiding onboarding
    const defaultNiche = type === "agency" ? "Business" : type === "business" ? "Business" : "Lifestyle";
    const savedNiche = (() => { try { return localStorage.getItem("vci_niche"); } catch { return null; } })();
    const nicheToSet = savedNiche || defaultNiche;
    setNiche(nicheToSet);
    try { localStorage.setItem("vci_niche", nicheToSet); } catch {}

    // Step 3: Set correct tab
    const tabToSet = type === "business" ? "roi" : type === "agency" ? "localbusiness" : "generate";
    setActiveTab(tabToSet);
    try { localStorage.setItem("vci_activeTab", tabToSet); } catch {}

    // Step 4: Fetch fresh profile
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      const newPlan = data.plan || "free";
      setPlan(newPlan);
      const planLimit = PLANS[newPlan as keyof typeof PLANS]?.limit || 25;
      const creditsRemaining = data.credits_remaining ?? planLimit;
      setUsageCount(Math.max(0, planLimit - creditsRemaining));
    }

    // Step 5: Hide onboarding LAST — after all state is set
    setShowOnboarding(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 150);
  }} />;
  if (showAdmin) return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  if (showPlans) return <Plans onBack={() => setShowPlans(false)} onUpgrade={(selectedPlan: string) => { setShowPlans(false); setPayingPlan(selectedPlan); }} currentPlan={plan} currency={currency} />;
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
        @keyframes progressBar { from{width:0%} to{width:100%} }
        .gbtn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 4px 20px rgba(124,58,237,0.2) !important; }
        .tbtn:hover { border-color:#6d28d9!important; color:#6d28d9!important; }

        /* ── RESET ── */
        *{box-sizing:border-box}
        input,textarea{box-sizing:border-box;max-width:100%}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:3px}

        /* ── ANIMATIONS ── */
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes progressBar{from{width:0%}to{width:100%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes floatDown{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}

        /* ── MAIN LAYOUT ── */
        .app-shell{
          min-height:100vh;
          background:#020204;
          color:#f1f5f9;
          font-family:'Inter',sans-serif;
          position:relative;
        }

        /* ── SIDEBARS — desktop only ── */
        .left-sidebar,.right-sidebar{
          position:fixed;top:50%;transform:translateY(-50%);
          display:flex;flex-direction:column;gap:.6rem;
          z-index:10;width:150px;
        }
        .left-sidebar{left:1rem}
        .right-sidebar{right:1rem}
        .sidebar-card{
          background:#080810;border-radius:10px;
          padding:.55rem .7rem;opacity:.72;
        }

        /* ── HEADER ── */
        .app-header{
          background:#080810;
          border-bottom:1px solid #141426;
          padding:1.1rem 1.5rem .9rem;
          text-align:center;
          position:relative;
        }

        /* ── MAIN CONTENT AREA ── */
        .app-main{
          max-width:660px;
          margin:0 auto;
          padding:1.25rem 1rem 5rem;
        }

        /* ── TAB GRID ── */
        .tab-wrap{
          max-width:660px;margin:0 auto;
          display:flex;flex-direction:column;gap:.4rem;
          margin-bottom:.85rem;
        }
        .tab-section-label{
          display:flex;align-items:center;gap:.5rem;
          padding:0 .2rem;margin-bottom:.1rem;
        }
        .tab-section-label span{
          font-size:.55rem;font-weight:800;
          letter-spacing:.12em;text-transform:uppercase;
        }
        .tab-section-line{flex:1;height:1px}
        .tab-box{
          border-radius:14px;padding:.45rem;
        }
        .tab-box-creator{background:#080810;border:1px solid #141426}
        .tab-box-advertiser{background:#07080e;border:1px solid rgba(6,182,212,.15)}
        .creator-tab-grid{
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:.3rem;
        }
        .advertiser-tab-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:.3rem;
        }
        .tab-btn{
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          gap:.22rem;padding:.55rem .2rem;
          border-radius:10px;border:none;
          cursor:pointer;font-family:'Inter',sans-serif;
          transition:all .18s;background:transparent;
          outline:1px solid transparent;
          -webkit-tap-highlight-color:transparent;
        }
        .tab-btn:active{transform:scale(.95)}
        .tab-btn.active-creator{
          background:rgba(124,58,237,.16);
          outline:1.5px solid rgba(124,58,237,.42);
        }
        .tab-btn-icon{font-size:1.1rem;line-height:1}
        .tab-btn-label{
          font-size:.58rem;font-weight:500;
          line-height:1.2;text-align:center;
          color:#71717a;letter-spacing:-.01em;
        }
        .tab-btn-label.active{color:#c4b5fd;font-weight:800}
        .tab-btn-label.locked{color:#27272a}

        /* ── CREDITS BAR ── */
        .credits-bar{
          max-width:660px;margin:0 auto .85rem;
        }

        /* ── PLATFORM BUTTONS ── */
        .platform-btn-row{
          display:flex;flex-wrap:wrap;
          gap:.4rem;justify-content:center;
        }

        /* ── BUTTONS ── */
        .gbtn:hover:not(:disabled){
          transform:translateY(-1px);
          box-shadow:0 4px 20px rgba(124,58,237,.2)!important;
        }
        .tbtn:hover{
          border-color:#6d28d9!important;
          color:#6d28d9!important;
        }

        /* ── MOBILE ── */
        @media(max-width:768px){
          .left-sidebar,.right-sidebar{display:none!important}
          .app-header{padding:3.6rem .9rem .8rem}
          .app-main{padding:1rem .9rem 6rem}
          .tab-wrap{padding:0}
          .creator-tab-grid{grid-template-columns:repeat(4,1fr)!important;gap:.28rem}
          .tab-btn{padding:.5rem .15rem}
          .tab-btn-icon{font-size:1rem}
          .tab-btn-label{font-size:.56rem}
          .platform-btn-row{
            overflow-x:auto;flex-wrap:nowrap;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;
            justify-content:flex-start;
            padding-bottom:.2rem;
          }
          .platform-btn-row::-webkit-scrollbar{display:none}
          .platform-btn-row>button{flex:0 0 auto!important;white-space:nowrap}
          .desktop-btn{display:none!important}
          .mobile-top-bar{display:flex!important}
        }

        /* ── TABLET ── */
        @media(min-width:769px) and (max-width:1100px){
          .left-sidebar,.right-sidebar{display:none!important}
          .app-header{padding:1.1rem 1.25rem .9rem}
          .creator-tab-grid{grid-template-columns:repeat(6,1fr)}
        }

        /* ── LARGE DESKTOP ── */
        @media(min-width:1101px){
          .app-main{max-width:680px}
          .tab-wrap{max-width:680px}
          .credits-bar{max-width:680px}
        }

        /* ── MOBILE TOP BAR (fixed) ── */
        .mobile-top-bar{
          display:none;position:fixed;
          top:0;left:0;right:0;z-index:999;
          align-items:center;padding:.5rem .75rem;
          background:rgba(8,8,16,.96);
          backdrop-filter:blur(12px);
          border-bottom:1px solid #141426;
          gap:.4rem;
        }
        .profile-trigger{display:block}
        @media(max-width:768px){
          .profile-trigger{top:.65rem!important;left:.75rem!important}
        }

        /* ── MISC ── */
        .tab-scroll-row{
          display:flex;gap:.25rem;
          overflow-x:auto;overflow-y:hidden;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        }
        .tab-scroll-row::-webkit-scrollbar{display:none}
        .tab-scroll-row>button{flex:0 0 auto!important;min-width:72px}
      `}</style>

      <div className="app-shell">

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
            { icon: "💎", label: "₹399/month", sub: "Starter Plan", color: "#22c55e", anim: "floatUp 3.8s ease-in-out infinite" },
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
        <div className="app-header">

          

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
                  <a href="https://whatsapp.com/channel/0029Vb7h3KUHrDZbLAI5Of38" target="_blank" rel="noopener noreferrer" onClick={() => setShowProfile(false)} style={{ width: "100%", background: "none", border: "none", color: "#25d366", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    📢 WhatsApp Channel
                  </a>
                  <a href="https://t.me/GetvciOfficial" target="_blank" rel="noopener noreferrer" onClick={() => setShowProfile(false)} style={{ width: "100%", background: "none", border: "none", color: "#0088cc", padding: "0.55rem 0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,136,204,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    💭 Telegram Community
                  </a>
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
                  {["⚡ 500+ Creators", "🎣 Viral Hooks", "📅 30-Day Cal", "🌐 30+ Languages", "📦 Content Pack", "🖼️ Image AI", "🔥 Launch Offer — First 100 Users"].map((item, i) => (
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
                <div style={{ position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "0.75rem", zIndex: 200, width: "310px", boxShadow: "0 8px 40px rgba(0,0,0,0.7)", maxHeight: "420px", display: "flex", flexDirection: "column" }}>
                  <p style={{ color: "#333", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.5rem", letterSpacing: "0.06em" }}>SELECT LANGUAGE</p>

                  {/* Indian vs Global tabs */}
                  <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.65rem", background: "#080808", borderRadius: "10px", padding: "0.25rem" }}>
                    {(["indian", "global"] as const).map(cat => (
                      <button key={cat} onClick={() => setLangCategoryTab(cat)}
                        style={{ flex: 1, padding: "0.4rem 0.5rem", borderRadius: "8px", border: "none", background: langCategoryTab === cat ? "rgba(109,40,217,0.18)" : "transparent", color: langCategoryTab === cat ? "#8b5cf6" : "#52525b", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                        {cat === "indian" ? "🇮🇳 Indian Languages" : "🌍 Global Languages"}
                      </button>
                    ))}
                  </div>

                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {LANGUAGE_GROUPS.filter(g => g.category === langCategoryTab).map(group => (
                      <div key={group.code} style={{ marginBottom: "0.5rem" }}>
                        <p style={{ color: "#555", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{group.country}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                          {group.languages.map(lang => {
                            const isLocked = false; // All plans get all languages
                            const hasVoice = VOICE_SUPPORTED_LANGS.has(lang.code);
                            return (
                              <button key={lang.code}
                                onClick={() => {
                                  if (isLocked) { setShowPaywall(true); return; }
                                  setSelectedLang(lang.code);
                                  setShowLangDropdown(false);
                                }}
                                style={{ background: selectedLang === lang.code ? "rgba(124,58,237,0.12)" : "#111", border: `1px solid ${selectedLang === lang.code ? "#6d28d9" : "#1e1e1e"}`, color: selectedLang === lang.code ? "#6d28d9" : isLocked ? "#2a2a2a" : "#888", padding: "0.2rem 0.55rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                {isLocked ? "🔒 " : ""}{lang.label}
                                {hasVoice && <span title="AI Voiceover available" style={{ fontSize: "0.62rem" }}>🔊</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid #1a1a1a", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                    <p style={{ margin: 0, color: "#3f3f46", fontSize: "0.6rem", lineHeight: 1.5 }}>
                      🔊 = AI Voiceover available for this language in Script Lab
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CREDITS BAR — UPGRADED ── */}
          <div className="credits-bar">
            <div style={{ background:"#080810", border:`1px solid ${remaining === 0 ? "rgba(239,68,68,.3)" : remaining <= 10 ? "rgba(245,158,11,.25)" : "#141426"}`, borderRadius:"14px", padding:".65rem 1rem", transition:"border-color .3s" }}>
              
              {/* Row 1: Plan + bar + count + cost */}
              <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".4rem" }}>
                {/* Plan badge */}
                <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:".3rem" }}>
                  <span style={{ fontSize:".55rem", fontWeight:800, letterSpacing:".08em", color:"#3f3f46", textTransform:"uppercase" as const }}>Plan</span>
                  <span style={{ background:"rgba(109,40,217,.12)", border:"1px solid rgba(109,40,217,.25)", color:"#a855f7", fontSize:".62rem", fontWeight:800, padding:".1rem .5rem", borderRadius:"6px" }}>
                    {PLANS[plan as keyof typeof PLANS]?.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ flex:1, position:"relative" as const }}>
                  <div style={{ background:"#0d0d1a", borderRadius:"4px", height:"6px", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:"4px", transition:"width .6s cubic-bezier(.4,0,.2,1)", width:`${usedPct}%`,
                      background: remaining === 0 ? "#ef4444" : remaining <= 10 ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#6d28d9,#a855f7)" }} />
                  </div>
                </div>

                {/* Count */}
                <div style={{ flexShrink:0 }}>
                  <span style={{ fontSize:".75rem", fontWeight:900, color: remaining === 0 ? "#ef4444" : remaining <= 10 ? "#f59e0b" : "#a855f7" }}>
                    {remaining === 0 ? "⛔ 0" : remaining}
                  </span>
                  <span style={{ fontSize:".6rem", color:"#3f3f46" }}> / {limit} cr</span>
                </div>

                {/* Active tab cost */}
                {(() => {
                  const TAB_COST: Record<string, string> = {
                    generate:"1 credit", score:"2 credits", caption:"2 credits",
                    intelligence:"Free", trends:"Free", library:"Free",
                    calendar:"6 credits", pack:"5 credits", image:"6 credits",
                    scriptlab:"8 credits", repurpose:"5 credits", competitor:"2 credits",
                    roi:"Free", abtest:"3 credits", landingpage:"4 credits",
                    whatsapp:"2 credits", bio:"1 credit", product:"2 credits", templates:"1 credit",
                    localbusiness:"Free",
                  };
                  const costStr = TAB_COST[activeTab];
                  if (!costStr) return null;
                  const isFree = costStr === "Free";
                  const col = isFree ? "#22c55e" : "#a855f7";
                  return (
                    <div style={{ flexShrink:0, background:`${col}10`, border:`1px solid ${col}28`, borderRadius:"6px", padding:".12rem .45rem", display:"flex", alignItems:"center", gap:".2rem" }}>
                      <span style={{ fontSize:".55rem" }}>{isFree ? "✓" : "⚡"}</span>
                      <span style={{ fontSize:".62rem", fontWeight:800, color:col }}>{costStr}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Row 2: Usage mini-log — last 5 actions */}
              <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" as const }}>
                <span style={{ fontSize:".55rem", color:"#27272a", fontWeight:700, letterSpacing:".06em", flexShrink:0 }}>USED:</span>
                {usageCount === 0 ? (
                  <span style={{ fontSize:".6rem", color:"#27272a" }}>No activity yet — generate something!</span>
                ) : (
                  <>
                    <div style={{ flex:1, height:2, background:"#0d0d18", borderRadius:1, overflow:"hidden" }}>
                      <div style={{ width:`${usedPct}%`, height:"100%",
                        background: remaining <= 10 ? "rgba(245,158,11,.4)" : "rgba(109,40,217,.3)" }} />
                    </div>
                    <span style={{ fontSize:".6rem", color:"#3f3f46", flexShrink:0 }}>
                      {usageCount} of {limit} used ({Math.round(usedPct)}%)
                    </span>
                    {remaining > 0 && remaining <= 20 && (
                      <span style={{ fontSize:".58rem", color:"#f59e0b", fontWeight:700, background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.18)", borderRadius:"5px", padding:".05rem .35rem" }}>
                        ⚠ Low credits
                      </span>
                    )}
                  </>
                )}

                {/* Upgrade nudge when low */}
                {remaining <= 10 && remaining > 0 && plan !== "agency" && (
                  <button onClick={() => setShowPaywall(true)}
                    style={{ marginLeft:"auto", background:"rgba(109,40,217,.12)", border:"1px solid rgba(109,40,217,.3)", color:"#a855f7", fontSize:".58rem", fontWeight:700, padding:".08rem .45rem", borderRadius:"6px", cursor:"pointer", flexShrink:0 }}>
                    Upgrade →
                  </button>
                )}
                {remaining === 0 && (
                  <button onClick={() => setShowPaywall(true)}
                    style={{ marginLeft:"auto", background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", fontSize:".6rem", fontWeight:700, padding:".1rem .5rem", borderRadius:"6px", cursor:"pointer", flexShrink:0 }}>
                    ⛔ Get more credits
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── TAB NAVIGATION ── */}
          <div className="tab-wrap">

            {/* Creator label */}
            <div className="tab-section-label">
              <span style={{ color:"#3f3f46" }}>📱 Creator Tools</span>
              <div className="tab-section-line" style={{ background:"#141426" }} />
            </div>

            {/* Creator grid */}
            <div className="tab-box tab-box-creator">
              <div className="creator-tab-grid">
                {[
                  { id:"generate",     label:"Generate",    icon:"⚡" },
                  { id:"score",        label:"Hook Score",  icon:"📊" },
                  // Caption merged into Generate
                  { id:"intelligence", label:"Intelligence", icon:"🔍" },
                  // Trends merged into Intelligence
                  { id:"library",      label:"My Library",  icon:"💾" },
                  { id:"calendar",     label:"Calendar",    icon:"📅", locked: plan === "free" },
                  { id:"pack",         label:"Pack",        icon:"📦", locked: plan === "free" },
                  { id:"image",        label:"Image AI",    icon:"🖼️", locked: plan === "free" },
                  { id:"scriptlab",    label:"Script Lab",  icon:"🎬", locked: plan === "free" },
                  { id:"repurpose",    label:"Repurpose",   icon:"🔄", locked: ["free","creator_starter"].includes(plan) },
                  { id:"competitor",   label:"Competitor",  icon:"🕵️", locked: ["free","creator_starter"].includes(plan) },
                ].map(t => {
                  const isActive = activeTab === t.id;
                  return (
                    <button key={t.id}
                      className={`tab-btn${isActive?" active-creator":""}`}
                      onClick={() => t.locked ? setShowPaywall(true) : setActiveTab(t.id)}>
                      <span className="tab-btn-icon" style={{ filter:t.locked?"grayscale(1) opacity(.3)":"none" }}>
                        {t.locked ? "🔒" : t.icon}
                      </span>
                      <span className={`tab-btn-label${isActive?" active":t.locked?" locked":""}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advertiser label */}
            <div className="tab-section-label" style={{ marginTop:".15rem" }}>
              <span style={{ color:"rgba(6,182,212,.65)" }}>📢 Advertiser</span>
              <div className="tab-section-line" style={{ background:"rgba(6,182,212,.15)" }} />
              {!["advertiser","agency"].includes(plan) && (
                <span style={{ fontSize:".52rem", fontWeight:800, color:"rgba(6,182,212,.4)", background:"rgba(6,182,212,.06)", border:"1px solid rgba(6,182,212,.15)", borderRadius:"4px", padding:".05rem .4rem", whiteSpace:"nowrap" }}>
                  Advertiser Plan
                </span>
              )}
            </div>

            {/* Advertiser grid — 7 tools in 4 cols */}
            <div className="tab-box tab-box-advertiser">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:".3rem" }}>
                {[
                  { id:"roi",           label:"ROI Calc",     icon:"📊", color:"#f59e0b" },
                  { id:"abtest",        label:"A/B Ads",      icon:"🧪", color:"#06b6d4" },
                  { id:"landingpage",   label:"Landing Page",  icon:"🖥️", color:"#22c55e" },
                  { id:"whatsapp",      label:"WA & Email",    icon:"💬", color:"#25d366" },
                  { id:"bio",           label:"Bio Writer",    icon:"✍️", color:"#a855f7" },
                  { id:"product",       label:"Product Desc",  icon:"🛍️", color:"#f97316" },
                  { id:"templates",     label:"Templates",     icon:"🎯", color:"#06b6d4" },
                  { id:"localbusiness", label:"Local Biz",     icon:"🏪", color:"#f59e0b" },
                ].map(t => {
                  const isActive = activeTab === t.id;
                  const isLocked = !["advertiser","agency"].includes(plan);
                  return (
                    <button key={t.id}
                      className="tab-btn"
                      onClick={() => isLocked ? setShowPaywall(true) : setActiveTab(t.id)}
                      style={{
                        background: isActive ? `${t.color}14` : "transparent",
                        outline: isActive ? `1.5px solid ${t.color}50` : "1px solid transparent",
                      }}>
                      <span className="tab-btn-icon" style={{ filter:isLocked?"grayscale(1) opacity(.25)":"none" }}>
                        {isLocked ? "🔒" : t.icon}
                      </span>
                      <span className="tab-btn-label" style={{ color: isActive ? t.color : isLocked ? "#1e1e2e" : "#52525b", fontWeight: isActive ? 800 : 500 }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>

          {/* TAB: GENERATE */}
          {activeTab === "generate" && (
            <div>
              {/* Niche — always visible buttons, no hide/show toggle */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em" }}>NICHE</label>
                  {niche && (
                    <span style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.3)", color: "#a855f7", padding: "0.1rem 0.55rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
                      ✓ {niche}
                    </span>
                  )}
                  <span style={{ color: "#3f3f46", fontSize: "0.6rem", marginLeft: "auto" }}>auto-detects from keyword</span>
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" as const, marginBottom: "0.5rem" }}>
                  {Object.keys(NICHE_EXAMPLES).map(n => (
                    <button key={n} className="tbtn" onClick={() => {
                      setNiche(n);
                      try { localStorage.setItem("vci_niche", n); } catch {}
                    }}
                      style={{ background: niche === n ? "rgba(109,40,217,0.15)" : "#0d0d0d", border: `1px solid ${niche === n ? "#7c3aed" : "#1a1a1a"}`, color: niche === n ? "#a855f7" : "#52525b", padding: "0.35rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem", fontWeight: niche === n ? 700 : 500, transition: "all 0.2s", boxShadow: niche === n ? "0 0 0 2px rgba(124,58,237,0.2)" : "none" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#52525b", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>PLATFORM</label>
                {[
                  { group: "📱 SOCIAL MEDIA", platforms: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"], audience: ["creator", "agency"] },
                  { group: "📢 ADVERTISING", platforms: ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"], audience: ["business", "agency"] }
                ].filter(({ audience }) => audience.includes(userType || "creator")).map(({ group, platforms }) => (
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
                    // Auto-detect niche from keyword — triggers at 3+ chars
                    if (val.trim().length >= 3) {
                      const detected = detectNiche(val.trim(), niche);
                      // Only update if a real niche was detected (not returning currentNiche)
                      const allNiches = Object.keys(NICHE_EXAMPLES);
                      if (detected && allNiches.includes(detected)) {
                        setNiche(detected);
                        try { localStorage.setItem("vci_niche", detected); } catch {}
                      }
                    }
                  }} onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  placeholder={niche ? `e.g. ${NICHE_EXAMPLES[niche]?.[0] || "weight loss"}` : "Type keyword — niche auto-detects"}
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

                  {/* WOW moment — first generation only */}
                  {showWow && (
                    <div style={{ background:"linear-gradient(135deg,rgba(109,40,217,.2),rgba(168,85,247,.1))", border:"1px solid rgba(168,85,247,.4)", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:".75rem", animation:"slideUp .3s ease" }}>
                      <span style={{ fontSize:"1.8rem" }}>🎉</span>
                      <div>
                        <p style={{ margin:0, fontWeight:900, color:"#fff", fontSize:".9rem" }}>Your first viral content is ready!</p>
                        <p style={{ margin:".2rem 0 0", color:"#a78bfa", fontSize:".75rem" }}>Copy a hook below → paste on Instagram or YouTube → watch the results.</p>
                      </div>
                    </div>
                  )}

                  {/* Streak banner */}
                  {streak > 0 && (
                    <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".75rem", background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:".45rem .85rem" }}>
                      <span style={{ fontSize:"1.1rem" }}>🔥</span>
                      <span style={{ color:"#f59e0b", fontWeight:700, fontSize:".75rem" }}>
                        {streak} day streak — keep it going!
                      </span>
                      {streak >= 7 && <span style={{ marginLeft:"auto", fontSize:".65rem", color:"#a16207", background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", borderRadius:6, padding:".1rem .4rem", fontWeight:700 }}>🏆 Week Legend</span>}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#6d28d908", border: "1px solid #6d28d920", borderRadius: "8px", fontSize: "0.75rem", color: "#6d28d9" }}>
                    🌐 Generated in <strong>{langLabel}</strong>
                    <span style={{ marginLeft: "auto", color: "#333", fontSize: "0.7rem" }}>💡 Try Hook Score tab</span>
                  </div>

                  {/* Viral Hooks with scores + compare mode */}
                  {results.viralHooks?.length > 0 && !["Google Ads","Meta Ads","Native Ads","YouTube Ads"].includes(platform) && platform !== "YouTube" && platform !== "Reddit" && (
                    <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:14, padding:"1rem", marginBottom:"1rem" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                          <span style={{ fontSize:".62rem", fontWeight:800, color:"#6d28d9", textTransform:"uppercase" as const, letterSpacing:".08em" }}>🎣 Viral Hooks</span>
                          <span style={{ fontSize:".58rem", color:"#3f3f46", background:"#0d0d18", border:"1px solid #1a1a2e", padding:".05rem .4rem", borderRadius:4 }}>scored by AI</span>
                        </div>
                        <button onClick={() => { setCompareMode(!compareMode); setCompareSelected([]); }}
                          style={{ background: compareMode?"rgba(109,40,217,.15)":"transparent", border:`1px solid ${compareMode?"rgba(109,40,217,.4)":"#1a1a2e"}`, color: compareMode?"#a855f7":"#52525b", fontSize:".65rem", fontWeight:700, padding:".2rem .6rem", borderRadius:7, cursor:"pointer", fontFamily:"inherit" }}>
                          {compareMode ? "✕ Exit Compare" : "⚔️ Compare"}
                        </button>
                      </div>

                      {compareMode && (
                        <p style={{ color:"#52525b", fontSize:".65rem", marginBottom:".65rem" }}>
                          Select 2 hooks to compare side by side →
                          {compareSelected.length === 2 && <span style={{ color:"#a855f7", fontWeight:700 }}> Ready! Scroll down.</span>}
                        </p>
                      )}

                      <div style={{ display:"flex", flexDirection:"column" as const, gap:".5rem" }}>
                        {results.viralHooks.map((hook: string, i: number) => {
                          const score = hookScores[i] || 0;
                          const scoreColor = score >= 80 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
                          const scoreLabel = score >= 80 ? "🔥 High" : score >= 65 ? "⚡ Good" : "💡 Fair";
                          const isSelected = compareSelected.includes(i);
                          return (
                          <div key={i} style={{ background: isSelected?"rgba(109,40,217,.1)":"#050508", border:`1px solid ${isSelected?"rgba(109,40,217,.4)":"#1a1a2e"}`, borderRadius:10, padding:".7rem .85rem", cursor: compareMode?"pointer":"default", transition:"all .15s" }}
                            onClick={() => {
                              if (!compareMode) return;
                              if (isSelected) setCompareSelected(prev => prev.filter(x=>x!==i));
                              else if (compareSelected.length < 2) setCompareSelected(prev => [...prev, i]);
                            }}>
                            <div style={{ display:"flex", alignItems:"flex-start", gap:".6rem" }}>
                              {compareMode && (
                                <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${isSelected?"#a855f7":"#1a1a2e"}`, background:isSelected?"rgba(109,40,217,.2)":"transparent", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  {isSelected && <div style={{ width:8, height:8, borderRadius:"50%", background:"#a855f7" }} />}
                                </div>
                              )}
                              <p style={{ flex:1, color:"#e2e8f0", fontSize:".84rem", lineHeight:1.6, margin:0 }}>{hook}</p>
                              <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:".35rem" }}>
                                <div style={{ background:`${scoreColor}15`, border:`1px solid ${scoreColor}30`, borderRadius:6, padding:".1rem .4rem", fontSize:".62rem", fontWeight:800, color:scoreColor }}>
                                  {scoreLabel} {score}
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText(hook); }}
                                  style={{ background:"rgba(109,40,217,.08)", border:"1px solid rgba(109,40,217,.2)", color:"#a855f7", padding:".15rem .5rem", borderRadius:6, cursor:"pointer", fontSize:".62rem", fontWeight:700, fontFamily:"inherit", flexShrink:0 }}>
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        );})}
                      </div>

                      {/* Compare side by side */}
                      {compareMode && compareSelected.length === 2 && (() => {
                        const [a, b] = compareSelected;
                        const hookA = results.viralHooks[a];
                        const hookB = results.viralHooks[b];
                        const scoreA = hookScores[a] || 0;
                        const scoreB = hookScores[b] || 0;
                        const winner = scoreA >= scoreB ? a : b;
                        return (
                          <div style={{ marginTop:"1rem", borderTop:"1px solid #141426", paddingTop:"1rem" }}>
                            <p style={{ fontSize:".6rem", fontWeight:800, color:"#a855f7", textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:".65rem" }}>⚔️ Head-to-Head Comparison</p>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".6rem" }}>
                              {[{idx:a,hook:hookA,score:scoreA},{idx:b,hook:hookB,score:scoreB}].map(({idx,hook,score}) => {
                                const isW = idx === winner;
                                const col = score >= 80 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
                                return (
                                <div key={idx} style={{ background: isW?"rgba(34,197,94,.06)":"#050508", border:`2px solid ${isW?"rgba(34,197,94,.4)":"#1a1a2e"}`, borderRadius:10, padding:".75rem" }}>
                                  {isW && <p style={{ margin:"0 0 .4rem", color:"#22c55e", fontSize:".6rem", fontWeight:800 }}>👑 WINNER</p>}
                                  <p style={{ color:"#e2e8f0", fontSize:".78rem", lineHeight:1.6, margin:"0 0 .5rem" }}>{hook}</p>
                                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                    <span style={{ color:col, fontWeight:800, fontSize:".72rem" }}>Score: {score}/100</span>
                                    <button onClick={() => navigator.clipboard.writeText(hook)}
                                      style={{ background:isW?"rgba(34,197,94,.1)":"transparent", border:`1px solid ${isW?"rgba(34,197,94,.3)":"#1a1a2e"}`, color:isW?"#22c55e":"#52525b", fontSize:".62rem", fontWeight:700, padding:".12rem .45rem", borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>
                                      Copy
                                    </button>
                                  </div>
                                </div>
                              );})}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {["Google Ads", "Meta Ads", "Native Ads", "YouTube Ads"].includes(platform) ? (
                    <>
                      <ResultCard title="Headlines" items={results.viralHooks} emoji="📢" color="#8b8cf8" charLimit={platform === "Google Ads" ? 30 : undefined} onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="hook" />
                      <ResultCard title="Ad Titles" items={results.titles} emoji="📝" color="#6d28d9" charLimit={platform === "Google Ads" ? 30 : undefined} onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="title" />
                      <ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#22c55e" charLimit={platform === "Google Ads" ? 90 : undefined} onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="caption" />
                      <KeywordResearchCard keywords={results.keywordSuggestions} />
                    </>
                  ) : platform === "YouTube" ? (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="hook" />
                      <ResultCard title="Video Hooks" items={results.viralHooks} emoji="🎬" color="#6d28d9" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="hook" />
                      <ResultCard title="SEO Titles" items={results.titles} emoji="📝" color="#22c55e" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="title" />
                      <ResultCard title="Descriptions" items={results.captions} emoji="💬" color="#f59e0b" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="caption" />
                    </>
                  ) : platform === "Reddit" ? (
                    <>
                      <ResultCard title="Reddit Post Titles" items={results.viralHooks} emoji="🔴" color="#ff4500" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="hook" />
                      <ResultCard title="Subreddit Ideas" items={results.titles} emoji="📌" color="#ff6534" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="title" />
                      <ResultCard title="Post Bodies" items={results.captions} emoji="💬" color="#6d28d9" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="caption" />
                    </>
                  ) : (
                    <>
                      <ResultCard title="Trending Topics" items={results.trendingTopics} emoji="📈" color="#8b8cf8" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="hook" />
                      <ResultCard title="Title Ideas" items={results.titles} emoji="📝" color="#22c55e" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="title" />
                      <ResultCard title="Captions" items={results.captions} emoji="💬" color="#f59e0b" onSaveToLibrary={saveToLibrary} niche={niche} platform={platform} type="caption" />
                    </>
                  )}
                  <div style={{ background: "#080808", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem", marginTop: "0.5rem" }}>
                    <p style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", color: "#444", fontWeight: 600 }}>WANT MORE FROM THIS KEYWORD?</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" as const }}>
                      {[["📊 Score my hooks", "score"], ["📅 Plan 30 days", "calendar"], ["📦 Full content pack", "pack"], ["🔍 See trends", "intelligence"], ["🎯 Templates", "templates"]].map(([label, tab]) => (
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
                  <div style={{ color: "#444", fontSize: "0.77rem", marginBottom: "0.85rem" }}>
                    {currency === "USD"
                      ? "Creator Starter $9 · Creator Pro $29 · Advertiser $49 · Agency $99"
                      : "Creator Starter ₹399 · Creator Pro ₹1,299 · Advertiser ₹2,499 · Agency ₹5,999"}
                  </div>
                  <button onClick={() => setShowPaywall(true)} style={{ background: "linear-gradient(135deg,#6d28d9,#6d28d9)", border: "none", color: "#fff", fontWeight: 800, padding: "0.55rem 1.5rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.82rem" }}>🚀 Upgrade Now</button>
                </div>
              )}
            </div>
          )}

          {/* TAB: HOOK SCORE */}
          {activeTab === "score" && (
            <HookScoreAnalyzer plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} onSaveHistory={saveToHistory} onCreditUsed={() => incrementUsage("score")} userType={userType} />
          )}

          {/* TAB: CALENDAR */}
          {activeTab === "calendar" && (
            plan === "free" ? (
              <LockedFeaturePreview emoji="📅" title="30-Day Content Calendar"
                tagline="Get a full month of platform-perfect hooks planned out in one click — never run out of ideas again."
                previewItems={["Day 1 (Tips): The one mistake everyone makes when...", "Day 2 (Story): I tried this for 30 days and...", "Day 3 (Mistakes): Stop doing this if you want..."]}
                onUpgrade={() => setShowPaywall(true)} />
            ) : (
              <ContentCalendar plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} langStrict={langStrict} onSaveHistory={saveToHistory} onCreditUsed={() => incrementUsage("calendar")} userType={userType} />
            )
          )}

          {/* TAB: IMAGE AI */}
          {activeTab === "image" && (
            plan === "free" ? (
              <LockedFeaturePreview emoji="🖼️" title="Image AI"
                tagline="Upload any photo and get hooks, captions, and keyword research written specifically around what's in the image."
                previewItems={["📸 Upload your product/lifestyle photo", "✨ AI reads the image automatically", "📝 Get hooks + captions matched to it"]}
                onUpgrade={() => setShowPaywall(true)} />
            ) : (
              <ImageContent plan={plan} onUpgrade={() => setShowPaywall(true)} credits={remaining} onCreditUsed={() => incrementUsage("image")} langLabel={langStrict} />
            )
          )}

          {/* TAB: TRENDS */}
          {activeTab === "trends" && (
            // Trends merged into Intelligence tab — redirect
            <div style={{ textAlign:"center", padding:"2rem 1rem", animation:"slideUp .3s ease" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>📈</div>
              <h3 style={{ color:"#fff", fontWeight:800, fontSize:"1rem", margin:"0 0 .5rem" }}>Trends is now in Intelligence 🔍</h3>
              <p style={{ color:"#52525b", fontSize:".82rem", margin:"0 0 1.25rem", lineHeight:1.6 }}>
                Real-time trends, keywords and viral topics are all in the Intelligence tab.
              </p>
              <button onClick={() => setActiveTab("intelligence")}
                style={{ background:"linear-gradient(135deg,#0891b2,#06b6d4)", border:"none", color:"#fff", padding:".75rem 2rem", borderRadius:"12px", cursor:"pointer", fontWeight:800, fontSize:".9rem", fontFamily:"inherit" }}>
                🔍 Go to Intelligence
              </button>
            </div>
          )}

          {/* TAB: REPURPOSE ENGINE — Creator Pro+ only */}
          {activeTab === "repurpose" && (
            ["creator_pro","advertiser","agency"].includes(plan)
              ? <AutoRepurposeEngine usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} onCreditUsed={() => incrementUsage("pack")} langStrict={langStrict} onSaveHistory={saveToHistory} />
              : <LockedFeaturePreview emoji="🔄" title="Auto-Repurpose Engine"
                  tagline="Paste any content — get 8 platform-native rewrites in one click. Instagram, LinkedIn, Twitter, WhatsApp, YouTube and more."
                  previewItems={["🔄 8 platforms rewritten natively", "📋 Best platform recommendation", "⚡ One click, instant output"]}
                  planRequired="Creator Pro" planPrice="₹1,299" onUpgrade={() => setShowPaywall(true)} />
          )}

          {/* TAB: COMPETITOR ANALYZER — Creator Pro+ only */}
          {activeTab === "competitor" && (
            ["creator_pro","advertiser","agency"].includes(plan)
              ? <CompetitorHookAnalyzer usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} onCreditUsed={() => incrementUsage("score")} platform={platform} onSaveHistory={saveToHistory} />
              : <LockedFeaturePreview emoji="🕵️" title="Competitor Hook Analyzer"
                  tagline="Paste any viral content — understand the psychology, get a virality score, and receive 3 original versions for your niche."
                  previewItems={["📊 Virality score /100", "🧠 Psychological triggers decoded", "✍️ 3 original inspired versions"]}
                  planRequired="Creator Pro" planPrice="₹1,299" onUpgrade={() => setShowPaywall(true)} />
          )}

          {activeTab === "library" && (
            <ContentLibrary userId={user?.id} supabase={supabase} />
          )}
          {activeTab === "whatsapp" && (
            !["advertiser","agency"].includes(plan)
              ? <LockedFeaturePreview emoji="💬" title="WhatsApp & Email Copy"
                  tagline="Festival broadcasts, cold DMs, email campaigns — India-specific tone, ready to send."
                  previewItems={["💬 WhatsApp broadcasts", "📧 Email campaigns", "📱 Cold DMs"]}
                  onUpgrade={() => setShowPaywall(true)} />
              : <WhatsAppEmailCopy onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} plan={plan} />
          )}
          {activeTab === "bio" && (
            !["advertiser","agency"].includes(plan)
              ? <LockedFeaturePreview emoji="✍️" title="Bio Writer"
                  tagline="Professional bios for Instagram, LinkedIn, Twitter, YouTube — platform-perfect every time."
                  previewItems={["✍️ Instagram bio", "💼 LinkedIn bio", "🐦 Twitter bio"]}
                  onUpgrade={() => setShowPaywall(true)} />
              : <BioWriter onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} plan={plan} />
          )}
          {activeTab === "product" && (
            !["advertiser","agency"].includes(plan)
              ? <LockedFeaturePreview emoji="🛍️" title="Product Description"
                  tagline="SEO-optimized product listings for Meesho, Amazon, Flipkart, Instagram Shop."
                  previewItems={["🛍️ Amazon listing", "📦 Meesho description", "📱 Instagram Shop"]}
                  onUpgrade={() => setShowPaywall(true)} />
              : <ProductDescWriter onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} plan={plan} />
          )}
          {activeTab === "templates" && (
            <ViralTemplates niche={niche} platform={platform} onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} />
          )}
          {activeTab === "localbusiness" && (
            <LocalBusinessKit plan={plan} onUpgrade={() => setShowPaywall(true)} onCreditUsed={() => incrementUsage("generate")} />
          )}
          {activeTab === "roi" && (
            <AdROICalculator plan={plan} onUpgrade={() => setShowPaywall(true)} />
          )}
          {activeTab === "abtest" && (
            <ABAdCopyGenerator plan={plan} onUpgrade={() => setShowPaywall(true)} onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} />
          )}
          {activeTab === "landingpage" && (
            <LandingPageCopy plan={plan} onUpgrade={() => setShowPaywall(true)} onCreditUsed={() => incrementUsage("generate")} onSaveHistory={saveToHistory} />
          )}

          {/* TAB: SCRIPT LAB */}
          {activeTab === "scriptlab" && (
            plan === "free" ? (
              <LockedFeaturePreview emoji="🎬" title="Script Lab"
                tagline="Generate complete word-for-word reel scripts (15-90 sec) with a matching thumbnail and AI voiceover in 7 languages."
                previewItems={["🎬 Full script with timing cues", "🖼️ Auto-generated thumbnail", "🔊 AI voiceover — Hindi, Tamil, Telugu & more"]}
                onUpgrade={() => setShowPaywall(true)} />
            ) : (
              <ScriptLab plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} langStrict={langStrict} langLabel={langLabel} onSaveHistory={saveToHistory} onCreditUsedGenerate={() => incrementUsage("scriptgenerate")} onCreditUsedImprove={() => incrementUsage("scriptimprove")} onCreditUsedVoice={() => incrementUsage("voiceover")} userType={userType} />
            )
          )}

          {/* TAB: CAPTION & HASHTAGS */}
          {activeTab === "caption" && (
            // Caption merged into Generate tab — redirect
            <div style={{ textAlign:"center", padding:"2rem 1rem", animation:"slideUp .3s ease" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>📋</div>
              <h3 style={{ color:"#fff", fontWeight:800, fontSize:"1rem", margin:"0 0 .5rem" }}>Captions are now in Generate ⚡</h3>
              <p style={{ color:"#52525b", fontSize:".82rem", margin:"0 0 1.25rem", lineHeight:1.6 }}>
                All hooks, titles, captions and hashtags are now in the Generate tab — all in one place.
              </p>
              <button onClick={() => setActiveTab("generate")}
                style={{ background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".75rem 2rem", borderRadius:"12px", cursor:"pointer", fontWeight:800, fontSize:".9rem", fontFamily:"inherit" }}>
                ⚡ Go to Generate
              </button>
            </div>
          )}

          {/* TAB: NICHE INTELLIGENCE — FREE for everyone! */}
          {activeTab === "intelligence" && (
            <div>
              {/* Trends section merged here */}
              <div style={{ background:"rgba(6,182,212,.05)", border:"1px solid rgba(6,182,212,.15)", borderRadius:"12px", padding:".65rem 1rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:".65rem" }}>
                <span style={{ fontSize:"1.1rem" }}>📈</span>
                <div>
                  <p style={{ margin:0, color:"#06b6d4", fontWeight:800, fontSize:".75rem" }}>Trends + Intelligence — all in one place</p>
                  <p style={{ margin:".1rem 0 0", color:"#52525b", fontSize:".68rem" }}>Real-time trending topics + keyword intelligence — all in one place</p>
                </div>
              </div>
              <TrendingNowCard niche={niche} platform={platform} />
              <NicheIntelligence niche={niche} keyword={keyword} langLabel={langLabel} />
            </div>
          )}

          {/* TAB: PACK */}
          {activeTab === "pack" && (
            plan === "free" ? (
              <LockedFeaturePreview emoji="📦" title="Content Pack — Everything for One Keyword"
                tagline="Generate takes 30 seconds. Pack gives 28+ pieces: 10 hooks, 8 titles, 5 captions, 5 full scripts, and 15 hashtags — across Instagram, YouTube, or Ads format. One click, weeks of content."
                previewItems={["🎣 10 viral hooks (2x Generate)", "🎬 5 full scripts (unique to Pack)", "📢 Ads, YouTube or Instagram mode"]}
                onUpgrade={() => setShowPaywall(true)} />
            ) : (
              <ContentPack plan={plan} usageCount={usageCount} limit={limit} onUpgrade={() => setShowPaywall(true)} keyword={keyword} niche={niche} platform={platform} langStrict={langStrict} onSaveHistory={saveToHistory} onCreditUsed={() => incrementUsage("pack")} userType={userType} />
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

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSelectPlan={handleSelectPlan} currency={currency} />}
      {payingPlan && <PaymentModal plan={payingPlan} onClose={() => setPayingPlan(null)} onPaid={handlePaid} detectedCurrency={currency} />}

      <VCIAssistant niche={niche} platform={platform} keyword={keyword} plan={plan} activeTab={activeTab} usageCount={usageCount} limit={limit} userType={userType} />

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

      {/* ── CREDIT DEDUCTION TOAST ── */}
      {creditToast && (
        <div style={{ position:"fixed", bottom:"5rem", left:"50%", transform:"translateX(-50%)", zIndex:9998, animation:"slideUp .3s ease", pointerEvents:"none" }}>
          <div style={{ background:"#080810", border:"1px solid rgba(109,40,217,.4)", borderRadius:"14px", padding:".65rem 1.1rem", display:"flex", alignItems:"center", gap:".65rem", boxShadow:"0 8px 32px rgba(0,0,0,.6)", whiteSpace:"nowrap" as const }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(109,40,217,.15)", border:"1px solid rgba(109,40,217,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".85rem", flexShrink:0 }}>⚡</div>
            <div>
              <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:".78rem" }}>
                {creditToast.feature === "generate" ? "Generate" :
                 creditToast.feature === "score" ? "Hook Score" :
                 creditToast.feature === "caption" ? "Captions (via Generate)" :
                 creditToast.feature === "calendar" ? "Calendar" :
                 creditToast.feature === "pack" ? "Content Pack" :
                 creditToast.feature === "image" ? "Image AI" :
                 creditToast.feature === "scriptgenerate" ? "Script Lab" :
                 creditToast.feature === "scriptimprove" ? "Script Improve" :
                 creditToast.feature === "voiceover" ? "AI Voice" :
                 creditToast.feature === "plan_upgrade" ? "🎉 Plan Activated!" : creditToast.feature}
                {creditToast.feature !== "plan_upgrade" && (
                  <>{" "}— <span style={{ color:"#ef4444" }}>−{creditToast.cost} credit{creditToast.cost > 1 ? "s" : ""}</span></>
                )}
              </p>
              <p style={{ margin:0, color:"#52525b", fontSize:".68rem" }}>
                <span style={{ color: creditToast.remaining <= 10 ? "#f59e0b" : "#a855f7", fontWeight:700 }}>{creditToast.remaining}</span>
                {" "}credits remaining
                {creditToast.remaining <= 10 && creditToast.remaining > 0 && <span style={{ color:"#f59e0b" }}> · Low!</span>}
                {creditToast.remaining === 0 && <span style={{ color:"#ef4444" }}> · Upgrade now</span>}
              </p>
            </div>
            {/* Progress mini */}
            <div style={{ width:60, height:4, background:"#1a1a2e", borderRadius:2, overflow:"hidden", flexShrink:0 }}>
              <div style={{ height:"100%", borderRadius:2, background: creditToast.remaining <= 10 ? "#f59e0b" : "#a855f7",
                width:`${Math.round((creditToast.remaining/limit)*100)}%`, transition:"width .3s" }} />
            </div>
          </div>
        </div>
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
              { q: "What is VCI?", a: "VCI (Viral Content Intelligence) is an AI-powered platform built for creators and businesses who need platform-accurate content, fast. It generates hooks, captions, hashtags, scripts, 30-day calendars, and ad copy — all tuned to how each platform actually performs, not generic, one-size-fits-all output." },
              { q: "What's included in the free plan?", a: "Every new account starts with 25 free credits each month, with full access to Generate, Hook Score, and Caption & Hashtags. All niches, platforms, and 30+ languages are unlocked from day one — there's no restricted 'demo mode,' just genuine functionality to evaluate before you commit." },
              { q: "How are credits calculated for each feature?", a: "Credit cost reflects how much work each feature actually does: Generate (1 credit), Hook Score (2), Captions (2), Content Pack (5), 30-Day Calendar (6), Image AI (6), Script Lab Improve (5), Script Lab Generate (8), and AI Voiceover (3). Intelligence and Trends remain completely free." },
              { q: "How soon is my plan activated after payment?", a: "Once you've completed payment, send your screenshot to our WhatsApp support line. Plans are verified and activated manually within 2 hours. Payment via UPI: 9315133390@ptyes" },
              { q: "Which plan is right for me?", a: "If you're a creator just getting started, Creator Starter (₹399 — 150 credits) covers all 12 creator tools. Posting daily and need Repurpose + Competitor Analyzer? Creator Pro (₹1,299 — 500 credits). Running paid ads on Google or Meta? Advertiser (₹2,499 — 950 credits) includes ROI Calculator, A/B Ad Copy, Landing Page, WA/Email, Bio, Product Desc, and Templates. Managing multiple clients? Agency (₹5,999 — 2,400 credits) unlocks everything." },
              { q: "What's the difference between the Creator and Advertiser plans?", a: "Creator plans are scoped to social platforms — Instagram, YouTube, TikTok, and similar — and include the Calendar, Pack, Script Lab, and Image AI tools. The Advertiser plan is purpose-built for Google, Meta, YouTube, and Native Ads: headlines, descriptions, and AI-estimated keyword research, each respecting the platform's exact character limits. The Agency plan includes both in full." },
              { q: "Do unused credits carry over to the next month?", a: "Credits refresh automatically at the start of each billing cycle based on your plan. Unused credits from the previous month do not carry forward — we'd recommend planning your usage within each cycle to get full value from your subscription." },
              { q: "What is your refund policy?", a: "If you cancel within 24 hours of subscribing, we'll refund your payment minus the value of any credits you've already used during that period — calculated at standard per-credit rates. This keeps things fair for everyone: you're only charged for what you actually used, and we're not left covering costs for AI generations already delivered. Refund requests must be raised within the 24-hour window via WhatsApp; requests made after this period are not eligible for a refund. Reach out to +91 9315133390 to initiate a request." },
              { q: "How do I install VCI on my phone?", a: "Open getvci.com in your mobile browser. On Android (Chrome), tap the menu and select 'Add to Home Screen.' On iPhone, open the link in Safari and use the Share menu to do the same — VCI will then behave like a native app, launching full-screen without browser controls." },
              { q: "Is Hindi and regional language content supported?", a: "Yes — VCI supports 30+ languages, including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, and Malayalam, each generated natively in its own script rather than translated after the fact." },
              { q: "What exactly does Script Lab do?", a: "Script Lab writes complete, word-for-word reel scripts from 15 to 90 seconds, paired with a matching thumbnail and an AI voiceover in 7 languages. You can also paste in a script you've already written to receive a structured Before/After comparison with specific improvements. Available from Creator Pro upward." },
            ].map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
            <div style={{ marginTop: "1.25rem", background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>Have more questions? 🙋</p>
              <a href="https://wa.me/919315133390?text=Hi! VCI ke baare mein kuch poochna tha" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.82rem" }}>
                💬 WhatsApp Support
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