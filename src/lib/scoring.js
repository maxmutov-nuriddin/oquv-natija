import dayjs from "dayjs";

export function calculateCoins(record, settings) {
  const homeworkCoins = (Number(record.homework || 0) / 100) * Number(settings.homeworkCoin || 0);
  const attendanceCoins = (Number(record.attendance || 0) / 100) * Number(settings.attendanceCoin || 0);
  const activityCoins = (Number(record.activity || 0) / 100) * Number(settings.activityCoin || 0);
  return Math.round(homeworkCoins + attendanceCoins + activityCoins);
}

export function finalScore(student, settings) {
  const hw = Number(settings.homeworkWeight ?? 0.4);
  const result = Number(settings.attendanceWeight ?? 0.3);
  const act = Number(settings.activityWeight ?? 0.3);
  return Math.min(100, Math.round(
    Number(student.homeworkScore || 0) * hw +
      Number(student.attendanceScore || 0) * result +
      Number(student.activityScore || 0) * act
  ));
}

export function getWindowRecords(records, days, date = dayjs()) {
  const end = dayjs(date).endOf("day");
  const start = end.subtract(days - 1, "day").startOf("day");
  return getRecordsInRange(records, start, end);
}

export function getRecordsInRange(records, start, end) {
  const s = start.format("YYYY-MM-DD");
  const e = end.format("YYYY-MM-DD");
  return records.filter((record) => {
    const d = dayjs(record.date).format("YYYY-MM-DD");
    return d >= s && d <= e;
  });
}

export function getPreviousWeekRange(date = dayjs()) {
  const d = dayjs(date).startOf("day");
  const day = d.day(); // 0 is Sunday
  // To get the previously COMPLETED week (Mon-Sun):
  // If it's Sunday, the current week hasn't ended yet, so the previous week is 13 days ago (Monday).
  // Otherwise, it's (day + 6) days ago (Monday).
  const diff = day === 0 ? 13 : day + 6;
  const start = d.subtract(diff, "day").startOf("day");
  const end = start.add(6, "day").endOf("day");
  return { start, end };
}

export function getPreviousMonthRange(date = dayjs()) {
  const d = dayjs(date).startOf("day");
  const start = d.subtract(1, "month").startOf("month");
  const end = start.endOf("month");
  return { start, end };
}

export function getCurrentWeekRange(date = dayjs()) {
  const d = dayjs(date).startOf("day");
  const start = d.subtract((d.day() + 6) % 7, "day").startOf("day");
  return { start, end: d.endOf("day") };
}

export function getCurrentMonthRange(date = dayjs()) {
  const d = dayjs(date);
  return { start: d.startOf("month").startOf("day"), end: d.endOf("day") };
}

export function getPeriodLeader(students, records, settings, range) {
  if (!students || !students.length) return null;

  const results = students.map((student) => {
    const periodRecords = getRecordsInRange(
      records.filter((record) => record.studentId === student.id),
      range.start,
      range.end
    );
    const coins = periodRecords.reduce((sum, record) => {
      const earned = Number(record.coinsEarned);
      const val = !isNaN(earned) ? earned : calculateCoins(record, settings);
      return sum + val;
    }, 0);
    return { ...student, periodCoins: coins };
  });

  const leader = [...results].sort((a, b) => {
    if (b.periodCoins !== a.periodCoins) {
      return b.periodCoins - a.periodCoins;
    }
    return finalScore(b, settings) - finalScore(a, settings);
  })[0];

  return (leader && leader.periodCoins > 0) ? leader : null;
}

export function getScoreSummaryForRange(studentId, records, range) {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  const periodRecords = getRecordsInRange(studentRecords, range.start, range.end)
    .filter(r => r.homework > 0 || r.attendance > 0 || r.activity > 0);
  if (!periodRecords.length) return null;
  const count = periodRecords.length;
  const avgHw  = Math.round(periodRecords.reduce((s, r) => s + Number(r.homework   || 0), 0) / count);
  const avgAtt = Math.round(periodRecords.reduce((s, r) => s + Number(r.attendance || 0), 0) / count);
  const avgAct = Math.round(periodRecords.reduce((s, r) => s + Number(r.activity   || 0), 0) / count);
  return { avgHw, avgAtt, avgAct, count };
}

export function getScoreSummary(studentId, records, days, date = dayjs()) {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  const periodRecords = getWindowRecords(studentRecords, days, date);
  if (!periodRecords.length) return null;
  const count = periodRecords.length;
  const avgHw  = Math.round(periodRecords.reduce((s, r) => s + Number(r.homework   || 0), 0) / count);
  const avgAtt = Math.round(periodRecords.reduce((s, r) => s + Number(r.attendance || 0), 0) / count);
  const avgAct = Math.round(periodRecords.reduce((s, r) => s + Number(r.activity   || 0), 0) / count);
  return { avgHw, avgAtt, avgAct, count };
}

export function isDeclineTrend(studentId, records, settings) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  const attended = records
    .filter(r => r.studentId === studentId && (r.homework > 0 || r.attendance > 0 || r.activity > 0))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  if (attended.length < 3) return false;
  const [s1, s2, s3] = attended.slice(-3).map(r =>
    (r.homework || 0) * hw + (r.attendance || 0) * att + (r.activity || 0) * act
  );
  return s2 < s1 && s3 < s2;
}

export function groupAvgScore(groupStudents, records, settings, days = 30, date = dayjs()) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  const cutoff = dayjs(date).subtract(days, "day").format("YYYY-MM-DD");
  const studentAvgs = groupStudents.map(s => {
    const recs = records.filter(r =>
      r.studentId === s.id && r.date >= cutoff &&
      (r.homework > 0 || r.attendance > 0 || r.activity > 0)
    );
    if (!recs.length) return null;
    const n = recs.length;
    const avgHw  = recs.reduce((sum, r) => sum + Number(r.homework   || 0), 0) / n;
    const avgAtt = recs.reduce((sum, r) => sum + Number(r.attendance || 0), 0) / n;
    const avgAct = recs.reduce((sum, r) => sum + Number(r.activity   || 0), 0) / n;
    return avgHw * hw + avgAtt * att + avgAct * act;
  }).filter(v => v !== null);
  if (!studentAvgs.length) return null;
  return Math.round(studentAvgs.reduce((s, v) => s + v, 0) / studentAvgs.length);
}

export function isRiseTrend(studentId, records, settings) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  const attended = records
    .filter(r => r.studentId === studentId && (r.homework > 0 || r.attendance > 0 || r.activity > 0))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  if (attended.length < 3) return false;
  const [s1, s2, s3] = attended.slice(-3).map(r =>
    (r.homework || 0) * hw + (r.attendance || 0) * att + (r.activity || 0) * act
  );
  return s2 > s1 && s3 > s2;
}

export function summarizeStudent(student, records, settings, date = dayjs()) {
  const studentRecords = records.filter((record) => record.studentId === student.id);
  const weekRange = getCurrentWeekRange(date);
  const weeklyRecords  = getRecordsInRange(studentRecords, weekRange.start, weekRange.end);
  const monthRange = getCurrentMonthRange(date);
  const monthlyRecords = getRecordsInRange(studentRecords, monthRange.start, monthRange.end);

  const rawCoins    = studentRecords.reduce((sum, r) => sum + (Number(r.coinsEarned) || calculateCoins(r, settings)), 0);
  const coins       = Math.max(0, rawCoins - (student.homeworkFines || 0));
  const weeklyCoins = weeklyRecords.reduce((sum, r)  => sum + (Number(r.coinsEarned) || calculateCoins(r, settings)), 0);
  const monthlyCoins= monthlyRecords.reduce((sum, r) => sum + (Number(r.coinsEarned) || calculateCoins(r, settings)), 0);

  const activeLessons = monthlyRecords.filter(
    r => r.homework > 0 || r.attendance > 0 || r.activity > 0
  );

  let computedFinalScore;
  if (activeLessons.length > 0) {
    const n = activeLessons.length;
    const avgHw  = activeLessons.reduce((s, r) => s + Number(r.homework   || 0), 0) / n;
    const avgAtt = activeLessons.reduce((s, r) => s + Number(r.attendance || 0), 0) / n;
    const avgAct = activeLessons.reduce((s, r) => s + Number(r.activity   || 0), 0) / n;
    computedFinalScore = finalScore(
      { homeworkScore: avgHw, attendanceScore: avgAtt, activityScore: avgAct },
      settings
    );
  } else {
    computedFinalScore = finalScore(student, settings);
  }

  return {
    ...student,
    coins,
    weeklyCoins,
    monthlyCoins,
    finalScore: computedFinalScore,
  };
}

export function rankStudents(students, records, settings, date = dayjs()) {
  const summarized = students.map((student) => summarizeStudent(student, records, settings, date));
  const weekly = [...summarized].sort((a, b) => {
    if (b.weeklyCoins !== a.weeklyCoins) return b.weeklyCoins - a.weeklyCoins;
    return b.finalScore - a.finalScore;
  });
  const monthly = [...summarized].sort((a, b) => {
    if (b.monthlyCoins !== a.monthlyCoins) return b.monthlyCoins - a.monthlyCoins;
    return b.finalScore - a.finalScore;
  });
  const weeklyRanks = new Map(weekly.map((student, index) => [student.id, index + 1]));
  const monthlyRanks = new Map(monthly.map((student, index) => [student.id, index + 1]));
  return summarized
    .map((student) => ({
      ...student,
      weeklyRank: weeklyRanks.get(student.id),
      monthlyRank: monthlyRanks.get(student.id)
    }))
    .sort((a, b) => {
      if (b.coins !== a.coins) return b.coins - a.coins;
      return b.finalScore - a.finalScore;
    });
}

export function groupForDate(groups, date = dayjs()) {
  const weekday = dayjs(date).day();
  return groups.find((group) => Array.isArray(group.weekdays) && group.weekdays.includes(weekday)) || groups[0];
}

function timeToMinutes(time) {
  if (!time) return null;
  const [hour, minute] = String(time).split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

export function groupForDateTime(groups, date = dayjs(), time = dayjs().format("HH:mm")) {
  const weekday = dayjs(date).day();
  const currentMinutes = timeToMinutes(time);
  if (currentMinutes == null) return null;

  return [...groups]
    .filter((group) => Array.isArray(group.weekdays) && group.weekdays.includes(weekday))
    .filter((group) => {
      const start = timeToMinutes(group.lessonStart);
      const end = timeToMinutes(group.lessonEnd);
      if (start == null || end == null) return false;
      return currentMinutes >= start && currentMinutes < end;
    })
    .sort((a, b) => timeToMinutes(a.lessonStart) - timeToMinutes(b.lessonStart))[0] || null;
}
