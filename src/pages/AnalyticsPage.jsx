import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Users } from "lucide-react";
import { groupAvgScore, isDeclineTrend, isRiseTrend, rankStudents } from "../lib/scoring";
import { PanelHeader } from "../components/ui/PanelHeader";
import { useT } from "../i18n/index.jsx";
import { initials } from "../lib/utils";

function avgScores(studentId, records, days = 30, date) {
  const cutoff = dayjs(date).subtract(days, "day").format("YYYY-MM-DD");
  const recs = records.filter(r =>
    r.studentId === studentId && r.date >= cutoff &&
    (r.homework > 0 || r.attendance > 0 || r.activity > 0)
  );
  if (!recs.length) return { hw: 0, att: 0, act: 0, lessonCount: 0 };
  const n = recs.length;
  return {
    hw:  Math.round(recs.reduce((s, r) => s + Number(r.homework   || 0), 0) / n),
    att: Math.round(recs.reduce((s, r) => s + Number(r.attendance || 0), 0) / n),
    act: Math.round(recs.reduce((s, r) => s + Number(r.activity   || 0), 0) / n),
    lessonCount: n,
  };
}

function MetricRow({ label, val }) {
  const color = val >= 70 ? "var(--mint)" : val >= 50 ? "var(--gold)" : "var(--rose)";
  const textColor = val >= 70 ? "var(--mint-dark)" : val >= 50 ? "var(--gold-dark)" : "var(--rose-dark)";
  const isWeak = val < 50;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "3px 6px", borderRadius: "8px",
      background: isWeak ? "#fff5f5" : "transparent",
    }}>
      <span style={{ fontSize: "12px", width: "68px", flexShrink: 0, fontWeight: isWeak ? 800 : 600, color: isWeak ? "var(--rose-dark)" : "var(--muted)" }}>
        {label}
      </span>
      <div style={{ flex: 1, background: "var(--line)", borderRadius: "999px", height: "7px", overflow: "hidden" }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: "999px" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 800, color: textColor, width: "34px", textAlign: "right", flexShrink: 0 }}>
        {val}%
      </span>
      {isWeak && (
        <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--rose)", flexShrink: 0 }}>⚠️</span>
      )}
    </div>
  );
}

function StudentCard({ s, accentColor, accentBg }) {
  const mainProblemMap = { hw: "📚 Uy vazifa", att: "✅ Sinf vazifa", act: "⚡ Aktivlik" };
  const showProblem = s.bottleneck && ({ hw: s.hw, att: s.att, act: s.act }[s.bottleneck] < 50);

  return (
    <div style={{
      background: "var(--surface)", border: "2px solid var(--line)",
      borderBottom: "4px solid var(--line-dark)", borderLeft: `4px solid ${accentColor}`,
      borderRadius: "var(--radius-xs)", padding: "14px 16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: accentBg, color: accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: 900
        }}>{initials(s.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {s.name}
          </div>
          {s.lessonCount > 0 && (
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
              {s.lessonCount} dars o'rtachasi (30 kun)
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: "16px", fontWeight: 900,
            color: (s.avgFinal ?? s.finalScore) >= 70 ? "var(--mint-dark)" : (s.avgFinal ?? s.finalScore) >= 50 ? "var(--gold-dark)" : "var(--rose-dark)"
          }}>
            {s.avgFinal ?? s.finalScore}%
          </div>
        </div>
      </div>

      {showProblem && (
        <div style={{
          fontSize: "11px", fontWeight: 800, color: "var(--rose-dark)",
          background: "#fff5f5", border: "1px solid #fecaca",
          borderRadius: "7px", padding: "4px 8px", marginBottom: "8px"
        }}>
          ↓ Asosiy muammo: {mainProblemMap[s.bottleneck]} · {({ hw: s.hw, att: s.att, act: s.act }[s.bottleneck])}%
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <MetricRow label="📚 Uy vazifa"   val={s.hw}  />
        <MetricRow label="✅ Sinf vazifa" val={s.att} />
        <MetricRow label="⚡ Aktivlik"    val={s.act} />
      </div>
    </div>
  );
}

const SECTIONS = [
  { key: "dangerous", icon: AlertTriangle, label: "Xavf zonasi",   sub: "Ball 50% dan past",             accentColor: "var(--rose)",  accentBg: "#ffe5e5", empty: "Xavfli o'quvchi yo'q" },
  { key: "declining", icon: TrendingDown,  label: "Pasayotgan",    sub: "3 dars ketma-ket pasaygan",     accentColor: "#f97316",      accentBg: "#ffedd5", empty: "Pasayotgan o'quvchi yo'q" },
  { key: "rising",    icon: TrendingUp,    label: "Ko'tarilotgan", sub: "3 dars ketma-ket o'sgan",       accentColor: "var(--mint)",  accentBg: "#e8ffd6", empty: "Ko'tarilotgan o'quvchi yo'q" },
];

function GroupDetail({ gs, records, settings, date }) {
  const hwW  = Number(settings.homeworkWeight  || 0.4);
  const attW = Number(settings.attendanceWeight || 0.3);
  const actW = Number(settings.activityWeight   || 0.3);

  const { dangerous, declining, rising } = useMemo(() => {
    const dangerous = [], declining = [], rising = [];
    gs.students.forEach(s => {
      const { hw, att, act, lessonCount } = avgScores(s.id, records, 30, date);
      if (lessonCount === 0) return;
      const hwLoss = (100-hw)*hwW, attLoss = (100-att)*attW, actLoss = (100-act)*actW;
      let bottleneck = "hw";
      if (attLoss >= hwLoss && attLoss >= actLoss) bottleneck = "att";
      else if (actLoss >= hwLoss && actLoss >= attLoss) bottleneck = "act";
      const avgFinal = Math.min(100, Math.round(hw*hwW + att*attW + act*actW));
      const e = { ...s, hw, att, act, bottleneck, avgFinal, lessonCount };

      if (avgFinal < 50)                                        dangerous.push(e);
      else if (isDeclineTrend(s.id, records, settings))        declining.push(e);
      else if (isRiseTrend(s.id, records, settings))           rising.push(e);
    });
    dangerous.sort((a,b) => a.avgFinal - b.avgFinal);
    declining.sort((a,b) => a.avgFinal - b.avgFinal);
    rising.sort((a,b) => b.avgFinal - a.avgFinal);
    return { dangerous, declining, rising };
  }, [gs, records, settings, date, hwW, attW, actW]);

  const byKey = { dangerous, declining, rising };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "8px" }}>
      {SECTIONS.map(sec => {
        const list = byKey[sec.key];
        const Icon = sec.icon;
        return (
          <div key={sec.key}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: sec.accentBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Icon size={15} color={sec.accentColor} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 900, color: "var(--text)" }}>{sec.label}</span>
                  {list.length > 0 && (
                    <span style={{
                      fontSize: "11px", fontWeight: 800, padding: "1px 8px",
                      borderRadius: "999px", background: sec.accentBg, color: sec.accentColor,
                      border: `1px solid ${sec.accentColor}`
                    }}>{list.length}</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>{sec.sub}</div>
              </div>
            </div>

            {list.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 0 42px", fontWeight: 600 }}>{sec.empty}</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                {list.map(s => (
                  <StudentCard key={s.id} s={s} accentColor={sec.accentColor} accentBg={sec.accentBg} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsPage({ groups, students, records, settings, date }) {
  const { t } = useT();
  const [openGroup, setOpenGroup] = useState(null);

  const groupStats = useMemo(() => {
    const hwW  = Number(settings.homeworkWeight  || 0.4);
    const attW = Number(settings.attendanceWeight || 0.3);
    const actW = Number(settings.activityWeight   || 0.3);
    const cutoff = dayjs(date).subtract(30, "day").format("YYYY-MM-DD");
    return groups.map(g => {
      const gStudents = students.filter(s => s.group === g.name);
      const ranked    = rankStudents(gStudents, records, settings, date);
      const avgScore  = groupAvgScore(gStudents, records, settings, 30, date) ?? 0;
      const avgCoins  = ranked.length ? Math.round(ranked.reduce((s,st)=>s+st.coins,0)/ranked.length) : 0;
      let dangerCount = 0, declineCount = 0, riseCount = 0;
      gStudents.forEach(s => {
        const recs = records.filter(r =>
          r.studentId === s.id && r.date >= cutoff &&
          (r.homework > 0 || r.attendance > 0 || r.activity > 0)
        );
        if (!recs.length) return;
        const n = recs.length;
        const avg30 = Math.min(100, Math.round(
          recs.reduce((sum,r)=>sum+Number(r.homework  ||0),0)/n * hwW +
          recs.reduce((sum,r)=>sum+Number(r.attendance||0),0)/n * attW +
          recs.reduce((sum,r)=>sum+Number(r.activity  ||0),0)/n * actW
        ));
        if (avg30 < 50)                                    dangerCount++;
        else if (isDeclineTrend(s.id, records, settings)) declineCount++;
        if (isRiseTrend(s.id, records, settings))         riseCount++;
      });
      return { group: g, students: ranked, avgScore, avgCoins, dangerCount, declineCount, riseCount };
    });
  }, [groups, students, records, settings, date]);

  return (
    <div className="page-stack">
      {groupStats.map(gs => {
        const isOpen = openGroup === gs.group.id;
        const tone   = gs.avgScore >= 70 ? "mint" : gs.avgScore >= 50 ? "gold" : "rose";
        const scoreColor = { mint: "var(--mint-dark)", gold: "var(--gold-dark)", rose: "var(--rose-dark)" }[tone];
        const scoreBg    = { mint: "#e8ffd6",          gold: "#fff9e0",          rose: "#ffe5e5"          }[tone];

        return (
          <section key={gs.group.id} className="panel" style={{ marginBottom: "16px" }}>
            {/* Header */}
            <PanelHeader
              icon={Users}
              title={gs.group.name}
              subtitle={`${gs.students.length} o'quvchi · oxirgi 30 kun o'rtachasi`}
              action={
                <button
                  type="button"
                  className={isOpen ? "secondary-button" : "primary-button"}
                  style={{ padding: "6px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}
                  onClick={() => setOpenGroup(isOpen ? null : gs.group.id)}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isOpen ? "Yopish" : "Natija"}
                </button>
              }
            />

            {/* Score + progress */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
              <div style={{ flex: 1, background: "var(--line)", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${gs.avgScore}%`, height: "100%", borderRadius: "999px",
                  background: { mint: "var(--mint)", gold: "var(--gold)", rose: "var(--rose)" }[tone],
                  transition: "width 0.5s"
                }} />
              </div>
              <span style={{ fontSize: "20px", fontWeight: 900, color: scoreColor, background: scoreBg, padding: "2px 14px", borderRadius: "999px", flexShrink: 0 }}>
                {gs.avgScore}%
              </span>
            </div>

            {/* Status badges */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {gs.dangerCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#ffe5e5", color: "var(--rose-dark)", border: "1px solid var(--rose)" }}>
                  ⚠️ {gs.dangerCount} xavfli
                </span>
              )}
              {gs.declineCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#ffedd5", color: "#c2410c", border: "1px solid #f97316" }}>
                  📉 {gs.declineCount} pasayotgan
                </span>
              )}
              {gs.riseCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#e8ffd6", color: "var(--mint-dark)", border: "1px solid var(--mint)" }}>
                  📈 {gs.riseCount} o'smoqda
                </span>
              )}
              {gs.dangerCount === 0 && gs.declineCount === 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#e8ffd6", color: "var(--mint-dark)", border: "1px solid var(--mint)" }}>
                  ✅ Hammasi yaxshi
                </span>
              )}
            </div>

            {/* Detail */}
            {isOpen && (
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px solid var(--line)" }}>
                <GroupDetail gs={gs} records={records} settings={settings} date={date} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
