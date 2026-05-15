import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ConfirmModal({ message, confirmLabel = "Ha, davom etish", cancelLabel = "Bekor qilish", onConfirm, onCancel, danger = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onCancel} style={{ zIndex: 300 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: "360px", padding: "28px 24px", textAlign: "center" }}
        onMouseDown={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", lineHeight: 1.6, marginBottom: "24px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            className="secondary-button"
            onClick={onCancel}
            style={{ minHeight: "40px", padding: "0 18px" }}
          >
            {cancelLabel}
          </button>
          <button
            className="primary-button"
            onClick={onConfirm}
            style={{
              minHeight: "40px", padding: "0 18px",
              ...(danger ? { background: "var(--rose)", borderBottomColor: "var(--rose-dark)" } : {}),
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
