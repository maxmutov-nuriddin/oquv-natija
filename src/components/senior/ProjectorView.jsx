import dayjs from "dayjs";
import { useEffect } from "react";
import { X } from "lucide-react";
import { initials } from "../../lib/utils";

export function ProjectorView({ ranked, selectedGroup, date, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sorted = [...ranked].sort((a, b) => {
    const diff = (b.weeklyFinalScore || 0) - (a.weeklyFinalScore || 0);
    return diff !== 0 ? diff : (b.weeklyCoins || 0) - (a.weeklyCoins || 0);
  });

  const medalColors = [
    "linear-gradient(135deg, #f59e0b, #d97706)",
    "linear-gradient(135deg, #94a3b8, #64748b)",
    "linear-gradient(135deg, #cd7c4a, #a05c30)",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg, #0a0f1e 0%, #0f172a 50%, #0a0f1e 100%)",
      zIndex: 99999, overflowY: "auto", padding: "32px 20px"
    }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#334155", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
              ● LIVE · HAFTALIK REYTING
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: "34px", fontWeight: 900, margin: 0, lineHeight: 1 }}>
              🏆 {selectedGroup}
            </h1>
            <p style={{ color: "#334155", fontSize: "14px", margin: "8px 0 0", fontWeight: 600 }}>
              {dayjs(date).format("DD-MMMM, YYYY")}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569", borderRadius: "10px", padding: "8px 16px",
              cursor: "pointer", fontSize: "13px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <X size={14} /> ESC
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sorted.map((student, index) => {
            const score = student.weeklyFinalScore || 0;
            const isTop3 = index < 3;
            const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : score >= 40 ? "#fb923c" : "#f87171";

            return (
              <div
                key={student.id}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  background: index === 0
                    ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))"
                    : "rgba(255,255,255,0.025)",
                  border: `1.5px solid ${
                    index === 0 ? "rgba(245,158,11,0.3)"
                    : index === 1 ? "rgba(148,163,184,0.12)"
                    : index === 2 ? "rgba(205,124,74,0.15)"
                    : "rgba(255,255,255,0.05)"
                  }`,
                  borderRadius: "14px",
                  padding: index === 0 ? "20px 24px" : "14px 20px",
                  boxShadow: index === 0 ? "0 0 40px rgba(245,158,11,0.08)" : "none",
                }}
              >
                <div style={{ width: "44px", textAlign: "center", flexShrink: 0 }}>
                  {isTop3
                    ? <span style={{ fontSize: "30px" }}>{["🥇", "🥈", "🥉"][index]}</span>
                    : <span style={{ fontSize: "20px", fontWeight: 900, color: "#334155" }}>{index + 1}</span>
                  }
                </div>

                <div style={{
                  width: index === 0 ? "54px" : "46px",
                  height: index === 0 ? "54px" : "46px",
                  borderRadius: "13px", flexShrink: 0,
                  background: isTop3 ? medalColors[index] : "rgba(255,255,255,0.07)",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: index === 0 ? "16px" : "13px", fontWeight: 900,
                  boxShadow: index === 0 ? "0 0 24px rgba(245,158,11,0.45)" : "none",
                }}>
                  {initials(student.name)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: "#f1f5f9", fontWeight: 800,
                    fontSize: index === 0 ? "24px" : "18px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    lineHeight: 1.2
                  }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#334155", fontWeight: 700, marginTop: "3px" }}>
                    🪙 {student.weeklyCoins || 0} coin bu hafta
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: index === 0 ? "40px" : "28px",
                    fontWeight: 900, color: scoreColor, lineHeight: 1
                  }}>
                    {score}%
                  </div>
                  <div style={{ fontSize: "10px", color: "#334155", fontWeight: 700, marginTop: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    haftalik
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
