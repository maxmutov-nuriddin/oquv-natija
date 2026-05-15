import { useState } from "react";
import { Plus, Shield, X } from "lucide-react";
import { getCurrentWeekRange } from "../../lib/scoring";
import { initials } from "../../lib/utils";
import { BATTLE_STAKE_OPTIONS } from "../../constants";
import { ConfirmModal } from "../ui/ConfirmModal";


const CLAN_INFO = `• Ikki klan haftalik o'rtacha ball bo'yicha raqobatlashadi
• Yuqori o'rtachali klan g'olib — har a'zoga tikish qo'shiladi
• Yutqazgan klan har a'zosidan tikish ayriladi
• "✕" — coinlar o'zgarmaydi`;

export function ClanBattle({ group, ranked, updateGroup, updateStudent, date }) {
  const clans   = group?.clans || [];
  const battles = group?.clanBattles || [];
  const weekKey = getCurrentWeekRange(date).start.format("YYYY-MM-DD");
  const [showCreate,  setShowCreate]  = useState(false);
  const [showInfo,    setShowInfo]    = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [form, setForm] = useState({ clan1Id: "", clan2Id: "", stake: 50 });

  function clanWeeklyAvg(clan) {
    const members = ranked.filter(s => clan.memberIds?.includes(s.id));
    if (!members.length) return 0;
    return Math.round(members.reduce((s, m) => s + (m.weeklyFinalScore || 0), 0) / members.length);
  }

  const activeBattles  = battles.filter(b => b.weekKey === weekKey);
  const clansInBattle  = new Set(activeBattles.flatMap(b => [b.clan1Id, b.clan2Id]));
  const availableClans = clans.filter(c => !clansInBattle.has(c.id));

  function createBattle() {
    if (!form.clan1Id || !form.clan2Id || !group) return;
    const newBattle = { id: crypto.randomUUID(), clan1Id: form.clan1Id, clan2Id: form.clan2Id, stake: form.stake, weekKey };
    updateGroup(group.id, { clanBattles: [...battles, newBattle] });
    setShowCreate(false);
    setForm({ clan1Id: "", clan2Id: "", stake: 50 });
  }

  function endBattle(battle) {
    const clan1 = clans.find(c => c.id === battle.clan1Id);
    const clan2 = clans.find(c => c.id === battle.clan2Id);
    if (!clan1 || !clan2) return;
    const s1 = clanWeeklyAvg(clan1);
    const s2 = clanWeeklyAvg(clan2);
    const c1Win = s1 > s2, c2Win = s2 > s1;
    setConfirmData({
      message: (c1Win || c2Win)
        ? `G'olib klanga +${battle.stake} coin, yutqazgandan -${battle.stake} coin beriladimi?`
        : "Jangni tugatmoqchimisiz? (Hozircha teng)",
      onOk: () => {
        const winnerClan = c1Win ? clan1 : c2Win ? clan2 : null;
        const loserClan  = c1Win ? clan2 : c2Win ? clan1 : null;
        if (winnerClan) {
          winnerClan.memberIds?.forEach(id => {
            const s = ranked.find(r => r.id === id);
            updateStudent(id, { duelCoins: (s?.duelCoins || 0) + battle.stake });
          });
          loserClan?.memberIds?.forEach(id => {
            const s = ranked.find(r => r.id === id);
            updateStudent(id, { duelCoins: Math.max(0, (s?.duelCoins || 0) - battle.stake) });
          });
        }
        updateGroup(group.id, { clanBattles: battles.filter(b => b.id !== battle.id) });
        setConfirmData(null);
      },
    });
  }

  function cancelBattle(battle) {
    setConfirmData({
      message: "Jangni bekor qilish? Coinlar o'zgartirilmaydi.",
      danger: true,
      onOk: () => {
        updateGroup(group.id, { clanBattles: battles.filter(b => b.id !== battle.id) });
        setConfirmData(null);
      },
    });
  }

  if (clans.length < 2) return null;

  return (
    <section className="panel" style={{ borderLeft: "5px solid #7c3aed", marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "44px", height: "44px", background: "#7c3aed", borderBottom: "4px solid #6d28d9", borderRadius: "var(--radius-xs)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
            <Shield size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "16px", fontWeight: 900 }}>🏴 Klan Jangi</strong>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ background: "white", border: "1px solid var(--line)", borderBottom: "2px solid var(--line-dark)", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", fontWeight: 900, cursor: "default", color: "var(--muted)", padding: 0, lineHeight: "17px" }}>i</button>
                {showInfo && (
                  <div style={{ position: "absolute", top: "26px", left: 0, zIndex: 200, width: "260px", background: "white", border: "2px solid var(--line)", borderBottom: "4px solid var(--line-dark)", borderRadius: "var(--radius-xs)", padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "pre-line", lineHeight: 1.7, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {CLAN_INFO}
                  </div>
                )}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>Klan vs klan — g'olib coinlarni oladi</p>
          </div>
        </div>
        {availableClans.length >= 2 && (
          <button className="primary-button" onClick={() => setShowCreate(true)}
            style={{ background: "#7c3aed", borderBottomColor: "#6d28d9", fontSize: "12px", padding: "0 14px", minHeight: "40px", gap: "6px", flexShrink: 0 }}>
            <Plus size={13} /> Jang
          </button>
        )}
      </div>

      {activeBattles.length === 0 && (
        <div style={{ textAlign: "center", padding: "28px 16px", color: "var(--muted)", fontWeight: 700, fontSize: "13px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>🏴</div>
          Faol klan jangi yo'q
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {activeBattles.map(battle => {
          const clan1 = clans.find(c => c.id === battle.clan1Id);
          const clan2 = clans.find(c => c.id === battle.clan2Id);
          if (!clan1 || !clan2) return null;
          const s1   = clanWeeklyAvg(clan1);
          const s2   = clanWeeklyAvg(clan2);
          const c1Win = s1 > s2;
          const c2Win = s2 > s1;

          return (
            <div key={battle.id} style={{ background: "#faf5ff", border: "2px solid #e9d5ff", borderBottom: "4px solid #d8b4fe", borderRadius: "var(--radius-sm)", padding: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 1fr", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                {/* Clan 1 */}
                {[{ clan: clan1, score: s1, wins: c1Win }, null, { clan: clan2, score: s2, wins: c2Win }].map((item, i) => {
                  if (item === null) return (
                    <div key="vs" style={{ textAlign: "center", fontWeight: 900, fontSize: "13px", color: "#7c3aed" }}>VS</div>
                  );
                  const { clan, score, wins } = item;
                  return (
                    <div key={i} style={{
                      background: wins ? "#f0fdf4" : "white",
                      border: `2px solid ${wins ? "#bbf7d0" : "var(--line)"}`,
                      borderBottom: `4px solid ${wins ? "#86efac" : "var(--line-dark)"}`,
                      borderRadius: "var(--radius-sm)", padding: "10px 8px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: "28px", marginBottom: "4px" }}>{clan.emoji}</div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: wins ? "#15803d" : "var(--muted)", textTransform: "uppercase", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {wins ? "👑 " : ""}{clan.name}
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 900, color: wins ? "var(--mint)" : !c1Win && !c2Win ? "var(--muted)" : "var(--text)" }}>
                        {score}%
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: "3px", flexWrap: "wrap", marginTop: "6px" }}>
                        {(clan.memberIds || []).slice(0, 4).map(id => {
                          const s = ranked.find(r => r.id === id);
                          return s ? (
                            <div key={id} style={{
                              width: "20px", height: "20px", borderRadius: "50%",
                              background: clan.color || "var(--blue)", color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "7px", fontWeight: 900, border: "1.5px solid white",
                            }}>
                              {initials(s.name)}
                            </div>
                          ) : null;
                        })}
                        {(clan.memberIds?.length || 0) > 4 && (
                          <div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 700, lineHeight: "20px" }}>
                            +{clan.memberIds.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "2px solid #e9d5ff" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#7c3aed" }}>⚔️ Tikish: {battle.stake} 🪙 / a'zo</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="secondary-button" style={{ minHeight: "36px", fontSize: "12px", padding: "0 12px" }} onClick={() => cancelBattle(battle)}>
                    <X size={14} />
                  </button>
                  <button className={(c1Win || c2Win) ? "primary-button" : "secondary-button"}
                    style={{ minHeight: "36px", fontSize: "12px", padding: "0 14px", ...((c1Win || c2Win) ? { background: "#7c3aed", borderBottomColor: "#6d28d9" } : {}) }}
                    onClick={() => endBattle(battle)}>
                    {(c1Win || c2Win) ? "🏆 Coinlar" : "Tugatish"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3>🏴 Yangi Klan Jangi</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="entry-form">
              {[["1-klan", "clan1Id"], ["2-klan", "clan2Id"]].map(([label, key]) => (
                <div key={key}>
                  <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>{label}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {availableClans.filter(c => c.id !== (key === "clan2Id" ? form.clan1Id : form.clan2Id)).map(c => (
                      <button key={c.id} type="button" onClick={() => setForm(f => ({ ...f, [key]: c.id }))}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "12px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left",
                          border: `2px solid ${form[key] === c.id ? (c.color || "#7c3aed") : "var(--line)"}`,
                          borderBottom: `4px solid ${form[key] === c.id ? (c.color || "#6d28d9") : "var(--line-dark)"}`,
                          background: form[key] === c.id ? `${c.color || "#7c3aed"}18` : "white",
                          fontWeight: 800, fontSize: "15px",
                        }}>
                        <span style={{ fontSize: "22px" }}>{c.emoji}</span>
                        <span style={{ color: form[key] === c.id ? (c.color || "#7c3aed") : "var(--text)", flex: 1 }}>{c.name}</span>
                        <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>{c.memberIds?.length || 0} a'zo</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", fontWeight: 900, fontSize: "16px", color: "#7c3aed" }}>VS</div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Tikish (coin / a'zo)</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {BATTLE_STAKE_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, stake: s }))}
                      style={{
                        padding: "8px 16px", borderRadius: "999px", cursor: "pointer", fontSize: "14px", fontWeight: 800,
                        border: `2px solid ${form.stake === s ? "#7c3aed" : "var(--line)"}`,
                        borderBottom: `3px solid ${form.stake === s ? "#6d28d9" : "var(--line-dark)"}`,
                        background: form.stake === s ? "#faf5ff" : "white",
                        color: form.stake === s ? "#7c3aed" : "var(--muted)",
                      }}>
                      {s} 🪙
                    </button>
                  ))}
                </div>
              </div>
              <button className="primary-button"
                style={{ width: "100%", justifyContent: "center", background: "#7c3aed", borderBottomColor: "#6d28d9", opacity: (!form.clan1Id || !form.clan2Id) ? 0.5 : 1 }}
                onClick={createBattle} disabled={!form.clan1Id || !form.clan2Id}>
                🏴 Jang Boshlash
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
