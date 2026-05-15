import dayjs from "dayjs";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useT } from "../i18n/index.jsx";
import { getCurrentWeekRange, groupForDateTime } from "../lib/scoring";
import { BATTLE_BOSS_PRESETS, BATTLE_HP_OPTIONS, BATTLE_REWARD_OPTIONS, BATTLE_STAKE_OPTIONS } from "../constants";
import { sendLessonReport } from "../lib/telegram";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { StudentForm } from "../components/forms/StudentForm";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Modal } from "../components/ui/Modal";
import { LoadingState } from "../components/ui/LoadingState";

const DashboardPage  = lazy(() => import("./DashboardPage").then(m => ({ default: m.DashboardPage })));
const GroupsPage     = lazy(() => import("./GroupsPage").then(m => ({ default: m.GroupsPage })));
const AnalyticsPage  = lazy(() => import("./AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const PrivilegesPage = lazy(() => import("./PrivilegesPage").then(m => ({ default: m.PrivilegesPage })));
const SettingsPage   = lazy(() => import("./SettingsPage").then(m => ({ default: m.SettingsPage })));

export function DashboardApp({ teacher, logout, updateProfile, changePassword, register, restoreDataFromUid }) {
  const { t } = useT();
  const { students, groups, records, settings, loading, error, isDemo, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, saveLessonRecords, deleteStudent, saveSettings } =
    useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(dayjs().format("HH:mm")), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const currentGroup = useMemo(() => groupForDateTime(groups, date, currentTime), [groups, date, currentTime]);
  const automaticGroup = currentGroup?.name || "";
  const [manualGroup, setManualGroup] = useState("");
  const selectedGroup = manualGroup || automaticGroup;
  const [editingStudent, setEditingStudent] = useState(null);
  const [lessonLocked, setLessonLocked] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { setLessonLocked(false); }, [selectedGroup, date]);

  const randomizeAllGroupBattles = useCallback(async (currentSettings) => {
    if (!groups?.length) return;
    const weekKey = getCurrentWeekRange(dayjs()).start.format("YYYY-MM-DD");
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const assignments = {};
    groups.forEach(g => { assignments[g.id] = { type: "none" }; });

    const isSeniorGroup = g => g.name.toLowerCase().includes("senior");
    const pairGroups = list => {
      const sh = [...list].sort(() => Math.random() - 0.5);
      for (let i = 0; i + 1 < sh.length; i += 2) {
        if (Math.random() < 0.5) {
          const g1 = sh[i], g2 = sh[i + 1];
          const reward = pick(BATTLE_REWARD_OPTIONS);
          assignments[g1.id] = { type: "match", opponentName: g2.name, reward };
          assignments[g2.id] = { type: "match", opponentName: g1.name, reward };
        }
      }
    };
    pairGroups(groups.filter(isSeniorGroup));
    pairGroups(groups.filter(g => !isSeniorGroup(g)));

    groups.forEach(group => {
      if (assignments[group.id].type !== "none") return;
      const clans = group.clans || [];
      const battleType = clans.length >= 2 ? pick(["boss", "clan"]) : "boss";
      if (battleType === "boss") {
        const preset = pick(BATTLE_BOSS_PRESETS);
        assignments[group.id] = { type: "boss", preset, maxHp: pick(BATTLE_HP_OPTIONS), reward: pick(BATTLE_REWARD_OPTIONS) };
      } else {
        const sh = [...clans].sort(() => Math.random() - 0.5);
        assignments[group.id] = { type: "clan", clan1Id: sh[0].id, clan2Id: sh[1].id, stake: pick(BATTLE_STAKE_OPTIONS) };
      }
    });

    // Race condition fix: await all group updates before saving weekKey
    await Promise.all(groups.map(group => {
      const a = assignments[group.id];
      if (a.type === "match")
        return updateGroup(group.id, { activeBoss: null, clanBattles: [], activeMatch: { opponentGroupName: a.opponentName, weekKey, reward: a.reward } });
      if (a.type === "boss")
        return updateGroup(group.id, { activeMatch: null, clanBattles: [], activeBoss: { name: a.preset.name, emoji: a.preset.emoji, maxHp: a.maxHp, reward: a.reward, weekKey, createdAt: date } });
      if (a.type === "clan")
        return updateGroup(group.id, { activeBoss: null, activeMatch: null, clanBattles: [{ id: crypto.randomUUID(), clan1Id: a.clan1Id, clan2Id: a.clan2Id, stake: a.stake, weekKey }] });
      return updateGroup(group.id, { activeBoss: null, activeMatch: null, clanBattles: [] });
    }));

    await saveSettings({ ...(currentSettings ?? settings), battleRandomWeekKey: weekKey });
  }, [groups, date, updateGroup, saveSettings]);

  useEffect(() => {
    if (!settings?.battleRandomWeekly || !groups?.length || !saveSettings) return;
    const weekKey = getCurrentWeekRange(dayjs()).start.format("YYYY-MM-DD");
    if (settings.battleRandomWeekKey === weekKey) return;
    if (!settings.battleRandomWeekKey && dayjs().day() !== 1) {
      saveSettings({ ...settings, battleRandomWeekKey: weekKey });
      return;
    }
    randomizeAllGroupBattles(settings);
  }, [settings?.battleRandomWeekly, settings?.battleRandomWeekKey, groups?.length]);

  function handleDeleteStudent(student) {
    setDeleteConfirm({
      message: t.app_delete_confirm(student.name),
      onOk: async () => { await deleteStudent(student.id); setDeleteConfirm(null); },
    });
  }

  async function handleSendResults() {
    const targetGroup = groups.find((group) => group.name === selectedGroup);
    if (!targetGroup) return;
    setLessonLocked(true);
    const groupStudents = students.filter(s => s.group === targetGroup.name);
    const studentsWithScores = groupStudents.map(student => {
      const record = records.find(r => r.studentId === student.id && r.date === date);
      const ignoredZeroDates = student.ignoredZeroDates || [];
      const missCount = records.filter(r =>
        r.studentId === student.id &&
        r.homework === 0 &&
        (r.attendance > 0 || r.activity > 0) &&
        !ignoredZeroDates.includes(r.date)
      ).length;
      return {
        ...student,
        homeworkScore: record?.homework ?? 0,
        attendanceScore: record?.attendance ?? 0,
        activityScore: record?.activity ?? 0,
        missCount,
      };
    });
    await sendLessonReport({ group: targetGroup, students: studentsWithScores, date, settings });
  }

  return (
    <div className="app-bg">
      <div className="app-shell">
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => { setActivePage(page); setSidebarOpen(false); }}
          isDemo={isDemo}
          teacher={teacher}
          logout={logout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <main className="main-content">
          <Topbar
            activePage={activePage}
            date={date}
            setDate={(value) => { setDate(value); setManualGroup(""); }}
            selectedGroup={selectedGroup}
            groups={groups}
            setSelectedGroup={setManualGroup}
            onSendResults={handleSendResults}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {loading && <LoadingState />}
          {!loading && error && (
            <div className="panel error-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span>{error}</span>
              {error.includes("Login") && (
                <button className="primary-button" onClick={logout} style={{ flexShrink: 0 }}>
                  Tizimga kirish
                </button>
              )}
            </div>
          )}
          {!loading && (
            <Suspense fallback={<LoadingState />}>
              {activePage === "dashboard" && (
                <DashboardPage
                  groups={groups}
                  students={students}
                  records={records}
                  settings={settings}
                  selectedGroup={selectedGroup}
                  currentGroup={currentGroup}
                  currentTime={currentTime}
                  date={date}
                  onEditStudent={setEditingStudent}
                  onDeleteStudent={handleDeleteStudent}
                  saveLessonRecords={saveLessonRecords}
                  updateStudent={updateStudent}
                  updateGroup={updateGroup}
                  isLessonLocked={lessonLocked}
                  onUnlock={() => setLessonLocked(false)}
                />
              )}
              {activePage === "groups" && (
                <GroupsPage
                  groups={groups}
                  students={students}
                  records={records}
                  settings={settings}
                  date={date}
                  addGroup={addGroup}
                  updateGroup={updateGroup}
                  deleteGroup={deleteGroup}
                  addStudent={addStudent}
                  updateStudent={updateStudent}
                  deleteStudent={handleDeleteStudent}
                  selectedGroup={selectedGroup}
                  setDate={setDate}
                />
              )}
              {activePage === "analytics" && (
                <AnalyticsPage
                  groups={groups}
                  students={students}
                  records={records}
                  settings={settings}
                  date={date}
                />
              )}
              {activePage === "settings" && (
                <SettingsPage
                  settings={settings}
                  saveSettings={saveSettings}
                  teacher={teacher}
                  updateProfile={updateProfile}
                  changePassword={changePassword}
                  isDemo={isDemo}
                  register={register}
                  restoreDataFromUid={restoreDataFromUid}
                />
              )}
              {activePage === "privileges" && <PrivilegesPage />}
            </Suspense>
          )}
        </main>
      </div>

      {editingStudent && (
        <Modal title={t.app_edit_student} onClose={() => setEditingStudent(null)}>
          <StudentForm groups={groups} initialData={editingStudent} onSubmit={(values) => updateStudent(editingStudent.id, values)} onSaved={() => setEditingStudent(null)} />
        </Modal>
      )}
      {deleteConfirm && (
        <ConfirmModal
          message={deleteConfirm.message}
          danger
          onConfirm={deleteConfirm.onOk}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
