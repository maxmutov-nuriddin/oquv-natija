import { cx } from "../../lib/utils";

export function LoadingState({ compact = false }) {
  return (
    <div className={cx("loading-container", compact && "loading-compact")}>
      <div className="loading-content">
        <div className="loading-box" />
        <h3>Yuklanmoqda...</h3>
      </div>
    </div>
  );
}
