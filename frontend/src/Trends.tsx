import { useState } from "react";

export default function Trends({ niche, keyword }: { niche: string; keyword: string }) {
  const [googleTrends, setGoogleTrends] = useState<any[]>([]);
  const [youtubeTrends, setYoutubeTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"google" | "youtube">("google");

  const fetchTrends = async () => {
    setLoading(true); setError("");
    try {
      const [googleRes, youtubeRes] = await Promise.all([
        fetch(`https://viral-tool-1.onrender.com/api/trends/google?keyword=${encodeURIComponent(keyword || niche)}`),
        fetch(`https://viral-tool-1.onrender.com/api/trends/youtube?keyword=${encodeURIComponent(keyword || niche)}`)
      ]);
      const googleData = await googleRes.json();
      const youtubeData = await youtubeRes.json();

      // Google Trends data parse
      const gTrends = googleData?.trending_searches || googleData?.data || googleData?.items || [];
      setGoogleTrends(Array.isArray(gTrends) ? gTrends.slice(0, 15) : []);

      // YouTube Trends data parse
      const yTrends = youtubeData?.items || youtubeData?.data || [];
      setYoutubeTrends(Array.isArray(yTrends) ? yTrends.slice(0, 10) : []);

    } catch (err) {
      setError("Failed to fetch trends. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      {/* Header */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e",
        borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📊</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>
              Live Trends
            </h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>
              Google + YouTube trending topics — India
            </p>
          </div>
        </div>

        {/* Current keyword info */}
        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
          fontSize: "0.78rem", color: "#a855f7"
        }}>
          🔍 Showing trends for: <strong>{keyword || niche}</strong>
        </div>

        <button onClick={fetchTrends} disabled={loading}
          style={{
            width: "100%", padding: "0.8rem", borderRadius: "10px",
            background: loading ? "#111" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none", color: loading ? "#333" : "#fff",
            fontWeight: 800, fontSize: "0.88rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne',sans-serif"
          }}>
          {loading ? "⚡ Fetching Live Trends..." : "📊 Fetch Live Trends"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem",
          color: "#f87171", fontSize: "0.82rem"
        }}>{error}</div>
      )}

      {(googleTrends.length > 0 || youtubeTrends.length > 0) && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: "0.5rem", marginBottom: "1rem",
            background: "#0a0a0a", borderRadius: "10px", padding: "0.3rem"
          }}>
            {[
              { id: "google", label: "🔍 Google Trends", count: googleTrends.length },
              { id: "youtube", label: "▶️ YouTube Trends", count: youtubeTrends.length }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none",
                  background: activeSection === tab.id ? "rgba(168,85,247,0.15)" : "transparent",
                  color: activeSection === tab.id ? "#a855f7" : "#444",
                  fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  borderBottom: activeSection === tab.id ? "2px solid #a855f7" : "2px solid transparent"
                }}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Google Trends */}
          {activeSection === "google" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {googleTrends.length === 0 ? (
                <p style={{ color: "#444", textAlign: "center", padding: "1rem" }}>No Google trends data available</p>
              ) : googleTrends.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  transition: "border-color 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#a855f730"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                  <span style={{
                    color: i < 3 ? "#f59e0b" : "#333", fontWeight: 800,
                    fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif"
                  }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                      {item?.query || item?.title?.query || item?.title || item?.keyword || JSON.stringify(item).slice(0, 50)}
                    </p>
                    {item?.formattedTraffic && (
                      <p style={{ margin: 0, color: "#22c55e", fontSize: "0.7rem", marginTop: "0.2rem" }}>
                        🔥 {item.formattedTraffic} searches
                      </p>
                    )}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(item?.query || item?.title?.query || item?.title || "")}
                    style={{
                      background: "#ffffff08", border: "1px solid #2a2a2a",
                      color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                      cursor: "pointer", fontSize: "0.65rem"
                    }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {/* YouTube Trends */}
          {activeSection === "youtube" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {youtubeTrends.length === 0 ? (
                <p style={{ color: "#444", textAlign: "center", padding: "1rem" }}>No YouTube trends data available</p>
              ) : youtubeTrends.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  transition: "border-color 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ef444430"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                  <span style={{
                    color: i < 3 ? "#ef4444" : "#333", fontWeight: 800,
                    fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif"
                  }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.83rem", fontWeight: 600, lineHeight: 1.4 }}>
                      {item?.snippet?.title || item?.title || item?.name || "Untitled"}
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                      {item?.snippet?.channelTitle && (
                        <span style={{ color: "#555", fontSize: "0.68rem" }}>
                          📺 {item.snippet.channelTitle}
                        </span>
                      )}
                      {item?.statistics?.viewCount && (
                        <span style={{ color: "#22c55e", fontSize: "0.68rem" }}>
                          👁️ {parseInt(item.statistics.viewCount).toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>
                  {item?.id && (
                    <a href={`https://youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer"
                      style={{
                        background: "#ef444418", border: "1px solid #ef444430",
                        color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                        fontSize: "0.65rem", textDecoration: "none", fontWeight: 700, flexShrink: 0
                      }}>Watch</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}