import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { privilegesData } from "../../constants";

export function BuyGiftModal({ groups, students, onBuy, initialGroup }) {
  const [form, setForm] = useState({
    group: initialGroup || groups[0]?.name || "",
    studentId: "",
    giftName: "",
    count: 1
  });

  const groupStudents = students.filter(s => s.group === form.group);
  const isSenior = form.group.toLowerCase().includes("senior");
  const isJunior = form.group.toLowerCase().includes("junior");
  const privilegeList = isSenior ? privilegesData.senior : (isJunior ? privilegesData.junior : privilegesData.junior);

  function update(key, value) {
    if (key === "group") {
      setForm(curr => ({ ...curr, group: value, studentId: "", giftName: "" }));
    } else {
      setForm(curr => ({ ...curr, [key]: value }));
    }
  }

  return (
    <form className="entry-form" onSubmit={(e) => { e.preventDefault(); onBuy(form); }}>
      <label>
        <span>Guruh</span>
        <select value={form.group} onChange={(e) => update("group", e.target.value)}>
          {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
      </label>
      <label>
        <span>O'quvchi</span>
        <select value={form.studentId} onChange={(e) => update("studentId", e.target.value)} required>
          <option value="">Tanlang</option>
          {groupStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label>
        <span>Sovg'a / Privelegiya nomi</span>
        <select value={form.giftName} onChange={(e) => update("giftName", e.target.value)} required>
          <option value="">Tanlang</option>
          {privilegeList.map(p => <option key={p.id} value={p.name}>{p.name} ({p.price} coin)</option>)}
        </select>
      </label>
      <label>
        <span>Soni</span>
        <input type="number" min="1" value={form.count} onChange={(e) => update("count", parseInt(e.target.value) || 1)} />
      </label>
      <button className="primary-button" type="submit">
        <CheckCircle2 size={18} />
        Sotib olish / Qo'shish
      </button>
    </form>
  );
}
