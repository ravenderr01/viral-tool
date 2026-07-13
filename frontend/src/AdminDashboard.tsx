import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "ravenderr01@gmail.com";

const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280", creator_starter: "#22c55e", creator_pro: "#06b6d4",
  advertiser: "#f97316", agency: "#f59e0b",
};

const PLAN_CREDITS: Record<string, number> = {
  free: 25, creator_starter: 100, creator_pro: 350,
  advertiser: 700, agency: 2000,
};

const PLAN_PRICES: Record<string, number> = {
  free: 0, creator_starter: 499, creator_pro: 1299,
  advertiser: 2499, agency: 8999.99,
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [users,         setUsers]         = useState<any[]>([]);
  const [reviews,       setReviews]       = useState<any[]>([]);
  const [genContent,    setGenContent]    = useState<any[]>([]);
  const [history,       setHistory]       = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState<"overview"|"users"|"patterns"|"reviews"|"blocklist">("overview");
  const [search,        setSearch]        = useState("");
  const [editUser,      setEditUser]      = useState<any>(null);
  const [editPlan,      setEditPlan]      = useState("");
  const [editCredits,   setEditCredits]   = useState("");
  const [saving,        setSaving]        = useState(false);
  const [message,       setMessage]       = useState("");
  const [msgType,       setMsgType]       = useState<"success"|"error">("success");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleting,      setDeleting]      = useState(false);
  const [blockedEmails, setBlockedEmails] = useState<string[]>([]);
  const [blockInput,    setBlockInput]    = useState("");
  const [addCreditUser, setAddCreditUser] = useState<any>(null);
  const [addCreditAmt,  setAddCreditAmt]  = useState("50");

  useEffect(() => { fetchAll(); }, []);

  // ── Load blocked emails from localStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vci_blocked_emails");
      if (stored) setBlockedEmails(JSON.parse(stored));
    } catch {}
  }, []);

  const saveBlockedEmails = (list: string[]) => {
    setBlockedEmails(list);
    localStorage.setItem("vci_blocked_emails", JSON.stringify(list));
  };

  const showMsg = (text: string, type: "success"|"error" = "success") => {
    setMessage(text); setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    const [
      { data: ud },
      { data: rd },
      { data: gd },
      { data: hd },
    ] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("generated_content").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_history").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    if (ud) setUsers(ud);
    if (rd) setReviews(rd);
    if (gd) setGenContent(gd);
    if (hd) setHistory(hd);
    setLoading(false);
  };

  // ── Computed stats ─────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const stats = {
    total:      users.length,
    paid:       users.filter(u => u.plan && u.plan !== "free").length,
    free:       users.filter(u => !u.plan || u.plan === "free").length,
    todayNew:   users.filter(u => u.created_at?.startsWith(today)).length,
    revenue:    users.reduce((a, u) => a + (PLAN_PRICES[u.plan?.toLowerCase()] || 0), 0),
    totalGens:  genContent.length,
    todayGens:  genContent.filter(g => g.created_at?.startsWith(today)).length,
    creator_starter: users.filter(u => u.plan === "creator_starter").length,
    creator_pro:     users.filter(u => u.plan === "creator_pro").length,
    advertiser:      users.filter(u => u.plan === "advertiser").length,
    agency:          users.filter(u => u.plan === "agency").length,
  };

  // ── Patterns from generated_content ───────────────────────────────────────
  const nicheCount: Record<string, number> = {};
  const platformCount: Record<string, number> = {};
  const langCount: Record<string, number> = {};
  const kwCount: Record<string, number> = {};
  const hookStyleCount: Record<string, number> = {};
  const featureCount: Record<string, number> = {};

  genContent.forEach(g => {
    if (g.niche)     nicheCount[g.niche]       = (nicheCount[g.niche] || 0) + 1;
    if (g.platform)  platformCount[g.platform] = (platformCount[g.platform] || 0) + 1;
    if (g.language)  langCount[g.language]     = (langCount[g.language] || 0) + 1;
    if (g.keyword)   kwCount[g.keyword]        = (kwCount[g.keyword] || 0) + 1;
    if (Array.isArray(g.hook_styles)) {
      g.hook_styles.forEach((s: string) => {
        hookStyleCount[s] = (hookStyleCount[s] || 0) + 1;
      });
    }
  });

  history.forEach(h => {
    if (h.feature) featureCount[h.feature] = (featureCount[h.feature] || 0) + 1;
  });

  const top = (obj: Record<string, number>, n = 8) =>
    Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0, n);

  // ── Update user plan ───────────────────────────────────────────────────────
  const updateUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const planCr = PLAN_CREDITS[editPlan] || 25;
    const cr = parseInt(editCredits) || planCr;
    const { error } = await supabase.from("users").update({
      plan: editPlan,
      credits_remaining: cr,
      credits_total: planCr,
    }).eq("id", editUser.id);
    if (error) { showMsg("❌ Update failed: " + error.message, "error"); }
    else { showMsg(`✅ ${editUser.email} → ${editPlan} (${cr} credits)`); }
    setEditUser(null);
    fetchAll();
    setSaving(false);
  };

  // ── Add credits ────────────────────────────────────────────────────────────
  const addCredits = async () => {
    if (!addCreditUser) return;
    setSaving(true);
    const toAdd = parseInt(addCreditAmt) || 0;
    const newCr = (addCreditUser.credits_remaining || 0) + toAdd;
    const { error } = await supabase.from("users")
      .update({ credits_remaining: newCr }).eq("id", addCreditUser.id);
    if (error) showMsg("❌ Failed", "error");
    else showMsg(`✅ Added ${toAdd} credits to ${addCreditUser.email}`);
    setAddCreditUser(null);
    fetchAll();
    setSaving(false);
  };

  // ── Delete user — block email so they can't re-register ───────────────────
  const deleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    const email = deleteConfirm.email;

    // 1. Delete from users table
    await supabase.from("users").delete().eq("id", deleteConfirm.id);

    // 2. Delete related data
    await Promise.all([
      supabase.from("generated_content").delete().eq("user_id", deleteConfirm.id),
      supabase.from("user_history").delete().eq("user_id", deleteConfirm.id),
      supabase.from("content_library").delete().eq("user_id", deleteConfirm.id),
      supabase.from("copy_signals").delete().eq("user_id", deleteConfirm.id),
    ]);

    // 3. Block email so they can't sign up again
    const newList = [...blockedEmails.filter(e => e !== email), email];
    saveBlockedEmails(newList);

    // 4. Supabase Auth delete (may fail without service role key — that's ok)
    try {
      await (supabase.auth as any).admin?.deleteUser(deleteConfirm.id);
    } catch {}

    showMsg(`🗑 ${email} deleted and blocked`);
    setDeleteConfirm(null);
    fetchAll();
    setDeleting(false);
  };

  // ── Block/Unblock email ────────────────────────────────────────────────────
  const blockEmail = () => {
    const email = blockInput.trim().toLowerCase();
    if (!email || blockedEmails.includes(email)) return;
    saveBlockedEmails([...blockedEmails, email]);
    setBlockInput("");
    showMsg(`🚫 ${email} blocked`);
  };

  const unblockEmail = (email: string) => {
    saveBlockedEmails(blockedEmails.filter(e => e !== email));
    showMsg(`✅ ${email} unblocked`);
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.plan?.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const S = { fontFamily: "'Inter',sans-serif" };
  const card = (col = "#1a1a2e") => ({
    background: col, border: "1px solid rgba(255,255,255,.06)",
    borderRadius: 14, padding: "1.1rem",
  } as React.CSSProperties);

  const StatCard = ({ emoji, label, value, color = "#fff", sub }: any) => (
    <div style={{ ...card(), textAlign: "center" as const }}>
      <div style={{ fontSize: "1.6rem", marginBottom: ".3rem" }}>{emoji}</div>
      <div style={{ fontWeight: 900, fontSize: "1.9rem", color, ...S }}>{value}</div>
      <div style={{ color: "#52525b", fontSize: ".7rem", fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ color: "#3f3f46", fontSize: ".62rem", marginTop: ".2rem" }}>{sub}</div>}
    </div>
  );

  const Bar = ({ label, count, total, color }: any) => (
    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".5rem" }}>
      <span style={{ width: 110, color, fontSize: ".72rem", fontWeight: 700, textAlign: "right" as const }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "#0d0d18", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${total ? (count/total)*100 : 0}%`, height: "100%", background: color, borderRadius: 4, transition: "width .6s" }} />
      </div>
      <span style={{ width: 30, color: "#fff", fontWeight: 800, fontSize: ".78rem" }}>{count}</span>
      <span style={{ width: 70, color: "#52525b", fontSize: ".68rem", textAlign: "right" as const }}>₹{(count * (PLAN_PRICES[label.toLowerCase().replace(/ /g,"_")] || 0)).toLocaleString("en-IN")}</span>
    </div>
  );

  const PatternRow = ({ label, count, max, color }: any) => (
    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".4rem" }}>
      <span style={{ flex: 1, color: "#e2e8f0", fontSize: ".75rem" }}>{label}</span>
      <div style={{ width: 120, height: 6, background: "#0d0d18", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${max ? (count/max)*100 : 0}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ width: 36, color, fontWeight: 800, fontSize: ".75rem", textAlign: "right" as const }}>{count}</span>
    </div>
  );

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#a855f7;border-radius:2px}
        .row-h:hover{background:rgba(168,85,247,.05)!important}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#040410", color:"#fff", fontFamily:"'Inter',sans-serif" }}>

        {/* ── HEADER ── */}
        <div style={{ background:"rgba(4,4,16,.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(168,85,247,.15)", padding:".85rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:".65rem" }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:10, padding:".35rem .65rem", fontSize:".9rem" }}>⚡</div>
            <div>
              <span style={{ fontWeight:900, fontSize:".95rem", background:"linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VCI Admin</span>
              <div style={{ fontSize:".6rem", color:"#3f3f46" }}>Control Panel</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
            {message && (
              <span style={{ color: msgType==="success" ? "#22c55e" : "#ef4444", fontSize:".78rem", fontWeight:700, background: msgType==="success"?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)", border:`1px solid ${msgType==="success"?"rgba(34,197,94,.25)":"rgba(239,68,68,.25)"}`, padding:".2rem .75rem", borderRadius:8 }}>
                {message}
              </span>
            )}
            <button onClick={fetchAll} style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", color:"#a855f7", padding:".35rem .85rem", borderRadius:8, cursor:"pointer", fontSize:".75rem", fontWeight:700 }}>🔄 Refresh</button>
            <button onClick={onBack} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", padding:".35rem .85rem", borderRadius:8, cursor:"pointer", fontSize:".75rem", fontWeight:700 }}>← Back</button>
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"1.25rem 1rem 4rem" }}>

          {/* ── TAB BAR ── */}
          <div style={{ display:"flex", gap:".35rem", marginBottom:"1.25rem", background:"rgba(255,255,255,.02)", borderRadius:12, padding:".35rem" }}>
            {[
              {id:"overview",  label:"📊 Overview"},
              {id:"users",     label:"👥 Users"},
              {id:"patterns",  label:"🔥 Patterns"},
              {id:"reviews",   label:"⭐ Reviews"},
              {id:"blocklist", label:"🚫 Blocklist"},
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                style={{ flex:1, padding:".55rem", borderRadius:9, border:"none", cursor:"pointer", fontWeight:700, fontSize:".78rem", fontFamily:"inherit", background: activeTab===t.id?"linear-gradient(135deg,#6d28d9,#7c3aed)":"transparent", color: activeTab===t.id?"#fff":"#52525b", transition:"all .2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"4rem", color:"#52525b" }}>⚡ Loading data...</div>
          ) : (
            <>
              {/* ══ OVERVIEW TAB ══ */}
              {activeTab === "overview" && (
                <div style={{ animation:"slideUp .4s ease" }}>

                  {/* Revenue hero */}
                  <div style={{ background:"linear-gradient(135deg,rgba(109,40,217,.2),rgba(168,85,247,.1))", border:"1px solid rgba(168,85,247,.3)", borderRadius:16, padding:"1.5rem", textAlign:"center", marginBottom:"1.25rem" }}>
                    <p style={{ margin:"0 0 .25rem", color:"#a855f7", fontSize:".68rem", fontWeight:800, letterSpacing:".1em" }}>💰 ESTIMATED MONTHLY REVENUE</p>
                    <div style={{ fontWeight:900, fontSize:"3rem", color:"#fff" }}>₹{stats.revenue.toLocaleString("en-IN")}</div>
                    <p style={{ margin:".25rem 0 0", color:"#52525b", fontSize:".72rem" }}>Based on {stats.paid} active paid users</p>
                  </div>

                  {/* Stat cards */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
                    <StatCard emoji="👥" label="Total Users" value={stats.total} color="#fff" />
                    <StatCard emoji="💎" label="Paid Users" value={stats.paid} color="#22c55e" sub={`${stats.total ? Math.round((stats.paid/stats.total)*100) : 0}% conversion`} />
                    <StatCard emoji="🆓" label="Free Users" value={stats.free} color="#6b7280" />
                    <StatCard emoji="🆕" label="Today Signups" value={stats.todayNew} color="#06b6d4" />
                    <StatCard emoji="⚡" label="Total Generations" value={stats.totalGens} color="#f59e0b" />
                    <StatCard emoji="📅" label="Today's Generations" value={stats.todayGens} color="#a855f7" />
                    <StatCard emoji="📖" label="History Entries" value={history.length} color="#06b6d4" />
                    <StatCard emoji="⭐" label="Reviews" value={reviews.length} color="#f59e0b" sub={`${reviews.filter(r=>r.approved).length} approved`} />
                  </div>

                  {/* Plan breakdown */}
                  <div style={{ ...card(), marginBottom:"1rem" }}>
                    <p style={{ margin:"0 0 1rem", fontSize:".68rem", color:"#52525b", fontWeight:700, letterSpacing:".08em" }}>📊 PLAN BREAKDOWN</p>
                    <Bar label="Agency"           count={stats.agency}           total={stats.total} color="#f59e0b" />
                    <Bar label="Advertiser"        count={stats.advertiser}       total={stats.total} color="#f97316" />
                    <Bar label="Creator Pro"       count={stats.creator_pro}      total={stats.total} color="#06b6d4" />
                    <Bar label="Creator Starter"   count={stats.creator_starter}  total={stats.total} color="#22c55e" />
                    <Bar label="Free"              count={stats.free}             total={stats.total} color="#6b7280" />
                  </div>

                  {/* Blocked count */}
                  {blockedEmails.length > 0 && (
                    <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:".65rem 1rem" }}>
                      <p style={{ margin:0, color:"#ef4444", fontSize:".75rem", fontWeight:700 }}>
                        🚫 {blockedEmails.length} emails blocked from re-registering
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ══ USERS TAB ══ */}
              {activeTab === "users" && (
                <div style={{ animation:"slideUp .4s ease" }}>
                  <div style={{ display:"flex", gap:".75rem", marginBottom:"1rem" }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="🔍 Search by email, name or plan..."
                      style={{ flex:1, background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:10, padding:".7rem 1rem", color:"#fff", fontSize:".85rem", fontFamily:"inherit", outline:"none" }} />
                    <span style={{ display:"flex", alignItems:"center", color:"#52525b", fontSize:".75rem", whiteSpace:"nowrap" }}>{filteredUsers.length} users</span>
                  </div>

                  <div style={{ background:"#080810", border:"1px solid #141426", borderRadius:14, overflow:"hidden" }}>
                    {/* Table header */}
                    <div style={{ display:"grid", gridTemplateColumns:"2.5fr 1fr 1fr 1fr .8fr 160px", gap:".5rem", padding:".65rem 1rem", background:"rgba(255,255,255,.02)", borderBottom:"1px solid #0d0d18" }}>
                      {["Email / Name","Plan","Credits","Joined","Gens Today","Actions"].map(h => (
                        <span key={h} style={{ color:"#3f3f46", fontSize:".6rem", fontWeight:800, textTransform:"uppercase", letterSpacing:".07em" }}>{h}</span>
                      ))}
                    </div>

                    <div style={{ maxHeight:"65vh", overflowY:"auto" }}>
                      {filteredUsers.map(u => {
                        const planKey = u.plan?.toLowerCase() || "free";
                        const col = PLAN_COLORS[planKey] || "#6b7280";
                        const isBlocked = blockedEmails.includes(u.email?.toLowerCase());
                        return (
                          <div key={u.id} className="row-h"
                            style={{ display:"grid", gridTemplateColumns:"2.5fr 1fr 1fr 1fr .8fr 160px", gap:".5rem", padding:".75rem 1rem", borderBottom:"1px solid #0a0a14", alignItems:"center", opacity: isBlocked ? .5 : 1 }}>
                            <div>
                              <div style={{ color:"#fff", fontSize:".82rem", fontWeight:600 }}>{u.email}</div>
                              <div style={{ color:"#3f3f46", fontSize:".65rem" }}>{u.first_name} {u.last_name}</div>
                              {isBlocked && <span style={{ color:"#ef4444", fontSize:".58rem", fontWeight:700 }}>🚫 Blocked</span>}
                            </div>
                            <div>
                              <span style={{ background:`${col}15`, border:`1px solid ${col}35`, color:col, borderRadius:6, padding:".15rem .5rem", fontSize:".7rem", fontWeight:800, textTransform:"capitalize" as const }}>
                                {u.plan || "free"}
                              </span>
                            </div>
                            <div>
                              <span style={{ color:"#fff", fontWeight:700, fontSize:".82rem" }}>{u.credits_remaining ?? "—"}</span>
                              <span style={{ color:"#3f3f46", fontSize:".65rem" }}> / {u.credits_total ?? "—"}</span>
                            </div>
                            <div style={{ color:"#52525b", fontSize:".7rem" }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                            </div>
                            <div style={{ color:"#f59e0b", fontWeight:700, fontSize:".82rem" }}>{u.generations_used_today || 0}</div>
                            <div style={{ display:"flex", gap:".3rem", flexWrap:"wrap" }}>
                              <button onClick={() => { setEditUser(u); setEditPlan(u.plan||"free"); setEditCredits(u.credits_remaining?.toString()||"25"); }}
                                style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", color:"#a855f7", padding:".22rem .5rem", borderRadius:6, cursor:"pointer", fontSize:".65rem", fontWeight:700 }}>
                                ✏ Edit
                              </button>
                              <button onClick={() => { setAddCreditUser(u); setAddCreditAmt("50"); }}
                                style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)", color:"#22c55e", padding:".22rem .5rem", borderRadius:6, cursor:"pointer", fontSize:".65rem", fontWeight:700 }}>
                                +⚡
                              </button>
                              <button onClick={() => setDeleteConfirm(u)}
                                style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", padding:".22rem .45rem", borderRadius:6, cursor:"pointer", fontSize:".65rem", fontWeight:700 }}>
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <div style={{ textAlign:"center", padding:"3rem", color:"#3f3f46" }}>No users found</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ PATTERNS TAB ══ */}
              {activeTab === "patterns" && (
                <div style={{ animation:"slideUp .4s ease" }}>
                  <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:12, padding:".75rem 1rem", marginBottom:"1.25rem" }}>
                    <p style={{ margin:0, color:"#a855f7", fontSize:".78rem", fontWeight:700 }}>
                      🔥 Intelligence from {genContent.length} generations + {history.length} tool sessions
                    </p>
                    <p style={{ margin:".2rem 0 0", color:"#52525b", fontSize:".68rem" }}>
                      These patterns grow smarter as more users generate content
                    </p>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>

                    {/* Top Niches */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#f59e0b", fontWeight:800, letterSpacing:".08em" }}>🏷 TOP NICHES</p>
                      {top(nicheCount).map(([n, c]) => (
                        <PatternRow key={n} label={n} count={c} max={top(nicheCount)[0]?.[1] || 1} color="#f59e0b" />
                      ))}
                      {!Object.keys(nicheCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>

                    {/* Top Platforms */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#06b6d4", fontWeight:800, letterSpacing:".08em" }}>📱 TOP PLATFORMS</p>
                      {top(platformCount).map(([p, c]) => (
                        <PatternRow key={p} label={p} count={c} max={top(platformCount)[0]?.[1] || 1} color="#06b6d4" />
                      ))}
                      {!Object.keys(platformCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>

                    {/* Top Keywords */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#22c55e", fontWeight:800, letterSpacing:".08em" }}>🔑 TRENDING KEYWORDS</p>
                      {top(kwCount).map(([k, c]) => (
                        <PatternRow key={k} label={k} count={c} max={top(kwCount)[0]?.[1] || 1} color="#22c55e" />
                      ))}
                      {!Object.keys(kwCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>

                    {/* Hook Styles */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#a855f7", fontWeight:800, letterSpacing:".08em" }}>🎣 HOOK STYLES USED</p>
                      {top(hookStyleCount).map(([s, c]) => (
                        <PatternRow key={s} label={s} count={c} max={top(hookStyleCount)[0]?.[1] || 1} color="#a855f7" />
                      ))}
                      {!Object.keys(hookStyleCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>

                    {/* Languages */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#f97316", fontWeight:800, letterSpacing:".08em" }}>🌐 LANGUAGES</p>
                      {top(langCount).map(([l, c]) => (
                        <PatternRow key={l} label={l} count={c} max={top(langCount)[0]?.[1] || 1} color="#f97316" />
                      ))}
                      {!Object.keys(langCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>

                    {/* Most Used Features */}
                    <div style={{ ...card() }}>
                      <p style={{ margin:"0 0 .85rem", fontSize:".68rem", color:"#06b6d4", fontWeight:800, letterSpacing:".08em" }}>🛠 MOST USED TOOLS</p>
                      {top(featureCount).map(([f, c]) => (
                        <PatternRow key={f} label={f} count={c} max={top(featureCount)[0]?.[1] || 1} color="#06b6d4" />
                      ))}
                      {!Object.keys(featureCount).length && <p style={{ color:"#3f3f46", fontSize:".75rem" }}>No data yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ REVIEWS TAB ══ */}
              {activeTab === "reviews" && (
                <div style={{ animation:"slideUp .4s ease" }}>
                  <div style={{ display:"flex", gap:".75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
                    <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:".5rem .9rem" }}>
                      <span style={{ color:"#f59e0b", fontWeight:700, fontSize:".78rem" }}>Pending: {reviews.filter(r=>!r.approved).length}</span>
                    </div>
                    <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:".5rem .9rem" }}>
                      <span style={{ color:"#22c55e", fontWeight:700, fontSize:".78rem" }}>Approved: {reviews.filter(r=>r.approved).length}</span>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1rem" }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ background:"#080810", border:`1px solid ${r.approved?"rgba(34,197,94,.2)":"rgba(255,255,255,.06)"}`, borderRadius:14, padding:"1rem" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".5rem" }}>
                          <div>
                            <div style={{ fontWeight:700, color:"#fff", fontSize:".85rem" }}>{r.name}</div>
                            <div style={{ color:"#52525b", fontSize:".7rem" }}>{r.role}</div>
                          </div>
                          <div style={{ display:"flex", gap:".4rem", alignItems:"center" }}>
                            <span style={{ color:"#f59e0b" }}>{"★".repeat(r.stars||0)}</span>
                            <span style={{ background: r.approved?"rgba(34,197,94,.1)":"rgba(245,158,11,.1)", border:`1px solid ${r.approved?"rgba(34,197,94,.3)":"rgba(245,158,11,.3)"}`, color: r.approved?"#22c55e":"#f59e0b", borderRadius:6, padding:".1rem .4rem", fontSize:".6rem", fontWeight:700 }}>
                              {r.approved?"✓ Live":"Pending"}
                            </span>
                          </div>
                        </div>
                        <p style={{ color:"#94a3b8", fontSize:".8rem", lineHeight:1.6, margin:"0 0 .75rem", fontStyle:"italic" }}>"{r.review}"</p>
                        <div style={{ color:"#3f3f46", fontSize:".65rem", marginBottom:".75rem" }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : ""}
                        </div>
                        <div style={{ display:"flex", gap:".5rem" }}>
                          {!r.approved && (
                            <button onClick={async () => { await supabase.from("reviews").update({approved:true}).eq("id",r.id); fetchAll(); showMsg("✅ Review approved"); }}
                              style={{ flex:1, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)", color:"#22c55e", padding:".4rem", borderRadius:8, cursor:"pointer", fontSize:".75rem", fontWeight:700 }}>
                              ✓ Approve
                            </button>
                          )}
                          <button onClick={async () => { await supabase.from("reviews").delete().eq("id",r.id); fetchAll(); showMsg("🗑 Review deleted"); }}
                            style={{ flex:1, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", padding:".4rem", borderRadius:8, cursor:"pointer", fontSize:".75rem", fontWeight:700 }}>
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {!reviews.length && <p style={{ color:"#3f3f46", padding:"2rem" }}>No reviews yet</p>}
                  </div>
                </div>
              )}

              {/* ══ BLOCKLIST TAB ══ */}
              {activeTab === "blocklist" && (
                <div style={{ animation:"slideUp .4s ease" }}>
                  <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:"1rem", marginBottom:"1.25rem" }}>
                    <p style={{ margin:"0 0 .35rem", color:"#ef4444", fontWeight:700, fontSize:".82rem" }}>🚫 Email Blocklist</p>
                    <p style={{ margin:0, color:"#71717a", fontSize:".72rem", lineHeight:1.6 }}>
                      Blocked emails cannot sign up again. When you delete a user, their email is automatically added here.
                      You can also manually block emails.
                    </p>
                  </div>

                  {/* Add block */}
                  <div style={{ display:"flex", gap:".65rem", marginBottom:"1.25rem" }}>
                    <input value={blockInput} onChange={e => setBlockInput(e.target.value)}
                      placeholder="Enter email to block..."
                      onKeyDown={e => e.key === "Enter" && blockEmail()}
                      style={{ flex:1, background:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:10, padding:".7rem 1rem", color:"#fff", fontSize:".85rem", fontFamily:"inherit", outline:"none" }} />
                    <button onClick={blockEmail}
                      style={{ background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", padding:".7rem 1.25rem", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:".82rem", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                      🚫 Block Email
                    </button>
                  </div>

                  {/* Blocked list */}
                  {blockedEmails.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"3rem", color:"#3f3f46" }}>
                      <div style={{ fontSize:"2rem", marginBottom:".5rem" }}>✅</div>
                      <p style={{ margin:0 }}>No blocked emails</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                      {blockedEmails.map(email => (
                        <div key={email} style={{ background:"#080810", border:"1px solid rgba(239,68,68,.15)", borderRadius:10, padding:".65rem 1rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <span style={{ color:"#ef4444", fontSize:".82rem", fontWeight:600 }}>🚫 {email}</span>
                            <span style={{ color:"#3f3f46", fontSize:".65rem", marginLeft:".75rem" }}>Cannot sign up</span>
                          </div>
                          <button onClick={() => unblockEmail(email)}
                            style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)", color:"#22c55e", padding:".2rem .65rem", borderRadius:7, cursor:"pointer", fontSize:".7rem", fontWeight:700 }}>
                            ✓ Unblock
                          </button>
                        </div>
                      ))}
                      <div style={{ textAlign:"right", color:"#3f3f46", fontSize:".65rem", marginTop:".25rem" }}>
                        {blockedEmails.length} emails blocked
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.94)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:"#080810", border:"1px solid rgba(168,85,247,.3)", borderRadius:20, padding:"1.75rem", maxWidth:440, width:"100%", animation:"slideUp .3s ease" }}>
            <h3 style={{ fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>✏️ Edit User</h3>
            <p style={{ color:"#52525b", fontSize:".8rem", margin:"0 0 1.25rem" }}>{editUser.email}</p>

            <div style={{ marginBottom:"1rem" }}>
              <label style={{ color:"#52525b", fontSize:".62rem", fontWeight:800, display:"block", marginBottom:".4rem", textTransform:"uppercase", letterSpacing:".06em" }}>Plan</label>
              <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
                {Object.keys(PLAN_CREDITS).map(p => (
                  <button key={p} onClick={() => { setEditPlan(p); setEditCredits(PLAN_CREDITS[p].toString()); }}
                    style={{ background: editPlan===p?`${PLAN_COLORS[p]}20`:"#0d0d18", border:`1px solid ${editPlan===p?PLAN_COLORS[p]:"#1a1a2e"}`, color: editPlan===p?PLAN_COLORS[p]:"#52525b", padding:".3rem .7rem", borderRadius:8, cursor:"pointer", fontSize:".75rem", fontWeight:700 }}>
                    {p.replace(/_/g," ")}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ color:"#52525b", fontSize:".62rem", fontWeight:800, display:"block", marginBottom:".4rem", textTransform:"uppercase", letterSpacing:".06em" }}>Credits Remaining</label>
              <input value={editCredits} onChange={e => setEditCredits(e.target.value)} type="number"
                style={{ width:"100%", background:"#0d0d18", border:"1px solid #1a1a2e", borderRadius:10, padding:".65rem 1rem", color:"#fff", fontSize:".88rem", fontFamily:"inherit", outline:"none" }} />
              <p style={{ color:"#3f3f46", fontSize:".65rem", margin:".25rem 0 0" }}>Default for {editPlan}: {PLAN_CREDITS[editPlan]} credits</p>
            </div>

            <div style={{ display:"flex", gap:".75rem" }}>
              <button onClick={updateUser} disabled={saving}
                style={{ flex:1, background:"linear-gradient(135deg,#6d28d9,#7c3aed)", border:"none", color:"#fff", padding:".8rem", borderRadius:10, cursor:saving?"not-allowed":"pointer", fontWeight:800, fontSize:".88rem" }}>
                {saving?"Saving...":"✅ Save Changes"}
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ flex:1, background:"#0d0d18", border:"1px solid #1a1a2e", color:"#52525b", padding:".8rem", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:".88rem" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CREDITS MODAL ── */}
      {addCreditUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.94)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:"#080810", border:"1px solid rgba(34,197,94,.3)", borderRadius:20, padding:"1.75rem", maxWidth:380, width:"100%", animation:"slideUp .3s ease" }}>
            <h3 style={{ fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .25rem" }}>⚡ Add Credits</h3>
            <p style={{ color:"#52525b", fontSize:".8rem", margin:"0 0 .5rem" }}>{addCreditUser.email}</p>
            <p style={{ color:"#22c55e", fontSize:".78rem", margin:"0 0 1.25rem" }}>Current: {addCreditUser.credits_remaining} credits</p>

            <label style={{ color:"#52525b", fontSize:".62rem", fontWeight:800, display:"block", marginBottom:".4rem", textTransform:"uppercase", letterSpacing:".06em" }}>Credits to Add</label>
            <div style={{ display:"flex", gap:".4rem", marginBottom:".75rem", flexWrap:"wrap" }}>
              {[25,50,100,200,350].map(n => (
                <button key={n} onClick={() => setAddCreditAmt(n.toString())}
                  style={{ background: addCreditAmt===n.toString()?"rgba(34,197,94,.15)":"#0d0d18", border:`1px solid ${addCreditAmt===n.toString()?"rgba(34,197,94,.4)":"#1a1a2e"}`, color: addCreditAmt===n.toString()?"#22c55e":"#52525b", padding:".3rem .65rem", borderRadius:8, cursor:"pointer", fontSize:".78rem", fontWeight:700 }}>
                  +{n}
                </button>
              ))}
            </div>
            <input value={addCreditAmt} onChange={e => setAddCreditAmt(e.target.value)} type="number"
              style={{ width:"100%", background:"#0d0d18", border:"1px solid #1a1a2e", borderRadius:10, padding:".65rem 1rem", color:"#fff", fontSize:".88rem", fontFamily:"inherit", outline:"none", marginBottom:"1.25rem" }} />

            <div style={{ display:"flex", gap:".75rem" }}>
              <button onClick={addCredits} disabled={saving}
                style={{ flex:1, background:"linear-gradient(135deg,#059669,#22c55e)", border:"none", color:"#fff", padding:".8rem", borderRadius:10, cursor:saving?"not-allowed":"pointer", fontWeight:800, fontSize:".88rem" }}>
                {saving?"Adding...":"⚡ Add Credits"}
              </button>
              <button onClick={() => setAddCreditUser(null)}
                style={{ flex:1, background:"#0d0d18", border:"1px solid #1a1a2e", color:"#52525b", padding:".8rem", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:".88rem" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.95)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:"#080810", border:"1px solid rgba(239,68,68,.3)", borderRadius:20, padding:"1.75rem", maxWidth:400, width:"100%", animation:"slideUp .3s ease", textAlign:"center" }}>
            <div style={{ fontSize:"3rem", marginBottom:".75rem" }}>⚠️</div>
            <h3 style={{ fontWeight:900, fontSize:"1.05rem", color:"#fff", margin:"0 0 .4rem" }}>Delete User?</h3>
            <p style={{ color:"#ef4444", fontSize:".85rem", fontWeight:700, margin:"0 0 .35rem" }}>{deleteConfirm.email}</p>
            <p style={{ color:"#71717a", fontSize:".78rem", margin:"0 0 .5rem", lineHeight:1.6 }}>
              This will permanently delete all their data — generations, history, library.
            </p>
            <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:".6rem .85rem", marginBottom:"1.25rem" }}>
              <p style={{ margin:0, color:"#ef4444", fontSize:".75rem", fontWeight:700 }}>
                🚫 Their email will be automatically blocked — they cannot sign up again.
              </p>
            </div>
            <div style={{ display:"flex", gap:".75rem" }}>
              <button onClick={deleteUser} disabled={deleting}
                style={{ flex:1, background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", color:"#fff", padding:".8rem", borderRadius:10, cursor:deleting?"not-allowed":"pointer", fontWeight:800, fontSize:".88rem" }}>
                {deleting?"Deleting...":"🗑 Delete & Block"}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex:1, background:"#0d0d18", border:"1px solid #1a1a2e", color:"#52525b", padding:".8rem", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:".88rem" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}