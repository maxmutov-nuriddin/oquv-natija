import { useState } from "react";

export function GiftCoinModal({ activeGroupStudents, activeGiftCoin, onConfirm }) {
  const [selectedStudent, setSelectedStudent] = useState("");

  const availableStudents = activeGroupStudents.filter(s => s.id !== activeGiftCoin.studentId);

  return (
    <form className="entry-form" onSubmit={(e) => { e.preventDefault(); onConfirm(selectedStudent, activeGiftCoin); }}>
      <label>
        <span>Kimga sovg'a qilasiz?</span>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
          <option value="">O'quvchini tanlang</option>
          {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <button className="primary-button" type="submit">Tasdiqlash</button>
    </form>
  );
}
