import { useEffect, useMemo, useRef, useState } from "react";
import { Info, Star } from "lucide-react";
import { mysteryBoxData } from "../../constants";
import { getPrivilegeInfo, getWeightedRandomItem } from "../../lib/utils";

export function MysteryBoxModal({ activeMystery, onClose, onReward }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [trackItems, setTrackItems] = useState([]);
  const trackRef = useRef(null);

  const poolIds = mysteryBoxData[activeMystery.mysteryType]?.pool || [];

  const probabilities = useMemo(() => {
    const items = poolIds.map(id => {
      const info = getPrivilegeInfo(id);
      const price = info.price || 1000;
      return { ...info, weight: 1 / price };
    });
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    return items.map(item => ({
      name: item.name,
      percent: ((item.weight / totalWeight) * 100).toFixed(1)
    }));
  }, [poolIds]);

  const cardColors = [
    { bg: "#ffffff", border: "#3b82f6", text: "#1e3a8a", shadow: "#1d4ed8" },
    { bg: "#ffffff", border: "#10b981", text: "#065f46", shadow: "#047857" },
    { bg: "#ffffff", border: "#f59e0b", text: "#7c2d12", shadow: "#b45309" },
    { bg: "#ffffff", border: "#ef4444", text: "#7f1d1d", shadow: "#991b1b" },
    { bg: "#ffffff", border: "#8b5cf6", text: "#4c1d95", shadow: "#6d28d9" }
  ];

  useEffect(() => {
    const initialTrack = Array.from({ length: 15 }, (_, i) => ({
      ...getPrivilegeInfo(poolIds[Math.floor(Math.random() * poolIds.length)]),
      color: cardColors[i % cardColors.length]
    }));
    setTrackItems(initialTrack);
  }, [poolIds]);

  function handleStart() {
    setSpinning(true);
    const winItem = getWeightedRandomItem(poolIds);

    const newTrack = Array.from({ length: 100 }, (_, i) => {
      const item = (i === 85) ? winItem : getPrivilegeInfo(poolIds[Math.floor(Math.random() * poolIds.length)]);
      return { ...item, color: cardColors[i % cardColors.length] };
    });
    setTrackItems(newTrack);

    setTimeout(() => {
      if (trackRef.current) {
        const itemWidth = 152;
        const containerWidth = trackRef.current.parentElement.offsetWidth;
        const targetOffset = (85 * itemWidth) - (containerWidth / 2) + (itemWidth / 2) + (Math.random() * 80 - 40);
        trackRef.current.style.transition = "transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)";
        trackRef.current.style.transform = `translate3d(-${targetOffset}px, 0, 0)`;
      }
    }, 100);

    setTimeout(() => {
      setResult(winItem);
      setTimeout(() => {
        onReward(winItem, activeMystery);
      }, 2500);
    }, 6200);
  }

  return (
    <div style={{ textAlign: "center", padding: "10px 0", position: "relative", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ fontSize: "56px", marginBottom: "8px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}>✨🎁✨</div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "32px", fontWeight: "950", color: "#1e293b", textTransform: "uppercase", letterSpacing: "2px", textShadow: "0 2px 0 white", margin: 0 }}>MISTIRIY BOX</h3>

        <div
          style={{ position: "relative", display: "inline-flex" }}
          onMouseEnter={(e) => e.currentTarget.lastChild.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.lastChild.style.opacity = "0"}
        >
          <Info size={24} color="#64748b" style={{ cursor: "help", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"} onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"} />
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "12px",
            background: "#1e293b", color: "white", padding: "16px", borderRadius: "12px",
            width: "max-content", maxWidth: "280px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            opacity: 0, pointerEvents: "none", transition: "opacity 0.2s ease-in-out",
            zIndex: 50, textAlign: "left", fontSize: "14px", lineHeight: "1.6"
          }}>
            <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #1e293b" }} />
            <strong style={{ display: "block", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px", fontSize: "15px", color: "#eab308" }}>Tushish ehtimolligi:</strong>
            {probabilities.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "4px" }}>
                <span style={{ opacity: 0.9 }}>{p.name}:</span>
                <strong style={{ color: "#34d399" }}>{p.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: "relative", width: "100%", height: "170px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", borderRadius: "32px", overflow: "hidden",
        marginBottom: "32px", border: "6px solid #334155", boxShadow: "inset 0 10px 40px rgba(0,0,0,0.9), 0 8px 0px #0f172a"
      }}>
        <div style={{ position: "absolute", left: "50%", top: "-4px", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: "28px solid #facc15", filter: "drop-shadow(0 0 10px #eab308)" }} />
        <div style={{ position: "absolute", left: "50%", bottom: "-4px", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: "28px solid #facc15", filter: "drop-shadow(0 0 10px #eab308)" }} />

        <div ref={trackRef} style={{ display: "flex", gap: "12px", padding: "25px 0", willChange: "transform", transform: "translate3d(0, 0, 0)", alignItems: "center" }}>
          {trackItems.map((item, idx) => (
            <div key={idx} style={{
              flexShrink: 0, width: "140px", height: "115px", background: item.color.bg,
              border: `4px solid ${item.color.border}`, borderRadius: "24px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "10px", color: item.color.text, fontSize: "14px", fontWeight: "900", textAlign: "center",
              boxShadow: `0 8px 0px ${item.color.shadow}, inset 0 -4px 10px rgba(0,0,0,0.05)`, transform: "translateY(-4px)"
            }}>
              <Star size={26} fill={item.color.border} style={{ color: item.color.border, marginBottom: "8px" }} />
              <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.1" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {result ? (
        <div style={{ fontSize: "22px", fontWeight: "950", color: "#ffffff", padding: "28px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "24px", animation: "popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)", border: "4px solid #047857", boxShadow: "0 10px 0px #047857" }}>
          🎊 TABRIKLAYMIZ! 🎊 <br /><br /> <span style={{ fontSize: "26px", textShadow: "0 4px 0px rgba(0,0,0,0.2)" }}>{result.name}</span>
        </div>
      ) : (
        <button
          className="primary-button"
          onClick={handleStart}
          disabled={spinning}
          style={{
            width: "100%", justifyContent: "center", padding: "20px", fontSize: "24px", fontWeight: "950",
            background: spinning ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)",
            border: spinning ? "none" : "4px solid #b45309",
            boxShadow: spinning ? "none" : "0 8px 0px #b45309",
            borderRadius: "20px", color: "#fff",
            transform: spinning ? "translateY(8px)" : "translateY(0)", transition: "all 0.1s ease",
            textTransform: "uppercase", letterSpacing: "1px"
          }}
        >
          {spinning ? "OCHILMOQDA..." : "QUTINI OCHISH! 🚀"}
        </button>
      )}
    </div>
  );
}
