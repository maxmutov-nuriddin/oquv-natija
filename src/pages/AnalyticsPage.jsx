import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { groupAvgScore, isDeclineTrend, isRiseTrend, rankStudents } from "../lib/scoring";
import { PanelHeader } from "../components/ui/PanelHeader";
import { useT } from "../i18n/index.jsx";
import { initials } from "../lib/utils";

const MN_UZ = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
const MN_RU = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

function buildMonthlyData(studentIds, records, settings) {
  const hwW  = Number(settings.homeworkWeight  || 0.4);
  const attW = Number(settings.attendanceWeight || 0.3);
  const actW = Number(settings.activityWeight   || 0.3);
  const idSet = new Set(studentIds);
  const byMonth = {};
  records.forEach(r => {
    if (!idSet.has(r.studentId) || !r.date) return;
    if (!r.homework && !r.attendance && !r.activity) return;
    const m = r.date.slice(0, 7);
    (byMonth[m] = byMonth[m] || []).push(r);
  });
  return Object.keys(byMonth).sort().map(m => {
    const recs = byMonth[m];
    const n = recs.length;
    const hw  = recs.reduce((s,r) => s + Number(r.homework   || 0), 0) / n;
    const att = recs.reduce((s,r) => s + Number(r.attendance || 0), 0) / n;
    const act = recs.reduce((s,r) => s + Number(r.activity   || 0), 0) / n;
    const score = Math.min(100, Math.round(hw*hwW + att*attW + act*actW));
    const [y, mo] = m.split("-");
    return { month: m, y, mo: Number(mo), score, hw: Math.round(hw), att: Math.round(att), act: Math.round(act), count: n };
  });
}

function ChartTooltip({ active, payload, lang }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const mn = lang === "ru" ? MN_RU : MN_UZ;
  const isRu = lang === "ru";
  return (
    <div style={{ background: "white", border: "2px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12, minWidth: 150 }}>
      <div style={{ fontWeight: 900, marginBottom: 7, color: "#1e293b", fontSize: 13 }}>
        {mn[d.mo - 1]} {d.y} · <span style={{ color: "#64748b", fontWeight: 600 }}>{d.count} {isRu ? "уроков" : "dars"}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontWeight: 900, color: payload[0].color, fontSize: 14 }}>{isRu ? "Итог" : "Umumiy"}: {d.score}%</div>
        <div style={{ color: "#64748b", fontWeight: 700 }}>📚 {isRu ? "Дз" : "Uy ishi"}: {d.hw}%</div>
        <div style={{ color: "#64748b", fontWeight: 700 }}>✅ {isRu ? "Посещ" : "Davomat"}: {d.att}%</div>
        <div style={{ color: "#64748b", fontWeight: 700 }}>⚡ {isRu ? "Актив" : "Faollik"}: {d.act}%</div>
      </div>
    </div>
  );
}

function GroupHistoryChart({ studentIds, records, settings, tone, groupId }) {
  const { lang } = useT();
  const mn = lang === "ru" ? MN_RU : MN_UZ;
  const LINE_COLOR = { mint: "#58cc02", gold: "#e5b400", rose: "#ff4b4b" }[tone] || "#1cb0f6";
  const data = useMemo(() => buildMonthlyData(studentIds, records, settings), [studentIds, records, settings]);
  if (data.length < 2) return null;

  const gradId = `ag-${groupId}`;
  const labeledData = data.map(d => ({ ...d, label: `${mn[d.mo - 1]} ${d.y.slice(2)}` }));
  const minScore = Math.max(0, Math.min(...data.map(d => d.score)) - 10);

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid var(--line)" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
        📈 {lang === "ru" ? "История по месяцам" : "Oylik natijalar tarixi"}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={labeledData} margin={{ top: 6, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%"  stopColor={LINE_COLOR} stopOpacity={0.25} />
              <stop offset="95%" stopColor={LINE_COLOR} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} />
          <YAxis domain={[minScore, 100]} tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <ReferenceLine y={70} stroke="#86efac" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "70", position: "right", fontSize: 10, fill: "#86efac" }} />
          <ReferenceLine y={50} stroke="#fca5a5" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "50", position: "right", fontSize: 10, fill: "#fca5a5" }} />
          <Tooltip content={<ChartTooltip lang={lang} />} />
          <Area
            type="monotone" dataKey="score"
            stroke={LINE_COLOR} strokeWidth={3}
            fill={`url(#${gradId})`}
            dot={{ fill: LINE_COLOR, r: 5, strokeWidth: 2.5, stroke: "white" }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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
  const { t } = useT();
  const mainProblemMap = { hw: t.metric_hw, att: t.metric_att, act: t.metric_act };
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
              {t.analytics_lesson_avg(s.lessonCount)}
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
          ↓ {t.analytics_main_problem}: {mainProblemMap[s.bottleneck]} · {({ hw: s.hw, att: s.att, act: s.act }[s.bottleneck])}%
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <MetricRow label={t.metric_hw}  val={s.hw}  />
        <MetricRow label={t.metric_att} val={s.att} />
        <MetricRow label={t.metric_act} val={s.act} />
      </div>
    </div>
  );
}

function useSections() {
  const { t } = useT();
  return [
    { key: "dangerous", icon: AlertTriangle, label: t.analytics_danger_label,  sub: t.analytics_danger_sub,  accentColor: "var(--rose)",  accentBg: "#ffe5e5", empty: t.analytics_danger_empty  },
    { key: "declining", icon: TrendingDown,  label: t.analytics_decline_label, sub: t.analytics_decline_sub, accentColor: "#f97316",      accentBg: "#ffedd5", empty: t.analytics_decline_empty },
    { key: "rising",    icon: TrendingUp,    label: t.analytics_rise_label,    sub: t.analytics_rise_sub,    accentColor: "var(--mint)",  accentBg: "#e8ffd6", empty: t.analytics_rise_empty    },
  ];
}

function GroupDetail({ gs, records, settings, date }) {
  const { t } = useT();
  const SECTIONS = useSections();
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
      let sumHw = 0, sumAtt = 0, sumAct = 0, activeCount = 0;
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
        sumHw  += recs.reduce((sum,r)=>sum+Number(r.homework  ||0),0)/n;
        sumAtt += recs.reduce((sum,r)=>sum+Number(r.attendance||0),0)/n;
        sumAct += recs.reduce((sum,r)=>sum+Number(r.activity  ||0),0)/n;
        activeCount++;
      });

      let groupBottleneck = null;
      if (activeCount > 0) {
        const grpHw  = Math.round(sumHw  / activeCount);
        const grpAtt = Math.round(sumAtt / activeCount);
        const grpAct = Math.round(sumAct / activeCount);
        const hwLoss  = (100 - grpHw)  * hwW;
        const attLoss = (100 - grpAtt) * attW;
        const actLoss = (100 - grpAct) * actW;
        let key = "hw", val = grpHw;
        if (attLoss >= hwLoss && attLoss >= actLoss) { key = "att"; val = grpAtt; }
        else if (actLoss >= hwLoss && actLoss >= attLoss) { key = "act"; val = grpAct; }
        if (val < 75) groupBottleneck = { key, val, hw: grpHw, att: grpAtt, act: grpAct };
      }

      const studentIds = gStudents.map(s => s.id);
      return { group: g, students: ranked, studentIds, avgScore, avgCoins, dangerCount, declineCount, riseCount, groupBottleneck };
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
              subtitle={t.analytics_students_sub(gs.students.length)}
              action={
                <button
                  type="button"
                  className={isOpen ? "secondary-button" : "primary-button"}
                  style={{ padding: "6px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}
                  onClick={() => setOpenGroup(isOpen ? null : gs.group.id)}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isOpen ? t.analytics_close : t.analytics_open}
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

            {/* Group bottleneck */}
            {gs.groupBottleneck && (() => {
              const METRIC = { hw: t.metric_hw, att: t.metric_att, act: t.metric_act };
              const bn = gs.groupBottleneck;
              const isWeak = bn.val < 50;
              return (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: isWeak ? "#fff5f5" : "#fff9e0",
                  border: `1px solid ${isWeak ? "var(--rose)" : "var(--gold)"}`,
                  borderRadius: "10px", padding: "6px 12px", marginBottom: "12px",
                  fontSize: "13px", fontWeight: 800,
                  color: isWeak ? "var(--rose-dark)" : "#92400e"
                }}>
                  <span>{isWeak ? "⚠️" : "📌"}</span>
                  <span>{t.analytics_bottleneck}: {METRIC[bn.key]} — {bn.val}%</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: "var(--muted)" }}>
                    📚{bn.hw}% · ✅{bn.att}% · ⚡{bn.act}%
                  </span>
                </div>
              );
            })()}

            {/* Status badges */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {gs.dangerCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#ffe5e5", color: "var(--rose-dark)", border: "1px solid var(--rose)" }}>
                  {t.analytics_danger_badge(gs.dangerCount)}
                </span>
              )}
              {gs.declineCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#ffedd5", color: "#c2410c", border: "1px solid #f97316" }}>
                  {t.analytics_decline_badge(gs.declineCount)}
                </span>
              )}
              {gs.riseCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#e8ffd6", color: "var(--mint-dark)", border: "1px solid var(--mint)" }}>
                  {t.analytics_rise_badge(gs.riseCount)}
                </span>
              )}
              {gs.dangerCount === 0 && gs.declineCount === 0 && (
                <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: "#e8ffd6", color: "var(--mint-dark)", border: "1px solid var(--mint)" }}>
                  {t.analytics_all_good}
                </span>
              )}
            </div>

            {/* Detail */}
            {isOpen && (
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px solid var(--line)" }}>
                <GroupHistoryChart
                  studentIds={gs.studentIds}
                  records={records}
                  settings={settings}
                  tone={tone}
                  groupId={gs.group.id}
                />
                <GroupDetail gs={gs} records={records} settings={settings} date={date} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
