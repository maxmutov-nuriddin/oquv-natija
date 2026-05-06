import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function FunModal({ children, onClose }) {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose} style={{ zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "32px",
          padding: "8px",
          border: "6px solid #b45309",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 6px 0px rgba(255,255,255,0.4)",
          maxWidth: "480px",
          width: "100%",
          position: "relative",
          animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "-15px", right: "-15px",
            background: "#ef4444", border: "4px solid #991b1b", color: "white",
            borderRadius: "50%", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 4px 0px #991b1b", zIndex: 10,
            transition: "transform 0.1s"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <X size={24} style={{ strokeWidth: 3 }} />
        </button>
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "24px", boxShadow: "inset 0 4px 10px rgba(0,0,0,0.05)" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
