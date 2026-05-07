import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import { useT } from "../../i18n/index.jsx";
import { loadComics, saveComic } from "../../lib/comics";

export function ComicEntryModal({ group, date, onClose, onSaved }) {
  const { t } = useT();
  const existing = loadComics(group)[date]?.dialog || "";
  const [dialog, setDialog] = useState(existing);
  const taRef = useRef(null);

  useEffect(() => {
    taRef.current?.focus();
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  function handleSave() {
    if (!dialog.trim()) return;
    saveComic(group, date, dialog.trim());
    onSaved?.();
    onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-panel"
        style={{ maxWidth: "460px" }}
        role="dialog"
        aria-modal="true"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} />
            <h3>{t.comic_title}</h3>
          </div>
          <button className="modal-close" type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
            {t.comic_hint}
          </p>

          <textarea
            ref={taRef}
            value={dialog}
            onChange={e => setDialog(e.target.value)}
            placeholder={t.comic_placeholder}
            rows={5}
            style={{
              width: "100%",
              resize: "vertical",
              padding: "12px",
              borderRadius: "10px",
              border: "2px solid #e2e8f0",
              fontSize: "14px",
              fontFamily: "inherit",
              lineHeight: 1.6,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#1cb0f6"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button className="secondary-button" type="button" onClick={onClose}>{t.comic_cancel}</button>
            <button className="primary-button" type="button" onClick={handleSave} disabled={!dialog.trim()}>
              {t.comic_save}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
