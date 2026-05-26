import dayjs from "dayjs";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LEVELS } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { getScoreSummaryForRange, getCurrentWeekRange, getCurrentMonthRange } from "../../lib/scoring";
import { getLevel, getPerformanceStatus, initials } from "../../lib/utils";

function periodFinal(data, settings) {
  return Math.min(100, Math.round(
    data.avgHw  * Number(settings?.homeworkWeight  ?? 0.4) +
    data.avgAtt * Number(settings?.attendanceWeight ?? 0.3) +
    data.avgAct * Number(settings?.activityWeight   ?? 0.3)
  ));
}

export function StudentProfileModal({ student, records, settings, groups, date, onUpdateStudent, onClose }) {
  const { t } = useT();
  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = sw + "px";
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const studentRecords = records
    .filter(r => r.studentId === student.id)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  // ── Homework penalty ───────────────────────────────────────────────────
  const ignoredZeroDates = student.ignoredZeroDates || [];
  const zeroRecords = records.filter(r =>
    r.studentId === student.id &&
    r.homework === 0 &&
    (r.attendance > 0 || r.activity > 0) &&
    !ignoredZeroDates.includes(r.date)
  );
  const zeroCount = zeroRecords.length;
  const homeworkFine = settings?.homeworkFine ?? 1000;

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
          <h3>{t.profile_title}</h3>
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
                  {level.emoji} {t[`level_${level.key}`] || level.name}
                </span>
                {student.gifts?.some(g => g.type === "vip") && (
                  <span className="vip-text-badge">{t.profile_vip}</span>
                )}
              </div>
              {/* Level progress */}
              <div className="profile-level-progress">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: level.color }}>{monthlyCoins} {t.profile_coins_month}</span>
                  {nextLevel
                    ? <span>{nextLevel.min - monthlyCoins} {t.profile_coin_to} {nextLevel.emoji} {t[`level_${nextLevel.key}`] || nextLevel.name}</span>
                    : <span style={{ color: level.color, fontWeight: 700 }}>{t.profile_max_level}</span>
                  }
                </div>
                <div className="profile-level-bar">
                  <div style={{ width: `${levelProg}%`, background: level.color }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Weekly / Monthly period summary ───────────────── */}
          {date && (() => {
            const weekly  = getScoreSummaryForRange(student.id, records, getCurrentWeekRange(date));
            const monthly = getScoreSummaryForRange(student.id, records, getCurrentMonthRange(date));
            if (!weekly && !monthly) return null;
            return (
              <div className="period-summary-row">
                {weekly  && (() => { const score = periodFinal(weekly,  settings); const st = getPerformanceStatus(score); return (
                  <div className="period-chip" style={{ borderColor: st.border, background: st.bg }}>
                    <span className="period-chip-title">{t.period_weekly}</span>
                    <span className="period-chip-count">{t.period_lessons(weekly.count)}</span>
                    <span className="period-chip-badge" style={{ color: st.color }}>{t[`status_${st.key}`]}</span>
                    <span className="period-chip-score" style={{ color: st.color }}>{score}%</span>
                  </div>
                ); })()}
                {monthly && (() => { const score = periodFinal(monthly, settings); const st = getPerformanceStatus(score); return (
                  <div className="period-chip" style={{ borderColor: st.border, background: st.bg }}>
                    <span className="period-chip-title">{t.period_monthly}</span>
                    <span className="period-chip-count">{t.period_lessons(monthly.count)}</span>
                    <span className="period-chip-badge" style={{ color: st.color }}>{t[`status_${st.key}`]}</span>
                    <span className="period-chip-score" style={{ color: st.color }}>{score}%</span>
                  </div>
                ); })()}
              </div>
            );
          })()}

          {/* ── Quick stats ────────────────────────────────────── */}
          <div className="profile-stats-row">
            {[
              { label: t.profile_total_lessons, value: totalLessons, unit: t.profile_lessons_unit },
              { label: t.profile_total_coins,   value: totalCoins,   unit: t.profile_coins_unit  },
              { label: t.profile_homework,  value: avgHw  + "%", status: getPerformanceStatus(avgHw)  },
              { label: t.profile_attendance, value: avgAtt + "%", status: getPerformanceStatus(avgAtt) },
              { label: t.profile_activity,  value: avgAct + "%", status: getPerformanceStatus(avgAct) },
            ].map(s => (
              <div key={s.label} className="profile-stat-card">
                <span className="profile-stat-label">{s.label}</span>
                <strong className="profile-stat-value" style={s.status ? { color: s.status.color } : {}}>
                  {s.value}
                </strong>
                {s.unit && <span className="profile-stat-unit">{s.unit}</span>}
                {s.status && (
                  <span className="profile-stat-badge" style={{ background: s.status.bg, color: s.status.color, borderColor: s.status.border }}>
                    {t[`status_${s.status.key}`]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Score chart ───────────────────────────────────── */}
          {chartData.length > 1 && (
            <div className="profile-section">
              <h4 className="profile-section-title">{t.profile_chart_title(chartData.length)}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="hw"  name={t.profile_homework}   stroke="#58cc02" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="att" name={t.profile_attendance} stroke="#1cb0f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="act" name={t.profile_activity}   stroke="#ff4b4b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Heatmap ───────────────────────────────────────── */}
          {totalLessons > 0 && (
            <div className="profile-section">
              <h4 className="profile-section-title">{t.profile_heatmap_title}</h4>
              <div className="profile-heatmap">
                {heatDays.map(d => (
                  <div
                    key={d.key}
                    className="profile-heat-cell"
                    style={{ background: heatColor(d) }}
                    title={
                      !d.isLesson ? d.label :
                      d.rec ? `${d.label} · HW:${d.rec.homework}% NAT:${d.rec.attendance}% ACT:${d.rec.activity}%` :
                      `${d.label} · ${t.profile_absent}`
                    }
                  />
                ))}
              </div>
              <div className="profile-heatmap-legend">
                <div className="profile-heat-cell" style={{ background: "#e2e8f0" }} />
                <span>{t.profile_absent}</span>
                <div className="profile-heat-cell" style={{ background: "#f87171" }} />
                <span>{t.profile_bad}</span>
                <div className="profile-heat-cell" style={{ background: "#fbbf24" }} />
                <span>{t.profile_behind}</span>
                <div className="profile-heat-cell" style={{ background: "#4ade80" }} />
                <span>{t.profile_good}</span>
              </div>
            </div>
          )}

          {/* ── Recent lessons ────────────────────────────────── */}
          {recent.length > 0 && (
            <div className="profile-section">
              <h4 className="profile-section-title">{t.profile_recent}</h4>
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
                        <span title={t.profile_homework}>HW {r.homework || 0}%</span>
                        <span title={t.profile_attendance}>NAT {r.attendance || 0}%</span>
                        <span title={t.profile_activity}>ACT {r.activity || 0}%</span>
                      </div>
                      <span className="profile-recent-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                        {score}% · {t[`status_${st.key}`]}
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
              {t.profile_no_history}
            </div>
          )}

          {/* ── Homework warnings ─────────────────────────────── */}
          {(student.scorePenalty > 0 || zeroCount >= 2) && (
            <div className="profile-section" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 className="profile-section-title">⚠️ {t.profile_warnings_title}</h4>

              {student.scorePenalty > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#b91c1c" }}>{t.profile_score_penalty(student.scorePenalty)}</span>
                  <button
                    type="button"
                    style={{ fontSize: "12px", fontWeight: 800, padding: "6px 14px", border: "1px solid #fca5a5", borderRadius: "8px", background: "white", color: "#b91c1c", cursor: "pointer", flexShrink: 0 }}
                    onClick={() => onUpdateStudent?.(student.id, { scorePenalty: 0 })}
                  >
                    {t.profile_reset_penalty}
                  </button>
                </div>
              )}

              {zeroCount === 2 && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <strong style={{ fontSize: "14px", color: "#92400e" }}>{t.card_zero2_title}</strong>
                  <span style={{ fontSize: "13px", color: "#92400e" }}>{t.card_zero2_text(homeworkFine)}</span>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ justifyContent: "center", background: "#d97706", borderColor: "#d97706" }}
                    onClick={() => {
                      const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
                      onUpdateStudent?.(student.id, { ignoredZeroDates: newDates, scorePenalty: (student.scorePenalty || 0) + 10 });
                    }}
                  >
                    {t.card_pay_fine(homeworkFine)}
                  </button>
                </div>
              )}

              {zeroCount >= 3 && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <strong style={{ fontSize: "14px", color: "#b91c1c" }}>{t.card_zero3_title}</strong>
                  <span style={{ fontSize: "13px", color: "#b91c1c" }}>{t.card_zero3_text}</span>
                  <button
                    type="button"
                    className="danger-button"
                    style={{ justifyContent: "center" }}
                    onClick={() => {
                      const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
                      onUpdateStudent?.(student.id, { ignoredZeroDates: newDates, scorePenalty: (student.scorePenalty || 0) + 15 });
                    }}
                  >
                    {t.card_contacted}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>,
    document.body
  );
}
