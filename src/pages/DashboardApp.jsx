import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useT } from "../i18n/index.jsx";
import { groupForDateTime } from "../lib/scoring";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { StudentForm } from "../components/forms/StudentForm";
import { Modal } from "../components/ui/Modal";
import { LoadingState } from "../components/ui/LoadingState";
import { DashboardPage } from "./DashboardPage";
import { GroupsPage } from "./GroupsPage";
import { PrivilegesPage } from "./PrivilegesPage";
import { SettingsPage } from "./SettingsPage";

export function DashboardApp({ teacher, logout, updateProfile, changePassword }) {
  const { t } = useT();
  const { students, groups, records, settings, loading, error, isDemo, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, saveLessonRecords, deleteStudent, saveSettings } =
    useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm"));
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(dayjs().format("HH:mm")), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const currentGroup = useMemo(() => groupForDateTime(groups, date, currentTime), [groups, date, currentTime]);
  const automaticGroup = currentGroup?.name || "";
  const [manualGroup, setManualGroup] = useState("");
  const selectedGroup = manualGroup || automaticGroup;
  const [editingStudent, setEditingStudent] = useState(null);

  async function handleDeleteStudent(student) {
    if (!window.confirm(t.app_delete_confirm(student.name))) return;
    await deleteStudent(student.id);
  }

  return (
    <div className="app-bg">
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} isDemo={isDemo} teacher={teacher} logout={logout} />
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
          {!loading && activePage === "dashboard" && (
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
            />
          )}
          {!loading && activePage === "groups" && (
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
          {!loading && activePage === "settings" && (
            <SettingsPage
              settings={settings}
              saveSettings={saveSettings}
              teacher={teacher}
              updateProfile={updateProfile}
              changePassword={changePassword}
            />
          )}
          {!loading && activePage === "privileges" && <PrivilegesPage />}
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
