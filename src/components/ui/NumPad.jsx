import { useState } from "react";
import { Check, Delete } from "lucide-react";

export function NumPad({ studentName, label, initialValue, max = 100, onConfirm, onClose }) {
  const [raw, setRaw] = useState(String(initialValue ?? 0));

  function pressDigit(d) {
    setRaw(prev => {
      const next = prev === "0" ? String(d) : prev + String(d);
      return Number(next) > max ? prev : next;
    });
  }

  function pressBack() {
    setRaw(prev => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  }

  function confirm() {
    const val = Math.min(max, Math.max(0, Number(raw) || 0));
    onConfirm(val);
    onClose();
  }

  const display = raw === "" ? "0" : raw;

  return (
    <div className="numpad-overlay" onPointerDown={onClose}>
      <div className="numpad-sheet" onPointerDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="numpad-header">
          <div className="numpad-info">
            <span className="numpad-student">{studentName}</span>
            <span className="numpad-label">{label}</span>
          </div>
          <div className="numpad-display">
            <span className="numpad-value">{display}</span>
            <span className="numpad-max">/ {max}</span>
          </div>
        </div>

        {/* Keys */}
        <div className="numpad-grid">
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => (
            <button key={n} className="numpad-key" type="button" onPointerDown={e => { e.preventDefault(); pressDigit(n); }}>
              {n}
            </button>
          ))}
          <button className="numpad-key numpad-back" type="button" onPointerDown={e => { e.preventDefault(); pressBack(); }}>
            <Delete size={20} />
          </button>
          <button className="numpad-key" type="button" onPointerDown={e => { e.preventDefault(); pressDigit(0); }}>
            0
          </button>
          <button className="numpad-key numpad-confirm" type="button" onPointerDown={e => { e.preventDefault(); confirm(); }}>
            <Check size={22} strokeWidth={3} />
          </button>
        </div>

      </div>
    </div>
  );
}
