import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Activity,
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Coins,
  Download,
  LayoutDashboard,
  Medal,
  Search,
  Settings,
  SlidersHorizontal,
  Trophy,
  UserRound,
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
  { id: "dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { id: "groups", label: "Guruhlar", icon: Users },
  { id: "settings", label: "Sozlamalar", icon: Settings }
];

const scoreFields = [
  { key: "homeworkScore", label: "Uy vazifa", short: "HW", icon: BookOpenCheck },
  { key: "attendanceScore", label: "Davomat", short: "DAV", icon: CheckCircle2 },
  { key: "activityScore", label: "Aktivlik", short: "ACT", icon: Activity }
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function rankText(rank) {
  if (rank === 1) return "1-o'rin";
  if (rank === 2) return "2-o'rin";
  if (rank === 3) return "3-o'rin";
  return `${rank}-o'rin`;
}

function medalLabel(index) {
  if (index === 0) return "TOP 1";
  if (index === 1) return "TOP 2";
  if (index === 2) return "TOP 3";
  return `#${index + 1}`;
}

function percent(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function Sidebar({ activePage, setActivePage, isDemo }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Award size={22} />
        </div>
        <div>
          <h1>O'quv natija</h1>
          <p>Admin dashboard</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cx("nav-button", activePage === item.id && "nav-button-active")}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <span className={cx("live-dot", isDemo ? "live-dot-demo" : "live-dot-online")} />
        <div>
          <strong>{isDemo ? "Demo ma'lumot" : "Firebase live"}</strong>
          <p>O'zgarishlar real-time yangilanadi.</p>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ activePage, date, setDate, query, setQuery, selectedGroup, groups, setSelectedGroup }) {
  const pageTitle = navItems.find((item) => item.id === activePage)?.label || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="eyebrow">Bugungi nazorat</span>
        <h2>{pageTitle}</h2>
        <p>{dayjs(date).format("DD MMMM YYYY")} uchun {selectedGroup || "guruh"} ma'lumotlari.</p>
      </div>

      <div className="control-row">
        <label className="control control-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O'quvchi qidirish" />
        </label>

        <label className="control control-date">
          <CalendarDays size={17} />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label className="control control-select">
          <Users size={17} />
          <select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = "mint" }) {
  return (
    <article className={cx("stat-card", `stat-${tone}`)}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {hint && <span>{hint}</span>}
      </div>
    </article>
  );
}

function ProgressLine({ label, value, tone }) {
  return (
    <div className="progress-line">
      <div>
        <span>{label}</span>
        <strong>{percent(value)}%</strong>
      </div>
      <div className="progress-track">
        <i className={tone} style={{ width: `${percent(value)}%` }} />
      </div>
    </div>
  );
}

function StudentCard({ student, onUpdate, index }) {
  return (
    <article className={cx("student-card", index < 3 && "student-card-top")}>
      <div className="student-head">
        <div className="student-person">
          <div className="avatar">{initials(student.name)}</div>
          <div>
            <h3>{student.name}</h3>
            <p>{student.group} · {rankText(student.weeklyRank)} hafta</p>
          </div>
        </div>
        <div className="coin-badge">
          <Coins size={15} />
          {student.coins}
        </div>
      </div>

      <div className="student-score">
        <span>Final score</span>
        <strong>{student.finalScore}%</strong>
      </div>

      <div className="student-progress">
        <ProgressLine label="Uy vazifa" value={student.homeworkScore} tone="tone-homework" />
        <ProgressLine label="Davomat" value={student.attendanceScore} tone="tone-attendance" />
        <ProgressLine label="Aktivlik" value={student.activityScore} tone="tone-activity" />
      </div>

      <div className="rank-chips">
        <span>Hafta: {rankText(student.weeklyRank)}</span>
        <span>Oy: {rankText(student.monthlyRank)}</span>
      </div>

      <div className="quick-edit">
        {scoreFields.map((field) => {
          const Icon = field.icon;
          return (
            <label key={field.key}>
              <span>
                <Icon size={13} />
                {field.short}
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={student[field.key]}
                onChange={(event) => onUpdate(student.id, { [field.key]: Number(event.target.value) })}
                aria-label={field.label}
              />
            </label>
          );
        })}
      </div>
    </article>
  );
}

function PanelHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="panel-header">
      <div className="panel-title">
        <span>
          <Icon size={18} />
        </span>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function DashboardPage({ students, records, settings, selectedGroup, date, query, onUpdate }) {
  const ranked = useMemo(() => {
    const filtered = students
      .filter((student) => student.group === selectedGroup)
      .filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));
    return rankStudents(filtered, records, settings, date);
  }, [students, selectedGroup, query, records, settings, date]);

  const chartData = ranked.map((student) => ({
    name: student.name.split(" ")[0],
    coin: student.coins,
    score: student.finalScore
  }));
  const totalCoins = ranked.reduce((sum, student) => sum + student.coins, 0);
  const averageScore = ranked.length ? Math.round(ranked.reduce((sum, student) => sum + student.finalScore, 0) / ranked.length) : 0;
  const topStudent = [...ranked].sort((a, b) => b.monthlyCoins - a.monthlyCoins)[0];

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard icon={Users} label="O'quvchilar" value={ranked.length} hint={selectedGroup} />
        <StatCard icon={Coins} label="Jami coin" value={totalCoins} hint="tanlangan guruh" tone="gold" />
        <StatCard icon={BarChart3} label="O'rtacha score" value={`${averageScore}%`} hint="final formula" tone="cyan" />
        <StatCard icon={Trophy} label="Oylik lider" value={topStudent?.name.split(" ")[0] || "-"} hint={`${topStudent?.monthlyCoins || 0} coin`} tone="rose" />
      </section>

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <PanelHeader icon={BarChart3} title="Guruh statistikasi" subtitle="Coin va final score taqqoslash" />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe3ef", borderRadius: 8, color: "#0f172a" }} />
                <Bar dataKey="coin" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="winner-panel">
          <div className="winner-icon">
            <Medal size={28} />
          </div>
          <span>Top student of month</span>
          <h3>{topStudent?.name || "Hali ma'lumot yo'q"}</h3>
          <strong>{topStudent?.monthlyCoins || 0} coin</strong>
          <p>Oylik natija bo'yicha eng yuqori ko'rsatkich.</p>
        </aside>
      </section>

      <section className="panel">
        <PanelHeader icon={UserRound} title="O'quvchilar" subtitle="Foizlarni o'zgartirsangiz rank avtomatik yangilanadi" />
        <div className="student-grid">
          {ranked.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} onUpdate={onUpdate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function GroupsPage({ groups, students, records, settings, date, query }) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name || "");
  const ranked = useMemo(() => {
    return rankStudents(
      students.filter((student) => student.group === activeGroup && student.name.toLowerCase().includes(query.toLowerCase())),
      records,
      settings,
      date
    );
  }, [students, activeGroup, query, records, settings, date]);

  const monthly = ranked.map((student) => ({ name: student.name.split(" ")[0], monthly: student.monthlyCoins }));

  return (
    <div className="groups-layout">
      <section className="panel group-list-panel">
        <PanelHeader icon={Users} title="Guruhlar" subtitle="Guruhni tanlang" />
        <div className="group-list">
          {groups.map((group) => {
            const count = students.filter((student) => student.group === group.name).length;
            return (
              <button key={group.id} className={cx("group-card", activeGroup === group.name && "group-card-active")} onClick={() => setActiveGroup(group.name)}>
                <div>
                  <strong>{group.name}</strong>
                  <span>{count} o'quvchi</span>
                </div>
                <Users size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <PanelHeader
          icon={Trophy}
          title={`${activeGroup} ranking`}
          subtitle="Coin bo'yicha tartiblangan haftalik va oylik natijalar"
          action={<ExportButton rows={ranked} groupName={activeGroup} />}
        />

        <div className="chart-box chart-box-small">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe3ef", borderRadius: 8, color: "#0f172a" }} />
              <Area type="monotone" dataKey="monthly" stroke="#16a34a" fill="#16a34a" fillOpacity={0.14} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="leaderboard">
          {ranked.map((student, index) => (
            <div key={student.id} className={cx("leader-row", index < 3 && "leader-row-top")}>
              <div className="leader-main">
                <span className="leader-rank">{medalLabel(index)}</span>
                <div className="avatar avatar-small">{initials(student.name)}</div>
                <div>
                  <strong>{student.name}</strong>
                  <p>Weekly {student.weeklyCoins} coin · Monthly {student.monthlyCoins} coin</p>
                </div>
              </div>
              <div className="leader-score">
                <strong>{student.coins}</strong>
                <span>total coin</span>
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
    <div className="settings-layout">
      <section className="panel">
        <PanelHeader icon={SlidersHorizontal} title="Reward system" subtitle="Coin qiymatlarini o'zingizga moslang" />
        <div className="settings-grid">
          <SettingInput label="Homework coin" value={draft.homeworkCoin} onChange={(value) => update("homeworkCoin", value)} />
          <SettingInput label="Attendance coin" value={draft.attendanceCoin} onChange={(value) => update("attendanceCoin", value)} />
          <SettingInput label="Activity coin" value={draft.activityCoin} onChange={(value) => update("activityCoin", value)} />
        </div>
      </section>

      <section className="panel formula-panel">
        <PanelHeader icon={BarChart3} title="Formula editor" subtitle="Final score og'irliklari" />
        <div className="formula-preview">
          Final Score = Homework% * {draft.homeworkWeight} + Attendance% * {draft.attendanceWeight} + Activity% * {draft.activityWeight}
        </div>
        <div className="settings-grid">
          <SettingInput step="0.1" label="HW weight" value={draft.homeworkWeight} onChange={(value) => update("homeworkWeight", value)} />
          <SettingInput step="0.1" label="Attendance weight" value={draft.attendanceWeight} onChange={(value) => update("attendanceWeight", value)} />
          <SettingInput step="0.1" label="Activity weight" value={draft.activityWeight} onChange={(value) => update("activityWeight", value)} />
        </div>
        <button className="primary-button save-button" onClick={() => saveSettings(draft)}>
          <Settings size={17} />
          Saqlash
        </button>
      </section>
    </div>
  );
}

function SettingInput({ label, value, onChange, step = "1" }) {
  return (
    <label className="setting-field">
      <span>{label}</span>
      <input type="number" step={step} value={value} onChange={(event) => onChange(event.target.value)} />
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
    <div className="app-bg">
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} isDemo={isDemo} />
        <main className="main-content">
          <Topbar
            activePage={activePage}
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

          {loading && <div className="panel loading-panel">Firebase ma'lumotlari yuklanmoqda...</div>}
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
    </div>
  );
}
