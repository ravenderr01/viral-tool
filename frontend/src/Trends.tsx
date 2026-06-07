import { useState } from "react";

export default function Trends({ niche, keyword, langLabel }: { niche: string; keyword: string; langLabel: string }) {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"google" | "youtube" | "instagram" | "tiktok">("google");

  const fetchTrends = async () => {
    setLoading(true); setError(""); setTrends(null);

    const prompt = `You are a digital marketing expert. Generate trending content ideas for keyword: "${keyword || niche}", niche: ${niche}.

Generate in ${langLabel} language.
Respond ONLY in this exact JSON (no markdown):
{
  "google_trends": [
    {"query": "trending search term", "traffic": "50K+ searches", "trend": "rising"},
    {"query": "trending search term 2", "traffic": "30K+ searches", "trend": "stable"}
  ],
  "youtube_trends": [
    {"title": "viral video title idea", "views": "500K+ views", "hook": "why this works"},
    {"title": "viral video title idea 2", "views": "200K+ views", "hook": "why this works"}
  ],
  "trending_hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "instagram_trends": [
    {"caption": "trending reel idea", "likes": "50K+ likes", "type": "Reel"},
    {"caption": "trending reel idea 2", "likes": "30K+ likes", "type": "Story"}
  ],
  "tiktok_trends": [
    {"hook": "viral tiktok hook", "views": "1M+ views", "sound": "trending sound idea"},
    {"hook": "viral tiktok hook 2", "views": "500K+ views", "sound": "trending sound idea 2"}
  ],
  "content_angles": ["unique angle 1", "unique angle 2", "unique angle 3"],
  "peak_time": "Best time to post: 6-9 PM IST"
}

Generate exactly: 8 google trends, 6 youtube trends, 6 instagram trends, 6 tiktok trends, 10 hashtags, 5 content angles.
Make everything highly specific to "${keyword || niche}". Use realistic numbers.`;

    try {
      const res = await fetch(`https://viral-tool-1.onrender.com/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((i: any) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setTrends(JSON.parse(clean));
    } catch {
      setError("Failed to fetch trends. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e",
        borderRadius: "18px", padding: "1.5rem", marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.3rem" }}>📈</span>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: "1rem", color: "#fff" }}>AI Trend Intelligence</h3>
            <p style={{ margin: 0, color: "#444", fontSize: "0.72rem" }}>Google + YouTube trending ideas powered by AI</p>
          </div>
        </div>

        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
          fontSize: "0.78rem", color: "#a855f7"
        }}>
          🔍 Analyzing trends for: <strong>{keyword || niche}</strong>
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
          {loading ? "⚡ Analyzing Trends..." : "📈 Generate AI Trend Report"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem",
          color: "#f87171", fontSize: "0.82rem"
        }}>{error}</div>
      )}

      {trends && (
        <div style={{ animation: "slideUp 0.4s ease" }}>

          {/* Peak Time */}
          <div style={{
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.75rem",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1rem" }}>⏰</span>
            <span style={{ color: "#22c55e", fontSize: "0.82rem", fontWeight: 600 }}>{trends.peak_time}</span>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: "0.4rem", marginBottom: "1rem",
            background: "#0a0a0a", borderRadius: "10px", padding: "0.3rem",
            flexWrap: "wrap"
          }}>
            {[
              { id: "google", label: "🔍 Google" },
              { id: "youtube", label: "▶️ YouTube" },
              { id: "instagram", label: "📸 Instagram" },
              { id: "tiktok", label: "🎵 TikTok" }
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
                {tab.label}
              </button>
            ))}
          </div>

          {/* Google Trends */}
          {activeSection === "google" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
              {trends.google_trends?.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}>
                  <span style={{
                    color: i < 3 ? "#f59e0b" : "#333", fontWeight: 800,
                    fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif"
                  }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>{item.query}</p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem", alignItems: "center" }}>
                      <span style={{ color: "#22c55e", fontSize: "0.68rem" }}>🔥 {item.traffic}</span>
                      <span style={{
                        background: item.trend === "rising" ? "#22c55e18" : "#f59e0b18",
                        border: `1px solid ${item.trend === "rising" ? "#22c55e40" : "#f59e0b40"}`,
                        color: item.trend === "rising" ? "#22c55e" : "#f59e0b",
                        fontSize: "0.6rem", fontWeight: 700, padding: "0.05rem 0.4rem",
                        borderRadius: "4px"
                      }}>
                        {item.trend === "rising" ? "📈 Rising" : "📊 Stable"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(item.query)}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
              {trends.youtube_trends?.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "flex-start", gap: "0.75rem"
                }}>
                  <span style={{
                    color: i < 3 ? "#ef4444" : "#333", fontWeight: 800,
                    fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif"
                  }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.83rem", fontWeight: 600, lineHeight: 1.4 }}>{item.title}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#22c55e", fontSize: "0.68rem" }}>👁️ {item.views}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.7rem", lineHeight: 1.4 }}>💡 {item.hook}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(item.title)}
                    style={{
                      background: "#ffffff08", border: "1px solid #2a2a2a",
                      color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px",
                      cursor: "pointer", fontSize: "0.65rem", flexShrink: 0
                    }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {/* Instagram Trends */}
          {activeSection === "instagram" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
              {trends.instagram_trends?.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "flex-start", gap: "0.75rem"
                }}>
                  <span style={{ color: i < 3 ? "#e1306c" : "#333", fontWeight: 800, fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif" }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.83rem", fontWeight: 600, lineHeight: 1.4 }}>{item.caption}</p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem" }}>
                      <span style={{ color: "#e1306c", fontSize: "0.68rem" }}>❤️ {item.likes}</span>
                      <span style={{ background: "#e1306c18", border: "1px solid #e1306c30", color: "#e1306c", fontSize: "0.6rem", fontWeight: 700, padding: "0.05rem 0.4rem", borderRadius: "4px" }}>{item.type}</span>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(item.caption)}
                    style={{ background: "#ffffff08", border: "1px solid #2a2a2a", color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", flexShrink: 0 }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {/* TikTok Trends */}
          {activeSection === "tiktok" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
              {trends.tiktok_trends?.map((item: any, i: number) => (
                <div key={i} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: "10px", padding: "0.75rem 1rem",
                  display: "flex", alignItems: "flex-start", gap: "0.75rem"
                }}>
                  <span style={{ color: i < 3 ? "#69c9d0" : "#333", fontWeight: 800, fontSize: "0.85rem", minWidth: "24px", fontFamily: "'Syne',sans-serif" }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.83rem", fontWeight: 600, lineHeight: 1.4 }}>{item.hook}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#22c55e", fontSize: "0.68rem" }}>👁️ {item.views}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#555", fontSize: "0.7rem" }}>🎵 {item.sound}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(item.hook)}
                    style={{ background: "#ffffff08", border: "1px solid #2a2a2a", color: "#444", padding: "0.2rem 0.5rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.65rem", flexShrink: 0 }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {/* Trending Hashtags */}
          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a",
            borderRadius: "12px", padding: "1rem", marginBottom: "0.75rem"
          }}>
            <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", color: "#444", fontWeight: 700, letterSpacing: "0.06em" }}>
              #️⃣ TRENDING HASHTAGS
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {trends.trending_hashtags?.map((tag: string, i: number) => (
                <button key={i} onClick={() => navigator.clipboard.writeText(tag)}
                  style={{
                    background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                    color: "#a855f7", padding: "0.25rem 0.65rem", borderRadius: "20px",
                    cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                    fontFamily: "'DM Sans',sans-serif"
                  }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Content Angles */}
          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a",
            borderRadius: "12px", padding: "1rem"
          }}>
            <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", color: "#444", fontWeight: 700, letterSpacing: "0.06em" }}>
              🎯 UNIQUE CONTENT ANGLES
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {trends.content_angles?.map((angle: string, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.4rem 0", borderBottom: i < (trends.content_angles.length - 1) ? "1px solid #111" : "none"
                }}>
                  <span style={{ color: "#a855f7", fontSize: "0.75rem", fontWeight: 800 }}>0{i + 1}</span>
                  <p style={{ margin: 0, color: "#ccc", fontSize: "0.82rem" }}>{angle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}