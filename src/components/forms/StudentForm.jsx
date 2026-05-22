import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { scoreFields } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { numberInputValue, parsePercentInput } from "../../lib/utils";

export function StudentForm({ groups, initialData, onSubmit, selectedGroup, onSaved }) {
  const { t } = useT();
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
          ? "Firebase ruxsat bermadi."
          : `${t.sform_add}: ${submitError?.message || ""}`
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
        <strong>{initialData ? t.sform_edit : t.sform_add}</strong>
      </div>
      <label>
        <span>{t.sform_name}</span>
        <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder={t.sform_name_ph} required />
      </label>
      <label>
        <span>{t.sform_group}</span>
        <select value={form.group} onChange={(event) => update("group", event.target.value)} required disabled={!groups.length}>
          {!groups.length && <option value="">{t.sform_no_groups}</option>}
          {groups.map((group) => (
            <option key={group.id} value={group.name}>{group.name}</option>
          ))}
        </select>
      </label>
      <div className="form-score-grid">
        {scoreFields.map((field) => (
          <label key={field.key}>
            <span>{field.short}</span>
            <input type="number" inputMode="numeric" min="0" max="100" value={numberInputValue(form[field.key])} onChange={(event) => update(field.key, parsePercentInput(event.target.value))} />
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={!groups.length || saving}>
        {saving ? <Loader2 size={16} className="spinner" /> : <UserPlus size={16} />}
        {saving ? t.sform_saving : initialData ? t.sform_save : t.sform_submit_add}
      </button>
    </form>
  );
}
