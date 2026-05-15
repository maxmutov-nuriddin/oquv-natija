import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Swords, X } from "lucide-react";
import { getCurrentWeekRange } from "../../lib/scoring";
import { BATTLE_REWARD_OPTIONS } from "../../constants";
import { ConfirmModal } from "../ui/ConfirmModal";


const MATCH_INFO = `• Ikki guruh haftalik o'rtacha ball bo'yicha raqobatlashadi
• Hafta oxirida yuqori ball olgan guruh g'olib
• G'olib guruh har o'quvchisiga mukofot coin beriladi
• "✕" — natijasiz yakunlash (coinlar berilmaydi)`;

function groupWeeklyAvg(groupName, students, records, settings, weekKey) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  const end = dayjs(weekKey).add(6, "day").format("YYYY-MM-DD");
  const ids = new Set(students.filter(s => s.group === groupName).map(s => s.id));
  if (!ids.size) return 0;
  const recs = records.filter(r =>
    ids.has(r.studentId) && r.date >= weekKey && r.date <= end &&
    (r.homework > 0 || r.attendance > 0 || r.activity > 0)
  );
  if (!recs.length) return 0;
  const byStudent = {};
  for (const r of recs) {
    const score = Math.min(100, Math.round((r.homework||0)*hw + (r.attendance||0)*att + (r.activity||0)*act));
    (byStudent[r.studentId] = byStudent[r.studentId] || []).push(score);
  }
  const means = Object.values(byStudent).map(s => s.reduce((a, b) => a + b, 0) / s.length);
  return Math.round(means.reduce((a, b) => a + b, 0) / means.length);
}

export function GroupMatch({ group, groups, students, records, settings, date, updateGroup, updateStudent }) {
  const match   = group?.activeMatch;
  const weekKey = getCurrentWeekRange(date).start.format("YYYY-MM-DD");
  const [showCreate,  setShowCreate]  = useState(false);
  const [showInfo,    setShowInfo]    = useState(false);
  const [mixTypes,    setMixTypes]    = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [form, setForm] = useState({ opponentName: "", reward: 100 });

  const myScore  = useMemo(() => match ? groupWeeklyAvg(group.name, students, records, settings, match.weekKey) : 0, [match, group, students, records, settings]);
  const oppScore = useMemo(() => match ? groupWeeklyAvg(match.opponentGroupName, students, records, settings, match.weekKey) : 0, [match, students, records, settings]);

  const myWin  = myScore > oppScore;
  const oppWin = oppScore > myScore;
  const tied   = match && myScore === oppScore && myScore > 0;

  const isCurrSenior = group?.name?.toLowerCase().includes("senior");
  const hasAnyBattle = g =>
    !!g.activeMatch ||
    g.activeBoss?.weekKey === weekKey ||
    (g.clanBattles || []).some(b => b.weekKey === weekKey);

  const otherGroups = groups.filter(g =>
    g.name !== group?.name &&
    !hasAnyBattle(g) &&
    (mixTypes || g.name.toLowerCase().includes("senior") === isCurrSenior)
  );

  function createMatch() {
    if (!form.opponentName || !group) return;
    const oppGroup = groups.find(g => g.name === form.opponentName);
    if (!oppGroup) return;
    updateGroup(group.id,    { activeBoss: null, clanBattles: [], activeMatch: { opponentGroupName: form.opponentName, weekKey, reward: form.reward } });
    updateGroup(oppGroup.id, { activeBoss: null, clanBattles: [], activeMatch: { opponentGroupName: group.name,        weekKey, reward: form.reward } });
    setShowCreate(false);
    setForm({ opponentName: "", reward: 100 });
  }

  function endMatch() {
    setConfirmData({
      message: (myWin || oppWin) ? `G'olib guruhga +${match.reward} coin beriladimi?` : "Matchni tugatmoqchimisiz? (Hozircha teng)",
      onOk: () => {
        const oppGroup = groups.find(g => g.name === match.opponentGroupName);
        if (myWin || oppWin) {
          const winnerName = myWin ? group.name : match.opponentGroupName;
          students.filter(s => s.group === winnerName).forEach(s =>
            updateStudent(s.id, { duelCoins: (s.duelCoins || 0) + match.reward })
          );
        }
        updateGroup(group.id, { activeMatch: null });
        if (oppGroup) updateGroup(oppGroup.id, { activeMatch: null });
        setConfirmData(null);
      },
    });
  }

  function cancelMatch() {
    setConfirmData({
      message: "Matchni bekor qilish? Coinlar berilmaydi.",
      danger: true,
      onOk: () => {
        const oppGroup = groups.find(g => g.name === match.opponentGroupName);
        updateGroup(group.id, { activeMatch: null });
        if (oppGroup) updateGroup(oppGroup.id, { activeMatch: null });
        setConfirmData(null);
      },
    });
  }

  return (
    <section className="panel" style={{ borderLeft: "5px solid var(--blue)", marginBottom: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "44px", height: "44px", background: "var(--blue)", borderBottom: "4px solid var(--blue-dark)", borderRadius: "var(--radius-xs)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
            <Swords size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "16px", fontWeight: 900 }}>⚔️ Guruh vs Guruh</strong>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ background: "white", border: "1px solid var(--line)", borderBottom: "2px solid var(--line-dark)", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", fontWeight: 900, cursor: "default", color: "var(--muted)", padding: 0, lineHeight: "17px" }}>i</button>
                {showInfo && (
                  <div style={{ position: "absolute", top: "26px", left: 0, zIndex: 200, width: "260px", background: "white", border: "2px solid var(--line)", borderBottom: "4px solid var(--line-dark)", borderRadius: "var(--radius-xs)", padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "pre-line", lineHeight: 1.7, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {MATCH_INFO}
                  </div>
                )}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>Haftalik guruhlar bellashuvi</p>
          </div>
        </div>
        {!match && otherGroups.length > 0 && (
          <button className="primary-button" onClick={() => setShowCreate(true)}
            style={{ fontSize: "12px", padding: "0 14px", minHeight: "40px", gap: "6px", flexShrink: 0 }}>
            + Match
          </button>
        )}
      </div>

      {!match && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "28px 16px", color: "var(--muted)", fontWeight: 700, fontSize: "13px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>⚔️</div>
          Faol match yo'q
        </div>
      )}

      {match && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#eff6ff", border: "2px solid #bfdbfe", borderBottom: "4px solid #93c5fd", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 1fr", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
            {/* Team 1 */}
            <div style={{
              background: myWin ? "#f0fdf4" : "white",
              border: `2px solid ${myWin ? "#bbf7d0" : "var(--line)"}`,
              borderBottom: `4px solid ${myWin ? "#86efac" : "var(--line-dark)"}`,
              borderRadius: "var(--radius-sm)", padding: "12px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: myWin ? "#15803d" : "var(--muted)", textTransform: "uppercase", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {myWin ? "👑 " : ""}{group.name}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: myWin ? "var(--mint)" : tied ? "var(--muted)" : "var(--text)" }}>{myScore}%</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", marginTop: "2px", textTransform: "uppercase" }}>haftalik</div>
            </div>
            {/* VS */}
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: "13px", color: "var(--blue)" }}>VS</div>
            {/* Team 2 */}
            <div style={{
              background: oppWin ? "#f0fdf4" : "white",
              border: `2px solid ${oppWin ? "#bbf7d0" : "var(--line)"}`,
              borderBottom: `4px solid ${oppWin ? "#86efac" : "var(--line-dark)"}`,
              borderRadius: "var(--radius-sm)", padding: "12px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: oppWin ? "#15803d" : "var(--muted)", textTransform: "uppercase", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {oppWin ? "👑 " : ""}{match.opponentGroupName}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: oppWin ? "var(--mint)" : tied ? "var(--muted)" : "var(--text)" }}>{oppScore}%</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", marginTop: "2px", textTransform: "uppercase" }}>haftalik</div>
            </div>
          </div>

          {tied && (
            <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "10px" }}>🤝 Hozircha teng</div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "2px solid #bfdbfe", marginTop: "auto" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--blue)" }}>🏆 +{match.reward} coin / o'quvchi</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="secondary-button" style={{ minHeight: "36px", fontSize: "12px", padding: "0 12px" }} onClick={cancelMatch}>
                <X size={14} />
              </button>
              <button className={(myWin || oppWin) ? "primary-button" : "secondary-button"}
                style={{ minHeight: "36px", fontSize: "12px", padding: "0 14px" }}
                onClick={endMatch}>
                {(myWin || oppWin) ? "🏆 Coinlar" : "Tugatish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3>⚔️ Yangi Match</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="entry-form">
              <div style={{ background: "#eff6ff", border: "2px solid var(--blue)", borderBottom: "4px solid var(--blue-dark)", borderRadius: "var(--radius-sm)", padding: "14px 18px", textAlign: "center", fontWeight: 900, fontSize: "16px", color: "var(--blue)" }}>
                {group.name}
              </div>
              <div style={{ textAlign: "center", fontWeight: 900, fontSize: "16px", color: "var(--blue)" }}>VS</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>Raqib guruh</span>
                  <button
                    type="button"
                    onClick={() => { setMixTypes(v => !v); setForm(f => ({ ...f, opponentName: "" })); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "3px 10px", borderRadius: "999px", cursor: "pointer",
                      fontSize: "11px", fontWeight: 800,
                      border: `2px solid ${mixTypes ? "var(--blue)" : "var(--line)"}`,
                      borderBottom: `3px solid ${mixTypes ? "var(--blue-dark)" : "var(--line-dark)"}`,
                      background: mixTypes ? "#eff6ff" : "white",
                      color: mixTypes ? "var(--blue)" : "var(--muted)",
                    }}
                  >
                    {mixTypes ? "Barcha guruhlar" : "Bir xil tur"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {otherGroups.map(g => (
                    <button key={g.id} type="button" onClick={() => setForm(f => ({ ...f, opponentName: g.name }))}
                      style={{
                        padding: "12px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left",
                        border: `2px solid ${form.opponentName === g.name ? "var(--blue)" : "var(--line)"}`,
                        borderBottom: `4px solid ${form.opponentName === g.name ? "var(--blue-dark)" : "var(--line-dark)"}`,
                        background: form.opponentName === g.name ? "#eff6ff" : "white",
                        fontWeight: 800, fontSize: "15px",
                        color: form.opponentName === g.name ? "var(--blue)" : "var(--text)",
                      }}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Mukofot (coin / o'quvchi)</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {BATTLE_REWARD_OPTIONS.map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, reward: r }))}
                      style={{
                        padding: "8px 16px", borderRadius: "999px", cursor: "pointer", fontSize: "14px", fontWeight: 800,
                        border: `2px solid ${form.reward === r ? "var(--blue)" : "var(--line)"}`,
                        borderBottom: `3px solid ${form.reward === r ? "var(--blue-dark)" : "var(--line-dark)"}`,
                        background: form.reward === r ? "#eff6ff" : "white",
                        color: form.reward === r ? "var(--blue)" : "var(--muted)",
                      }}>
                      {r} 🪙
                    </button>
                  ))}
                </div>
              </div>
              <button className="primary-button" style={{ width: "100%", justifyContent: "center", opacity: !form.opponentName ? 0.5 : 1 }}
                onClick={createMatch} disabled={!form.opponentName}>
                ⚔️ Match Boshlash
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
