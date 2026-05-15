import dayjs from "dayjs";
import { Coins, Settings, Star, Trash2, Trophy, User } from "lucide-react";
import { availableGifts, scoreFields } from "../../constants";
import { LEVELS } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { getScoreSummaryForRange, getCurrentMonthRange, isDeclineTrend } from "../../lib/scoring";
import { cx, getLevel, initials, numberInputValue, parsePercentInput } from "../../lib/utils";
import { ProgressLine } from "../ui/ProgressLine";

export function StudentCard({ student, onDelete, onEdit, onProfile, index, date, records, settings, saveLessonRecords, isLessonDay = true, isRecordSaved = false, onWarningReset, onUpdateStudent, weeklyWinner, monthlyWinner, hideGifts = false, isLowPerformer = false, autoTitle = null }) {
  const { t } = useT();
  const todayRecord = records?.find((r) => r.studentId === student.id && r.date === date);
  const hw = todayRecord ? todayRecord.homework : 0;
  const att = todayRecord ? todayRecord.attendance : 0;
  const act = todayRecord ? todayRecord.activity : 0;
  const todayCoins = todayRecord ? (todayRecord.coinsEarned ?? 0) : 0;
  const dailyBonus = todayRecord?.dailyBonus;
  const hasBonusDrum = dailyBonus !== undefined && dailyBonus !== null;
  const isPenaltyDrum = dailyBonus === "penalty";
  const attended = hw > 0 || att > 0 || act > 0;

  async function handleQuickUpdate(key, value) {
    const newHw  = key === "homeworkScore"   ? value : hw;
    const newAtt = key === "attendanceScore" ? value : att;
    const autoAct = (newHw > 0 || newAtt > 0) ? Math.round(newAtt * 0.7 + newHw * 0.3) : 0;
    const updatedStudent = {
      ...student,
      homeworkScore: newHw,
      attendanceScore: newAtt,
      activityScore: autoAct,
      [key]: value,
      ...(hasBonusDrum ? { dailyBonus } : {})
    };
    if (saveLessonRecords) {
      await saveLessonRecords({ date, settings, students: [updatedStudent] });
    }
  }

  const ignoredZeroDates = student.ignoredZeroDates || [];
  const zeroRecords = records?.filter((r) =>
    r.studentId === student.id &&
    r.homework === 0 &&
    (r.attendance > 0 || r.activity > 0) &&
    !ignoredZeroDates.includes(r.date)
  ) || [];
  const zeroCount = zeroRecords.length;
  const isPenalized = zeroCount >= 2;

  const gifts = student.gifts || [];
  const isStartOfWeek = dayjs(date).day() === 1;
  const isWeeklyWinner = student.id === weeklyWinner?.id;
  const isMonthlyWinner = student.id === monthlyWinner?.id;

  const isVip = gifts.some(g => g.type === "vip" && g.count > 0) || isWeeklyWinner || isMonthlyWinner;
  const declining = isDeclineTrend(student.id, records, settings);

  const finalScore = Math.min(100, Math.round(
    hw * (settings.homeworkWeight || 0.4) +
    att * (settings.attendanceWeight || 0.3) +
    act * (settings.activityWeight || 0.3)
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
    <article className={cx("student-card", index < 3 && "student-card-top", isVip && "student-card-vip", zeroCount >= 3 && "student-card-danger", zeroCount === 2 && zeroCount < 3 && "student-card-warning")}>
      {index < 3 && (
        <div style={{ position: "absolute", top: "-16px", left: "12px", zIndex: 3 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "13px", fontWeight: 900, padding: "4px 12px", borderRadius: "999px",
            color: "white", whiteSpace: "nowrap",
            background: index === 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : index === 1 ? "linear-gradient(135deg, #94a3b8, #64748b)" : "linear-gradient(135deg, #cd7c4a, #a05c30)",
            boxShadow: index === 0 ? "0 2px 10px rgba(245,158,11,0.55)" : index === 1 ? "0 2px 8px rgba(100,116,139,0.45)" : "0 2px 8px rgba(160,92,48,0.45)"
          }}>
            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {index + 1}-o'rin
          </span>
        </div>
      )}
      {(isWeeklyWinner || isMonthlyWinner) && (
        <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", whiteSpace: "nowrap", zIndex: 3 }}>
          {isWeeklyWinner  && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white", fontSize: "11px", padding: "3px 10px" }}>{t.card_week_winner}</span>}
          {isMonthlyWinner && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white", fontSize: "11px", padding: "3px 10px" }}>{t.card_month_winner}</span>}
        </div>
      )}
      {zeroCount >= 2 && (
        <div style={{ position: "absolute", top: "-13px", right: "12px", zIndex: 3 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 900, padding: "4px 12px", borderRadius: "999px", background: zeroCount >= 3 ? "#ef4444" : "#f59e0b", color: "white", whiteSpace: "nowrap", boxShadow: zeroCount >= 3 ? "0 2px 8px rgba(239,68,68,0.5)" : "0 2px 8px rgba(245,158,11,0.45)", letterSpacing: "0.3px" }}>
            {zeroCount >= 3 ? "🚨" : "⚠️"} {zeroCount}x uy ishi yo'q
          </span>
        </div>
      )}
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
{autoTitle && (
                <span style={{
                  fontSize: "10px", fontWeight: 900, padding: "2px 8px", borderRadius: "999px",
                  background: autoTitle.bg, color: autoTitle.color,
                  border: `1px solid ${autoTitle.border}`,
                  letterSpacing: "0.5px", flexShrink: 0,
                }}>
                  {autoTitle.emoji} {autoTitle.label}
                </span>
              )}
{declining && <span className="vip-text-badge" style={{ background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a" }}>{t.card_decline}</span>}
              {gifts.filter(g => g.type === "vip").map((g, i) => (
                <span key={i} className="vip-text-badge">{g.name}</span>
              ))}
            </div>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "3px 0 0" }}>
              <span>{student.group}{isStartOfWeek ? ` · ${t.card_rank_week(student.weeklyRank)}` : ""}</span>
              <span style={{ color: "var(--blue)", fontWeight: 900, textTransform: "none", fontSize: "13px" }}>{finalScore}%</span>
            </p>
          </div>
        </div>
        <div className="coin-badge" style={hasBonusDrum ? { background: isPenaltyDrum ? "#fee2e2" : "#dcfce7", color: isPenaltyDrum ? "#b91c1c" : "#15803d" } : {}}>
          <Coins size={15} />
          {todayCoins}
          {hasBonusDrum && (
            <span style={{ fontSize: "11px", fontWeight: 800 }}>
              {isPenaltyDrum ? "🎰−½" : `🎰+${dailyBonus}`}
            </span>
          )}
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
        {scoreFields.filter(f => f.key !== "activityScore").map((field) => {
          const Icon = field.icon;
          const savedVal = field.key === "homeworkScore" ? hw : att;
          return (
            <label key={field.key}>
              <span>
                <Icon size={13} />
                {field.short}
              </span>
              <input
                key={`${student.id}-${field.key}`}
                type="number"
                min="0"
                max="100"
                step="1"
                disabled={!isLessonDay || isRecordSaved}
                defaultValue={numberInputValue(savedVal)}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  if (e.target.value === "") {
                    handleQuickUpdate(field.key, 0);
                    return;
                  }
                  const clamped = parsePercentInput(e.target.value);
                  e.target.value = String(clamped);
                  handleQuickUpdate(field.key, clamped);
                }}
                onBlur={(e) => {
                  const raw = Number(e.target.value);
                  const rounded = isNaN(raw) || e.target.value === "" ? 0 : Math.min(100, Math.round(raw));
                  e.target.value = String(rounded);
                  handleQuickUpdate(field.key, rounded);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                onWheel={(e) => e.target.blur()}
                aria-label={field.label}
              />
            </label>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        <button className="secondary-button" type="button" onClick={() => onProfile?.(student)} style={{ gridColumn: "1 / -1", justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <User size={13} />
          {t.card_profile}
        </button>
        <button className="secondary-button" type="button" onClick={() => onEdit?.(student)} style={{ justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <Settings size={13} />
          {t.card_edit}
        </button>
        <button className="danger-button" type="button" onClick={() => onDelete(student)} style={{ justifyContent: "center", padding: "8px", fontSize: "12px", minHeight: "40px" }}>
          <Trash2 size={13} />
          {t.card_delete}
        </button>
      </div>

    </article>
  );
}

function periodFinal(data, settings) {
  return Math.min(100, Math.round(
    data.avgHw  * Number(settings?.homeworkWeight  ?? 0.4) +
    data.avgAtt * Number(settings?.attendanceWeight ?? 0.3) +
    data.avgAct * Number(settings?.activityWeight   ?? 0.3)
  ));
}

function WeakMetricHint({ studentId, records, date, settings }) {
  const { t } = useT();
  const monthly = getScoreSummaryForRange(studentId, records, getCurrentMonthRange(date));
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

