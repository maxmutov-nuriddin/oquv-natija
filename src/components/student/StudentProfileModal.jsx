import dayjs from "dayjs";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LEVELS } from "../../constants";
import { getLevel, getPerformanceStatus, initials } from "../../lib/utils";

export function StudentProfileModal({ student, records, settings, groups, onClose }) {
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const studentRecords = records
    .filter(r => r.studentId === student.id)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalLessons = studentRecords.length;
  const avg = (key) => totalLessons
    ? Math.round(studentRecords.reduce((s, r) => s + Number(r[key] || 0), 0) / totalLessons)
    : 0;
  const avgHw  = avg("homework");
  const avgAtt = avg("attendance");
  const avgAct = avg("activity");
  const totalCoins = studentRecords.reduce((s, r) => s + Number(r.coinsEarned || 0), 0);

  // Best lesson by coins
  const bestRecord  = [...studentRecords].sort((a, b) => (b.coinsEarned || 0) - (a.coinsEarned || 0))[0];

  // ── Level ──────────────────────────────────────────────────────────────
  const monthlyCoins = student.monthlyCoins || 0;
  const level        = getLevel(monthlyCoins);
  const levelIdx     = LEVELS.indexOf(level);
  const nextLevel    = LEVELS[levelIdx + 1] || null;
  const levelProg    = nextLevel
    ? Math.round(((monthlyCoins - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  // ── Chart (last 20 records) ────────────────────────────────────────────
  const chartData = studentRecords.slice(-20).map(r => ({
    date : dayjs(r.date).format("DD/MM"),
    hw   : r.homework   || 0,
    att  : r.attendance || 0,
    act  : r.activity   || 0,
  }));

  // ── Heatmap (last 84 days = 12 weeks) ─────────────────────────────────
  const studentGroup  = groups?.find(g => g.name === student.group);
  const lessonWeekdays = studentGroup?.weekdays || [];

  const today  = dayjs();
  const heatDays = Array.from({ length: 84 }, (_, i) => {
    const d          = today.subtract(83 - i, "day");
    const key        = d.format("YYYY-MM-DD");
    const rec        = studentRecords.find(r => r.date === key);
    const isLesson   = lessonWeekdays.length === 0 || lessonWeekdays.includes(d.day());
    return { key, label: d.format("DD MMM"), rec, isLesson };
  });

  function heatColor(day) {
    if (!day.isLesson) return "transparent";
    if (!day.rec) return "#e2e8f0";
    const score = Math.round(
      (day.rec.homework || 0)   * (settings.homeworkWeight  || 0.4) +
      (day.rec.attendance || 0) * (settings.attendanceWeight || 0.3) +
      (day.rec.activity || 0)   * (settings.activityWeight   || 0.3)
    );
    if (score >= 80) return "#4ade80";
    if (score >= 50) return "#fbbf24";
    return "#f87171";
  }

  // ── Recent 5 lessons ──────────────────────────────────────────────────
  const recent = studentRecords.slice(-5).reverse();

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-panel profile-modal-panel"
        role="dialog"
        aria-modal="true"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="modal-header">
          <h3>O'quvchi profili</h3>
          <button className="modal-close" type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="profile-body">

          {/* ── Identity ───────────────────────────────────────── */}
          <div className="profile-identity">
            <div className="profile-avatar">{initials(student.name)}</div>
            <div className="profile-identity-info">
              <h2 className="profile-name">{student.name}</h2>
              <p className="profile-group">{student.group}</p>
              <div className="profile-badges">
                <span className="profile-level-badge" style={{ background: level.bg, color: level.color, border: `1.5px solid ${level.color}40` }}>
                  {level.emoji} {level.name}
                </span>
                {student.gifts?.some(g => g.type === "vip") && (
                  <span className="vip-text-badge">VIP</span>
                )}
              </div>
              {/* Level progress */}
              <div className="profile-level-progress">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: level.color }}>{monthlyCoins} coin (bu oy)</span>
                  {nextLevel
                    ? <span>{nextLevel.min - monthlyCoins} coin → {nextLevel.emoji} {nextLevel.name}</span>
                    : <span style={{ color: level.color, fontWeight: 700 }}>MAX DARAJA 🏆</span>
                  }
                </div>
                <div className="profile-level-bar">
                  <div style={{ width: `${levelProg}%`, background: level.color }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick stats ────────────────────────────────────── */}
          <div className="profile-stats-row">
            {[
              { label: "Jami dars",    value: totalLessons,        unit: "ta"   },
              { label: "Jami coin",    value: totalCoins,          unit: "coin" },
              { label: "Uy vazifa",    value: avgHw  + "%",        status: getPerformanceStatus(avgHw)  },
              { label: "Yuqori natija",value: avgAtt + "%",        status: getPerformanceStatus(avgAtt) },
              { label: "Aktivlik",     value: avgAct + "%",        status: getPerformanceStatus(avgAct) },
            ].map(s => (
              <div key={s.label} className="profile-stat-card">
                <span className="profile-stat-label">{s.label}</span>
                <strong className="profile-stat-value" style={s.status ? { color: s.status.color } : {}}>
                  {s.value}
                </strong>
                {s.unit && <span className="profile-stat-unit">{s.unit}</span>}
                {s.status && (
                  <span className="profile-stat-badge" style={{ background: s.status.bg, color: s.status.color, borderColor: s.status.border }}>
                    {s.status.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Score chart ───────────────────────────────────── */}
          {chartData.length > 1 && (
            <div className="profile-section">
              <h4 className="profile-section-title">Ball tarixi (oxirgi {chartData.length} dars)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="hw"  name="Uy vazifa"     stroke="#58cc02" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="att" name="Yuqori natija" stroke="#1cb0f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="act" name="Aktivlik"      stroke="#ff4b4b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Heatmap ───────────────────────────────────────── */}
          {totalLessons > 0 && (
            <div className="profile-section">
              <h4 className="profile-section-title">Davomat (oxirgi 12 hafta)</h4>
              <div className="profile-heatmap">
                {heatDays.map(d => (
                  <div
                    key={d.key}
                    className="profile-heat-cell"
                    style={{ background: heatColor(d) }}
                    title={
                      !d.isLesson ? d.label :
                      d.rec ? `${d.label} · HW:${d.rec.homework}% NAT:${d.rec.attendance}% ACT:${d.rec.activity}%` :
                      `${d.label} · Kelmagan`
                    }
                  />
                ))}
              </div>
              <div className="profile-heatmap-legend">
                <div className="profile-heat-cell" style={{ background: "#e2e8f0" }} />
                <span>Kelmagan</span>
                <div className="profile-heat-cell" style={{ background: "#f87171" }} />
                <span>Yomon</span>
                <div className="profile-heat-cell" style={{ background: "#fbbf24" }} />
                <span>Ortda</span>
                <div className="profile-heat-cell" style={{ background: "#4ade80" }} />
                <span>Yaxshi</span>
              </div>
            </div>
          )}

          {/* ── Recent lessons ────────────────────────────────── */}
          {recent.length > 0 && (
            <div className="profile-section">
              <h4 className="profile-section-title">Oxirgi darslar</h4>
              <div className="profile-recent">
                {recent.map(r => {
                  const score = Math.round(
                    (r.homework || 0)   * (settings.homeworkWeight  || 0.4) +
                    (r.attendance || 0) * (settings.attendanceWeight || 0.3) +
                    (r.activity || 0)   * (settings.activityWeight   || 0.3)
                  );
                  const st = getPerformanceStatus(score);
                  return (
                    <div key={r.id} className="profile-recent-row">
                      <span className="profile-recent-date">{dayjs(r.date).format("DD MMM YYYY")}</span>
                      <div className="profile-recent-scores">
                        <span title="Uy vazifa">HW {r.homework || 0}%</span>
                        <span title="Yuqori natija">NAT {r.attendance || 0}%</span>
                        <span title="Aktivlik">ACT {r.activity || 0}%</span>
                      </div>
                      <span className="profile-recent-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                        {score}% · {st.label}
                      </span>
                      <span className="profile-recent-coins">+{r.coinsEarned || 0} 🪙</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalLessons === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "15px", fontWeight: 600 }}>
              Hali dars tarixi yo'q
            </div>
          )}

        </div>
      </section>
    </div>,
    document.body
  );
}
