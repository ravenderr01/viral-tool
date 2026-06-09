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

const BACKEND = "https://viral-tool-1.onrender.com";

export default function Trends({ niche, keyword, langLabel }: { niche: string; keyword: string; langLabel: string }) {
  const [loading, setLoading] = useState(false);
  const [googleTrends, setGoogleTrends] = useState<any[]>([]);
  const [youtubeTrends, setYoutubeTrends] = useState<any[]>([]);
  const [youtubeSearch, setYoutubeSearch] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"google" | "youtube">("google");
  const [country, setCountry] = useState("IN");
  const [fetched, setFetched] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    setError("");
    setGoogleTrends([]);
    setYoutubeTrends([]);
    setYoutubeSearch([]);

    try {
      // Fetch all in parallel
      const [googleRes, googleTrendingRes, youtubeRes, youtubeSearchRes] = await Promise.allSettled([
        fetch(`${BACKEND}/api/trends/google?q=${encodeURIComponent(keyword || niche)}&country=${country}`),
        fetch(`${BACKEND}/api/trends/google-trending?country=${country}`),
        fetch(`${BACKEND}/api/trends/youtube?country=${country}`),
        fetch(`${BACKEND}/api/trends/youtube-search?q=${encodeURIComponent(keyword || niche)}&country=${country}`)
      ]);

      // Google Trends
      if (googleRes.status === "fulfilled" && googleRes.value.ok) {
        const data = await googleRes.value.json();
        const interest = data.interest_over_time?.timeline_data || [];
        setGoogleTrends(interest.slice(-10).reverse());
      }

      // Google Trending Now
      if (googleTrendingRes.status === "fulfilled" && googleTrendingRes.value.ok) {
        const data = await googleTrendingRes.value.json();
        const trending = data.trending_searches || data.realtime_trending_searches || [];
        if (trending.length > 0 && googleTrends.length === 0) {
          setGoogleTrends(trending.slice(0, 10));
        }
      }

      // YouTube Trending
      if (youtubeRes.status === "fulfilled" && youtubeRes.value.ok) {
        const data = await youtubeRes.value.json();
        const videos = data.items || [];
        setYoutubeTrends(videos.slice(0, 10));
      }

      // YouTube Search
      if (youtubeSearchRes.status === "fulfilled" && youtubeSearchRes.value.ok) {
        const data = await youtubeSearchRes.value.json();
        const items = data.items || [];
        setYoutubeSearch(items.slice(0, 8));
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

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      {/* Header Card */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e",
        borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📈</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>Real Trend Intelligence</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Live Google Trends + YouTube Trending — country wise</p>
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
                }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword info */}
        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
          fontSize: "0.78rem", color: "#a855f7"
        }}>
          🔍 Fetching real trends for: <strong>{keyword || niche}</strong> in <strong>{COUNTRIES.find(c => c.code === country)?.label}</strong>
        </div>

        <button onClick={fetchTrends} disabled={loading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: loading ? "#111" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none", color: loading ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.88rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif", transition: "all 0.3s"
          }}>
          {loading ? "⚡ Fetching Live Trends..." : "📈 Fetch Real Trends"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem",
          color: "#f87171", fontSize: "0.82rem"
        }}>{error}</div>
      )}

      {fetched && (
        <div style={{ animation: "slideUp 0.4s ease" }}>

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: "0.4rem", marginBottom: "1rem",
            background: "#0a0a0a", borderRadius: "10px", padding: "0.3rem"
          }}>
            {[
              { id: "google", label: "🔍 Google Trends" },
              { id: "youtube", label: "▶️ YouTube Trends" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
                style={{
                  flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none",
                  background: activeSection === tab.id ? "rgba(168,85,247,0.15)" : "transparent",
                  color: activeSection === tab.id ? "#a855f7" : "#444",
                  fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  borderBottom: activeSection === tab.id ? "2px solid #a855f7" : "2px solid transparent"
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Google Trends */}
          {activeSection === "google" && (
            <div>
              {googleTrends.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                  {googleTrends.map((item: any, i: number) => {
                    // Handle different response formats
                    const query = item.query || item.title?.query || item.title || `Trend ${i + 1}`;
                    const traffic = item.formattedValue || item.traffic || item.title?.exploreLink || "";
                    const isRising = item.hasTopNewsArticles || i < 3;

                    return (
                      <div key={i} style={{
                        background: "#0d0d0d", border: "1px solid #1a1a1a",
                        borderRadius: "10px", padding: "0.75rem 1rem",
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        transition: "border-color 0.2s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#a855f740"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                      >
                        <span style={{
                          color: i < 3 ? "#f59e0b" : "#333", fontWeight: 800,
                          fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif"
                        }}>#{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>{query}</p>
                          {traffic && (
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem", alignItems: "center" }}>
                              <span style={{ color: "#22c55e", fontSize: "0.68rem" }}>🔥 {traffic}</span>
                              <span style={{
                                background: isRising ? "#22c55e18" : "#f59e0b18",
                                border: `1px solid ${isRising ? "#22c55e40" : "#f59e0b40"}`,
                                color: isRising ? "#22c55e" : "#f59e0b",
                                fontSize: "0.6rem", fontWeight: 700, padding: "0.05rem 0.4rem",
                                borderRadius: "4px"
                              }}>
                                {isRising ? "📈 Rising" : "📊 Stable"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <a href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}&geo=${country}`}
                            target="_blank" rel="noreferrer"
                            style={{
                              background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
                              color: "#a855f7", padding: "0.2rem 0.5rem", borderRadius: "6px",
                              fontSize: "0.65rem", textDecoration: "none", fontWeight: 700
                            }}>View</a>
                          <button onClick={() => navigator.clipboard.writeText(query)}
                            style={{
                              background: "#ffffff08", border: "1px solid #2a2a2a",
                              color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                              cursor: "pointer", fontSize: "0.65rem"
                            }}>Copy</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "12px", padding: "2rem", textAlign: "center"
                }}>
                  <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
                    No Google Trends data available. Try a different keyword or country.
                  </p>
                  <a href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword || niche)}&geo=${country}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      display: "inline-block", marginTop: "0.75rem",
                      background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
                      color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px",
                      fontSize: "0.8rem", textDecoration: "none", fontWeight: 700
                    }}>
                    Open Google Trends →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* YouTube Trends */}
          {activeSection === "youtube" && (
            <div>
              {/* Trending Videos */}
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
                          {thumb && (
                            <img src={thumb} alt={title}
                              style={{ width: 80, height: 55, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#fff", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{title}</p>
                            <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.68rem" }}>{channel}</p>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.2rem" }}>
                              {views && <span style={{ color: "#22c55e", fontSize: "0.65rem" }}>👁️ {views} views</span>}
                              {likes && <span style={{ color: "#ef4444", fontSize: "0.65rem" }}>❤️ {likes}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                            <a href={`https://youtube.com/watch?v=${videoId}`}
                              target="_blank" rel="noreferrer"
                              style={{
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                                color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                                fontSize: "0.65rem", textDecoration: "none", fontWeight: 700, textAlign: "center"
                              }}>Watch</a>
                            <button onClick={() => navigator.clipboard.writeText(title)}
                              style={{
                                background: "#ffffff08", border: "1px solid #2a2a2a",
                                color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                                cursor: "pointer", fontSize: "0.65rem"
                              }}>Copy</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* YouTube Search Results */}
              {youtubeSearch.length > 0 && (
                <div>
                  <p style={{ color: "#333", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
                    🔍 TOP VIDEOS FOR "{(keyword || niche).toUpperCase()}"
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
                          {thumb && (
                            <img src={thumb} alt={title}
                              style={{ width: 80, height: 55, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#fff", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{title}</p>
                            <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.68rem" }}>{channel} {publishedAt && `· ${publishedAt}`}</p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                            {videoId && (
                              <a href={`https://youtube.com/watch?v=${videoId}`}
                                target="_blank" rel="noreferrer"
                                style={{
                                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                                  color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                                  fontSize: "0.65rem", textDecoration: "none", fontWeight: 700, textAlign: "center"
                                }}>Watch</a>
                            )}
                            <button onClick={() => navigator.clipboard.writeText(title)}
                              style={{
                                background: "#ffffff08", border: "1px solid #2a2a2a",
                                color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                                cursor: "pointer", fontSize: "0.65rem"
                              }}>Copy</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {youtubeTrends.length === 0 && youtubeSearch.length === 0 && (
                <div style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "12px", padding: "2rem", textAlign: "center"
                }}>
                  <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
                    No YouTube data available. Check your API quota or try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
