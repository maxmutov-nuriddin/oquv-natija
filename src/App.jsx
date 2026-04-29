import { useEffect, useMemo, useState } from "react";
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
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trophy,
  Trash2,
  UserPlus,
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
import { useTeacherAuth } from "./hooks/useTeacherAuth";
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

const weekDays = [
  { value: 1, label: "Du" },
  { value: 2, label: "Se" },
  { value: 3, label: "Ch" },
  { value: 4, label: "Pa" },
  { value: 5, label: "Ju" },
  { value: 6, label: "Sh" },
  { value: 0, label: "Ya" }
];

const lessonStartOptions = Array.from({ length: 20 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
});

function addLessonDuration(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + 90;
  const endHour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endMinute = String(totalMinutes % 60).padStart(2, "0");
  return `${endHour}:${endMinute}`;
}

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

function isValidLessonTime(time) {
  if (!time) return false;
  const [hour, minute] = time.split(":").map(Number);
  return hour >= 9 && hour <= 20 && [0, 30].includes(minute) && !(hour === 20 && minute > 0);
}

function Sidebar({ activePage, setActivePage, isDemo, teacher, logout }) {
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
      <div className="teacher-box">
        <div className="avatar avatar-small">{initials(teacher?.name || "O")}</div>
        <div>
          <strong>{teacher?.name || "O'qituvchi"}</strong>
          <p>{teacher?.phone}</p>
        </div>
        <button type="button" onClick={logout}>Chiqish</button>
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
            {!groups.length && <option value="">Guruh yo'q</option>}
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

function GroupForm({ addGroup }) {
  const [name, setName] = useState("");
  const [weekdays, setWeekdays] = useState([]);
  const [lessonStart, setLessonStart] = useState("");
  const [timeError, setTimeError] = useState("");
  const [saving, setSaving] = useState(false);
  const lessonEnd = addLessonDuration(lessonStart);

  async function submit(event) {
    event.preventDefault();
    if (!weekdays.length) {
      setTimeError("Kamida bitta dars kunini tanlang.");
      return;
    }
    if (!isValidLessonTime(lessonStart)) {
      setTimeError("Boshlanish vaqti 09:00 dan 20:00 gacha, daqiqa faqat 00 yoki 30 bo'lishi kerak.");
      return;
    }
    if (!lessonEnd || lessonEnd > "20:00") {
      setTimeError("Dars 1 soat 30 daqiqa bo'lgani uchun eng kech boshlanish 18:30 bo'lishi kerak.");
      return;
    }
    setTimeError("");
    setSaving(true);
    try {
      await addGroup({ name, weekdays, lessonStart, lessonEnd });
      setName("");
      setWeekdays([]);
      setLessonStart("");
    } catch (error) {
      setTimeError(
        error?.code === "permission-denied"
          ? "Firebase ruxsat bermadi. Firestore rules yoki Anonymous Auth sozlamasini tekshiring."
          : `Guruh qo'shilmadi: ${error?.message || "noma'lum xato"}`
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day) {
    setWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <div className="entry-form-head">
        <Plus size={18} />
        <strong>Guruh qo'shish</strong>
      </div>
      <label>
        <span>Guruh nomi</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: IELTS A" required />
      </label>
      <div className="weekday-picker" aria-label="Dars kunlari">
        {weekDays.map((day) => (
          <button
            key={day.value}
            type="button"
            className={cx(weekdays.includes(day.value) && "weekday-active")}
            onClick={() => toggleDay(day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>
      <div className="time-grid">
        <label>
          <span>Boshlanish</span>
          <select value={lessonStart} onChange={(event) => setLessonStart(event.target.value)} required>
            <option value="">Tanlang</option>
            {lessonStartOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tugash</span>
          <input value={lessonEnd || "Avto"} readOnly />
        </label>
      </div>
      {timeError && <p className="form-error">{timeError}</p>}
      <button className="primary-button" type="submit" disabled={saving}>
        <Plus size={16} />
        {saving ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

function StudentForm({ groups, addStudent, selectedGroup }) {
  const [form, setForm] = useState({
    name: "",
    group: selectedGroup || groups[0]?.name || "",
    homeworkScore: 0,
    attendanceScore: 0,
    activityScore: 0
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.group && (selectedGroup || groups[0]?.name)) {
      setForm((current) => ({ ...current, group: selectedGroup || groups[0]?.name || "" }));
    }
  }, [groups, selectedGroup, form.group]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addStudent(form);
      setForm((current) => ({ ...current, name: "", homeworkScore: 0, attendanceScore: 0, activityScore: 0 }));
    } catch (submitError) {
      setError(
        submitError?.code === "permission-denied"
          ? "Firebase ruxsat bermadi. Firestore rules yoki Anonymous Auth sozlamasini tekshiring."
          : `O'quvchi qo'shilmadi: ${submitError?.message || "noma'lum xato"}`
      );
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <div className="entry-form-head">
        <UserPlus size={18} />
        <strong>O'quvchi qo'shish</strong>
      </div>
      <label>
        <span>Ism familiya</span>
        <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="O'quvchi ismi" required />
      </label>
      <label>
        <span>Guruh</span>
        <select value={form.group} onChange={(event) => update("group", event.target.value)} required disabled={!groups.length}>
          {!groups.length && <option value="">Avval guruh qo'shing</option>}
          {groups.map((group) => (
            <option key={group.id} value={group.name}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-score-grid">
        {scoreFields.map((field) => (
          <label key={field.key}>
            <span>{field.short}</span>
            <input type="number" min="0" max="100" value={form[field.key]} onChange={(event) => update(field.key, Number(event.target.value))} />
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={!groups.length || saving}>
        <UserPlus size={16} />
        {saving ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <Users size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
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

function StudentCard({ student, onUpdate, onDelete, index }) {
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
      <button className="danger-button student-delete" type="button" onClick={() => onDelete(student)}>
        <Trash2 size={15} />
        O'chirish
      </button>
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

function LessonEntryPanel({ group, students, records, date, settings, saveLessonRecords }) {
  const [entries, setEntries] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedWeekday = dayjs(date).day();
  const dayLabel = weekDays.find((day) => day.value === selectedWeekday)?.label || "";
  const isLessonDay = Boolean(group?.weekdays?.includes(selectedWeekday));

  useEffect(() => {
    const nextEntries = {};
    students.forEach((student) => {
      const record = records.find((item) => item.studentId === student.id && item.date === date);
      nextEntries[student.id] = {
        homeworkScore: record?.homework ?? student.homeworkScore ?? 0,
        attendanceScore: record?.attendance ?? student.attendanceScore ?? 0,
        activityScore: record?.activity ?? student.activityScore ?? 0
      };
    });
    setEntries((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextEntries);
      const sameLength = currentKeys.length === nextKeys.length;
      const sameValues =
        sameLength &&
        nextKeys.every((studentId) => {
          const currentEntry = current[studentId];
          const nextEntry = nextEntries[studentId];
          return (
            currentEntry &&
            currentEntry.homeworkScore === nextEntry.homeworkScore &&
            currentEntry.attendanceScore === nextEntry.attendanceScore &&
            currentEntry.activityScore === nextEntry.activityScore
          );
        });

      return sameValues ? current : nextEntries;
    });
  }, [students, records, date]);

  function update(studentId, key, value) {
    const cleanValue = Math.max(0, Math.min(100, Number(value || 0)));
    setEntries((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        [key]: cleanValue
      }
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await saveLessonRecords({
        date,
        settings,
        students: students.map((student) => ({
          ...student,
          ...entries[student.id]
        }))
      });
      setMessage("Dars natijalari saqlandi.");
    } catch (error) {
      setMessage(`Saqlanmadi: ${error?.message || "noma'lum xato"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel lesson-panel">
      <PanelHeader
        icon={BookOpenCheck}
        title="Dars baholash"
        subtitle={`${dayLabel} · ${group?.lessonStart || "--:--"} - ${group?.lessonEnd || "--:--"}`}
      />
      {!isLessonDay && (
        <p className="lesson-warning">Tanlangan sana bu guruhning dars kuni emas. Kerak bo'lsa yuqoridan boshqa sanani tanlang.</p>
      )}
      {!students.length && <EmptyState title="O'quvchi yo'q" text="Avval shu guruhga o'quvchi qo'shing." />}
      {!!students.length && (
        <form onSubmit={submit}>
          <div className="lesson-table">
            <div className="lesson-table-head">
              <span>O'quvchi</span>
              <span>Uy vazifa %</span>
              <span>Davomat %</span>
              <span>Aktivlik %</span>
            </div>
            {students.map((student) => (
              <div className="lesson-row" key={student.id}>
                <div className="lesson-student">
                  <div className="avatar avatar-small">{initials(student.name)}</div>
                  <strong>{student.name}</strong>
                </div>
                {scoreFields.map((field) => (
                  <input
                    key={field.key}
                    type="number"
                    min="0"
                    max="100"
                    value={entries[student.id]?.[field.key] ?? 0}
                    onChange={(event) => update(student.id, field.key, event.target.value)}
                    aria-label={`${student.name} ${field.label}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {message && <p className={cx("lesson-message", message.startsWith("Saqlanmadi") && "lesson-message-error")}>{message}</p>}
          <button className="primary-button save-button" type="submit" disabled={saving}>
            <CheckCircle2 size={17} />
            {saving ? "Saqlanmoqda..." : "Dars natijasini saqlash"}
          </button>
        </form>
      )}
    </section>
  );
}

function DashboardPage({ students, records, settings, selectedGroup, date, query, onUpdate, onDeleteStudent }) {
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
            <ResponsiveContainer width="100%" height={280}>
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
        {!selectedGroup && <EmptyState title="Hali guruh yo'q" text="Guruhlar sahifasidan birinchi guruhingizni qo'shing." />}
        {selectedGroup && !ranked.length && <EmptyState title="Bu guruhda o'quvchi yo'q" text="Guruhlar sahifasidan o'quvchi qo'shing." />}
        {!!ranked.length && (
          <div className="student-grid">
            {ranked.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} onUpdate={onUpdate} onDelete={onDeleteStudent} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GroupsPage({ groups, students, records, settings, date, query, addGroup, addStudent, saveLessonRecords, deleteStudent, selectedGroup }) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name || "");
  useEffect(() => {
    if (!activeGroup && (selectedGroup || groups[0]?.name)) {
      setActiveGroup(selectedGroup || groups[0]?.name || "");
    }
    if (activeGroup && groups.length && !groups.some((group) => group.name === activeGroup)) {
      setActiveGroup(groups[0]?.name || "");
    }
  }, [activeGroup, groups, selectedGroup]);

  const activeGroupObject = useMemo(() => groups.find((group) => group.name === activeGroup), [groups, activeGroup]);
  const activeGroupStudents = useMemo(() => students.filter((student) => student.group === activeGroup), [students, activeGroup]);

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
        {!groups.length && <EmptyState title="Guruh yo'q" text="Pastdagi forma orqali yangi guruh qo'shing." />}
        {!!groups.length && (
          <div className="group-list">
            {groups.map((group) => {
              const count = students.filter((student) => student.group === group.name).length;
              return (
                <button key={group.id} className={cx("group-card", activeGroup === group.name && "group-card-active")} onClick={() => setActiveGroup(group.name)}>
                  <div>
                    <strong>{group.name}</strong>
                    <span>{count} o'quvchi</span>
                    <span>{group.lessonStart && group.lessonEnd ? `${group.lessonStart} - ${group.lessonEnd}` : "Vaqt belgilanmagan"}</span>
                  </div>
                  <Users size={18} />
                </button>
              );
            })}
          </div>
        )}
        <div className="form-stack">
          <GroupForm addGroup={addGroup} />
          <StudentForm groups={groups} selectedGroup={activeGroup} addStudent={addStudent} />
        </div>
      </section>

      <div className="group-workspace">
        {activeGroupObject && (
          <LessonEntryPanel
            group={activeGroupObject}
            students={activeGroupStudents}
            records={records}
            date={date}
            settings={settings}
            saveLessonRecords={saveLessonRecords}
          />
        )}

      <section className="panel">
        <PanelHeader
          icon={Trophy}
          title={`${activeGroup} ranking`}
          subtitle="Coin bo'yicha tartiblangan haftalik va oylik natijalar"
          action={<ExportButton rows={ranked} groupName={activeGroup} />}
        />

        {!activeGroup && <EmptyState title="Ranking bo'sh" text="Avval guruh va o'quvchi qo'shing." />}
        {activeGroup && !ranked.length && <EmptyState title="Bu guruhda o'quvchi yo'q" text="Chap paneldan o'quvchi qo'shsangiz ranking paydo bo'ladi." />}
        {!!ranked.length && (
          <>
            <div className="chart-box chart-box-small">
              <ResponsiveContainer width="100%" height={230}>
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
                  <button className="danger-icon-button" type="button" onClick={() => deleteStudent(student)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      </div>
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

function AuthPage({ login, register, normalizePhone }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: key === "phone" ? normalizePhone(value) : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "register") {
        await register(form);
      } else {
        await login(form);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">
            <Award size={24} />
          </div>
          <div>
            <h1>O'quv natija</h1>
            <p>O'qituvchi dashboardiga kirish</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={cx(mode === "login" && "auth-tab-active")} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button className={cx(mode === "register" && "auth-tab-active")} onClick={() => setMode("register")} type="button">
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span>O'qituvchi ismi</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Masalan: Nuriddin" required />
            </label>
          )}

          <label>
            <span>Telefon raqam</span>
            <div className="phone-field">
              <b>+998</b>
              <input
                inputMode="numeric"
                maxLength="9"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="901234567"
                required
              />
            </div>
          </label>

          <label>
            <span>Parol</span>
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Kamida 6 ta belgi"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button auth-submit" type="submit" disabled={saving}>
            {saving ? "Tekshirilmoqda..." : mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}
          </button>
        </form>
      </section>
    </main>
  );
}

function DashboardApp({ teacher, logout }) {
  const { students, groups, records, settings, loading, error, isDemo, addGroup, addStudent, saveLessonRecords, deleteStudent, saveSettings, updateStudent } =
    useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [query, setQuery] = useState("");
  const automaticGroup = useMemo(() => groupForDate(groups, date)?.name || groups[0]?.name || "", [groups, date]);
  const [manualGroup, setManualGroup] = useState("");
  const selectedGroup = manualGroup || automaticGroup;
  async function handleDeleteStudent(student) {
    if (!window.confirm(`${student.name} o'chirilsinmi? Bu o'quvchining dars tarixi ham o'chadi.`)) return;
    await deleteStudent(student.id);
  }

  return (
    <div className="app-bg">
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} isDemo={isDemo} teacher={teacher} logout={logout} />
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
          {error && <div className="panel error-panel">{error}</div>}
          {!loading && activePage === "dashboard" && (
            <DashboardPage
              students={students}
              records={records}
              settings={settings}
              selectedGroup={selectedGroup}
              date={date}
              query={query}
              onUpdate={updateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
          {!loading && activePage === "groups" && (
            <GroupsPage
              groups={groups}
              students={students}
              records={records}
              settings={settings}
              date={date}
              query={query}
              addGroup={addGroup}
              addStudent={addStudent}
              saveLessonRecords={saveLessonRecords}
              deleteStudent={handleDeleteStudent}
              selectedGroup={selectedGroup}
            />
          )}
          {!loading && activePage === "settings" && <SettingsPage settings={settings} saveSettings={saveSettings} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { teacher, loading, login, register, logout, normalizePhone } = useTeacherAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!teacher) {
    return <AuthPage login={login} register={register} normalizePhone={normalizePhone} />;
  }

  return <DashboardApp teacher={teacher} logout={logout} />;
}
