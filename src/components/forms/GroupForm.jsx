import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { weekDays, lessonStartOptions } from "../../constants";
import { cx, addLessonDuration, isValidLessonTime } from "../../lib/utils";

export function GroupForm({ initialData, onSubmit, onSaved }) {
  const [name, setName] = useState(initialData?.name || "");
  const [weekdays, setWeekdays] = useState(initialData?.weekdays || []);
  const [lessonStart, setLessonStart] = useState(initialData?.lessonStart || "");
  const [timeError, setTimeError] = useState("");
  const [saving, setSaving] = useState(false);
  const lessonEnd = addLessonDuration(lessonStart);

  async function submit(event) {
    event.preventDefault();
    if (!weekdays.length) {
      setTimeError("Kamida bitta dars kunini tanlang.");
      return;
    }
    if (!isValidLessonTime(lessonStart)) {
      setTimeError("Boshlanish vaqti 09:00 dan 20:00 gacha, daqiqa faqat 00 yoki 30 bo'lishi kerak.");
      return;
    }
    if (!lessonEnd || lessonEnd > "20:00") {
      setTimeError("Dars 1 soat 30 daqiqa bo'lgani uchun eng kech boshlanish 18:30 bo'lishi kerak.");
      return;
    }
    setTimeError("");
    setSaving(true);
    try {
      await onSubmit({ name, weekdays, lessonStart, lessonEnd });
      if (!initialData) {
        setName("");
        setWeekdays([]);
        setLessonStart("");
      }
      onSaved?.();
    } catch (error) {
      setTimeError(
        error?.code === "permission-denied"
          ? "Firebase ruxsat bermadi. Firestore rules yoki Anonymous Auth sozlamasini tekshiring."
          : `Guruh qo'shilmadi: ${error?.message || "noma'lum xato"}`
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
        <strong>{initialData ? "Guruhni tahrirlash" : "Guruh qo'shish"}</strong>
      </div>
      <label>
        <span>Guruh nomi</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: IELTS A" required />
      </label>
      <div className="weekday-picker" aria-label="Dars kunlari">
        {weekDays.map((day) => (
          <button
            key={day.value}
            type="button"
            className={cx(weekdays.includes(day.value) && "weekday-active")}
            onClick={() => toggleDay(day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>
      <div className="time-grid">
        <label>
          <span>Boshlanish</span>
          <select value={lessonStart} onChange={(event) => setLessonStart(event.target.value)} required>
            <option value="">Tanlang</option>
            {lessonStartOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tugash</span>
          <input value={lessonEnd || "Avto"} readOnly />
        </label>
      </div>
      {timeError && <p className="form-error">{timeError}</p>}
      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />}
        {saving ? "Saqlanmoqda..." : initialData ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}
