import dayjs from "dayjs";

export function calculateCoins(record, settings) {
  const homeworkCoins = (Number(record.homework) / 100) * Number(settings.homeworkCoin || 0);
  const attendanceCoins = Number(record.attendance) > 0 ? Number(settings.attendanceCoin || 0) : 0;
  const activityCoins = (Number(record.activity || 0) / 100) * Number(settings.activityCoin || 0);
  return Math.round(homeworkCoins + attendanceCoins + activityCoins);
}

export function finalScore(student, settings) {
  const hw = Number(settings.homeworkWeight ?? 0.4);
  const att = Number(settings.attendanceWeight ?? 0.3);
  const act = Number(settings.activityWeight ?? 0.3);
  return Math.round(
    Number(student.homeworkScore || 0) * hw +
      Number(student.attendanceScore || 0) * att +
      Number(student.activityScore || 0) * act
  );
}

export function getWindowRecords(records, days, date = dayjs()) {
  const end = dayjs(date).endOf("day");
  const start = end.subtract(days - 1, "day").startOf("day");
  return records.filter((record) => {
    const recordDate = dayjs(record.date);
    return recordDate.isAfter(start.subtract(1, "millisecond")) && recordDate.isBefore(end.add(1, "millisecond"));
  });
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
