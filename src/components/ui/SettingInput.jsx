import { numberInputValue } from "../../lib/utils";

export function SettingInput({ label, value, onChange, step = "1" }) {
  return (
    <label className="setting-field">
      <span>{label}</span>
      <input type="number" inputMode={step === "1" || step === 1 ? "numeric" : "decimal"} step={step} value={numberInputValue(value)} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
