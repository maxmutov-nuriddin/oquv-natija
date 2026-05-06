import { cx } from "../../lib/utils";

export function StatCard({ icon: Icon, label, value, hint, tone = "mint" }) {
  return (
    <article className={cx("stat-card", `stat-${tone}`)}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
        <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</strong>
        {hint && <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</span>}
      </div>
    </article>
  );
}
