import { useEffect, useRef, useState } from "react";
import { BookOpenCheck, CheckCircle2, Loader2, Send } from "lucide-react";
import { scoreFields } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { sendLessonReport } from "../../lib/telegram";
import { cx, initials, numberInputValue, parsePercentInput } from "../../lib/utils";
import { EmptyState } from "../ui/EmptyState";
import { PanelHeader } from "../ui/PanelHeader";

export function LessonEntryPanel({ group, students, records, date, currentTime, settings, saveLessonRecords }) {
  const { t } = useT();
  const [entries, setEntries] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [tgStatus, setTgStatus] = useState("");
  const selectedWeekday = new Date(date + "T00:00:00").getDay();
  const dayLabel = t.weekday_short[selectedWeekday] || "";
  const isLessonDay = Boolean(group?.weekdays?.includes(selectedWeekday));
  const isLessonOver = Boolean(group?.lessonEnd && isLessonDay && currentTime >= group.lessonEnd);

  // Refs so callbacks always read latest values without causing re-runs
  const entriesRef = useRef(entries);
  useEffect(() => { entriesRef.current = entries; }, [entries]);
  const studentsRef = useRef(students);
  useEffect(() => { studentsRef.current = students; }, [students]);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const prevTimeRef  = useRef(currentTime);
  const autoSavedRef = useRef(""); // "groupId-date" of last auto-save

  // Stable auto-save callback — reassigned every render so always uses fresh closure values
  const doAutoSaveRef = useRef(null);
  doAutoSaveRef.current = () => {
    if (!group?.lessonEnd || !isLessonDay) return;
    const saveKey = `${group.id || group.name}-${date}`;
    if (autoSavedRef.current === saveKey) return;
    autoSavedRef.current = saveKey;
    const s = settingsRef.current;
    const studentsWithScores = studentsRef.current.map(st => ({ ...st, ...entriesRef.current[st.id] }));
    saveLessonRecords({ date, settings: s, students: studentsWithScores })
      .then(() => {
        setMessage(t.lesson_auto_saved);
        if (group?.telegramChatId && s?.telegramBotToken) {
          sendLessonReport({ group, students: studentsWithScores, date, settings: s })
            .then(() => setTgStatus(t.tg_sent))
            .catch(err => setTgStatus(`${t.tg_fail} ${err.message}`));
        }
      })
      .catch(err => {
        autoSavedRef.current = ""; // allow retry on next tick
        setMessage(`${t.lesson_error} ${err?.message || ""}`);
      });
  };

  // Auto-save when currentTime crosses group.lessonEnd
  useEffect(() => {
    const prev = prevTimeRef.current;
    prevTimeRef.current = currentTime;
    if (!currentTime || !group?.lessonEnd || !isLessonDay) return;
    if (prev < group.lessonEnd && currentTime >= group.lessonEnd) {
      doAutoSaveRef.current();
    }
  }, [currentTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save if lesson was already over when page loaded or group/date changed.
  // 200ms delay lets the entries-init effect populate entriesRef first.
  useEffect(() => {
    if (!currentTime || !group?.lessonEnd || !isLessonDay) return;
    if (currentTime < group.lessonEnd) return;
    const timer = setTimeout(() => doAutoSaveRef.current(), 200);
    return () => clearTimeout(timer);
  }, [group?.id, date]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setTgStatus("");
    setSaving(true);
    const studentsWithScores = students.map(student => ({ ...student, ...entries[student.id] }));
    try {
      await saveLessonRecords({ date, settings, students: studentsWithScores });
      setMessage(t.lesson_saved);
      if (group?.telegramChatId && settings?.telegramBotToken) {
        sendLessonReport({ group, students: studentsWithScores, date, settings })
          .then(() => setTgStatus(t.tg_sent))
          .catch(err => setTgStatus(`${t.tg_fail} ${err.message}`));
      }
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
      {isLessonOver && (
        <p className="lesson-warning" style={{ background: "#fef3c7", color: "#92400e", borderColor: "#fcd34d", fontWeight: 600 }}>
          {t.lesson_over}
        </p>
      )}
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
                    disabled={!isLessonDay || isLessonOver}
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
            {tgStatus && (
              <p style={{ margin: "0 0 10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: tgStatus.startsWith(t.tg_fail) ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                <Send size={14} />
                {tgStatus}
              </p>
            )}
            <button className="primary-button save-button" type="submit" disabled={saving || !isLessonDay || isLessonOver} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
              {saving ? t.lesson_saving : t.lesson_save}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
