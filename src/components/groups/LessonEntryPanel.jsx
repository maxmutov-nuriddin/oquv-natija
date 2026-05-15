import { useEffect, useState } from "react";
import { BookOpenCheck, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { scoreFields } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { cx, initials, numberInputValue, parsePercentInput } from "../../lib/utils";
import { EmptyState } from "../ui/EmptyState";
import { PanelHeader } from "../ui/PanelHeader";

export function LessonEntryPanel({ group, students, records, date, currentTime, settings, saveLessonRecords }) {
  const { t } = useT();
  const [entries, setEntries] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const selectedWeekday = new Date(date + "T00:00:00").getDay();
  const dayLabel = t.weekday_short[selectedWeekday] || "";
  const isLessonDay = Boolean(group?.weekdays?.includes(selectedWeekday));
  const isLessonOver = Boolean(group?.lessonEnd && isLessonDay && currentTime >= group.lessonEnd);
  const isRecordSaved = students.length > 0 && students.some(s => records.some(r => r.studentId === s.id && r.date === date));
  const locked = isRecordSaved && !isUnlocked;

  // Clear stale message and unlock state when switching groups
  useEffect(() => {
    setMessage("");
    setIsUnlocked(false);
  }, [group?.id, date]);

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
    setEntries((current) => {
      const entry = current[studentId] || {};
      const parsed = parsePercentInput(value);
      const updated = { ...entry, [key]: parsed };
      // sinf ishi yoki uy ishi o'zgarganda aktivlikni avtomatik hisoblash
      if (key === "attendanceScore" || key === "homeworkScore") {
        const att = key === "attendanceScore" ? parsed : (entry.attendanceScore || 0);
        const hw  = key === "homeworkScore"   ? parsed : (entry.homeworkScore  || 0);
        updated.activityScore = (att > 0 || hw > 0) ? Math.round(att * 0.7 + hw * 0.3) : 0;
      }
      return { ...current, [studentId]: updated };
    });
  }

  function markPresent(studentId, isPresent) {
    setEntries((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        attendanceScore: isPresent ? 100 : 0,
        activityScore: isPresent ? 100 : 0
      }
    }));
  }

  function markAllPresent() {
    setEntries((current) => {
      const next = {};
      students.forEach((s) => {
        next[s.id] = { ...(current[s.id] || {}), attendanceScore: 100, activityScore: 100 };
      });
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const studentsWithScores = students.map(student => ({ ...student, ...entries[student.id] }));
    try {
      await saveLessonRecords({ date, settings, students: studentsWithScores });
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
      {!isLessonDay && !isRecordSaved && <p className="lesson-warning">{t.lesson_not_day}</p>}
      {isLessonOver && !isRecordSaved && (
        <p className="lesson-warning" style={{ background: "#fef3c7", color: "#92400e", borderColor: "#fcd34d", fontWeight: 600 }}>
          {t.lesson_over}
        </p>
      )}
      {isRecordSaved && !isUnlocked && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
          <span style={{ flex: 1 }}>🔒 Natijalar saqlandi va qulflandi</span>
          <button
            type="button"
            className="secondary-button"
            style={{ padding: "5px 12px", fontSize: "12px", flexShrink: 0, background: "white", color: "#15803d", borderColor: "#86efac" }}
            onClick={() => setIsUnlocked(true)}
          >
            <Pencil size={13} />
            Tahrirlash
          </button>
        </div>
      )}
      {!students.length && <EmptyState title={t.lesson_no_students_title} text={t.lesson_no_students_text} />}
      {!!students.length && (
        <form onSubmit={submit}>
          {!locked && isLessonDay && !isLessonOver && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={markAllPresent}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                ✓ Hammasi keldi
              </button>
            </div>
          )}
          <div className="lesson-table-scroll">
          <div className="lesson-table">
            <div className="lesson-table-head">
              <span>{t.lesson_col_student}</span>
              <span>{t.lesson_col_hw}</span>
              <span>{t.lesson_col_att}</span>
            </div>
            {students.map((student) => {
              const isPresent = (entries[student.id]?.attendanceScore || 0) > 0;
              return (
                <div className="lesson-row" key={student.id}>
                  <div className="lesson-student">
                    <div className="avatar avatar-small">{initials(student.name)}</div>
                    <strong>{student.name}</strong>
                    {!locked && isLessonDay && !isLessonOver && (
                      <button
                        type="button"
                        onClick={() => markPresent(student.id, !isPresent)}
                        title={isPresent ? "Kelmadi deb belgilash" : "Keldi deb belgilash"}
                        style={{
                          marginLeft: "auto",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "32px", height: "32px", borderRadius: "50%", border: "2px solid",
                          cursor: "pointer", flexShrink: 0, fontSize: "15px", fontWeight: 900,
                          background: isPresent ? "#dcfce7" : "#fee2e2",
                          borderColor: isPresent ? "#16a34a" : "#dc2626",
                          color: isPresent ? "#16a34a" : "#dc2626"
                        }}
                      >
                        {isPresent ? "✓" : "✗"}
                      </button>
                    )}
                  </div>
                  {scoreFields.filter(f => f.key !== "activityScore").map((field) => (
                    <input
                      key={field.key}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      disabled={!isLessonDay || isLessonOver || locked}
                      value={numberInputValue(entries[student.id]?.[field.key])}
                      onChange={(event) => {
                        const raw = Number(event.target.value);
                        if (event.target.value !== "" && raw > 100) { event.target.value = "100"; }
                        update(student.id, field.key, event.target.value);
                      }}
                      onBlur={(event) => {
                        const raw = Number(event.target.value);
                        const rounded = isNaN(raw) || event.target.value === "" ? 0 : Math.min(100, Math.round(raw));
                        event.target.value = String(rounded);
                        update(student.id, field.key, rounded);
                      }}
                      aria-label={`${student.name} ${field.label}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          </div>
          <div style={{ position: "sticky", bottom: "16px", zIndex: 10, marginTop: "16px", padding: "12px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
            {message && <p className={cx("lesson-message", message.startsWith(t.lesson_error) && "lesson-message-error")} style={{ marginTop: 0, marginBottom: "12px" }}>{message}</p>}
            <button className="primary-button save-button" type="submit" disabled={saving || !isLessonDay || isLessonOver || locked} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
              {saving ? t.lesson_saving : t.lesson_save}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
