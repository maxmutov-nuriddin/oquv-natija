import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { lessonStartOptions } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { cx, addLessonDuration, isValidLessonTime } from "../../lib/utils";

const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

export function GroupForm({ initialData, onSubmit, onSaved }) {
  const { t } = useT();
  const [name, setName] = useState(initialData?.name || "");
  const [weekdays, setWeekdays] = useState(initialData?.weekdays || []);
  const [lessonStart, setLessonStart] = useState(initialData?.lessonStart || "");
  const [timeError, setTimeError] = useState("");
  const [saving, setSaving] = useState(false);
  const lessonEnd = addLessonDuration(lessonStart);

  async function submit(event) {
    event.preventDefault();
    if (!weekdays.length) { setTimeError(t.gform_err_days); return; }
    if (!isValidLessonTime(lessonStart)) { setTimeError(t.gform_err_time); return; }
    if (!lessonEnd || lessonEnd > "20:00") { setTimeError(t.gform_err_end); return; }
    setTimeError("");
    setSaving(true);
    try {
      await onSubmit({ name, weekdays, lessonStart, lessonEnd });
      if (!initialData) { setName(""); setWeekdays([]); setLessonStart(""); }
      onSaved?.();
    } catch (error) {
      setTimeError(
        error?.code === "permission-denied"
          ? "Firebase ruxsat bermadi."
          : `${t.gform_add}: ${error?.message || ""}`
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day) {
    setWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <div className="entry-form-head">
        <Plus size={18} />
        <strong>{initialData ? t.gform_edit : t.gform_add}</strong>
      </div>
      <label>
        <span>{t.gform_name}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t.gform_name_ph} required />
      </label>
      <div className="weekday-picker" aria-label={t.gform_name}>
        {WEEKDAY_VALUES.map((val, i) => (
          <button
            key={val}
            type="button"
            className={cx(weekdays.includes(val) && "weekday-active")}
            onClick={() => toggleDay(val)}
          >
            {t.weekday_picker[i]}
          </button>
        ))}
      </div>
      <div className="time-grid">
        <label>
          <span>{t.gform_start}</span>
          <select value={lessonStart} onChange={(event) => setLessonStart(event.target.value)} required>
            <option value="">{t.gform_select}</option>
            {lessonStartOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.gform_end}</span>
          <input value={lessonEnd || t.gform_auto} readOnly />
        </label>
      </div>
      {timeError && <p className="form-error">{timeError}</p>}
      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />}
        {saving ? t.gform_saving : initialData ? t.gform_save : t.gform_submit_add}
      </button>
    </form>
  );
}
