import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Dices, RefreshCw, Trophy, Users, ChevronRight, Check, X } from "lucide-react";
import { TOPICS_DATA, TOPICS_DATA_RU } from "../data/topicsData";

const BOARD_SIZE = 30;
const TEAM_COLORS = ["#7c3aed", "#ef4444", "#06b6d4", "#f59e0b"];
const TEAM_BG     = ["#ede9fe", "#fee2e2", "#cffafe", "#fef9c3"];
const TEAM_BORDER = ["#7c3aed", "#dc2626", "#0891b2", "#d97706"];
const DICE_FACES  = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// Build 5×6 snake grid — returns grid[row][col] = cell number (1–30)
// row 0 = bottom (cells 1-6), row 4 = top (cells 25-30)
function buildGrid() {
  const grid = Array.from({ length: 5 }, () => Array(6).fill(null));
  let num = 1;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 6; i++) {
      const col = row % 2 === 0 ? i : 5 - i;
      grid[row][col] = num++;
    }
  }
  return grid;
}

const GRID = buildGrid();

function flatQs(topic, lang) {
  const qs = [];
  for (const [pts, arr] of Object.entries(topic.questions || {})) {
    for (const q of arr) {
      if (!q.lang || q.lang === lang) qs.push({ q: q.q, a: q.a, pts: Number(pts) });
    }
  }
  return qs;
}

// ─── Setup screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, customTopics }) {
  const [lang, setLang] = useState("uz");
  const [step, setStep]         = useState(1);
  const [teamCount, setTeamCount]   = useState(2);
  const [teamNames, setTeamNames]   = useState(["1-Jamoa", "2-Jamoa", "3-Jamoa", "4-Jamoa"]);
  const [topicId, setTopicId]       = useState(null);

  const defaultTopics = lang === "uz" ? TOPICS_DATA : TOPICS_DATA_RU;
  const customFiltered = (customTopics || []).filter(t =>
    Object.values(t.questions || {}).some(qs => qs.some(q => q.lang === lang))
  );
  const allTopics = [...defaultTopics, ...customFiltered];

  function switchLang(l) {
    setLang(l);
    setTopicId(null);
    setTeamNames(l === "ru"
      ? ["Команда 1", "Команда 2", "Команда 3", "Команда 4"]
      : ["1-Jamoa", "2-Jamoa", "3-Jamoa", "4-Jamoa"]);
  }

  function handleStart() {
    if (!topicId) return;
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) return;
    const qs = flatQs(topic, lang);
    if (!qs.length) return;
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      id: i, name: teamNames[i] || `${i + 1}-Jamoa`,
      color: TEAM_COLORS[i], bg: TEAM_BG[i], border: TEAM_BORDER[i],
    }));
    onStart(teams, qs);
  }

  const isUz = lang === "uz";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 12px 32px" }}>
      <div className="panel" style={{ padding: 24 }}>
        {/* Header */}
        <div className="panel-title" style={{ marginBottom: 4 }}>
          <span style={{ background: "#7c3aed", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dices size={22} color="#fff" />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{isUz ? "Ludo O'yini" : "Игра Ludo"}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              {step === 1
                ? (isUz ? "1-qadam: Jamoalar" : "Шаг 1: Команды")
                : (isUz ? "2-qadam: Mavzu" : "Шаг 2: Тема")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["uz", "ru"].map(l => (
              <button key={l} type="button" onClick={() => switchLang(l)} style={{
                padding: "5px 10px", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer",
                border: `2px solid ${lang === l ? "#7c3aed" : "#e2e8f0"}`,
                background: lang === l ? "#ede9fe" : "white",
                color: lang === l ? "#7c3aed" : "#94a3b8",
              }}>
                {l === "uz" ? "🇺🇿 UZ" : "🇷🇺 RU"}
              </button>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Team count */}
            <div className="qg-setup-section">
              <label className="qg-setup-label">{isUz ? "Jamoalar soni" : "Количество команд"}</label>
              <div className="qg-count-row">
                {[2, 3, 4].map(n => (
                  <button key={n}
                    className={`qg-count-btn ${teamCount === n ? "primary-button" : "secondary-button"}`}
                    onClick={() => setTeamCount(n)}>
                    <Users size={15} /> {n} {isUz ? "jamoa" : "команды"}
                  </button>
                ))}
              </div>
            </div>

            {/* Team names */}
            <div className="qg-setup-section">
              <label className="qg-setup-label">{isUz ? "Jamoa nomlari" : "Названия команд"}</label>
              <div className="qg-names-list">
                {Array.from({ length: teamCount }, (_, i) => (
                  <div key={i} className="qg-name-row">
                    <span className="qg-color-dot" style={{ background: TEAM_COLORS[i] }} />
                    <input className="control" style={{ flex: 1 }}
                      value={teamNames[i]}
                      onChange={e => { const u = [...teamNames]; u[i] = e.target.value; setTeamNames(u); }}
                      placeholder={`${i + 1}-Jamoa`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button className="primary-button" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStep(2)}>
              {isUz ? "Mavzu tanlash" : "Выбрать тему"} <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="qg-setup-section">
              <label className="qg-setup-label">
                {isUz ? "Bitta mavzu tanlang" : "Выберите одну тему"}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allTopics.map(topic => {
                  const qs = flatQs(topic, lang);
                  const active = topicId === topic.id;
                  return (
                    <button key={topic.id} type="button" onClick={() => setTopicId(topic.id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      border: `2px solid ${active ? topic.color : "#e2e8f0"}`,
                      background: active ? topic.color + "18" : "white",
                      transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: 24 }}>{topic.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: active ? topic.colorDark : "#1e293b" }}>{topic.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 2 }}>
                          {qs.length} {isUz ? "ta savol" : "вопросов"}
                        </div>
                      </div>
                      {active && <Check size={18} color={topic.color} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="secondary-button" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>
                <ArrowLeft size={16} /> {isUz ? "Orqaga" : "Назад"}
              </button>
              <button className="primary-button" disabled={!topicId} onClick={handleStart} style={{ flex: 2, justifyContent: "center" }}>
                <Dices size={18} /> {isUz ? "O'yinni boshlash" : "Начать игру"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Board cell ───────────────────────────────────────────────────────────────
function Cell({ num, teams, positions }) {
  const teamsHere = teams.filter((_, i) => positions[i] === num);
  const isFinish = num === BOARD_SIZE;
  return (
    <div style={{
      border: "2px solid " + (isFinish ? "#f59e0b" : "#e2e8f0"),
      borderRadius: 8,
      background: isFinish ? "#fef9c3" : "#f8fafc",
      aspectRatio: "1",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative",
      minWidth: 0,
      overflow: "hidden",
    }}>
      <span style={{ fontSize: "clamp(8px, 1.8vw, 11px)", fontWeight: 700, color: isFinish ? "#d97706" : "#94a3b8", lineHeight: 1 }}>
        {isFinish ? "🏁" : num}
      </span>
      {teamsHere.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", marginTop: 2 }}>
          {teamsHere.map(t => (
            <div key={t.id} style={{
              width: "clamp(8px, 2.5vw, 14px)",
              height: "clamp(8px, 2.5vw, 14px)",
              borderRadius: "50%",
              background: t.color,
              border: "1.5px solid white",
              boxShadow: `0 1px 3px ${t.color}88`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Question modal ───────────────────────────────────────────────────────────
function QuestionModal({ question, dice, team, onCorrect, onWrong, lang }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const isUz = lang === "uz";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: 24, maxWidth: 480, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        {/* Team + dice info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: team.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 14 }}>{team.name[0]}</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: team.color }}>{team.name}</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              {isUz ? `🎲 ${dice} qadam` : `🎲 ${dice} шага`} &nbsp;·&nbsp; {question.pts} pts
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{ background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, lineHeight: 1.5, color: "#1e293b" }}>{question.q}</p>
        </div>

        {/* Answer toggle */}
        {!showAnswer ? (
          <button className="secondary-button" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
            onClick={() => setShowAnswer(true)}>
            {isUz ? "👁 Javobni ko'rish" : "👁 Показать ответ"}
          </button>
        ) : (
          <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#166534", lineHeight: 1.5 }}>{question.a}</p>
          </div>
        )}

        {/* Verdict buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onWrong} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "2px solid #fca5a5",
            background: "#fff1f2", color: "#dc2626", fontWeight: 800, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <X size={18} /> {isUz ? "Noto'g'ri" : "Неверно"}
          </button>
          <button onClick={onCorrect} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "2px solid #86efac",
            background: "#f0fdf4", color: "#16a34a", fontWeight: 800, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Check size={18} /> {isUz ? "To'g'ri" : "Верно"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Win screen ───────────────────────────────────────────────────────────────
function WinScreen({ winner, onRestart, lang }) {
  const isUz = lang === "uz";
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ background: "white", borderRadius: 24, padding: 32, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: winner.color }}>{winner.name}</h2>
        <p style={{ margin: "0 0 24px", fontSize: 16, color: "#64748b", fontWeight: 600 }}>
          {isUz ? "G'olib! 🎉" : "Победитель! 🎉"}
        </p>
        <button className="primary-button" style={{ width: "100%", justifyContent: "center", fontSize: 16 }} onClick={onRestart}>
          <RefreshCw size={18} /> {isUz ? "Qaytadan o'ynash" : "Играть снова"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function LudoGamePage({ settings }) {
  const customTopics = settings?.customTopics || [];
  const [phase, setPhase] = useState("setup");
  const [lang, setLang]   = useState("uz");
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [dice, setDice]           = useState(1);
  const [rolling, setRolling]     = useState(false);
  const [allQs, setAllQs]         = useState([]);
  const [usedIdxs, setUsedIdxs]   = useState([]);
  const [question, setQuestion]   = useState(null);
  const [winner, setWinner]       = useState(null);
  const rollRef = useRef(null);

  useEffect(() => () => clearInterval(rollRef.current), []);

  function handleStart(newTeams, qs) {
    setTeams(newTeams);
    setPositions(new Array(newTeams.length).fill(0));
    setCurrent(0);
    setAllQs(qs);
    setUsedIdxs([]);
    setQuestion(null);
    setWinner(null);
    setDice(1);
    setPhase("playing");
  }

  function rollDice() {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    rollRef.current = setInterval(() => {
      setDice(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 10) {
        clearInterval(rollRef.current);
        const finalDice = Math.ceil(Math.random() * 6);
        setDice(finalDice);
        setRolling(false);
        // pick question
        const available = allQs.map((_, i) => i).filter(i => !usedIdxs.includes(i));
        const pool = available.length ? available : allQs.map((_, i) => i);
        if (!available.length) setUsedIdxs([]);
        const idx = pool[Math.floor(Math.random() * pool.length)];
        setQuestion({ ...allQs[idx], _idx: idx, _dice: finalDice });
        setPhase("question");
      }
    }, 80);
  }

  function handleAnswer(correct) {
    const finalDice = question._dice;
    setUsedIdxs(prev => [...prev, question._idx]);
    if (correct) {
      const newPos = [...positions];
      newPos[current] = Math.min(positions[current] + finalDice, BOARD_SIZE);
      setPositions(newPos);
      if (newPos[current] >= BOARD_SIZE) {
        setWinner(teams[current]);
        setQuestion(null);
        setPhase("win");
        return;
      }
    }
    setCurrent(c => (c + 1) % teams.length);
    setQuestion(null);
    setPhase("playing");
  }

  function reset() {
    setPhase("setup");
    setWinner(null);
    setQuestion(null);
  }

  if (phase === "setup") {
    return <SetupScreen onStart={handleStart} customTopics={customTopics} />;
  }

  const currentTeam = teams[current];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 12px 32px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button className="secondary-button" onClick={reset} style={{ padding: "8px 12px" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
          Ludo O'yini
        </div>
        <button className="secondary-button" onClick={reset} style={{ padding: "8px 12px", fontSize: 13 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Teams status strip */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {teams.map((team, i) => {
          const isCurrent = i === current;
          return (
            <div key={team.id} style={{
              flex: 1, minWidth: 80, padding: "8px 10px", borderRadius: 10,
              border: `2px solid ${isCurrent ? team.color : "#e2e8f0"}`,
              background: isCurrent ? team.bg : "white",
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: team.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 12, color: isCurrent ? team.color : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {team.name}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: isCurrent ? team.color : "#1e293b", marginTop: 2 }}>
                📍 {positions[i]} / {BOARD_SIZE}
              </div>
            </div>
          );
        })}
      </div>

      {/* Board */}
      <div style={{ background: "white", border: "2px solid #e2e8f0", borderRadius: 16, padding: 10, marginBottom: 12 }}>
        {/* Start row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 4 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const teamsHere = i === 0 ? teams.filter((_, ti) => positions[ti] === 0) : [];
            return (
              <div key={i} style={{
                border: "2px dashed " + (i === 0 ? "#7c3aed" : "#e2e8f0"),
                borderRadius: 8, aspectRatio: "1",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: i === 0 ? "#ede9fe" : "transparent",
              }}>
                {i === 0 && (
                  <>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>START</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                      {teamsHere.map(t => (
                        <div key={t.id} style={{ width: "clamp(8px,2.5vw,14px)", height: "clamp(8px,2.5vw,14px)", borderRadius: "50%", background: t.color, border: "1.5px solid white" }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Main grid — rows from top (row 4) to bottom (row 0) */}
        {[4, 3, 2, 1, 0].map(row => (
          <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 4 }}>
            {GRID[row].map((num, col) => (
              <Cell key={col} num={num} teams={teams} positions={positions} />
            ))}
          </div>
        ))}
      </div>

      {/* Dice + Roll */}
      <div style={{
        background: "white", border: `3px solid ${currentTeam.color}`,
        borderRadius: 16, padding: 20, textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: currentTeam.color, marginBottom: 8 }}>
          {currentTeam.name} {lang === "uz" ? "navbati" : "ходит"}
        </div>
        <div style={{
          fontSize: "clamp(48px, 15vw, 80px)", lineHeight: 1,
          marginBottom: 16, userSelect: "none",
          filter: rolling ? "drop-shadow(0 0 8px #7c3aed88)" : "none",
          transition: "filter 0.1s",
        }}>
          {DICE_FACES[dice - 1]}
        </div>
        <button
          className="primary-button"
          disabled={rolling}
          onClick={rollDice}
          style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "14px 0" }}
        >
          <Dices size={20} />
          {rolling
            ? (lang === "uz" ? "Tosh uchmoqda..." : "Бросок...")
            : (lang === "uz" ? "🎲 Tosh tashlash" : "🎲 Бросить кубик")}
        </button>
      </div>

      {/* Question modal */}
      {phase === "question" && question && (
        <QuestionModal
          question={question}
          dice={question._dice}
          team={currentTeam}
          lang={lang}
          onCorrect={() => handleAnswer(true)}
          onWrong={() => handleAnswer(false)}
        />
      )}

      {/* Win screen */}
      {phase === "win" && winner && (
        <WinScreen winner={winner} lang={lang} onRestart={reset} />
      )}
    </div>
  );
}
