import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Skull, X } from "lucide-react";
import { getCurrentWeekRange } from "../../lib/scoring";
import { BATTLE_BOSS_PRESETS, BATTLE_HP_OPTIONS, BATTLE_REWARD_OPTIONS } from "../../constants";
import { ConfirmModal } from "../ui/ConfirmModal";


const BOSS_INFO = `• "🎲 Random Boss" bosilganda tasodifiy boss, HP va mukofot tanlanadi
• Har dars kuni guruh o'rtacha bali = bossga zarar
• HP nolga tushsa — boss mag'lub, har o'quvchiga mukofot coin
• Hafta tugagach boss avtomatik yangilanadi`;

function calcDamage(boss, groupStudents, records, settings) {
  if (!boss?.weekKey) return 0;
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  const ids = new Set(groupStudents.map(s => s.id));
  const startDate = boss.createdAt || boss.weekKey;
  const end = dayjs(boss.weekKey).add(6, "day").format("YYYY-MM-DD");
  const recs = records.filter(r =>
    ids.has(r.studentId) && r.date >= startDate && r.date <= end &&
    (r.homework > 0 || r.attendance > 0 || r.activity > 0)
  );
  const byDate = {};
  for (const r of recs) (byDate[r.date] = byDate[r.date] || []).push(r);
  let total = 0;
  for (const dayRecs of Object.values(byDate)) {
    const avg = dayRecs.reduce((s, r) =>
      s + Math.min(100, Math.round((r.homework||0)*hw + (r.attendance||0)*att + (r.activity||0)*act)), 0
    ) / dayRecs.length;
    total += Math.round(avg);
  }
  return Math.min(boss.maxHp, total);
}

export function BossBattle({ group, groupStudents, records, settings, date, updateGroup, updateStudent }) {
  const rawBoss = group?.activeBoss;
  const weekKey = getCurrentWeekRange(date).start.format("YYYY-MM-DD");
  const boss    = rawBoss?.weekKey === weekKey ? rawBoss : null;
  const [showInfo,    setShowInfo]    = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const damage    = useMemo(() => boss ? calcDamage(boss, groupStudents, records, settings) : 0, [boss, groupStudents, records, settings]);
  const currentHp = boss ? Math.max(0, boss.maxHp - damage) : 0;
  const hpPct     = boss ? Math.round((currentHp / boss.maxHp) * 100) : 0;
  const defeated  = boss && currentHp === 0;
  const hpColor   = hpPct > 50 ? "var(--mint)" : hpPct > 25 ? "#f59e0b" : "var(--rose)";

  function createRandomBoss() {
    if (!group) return;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const preset = pick(BATTLE_BOSS_PRESETS);
    updateGroup(group.id, { activeBoss: { name: preset.name, emoji: preset.emoji, maxHp: pick(BATTLE_HP_OPTIONS), reward: pick(BATTLE_REWARD_OPTIONS), weekKey, createdAt: date } });
  }

  function endBoss() {
    setConfirmData({
      message: defeated ? `Tabriklaymiz! Har o'quvchiga +${boss.reward} coin beriladimi?` : "Bosni tugatmoqchimisiz? (Boss mag'lub bo'lmagan)",
      onOk: () => {
        if (defeated) groupStudents.forEach(s => updateStudent(s.id, { duelCoins: (s.duelCoins || 0) + boss.reward }));
        updateGroup(group.id, { activeBoss: null });
        setConfirmData(null);
      },
    });
  }

  function cancelBoss() {
    setConfirmData({
      message: "Bosni bekor qilish? Coinlar berilmaydi.",
      danger: true,
      onOk: () => { updateGroup(group.id, { activeBoss: null }); setConfirmData(null); },
    });
  }

  return (
    <section className="panel" style={{ borderLeft: "5px solid var(--rose)", marginBottom: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "44px", height: "44px", background: "var(--rose)", borderBottom: "4px solid var(--rose-dark)", borderRadius: "var(--radius-xs)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
            <Skull size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "16px", fontWeight: 900 }}>🐉 Boss Battle</strong>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ background: "white", border: "1px solid var(--line)", borderBottom: "2px solid var(--line-dark)", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", fontWeight: 900, cursor: "default", color: "var(--muted)", padding: 0, lineHeight: "17px" }}>i</button>
                {showInfo && (
                  <div style={{ position: "absolute", top: "26px", left: 0, zIndex: 200, width: "260px", background: "white", border: "2px solid var(--line)", borderBottom: "4px solid var(--line-dark)", borderRadius: "var(--radius-xs)", padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "pre-line", lineHeight: 1.7, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {BOSS_INFO}
                  </div>
                )}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>Sinf birgalikda Bosni yengadi → hammaga coin</p>
          </div>
        </div>
        {!boss && (
          <button className="primary-button" onClick={createRandomBoss}
            style={{ background: "var(--rose)", borderBottomColor: "var(--rose-dark)", fontSize: "12px", padding: "0 14px", minHeight: "40px", gap: "6px", flexShrink: 0 }}>
            🎲 Boss
          </button>
        )}
      </div>

      {!boss && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "28px 16px", color: "var(--muted)", fontWeight: 700, fontSize: "13px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>🐉</div>
          Faol boss yo'q
        </div>
      )}

      {boss && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff5f5", border: "2px solid #fecaca", borderBottom: "4px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          {defeated && (
            <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderBottom: "3px solid #86efac", borderRadius: "var(--radius-xs)", padding: "10px 14px", textAlign: "center", marginBottom: "12px", fontSize: "13px", fontWeight: 900, color: "#15803d" }}>
              🎉 BOSS MAG'LUB! Har o'quvchiga +{boss.reward} coin!
            </div>
          )}

          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "48px", lineHeight: 1, marginBottom: "6px" }}>{boss.emoji}</div>
            <strong style={{ fontSize: "18px", fontWeight: 900, color: "var(--rose)" }}>{boss.name}</strong>
            <p style={{ margin: "3px 0 0", fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              {dayjs(boss.weekKey).format("DD MMM")} – {dayjs(boss.weekKey).add(6, "day").format("DD MMM")}
            </p>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, marginBottom: "6px" }}>
              <span style={{ color: "var(--rose)" }}>❤️ {currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP</span>
              <span style={{ color: "var(--muted)" }}>⚔️ {damage} zarar</span>
            </div>
            <div className="progress-track" style={{ height: "10px" }}>
              <i style={{ display: "block", height: "100%", width: `${hpPct}%`, background: hpColor, borderRadius: "999px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "2px solid #fecaca", marginTop: "auto" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--rose)" }}>🏆 +{boss.reward} coin / o'quvchi</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="secondary-button" style={{ minHeight: "36px", fontSize: "12px", padding: "0 12px" }} onClick={cancelBoss}>
                <X size={14} />
              </button>
              <button className={defeated ? "primary-button" : "secondary-button"}
                style={{ minHeight: "36px", fontSize: "12px", padding: "0 14px", ...(defeated ? {} : {}) }}
                onClick={endBoss}>
                {defeated ? "🎉 Coinlar" : "Tugatish"}
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
