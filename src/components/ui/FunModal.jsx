import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function FunModal({ children, onClose }) {
  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = sw + "px";
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  return createPortal(
    <div className="fun-modal-backdrop" onMouseDown={onClose}>
      <div className="fun-modal-wrap" onMouseDown={(e) => e.stopPropagation()}>
        <button className="fun-modal-close" onClick={onClose}>
          <X size={22} style={{ strokeWidth: 3 }} />
        </button>
        <div className="fun-modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
