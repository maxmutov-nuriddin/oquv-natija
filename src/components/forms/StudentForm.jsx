import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { scoreFields } from "../../constants";
import { numberInputValue, parsePercentInput } from "../../lib/utils";

export function StudentForm({ groups, initialData, onSubmit, selectedGroup, onSaved }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    group: initialData?.group || selectedGroup || groups[0]?.name || "",
    homeworkScore: initialData?.homeworkScore || 0,
    attendanceScore: initialData?.attendanceScore || 0,
    activityScore: initialData?.activityScore || 0
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.group && (selectedGroup || groups[0]?.name)) {
      setForm((current) => ({ ...current, group: selectedGroup || groups[0]?.name || "" }));
    }
  }, [groups, selectedGroup, form.group]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
      if (!initialData) {
        setForm((current) => ({ ...current, name: "", homeworkScore: 0, attendanceScore: 0, activityScore: 0 }));
      }
      onSaved?.();
    } catch (submitError) {
      setError(
        submitError?.code === "permission-denied"
          ? "Firebase ruxsat bermadi. Firestore rules yoki Anonymous Auth sozlamasini tekshiring."
          : `O'quvchi qo'shilmadi: ${submitError?.message || "noma'lum xato"}`
      );
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <div className="entry-form-head">
        <UserPlus size={18} />
        <strong>{initialData ? "O'quvchini tahrirlash" : "O'quvchi qo'shish"}</strong>
      </div>
      <label>
        <span>Ism familiya</span>
        <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="O'quvchi ismi" required />
      </label>
      <label>
        <span>Guruh</span>
        <select value={form.group} onChange={(event) => update("group", event.target.value)} required disabled={!groups.length}>
          {!groups.length && <option value="">Avval guruh qo'shing</option>}
          {groups.map((group) => (
            <option key={group.id} value={group.name}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-score-grid">
        {scoreFields.map((field) => (
          <label key={field.key}>
            <span>{field.short}</span>
            <input type="number" min="0" max="100" value={numberInputValue(form[field.key])} onChange={(event) => update(field.key, parsePercentInput(event.target.value))} />
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={!groups.length || saving}>
        {saving ? <Loader2 size={16} className="spinner" /> : <UserPlus size={16} />}
        {saving ? "Saqlanmoqda..." : initialData ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}
