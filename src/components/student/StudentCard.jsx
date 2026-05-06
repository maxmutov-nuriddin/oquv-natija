import dayjs from "dayjs";
import { Coins, Settings, Star, Trash2, Trophy } from "lucide-react";
import { availableGifts, scoreFields } from "../../constants";
import { cx, initials, numberInputValue, parsePercentInput, rankText } from "../../lib/utils";
import { ProgressLine } from "../ui/ProgressLine";

export function StudentCard({ student, onDelete, onEdit, index, date, records, settings, saveLessonRecords, isLessonDay = true, onWarningReset, onUpdateStudent, weeklyWinner, monthlyWinner, hideGifts = false }) {
  const todayRecord = records?.find((r) => r.studentId === student.id && r.date === date);
  const hw = todayRecord ? todayRecord.homework : 0;
  const att = todayRecord ? todayRecord.attendance : 0;
  const act = todayRecord ? todayRecord.activity : 0;
  const todayCoins = todayRecord ? (todayRecord.coinsEarned ?? 0) : 0;

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
  const needsWarning = zeroRecords.length >= 3;

  const gifts = student.gifts || [];
  const isStartOfWeek = dayjs(date).day() === 1;
  const isStartOfMonth = dayjs(date).date() === 1;
  const isWeeklyWinner = student.id === weeklyWinner?.id;
  const isMonthlyWinner = student.id === monthlyWinner?.id;

  const isVip = gifts.some(g => g.type === "vip" && g.count > 0) || (isWeeklyWinner && isStartOfWeek) || (isMonthlyWinner && isStartOfMonth);

  function useGift(giftId, e) {
    if (e) e.stopPropagation();
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
              <button key={g.id} type="button" className="gift-tag" style={{ "--gift-color": giftMeta.color }} onClick={(e) => useGift(g.id, e)} title="Ishlatish uchun bosing">
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
        <ProgressLine label="Uy vazifa" value={hw} tone="tone-homework" />
        <ProgressLine label="Yuqori natija" value={att} tone="tone-result" />
        <ProgressLine label="Aktivlik" value={act} tone="tone-activity" />
      </div>

      <div className="rank-chips">
        <span>Hafta: {isStartOfWeek ? rankText(student.weeklyRank) : "Kutilmoqda"}</span>
        <span>Oy: {isStartOfMonth ? rankText(student.monthlyRank) : "Kutilmoqda"}</span>
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
      <div className="student-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button className="secondary-button" type="button" onClick={() => onEdit?.(student)} style={{ flex: 1, padding: "8px", fontSize: "13px" }}>
          <Settings size={15} />
          Tahrirlash
        </button>
        <button className="danger-button" type="button" onClick={() => onDelete(student)} style={{ flex: 1, padding: "8px", fontSize: "13px" }}>
          <Trash2 size={15} />
          O'chirish
        </button>
      </div>

      {needsWarning && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fca5a5" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>⚠️ 3 marta uy vazifasi yo'q!</strong>
          <span>Uydilariga aloqaga chiqish lozim.</span>
          <button
            type="button"
            className="danger-button"
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px" }}
            onClick={() => onWarningReset?.(student.id, [...ignoredZeroDates, ...zeroRecords.map(r => r.date)])}
          >
            Ogohlantirildi
          </button>
        </div>
      )}
    </article>
  );
}
