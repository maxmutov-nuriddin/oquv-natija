import dayjs from "dayjs";
import { Coins, Settings, Star, Trash2, Trophy, User } from "lucide-react";
import { availableGifts, scoreFields } from "../../constants";
import { LEVELS } from "../../constants";
import { getScoreSummary } from "../../lib/scoring";
import { cx, getLevel, getPerformanceStatus, initials, numberInputValue, parsePercentInput, rankText } from "../../lib/utils";
import { ProgressLine } from "../ui/ProgressLine";

export function StudentCard({ student, onDelete, onEdit, onProfile, index, date, records, settings, saveLessonRecords, isLessonDay = true, onWarningReset, onUpdateStudent, weeklyWinner, monthlyWinner, hideGifts = false }) {
  const todayRecord = records?.find((r) => r.studentId === student.id && r.date === date);
  const hw = todayRecord ? todayRecord.homework : 0;
  const att = todayRecord ? todayRecord.attendance : 0;
  const act = todayRecord ? todayRecord.activity : 0;
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
                {level.emoji} {level.name}
              </span>
              {isWeeklyWinner && isStartOfWeek && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>Hafta G'olibi</span>}
              {isMonthlyWinner && isStartOfMonth && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>Oy G'olibi</span>}
              {gifts.filter(g => g.type === "vip").map((g, i) => (
                <span key={i} className="vip-text-badge">{g.name}</span>
              ))}
            </div>
            <p>{student.group} · {isStartOfWeek ? `${rankText(student.weeklyRank)} hafta` : "Natija kutilmoqda"}</p>
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
                title={isPenalized ? "Privelegiyalar bloklangan" : "Ishlatish uchun bosing"}
                disabled={isPenalized}
              >
                <GiftIcon size={12} />
                <span>{g.name} x{g.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="student-score">
        <span>Final score</span>
        <strong>{Math.round(
          hw * (settings.homeworkWeight || 0.4) +
          att * (settings.attendanceWeight || 0.3) +
          act * (settings.activityWeight || 0.3)
        )}%</strong>
      </div>

      <div className="student-progress">
        <ProgressLine label="Uy vazifa" value={hw} tone="tone-homework" showStatus={attended} />
        <ProgressLine label="Yuqori natija" value={att} tone="tone-result" showStatus={attended} />
        <ProgressLine label="Aktivlik" value={act} tone="tone-activity" showStatus={attended} />
      </div>

      <div className="rank-chips">
        <span>Hafta: {isStartOfWeek ? rankText(student.weeklyRank) : "Kutilmoqda"}</span>
        <span>Oy: {isStartOfMonth ? rankText(student.monthlyRank) : "Kutilmoqda"}</span>
      </div>

      <PeriodSummary studentId={student.id} records={records} date={date} settings={settings} />

      <div style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
          <span style={{ fontWeight: 600, color: level.color }}>{level.emoji} {level.name} · {monthlyCoins} coin (bu oy)</span>
          {nextLevel
            ? <span>{nextLevel.min - monthlyCoins} coin → {nextLevel.emoji} {nextLevel.name}</span>
            : <span style={{ color: level.color, fontWeight: 600 }}>MAX DARAJA 🏆</span>
          }
        </div>
        <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${levelProgress}%`, background: level.color, borderRadius: "99px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div className="quick-edit">
        {scoreFields.map((field) => {
          const Icon = field.icon;
          const val = field.key === "homeworkScore" ? hw : field.key === "attendanceScore" ? att : act;
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
                disabled={!isLessonDay}
                value={numberInputValue(val)}
                onChange={(event) => handleQuickUpdate(field.key, parsePercentInput(event.target.value))}
                aria-label={field.label}
              />
            </label>
          );
        })}
      </div>
      <div className="student-actions" style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
        <button className="secondary-button" type="button" onClick={() => onProfile?.(student)} style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: "13px" }}>
          <User size={15} />
          Profil
        </button>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="secondary-button" type="button" onClick={() => onEdit?.(student)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "13px" }}>
            <Settings size={15} />
            Tahrirlash
          </button>
          <button className="danger-button" type="button" onClick={() => onDelete(student)} style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "13px" }}>
            <Trash2 size={15} />
            O'chirish
          </button>
        </div>
      </div>

      {zeroCount === 2 && (
        <div style={{ background: "#fef9c3", color: "#92400e", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fde68a" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>⚠️ 2 marta uy vazifasi yo'q!</strong>
          <span>Barcha privelegiyalar bloklangan. Aktivlashtirish uchun 500 coin shtraf to'lang.</span>
          <button
            type="button"
            className="primary-button"
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px", background: "#d97706", borderColor: "#d97706" }}
            onClick={() => {
              const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
              onUpdateStudent?.(student.id, { homeworkFines: (student.homeworkFines || 0) + 500, ignoredZeroDates: newDates });
            }}
          >
            To'lash (500 coin)
          </button>
        </div>
      )}

      {zeroCount >= 3 && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fca5a5" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>🚨 3 marta uy vazifasi yo'q!</strong>
          <span>Privelegiyalar bloklangan. Coin bilan aktivlashtirish mumkin emas — ota-onasiga aloqaga chiqing.</span>
          <button
            type="button"
            className="danger-button"
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px" }}
            onClick={() => {
              const newDates = [...ignoredZeroDates, ...zeroRecords.map(r => r.date)];
              onUpdateStudent?.(student.id, { ignoredZeroDates: newDates });
            }}
          >
            Aloqaga chiqildi
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

function PeriodSummary({ studentId, records, date, settings }) {
  const weekly  = getScoreSummary(studentId, records, 7,  date);
  const monthly = getScoreSummary(studentId, records, 30, date);

  if (!weekly && !monthly) return null;

  return (
    <div className="period-summary-row">
      {weekly  && <PeriodChip title="Haftalik" count={weekly.count}  score={periodFinal(weekly,  settings)} />}
      {monthly && <PeriodChip title="Oylik"    count={monthly.count} score={periodFinal(monthly, settings)} />}
    </div>
  );
}

function PeriodChip({ title, count, score }) {
  const st = getPerformanceStatus(score);
  return (
    <div className="period-chip" style={{ borderColor: st.border, background: st.bg }}>
      <span className="period-chip-title">{title}</span>
      <span className="period-chip-count">{count} dars</span>
      <span className="period-chip-badge" style={{ color: st.color }}>{st.label}</span>
      <span className="period-chip-score" style={{ color: st.color }}>{score}%</span>
    </div>
  );
}
