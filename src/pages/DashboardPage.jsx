import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { BarChart3, Coins, Medal, Trophy, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateCoins, getPeriodLeader, getPreviousMonthRange, getPreviousWeekRange, rankStudents } from "../lib/scoring";
import { BonusDrumModal } from "../components/games/BonusDrumModal";
import { StudentCard } from "../components/student/StudentCard";
import { StudentProfileModal } from "../components/student/StudentProfileModal";
import { TimerPanel } from "../components/ui/TimerPanel";
import { ComicEntryModal } from "../components/ui/ComicEntryModal";
import { WeeklyComicPanel } from "../components/ui/WeeklyComicPanel";
import { CurrentLessonBanner } from "../components/ui/CurrentLessonBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { FunModal } from "../components/ui/FunModal";
import { PanelHeader } from "../components/ui/PanelHeader";
import { StatCard } from "../components/ui/StatCard";

export function DashboardPage({ groups, students, records, settings, selectedGroup, currentGroup, currentTime, date, query, onEditStudent, onDeleteStudent, saveLessonRecords, updateStudent }) {
  const monthlyWinner = useMemo(() => getPeriodLeader(students.filter(s => s.group === selectedGroup), records, settings, getPreviousMonthRange(date)), [students, selectedGroup, records, settings, date]);
  const weeklyWinner = useMemo(() => {
    const candidates = students.filter(s => s.group === selectedGroup && s.id !== monthlyWinner?.id);
    return getPeriodLeader(candidates, records, settings, getPreviousWeekRange(date));
  }, [students, selectedGroup, records, settings, date, monthlyWinner]);

  const isLessonDay = useMemo(() => {
    const groupObj = groups?.find(g => g.name === selectedGroup);
    return groupObj ? groupObj.weekdays?.includes(dayjs(date).day()) : false;
  }, [groups, selectedGroup, date]);

  const groupStudents = useMemo(() => students.filter((student) => student.group === selectedGroup), [students, selectedGroup]);
  const ranked = useMemo(() => {
    const filtered = groupStudents.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));
    return rankStudents(filtered, records, settings, date);
  }, [groupStudents, query, records, settings, date]);

  const chartData = ranked.map((student) => ({
    name: student.name.split(" ")[0],
    coin: student.coins,
    score: student.finalScore
  }));
  const totalCoins = ranked.reduce((sum, student) => sum + student.coins, 0);
  const averageScore = ranked.length ? Math.round(ranked.reduce((sum, student) => sum + student.finalScore, 0) / ranked.length) : 0;
  const previousMonthLeader = useMemo(
    () => getPeriodLeader(groupStudents, records, settings, getPreviousMonthRange(date)),
    [groupStudents, records, settings, date]
  );
  const previousWeekLeader = useMemo(
    () => getPeriodLeader(groupStudents.filter(s => s.id !== previousMonthLeader?.id), records, settings, getPreviousWeekRange(date)),
    [groupStudents, records, settings, date, previousMonthLeader]
  );

  const todayGroupRecords = useMemo(() => records.filter(r => r.date === date && groupStudents.some(s => s.id === r.studentId)), [records, date, groupStudents]);
  const alreadySpun = todayGroupRecords.some(r => r.dailyBonus);
  const [showBonusDrum, setShowBonusDrum] = useState(false);
  const [profileStudent, setProfileStudent] = useState(null);
  const [showComic, setShowComic] = useState(false);
  const [comicVersion, setComicVersion] = useState(0);

  const showComicButton = useMemo(() => {
    if (!currentGroup?.lessonEnd || !currentTime) return false;
    const [eh, em] = currentGroup.lessonEnd.split(":").map(Number);
    const [ch, cm] = currentTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (ch * 60 + cm);
    return diff > 0 && diff <= 30;
  }, [currentGroup, currentTime]);

  async function handleBonusReward(coins) {
    setShowBonusDrum(false);
    const isPenalty = coins === "minus_half";
    const updatedStudents = groupStudents.map(student => {
      const existingRecord = todayGroupRecords.find(r => r.studentId === student.id) || {};
      const currentCoins = Number(existingRecord.coinsEarned) || calculateCoins({
        homework: existingRecord.homework || 0,
        attendance: existingRecord.attendance || 0,
        activity: existingRecord.activity || 0
      }, settings);
      const bonus = isPenalty ? 0 : coins;
      return {
        ...student,
        homeworkScore: existingRecord.homework || 0,
        attendanceScore: existingRecord.attendance || 0,
        activityScore: existingRecord.activity || 0,
        coinsEarned: currentCoins,
        dailyBonus: bonus
      };
    });
    await saveLessonRecords({ date, settings, students: updatedStudents });
  }

  return (
    <div className="page-stack">
      <CurrentLessonBanner group={currentGroup} date={date} time={currentTime} />

      {selectedGroup && isLessonDay && !alreadySpun && (
        <section className="panel" style={{ padding: "16px" }}>
          <button
            className="primary-button"
            style={{ width: "100%", justifyContent: "center", padding: "16px", background: "linear-gradient(135deg, #eab308, #d97706)", fontSize: "16px", boxShadow: "0 4px 15px rgba(234, 179, 8, 0.4)", border: "none" }}
            onClick={() => setShowBonusDrum(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🎰</span>
              <span>Guruh uchun kunlik bonus barabanini aylantirish</span>
            </div>
          </button>
        </section>
      )}

      <section className="stats-grid">
        <StatCard icon={Users} label="O'quvchilar" value={ranked.length} hint={selectedGroup} />
        <StatCard icon={Coins} label="Jami coin" value={totalCoins} hint="tanlangan guruh" tone="gold" />
        <StatCard icon={BarChart3} label="O'rtacha score" value={`${averageScore}%`} hint="final formula" tone="cyan" />
        <StatCard icon={Medal} label="O'tgan hafta lideri" value={previousWeekLeader?.name.split(" ")[0] || "-"} hint={`${previousWeekLeader?.periodCoins || 0} coin`} tone="mint" />
        <StatCard icon={Trophy} label="O'tgan oy lideri" value={previousMonthLeader?.name.split(" ")[0] || "-"} hint={`${previousMonthLeader?.periodCoins || 0} coin`} tone="rose" />
      </section>

      <TimerPanel />

      {showComicButton && (
        <section className="panel" style={{ padding: "16px" }}>
          <button
            className="primary-button"
            style={{ width: "100%", justifyContent: "center", padding: "14px", background: "linear-gradient(135deg, #f59e0b, #d97706)", fontSize: "15px", border: "none", boxShadow: "0 4px 15px rgba(245,158,11,0.35)" }}
            onClick={() => setShowComic(true)}
          >
            <span style={{ fontSize: "18px" }}>📖</span>
            <span>Bugungi dars sahnasini yozish</span>
          </button>
        </section>
      )}

      <WeeklyComicPanel key={comicVersion} group={selectedGroup} date={date} />

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <PanelHeader icon={BarChart3} title="Guruh statistikasi" subtitle="Coin va final score taqqoslash" />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe3ef", borderRadius: 8, color: "#0f172a" }} />
                <Bar dataKey="coin" fill="#16a34a" radius={[6, 6, 0, 0]} animationDuration={280} />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={280} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="winner-panel">
          <div className="winner-icon">
            <Medal size={28} />
          </div>
          <span>Oldingi davr g'oliblari</span>
          <div className="winner-list">
            <div>
              <p>O'tgan hafta</p>
              <h3>{previousWeekLeader?.name || "Hali ma'lumot yo'q"}</h3>
              <strong>{previousWeekLeader?.periodCoins || 0} coin</strong>
            </div>
            <div>
              <p>O'tgan oy</p>
              <h3>{previousMonthLeader?.name || "Hali ma'lumot yo'q"}</h3>
              <strong>{previousMonthLeader?.periodCoins || 0} coin</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel">
        <PanelHeader icon={Users} title="O'quvchilar" subtitle="Foizlarni o'zgartirsangiz rank avtomatik yangilanadi" />
        {!selectedGroup && <EmptyState title="Hali guruh yo'q" text="Guruhlar sahifasidan birinchi guruhingizni qo'shing." />}
        {selectedGroup && !ranked.length && <EmptyState title="Bu guruhda o'quvchi yo'q" text="Guruhlar sahifasidan o'quvchi qo'shing." />}
        {!!ranked.length && (
          <div className="student-grid">
            {ranked.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                index={index}
                onEdit={onEditStudent}
                onDelete={onDeleteStudent}
                date={date}
                records={records}
                settings={settings}
                saveLessonRecords={saveLessonRecords}
                onProfile={setProfileStudent}
                isLessonDay={isLessonDay}
                onWarningReset={(studentId, newIgnoredDates) => updateStudent(studentId, { ignoredZeroDates: newIgnoredDates })}
                onUpdateStudent={updateStudent}
                weeklyWinner={weeklyWinner}
                monthlyWinner={monthlyWinner}
                hideGifts={true}
              />
            ))}
          </div>
        )}
      </section>

      {showBonusDrum && (
        <FunModal onClose={() => setShowBonusDrum(false)}>
          <BonusDrumModal onReward={handleBonusReward} onClose={() => setShowBonusDrum(false)} />
        </FunModal>
      )}

      {showComic && (
        <ComicEntryModal
          group={selectedGroup}
          date={date}
          onClose={() => setShowComic(false)}
          onSaved={() => setComicVersion(v => v + 1)}
        />
      )}

      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          records={records}
          settings={settings}
          groups={groups}
          onClose={() => setProfileStudent(null)}
        />
      )}
    </div>
  );
}
