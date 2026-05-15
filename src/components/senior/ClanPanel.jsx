import { useState } from "react";
import { Plus, Settings, Trash2, Users, X } from "lucide-react";
import { initials } from "../../lib/utils";
import { ConfirmModal } from "../ui/ConfirmModal";

const CLAN_COLORS = ["#7c3aed", "#dc2626", "#2563eb", "#16a34a", "#d97706", "#0891b2"];
const CLAN_EMOJIS = ["🐉", "⚔️", "🔥", "👾", "💀", "🦅", "🌑", "🐺", "⚡", "🌊"];

export function ClanPanel({ groups, selectedGroup, students, ranked, updateGroup }) {
  const group = groups.find(g => g.name === selectedGroup);
  const clans = group?.clans || [];

  const clansWithStats = clans.map(clan => {
    const members = ranked.filter(s => clan.memberIds?.includes(s.id));
    const avgScore = members.length
      ? Math.round(members.reduce((sum, s) => sum + (s.weeklyFinalScore || 0), 0) / members.length)
      : 0;
    const totalCoins = members.reduce((sum, s) => sum + (s.weeklyCoins || 0), 0);
    return { ...clan, members, avgScore, totalCoins };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const [showCreate,  setShowCreate]  = useState(false);
  const [editClan,    setEditClan]    = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [form,     setForm]     = useState({ name: "", emoji: "🐉", color: "#7c3aed" });
  const [editForm, setEditForm] = useState(null);

  function saveClan() {
    if (!form.name.trim() || !group) return;
    const newClan = { id: crypto.randomUUID(), name: form.name.trim(), emoji: form.emoji, color: form.color, memberIds: [] };
    updateGroup(group.id, { clans: [...clans, newClan] });
    setShowCreate(false);
    setForm({ name: "", emoji: "🐉", color: "#7c3aed" });
  }

  function deleteClan(clanId) {
    setConfirmData({
      message: "Klanni o'chirishni tasdiqlaysizmi?",
      danger: true,
      onOk: () => {
        if (group) updateGroup(group.id, { clans: clans.filter(c => c.id !== clanId) });
        setConfirmData(null);
      },
    });
  }

  function openEdit(clan) {
    setEditClan(clan);
    setEditForm({ memberIds: [...(clan.memberIds || [])] });
  }

  function saveEdit() {
    if (!editForm || !group) return;
    updateGroup(group.id, { clans: clans.map(c => c.id === editClan.id ? { ...c, ...editForm } : c) });
    setEditClan(null);
    setEditForm(null);
  }

  function toggleMember(studentId) {
    setEditForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(studentId)
        ? f.memberIds.filter(id => id !== studentId)
        : [...f.memberIds, studentId],
    }));
  }

  return (
    <section className="panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={17} style={{ color: "#7c3aed" }} />
            <strong style={{ fontSize: "15px", fontWeight: 800 }}>🏴 Klanlar</strong>
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontWeight: 600 }}>
            Haftalik klan reytingi — o'rtacha ball asosida
          </p>
        </div>
        <button
          className="primary-button"
          style={{ padding: "6px 14px", fontSize: "12px", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none" }}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={12} /> Klan
        </button>
      </div>

      {clansWithStats.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
          🏴 Hozircha klan yo'q
        </div>
      )}

      {clansWithStats.map((clan, index) => (
        <div key={clan.id} style={{
          border: `2px solid ${clan.color}25`,
          borderLeft: `4px solid ${clan.color}`,
          borderRadius: "12px", padding: "14px 16px", marginBottom: "8px",
          background: `${clan.color}08`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "26px" }}>{clan.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {clan.name}
                  {index === 0 && clansWithStats.length > 1 && (
                    <span style={{ fontSize: "10px", background: "#fef9c3", color: "#92400e", padding: "1px 6px", borderRadius: "999px", fontWeight: 800 }}>
                      👑 #1
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                  {clan.members.length} a'zo · 🪙 {clan.totalCoins} coin
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "22px", fontWeight: 900,
                color: clan.avgScore >= 80 ? "#16a34a" : clan.avgScore >= 60 ? "#d97706" : "#dc2626",
              }}>
                {clan.avgScore}%
              </span>
              <button onClick={() => openEdit(clan)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                <Settings size={14} />
              </button>
              <button onClick={() => deleteClan(clan.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "4px" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {clan.members.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {clan.members.map(s => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  background: "white", border: `1.5px solid ${clan.color}35`,
                  borderRadius: "999px", padding: "3px 10px 3px 5px", fontSize: "12px", fontWeight: 700,
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: clan.color, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 900,
                  }}>
                    {initials(s.name)}
                  </div>
                  {s.name.split(" ")[0]}
                  <span style={{ color: (s.weeklyFinalScore || 0) >= 70 ? "#16a34a" : "#dc2626", fontWeight: 800 }}>
                    {s.weeklyFinalScore || 0}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
              A'zo yo'q — ⚙️ bosingda qo'shing
            </div>
          )}
        </div>
      ))}

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <strong style={{ fontSize: "16px", fontWeight: 800 }}>🏴 Yangi Klan</strong>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>Klan nomi</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Shadow Crew, 404 Gang..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px" }}>Emoji</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {CLAN_EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      style={{
                        fontSize: "20px", background: form.emoji === e ? "#ede9fe" : "none",
                        border: `2px solid ${form.emoji === e ? "#7c3aed" : "transparent"}`,
                        borderRadius: "8px", padding: "4px 8px", cursor: "pointer",
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px" }}>Rang</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {CLAN_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: "28px", height: "28px", borderRadius: "50%", background: c,
                        border: `3px solid ${form.color === c ? "#0f172a" : "transparent"}`,
                        cursor: "pointer",
                      }} />
                  ))}
                </div>
              </div>
              <button
                className="primary-button"
                style={{
                  width: "100%", justifyContent: "center", padding: "12px",
                  background: `linear-gradient(135deg,${form.color},${form.color}bb)`,
                  border: "none", opacity: !form.name.trim() ? 0.5 : 1,
                }}
                onClick={saveClan}
                disabled={!form.name.trim()}
              >
                {form.emoji} Klan Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {editClan && editForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", overflowY: "auto" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <strong style={{ fontSize: "16px", fontWeight: 800 }}>{editClan.emoji} {editClan.name} — A'zolar</strong>
              <button onClick={() => { setEditClan(null); setEditForm(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, margin: 0 }}>
                Bosib qo'shing yoki o'chiring
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "280px", overflowY: "auto" }}>
                {students.map(s => {
                  const inThis = editForm.memberIds.includes(s.id);
                  const inOther = clans.find(c => c.id !== editClan.id && c.memberIds?.includes(s.id));
                  const rankedS = ranked.find(r => r.id === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => !inOther && toggleMember(s.id)}
                      disabled={!!inOther}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "8px",
                        cursor: inOther ? "not-allowed" : "pointer",
                        background: inThis ? `${editClan.color}12` : "#f8fafc",
                        border: `1.5px solid ${inThis ? editClan.color : "#e2e8f0"}`,
                        opacity: inOther ? 0.4 : 1, textAlign: "left",
                      }}
                    >
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                        background: inThis ? editClan.color : "#e2e8f0",
                        color: inThis ? "white" : "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 900,
                      }}>
                        {initials(s.name)}
                      </div>
                      <span style={{ flex: 1, fontWeight: 700, fontSize: "13px" }}>{s.name}</span>
                      {inOther && <span style={{ fontSize: "11px", color: "#94a3b8" }}>{inOther.emoji}</span>}
                      {rankedS && <span style={{ fontSize: "12px", fontWeight: 800, color: (rankedS.weeklyFinalScore || 0) >= 70 ? "#16a34a" : "#dc2626" }}>{rankedS.weeklyFinalScore || 0}%</span>}
                      {inThis && <span style={{ fontSize: "11px", color: editClan.color, fontWeight: 800 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <button
                className="primary-button"
                style={{ width: "100%", justifyContent: "center", padding: "12px", border: "none" }}
                onClick={saveEdit}
              >
                Saqlash ({editForm.memberIds.length} a'zo)
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmData && (
        <ConfirmModal
          message={confirmData.message}
          danger={confirmData.danger}
          onConfirm={confirmData.onOk}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </section>
  );
}
