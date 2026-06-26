import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "ravenderro1@gmail.com";

const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280", creator_starter: "#22c55e", creator_pro: "#06b6d4",
  advertiser: "#f97316", agency: "#f59e0b",
};

const PLAN_CREDITS: Record<string, number> = {
  free: 25, creator_starter: 150, creator_pro: 600,
  advertiser: 700, agency: 2000,
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "reviews" | "stats">("stats");
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editCredits, setEditCredits] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0, free: 0, creator_starter: 0, creator_pro: 0, advertiser: 0, agency: 0,
    totalCreditsUsed: 0, todaySignups: 0, totalReferrals: 0, revenue: 0
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: usersData } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    const { data: reviewsData } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (usersData) {
      setUsers(usersData);
      const today = new Date().toISOString().split("T")[0];
      const planRevenue: Record<string, number> = { creator_starter: 299.99, creator_pro: 999.99, advertiser: 1999.99, agency: 4999.99 };
      setStats({
        total: usersData.length,
        free: usersData.filter(u => !u.plan || u.plan === "free").length,
        creator_starter: usersData.filter(u => u.plan === "creator_starter").length,
        creator_pro: usersData.filter(u => u.plan === "creator_pro").length,
        advertiser: usersData.filter(u => u.plan === "advertiser").length,
        agency: usersData.filter(u => u.plan === "agency").length,
        totalCreditsUsed: usersData.reduce((a, u) => a + (u.generations_used_today || 0), 0),
        todaySignups: usersData.filter(u => u.created_at?.startsWith(today)).length,
        totalReferrals: usersData.reduce((a, u) => a + (u.referral_count || 0), 0),
        revenue: usersData.reduce((a, u) => a + (planRevenue[u.plan?.toLowerCase()] || 0), 0)
      });
    }
    if (reviewsData) setReviews(reviewsData);
    setLoading(false);
  };

  const updateUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const planCredits = PLAN_CREDITS[editPlan] || 10;
    await supabase.from("users").update({
      plan: editPlan,
      credits_remaining: parseInt(editCredits) || planCredits,
      credits_total: planCredits,
    }).eq("id", editUser.id);
    setMessage(`✅ ${editUser.email} updated to ${editPlan}!`);
    setEditUser(null);
    setTimeout(() => setMessage(""), 3000);
    fetchAll();
    setSaving(false);
  };

  const deleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await supabase.from("users").delete().eq("id", deleteConfirm.id);
    await supabase.auth.admin?.deleteUser(deleteConfirm.id).catch(() => {});
    setMessage(`🗑 ${deleteConfirm.email} deleted!`);
    setDeleteConfirm(null);
    setTimeout(() => setMessage(""), 3000);
    fetchAll();
    setDeleting(false);
  };

  const approveReview = async (id: string) => {
    await supabase.from("reviews").update({ approved: true }).eq("id", id);
    fetchAll();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    fetchAll();
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.plan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .row-hover:hover { background: rgba(168,85,247,0.05) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06040f", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(168,85,247,0.15)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: "10px", padding: "0.4rem 0.7rem", fontSize: "1rem" }}>⚡</div>
            <div>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VCI Admin</span>
              <div style={{ fontSize: "0.65rem", color: "#555" }}>Control Panel — {ADMIN_EMAIL}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {message && <span style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: 700 }}>{message}</span>}
            <button onClick={fetchAll} style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.4rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>🔄 Refresh</button>
            <button onClick={onBack} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.4rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>← Back</button>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "0.4rem" }}>
            {[{ id: "stats", label: "📊 Stats" }, { id: "users", label: "👥 Users" }, { id: "reviews", label: "⭐ Reviews" }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif", background: activeTab === t.id ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: activeTab === t.id ? "#fff" : "#555", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#555" }}>⚡ Loading...</div>
          ) : (
            <>
              {/* STATS TAB */}
              {activeTab === "stats" && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.1))", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                    <p style={{ margin: "0 0 0.3rem", color: "#a855f7", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em" }}>💰 ESTIMATED MONTHLY REVENUE</p>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "2.5rem", fontWeight: 900, color: "#fff" }}>₹{stats.revenue.toLocaleString("en-IN")}</div>
                    <p style={{ margin: "0.3rem 0 0", color: "#555", fontSize: "0.75rem" }}>Based on current paid plans</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                    {[
                      { label: "Total Users", value: stats.total, color: "#fff", emoji: "👥" },
                      { label: "Today Signups", value: stats.todaySignups, color: "#22c55e", emoji: "🆕" },
                      { label: "Total Referrals", value: stats.totalReferrals, color: "#a855f7", emoji: "🎁" },
                      { label: "Credits Used Today", value: stats.totalCreditsUsed, color: "#f59e0b", emoji: "⚡" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{s.emoji}</div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ color: "#555", fontSize: "0.72rem", fontWeight: 600 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.25rem" }}>
                    <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700, letterSpacing: "0.08em" }}>📊 PLAN BREAKDOWN</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {[
                        { plan: "Agency", count: stats.agency, price: 4999.99, color: "#f59e0b" },
                        { plan: "Advertiser", count: stats.advertiser, price: 1999.99, color: "#f97316" },
                        { plan: "Creator Pro", count: stats.creator_pro, price: 999.99, color: "#06b6d4" },
                        { plan: "Creator Starter", count: stats.creator_starter, price: 299.99, color: "#22c55e" },
                        { plan: "Free", count: stats.free, price: 0, color: "#6b7280" },
                      ].map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 80, color: p.color, fontWeight: 700, fontSize: "0.82rem" }}>{p.plan}</div>
                          <div style={{ flex: 1, height: 8, background: "#111", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${stats.total ? (p.count / stats.total) * 100 : 0}%`, height: "100%", background: p.color, borderRadius: "4px", transition: "width 0.5s" }} />
                          </div>
                          <div style={{ width: 30, color: "#fff", fontWeight: 700, fontSize: "0.82rem", textAlign: "right" }}>{p.count}</div>
                          <div style={{ width: 80, color: "#555", fontSize: "0.72rem", textAlign: "right" }}>₹{(p.count * p.price).toLocaleString("en-IN")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search by email or plan..."
                    style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", outline: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: "1rem" }} />

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid #111" }}>
                      {["Email", "Plan", "Credits", "Used Today", "Actions"].map(h => (
                        <div key={h} style={{ color: "#444", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>{h}</div>
                      ))}
                    </div>

                    <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                      {filteredUsers.map((u) => {
                        const planKey = u.plan?.toLowerCase() || "free";
                        const planColor = PLAN_COLORS[planKey] || "#6b7280";
                        return (
                          <div key={u.id} className="row-hover" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: "1px solid #0d0d0d", alignItems: "center", transition: "background 0.2s" }}>
                            <div>
                              <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{u.email}</div>
                              <div style={{ color: "#333", fontSize: "0.65rem" }}>{u.first_name} {u.last_name}</div>
                              <div style={{ color: "#222", fontSize: "0.62rem" }}>{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                            </div>
                            <div>
                              <span style={{ background: `${planColor}18`, border: `1px solid ${planColor}40`, color: planColor, borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
                                {u.plan || "free"}
                              </span>
                            </div>
                            <div>
                              <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>{u.credits_remaining ?? "—"}</div>
                              <div style={{ color: "#333", fontSize: "0.65rem" }}>/ {u.credits_total ?? "—"}</div>
                            </div>
                            <div style={{ color: "#f59e0b", fontSize: "0.82rem", fontWeight: 600 }}>{u.generations_used_today || 0}</div>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              <button onClick={() => { setEditUser(u); setEditPlan(u.plan || "free"); setEditCredits(u.credits_remaining?.toString() || "10"); }}
                                style={{ flex: 1, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", padding: "0.3rem 0.4rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
                                ✏️ Edit
                              </button>
                              <button onClick={() => setDeleteConfirm(u)}
                                style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.3rem 0.4rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ color: "#333", fontSize: "0.72rem", marginTop: "0.5rem", textAlign: "right" }}>{filteredUsers.length} users shown</div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <div style={{ animation: "slideUp 0.4s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                    {reviews.map((r) => (
                      <div key={r.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${r.approved ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "14px", padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>{r.name}</div>
                            <div style={{ color: "#555", fontSize: "0.72rem" }}>{r.role}</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                            <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>{"★".repeat(r.stars)}</span>
                            {r.approved ? (
                              <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", borderRadius: "6px", padding: "0.1rem 0.4rem", fontSize: "0.6rem", fontWeight: 700 }}>✓ Live</span>
                            ) : (
                              <span style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#f59e0b", borderRadius: "6px", padding: "0.1rem 0.4rem", fontSize: "0.6rem", fontWeight: 700 }}>Pending</span>
                            )}
                          </div>
                        </div>
                        <p style={{ color: "#aaa", fontSize: "0.8rem", lineHeight: 1.6, margin: "0 0 0.75rem", fontStyle: "italic" }}>"{r.review}"</p>
                        <div style={{ color: "#333", fontSize: "0.65rem", marginBottom: "0.75rem" }}>{new Date(r.created_at).toLocaleDateString("en-IN")}</div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {!r.approved && (
                            <button onClick={() => approveReview(r.id)} style={{ flex: 1, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>✓ Approve</button>
                          )}
                          <button onClick={() => deleteReview(r.id)} style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>🗑 Delete</button>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && <div style={{ textAlign: "center", padding: "2rem", color: "#333" }}>No reviews yet</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "20px", padding: "1.75rem", maxWidth: "420px", width: "100%", animation: "slideUp 0.3s ease" }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 0.3rem" }}>✏️ Edit User</h3>
            <p style={{ color: "#555", fontSize: "0.8rem", margin: "0 0 1.25rem" }}>{editUser.email}</p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#555", fontSize: "0.68rem", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>PLAN</label>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["free", "creator_starter", "creator_pro", "advertiser", "agency"].map(p => (
                  <button key={p} onClick={() => { setEditPlan(p); setEditCredits(PLAN_CREDITS[p].toString()); }}
                    style={{ background: editPlan === p ? `${PLAN_COLORS[p]}20` : "#0d0d0d", border: `1px solid ${editPlan === p ? PLAN_COLORS[p] : "#1a1a1a"}`, color: editPlan === p ? PLAN_COLORS[p] : "#555", padding: "0.35rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
                    {p.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ color: "#555", fontSize: "0.68rem", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>CREDITS REMAINING</label>
              <input value={editCredits} onChange={e => setEditCredits(e.target.value)} type="number"
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.88rem", fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
              <p style={{ color: "#333", fontSize: "0.68rem", margin: "0.3rem 0 0" }}>Default for {editPlan}: {PLAN_CREDITS[editPlan]} credits</p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={updateUser} disabled={saving}
                style={{ flex: 1, background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff", padding: "0.8rem", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "0.88rem" }}>
                {saving ? "Saving..." : "✅ Save Changes"}
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ flex: 1, background: "#111", border: "1px solid #222", color: "#555", padding: "0.8rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "20px", padding: "1.75rem", maxWidth: "380px", width: "100%", animation: "slideUp 0.3s ease", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem" }}>Delete User?</h3>
            <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0 0 0.5rem", fontWeight: 600 }}>{deleteConfirm.email}</p>
            <p style={{ color: "#555", fontSize: "0.78rem", margin: "0 0 1.5rem" }}>This action cannot be undone. All user data will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={deleteUser} disabled={deleting}
                style={{ flex: 1, background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", color: "#fff", padding: "0.8rem", borderRadius: "10px", cursor: deleting ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "0.88rem" }}>
                {deleting ? "Deleting..." : "🗑 Yes, Delete"}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, background: "#111", border: "1px solid #222", color: "#555", padding: "0.8rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}