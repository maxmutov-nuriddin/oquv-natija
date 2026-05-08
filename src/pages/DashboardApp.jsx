import dayjs from "dayjs";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useT } from "../i18n/index.jsx";
import { groupForDateTime } from "../lib/scoring";
import { sendLessonReport } from "../lib/telegram";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { StudentForm } from "../components/forms/StudentForm";
import { Modal } from "../components/ui/Modal";
import { LoadingState } from "../components/ui/LoadingState";

const DashboardPage  = lazy(() => import("./DashboardPage").then(m => ({ default: m.DashboardPage })));
const GroupsPage     = lazy(() => import("./GroupsPage").then(m => ({ default: m.GroupsPage })));
const AnalyticsPage  = lazy(() => import("./AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const PrivilegesPage = lazy(() => import("./PrivilegesPage").then(m => ({ default: m.PrivilegesPage })));
const SettingsPage   = lazy(() => import("./SettingsPage").then(m => ({ default: m.SettingsPage })));

export function DashboardApp({ teacher, logout, updateProfile, changePassword }) {
  const { t } = useT();
  const { students, groups, records, settings, loading, error, isDemo, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, saveLessonRecords, deleteStudent, saveSettings } =
    useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm"));
  const [query, setQuery] = useState("");
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
  const [pendingScores, setPendingScores] = useState({});

  // Clear pending scores when switching group or date
  useEffect(() => { setPendingScores({}); }, [selectedGroup, date]);

  function handleScoreChange(studentId, key, value) {
    setPendingScores(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [key]: value }
    }));
  }

  async function handleDeleteStudent(student) {
    if (!window.confirm(t.app_delete_confirm(student.name))) return;
    await deleteStudent(student.id);
  }

  async function handleSendResults() {
    if (!currentGroup) return;
    const groupStudents = students.filter(s => s.group === currentGroup.name);
    const studentsWithScores = groupStudents.map(student => {
      const p = pendingScores[student.id];
      const record = records.find(r => r.studentId === student.id && r.date === date);
      return {
        ...student,
        homeworkScore: p?.homeworkScore ?? record?.homework ?? 0,
        attendanceScore: p?.attendanceScore ?? record?.attendance ?? 0,
        activityScore: p?.activityScore ?? record?.activity ?? 0,
      };
    });
    await saveLessonRecords({ date, settings, students: studentsWithScores });
    await sendLessonReport({ group: currentGroup, students: studentsWithScores, date, settings });
    setPendingScores({});
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
            query={query}
            setQuery={setQuery}
            selectedGroup={selectedGroup}
            groups={groups}
            setSelectedGroup={setManualGroup}
            currentGroup={currentGroup}
            currentTime={currentTime}
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
                  query={query}
                  onEditStudent={setEditingStudent}
                  onDeleteStudent={handleDeleteStudent}
                  saveLessonRecords={saveLessonRecords}
                  updateStudent={updateStudent}
                  pendingScores={pendingScores}
                  onScoreChange={handleScoreChange}
                />
              )}
              {activePage === "groups" && (
                <GroupsPage
                  groups={groups}
                  students={students}
                  records={records}
                  settings={settings}
                  date={date}
                  currentTime={currentTime}
                  query={query}
                  addGroup={addGroup}
                  updateGroup={updateGroup}
                  deleteGroup={deleteGroup}
                  addStudent={addStudent}
                  updateStudent={updateStudent}
                  saveLessonRecords={saveLessonRecords}
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
    </div>
  );
}
