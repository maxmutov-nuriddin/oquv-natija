import { useEffect, useRef, useState } from "react";
import { Coins, Info } from "lucide-react";

export function BonusDrumModal({ onReward, onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [trackItems, setTrackItems] = useState([]);
  const trackRef = useRef(null);

  const pool = [1, 10, 50, 100, 150, 200];
  const itemColors = {
    1: { bg: "#f8fafc", border: "#64748b", text: "#0f172a" },
    10: { bg: "#fef08a", border: "#ca8a04", text: "#854d0e" },
    50: { bg: "#a7f3d0", border: "#059669", text: "#065f46" },
    100: { bg: "#bfdbfe", border: "#2563eb", text: "#1e3a8a" },
    150: { bg: "#fbcfe8", border: "#db2777", text: "#831843" },
    200: { bg: "#e9d5ff", border: "#9333ea", text: "#581c87" }
  };

  function getWeightedDrumItem() {
    const weights = { 1: 40, 10: 25, 50: 15, 100: 10, 150: 6, 200: 4 };
    const totalWeight = pool.reduce((sum, v) => sum + weights[v], 0);
    let r = Math.random() * totalWeight;
    for (const v of pool) {
      r -= weights[v];
      if (r <= 0) return v;
    }
    return pool[pool.length - 1];
  }

  useEffect(() => {
    let bag = [];
    function getFromBag() {
      if (bag.length === 0) bag = [...pool].sort(() => Math.random() - 0.5);
      return bag.shift();
    }
    const initialTrack = Array.from({ length: 15 }, () => getFromBag());
    setTrackItems(initialTrack);
  }, []);

  function handleStart() {
    setSpinning(true);
    const winItem = getWeightedDrumItem();

    let generatedTrack = [];
    let bag = [];

    function getFromBag(recentItems = []) {
      if (bag.length === 0) {
        bag = [...pool].sort(() => Math.random() - 0.5);
      }
      const index = bag.findIndex(item => !recentItems.includes(item));
      if (index !== -1) {
        const item = bag[index];
        bag.splice(index, 1);
        return item;
      }
      return bag.shift();
    }

    let recent = [];
    for (let i = 0; i < 100; i++) {
      if (i === 85) {
        generatedTrack.push(winItem);
        recent = [winItem, ...recent].slice(0, 2);
        bag = bag.filter(x => x !== winItem);
      } else {
        let item = getFromBag(recent);
        generatedTrack.push(item);
        recent = [item, ...recent].slice(0, 2);
      }
    }

    setTrackItems(generatedTrack);

    setTimeout(() => {
      if (trackRef.current) {
        const itemWidth = 160;
        const containerWidth = trackRef.current.parentElement.offsetWidth;
        const targetOffset = (85 * itemWidth) - (containerWidth / 2) + (itemWidth / 2) + (Math.random() * 60 - 30);
        trackRef.current.style.transition = "transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)";
        trackRef.current.style.transform = `translate3d(-${targetOffset}px, 0, 0)`;
      }
    }, 100);

    setTimeout(() => {
      setResult(winItem);
      setTimeout(() => {
        onReward(winItem);
      }, 2500);
    }, 6200);
  }

  return (
    <div style={{ textAlign: "center", padding: "20px 0", position: "relative", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ fontSize: "48px", marginBottom: "8px", textShadow: "0 4px 0px rgba(0,0,0,0.2)" }}>🎁</div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Omad Barabani!</h3>

        <div
          style={{ position: "relative", display: "inline-flex" }}
          onMouseEnter={(e) => e.currentTarget.lastChild.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.lastChild.style.opacity = "0"}
        >
          <Info size={24} color="#64748b" style={{ cursor: "help", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"} onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"} />
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "12px",
            background: "#1e293b", color: "white", padding: "16px", borderRadius: "12px", width: "max-content",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)", opacity: 0, pointerEvents: "none",
            transition: "opacity 0.2s ease-in-out", zIndex: 50, textAlign: "left", fontSize: "14px", lineHeight: "1.6"
          }}>
            <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #1e293b" }} />
            <strong style={{ display: "block", marginBottom: "8px", color: "#fbbf24" }}>Tushish ehtimolligi:</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              <span>🪙 1 coin: 40%</span>
              <span>🪙 10 coin: 25%</span>
              <span>🪙 50 coin: 15%</span>
              <span>🪙 100 coin: 10%</span>
              <span>🪙 150 coin: 6%</span>
              <span>🪙 200 coin: 4%</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: "relative", width: "100%", height: "160px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", borderRadius: "24px", overflow: "hidden",
        marginBottom: "32px", border: "4px solid #334155",
        boxShadow: "inset 0 10px 30px rgba(0,0,0,0.8), 0 8px 0px #0f172a, 0 12px 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ position: "absolute", left: "50%", top: "-4px", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "24px solid #ef4444", filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.5))" }} />
        <div style={{ position: "absolute", left: "50%", bottom: "-4px", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "24px solid #ef4444", filter: "drop-shadow(0 -4px 4px rgba(0,0,0,0.5))" }} />

        <div ref={trackRef} style={{ display: "flex", gap: "16px", padding: "20px 0", willChange: "transform", transform: "translate3d(0, 0, 0)", alignItems: "center" }}>
          {trackItems.map((item, idx) => {
            const colors = itemColors[item] || itemColors[10];
            return (
              <div key={idx} style={{
                flexShrink: 0, width: "144px", height: "110px", background: colors.bg,
                border: `3px solid ${colors.border}`, borderRadius: "20px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "10px", color: colors.text, fontSize: "26px", fontWeight: "900", textAlign: "center",
                boxShadow: `0 8px 0px ${colors.border}, inset 0 -4px 10px rgba(0,0,0,0.1)`, transform: "translateY(-4px)"
              }}>
                <Coins size={32} style={{ color: colors.border, marginBottom: "8px", filter: "drop-shadow(0 2px 0px rgba(0,0,0,0.2))" }} />
                <span style={{ textShadow: "0 2px 0px rgba(255,255,255,0.4)" }}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      {result ? (
        <div style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", padding: "24px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "20px", animation: "popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)", border: "3px solid #047857", boxShadow: "0 8px 0px #047857", transform: "translateY(-8px)" }}>
          🎉 TABRIKLAYMIZ! 🎉 <br /><br /> <span style={{ fontSize: "36px", textShadow: "0 4px 0px rgba(0,0,0,0.2)" }}>{result} COIN</span>
        </div>
      ) : (
        <button
          className="primary-button"
          onClick={handleStart}
          disabled={spinning}
          style={{
            width: "100%", justifyContent: "center", padding: "18px", fontSize: "20px", fontWeight: "900",
            background: spinning ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
            border: spinning ? "none" : "3px solid #1d4ed8",
            boxShadow: spinning ? "none" : "0 6px 0px #1d4ed8",
            borderRadius: "16px", color: "#fff",
            transform: spinning ? "translateY(6px)" : "translateY(0)", transition: "all 0.1s ease"
          }}
        >
          {spinning ? "AYLANMOQDA..." : "OMADNI SINASH! 🚀"}
        </button>
      )}
    </div>
  );
}
