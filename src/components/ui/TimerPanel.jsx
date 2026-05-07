import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "1'",  s: 60  },
  { label: "2'",  s: 120 },
  { label: "3'",  s: 180 },
  { label: "5'",  s: 300 },
  { label: "10'", s: 600 },
];

const RADIUS = 68;
const CIRC   = 2 * Math.PI * RADIUS;
const LS_KEY = "oquv_timer";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// Returns current remaining seconds based on timestamp arithmetic
function calcRemaining(state) {
  if (!state.startedAt) return state.baseRemaining;
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  return Math.max(0, state.baseRemaining - elapsed);
}

function initialState() {
  const saved = loadState();
  if (saved) {
    const rem = calcRemaining(saved);
    // If was running but time ran out while away
    if (rem <= 0 && saved.startedAt) {
      return { ...saved, startedAt: null, baseRemaining: 0, done: true };
    }
    return { ...saved, baseRemaining: rem, startedAt: saved.startedAt ? Date.now() - (saved.baseRemaining - rem) * 1000 : null };
  }
  return { total: 180, baseRemaining: 180, startedAt: null, done: false };
}

export function TimerPanel() {
  const [state, setState] = useState(initialState);
  const [display, setDisplay] = useState(() => calcRemaining(initialState()));
  const [custom, setCustom] = useState("");
  const rafRef = useRef(null);

  const remaining = calcRemaining(state);
  const isRunning = state.startedAt !== null;

  // RAF loop for smooth countdown display
  useEffect(() => {
    if (!isRunning) {
      setDisplay(state.baseRemaining);
      return;
    }

    function tick() {
      const rem = calcRemaining(state);
      setDisplay(rem);
      if (rem <= 0) {
        setState(s => {
          const next = { ...s, startedAt: null, baseRemaining: 0, done: true };
          saveState(next);
          return next;
        });
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, state]);

  function update(next) {
    saveState(next);
    setState(next);
  }

  function selectPreset(s) {
    cancelAnimationFrame(rafRef.current);
    update({ total: s, baseRemaining: s, startedAt: null, done: false });
    setCustom("");
  }

  function applyCustom() {
    const mins = parseInt(custom, 10);
    if (!mins || mins < 1 || mins > 99) return;
    selectPreset(mins * 60);
  }

  function handleStartPause() {
    if (state.done || display === 0) return;
    if (isRunning) {
      // Pause: freeze baseRemaining at current value, clear startedAt
      update({ ...state, baseRemaining: calcRemaining(state), startedAt: null });
    } else {
      // Start: record when we started
      update({ ...state, baseRemaining: display, startedAt: Date.now() });
    }
  }

  function handleReset() {
    cancelAnimationFrame(rafRef.current);
    update({ ...state, baseRemaining: state.total, startedAt: null, done: false });
  }

  const progress  = state.total > 0 ? display / state.total : 0;
  const offset    = CIRC * (1 - progress);
  const mins      = String(Math.floor(display / 60)).padStart(2, "0");
  const secs      = String(display % 60).padStart(2, "0");
  const isLow     = display <= 10 && display > 0 && isRunning;
  const ringColor = state.done ? "#ef4444" : isLow ? "#f97316" : isRunning ? "#58cc02" : "#1cb0f6";

  return (
    <section className="panel timer-panel">
      <div className="timer-inner">

        <div className="timer-ring-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180" className={state.done ? "timer-ring-done" : isLow ? "timer-ring-low" : ""}>
            <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="90" cy="90" r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
              style={{ transition: "stroke 0.3s" }}
            />
          </svg>
          <div className="timer-center">
            {state.done
              ? <span className="timer-done-emoji">⏰</span>
              : <span className="timer-digits" style={{ color: ringColor }}>{mins}:{secs}</span>
            }
            {state.done && <span className="timer-done-label">TUGADI!</span>}
          </div>
        </div>

        <div className="timer-controls-col">
          <p className="timer-section-label">Vaqt tanlang</p>

          <div className="timer-presets">
            {PRESETS.map(p => (
              <button
                key={p.s}
                className={`timer-preset-btn${state.total === p.s && !custom ? " timer-preset-active" : ""}`}
                onClick={() => selectPreset(p.s)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="timer-custom-row">
            <input
              type="number"
              min="1"
              max="99"
              placeholder="daqiqa"
              className="timer-custom-input"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyCustom()}
            />
            <button className="secondary-button timer-custom-apply" onClick={applyCustom}>
              OK
            </button>
          </div>

          <div className="timer-actions">
            <button
              className="primary-button timer-start-btn"
              onClick={handleStartPause}
              disabled={state.done || display === 0}
              style={isRunning ? { background: "#ef4444", borderColor: "#b91c1c", boxShadow: "0 4px 0 #b91c1c" } : {}}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? "To'xtatish" : "Boshlash"}
            </button>
            <button className="secondary-button timer-reset-btn" onClick={handleReset} title="Reset">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
