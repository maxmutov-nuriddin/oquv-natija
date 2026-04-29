import dayjs from "dayjs";

export function calculateCoins(record, settings) {
  const homeworkCoins = (Number(record.homework) / 100) * Number(settings.homeworkCoin || 0);
  const activityCoins = (Number(record.activity || 0) / 100) * Number(settings.activityCoin || 0);
  const lessonScore = Math.round((Number(record.homework || 0) + Number(record.attendance || 0) + Number(record.activity || 0)) / 3);
  const highScoreBonus = lessonScore >= 90 ? Number(settings.attendanceCoin || 0) : 0;
  return Math.round(homeworkCoins + activityCoins + highScoreBonus);
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
  return records.filter((record) => {
    const recordDate = dayjs(record.date);
    return recordDate.isAfter(start.subtract(1, "millisecond")) && recordDate.isBefore(end.add(1, "millisecond"));
  });
}

export function getPreviousWeekRange(date = dayjs()) {
  const current = dayjs(date).startOf("day");
  const mondayOffset = (current.day() + 6) % 7;
  const currentWeekStart = current.subtract(mondayOffset, "day");
  const start = currentWeekStart.subtract(7, "day");
  return { start, end: start.add(6, "day").endOf("day") };
}

export function getPreviousMonthRange(date = dayjs()) {
  const start = dayjs(date).subtract(1, "month").startOf("month");
  return { start, end: start.endOf("month") };
}

export function getPeriodLeader(students, records, settings, range) {
  const results = students.map((student) => {
    const periodRecords = getRecordsInRange(
      records.filter((record) => record.studentId === student.id),
      range.start,
      range.end
    );
    const coins = periodRecords.reduce((sum, record) => sum + (Number(record.coinsEarned) || calculateCoins(record, settings)), 0);
    return { ...student, periodCoins: coins };
  });

  const leader = results.sort((a, b) => b.periodCoins - a.periodCoins)[0] || null;
  return leader?.periodCoins > 0 ? leader : null;
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
  const weekly = [...summarized].sort((a, b) => b.weeklyCoins - a.weeklyCoins);
  const monthly = [...summarized].sort((a, b) => b.monthlyCoins - a.monthlyCoins);
  const weeklyRanks = new Map(weekly.map((student, index) => [student.id, index + 1]));
  const monthlyRanks = new Map(monthly.map((student, index) => [student.id, index + 1]));
  return summarized
    .map((student) => ({
      ...student,
      weeklyRank: weeklyRanks.get(student.id),
      monthlyRank: monthlyRanks.get(student.id)
    }))
    .sort((a, b) => b.coins - a.coins);
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
