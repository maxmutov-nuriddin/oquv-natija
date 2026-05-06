import { percent } from "../../lib/utils";

export function ProgressLine({ label, value, tone }) {
  return (
    <div className="progress-line">
      <div>
        <span>{label}</span>
        <strong>{percent(value)}%</strong>
      </div>
      <div className="progress-track">
        <i className={tone} style={{ width: `${percent(value)}%` }} />
      </div>
    </div>
  );
}
