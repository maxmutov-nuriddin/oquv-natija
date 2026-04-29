import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Award,
  CalendarDays,
  ChevronRight,
  Coins,
  Download,
  LayoutDashboard,
  Search,
  Settings,
  Trophy,
  Users
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useDashboardData } from "./hooks/useDashboardData";
import { groupForDate, rankStudents } from "./lib/scoring";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "groups", label: "Groups", icon: Users },
  { id: "settings", label: "Settings", icon: Settings }
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function rankBadge(rank) {
  if (rank === 1) return "1-o'rin";
  if (rank === 2) return "2-o'rin";
  if (rank === 3) return "3-o'rin";
  return `${rank}-o'rin`;
}

function Metric({ label, value, accent = "text-mint" }) {
  return (
    <div className="metric-card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cx("mt-1 text-lg font-bold", accent)}>{value}</p>
    </div>
  );
}

function ProgressLine({ label, value, tone }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-200">{value}%</span>
      </div>
      <div className="progress-track">
        <span className={cx("progress-fill", tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudentCard({ student, onUpdate }) {
  return (
    <article className="student-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="student-avatar">{initials(student.name)}</div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-50">{student.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{student.group}</p>
          </div>
        </div>
        <div className="coin-chip">
          <Coins size={15} />
          {student.coins} coin
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ProgressLine label="Uy vazifa" value={student.homeworkScore} tone="progress-homework" />
        <ProgressLine label="Davomat" value={student.attendanceScore} tone="progress-attendance" />
        <ProgressLine label="Dars aktivligi" value={student.activityScore} tone="progress-activity" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="pill">Hafta: {rankBadge(student.weeklyRank)}</span>
        <span className="pill">Oy: {rankBadge(student.monthlyRank)}</span>
        <span className="pill">Score: {student.finalScore}%</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ["homeworkScore", "HW"],
          ["attendanceScore", "DAV"],
          ["activityScore", "ACT"]
        ].map(([key, label]) => (
          <label className="score-edit" key={key}>
            <span>{label}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={student[key]}
              onChange={(event) => onUpdate(student.id, { [key]: Number(event.target.value) })}
              className="number-input"
              aria-label={key}
            />
          </label>
        ))}
      </div>
    </article>
  );
}

function Sidebar({ activePage, setActivePage, isDemo }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Award size={23} />
        </div>
        <div>
          <h1 className="text-lg font-black text-white">O'quv natija</h1>
          <p className="text-xs text-slate-400">Admin boshqaruvi</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cx("nav-button", activePage === item.id && "nav-button-active")}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="status-card">
        <p className="text-sm font-bold text-white">{isDemo ? "Demo mode" : "Firebase live"}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Firebase env sozlansa, Firestore collections real-time o'qiladi.
        </p>
      </div>
    </aside>
  );
}

function Header({ date, setDate, query, setQuery, selectedGroup, groups, setSelectedGroup }) {
  return (
    <header className="header">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <CalendarDays size={17} /> {dayjs(date).format("DD MMMM YYYY")}
        </p>
        <h2 className="mt-1 text-3xl font-black text-white">{selectedGroup || "Barcha guruhlar"}</h2>
      </div>
      <div className="header-controls">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O'quvchi qidirish" />
        </label>
        <input className="date-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <select className="select-input" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
          {groups.map((group) => (
            <option key={group.id} value={group.name}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

function DashboardPage({ students, records, settings, selectedGroup, date, query, onUpdate }) {
  const filtered = students
    .filter((student) => student.group === selectedGroup)
    .filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));
  const ranked = rankStudents(filtered, records, settings, date);
  const topStudent = ranked.slice().sort((a, b) => b.monthlyCoins - a.monthlyCoins)[0];

  const chartData = ranked.map((student) => ({
    name: student.name.split(" ")[0],
    coin: student.coins,
    score: student.finalScore
  }));
  const totalCoins = ranked.reduce((sum, student) => sum + student.coins, 0);
  const averageScore = ranked.length
    ? Math.round(ranked.reduce((sum, student) => sum + student.finalScore, 0) / ranked.length)
    : 0;

  return (
    <div className="space-y-6">
      <section className="summary-grid">
        <Metric label="O'quvchilar" value={ranked.length} accent="text-white" />
        <Metric label="Jami coin" value={totalCoins} accent="text-gold" />
        <Metric label="O'rtacha score" value={`${averageScore}%`} accent="text-mint" />
        <Metric label="Haftalik lider" value={ranked[0]?.name.split(" ")[0] || "-"} accent="text-cyan-300" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel min-h-[260px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="section-title">Bugungi guruh reytingi</h3>
              <p className="text-sm text-slate-400">Coin va final score bo'yicha umumiy ko'rinish.</p>
            </div>
            <Trophy className="text-gold" />
          </div>
          <div className="mt-6 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253044" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#101827", border: "1px solid #263244", borderRadius: 8 }} />
                <Bar dataKey="coin" fill="#38d39f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="score" fill="#f6c85f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel top-panel">
          <p className="text-sm text-slate-400">Top student of month</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{topStudent?.name || "Hali ma'lumot yo'q"}</h3>
          <p className="mt-3 text-5xl font-black text-gold">{topStudent?.monthlyCoins || 0}</p>
          <p className="mt-2 text-sm text-slate-400">oylik coin</p>
        </div>
      </section>

      <section className="student-grid">
        {ranked.map((student) => (
          <StudentCard key={student.id} student={student} onUpdate={onUpdate} />
        ))}
      </section>
    </div>
  );
}

function GroupsPage({ groups, students, records, settings, date, query }) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name || "");
  const ranked = rankStudents(
    students.filter((student) => student.group === activeGroup && student.name.toLowerCase().includes(query.toLowerCase())),
    records,
    settings,
    date
  );
  const monthly = ranked.map((student) => ({ name: student.name.split(" ")[0], monthly: student.monthlyCoins }));

  return (
    <div className="grid gap-6 xl:grid-cols-[290px_1fr]">
      <section className="panel">
        <h3 className="section-title">Guruhlar</h3>
        <div className="mt-5 space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className={cx("group-button", activeGroup === group.name && "group-button-active")}
              onClick={() => setActiveGroup(group.name)}
            >
              <span>{group.name}</span>
              <span>{students.filter((student) => student.group === group.name).length}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="section-title">{activeGroup} ranking</h3>
            <p className="text-sm text-slate-400">TOP 3 alohida highlight qilinadi.</p>
          </div>
          <ExportButton rows={ranked} groupName={activeGroup} />
        </div>

        <div className="chart-wrap mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#253044" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#101827", border: "1px solid #263244", borderRadius: 8 }} />
              <Area type="monotone" dataKey="monthly" stroke="#38d39f" fill="#38d39f" fillOpacity={0.16} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          {ranked.map((student, index) => (
            <div key={student.id} className={cx("rank-row", index < 3 && "rank-row-top")}>
              <div className="flex items-center gap-3">
                <div className="rank-index">{index + 1}</div>
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="text-xs text-slate-400">Weekly {student.weeklyCoins} coin · Monthly {student.monthlyCoins} coin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-mint">{student.coins}</p>
                <p className="text-xs text-slate-400">total coin</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExportButton({ rows, groupName }) {
  function exportRows() {
    const columns = ["Ism", "Guruh", "Uy vazifa %", "Davomat %", "Aktivlik %", "Coin", "Haftalik rank", "Oylik rank"];
    const body = rows
      .map((student) =>
        [
          student.name,
          student.group,
          student.homeworkScore,
          student.attendanceScore,
          student.activityScore,
          student.coins,
          student.weeklyRank,
          student.monthlyRank
        ]
          .map((value) => `<td>${String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</td>`)
          .join("")
      )
      .map((cells) => `<tr>${cells}</tr>`)
      .join("");
    const table = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr>${columns
      .map((column) => `<th>${column}</th>`)
      .join("")}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${groupName}-ranking.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="primary-button" onClick={exportRows}>
      <Download size={17} />
      Excel
    </button>
  );
}

function SettingsPage({ settings, saveSettings }) {
  const [draft, setDraft] = useState(settings);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  return (
    <section className="panel max-w-4xl">
      <h3 className="section-title">Admin sozlamalari</h3>
      <p className="mt-2 text-sm text-slate-400">Reward system va final score formulasi shu yerdan boshqariladi.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SettingInput label="Homework coin" value={draft.homeworkCoin} onChange={(value) => update("homeworkCoin", value)} />
        <SettingInput label="Attendance coin" value={draft.attendanceCoin} onChange={(value) => update("attendanceCoin", value)} />
        <SettingInput label="Activity coin" value={draft.activityCoin} onChange={(value) => update("activityCoin", value)} />
      </div>

      <div className="mt-8 rounded-lg border border-line bg-ink/40 p-5">
        <h4 className="font-semibold text-white">Formula editor</h4>
        <p className="mt-2 text-sm text-slate-400">
          Final Score = (Homework% * {draft.homeworkWeight}) + (Attendance% * {draft.attendanceWeight}) + (Activity% *{" "}
          {draft.activityWeight})
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SettingInput step="0.1" label="HW weight" value={draft.homeworkWeight} onChange={(value) => update("homeworkWeight", value)} />
          <SettingInput
            step="0.1"
            label="Attendance weight"
            value={draft.attendanceWeight}
            onChange={(value) => update("attendanceWeight", value)}
          />
          <SettingInput step="0.1" label="Activity weight" value={draft.activityWeight} onChange={(value) => update("activityWeight", value)} />
        </div>
      </div>

      <button className="primary-button mt-6" onClick={() => saveSettings(draft)}>
        <Settings size={17} />
        Saqlash
      </button>
    </section>
  );
}

function SettingInput({ label, value, onChange, step = "1" }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input className="setting-input" type="number" step={step} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function App() {
  const { students, groups, records, settings, loading, isDemo, saveSettings, updateStudent } = useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [query, setQuery] = useState("");
  const automaticGroup = useMemo(() => groupForDate(groups, date)?.name || groups[0]?.name || "", [groups, date]);
  const [manualGroup, setManualGroup] = useState("");
  const selectedGroup = manualGroup || automaticGroup;

  return (
    <div className="min-h-screen bg-ink text-slate-200">
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} isDemo={isDemo} />
        <main className="main-content">
          <Header
            date={date}
            setDate={(value) => {
              setDate(value);
              setManualGroup("");
            }}
            query={query}
            setQuery={setQuery}
            selectedGroup={selectedGroup}
            groups={groups}
            setSelectedGroup={setManualGroup}
          />

          {loading && <div className="panel">Firebase ma'lumotlari yuklanmoqda...</div>}
          {!loading && activePage === "dashboard" && (
            <DashboardPage
              students={students}
              records={records}
              settings={settings}
              selectedGroup={selectedGroup}
              date={date}
              query={query}
              onUpdate={updateStudent}
            />
          )}
          {!loading && activePage === "groups" && (
            <GroupsPage groups={groups} students={students} records={records} settings={settings} date={date} query={query} />
          )}
          {!loading && activePage === "settings" && <SettingsPage settings={settings} saveSettings={saveSettings} />}
        </main>
      </div>
      <div className="fixed bottom-5 right-5 hidden rounded-full border border-line bg-panel/90 px-4 py-2 text-xs text-slate-400 shadow-glow backdrop-blur md:block">
        Auto rank · weekly reset view · monthly archive ready <ChevronRight className="ml-1 inline" size={14} />
      </div>
    </div>
  );
}
