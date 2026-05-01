import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  Activity,
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Download,
  LayoutDashboard,
  Loader2,
  Medal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trophy,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  User,
  Star,
  Eye,
  EyeOff,
  X
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
import { getPeriodLeader, getPreviousMonthRange, getPreviousWeekRange, groupForDateTime, rankStudents } from "./lib/scoring";

const navItems = [
  { id: "dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { id: "groups", label: "Guruhlar", icon: Users },
  { id: "privileges", label: "Privelegiya", icon: Star },
  { id: "settings", label: "Sozlamalar", icon: Settings }
];

const scoreFields = [
  { key: "homeworkScore", label: "Uy vazifa", short: "HW", icon: BookOpenCheck },
  { key: "attendanceScore", label: "Yuqori natija", short: "NAT", icon: CheckCircle2 },
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

const availableGifts = [
  { id: "sticker", name: "Stiker", icon: Star, color: "var(--gold)" },
  { id: "notebook", name: "Daftar", icon: BookOpenCheck, color: "var(--blue)" },
  { id: "pen", name: "Ruchka", icon: Activity, color: "var(--mint)" },
  { id: "vip_weekly", name: "VIP Haftalik", icon: Trophy, color: "var(--rose)", type: "vip" },
  { id: "vip_monthly", name: "VIP Oylik", icon: Award, color: "var(--gold)", type: "vip" }
];

const privilegesData = {
  senior: [
    { id: "homework_75", name: "Vazifani 75% qilish", price: 3000, type: "percent" },
    { id: "choose_question", name: "Savolni o‘zi tanlaydi", price: 600, type: "ability" },
    { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", price: 600, type: "time" },
    { id: "remove_bad_mark", name: "Past bahoni o‘chirish", price: 1000, type: "reset" },
    { id: "skip_task", name: "1 ta vazifa skip", price: 500, type: "skip" },
    { id: "no_question", name: "Savol bermaslik huquqi", price: 1000, type: "mute" },
    { id: "escape_punishment", name: "Jazodan qutilish", price: 900, type: "protection" },
    { id: "gift_coin", name: "Do‘stiga coin 2x qilish", price: 900, type: "boost" },
    { id: "mystery_box", name: "MISTIRIY BOX", price: 3000, type: "random" }
  ],
  junior: [
    { id: "homework_75", name: "Vazifani 75% qilish", price: 3000, type: "percent" },
    { id: "choose_question", name: "Savolni o‘zi tanlaydi", price: 600, type: "ability" },
    { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", price: 600, type: "time" },
    { id: "remove_bad_mark", name: "Past bahoni o‘chirish", price: 1000, type: "reset" },
    { id: "skip_task", name: "1 ta vazifa skip", price: 500, type: "skip" },
    { id: "no_question", name: "Savol bermaslik huquqi", price: 1000, type: "mute" },
    { id: "gift_coin", name: "Do‘stiga coin 2x qilish", price: 900, type: "boost" },
    { id: "mystery_box", name: "MISTIRIY BOX", price: 3000, type: "random" }
  ]
};

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

function numberInputValue(value) {
  return value === "" || value == null ? "" : value;
}

function parseNumberInput(value) {
  return value === "" ? "" : Number(value);
}

function parsePercentInput(value) {
  return value === "" ? "" : Math.max(0, Math.min(100, Number(value)));
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
        </div>
        <button type="button" onClick={logout} className="logout-btn-small">Chiqish</button>
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
            <option value="">{groups.length ? "Guruh tanlang" : "Guruh yo'q"}</option>
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

function GroupForm({ initialData, onSubmit, onSaved }) {
  const [name, setName] = useState(initialData?.name || "");
  const [weekdays, setWeekdays] = useState(initialData?.weekdays || []);
  const [lessonStart, setLessonStart] = useState(initialData?.lessonStart || "");
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
      await onSubmit({ name, weekdays, lessonStart, lessonEnd });
      if (!initialData) {
        setName("");
        setWeekdays([]);
        setLessonStart("");
      }
      onSaved?.();
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
        <strong>{initialData ? "Guruhni tahrirlash" : "Guruh qo'shish"}</strong>
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
        {saving ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />}
        {saving ? "Saqlanmoqda..." : initialData ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}

function StudentForm({ groups, initialData, onSubmit, selectedGroup, onSaved }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    group: initialData?.group || selectedGroup || groups[0]?.name || "",
    homeworkScore: initialData?.homeworkScore || 0,
    attendanceScore: initialData?.attendanceScore || 0,
    activityScore: initialData?.activityScore || 0
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
      await onSubmit(form);
      if (!initialData) {
        setForm((current) => ({ ...current, name: "", homeworkScore: 0, attendanceScore: 0, activityScore: 0 }));
      }
      onSaved?.();
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
        <strong>{initialData ? "O'quvchini tahrirlash" : "O'quvchi qo'shish"}</strong>
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
            <input type="number" min="0" max="100" value={numberInputValue(form[field.key])} onChange={(event) => update(field.key, parsePercentInput(event.target.value))} />
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={!groups.length || saving}>
        {saving ? <Loader2 size={16} className="spinner" /> : <UserPlus size={16} />}
        {saving ? "Saqlanmoqda..." : initialData ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}

function PrivilegesPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const privileges = [
    { title: "Senior UZ", image: "/senior-privilegiya-uz.png" },
    { title: "Senior RU", image: "/senior-привилегия-ru.png" },
    { title: "Junior UZ", image: "/junior-privilegiya-uz.png" },
    { title: "Junior RU", image: "/junior-привилегия-ru.png" }
  ];

  return (
    <div className="privileges-layout page-stack">
      <div className="current-lesson">
        <div className="current-lesson-icon">
          <Star size={32} />
        </div>
        <div>
          <span className="eyebrow">Imtiyozlar</span>
          <h3>O'quvchilar uchun privelegiyalar</h3>
          <p>Rasmni kattalashtirish uchun ustiga bosing.</p>
        </div>
      </div>

      <div className="privileges-grid">
        {privileges.map((item, index) => (
          <article 
            key={index} 
            className="privilege-card panel" 
            onClick={() => setSelectedImage(item)}
            style={{ cursor: "zoom-in" }}
          >
            <div className="panel-header">
              <div className="panel-title">
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
              </div>
            </div>
            <div className="privilege-image-container">
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>
          </article>
        ))}
      </div>

      {selectedImage && (
        <div className="image-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content">
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <X size={32} />
            </button>
            <img src={selectedImage.image} alt={selectedImage.title} />
            <div className="image-modal-caption">
              <h3>{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BuyGiftModal({ groups, students, onBuy, onClose }) {
  const [form, setForm] = useState({
    group: groups[0]?.name || "",
    studentId: "",
    giftName: "",
    count: 1
  });

  const groupStudents = students.filter(s => s.group === form.group);
  const isSenior = form.group.toLowerCase().includes("senior");
  const isJunior = form.group.toLowerCase().includes("junior");
  const privilegeList = isSenior ? privilegesData.senior : (isJunior ? privilegesData.junior : privilegesData.junior);

  function update(key, value) {
    if (key === "group") {
      setForm(curr => ({ ...curr, group: value, studentId: "", giftName: "" }));
    } else {
      setForm(curr => ({ ...curr, [key]: value }));
    }
  }

  return (
    <form className="entry-form" onSubmit={(e) => { e.preventDefault(); onBuy(form); }}>
      <label>
        <span>Guruh</span>
        <select value={form.group} onChange={(e) => update("group", e.target.value)}>
          {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
      </label>
      <label>
        <span>O'quvchi</span>
        <select value={form.studentId} onChange={(e) => update("studentId", e.target.value)} required>
          <option value="">Tanlang</option>
          {groupStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label>
        <span>Sovg'a / Privelegiya nomi</span>
        <select value={form.giftName} onChange={(e) => update("giftName", e.target.value)} required>
          <option value="">Tanlang</option>
          {privilegeList.map(p => <option key={p.id} value={p.name}>{p.name} ({p.price} coin)</option>)}
        </select>
      </label>
      <label>
        <span>Soni</span>
        <input type="number" min="1" value={form.count} onChange={(e) => update("count", parseInt(e.target.value) || 1)} />
      </label>
      <button className="primary-button" type="submit">
        <CheckCircle2 size={18} />
        Sotib olish / Qo'shish
      </button>
    </form>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body
  );
}

function LoadingState({ compact = false }) {
  return (
    <div className={cx("loading-container", compact && "loading-compact")}>
      <div className="loading-content">
        <div className="loading-box" />
        <h3>Yuklanmoqda...</h3>
      </div>
    </div>
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
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
        <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</strong>
        {hint && <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</span>}
      </div>
    </article>
  );
}

function CurrentLessonBanner({ group, date, time }) {
  const formattedDate = dayjs(date).format("DD MMMM YYYY");
  const lessonTime = group?.lessonStart && group?.lessonEnd ? `${group.lessonStart} - ${group.lessonEnd}` : time;

  return (
    <section className={cx("panel current-lesson", !group && "current-lesson-empty")}>
      <div className="current-lesson-icon">
        <Clock3 size={22} />
      </div>
      <div>
        <span className="eyebrow">{formattedDate} · {time}</span>
        {group ? (
          <>
            <h3>{group.name}</h3>
            <p>Shu kun va shu vaqt oralig'ida dars bor: {lessonTime}.</p>
          </>
        ) : (
          <>
            <h3>Bu vaqtda guruh yo'q</h3>
            <p>Sizda {formattedDate} kuni soat {time} da guruhingiz yo'q.</p>
          </>
        )}
      </div>
    </section>
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

function StudentCard({ student, onDelete, onEdit, index, date, records, settings, saveLessonRecords, isLessonDay = true, onWarningReset, onUpdateStudent, weeklyWinner, monthlyWinner }) {
  const todayRecord = records?.find((r) => r.studentId === student.id && r.date === date);
  const hw = todayRecord ? todayRecord.homework : 0;
  const att = todayRecord ? todayRecord.attendance : 0;
  const act = todayRecord ? todayRecord.activity : 0;
  const todayCoins = todayRecord ? (todayRecord.coinsEarned ?? 0) : 0;

  async function handleQuickUpdate(key, value) {
    const updatedStudent = {
      ...student,
      homeworkScore: hw,
      attendanceScore: att,
      activityScore: act,
      [key]: value
    };
    if (saveLessonRecords) {
      await saveLessonRecords({ date, settings, students: [updatedStudent] });
    }
  }

  const ignoredZeroDates = student.ignoredZeroDates || [];
  const zeroRecords = records?.filter((r) => r.studentId === student.id && r.homework === 0 && !ignoredZeroDates.includes(r.date)) || [];
  const needsWarning = zeroRecords.length >= 3;

  const gifts = student.gifts || [];
  const isWeeklyWinner = student.id === weeklyWinner?.id;
  const isMonthlyWinner = student.id === monthlyWinner?.id;
  const isVip = gifts.some(g => g.type === "vip" && g.count > 0) || isWeeklyWinner || isMonthlyWinner;

  function useGift(giftId, e) {
    if (e) e.stopPropagation();
    const nextGifts = gifts.map(g => {
      const currentCount = Number(g.count || 0);
      if (g.id === giftId) return { ...g, count: currentCount - 1 };
      return g;
    }).filter(g => g.count > 0);
    onUpdateStudent?.(student.id, { gifts: nextGifts });
  }

  return (
    <article className={cx("student-card", index < 3 && "student-card-top", isVip && "student-card-vip")}>
      <div className="student-head">
        <div className="student-person">
          <div className="avatar">
            {initials(student.name)}
            {isVip && <div className="vip-badge-icon"><Star size={12} fill="currentColor" /></div>}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>{student.name}</h3>
              {isWeeklyWinner && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>Hafta G'olibi</span>}
              {isMonthlyWinner && <span className="vip-text-badge" style={{ background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>Oy G'olibi</span>}
              {gifts.filter(g => g.type === "vip").map((g, i) => (
                <span key={i} className="vip-text-badge">{g.name}</span>
              ))}
            </div>
            <p>{student.group} · {rankText(student.weeklyRank)} hafta</p>
          </div>
        </div>
        <div className="coin-badge">
          <Coins size={15} />
          {todayCoins}
        </div>
      </div>

      {gifts.length > 0 && (
        <div className="student-gifts">
          {gifts.map(g => {
            const giftMeta = availableGifts.find(ag => ag.id === g.id) || { icon: Trophy, color: "var(--muted)" };
            const GiftIcon = giftMeta.icon;
            return (
              <button key={g.id} type="button" className="gift-tag" style={{ "--gift-color": giftMeta.color }} onClick={(e) => useGift(g.id, e)} title="Ishlatish uchun bosing">
                <GiftIcon size={12} />
                <span>{g.name} x{g.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="student-score">
        <span>Final score</span>
        <strong>{Math.round(
          hw * (settings.homeworkWeight || 0.4) +
          att * (settings.attendanceWeight || 0.3) +
          act * (settings.activityWeight || 0.3)
        )}%</strong>
      </div>

      <div className="student-progress">
        <ProgressLine label="Uy vazifa" value={hw} tone="tone-homework" />
        <ProgressLine label="Yuqori natija" value={att} tone="tone-result" />
        <ProgressLine label="Aktivlik" value={act} tone="tone-activity" />
      </div>

      <div className="rank-chips">
        <span>Hafta: {rankText(student.weeklyRank)}</span>
        <span>Oy: {rankText(student.monthlyRank)}</span>
      </div>

      <div className="quick-edit">
        {scoreFields.map((field) => {
          const Icon = field.icon;
          const val = field.key === "homeworkScore" ? hw : field.key === "attendanceScore" ? att : act;
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
                disabled={!isLessonDay}
                value={numberInputValue(val)}
                onChange={(event) => handleQuickUpdate(field.key, parsePercentInput(event.target.value))}
                aria-label={field.label}
              />
            </label>
          );
        })}
      </div>
      <div className="student-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button className="secondary-button" type="button" onClick={() => onEdit?.(student)} style={{ flex: 1, padding: "8px", fontSize: "13px" }}>
          <Settings size={15} />
          Tahrirlash
        </button>
        <button className="danger-button" type="button" onClick={() => onDelete(student)} style={{ flex: 1, padding: "8px", fontSize: "13px" }}>
          <Trash2 size={15} />
          O'chirish
        </button>
      </div>

      {needsWarning && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #fca5a5" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>⚠️ 3 marta uy vazifasi yo'q!</strong>
          <span>Uydilariga aloqaga chiqish lozim.</span>
          <button 
            type="button"
            className="danger-button" 
            style={{ width: "100%", padding: "8px", justifyContent: "center", marginTop: "4px" }}
            onClick={() => onWarningReset?.(student.id, [...ignoredZeroDates, ...zeroRecords.map(r => r.date)])}
          >
            Ogohlantirildi
          </button>
        </div>
      )}
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
        homeworkScore: record ? record.homework : 0,
        attendanceScore: record ? record.attendance : 0,
        activityScore: record ? record.activity : 0
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
    const cleanValue = parsePercentInput(value);
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
              <span>Yuqori natija %</span>
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
                    disabled={!isLessonDay}
                    value={numberInputValue(entries[student.id]?.[field.key])}
                    onChange={(event) => update(student.id, field.key, event.target.value)}
                    aria-label={`${student.name} ${field.label}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ position: "sticky", bottom: "16px", zIndex: 10, marginTop: "16px", padding: "12px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
            {message && <p className={cx("lesson-message", message.startsWith("Saqlanmadi") && "lesson-message-error")} style={{ marginTop: 0, marginBottom: "12px" }}>{message}</p>}
            <button className="primary-button save-button" type="submit" disabled={saving || !isLessonDay} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
              {saving ? "Saqlanmoqda..." : "Dars natijasini saqlash"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function DashboardPage({ groups, students, records, settings, selectedGroup, currentGroup, currentTime, date, query, onEditStudent, onDeleteStudent, saveLessonRecords, updateStudent }) {
  const weeklyWinner = useMemo(() => getPeriodLeader(students.filter(s => s.group === selectedGroup), records, settings, getPreviousWeekRange(date)), [students, selectedGroup, records, settings, date]);
  const monthlyWinner = useMemo(() => getPeriodLeader(students.filter(s => s.group === selectedGroup), records, settings, getPreviousMonthRange(date)), [students, selectedGroup, records, settings, date]);

  const isLessonDay = useMemo(() => {
    const groupObj = groups?.find(g => g.name === selectedGroup);
    return groupObj ? groupObj.weekdays?.includes(dayjs(date).day()) : false;
  }, [groups, selectedGroup, date]);

  const groupStudents = useMemo(() => students.filter((student) => student.group === selectedGroup), [students, selectedGroup]);
  const ranked = useMemo(() => {
    const filtered = groupStudents.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));
    return rankStudents(filtered, records, settings, date);
  }, [groupStudents, query, records, settings, date]);

  const chartData = ranked.map((student) => ({
    name: student.name.split(" ")[0],
    coin: student.coins,
    score: student.finalScore
  }));
  const totalCoins = ranked.reduce((sum, student) => sum + student.coins, 0);
  const averageScore = ranked.length ? Math.round(ranked.reduce((sum, student) => sum + student.finalScore, 0) / ranked.length) : 0;
  const previousWeekLeader = useMemo(
    () => getPeriodLeader(groupStudents, records, settings, getPreviousWeekRange(date)),
    [groupStudents, records, settings, date]
  );
  const previousMonthLeader = useMemo(
    () => getPeriodLeader(groupStudents, records, settings, getPreviousMonthRange(date)),
    [groupStudents, records, settings, date]
  );

  return (
    <div className="page-stack">
      <CurrentLessonBanner group={currentGroup} date={date} time={currentTime} />

      <section className="stats-grid">
        <StatCard icon={Users} label="O'quvchilar" value={ranked.length} hint={selectedGroup} />
        <StatCard icon={Coins} label="Jami coin" value={totalCoins} hint="tanlangan guruh" tone="gold" />
        <StatCard icon={BarChart3} label="O'rtacha score" value={`${averageScore}%`} hint="final formula" tone="cyan" />
        <StatCard icon={Medal} label="O'tgan hafta lideri" value={previousWeekLeader?.name.split(" ")[0] || "-"} hint={`${previousWeekLeader?.periodCoins || 0} coin`} tone="mint" />
        <StatCard icon={Trophy} label="O'tgan oy lideri" value={previousMonthLeader?.name.split(" ")[0] || "-"} hint={`${previousMonthLeader?.periodCoins || 0} coin`} tone="rose" />
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
                <Bar dataKey="coin" fill="#16a34a" radius={[6, 6, 0, 0]} animationDuration={280} />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={280} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="winner-panel">
          <div className="winner-icon">
            <Medal size={28} />
          </div>
          <span>Oldingi davr g'oliblari</span>
          <div className="winner-list">
            <div>
              <p>O'tgan hafta</p>
              <h3>{previousWeekLeader?.name || "Hali ma'lumot yo'q"}</h3>
              <strong>{previousWeekLeader?.periodCoins || 0} coin</strong>
            </div>
            <div>
              <p>O'tgan oy</p>
              <h3>{previousMonthLeader?.name || "Hali ma'lumot yo'q"}</h3>
              <strong>{previousMonthLeader?.periodCoins || 0} coin</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel">
        <PanelHeader icon={UserRound} title="O'quvchilar" subtitle="Foizlarni o'zgartirsangiz rank avtomatik yangilanadi" />
        {!selectedGroup && <EmptyState title="Hali guruh yo'q" text="Guruhlar sahifasidan birinchi guruhingizni qo'shing." />}
        {selectedGroup && !ranked.length && <EmptyState title="Bu guruhda o'quvchi yo'q" text="Guruhlar sahifasidan o'quvchi qo'shing." />}
        {!!ranked.length && (
          <div className="student-grid">
            {ranked.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                index={index}
                onEdit={onEditStudent}
                onDelete={onDeleteStudent}
                date={date}
                records={records}
                settings={settings}
                saveLessonRecords={saveLessonRecords}
                isLessonDay={isLessonDay}
                onWarningReset={(studentId, newIgnoredDates) => updateStudent(studentId, { ignoredZeroDates: newIgnoredDates })}
                onUpdateStudent={updateStudent}
                weeklyWinner={weeklyWinner}
                monthlyWinner={monthlyWinner}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GroupsPage({ groups, students, records, settings, date, query, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, saveLessonRecords, deleteStudent, selectedGroup, setDate }) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name || "");
  const activeGroupStudents = useMemo(() => students.filter(s => s.group === activeGroup), [students, activeGroup]);
  const weeklyWinner = useMemo(() => getPeriodLeader(activeGroupStudents, records, settings, getPreviousWeekRange(date)), [activeGroupStudents, records, settings, date]);
  const monthlyWinner = useMemo(() => getPeriodLeader(activeGroupStudents, records, settings, getPreviousMonthRange(date)), [activeGroupStudents, records, settings, date]);
  const [modal, setModal] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  useEffect(() => {
    if (!activeGroup && (selectedGroup || groups[0]?.name)) {
      setActiveGroup(selectedGroup || groups[0]?.name || "");
    }
    if (activeGroup && groups.length && !groups.some((group) => group.name === activeGroup)) {
      setActiveGroup(groups[0]?.name || "");
    }
  }, [activeGroup, groups, selectedGroup]);

  const activeGroupObject = useMemo(() => groups.find((group) => group.name === activeGroup), [groups, activeGroup]);
  const activeLessonTime =
    activeGroupObject?.lessonStart && activeGroupObject?.lessonEnd ? `${activeGroupObject.lessonStart} - ${activeGroupObject.lessonEnd}` : "Vaqt belgilanmagan";
  const activeLessonDays =
    activeGroupObject?.weekdays?.length
      ? weekDays
          .filter((day) => activeGroupObject.weekdays.includes(day.value))
          .map((day) => day.label)
          .join(", ")
      : "Kun tanlanmagan";

  const ranked = useMemo(() => {
    return rankStudents(
      students.filter((student) => student.group === activeGroup && student.name.toLowerCase().includes(query.toLowerCase())),
      records,
      settings,
      date
    );
  }, [students, activeGroup, query, records, settings, date]);

  const monthly = ranked.map((student) => ({ name: student.name.split(" ")[0], monthly: student.monthlyCoins }));

  const historyDates = useMemo(() => {
    const groupStudentIds = new Set(activeGroupStudents.map(s => s.id));
    const datesMap = new Map();
    records.forEach(r => {
      if (groupStudentIds.has(r.studentId)) {
         if (!datesMap.has(r.date)) datesMap.set(r.date, { count: 0, coins: 0, records: [] });
         const stats = datesMap.get(r.date);
         stats.count++;
         stats.coins += Number(r.coinsEarned || 0);
         stats.records.push({
           ...r,
           studentName: activeGroupStudents.find(s => s.id === r.studentId)?.name || "Noma'lum"
         });
      }
    });
    return Array.from(datesMap.entries())
      .map(([d, stats]) => ({ date: d, ...stats }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activeGroupStudents, records]);

  return (
    <div className="groups-layout">
      <section className="panel group-list-panel">
        <div className="groups-side-head">
          <div className="panel-title">
            <span>
              <Users size={18} />
            </span>
            <div>
              <h3>Guruhlar</h3>
              <p>{groups.length ? `${groups.length} ta guruh` : "Birinchi guruhni yarating"}</p>
            </div>
          </div>
        </div>
        <div className="group-actions">
          <button className="secondary-button" type="button" onClick={() => setModal("group")}>
            <Plus size={16} />
            Guruh
          </button>
          <button className="secondary-button" type="button" onClick={() => setModal("student")} disabled={!groups.length}>
            <UserPlus size={16} />
            O'quvchi
          </button>
          <button className="primary-button" type="button" onClick={() => setModal("buy-gift")} disabled={!groups.length} style={{ gridColumn: "1 / -1" }}>
            <Award size={16} />
            Sotib oldi
          </button>
        </div>
        {!groups.length && <EmptyState title="Guruh yo'q" text="Yangi guruh qo'shish tugmasi orqali birinchi guruhingizni yarating." />}
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
      </section>

      <div className="group-workspace">
        {activeGroupObject && (
          <>
            <section className="panel group-overview">
              <div>
                <span className="eyebrow">Tanlangan guruh</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <h3 style={{ margin: 0 }}>{activeGroupObject.name}</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => setModal("edit-group")}>
                      Tahrirlash
                    </button>
                    <button className="danger-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => { if(window.confirm("Rostdan ham guruhni o'chirasizmi? O'quvchilar tarixi ham o'chib ketishi mumkin.")) deleteGroup(activeGroupObject.id) }}>
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
              <div className="group-metrics">
                <div>
                  <strong>{activeGroupStudents.length}</strong>
                  <span>o'quvchi</span>
                </div>
                <div>
                  <strong>{activeLessonDays}</strong>
                  <span>dars kunlari</span>
                </div>
                <div>
                  <strong>{activeLessonTime}</strong>
                  <span>dars vaqti</span>
                </div>
              </div>
            </section>

            <LessonEntryPanel
              group={activeGroupObject}
              students={activeGroupStudents}
              records={records}
              date={date}
              settings={settings}
              saveLessonRecords={saveLessonRecords}
            />

            <section className="panel">
              <PanelHeader icon={CalendarDays} title="Darslar tarixi" subtitle="Oldingi darslar natijalarini ko'rish va tahrirlash (sanani tanlang)" />
              {!historyDates.length && <EmptyState title="Tarix yo'q" text="Bu guruhda hali dars o'tilmagan." />}
              {!!historyDates.length && (
                <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {historyDates.map(h => (
                    <div key={h.date} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button 
                        className={cx("secondary-button", date === h.date && "nav-button-active")} 
                        style={{ justifyContent: 'space-between', padding: '12px', width: '100%', background: date === h.date ? '#eff6ff' : '#f8fafc', border: `1px solid ${date === h.date ? '#bfdbfe' : '#e2e8f0'}`, textAlign: 'left' }}
                        onClick={() => {
                          setDate(h.date);
                          setExpandedDate(expandedDate === h.date ? null : h.date);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <CalendarDays size={18} color={date === h.date ? "#2563eb" : "#64748b"} />
                          <strong style={{ color: date === h.date ? '#1e40af' : '#0f172a' }}>{dayjs(h.date).format("DD MMMM YYYY")}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', color: date === h.date ? '#1e40af' : '#64748b', fontSize: '13px' }}>
                          <span>{h.count} o'quvchi</span>
                          <span>{h.coins} coin</span>
                        </div>
                      </button>
                      {expandedDate === h.date && (
                        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "4px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", fontSize: "12px", color: "#64748b", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                            <span>O'quvchi</span>
                            <span>Uy vazifa</span>
                            <span>Yuqori natija</span>
                            <span>Aktivlik</span>
                            <span>Coin</span>
                          </div>
                          {h.records.sort((a,b) => b.coinsEarned - a.coinsEarned).map(r => (
                            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", fontSize: "13px", alignItems: "center", padding: "6px 0" }}>
                              <strong>{r.studentName}</strong>
                              <span>{r.homework}%</span>
                              <span>{r.attendance}%</span>
                              <span>{r.activity}%</span>
                              <strong style={{ color: "#16a34a" }}>+{r.coinsEarned}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

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
                        <Area type="monotone" dataKey="monthly" stroke="#16a34a" fill="#16a34a" fillOpacity={0.14} animationDuration={280} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="leaderboard">
                    {ranked.map((student, index) => (
                      <div key={student.id} className={cx("leader-row", index < 3 && "leader-row-top")}>
                        <div className="leader-main">
                          <span className="leader-rank">{medalLabel(index)}</span>
                          <div className="avatar avatar-small">
                            {initials(student.name)}
                            {(student.gifts?.some(g => g.type === "vip") || student.id === weeklyWinner?.id || student.id === monthlyWinner?.id) && (
                              <div className="vip-badge-icon" style={{ width: "14px", height: "14px", border: "1px solid white", bottom: "-1px", right: "-1px" }}>
                                <Star size={8} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <strong style={{ margin: 0 }}>{student.name}</strong>
                              {student.id === weeklyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>Hafta G'olibi</span>}
                              {student.id === monthlyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>Oy G'olibi</span>}
                              {student.gifts?.some(g => g.type === "vip") && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px" }}>VIP</span>}
                            </div>
                            <p>Weekly {student.weeklyCoins} coin · Monthly {student.monthlyCoins} coin</p>
                          </div>
                        </div>
                        <div className="leader-score">
                          <strong>{student.coins}</strong>
                          <span>total coin</span>
                        </div>
                        <div className="leader-actions" style={{ display: "flex", gap: "4px" }}>
                          <button className="secondary-icon-button" type="button" onClick={() => { setEditingStudent(student); setModal("edit-student"); }}>
                            <Settings size={16} />
                          </button>
                          <button className="danger-icon-button" type="button" onClick={() => deleteStudent(student)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="panel">
              <PanelHeader icon={Award} title="Guruh sovg'alari" subtitle="Kimda qanday sovg'a yoki privelegiya borligi" />
              {activeGroupStudents.filter(s => s.gifts?.length > 0).length === 0 ? (
                <EmptyState title="Sovg'alar yo'q" text="Hali bu guruhda hech kim sovg'a sotib olmagan." />
              ) : (
                <div className="group-gifts-summary">
                  {activeGroupStudents.filter(s => s.gifts?.length > 0).map(s => (
                    <div key={s.id} className="summary-gift-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="avatar avatar-small">{initials(s.name)}</div>
                        <strong>{s.name}</strong>
                        {s.id === weeklyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>Hafta G'olibi</span>}
                        {s.id === monthlyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>Oy G'olibi</span>}
                        {s.gifts?.some(g => g.type === "vip") && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px" }}>VIP</span>}
                      </div>
                      <div className="student-gifts" style={{ marginTop: 0 }}>
                        {s.gifts.map((g, idx) => {
                          const giftMeta = availableGifts.find(ag => ag.id === g.id) || { icon: Award, color: g.type === "vip" ? "var(--rose)" : "var(--blue)" };
                          const GiftIcon = giftMeta.icon;
                          return (
                          <button key={idx} type="button" className="gift-tag" style={{ "--gift-color": giftMeta.color }} title="Ishlatish uchun bosing" onClick={(e) => {
                            e.stopPropagation();
                            const nextGifts = s.gifts.map(item => {
                              const currentCount = Number(item.count || 0);
                              if (item.id === g.id) return { ...item, count: currentCount - 1 };
                              return item;
                            }).filter(item => item.count > 0);
                            updateStudent(s.id, { gifts: nextGifts });
                          }}>
                            <GiftIcon size={12} />
                            <span>{g.name} x{g.count}</span>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {modal === "group" && (
        <Modal title="Guruh qo'shish" onClose={() => setModal("")}>
          <GroupForm onSubmit={addGroup} onSaved={() => setModal("")} />
        </Modal>
      )}

      {modal === "edit-group" && activeGroupObject && (
        <Modal title="Guruhni tahrirlash" onClose={() => setModal("")}>
          <GroupForm 
            initialData={activeGroupObject} 
            onSubmit={(values) => {
              updateGroup(activeGroupObject.id, values);
              if (values.name) setActiveGroup(values.name);
            }} 
            onSaved={() => setModal("")} 
          />
        </Modal>
      )}

      {modal === "student" && (
        <Modal title="O'quvchi qo'shish" onClose={() => setModal("")}>
          <StudentForm groups={groups} selectedGroup={activeGroup} onSubmit={addStudent} onSaved={() => setModal("")} />
        </Modal>
      )}

      {modal === "edit-student" && editingStudent && (
        <Modal title="O'quvchini tahrirlash" onClose={() => { setModal(""); setEditingStudent(null); }}>
          <StudentForm groups={groups} initialData={editingStudent} onSubmit={(values) => updateStudent(editingStudent.id, values)} onSaved={() => { setModal(""); setEditingStudent(null); }} />
        </Modal>
      )}

      {modal === "buy-gift" && (
        <Modal title="Sovg'a / Privelegiya qo'shish" onClose={() => setModal("")}>
          <BuyGiftModal 
            groups={groups} 
            students={students} 
            onBuy={(form) => {
              const student = students.find(s => s.id === form.studentId);
              if (!student) return;
              
              const currentGifts = student.gifts || [];
              const giftId = form.giftName.toLowerCase().replace(/\s+/g, "_");
              const existingGift = currentGifts.find(g => g.name.toLowerCase() === form.giftName.toLowerCase());
              
              let nextGifts;
              const isVip = form.giftName.toUpperCase().includes("VIP");
              
              if (existingGift) {
                nextGifts = currentGifts.map(g => g.name.toLowerCase() === form.giftName.toLowerCase() ? { ...g, count: Number(g.count || 0) + Number(form.count) } : g);
              } else {
                nextGifts = [...currentGifts, { 
                  id: giftId, 
                  name: form.giftName, 
                  count: Number(form.count), 
                  type: isVip ? "vip" : "gift" 
                }];
              }
              
              updateStudent(student.id, { gifts: nextGifts });
              setModal("");
            }} 
          />
        </Modal>
      )}
    </div>
  );
}

function ExportButton({ rows, groupName }) {
  function exportRows() {
    const columns = ["Ism", "Guruh", "Uy vazifa %", "Yuqori natija %", "Aktivlik %", "Coin", "Haftalik rank", "Oylik rank"];
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

function SettingsPage({ settings, saveSettings, teacher, updateProfile, changePassword }) {
  const [draft, setDraft] = useState(settings);
  const [profileName, setProfileName] = useState(teacher?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { setDraft(settings); }, [settings]);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  async function handleSaveSettings() {
    setBusy(true);
    try {
      await saveSettings(draft);
      setStatus({ type: "success", message: "Sozlamalar saqlandi!" });
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  }

  async function handleUpdateProfile() {
    setBusy(true);
    try {
      await updateProfile({ name: profileName });
      setStatus({ type: "success", message: "Profil yangilandi!" });
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  }

  async function handleChangePassword() {
    if (!newPassword) return;
    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." });
      return;
    }
    
    setBusy(true);
    setStatus({ type: "", message: "" });
    
    try {
      await changePassword(newPassword);
      setNewPassword("");
      setStatus({ type: "success", message: "Parol muvaffaqiyatli o'zgartirildi!" });
      alert("Parolingiz o'zgartirildi!");
    } catch (e) {
      console.error("Password change error:", e);
      setStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <PanelHeader icon={Settings} title="Sozlamalar" subtitle="Tizim parametrlarini boshqarish" />
      
      {status.message && (
        <div className={cx("alert", status.type === "error" ? "alert-error" : "alert-success")} style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
          {status.message}
        </div>
      )}

      <section className="panel">
        <PanelHeader icon={UserRound} title="Profil ma'lumotlari" subtitle="Ismingizni o'zgartirishingiz mumkin" />
        <div className="settings-grid">
          <label className="setting-field">
            <span>Ismingiz</span>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Ismingizni kiriting" style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
          </label>
        </div>
        <button className="primary-button" onClick={handleUpdateProfile} disabled={busy} style={{ marginTop: "16px" }}>
          {busy ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
          Profilni saqlash
        </button>
      </section>

      <section className="panel">
        <PanelHeader icon={BarChart3} title="Mukofot va Formula" subtitle="Coin qiymatlari va yakuniy natija og'irliklari" />
        <div className="settings-grid">
          <SettingInput label="Uy vazifa coini" value={draft.homeworkCoin} onChange={(value) => update("homeworkCoin", value)} />
          <SettingInput label="Yuqori natija coini" value={draft.attendanceCoin} onChange={(value) => update("attendanceCoin", value)} />
          <SettingInput label="Aktivlik coini" value={draft.activityCoin} onChange={(value) => update("activityCoin", value)} />
          <SettingInput step="0.1" label="Uy vazifa og'irligi" value={draft.homeworkWeight} onChange={(value) => update("homeworkWeight", value)} />
          <SettingInput step="0.1" label="Yuqori natija og'irligi" value={draft.attendanceWeight} onChange={(value) => update("attendanceWeight", value)} />
          <SettingInput step="0.1" label="Aktivlik og'irligi" value={draft.activityWeight} onChange={(value) => update("activityWeight", value)} />
        </div>
        <button className="primary-button" onClick={handleSaveSettings} disabled={busy} style={{ marginTop: "16px" }}>
          {busy ? <Loader2 size={17} className="spinner" /> : <Settings size={17} />}
          Sozlamalarni saqlash
        </button>
      </section>

      <section className="panel">
        <PanelHeader icon={Clock3} title="Xavfsizlik" subtitle="Parolni yangilash" />
        <div className="settings-grid">
          <label className="setting-field">
            <span>Yangi parol</span>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Kamida 6 ta belgi" 
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px", width: "100%", paddingRight: "40px" }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "calc(50% + 2px)", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>
        <button className="danger-button" onClick={handleChangePassword} disabled={busy || !newPassword} style={{ marginTop: "16px" }}>
          {busy ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
          Parolni o'zgartirish
        </button>
      </section>
    </div>
  );
}

function SettingInput({ label, value, onChange, step = "1" }) {
  return (
    <label className="setting-field">
      <span>{label}</span>
      <input type="number" step={step} value={numberInputValue(value)} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AuthPage({ login, normalizePhone, resetPassword }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: key === "phone" ? normalizePhone(value) : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "forgot") {
        await resetPassword(form);
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

          {(mode === "login" || mode === "register") && (
            <label>
              <span>Parol</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength="6"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button auth-submit" type="submit" disabled={saving}>
            {saving && <Loader2 size={18} className="spinner" />}
            {saving ? "Tekshirilmoqda..." : mode === "forgot" ? "Parolni tiklash" : "Kirish"}
          </button>

          {mode === "login" ? (
            <button type="button" className="text-button" style={{ marginTop: "12px", background: "none", border: "none", color: "#64748b", cursor: "pointer", width: "100%" }} onClick={() => setMode("forgot")}>
              Parolni unutdingizmi?
            </button>
          ) : (
            <button type="button" className="text-button" style={{ marginTop: "12px", background: "none", border: "none", color: "#64748b", cursor: "pointer", width: "100%" }} onClick={() => setMode("login")}>
              Orqaga qaytish
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

function DashboardApp({ teacher, logout, updateProfile, changePassword }) {
  const { students, groups, records, settings, loading, error, isDemo, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, saveLessonRecords, deleteStudent, saveSettings } =
    useDashboardData();
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm"));
  const [query, setQuery] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(dayjs().format("HH:mm")), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const currentGroup = useMemo(() => groupForDateTime(groups, date, currentTime), [groups, date, currentTime]);
  const automaticGroup = currentGroup?.name || "";
  const [manualGroup, setManualGroup] = useState("");
  const selectedGroup = manualGroup || automaticGroup;
  const [editingStudent, setEditingStudent] = useState(null);
  
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

          {loading && <LoadingState />}
          {error && <div className="panel error-panel">{error}</div>}
          {!loading && activePage === "dashboard" && (
            <DashboardPage
              groups={groups}
              students={students}
              records={records}
              settings={settings}
              selectedGroup={selectedGroup}
              currentGroup={currentGroup}
              currentTime={currentTime}
              date={date}
              query={query}
              onEditStudent={setEditingStudent}
              onDeleteStudent={handleDeleteStudent}
              saveLessonRecords={saveLessonRecords}
              updateStudent={updateStudent}
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
              updateGroup={updateGroup}
              deleteGroup={deleteGroup}
              addStudent={addStudent}
              updateStudent={updateStudent}
              saveLessonRecords={saveLessonRecords}
              deleteStudent={handleDeleteStudent}
              selectedGroup={selectedGroup}
              setDate={setDate}
            />
          )}
          {!loading && activePage === "settings" && (
            <SettingsPage 
              settings={settings} 
              saveSettings={saveSettings} 
              teacher={teacher}
              updateProfile={updateProfile}
              changePassword={changePassword}
            />
          )}
          {!loading && activePage === "privileges" && <PrivilegesPage />}
        </main>
      </div>

      {editingStudent && (
        <Modal title="O'quvchini tahrirlash" onClose={() => setEditingStudent(null)}>
          <StudentForm groups={groups} initialData={editingStudent} onSubmit={(values) => updateStudent(editingStudent.id, values)} onSaved={() => setEditingStudent(null)} />
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  const { teacher, loading, login, resetPassword, logout, normalizePhone, updateProfile, changePassword } = useTeacherAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <LoadingState compact />
      </div>
    );
  }

  if (!teacher) {
    return <AuthPage login={login} resetPassword={resetPassword} normalizePhone={normalizePhone} />;
  }

  return <DashboardApp teacher={teacher} logout={logout} updateProfile={updateProfile} changePassword={changePassword} />;
}

