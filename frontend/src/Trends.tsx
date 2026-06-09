import { useState } from "react";

const COUNTRIES = [
  { code: "IN", label: "🇮🇳 India" },
  { code: "US", label: "🇺🇸 USA" },
  { code: "GB", label: "🇬🇧 UK" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "SG", label: "🇸🇬 Singapore" },
  { code: "AE", label: "🇦🇪 UAE" },
  { code: "PK", label: "🇵🇰 Pakistan" },
  { code: "BD", label: "🇧🇩 Bangladesh" },
];

const PLATFORMS = [
  { id: "Instagram", label: "📸 Instagram", color: "#e1306c" },
  { id: "YouTube", label: "▶️ YouTube", color: "#ef4444" },
  { id: "TikTok", label: "🎵 TikTok", color: "#00f2ea" },
  { id: "LinkedIn", label: "💼 LinkedIn", color: "#0077b5" },
  { id: "Twitter / X", label: "🐦 Twitter/X", color: "#1da1f2" },
  { id: "Facebook", label: "👍 Facebook", color: "#1877f2" },
];

const BACKEND = "https://viral-tool-1.onrender.com";

export default function Trends({ niche, keyword, langLabel, platform: propPlatform }: { niche: string; keyword: string; langLabel: string; platform?: string }) {
  const [loading, setLoading] = useState(false);
  const [googleTrends, setGoogleTrends] = useState<any[]>([]);
  const [youtubeTrends, setYoutubeTrends] = useState<any[]>([]);
  const [youtubeSearch, setYoutubeSearch] = useState<any[]>([]);
  const [platformTrends, setPlatformTrends] = useState<any>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"platform" | "google" | "youtube">("platform");
  const [country, setCountry] = useState("IN");
  const [fetched, setFetched] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(propPlatform || "Instagram");
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fetchPlatformTrends = async () => {
    setPlatformLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/trends/platform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform, niche, keyword, country })
      });
      const data = await res.json();
      setPlatformTrends(data);
    } catch (err) {
      setError("Failed to fetch platform trends.");
    }
    setPlatformLoading(false);
  };

  const fetchTrends = async () => {
    setLoading(true);
    setError("");
    setGoogleTrends([]);
    setYoutubeTrends([]);
    setYoutubeSearch([]);

    try {
      const [googleRes, youtubeRes, youtubeSearchRes] = await Promise.allSettled([
        fetch(`${BACKEND}/api/trends/google?q=${encodeURIComponent(keyword || niche)}&country=${country}`),
        fetch(`${BACKEND}/api/trends/youtube?country=${country}`),
        fetch(`${BACKEND}/api/trends/youtube-search?q=${encodeURIComponent(keyword || niche)}&country=${country}`)
      ]);

      if (googleRes.status === "fulfilled" && googleRes.value.ok) {
        const data = await googleRes.value.json();
        const interest = data.interest_over_time?.timeline_data || [];
        setGoogleTrends(interest.slice(-10).reverse());
      }

      if (youtubeRes.status === "fulfilled" && youtubeRes.value.ok) {
        const data = await youtubeRes.value.json();
        setYoutubeTrends((data.items || []).slice(0, 10));
      }

      if (youtubeSearchRes.status === "fulfilled" && youtubeSearchRes.value.ok) {
        const data = await youtubeSearchRes.value.json();
        setYoutubeSearch((data.items || []).slice(0, 8));
      }

      setFetched(true);
    } catch (err) {
      setError("Failed to fetch trends. Please try again.");
    }

    setLoading(false);
  };

  const formatViews = (count: string) => {
    const n = parseInt(count);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return count;
  };

  const platformColor = PLATFORMS.find(p => p.id === selectedPlatform)?.color || "#a855f7";

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Header */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e",
        borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📈</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>Trend Intelligence</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Platform trends + Google + YouTube — niche & country wise</p>
          </div>
        </div>

        {/* Country Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT COUNTRY</label>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {COUNTRIES.map(c => (
              <button key={c.code} onClick={() => setCountry(c.code)}
                style={{
                  background: country === c.code ? "rgba(168,85,247,0.15)" : "#0a0a0a",
                  border: `1px solid ${country === c.code ? "#a855f7" : "#1a1a1a"}`,
                  color: country === c.code ? "#a855f7" : "#444",
                  padding: "0.28rem 0.65rem", borderRadius: "20px",
                  cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                  transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Keyword info */}
        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
          fontSize: "0.78rem", color: "#a855f7"
        }}>
          🔍 <strong>{keyword || niche}</strong> · <strong>{COUNTRIES.find(c => c.code === country)?.label}</strong>
        </div>

        <button onClick={() => { fetchTrends(); fetchPlatformTrends(); }} disabled={loading || platformLoading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: (loading || platformLoading) ? "#111" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none", color: (loading || platformLoading) ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.88rem",
            cursor: (loading || platformLoading) ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
          }}>
          {(loading || platformLoading) ? "⚡ Fetching Trends..." : "📈 Fetch All Trends"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem",
          color: "#f87171", fontSize: "0.82rem"
        }}>{error}</div>
      )}

      {(fetched || platformTrends) && (
        <div style={{ animation: "slideUp 0.4s ease" }}>

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: "0.3rem", marginBottom: "1rem",
            background: "#0a0a0a", borderRadius: "10px", padding: "0.3rem"
          }}>
            {[
              { id: "platform", label: "🔥 Platform Trends" },
              { id: "google", label: "🔍 Google" },
              { id: "youtube", label: "▶️ YouTube" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
                style={{
                  flex: 1, padding: "0.55rem 0.3rem", borderRadius: "8px", border: "none",
                  background: activeSection === tab.id ? "rgba(168,85,247,0.15)" : "transparent",
                  color: activeSection === tab.id ? "#a855f7" : "#444",
                  fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  borderBottom: activeSection === tab.id ? "2px solid #a855f7" : "2px solid transparent"
                }}>{tab.label}</button>
            ))}
          </div>

          {/* ✅ PLATFORM TRENDS TAB */}
          {activeSection === "platform" && (
            <div>
              {/* Platform Selector */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>SELECT PLATFORM</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                      style={{
                        background: selectedPlatform === p.id ? `${p.color}20` : "#0a0a0a",
                        border: `1px solid ${selectedPlatform === p.id ? p.color : "#1a1a1a"}`,
                        color: selectedPlatform === p.id ? p.color : "#444",
                        padding: "0.28rem 0.65rem", borderRadius: "20px",
                        cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                        transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif"
                      }}>{p.label}</button>
                  ))}
                </div>
                <button onClick={fetchPlatformTrends} disabled={platformLoading}
                  style={{
                    marginTop: "0.75rem", padding: "0.5rem 1.2rem", borderRadius: "8px",
                    background: platformLoading ? "#111" : `${platformColor}20`,
                    border: `1px solid ${platformColor}40`,
                    color: platformLoading ? "#333" : platformColor,
                    fontSize: "0.78rem", fontWeight: 700, cursor: platformLoading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans',sans-serif"
                  }}>
                  {platformLoading ? "⚡ Generating..." : `🔄 Refresh ${selectedPlatform} Trends`}
                </button>
              </div>

              {platformLoading && (
                <div style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "12px", padding: "2rem", textAlign: "center"
                }}>
                  <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>⚡ Generating {selectedPlatform} trends for {niche}...</p>
                </div>
              )}

              {platformTrends && !platformLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

                  {/* Pro Tip */}
                  {platformTrends.pro_tip && (
                    <div style={{
                      background: `${platformColor}12`, border: `1px solid ${platformColor}30`,
                      borderRadius: "12px", padding: "0.75rem 1rem",
                      display: "flex", gap: "0.5rem", alignItems: "flex-start"
                    }}>
                      <span style={{ fontSize: "1.1rem" }}>💡</span>
                      <div>
                        <p style={{ margin: 0, color: platformColor, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em" }}>PRO TIP</p>
                        <p style={{ margin: "0.2rem 0 0", color: "#ccc", fontSize: "0.82rem", lineHeight: 1.5 }}>{platformTrends.pro_tip}</p>
                      </div>
                    </div>
                  )}

                  {/* Trending Formats */}
                  {platformTrends.trending_formats?.length > 0 && (
                    <div>
                      <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                        🎬 TRENDING FORMATS ON {selectedPlatform.toUpperCase()}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {platformTrends.trending_formats.map((item: any, i: number) => (
                          <div key={i} style={{
                            background: "#0d0d0d", border: "1px solid #1a1a1a",
                            borderRadius: "10px", padding: "0.75rem 1rem",
                            transition: "border-color 0.2s"
                          }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = `${platformColor}40`}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>
                                  <span style={{ color: platformColor }}>#{i + 1}</span> {item.format}
                                </p>
                                <p style={{ margin: "0.2rem 0", color: "#666", fontSize: "0.75rem" }}>{item.description}</p>
                                <p style={{ margin: "0.2rem 0 0", color: "#888", fontSize: "0.72rem", fontStyle: "italic" }}>
                                  💡 "{item.example}"
                                </p>
                                {item.why_trending && (
                                  <span style={{
                                    display: "inline-block", marginTop: "0.3rem",
                                    background: "#22c55e18", border: "1px solid #22c55e30",
                                    color: "#22c55e", fontSize: "0.62rem", fontWeight: 700,
                                    padding: "0.1rem 0.4rem", borderRadius: "4px"
                                  }}>📈 {item.why_trending}</span>
                                )}
                              </div>
                              <button onClick={() => copyText(`${item.format}: ${item.example}`, `format-${i}`)}
                                style={{
                                  background: copied === `format-${i}` ? "#22c55e20" : "#ffffff08",
                                  border: `1px solid ${copied === `format-${i}` ? "#22c55e40" : "#2a2a2a"}`,
                                  color: copied === `format-${i}` ? "#22c55e" : "#444",
                                  padding: "0.2rem 0.5rem", borderRadius: "6px",
                                  cursor: "pointer", fontSize: "0.65rem", flexShrink: 0, marginLeft: "0.5rem"
                                }}>{copied === `format-${i}` ? "✓" : "Copy"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Topics */}
                  {platformTrends.trending_topics?.length > 0 && (
                    <div>
                      <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                        🔥 TRENDING TOPICS — {niche.toUpperCase()}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {platformTrends.trending_topics.map((item: any, i: number) => (
                          <div key={i} style={{
                            background: "#0d0d0d", border: "1px solid #1a1a1a",
                            borderRadius: "10px", padding: "0.75rem 1rem",
                            transition: "border-color 0.2s"
                          }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = `${platformColor}40`}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>{item.topic}</p>
                                <p style={{ margin: "0.2rem 0", color: "#a855f7", fontSize: "0.75rem" }}>🎯 Hook: "{item.hook}"</p>
                                <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.72rem" }}>Angle: {item.content_angle}</p>
                              </div>
                              <button onClick={() => copyText(item.hook, `topic-${i}`)}
                                style={{
                                  background: copied === `topic-${i}` ? "#22c55e20" : "#ffffff08",
                                  border: `1px solid ${copied === `topic-${i}` ? "#22c55e40" : "#2a2a2a"}`,
                                  color: copied === `topic-${i}` ? "#22c55e" : "#444",
                                  padding: "0.2rem 0.5rem", borderRadius: "6px",
                                  cursor: "pointer", fontSize: "0.65rem", flexShrink: 0, marginLeft: "0.5rem"
                                }}>{copied === `topic-${i}` ? "✓" : "Copy"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hashtags + Posting Time */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {platformTrends.trending_hashtags?.length > 0 && (
                      <div style={{
                        flex: 2, background: "#0d0d0d", border: "1px solid #1a1a1a",
                        borderRadius: "10px", padding: "0.75rem"
                      }}>
                        <p style={{ margin: "0 0 0.4rem", color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                          # TRENDING HASHTAGS
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {platformTrends.trending_hashtags.map((tag: string, i: number) => (
                            <button key={i} onClick={() => copyText(tag, `tag-${i}`)}
                              style={{
                                background: copied === `tag-${i}` ? "#22c55e20" : `${platformColor}12`,
                                border: `1px solid ${copied === `tag-${i}` ? "#22c55e40" : `${platformColor}30`}`,
                                color: copied === `tag-${i}` ? "#22c55e" : platformColor,
                                padding: "0.2rem 0.5rem", borderRadius: "20px",
                                cursor: "pointer", fontSize: "0.72rem", fontWeight: 600
                              }}>{copied === `tag-${i}` ? "✓" : tag}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {platformTrends.best_posting_times && (
                      <div style={{
                        flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a",
                        borderRadius: "10px", padding: "0.75rem"
                      }}>
                        <p style={{ margin: "0 0 0.4rem", color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                          ⏰ BEST TIME
                        </p>
                        <p style={{ margin: 0, color: "#fff", fontSize: "0.75rem", lineHeight: 1.4 }}>
                          {platformTrends.best_posting_times}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* GOOGLE TRENDS TAB */}
          {activeSection === "google" && (
            <div>
              {googleTrends.length > 0 ? (
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
                  <div style={{
                    background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
                    borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem"
                  }}>
                    <p style={{ margin: 0, color: "#a855f7", fontWeight: 700, fontSize: "0.9rem" }}>
                      🔍 "{keyword || niche}" — Last 12 Months
                    </p>
                    <p style={{ margin: "0.3rem 0 0", color: "#555", fontSize: "0.72rem" }}>
                      {COUNTRIES.find(c => c.code === country)?.label} · Interest Over Time (0–100)
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    {[
                      { label: "🏆 PEAK", value: Math.max(...googleTrends.map((t: any) => t.values?.[0]?.extracted_value || 0)), color: "#f59e0b" },
                      { label: "📅 NOW", value: googleTrends[0]?.values?.[0]?.extracted_value || 0, color: "#22c55e" },
                      { label: "📊 AVG", value: Math.round(googleTrends.reduce((a: number, t: any) => a + (t.values?.[0]?.extracted_value || 0), 0) / googleTrends.length), color: "#a855f7" },
                    ].map((stat, i) => (
                      <div key={i} style={{
                        flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a",
                        borderRadius: "10px", padding: "0.75rem", textAlign: "center"
                      }}>
                        <p style={{ margin: 0, color: stat.color, fontSize: "1.4rem", fontWeight: 800 }}>{stat.value}</p>
                        <p style={{ margin: "0.2rem 0 0", color: "#444", fontSize: "0.62rem", fontWeight: 700 }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, margin: "0 0 0.5rem", letterSpacing: "0.08em" }}>INTEREST OVER TIME</p>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "70px" }}>
                      {[...googleTrends].reverse().map((item: any, i: number) => {
                        const val = item.values?.[0]?.extracted_value || 0;
                        const max = Math.max(...googleTrends.map((t: any) => t.values?.[0]?.extracted_value || 0));
                        const height = max > 0 ? (val / max) * 70 : 0;
                        return (
                          <div key={i} title={`${item.date}: ${val}/100`} style={{
                            flex: 1, height: `${height}px`,
                            background: val >= 70 ? "#a855f7" : "rgba(168,85,247,0.3)",
                            borderRadius: "2px 2px 0 0", cursor: "pointer", transition: "background 0.2s"
                          }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#a855f7")}
                            onMouseLeave={e => (e.currentTarget.style.background = val >= 70 ? "#a855f7" : "rgba(168,85,247,0.3)")}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                      <span style={{ color: "#333", fontSize: "0.6rem" }}>{[...googleTrends].reverse()[0]?.date?.split("–")[0]?.trim() || ""}</span>
                      <span style={{ color: "#333", fontSize: "0.6rem" }}>{googleTrends[0]?.date?.split("–")[0]?.trim() || ""}</span>
                    </div>
                  </div>

                  <button onClick={() => copyText(keyword || niche, "googlebtn")}
                    style={{
                      width: "100%", padding: "0.6rem", borderRadius: "8px",
                      background: copied === "googlebtn" ? "#22c55e20" : "#ffffff08",
                      border: `1px solid ${copied === "googlebtn" ? "#22c55e40" : "#2a2a2a"}`,
                      color: copied === "googlebtn" ? "#22c55e" : "#888",
                      fontSize: "0.8rem", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif"
                    }}>{copied === "googlebtn" ? "✓ Copied!" : `📋 Copy Keyword — ${keyword || niche}`}</button>
                </div>
              ) : (
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
                  <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>No Google Trends data. Try fetching again.</p>
                </div>
              )}
            </div>
          )}

          {/* YOUTUBE TRENDS TAB */}
          {activeSection === "youtube" && (
            <div>
              {youtubeTrends.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                    🔥 TRENDING NOW IN {COUNTRIES.find(c => c.code === country)?.label.split(" ")[1]}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {youtubeTrends.map((item: any, i: number) => {
                      const title = item.snippet?.title || "";
                      const channel = item.snippet?.channelTitle || "";
                      const views = item.statistics?.viewCount ? formatViews(item.statistics.viewCount) : "";
                      const likes = item.statistics?.likeCount ? formatViews(item.statistics.likeCount) : "";
                      const thumb = item.snippet?.thumbnails?.medium?.url || "";
                      const videoId = item.id;
                      return (
                        <div key={i} style={{
                          background: "#0d0d0d", border: "1px solid #1a1a1a",
                          borderRadius: "10px", padding: "0.75rem",
                          display: "flex", gap: "0.75rem", alignItems: "flex-start",
                          transition: "border-color 0.2s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#ef444440"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                        >
                          {thumb && <img src={thumb} alt={title} style={{ width: 80, height: 55, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#fff", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{title}</p>
                            <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.68rem" }}>{channel}</p>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.2rem" }}>
                              {views && <span style={{ color: "#22c55e", fontSize: "0.65rem" }}>👁️ {views}</span>}
                              {likes && <span style={{ color: "#ef4444", fontSize: "0.65rem" }}>❤️ {likes}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                            <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer"
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", textDecoration: "none", fontWeight: 700, textAlign: "center" }}>Watch</a>
                            <button onClick={() => copyText(title, `yt-${i}`)}
                              style={{ background: copied === `yt-${i}` ? "#22c55e20" : "#ffffff08", border: `1px solid ${copied === `yt-${i}` ? "#22c55e40" : "#2a2a2a"}`, color: copied === `yt-${i}` ? "#22c55e" : "#444", padding: "0.2rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem" }}>
                              {copied === `yt-${i}` ? "✓" : "Copy"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {youtubeSearch.length > 0 && (
                <div>
                  <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                    🔍 TOP VIDEOS — "{(keyword || niche).toUpperCase()}"
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {youtubeSearch.map((item: any, i: number) => {
                      const title = item.snippet?.title || "";
                      const channel = item.snippet?.channelTitle || "";
                      const thumb = item.snippet?.thumbnails?.medium?.url || "";
                      const videoId = item.id?.videoId;
                      const publishedAt = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
                      return (
                        <div key={i} style={{
                          background: "#0d0d0d", border: "1px solid #1a1a1a",
                          borderRadius: "10px", padding: "0.75rem",
                          display: "flex", gap: "0.75rem", alignItems: "flex-start",
                          transition: "border-color 0.2s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#a855f740"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                        >
                          {thumb && <img src={thumb} alt={title} style={{ width: 80, height: 55, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#fff", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{title}</p>
                            <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.68rem" }}>{channel} {publishedAt && `· ${publishedAt}`}</p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                            {videoId && (
                              <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer"
                                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", textDecoration: "none", fontWeight: 700, textAlign: "center" }}>Watch</a>
                            )}
                            <button onClick={() => copyText(title, `ys-${i}`)}
                              style={{ background: copied === `ys-${i}` ? "#22c55e20" : "#ffffff08", border: `1px solid ${copied === `ys-${i}` ? "#22c55e40" : "#2a2a2a"}`, color: copied === `ys-${i}` ? "#22c55e" : "#444", padding: "0.2rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem" }}>
                              {copied === `ys-${i}` ? "✓" : "Copy"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {youtubeTrends.length === 0 && youtubeSearch.length === 0 && (
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
                  <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>No YouTube data available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
