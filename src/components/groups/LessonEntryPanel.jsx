import { useEffect, useState } from "react";
import { BookOpenCheck, CheckCircle2, Loader2 } from "lucide-react";
import { scoreFields } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { cx, initials, numberInputValue, parsePercentInput } from "../../lib/utils";
import { EmptyState } from "../ui/EmptyState";
import { PanelHeader } from "../ui/PanelHeader";

export function LessonEntryPanel({ group, students, records, date, settings, saveLessonRecords }) {
  const { t } = useT();
  const [entries, setEntries] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedWeekday = new Date(date + "T00:00:00").getDay();
  const dayLabel = t.weekday_short[selectedWeekday] || "";
  const isLessonDay = Boolean(group?.weekdays?.includes(selectedWeekday));

  useEffect(() => {
    const nextEntries = {};
    students.forEach((student) => {
      const record = records.find((item) => item.studentId === student.id && item.date === date);
      nextEntries[student.id] = {
        homeworkScore: record ? record.homework : 0,
        attendanceScore: record ? record.attendance : 0,
        activityScore: record ? record.activity : 0
      };
    });
    setEntries((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextEntries);
      const sameLength = currentKeys.length === nextKeys.length;
      const sameValues = sameLength && nextKeys.every((studentId) => {
        const c = current[studentId];
        const n = nextEntries[studentId];
        return c && c.homeworkScore === n.homeworkScore && c.attendanceScore === n.attendanceScore && c.activityScore === n.activityScore;
      });
      return sameValues ? current : nextEntries;
    });
  }, [students, records, date]);

  function update(studentId, key, value) {
    setEntries((current) => ({
      ...current,
      [studentId]: { ...current[studentId], [key]: parsePercentInput(value) }
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await saveLessonRecords({ date, settings, students: students.map((student) => ({ ...student, ...entries[student.id] })) });
      setMessage(t.lesson_saved);
    } catch (error) {
      setMessage(`${t.lesson_error} ${error?.message || ""}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel lesson-panel">
      <PanelHeader
        icon={BookOpenCheck}
        title={t.lesson_title}
        subtitle={`${dayLabel} · ${group?.lessonStart || "--:--"} - ${group?.lessonEnd || "--:--"}`}
      />
      {!isLessonDay && <p className="lesson-warning">{t.lesson_not_day}</p>}
      {!students.length && <EmptyState title={t.lesson_no_students_title} text={t.lesson_no_students_text} />}
      {!!students.length && (
        <form onSubmit={submit}>
          <div className="lesson-table">
            <div className="lesson-table-head">
              <span>{t.lesson_col_student}</span>
              <span>{t.lesson_col_hw}</span>
              <span>{t.lesson_col_att}</span>
              <span>{t.lesson_col_act}</span>
            </div>
            {students.map((student) => (
              <div className="lesson-row" key={student.id}>
                <div className="lesson-student">
                  <div className="avatar avatar-small">{initials(student.name)}</div>
                  <strong>{student.name}</strong>
                </div>
                {scoreFields.map((field) => (
                  <input
                    key={field.key}
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isLessonDay}
                    value={numberInputValue(entries[student.id]?.[field.key])}
                    onChange={(event) => update(student.id, field.key, event.target.value)}
                    aria-label={`${student.name} ${field.label}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ position: "sticky", bottom: "16px", zIndex: 10, marginTop: "16px", padding: "12px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
            {message && <p className={cx("lesson-message", message.startsWith(t.lesson_error) && "lesson-message-error")} style={{ marginTop: 0, marginBottom: "12px" }}>{message}</p>}
            <button className="primary-button save-button" type="submit" disabled={saving || !isLessonDay} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
              {saving ? t.lesson_saving : t.lesson_save}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
