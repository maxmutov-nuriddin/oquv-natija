import { useState } from "react";
import { ShieldX } from "lucide-react";
import { initials } from "../../lib/utils";

export function BlockFriendModal({ groupStudents, blockingStudentId, date, onBlock, onClose }) {
  const [targetId, setTargetId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const candidates = groupStudents.filter(s => s.id !== blockingStudentId);
  const target = candidates.find(s => s.id === targetId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!targetId) return;
    onBlock(targetId);
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#fff1f2", borderRadius: "12px", border: "2px solid #fca5a5" }}>
        <div style={{ width: "48px", height: "48px", background: "var(--rose)", borderRadius: "12px", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <ShieldX size={24} color="white" />
        </div>
        <div>
          <strong style={{ fontSize: "16px", display: "block", color: "#991b1b" }}>Do'stni bloklash</strong>
          <span style={{ fontSize: "13px", color: "#b91c1c" }}>
            Tanlangan o'quvchi <strong>{date}</strong> kuni barcha imtiyozlaridan foydalana olmaydi.
          </span>
        </div>
      </div>

      <div>
        <span style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "10px" }}>
          O'quvchini tanlang
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
          {candidates.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
              Guruhda boshqa o'quvchilar yo'q
            </p>
          )}
          {candidates.map(s => {
            const isBlocked = s.privilegeBlockedDate === date;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setTargetId(s.id)}
                disabled={isBlocked}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `2px solid ${targetId === s.id ? "var(--rose)" : "var(--line)"}`,
                  borderBottom: `4px solid ${targetId === s.id ? "var(--rose-dark)" : "var(--line-dark)"}`,
                  background: targetId === s.id ? "#fff1f2" : isBlocked ? "#f9fafb" : "white",
                  cursor: isBlocked ? "not-allowed" : "pointer",
                  opacity: isBlocked ? 0.5 : 1,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div className="avatar avatar-small" style={{ background: targetId === s.id ? "var(--rose)" : undefined }}>
                  {initials(s.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "15px", display: "block" }}>{s.name}</strong>
                  {isBlocked && (
                    <span style={{ fontSize: "11px", color: "var(--rose)", fontWeight: 700 }}>
                      Allaqachon bloklangan
                    </span>
                  )}
                </div>
                {targetId === s.id && (
                  <ShieldX size={18} color="var(--rose)" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {target && (
        <div style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#991b1b" }}>
          <strong>{target.name}</strong> ushbu kunda ({date}) barcha imtiyozlaridan foydalana olmaydi. Bu amalni qaytarib bo'lmaydi.
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" className="secondary-button" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
          Bekor qilish
        </button>
        <button
          type="submit"
          className="danger-button"
          disabled={!targetId}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <ShieldX size={16} />
          Bloklash
        </button>
      </div>
    </form>
  );
}
