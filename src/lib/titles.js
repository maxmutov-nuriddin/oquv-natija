import { getCurrentMonthRange, getRecordsInRange, isRiseTrend } from "./scoring";

export const TITLES = {
  lightning: { id: "lightning", emoji: "⚡", label: "LIGHTNING", color: "#d97706", bg: "#fef9c3", border: "#fde68a" },
  on_fire:   { id: "on_fire",   emoji: "🔥", label: "ON FIRE",   color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
  eagle:     { id: "eagle",     emoji: "🦅", label: "EAGLE",     color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
  machine:   { id: "machine",   emoji: "💎", label: "MACHINE",   color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc" },
  ghost:     { id: "ghost",     emoji: "💀", label: "GHOST",     color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1" },
};

export function getAutoTitle(student, records, settings, rankedStudent, date) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);

  const eagleThreshold    = Number(settings?.titleEagleThreshold    ?? 95);
  const machineThreshold  = Number(settings?.titleMachineThreshold  ?? 85);
  const machineMinLessons = Number(settings?.titleMachineMinLessons ?? 3);
  const ghostThreshold    = Number(settings?.titleGhostThreshold    ?? 5);

  // ⚡ LIGHTNING — bu haftada #1
  if (settings?.titleLightningEnabled !== false && rankedStudent?.weeklyRank === 1)
    return TITLES.lightning;

  // 🔥 ON FIRE — 3 dars ketma-ket o'sish
  if (settings?.titleOnFireEnabled !== false && isRiseTrend(student.id, records, settings))
    return TITLES.on_fire;

  // 🦅 EAGLE — oxirgi darsda eagleThreshold%+
  if (settings?.titleEagleEnabled !== false) {
    const attended = records
      .filter(r => r.studentId === student.id && (r.homework > 0 || r.attendance > 0 || r.activity > 0))
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    if (attended.length > 0) {
      const last = attended[0];
      const score = Math.min(100, Math.round(
        (last.homework || 0) * hw + (last.attendance || 0) * att + (last.activity || 0) * act
      ));
      if (score >= eagleThreshold) return TITLES.eagle;
    }
  }

  // 💎 MACHINE — oylik o'rtacha machineThreshold%+
  if (settings?.titleMachineEnabled !== false) {
    const monthRange = getCurrentMonthRange(date);
    const monthRecs = getRecordsInRange(
      records.filter(r => r.studentId === student.id),
      monthRange.start, monthRange.end
    ).filter(r => r.homework > 0 || r.attendance > 0 || r.activity > 0);
    if (monthRecs.length >= machineMinLessons) {
      const avg = Math.round(
        monthRecs.reduce((s, r) =>
          s + (r.homework || 0) * hw + (r.attendance || 0) * att + (r.activity || 0) * act, 0
        ) / monthRecs.length
      );
      if (avg >= machineThreshold) return TITLES.machine;
    }
  }

  // 💀 GHOST — ghostThreshold+ marta uy vazifa yo'q (holbuki kelgan)
  if (settings?.titleGhostEnabled !== false) {
    const ignoredDates = student.ignoredZeroDates || [];
    const ghostCount = records.filter(r =>
      r.studentId === student.id &&
      r.homework === 0 &&
      (r.attendance > 0 || r.activity > 0) &&
      !ignoredDates.includes(r.date)
    ).length;
    if (ghostCount >= ghostThreshold) return TITLES.ghost;
  }

  return null;
}
