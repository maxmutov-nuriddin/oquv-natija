import dayjs from "dayjs";
import { Coins, Settings, Star, Trash2, Trophy, User, Zap } from "lucide-react";
import { availableGifts, scoreFields } from "../../constants";
import { LEVELS } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { getScoreSummary, isDeclineTrend } from "../../lib/scoring";
import { cx, getLevel, getPerformanceStatus, initials, numberInputValue, parsePercentInput } from "../../lib/utils";
import { ProgressLine } from "../ui/ProgressLine";

export function StudentCard({ student, onDelete, onEdit, onProfile, index, date, records, settings, saveLessonRecords, isLessonDay = true, isRecordSaved = false, pendingScore, onScoreChange, onWarningReset, onUpdateStudent, weeklyWinner, monthlyWinner, hideGifts = false, isLowPerformer = false }) {
  const { t } = useT();
  const todayRecord = records?.find((r) => r.studentId === student.id && r.date === date);
  const hw = todayRecord ? todayRecord.homework : 0;
  const att = todayRecord ? todayRecord.attendance : 0;
  const act = todayRecord ? todayRecord.activity : 0;
  const extraTask = Number(todayRecord?.extraTask || 0);
  const todayCoins = todayRecord ? (todayRecord.coinsEarned ?? 0) : 0;
  const attended = hw > 0 || att > 0 || act > 0;

  async function handleQuickUpdate(key, value) {
    const updatedStudent = {
      ...student,
      homeworkScore: hw,
      attendanceScore: att,
      activityScore: act,
      [key]: value
    };
    if (saveLessonRecords) {
      await saveLessonRecords({ date, settings, students: [updatedStudent] });
    }
  }

  const ignoredZeroDates = student.ignoredZeroDates || [];
  const zeroRecords = records?.filter((r) => r.studentId === student.id && r.homework === 0 && !ignoredZeroDates.includes(r.date)) || [];
  const zeroCount = zeroRecords.length;
  const isPenalized = zeroCount >= 2;

  const gifts = student.gifts || [];
  const isStartOfWeek = dayjs(date).day() === 1;
  const isStartOfMonth = dayjs(date).date() === 1;
  const isWeeklyWinner = student.id === weeklyWinner?.id;
  const isMonthlyWinner = student.id === monthlyWinner?.id;

  const isVip = gifts.some(g => g.type === "vip" && g.count > 0) || (isWeeklyWinner && isStartOfWeek) || (isMonthlyWinner && isStartOfMonth);
  const declining = isDeclineTrend(student.id, records, settings);

  const finalScore = Math.min(100, Math.round(
    hw * (settings.homeworkWeight || 0.4) +
    att * (settings.attendanceWeight || 0.3) +
    act * (settings.activityWeight || 0.3) +
    extraTask * Number(settings.extraTaskWeight || 0)
  ));

  const monthlyCoins = student.monthlyCoins || 0;
  const level = getLevel(monthlyCoins);
  const levelIndex = LEVELS.indexOf(level);
  const nextLevel = LEVELS[levelIndex + 1] || null;
  const levelProgress = nextLevel
    ? Math.round(((monthlyCoins - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  function useGift(giftId, e) {
    if (e) e.stopPropagation();
    if (isPenalized) return;
    const currentGifts = student.gifts || [];
    const nextGifts = currentGifts.map(g => {
      const currentCount = Number(g.count || 0);
      if (g.id === giftId) return { ...g, count: Math.max(0, currentCount - 1) };
      return g;
    }).filter(g => g.count > 0);
    onUpdateStudent?.(student.id, { gifts: nextGifts });
  }

  return (
    <article className={cx("student-card", index < 3 && "student-card-top", isVip && "student-card-vip")}>
      <div className="student-head">
        <div className="student-person">
          <div className="avatar">
            {initials(student.name)}
            {isVip && <div className="vip-badge-icon"><Star size={12} fill="currentColor" /></div>}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>{student.name}</h3>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "999px", background: level.bg, color: level.color, border: `1px solid ${level.color}30`, flexShrink: 0 }}>
                {level.emoji} {t[`level_${level.key}`] || level.name}
              </span>
              {isWeeklyWinner && isStartOfWeek && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>{t.card_week_winner}</span>}
              {isMonthlyWinner && isStartOfMonth && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>{t.card_month_winner}</span>}
              {declining && <span className="vip-text-badge" style={{ background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a" }}>{t.card_decline}</span>}
              {gifts.filter(g => g.type === "vip").map((g, i) => (
                <span key={i} className="vip-text-badge">{g.name}</span>
              ))}
            </div>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "3px 0 0" }}>
              <span>{student.group} · {isStartOfWeek ? t.card_rank_week(student.weeklyRank) : t.card_rank_waiting}</span>
              <span style={{ color: "var(--blue)", fontWeight: 900, textTransform: "none", fontSize: "13px" }}>{finalScore}%</span>
            </p>
          </div>
        </div>
        <div className="coin-badge">
          <Coins size={15} />
          {todayCoins}
        </div>
      </div>

      {gifts.length > 0 && !hideGifts && (
        <div className="student-gifts">
          {gifts.map(g => {
            const giftMeta = availableGifts.find(ag => ag.id === g.id) || { icon: Trophy, color: "var(--muted)" };
            const GiftIcon = giftMeta.icon;
            return (
              <button
                key={g.id}
                type="button"
                className="gift-tag"
                style={{ "--gift-color": giftMeta.color, opacity: isPenalized ? 0.45 : 1, cursor: isPenalized ? "not-allowed" : "pointer" }}
                onClick={(e) => useGift(g.id, e)}
                title={isPenalized ? t.card_blocked : t.card_use}
                disabled={isPenalized}
              >
                <GiftIcon size={12} />
                <span>{g.name} x{g.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="student-progress">
        <ProgressLine label={t.card_homework} value={hw} tone="tone-homework" showStatus={attended} />
        <ProgressLine label={t.card_attendance} value={att} tone="tone-result" showStatus={attended} />
        <ProgressLine label={t.card_activity} value={act} tone="tone-activity" showStatus={attended} />
      </div>

      <WeakMetricHint studentId={student.id} records={records} date={date} settings={settings} />

      <PeriodSummary studentId={student.id} records={records} date={date} settings={settings} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
          <span style={{ fontWeight: 600, color: level.color }}>{level.emoji} {t[`level_${level.key}`] || level.name} · {monthlyCoins} {t.card_coins_month}</span>
          {nextLevel
            ? <span>{nextLevel.min - monthlyCoins} {t.card_coin_arrow} {nextLevel.emoji} {t[`level_${nextLevel.key}`] || nextLevel.name}</span>
            : <span style={{ color: level.color, fontWeight: 600 }}>{t.card_max_level}</span>
          }
        </div>
        <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${levelProgress}%`, background: level.color, borderRadius: "99px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div className="quick-edit">
        {scoreFields.map((field) => {
          const Icon = field.icon;
          const savedVal = field.key === "homeworkScore" ? hw : field.key === "attendanceScore" ? att : act;
          const val = pendingScore?.[field.key] ?? savedVal;
          const handleChange = (newVal) => {
            if (onScoreChange) onScoreChange(field.key, newVal);
            else handleQuickUpdate(field.key, newVal);
          };
          return (
            <label key={field.key}>
              <span>
                <Icon size={13} />
                {field.short}
              </span>
              <input
                type="number"
                min="0"
                max="100"
                disabled={!isLessonDay || isRecordSaved}
                value={numberInputValue(val)}
                onChange={(event) => handleChange(parsePercentInput(event.target.value))}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => { if (e.target.value === "" || isNaN(Number(e.target.value))) handleChange(0); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                onWheel={(e) => e.target.blur()}
                aria-label={field.label}
              />
            </label>
          );
        })}
      </div>
      {isLowPerformer && (
        <label style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: extraTask > 0 ? "#dcfce7" : "#f9fafb",
          border: `2px solid ${extraTask > 0 ? "#86efac" : "#e2e8f0"}`,
          borderRadius: "9999px", padding: "6px 12px 6px 16px", gap: "8px"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 800, color: extraTask > 0 ? "#15803d" : "#64748b" }}>
            <Zap size={13} fill={extraTask > 0 ? "currentColor" : "none"} />
            {t.card_extra_task}
          </span>
          <input
            type="number"
            min="0"
            max="100"
            disabled={!isLessonDay || isRecordSaved}
            value={numberInputValue(extraTask)}
            onChange={(e) => handleQuickUpdate("extraTask", parsePercentInput(e.target.value))}
            onFocus={(e) => e.target.select()}
            onBlur={(e) => { if (e.target.value === "" || isNaN(Number(e.target.value))) handleQuickUpdate("extraTask", 0); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onWheel={(e) => e.target.blur()}
            style={{ width: "60px", textAlign: "center", border: "none", background: "transparent", fontWeight: 800, fontSize: "14px", color: extraTask > 0 ? "#15803d" : "#374151", outline: "none" }}
          />
        </label>
      )}

      <div style={{ display: "flex", gap: "6px" }}>
        <button className="secondary-button" type="button" onClick={() => onProfile?.(student)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <User size={13} />
          {t.card_profile}
        </button>
        <button className="secondary-button" type="button" onClick={() => onEdit?.(student)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <Settings size={13} />
          {t.card_edit}
        </button>
        <button className="danger-button" type="button" onClick={() => onDelete(student)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <Trash2 size={13} />
          {t.card_delete}
        </button>
      </div>

      {zeroCount === 2 && (
        <div style={{ background: "#fef9c3", color: "#92400e", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fde68a" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>{t.card_zero2_title}</strong>
          <span>{t.card_zero2_text}</span>
          <button
            type="button"
            className="primary-button"
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px", background: "#d97706", borderColor: "#d97706" }}
            onClick={() => {
              const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
              onUpdateStudent?.(student.id, { homeworkFines: (student.homeworkFines || 0) + 500, ignoredZeroDates: newDates });
            }}
          >
            {t.card_pay_fine}
          </button>
        </div>
      )}

      {zeroCount >= 3 && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fca5a5" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>{t.card_zero3_title}</strong>
          <span>{t.card_zero3_text}</span>
          <button
            type="button"
            className="danger-button"
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px" }}
            onClick={() => {
              const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
              onUpdateStudent?.(student.id, { ignoredZeroDates: newDates });
            }}
          >
            {t.card_contacted}
          </button>
        </div>
      )}
    </article>
  );
}

function periodFinal(data, settings) {
  const hw  = Number(settings?.homeworkWeight  ?? 0.4);
  const att = Number(settings?.attendanceWeight ?? 0.3);
  const act = Number(settings?.activityWeight   ?? 0.3);
  return Math.round(data.avgHw * hw + data.avgAtt * att + data.avgAct * act);
}

function WeakMetricHint({ studentId, records, date, settings }) {
  const { t } = useT();
  const monthly = getScoreSummary(studentId, records, 30, date);
  if (!monthly) return null;

  const overallScore = periodFinal(monthly, settings);
  if (overallScore >= 80) return null;

  const metrics = [
    { label: t.card_homework,   score: monthly.avgHw,  weight: Number(settings?.homeworkWeight  || 0.4) },
    { label: t.card_attendance, score: monthly.avgAtt, weight: Number(settings?.attendanceWeight || 0.3) },
    { label: t.card_activity,   score: monthly.avgAct, weight: Number(settings?.activityWeight   || 0.3) },
  ];

  const bottleneck = [...metrics].sort(
    (a, b) => (100 - b.score) * b.weight - (100 - a.score) * a.weight
  )[0];

  if (bottleneck.score >= 75) return null;

  return (
    <div style={{
      background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px",
      padding: "7px 12px", fontSize: "12px", fontWeight: 700, color: "#92400e"
    }}>
      {t.hint_bottleneck(bottleneck.label, bottleneck.score)}
    </div>
  );
}

function PeriodSummary({ studentId, records, date, settings }) {
  const weekly  = getScoreSummary(studentId, records, 7,  date);
  const monthly = getScoreSummary(studentId, records, 30, date);
  if (!weekly && !monthly) return null;
  return (
    <div className="period-summary-row">
      {weekly  && <PeriodChip titleKey="period_weekly"  count={weekly.count}  score={periodFinal(weekly,  settings)} />}
      {monthly && <PeriodChip titleKey="period_monthly" count={monthly.count} score={periodFinal(monthly, settings)} />}
    </div>
  );
}

function PeriodChip({ titleKey, count, score }) {
  const { t } = useT();
  const st = getPerformanceStatus(score);
  return (
    <div className="period-chip" style={{ borderColor: st.border, background: st.bg }}>
      <span className="period-chip-title">{t[titleKey]}</span>
      <span className="period-chip-count">{t.period_lessons(count)}</span>
      <span className="period-chip-badge" style={{ color: st.color }}>{t[`status_${st.key}`]}</span>
      <span className="period-chip-score" style={{ color: st.color }}>{score}%</span>
    </div>
  );
}
