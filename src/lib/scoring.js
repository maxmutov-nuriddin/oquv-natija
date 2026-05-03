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
  return Math.round(
    Number(student.homeworkScore || 0) * hw +
      Number(student.attendanceScore || 0) * result +
      Number(student.activityScore || 0) * act
  );
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
  // If it's Sunday, the "previous" week for the user is the one ending today.
  // Otherwise, it's the week that ended on the most recent Sunday.
  const diff = day === 0 ? 6 : day + 6;
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

export function summarizeStudent(student, records, settings, date = dayjs()) {
  const studentRecords = records.filter((record) => record.studentId === student.id);
  const weeklyRecords = getWindowRecords(studentRecords, 7, date);
  const monthlyRecords = getWindowRecords(studentRecords, 30, date);
  const coins = studentRecords.reduce((sum, record) => sum + (Number(record.coinsEarned) || calculateCoins(record, settings)), 0);
  const weeklyCoins = weeklyRecords.reduce((sum, record) => sum + (Number(record.coinsEarned) || calculateCoins(record, settings)), 0);
  const monthlyCoins = monthlyRecords.reduce((sum, record) => sum + (Number(record.coinsEarned) || calculateCoins(record, settings)), 0);
  return {
    ...student,
    coins,
    weeklyCoins,
    monthlyCoins,
    finalScore: finalScore(student, settings)
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
