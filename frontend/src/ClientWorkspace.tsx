import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

interface Client {
  id: string;
  client_name: string;
  client_type: "creator" | "business";
  niche: string | null;
  notes: string | null;
  created_at: string;
}

export default function ClientWorkspace({
  userId,
  activeClientId,
  onSelectClient,
}: {
  userId: string;
  activeClientId: string | null;
  onSelectClient: (client: Client | null) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"creator" | "business">("creator");
  const [newNiche, setNewNiche] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setClients(data as Client[]);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [userId]);

  const addClient = async () => {
    if (!newName.trim()) { setError("Client name is required."); return; }
    setSaving(true); setError("");
    const { data, error } = await supabase
      .from("clients")
      .insert({ agency_user_id: userId, client_name: newName.trim(), client_type: newType, niche: newNiche.trim() || null })
      .select()
      .single();
    if (error) { setError("Could not add client. Try again."); setSaving(false); return; }
    setClients(prev => [data as Client, ...prev]);
    setNewName(""); setNewNiche(""); setNewType("creator");
    setShowAddModal(false); setSaving(false);
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Remove this client? This won't delete their saved content.")) return;
    await supabase.from("clients").delete().eq("id", id);
    setClients(prev => prev.filter(c => c.id !== id));
    if (activeClientId === id) onSelectClient(null);
  };

  const typeConfig = {
    creator:  { icon: "🎨", label: "Creator Workspace",    color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    business: { icon: "📢", label: "Advertiser Workspace", color: "#06b6d4", bg: "rgba(6,182,212,0.1)"  },
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "1.05rem", color: "#fff", fontWeight: 800 }}>👥 Clients</h3>
          <p style={{ margin: "0.2rem 0 0", color: "#52525b", fontSize: "0.75rem" }}>Manage multiple clients, each with their own workspace</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: "#fff", padding: "0.6rem 1.1rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 4px 16px rgba(109,40,217,0.3)" }}>
          + Add Client
        </button>
      </div>

      {/* Active client banner */}
      {activeClientId && (
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px", padding: "0.65rem 0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#4ade80", fontSize: "0.78rem" }}>
            ✓ Working on <strong>{clients.find(c => c.id === activeClientId)?.client_name}</strong> — new content will be tagged to this client
          </span>
          <button onClick={() => onSelectClient(null)} style={{ background: "none", border: "none", color: "#4ade80", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, textDecoration: "underline" }}>
            Switch to my own workspace
          </button>
        </div>
      )}

      {/* Client list */}
      {loading ? (
        <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", padding: "2rem 0" }}>Loading clients...</p>
      ) : clients.length === 0 ? (
        <div style={{ background: "#0f0f0f", border: "1px dashed #2a2a2a", borderRadius: "14px", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>👥</div>
          <p style={{ color: "#a1a1aa", fontSize: "0.88rem", fontWeight: 600, margin: "0 0 0.3rem" }}>No clients yet</p>
          <p style={{ color: "#52525b", fontSize: "0.75rem", margin: "0 0 1.2rem" }}>Add your first client to start managing their content in a dedicated workspace.</p>
          <button onClick={() => setShowAddModal(true)}
            style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.35)", color: "#a855f7", padding: "0.6rem 1.2rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
            + Add Your First Client
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {clients.map(client => {
            const cfg = typeConfig[client.client_type] || typeConfig.creator;
            const isActive = activeClientId === client.id;
            return (
              <div key={client.id}
                style={{ background: isActive ? cfg.bg : "#0f0f0f", border: `1px solid ${isActive ? cfg.color : "#1f1f1f"}`, borderRadius: "14px", padding: "0.9rem 1rem", display: "flex", alignItems: "center", gap: "0.85rem", transition: "all 0.2s" }}>
                <div style={{ width: 42, height: 42, borderRadius: "12px", background: cfg.bg, border: `1px solid ${cfg.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 0.15rem", color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>{client.client_name}</p>
                  <p style={{ margin: 0, color: "#52525b", fontSize: "0.72rem" }}>
                    {cfg.label}{client.niche ? ` · ${client.niche}` : ""}
                  </p>
                </div>
                <button onClick={() => onSelectClient(isActive ? null : client)}
                  style={{ background: isActive ? cfg.color : "transparent", border: `1px solid ${cfg.color}`, color: isActive ? "#000" : cfg.color, padding: "0.4rem 0.9rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                  {isActive ? "✓ Active" : "Open Workspace"}
                </button>
                <button onClick={() => deleteClient(client.id)}
                  style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", fontSize: "0.85rem", padding: "0.3rem", flexShrink: 0 }}
                  title="Remove client">
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "1.5rem", width: "min(420px, 100%)", animation: "slideUp 0.25s ease" }}>
            <h3 style={{ margin: "0 0 1rem", color: "#fff", fontSize: "1rem", fontWeight: 800 }}>Add New Client</h3>

            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.35rem" }}>Client Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. TechTales, GreenBuild Realty"
                style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.7rem 0.9rem", color: "#fff", fontSize: "0.85rem", outline: "none" }} />
            </div>

            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.35rem" }}>Workspace Type</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["creator", "business"] as const).map(t => (
                  <button key={t} onClick={() => setNewType(t)}
                    style={{ flex: 1, padding: "0.6rem", borderRadius: "10px", border: `1px solid ${newType === t ? typeConfig[t].color : "#1f1f1f"}`, background: newType === t ? typeConfig[t].bg : "#080808", color: newType === t ? typeConfig[t].color : "#52525b", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    {typeConfig[t].icon} {t === "creator" ? "Creator" : "Advertiser"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ display: "block", color: "#71717a", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.35rem" }}>Niche (optional)</label>
              <input value={newNiche} onChange={e => setNewNiche(e.target.value)} placeholder="e.g. Tech, Real Estate, Fitness"
                style={{ width: "100%", background: "#080808", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "0.7rem 0.9rem", color: "#fff", fontSize: "0.85rem", outline: "none" }} />
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "0 0 0.75rem" }}>{error}</p>}

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "10px", background: "transparent", border: "1px solid #1f1f1f", color: "#71717a", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={addClient} disabled={saving}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "10px", background: saving ? "#111" : "linear-gradient(135deg,#6d28d9,#7c3aed)", border: "none", color: saving ? "#444" : "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Adding..." : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}