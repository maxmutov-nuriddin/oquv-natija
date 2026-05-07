import { useT } from "../../i18n/index.jsx";
import { getPerformanceStatus, percent } from "../../lib/utils";

export function ProgressLine({ label, value, tone, showStatus = false }) {
  const { t } = useT();
  const status = showStatus ? getPerformanceStatus(value) : null;
  return (
    <div className="progress-line">
      <div>
        <span>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {status && (
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: "999px",
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>
              {t[`status_${status.key}`]}
            </span>
          )}
          <strong>{percent(value)}%</strong>
        </div>
      </div>
      <div className="progress-track">
        <i className={tone} style={{ width: `${percent(value)}%` }} />
      </div>
    </div>
  );
}
