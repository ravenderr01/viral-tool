import { useState, useRef } from "react";

const BACKEND = "https://viral-tool-1.onrender.com";

const PLATFORMS = [
  { group: "📱 Social Media", items: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter / X", "Facebook", "Pinterest", "WhatsApp", "Snapchat", "Reddit"] },
  { group: "📢 Advertising", items: ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"] },
];

const LANGUAGES = [
  { code: "en", label: "🇬🇧 English" },
  { code: "hi", label: "🇮🇳 Hindi" },
  { code: "es", label: "🇪🇸 Spanish" },
  { code: "fr", label: "🇫🇷 French" },
  { code: "de", label: "🇩🇪 German" },
  { code: "ar", label: "🇸🇦 Arabic" },
  { code: "pt", label: "🇧🇷 Portuguese" },
  { code: "id", label: "🇮🇩 Indonesian" },
  { code: "tr", label: "🇹🇷 Turkish" },
  { code: "bn", label: "🇧🇩 Bengali" },
  { code: "ur", label: "🇵🇰 Urdu" },
  { code: "zh", label: "🇨🇳 Chinese" },
  { code: "ja", label: "🇯🇵 Japanese" },
  { code: "ko", label: "🇰🇷 Korean" },
  { code: "ru", label: "🇷🇺 Russian" },
];

const LANG_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", es: "Spanish", fr: "French",
  de: "German", pt: "Portuguese", ar: "Arabic", zh: "Chinese",
  ja: "Japanese", ko: "Korean", ru: "Russian", tr: "Turkish",
  id: "Indonesian", bn: "Bengali", ur: "Urdu",
};

const PLATFORM_PROMPTS: Record<string, string> = {
  "Instagram": `Generate Instagram-specific content:
- hooks: 5 Reel opening lines (stop scroll in 1 sec, use emotion/curiosity/shock based on the image)
- titles: 5 Reel/Post title ideas with trending formats (POV, Tutorial, Day-in-life, Before/After)
- captions: 3 complete captions (150-200 chars) with emojis, storytelling, strong CTA
- hashtags: 15 relevant hashtags mix (niche + broad + trending)`,

  "YouTube": `Generate YouTube-specific content:
- hooks: 5 video opening lines (first 30 seconds) that create FOMO or curiosity based on the image
- titles: 5 SEO-optimized video titles with power words, numbers, brackets
- captions: 3 video descriptions (200 chars) with keywords and CTA
- hashtags: 10 YouTube tags`,

  "TikTok": `Generate TikTok-specific content:
- hooks: 5 first-3-second hooks based on the image (pattern interrupt, bold claim)
- titles: 5 TikTok captions (under 100 chars) with trending style
- captions: 3 TikTok video scripts (Hook 1 line → Story 2 lines → CTA 1 line)
- hashtags: 10 trending TikTok hashtags`,

  "LinkedIn": `Generate LinkedIn-specific content:
- hooks: 5 professional post openers based on the image (bold insight or personal story)
- titles: 5 thought leadership article titles
- captions: 3 LinkedIn posts (150-200 chars) value-first, authority tone
- hashtags: 5 professional LinkedIn hashtags`,

  "Twitter / X": `Generate Twitter/X-specific content:
- hooks: 5 tweet hooks (under 200 chars) controversial or surprising based on the image
- titles: 5 thread titles that make people click
- captions: 3 tweet threads (3 tweets each, separated by //)
- hashtags: 5 trending hashtags`,

  "Facebook": `Generate Facebook-specific content:
- hooks: 5 emotional post openers based on the image (relatable, community-focused)
- titles: 5 shareable post headlines (40-60 chars)
- captions: 3 Facebook posts (200-300 chars) Story → Value → CTA
- hashtags: 8 Facebook hashtags`,

  "Pinterest": `Generate Pinterest-specific content:
- hooks: 5 pin titles (60-80 chars) keyword-rich, benefit-focused based on the image
- titles: 5 board name ideas (specific, searchable)
- captions: 3 pin descriptions (200-300 chars) natural keywords, CTA to save
- hashtags: 10 Pinterest search terms`,

  "WhatsApp": `Generate WhatsApp-specific content:
- hooks: 5 broadcast message openers based on the image (personal, direct, curiosity)
- titles: 5 WhatsApp status ideas
- captions: 3 broadcast messages (150-200 chars) conversational, clear CTA
- hashtags: []`,

  "Snapchat": `Generate Snapchat-specific content:
- hooks: 5 snap story hooks (30-50 chars) fun, FOMO-inducing based on the image
- titles: 5 story series ideas
- captions: 3 snap text overlays (10-20 chars) short, punchy, emoji-driven
- hashtags: 5 Snapchat hashtags`,

  "Reddit": `Generate Reddit-specific content:
- hooks: 5 Reddit post titles that spark discussion based on the image (curiosity, controversy, helpful)
- titles: 5 specific subreddit recommendations (format: r/subredditname — why post here)
- captions: 3 complete Reddit post bodies (200-300 chars) conversational, value-first, ends with question
- hashtags: []`,

  "Meta Ads": `Generate Meta Ads-specific content:
- hooks: 5 ad primary text openers (80-125 chars) start with customer pain point based on image
- titles: 5 ad headlines (30-40 chars) specific number or result
- captions: 3 complete ad copies (200-300 chars) Pain → Agitate → Solution → CTA format
- hashtags: []`,

  "Google Ads": `Generate Google Ads-specific content:
- hooks: 5 Search Ad headlines (EXACTLY 25-30 chars each) urgency + benefit based on image
- titles: 5 Display Ad headlines (25-30 chars) unique selling point
- captions: 3 Ad descriptions (80-90 chars) benefit + proof + CTA
- hashtags: []`,

  "YouTube Ads": `Generate YouTube Ads-specific content:
- hooks: 5 first-5-second ad hooks that prevent skipping based on the image
- titles: 5 companion banner headlines (40-60 chars)
- captions: 3 complete ad scripts: Hook(5sec) → Problem(10sec) → Solution(15sec) → CTA(5sec)
- hashtags: []`,

  "Native Ads": `Generate Native Ads-specific content:
- hooks: 5 curiosity headlines that look like editorial content based on the image
- titles: 5 article-style titles that blend with editorial
- captions: 3 advertorial descriptions (100-150 chars) informational, not promotional
- hashtags: []`,
};

interface KeywordSuggestion {
  keyword: string;
  matchType: string;
  volume: string;
  competition: string;
  intent: string;
}

interface ResultData {
  imageDescription: string;
  hooks: string[];
  titles: string[];
  captions: string[];
  hashtags: string[];
  keywordSuggestions?: KeywordSuggestion[];
}

export default function ImageContent({
  plan, onUpgrade, credits, onCreditUsed, langLabel = "English"
}: {
  plan: string;
  onUpgrade: () => void;
  credits: number;
  onCreditUsed: () => void;
  langLabel?: string;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("Instagram");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [keyword, setKeyword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isLocked = false; // Unlocked for all plans during testing phase

  // 🛠️ TEMPORARY: Image AI is offline while we switch this feature's vision
  // engine over to Claude (Groq discontinued their vision-capable model).
  // Flip this back to `false` once the backend is wired up to Claude vision.
  const isTemporarilyDisabled = true;

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setError("");
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const generate = async () => {
    if (!image || !imageFile) { setError("Please upload an image first"); return; }
    if (credits <= 0) { onUpgrade(); return; }

    setLoading(true); setError(""); setResult(null);

    try {
      // Convert to base64
      const base64 = image.split(",")[1];
      const mimeType = imageFile.type;
      const langLabel = LANG_LABELS[lang] || "English";
      const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS["Instagram"];

      const isAdsplatform = ["Meta Ads", "Google Ads", "YouTube Ads", "Native Ads"].includes(platform);

      const keywordResearchInstruction = isAdsplatform ? `

STEP 3 — ALSO generate a keyword research list based on what's actually in the image (the product/subject you identified in imageDescription):
- Suggest 8 keyword variations directly relevant to the product/subject shown in the image — mixing match types: broad, phrase, and exact
- Base these on the visual subject itself, not a generic guess — if the image shows bags, all 8 keywords must be about bags, not an unrelated theme
- For each keyword, estimate relative search volume as "High", "Medium", or "Low" (clearly an estimate, not exact Google data)
- For each keyword, estimate competition as "High", "Medium", or "Low"
- Classify search intent as "Commercial", "Informational", "Navigational", or "Transactional"
- COMPLY WITH GOOGLE ADS POLICY: no superlative/unverifiable claims (avoid "cure", "guaranteed", "#1", "best in the world"). Keep keywords factual and policy-safe.
- Do not suggest trademarked brand names unless visible in the image itself.
- Keep keywords in English/Latin script regardless of output language, since ad platforms require Latin-script targeting in most markets.` : "";

      const keywordJsonField = isAdsplatform
        ? `,\n  "keywordSuggestions": [{"keyword": "kw1", "matchType": "Broad", "volume": "Medium", "competition": "Low", "intent": "Commercial"}]`
        : "";

      const prompt = `You are an expert content creator and marketer. Analyze this image carefully and generate highly specific, platform-optimized content.
      

PLATFORM: ${platform}
OUTPUT LANGUAGE: Write EVERYTHING strictly in ${langLabel} only

${keyword ? `KEYWORD/TOPIC CONTEXT: "${keyword}" — Use this keyword to make content more specific and targeted.` : ""}

STEP 1 — Analyze the image:
Look at: subject/product, colors, mood, setting, people, text, brand elements, emotions conveyed

STEP 2 — Generate ${platform}-specific content based on what you see:
${platformPrompt}
${keywordResearchInstruction}

IMPORTANT RULES:
- Every piece of content must be DIRECTLY inspired by what's in the image
- Make it feel authentic, not generic
- Adapt tone perfectly for ${platform} audience
- Use the image's mood and elements as inspiration
- If image shows food → use food-specific language
- If image shows person → use personal/relatable language  
- If image shows product → use benefit/feature language
- If image shows place → use experience/travel language

Respond ONLY in this exact JSON (no markdown):
{
  "imageDescription": "Brief description of what you see in the image",
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "captions": ["caption1", "caption2", "caption3"],
  "hashtags": ["#tag1", "#tag2", "#tag3"]${keywordJsonField}
}`;

      const res = await fetch(`${BACKEND}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2200,
          system: `You are a visual content expert. Analyze images and create platform-specific viral content. Always respond in valid JSON only.`,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType,
                    data: base64
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Normalize: ensure every array field is always an array, even if the AI omitted it
      const safeResult: ResultData = {
        imageDescription: parsed.imageDescription || "",
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks : [],
        titles: Array.isArray(parsed.titles) ? parsed.titles : [],
        captions: Array.isArray(parsed.captions) ? parsed.captions : [],
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        keywordSuggestions: Array.isArray(parsed.keywordSuggestions) ? parsed.keywordSuggestions : [],
      };
      setResult(safeResult);
      onCreditUsed();

    } catch (err) {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = (items: string[], key: string) => {
    navigator.clipboard.writeText(items.join("\n"));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLocked) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", animation: "slideUp 0.4s ease" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: "0.5rem", fontSize: "1.2rem" }}>Pro & Agency Feature</h3>
        <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Upload any image and get platform-specific viral content instantly.</p>
        <p style={{ color: "#444", fontSize: "0.78rem", marginBottom: "1.5rem" }}>Available on Pro (₹1,999) and Agency (₹4,999) plans.</p>
        <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", border: "none", color: "#fff", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: "0.9rem" }}>
          🚀 Upgrade to Pro
        </button>
      </div>
    );
  }

  // 🛠️ TEMPORARY "Coming Soon" screen — shown while Image AI's vision engine
  // is being migrated from Groq (discontinued) to Claude.
  if (isTemporarilyDisabled) {
    return (
      <div style={{ animation: "slideUp 0.4s ease" }}>
        <div style={{
          background: "linear-gradient(135deg,#0d0d0d,#111)",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "18px",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
            width: "260px", height: "260px",
            background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: "18px",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              fontSize: "1.8rem", marginBottom: "1.1rem",
              boxShadow: "0 8px 28px rgba(168,85,247,0.35)",
            }}>
              🖼️
            </div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: "20px", padding: "0.25rem 0.85rem", marginBottom: "0.85rem",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", animation: "pulse 1.5s infinite" }} />
              <span style={{ color: "#a855f7", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}>
                UPGRADING
              </span>
            </div>

            <h3 style={{
              margin: "0 0 0.5rem", fontFamily: "'Syne',sans-serif",
              color: "#fff", fontSize: "1.15rem", fontWeight: 800,
            }}>
              Image AI — Coming Back Soon
            </h3>

            <p style={{
              margin: "0 auto 1.5rem", color: "#71717a", fontSize: "0.85rem",
              lineHeight: 1.7, maxWidth: "360px",
            }}>
              We're upgrading Image AI to a more powerful vision engine for sharper,
              more accurate results. This feature will be back online shortly —
              thanks for your patience!
            </p>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center",
            }}>
              {["Better accuracy", "Faster results", "Richer captions"].map((label) => (
                <span key={label} style={{
                  background: "#0a0a0a", border: "1px solid #1e1e1e",
                  color: "#52525b", padding: "0.3rem 0.75rem", borderRadius: "20px",
                  fontSize: "0.7rem", fontWeight: 600,
                }}>
                  ✓ {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Header */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>🖼️</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>Image → Viral Content</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Upload any image — get platform-specific content instantly</p>
          </div>
        </div>

        {/* Image Upload */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#a855f7" : image ? "#22c55e" : "#1e1e1e"}`,
            borderRadius: "14px",
            padding: image ? "0.5rem" : "2rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "rgba(168,85,247,0.05)" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s",
            marginBottom: "1rem",
            position: "relative",
            overflow: "hidden"
          }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {image ? (
            <div style={{ position: "relative" }}>
              <img src={image} alt="uploaded" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: "10px", objectFit: "contain" }} />
              <button
                onClick={e => { e.stopPropagation(); setImage(null); setImageFile(null); setResult(null); }}
                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
              <p style={{ margin: "0.5rem 0 0", color: "#22c55e", fontSize: "0.72rem", fontWeight: 600 }}>✓ Image ready — click to change</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📸</div>
              <p style={{ margin: 0, color: "#555", fontSize: "0.85rem", fontWeight: 600 }}>Drop image here or click to upload</p>
              <p style={{ margin: "0.3rem 0 0", color: "#333", fontSize: "0.72rem" }}>JPG, PNG, WebP — Max 5MB</p>
            </>
          )}
        </div>
{/* Keyword Input */}
<div style={{ marginBottom: "1rem" }}>
  <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>
    KEYWORD / TOPIC <span style={{ color: "#555", fontWeight: 400 }}>(Optional — leave empty to analyze image only)</span>
  </label>
  <input
    value={keyword}
    onChange={e => setKeyword(e.target.value)}
    placeholder="e.g. weight loss, travel vlog, product launch..."
    style={{
      width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e",
      borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff",
      fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif",
      transition: "border 0.2s"
    }}
    onFocus={e => e.target.style.borderColor = "#a855f7"}
    onBlur={e => e.target.style.borderColor = "#1e1e1e"}
  />
</div>
        {/* Platform Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
          {PLATFORMS.map(group => (
            <div key={group.group} style={{ marginBottom: "0.5rem" }}>
              <p style={{ color: "#333", fontSize: "0.6rem", fontWeight: 700, margin: "0 0 0.3rem", letterSpacing: "0.06em" }}>{group.group}</p>
              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                {group.items.map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    style={{
                      background: platform === p ? "rgba(168,85,247,0.15)" : "#0a0a0a",
                      border: `1px solid ${platform === p ? "#a855f7" : "#1a1a1a"}`,
                      color: platform === p ? "#a855f7" : "#444",
                      padding: "0.25rem 0.65rem", borderRadius: "20px",
                      cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                      transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>OUTPUT LANGUAGE</label>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{
                  background: lang === l.code ? "rgba(168,85,247,0.15)" : "#0a0a0a",
                  border: `1px solid ${lang === l.code ? "#a855f7" : "#1a1a1a"}`,
                  color: lang === l.code ? "#a855f7" : "#444",
                  padding: "0.25rem 0.65rem", borderRadius: "20px",
                  cursor: "pointer", fontSize: "0.72rem", fontWeight: 600,
                  transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>{error}</p>}

        <button onClick={generate} disabled={loading || !image}
          style={{
            width: "100%", padding: "0.9rem", borderRadius: "12px",
            background: !image ? "#0d0d0d" : loading ? "#111" : "linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)",
            border: "none", color: !image || loading ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.95rem",
            cursor: !image || loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s",
            boxShadow: image && !loading ? "0 8px 32px rgba(168,85,247,0.4)" : "none"
          }}>
          {loading ? "🖼️ Analyzing image & generating..." : `⚡ Generate ${platform} Content ${keyword ? `— "${keyword}"` : "— Image Only"}`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ animation: "slideUp 0.4s ease" }}>

          {/* Image Description */}
          <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "12px", padding: "0.75rem 1rem", marginBottom: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>👁️</span>
            <div>
              <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.06em" }}>AI SEES IN YOUR IMAGE</p>
              <p style={{ margin: 0, color: "#ccc", fontSize: "0.82rem", lineHeight: 1.5 }}>{result.imageDescription}</p>
            </div>
          </div>

          {/* Platform Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.72rem", fontWeight: 700 }}>
              {platform} Content
            </span>
            <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.72rem", fontWeight: 700 }}>
              {LANG_LABELS[lang]}
            </span>
          </div>

          {/* Hooks */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color: "#a855f7", fontSize: "0.88rem" }}>🎣 {platform === "Google Ads" ? "Headlines" : platform === "Reddit" ? "Post Titles" : "Viral Hooks"}</h3>
              <button onClick={() => copyAll(result.hooks, "hooks")} style={{ background: copied === "hooks" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied === "hooks" ? "#22c55e" : "#2a2a2a"}`, color: copied === "hooks" ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
                {copied === "hooks" ? "✓ Copied!" : "Copy all"}
              </button>
            </div>
            {result.hooks.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.4rem 0", borderBottom: i < result.hooks.length - 1 ? "1px solid #111" : "none" }}>
                <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, paddingTop: "0.1rem", minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, color: "#ccc", fontSize: "0.83rem", lineHeight: 1.6, flex: 1 }}>{h}</p>
                <button onClick={() => copyText(h, `hook${i}`)} style={{ background: "none", border: "none", color: copied === `hook${i}` ? "#22c55e" : "#333", cursor: "pointer", fontSize: "0.7rem", flexShrink: 0 }}>
                  {copied === `hook${i}` ? "✓" : "📋"}
                </button>
              </div>
            ))}
          </div>

          {/* Titles */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color: "#22c55e", fontSize: "0.88rem" }}>📝 {platform === "Reddit" ? "Subreddit Ideas" : platform === "Pinterest" ? "Board Names" : "Title Ideas"}</h3>
              <button onClick={() => copyAll(result.titles, "titles")} style={{ background: copied === "titles" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied === "titles" ? "#22c55e" : "#2a2a2a"}`, color: copied === "titles" ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
                {copied === "titles" ? "✓ Copied!" : "Copy all"}
              </button>
            </div>
            {result.titles.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.4rem 0", borderBottom: i < result.titles.length - 1 ? "1px solid #111" : "none" }}>
                <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, paddingTop: "0.1rem", minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, color: "#ccc", fontSize: "0.83rem", lineHeight: 1.6, flex: 1 }}>{t}</p>
                <button onClick={() => copyText(t, `title${i}`)} style={{ background: "none", border: "none", color: copied === `title${i}` ? "#22c55e" : "#333", cursor: "pointer", fontSize: "0.7rem", flexShrink: 0 }}>
                  {copied === `title${i}` ? "✓" : "📋"}
                </button>
              </div>
            ))}
          </div>

          {/* Captions */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color: "#f59e0b", fontSize: "0.88rem" }}>💬 {platform === "Google Ads" ? "Ad Descriptions" : platform.includes("Ads") ? "Ad Copy" : "Captions"}</h3>
              <button onClick={() => copyAll(result.captions, "captions")} style={{ background: copied === "captions" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied === "captions" ? "#22c55e" : "#2a2a2a"}`, color: copied === "captions" ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
                {copied === "captions" ? "✓ Copied!" : "Copy all"}
              </button>
            </div>
            {result.captions.map((c, i) => (
              <div key={i} style={{ padding: "0.6rem 0", borderBottom: i < result.captions.length - 1 ? "1px solid #111" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, paddingTop: "0.1rem", minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ margin: 0, color: "#ccc", fontSize: "0.83rem", lineHeight: 1.6, flex: 1 }}>{c}</p>
                  <button onClick={() => copyText(c, `cap${i}`)} style={{ background: "none", border: "none", color: copied === `cap${i}` ? "#22c55e" : "#333", cursor: "pointer", fontSize: "0.7rem", flexShrink: 0 }}>
                    {copied === `cap${i}` ? "✓" : "📋"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Hashtags */}
          {result.hashtags && result.hashtags.length > 0 && (
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color: "#06b6d4", fontSize: "0.88rem" }}>#️⃣ Hashtags</h3>
                <button onClick={() => copyAll(result.hashtags, "hashtags")} style={{ background: copied === "hashtags" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied === "hashtags" ? "#22c55e" : "#2a2a2a"}`, color: copied === "hashtags" ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
                  {copied === "hashtags" ? "✓ Copied!" : "Copy all"}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {result.hashtags.map((tag, i) => (
                  <button key={i} onClick={() => copyText(tag, `tag${i}`)}
                    style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4", padding: "0.25rem 0.65rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(result.keywordSuggestions) && result.keywordSuggestions.length > 0 && (
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", color: "#06b6d4", fontSize: "0.88rem" }}>🔑 Keyword Research</h3>
                <button onClick={() => copyAll(result.keywordSuggestions!.map(k => `${k.keyword}\t${k.matchType}\tVolume: ${k.volume}\tCompetition: ${k.competition}\tIntent: ${k.intent}`), "keywords")}
                  style={{ background: copied === "keywords" ? "#22c55e18" : "#ffffff0a", border: `1px solid ${copied === "keywords" ? "#22c55e" : "#2a2a2a"}`, color: copied === "keywords" ? "#22c55e" : "#555", padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>
                  {copied === "keywords" ? "✓ Copied!" : "Copy all"}
                </button>
              </div>
              <p style={{ margin: "0 0 0.75rem", color: "#3f3f46", fontSize: "0.65rem", lineHeight: 1.5 }}>
                Based on the product/subject detected in your image. AI-estimated relative volume & competition — directional guidance, not exact Google data.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.keywordSuggestions.map((k, i) => {
                  const levelColor = (lvl: string) => lvl === "High" ? "#ef4444" : lvl === "Medium" ? "#f59e0b" : "#22c55e";
                  const intentColor: Record<string, string> = { Commercial: "#8b5cf6", Informational: "#06b6d4", Navigational: "#71717a", Transactional: "#22c55e" };
                  return (
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}