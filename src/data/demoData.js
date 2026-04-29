import dayjs from "dayjs";

const today = dayjs();

export const demoGroups = [
  { id: "group-a", name: "Group A", studentsCount: 5, weekdays: [1, 3, 5] },
  { id: "group-b", name: "Group B", studentsCount: 5, weekdays: [2, 4, 6] },
  { id: "group-c", name: "Group C", studentsCount: 4, weekdays: [0, 2, 5] }
];

export const demoSettings = {
  homeworkCoin: 10,
  attendanceCoin: 5,
  activityCoin: 8,
  homeworkWeight: 0.4,
  attendanceWeight: 0.3,
  activityWeight: 0.3
};

export const demoStudents = [
  ["s1", "Aziza Karimova", "Group A", 92, 96, 88],
  ["s2", "Javohir Saidov", "Group A", 84, 90, 76],
  ["s3", "Madina Aliyeva", "Group A", 98, 100, 94],
  ["s4", "Sardor Nabiyev", "Group A", 71, 86, 69],
  ["s5", "Nodira Olimova", "Group A", 89, 92, 91],
  ["s6", "Behruz Tursunov", "Group B", 78, 82, 80],
  ["s7", "Malika Rustamova", "Group B", 96, 96, 99],
  ["s8", "Diyor Abdullayev", "Group B", 63, 77, 72],
  ["s9", "Iroda Sobirova", "Group B", 87, 91, 85],
  ["s10", "Asadbek Qodirov", "Group B", 91, 89, 88],
  ["s11", "Sevara Hamidova", "Group C", 82, 94, 79],
  ["s12", "Temur Akmalov", "Group C", 99, 98, 95],
  ["s13", "Rayhona Ergasheva", "Group C", 75, 84, 86],
  ["s14", "Kamron Ismoilov", "Group C", 69, 73, 70]
].map(([id, name, group, homeworkScore, attendanceScore, activityScore]) => ({
  id,
  name,
  group,
  homeworkScore,
  attendanceScore,
  activityScore,
  createdAt: today.subtract(45, "day").toISOString()
}));

export const demoRecords = demoStudents.flatMap((student, index) => {
  return Array.from({ length: 32 }, (_, offset) => {
    const date = today.subtract(offset, "day");
    const variance = ((index + offset) % 5) * 4;
    const homework = Math.max(45, Math.min(100, student.homeworkScore - variance + 8));
    const attendance = (index + offset) % 7 === 0 ? 0 : 100;
    const activity = Math.max(45, Math.min(100, student.activityScore - variance + 6));
    return {
      id: `${student.id}-${date.format("YYYY-MM-DD")}`,
      studentId: student.id,
      date: date.format("YYYY-MM-DD"),
      homework,
      attendance,
      activity,
      coinsEarned: Math.round(homework / 10 + (attendance ? 5 : 0) + activity * 0.08)
    };
  });
});
