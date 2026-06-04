import { Activity, Award, BookOpenCheck, BarChart2, CheckCircle2, LayoutDashboard, MessageCircle, Settings, ShieldX, Star, Trophy, Users, Gamepad2 } from "lucide-react";

export const navItems = [
  { id: "dashboard",  label: "Bosh sahifa", icon: LayoutDashboard },
  { id: "groups",     label: "Guruhlar",    icon: Users },
  { id: "analytics",  label: "Tahlil",      icon: BarChart2 },
  { id: "game",       label: "Quiz O'yin",  icon: Gamepad2 },
  { id: "privileges", label: "Privelegiya", icon: Star },
  { id: "appeals",    label: "Murojaatlar", icon: MessageCircle, href: "https://t.me/coddycheckbot" },
  { id: "settings",   label: "Sozlamalar",  icon: Settings }
];

export const scoreFields = [
  { key: "homeworkScore", label: "Uy vazifa", short: "HW", icon: BookOpenCheck },
  { key: "attendanceScore", label: "Sinf vazifa", short: "SV", icon: CheckCircle2 },
  { key: "activityScore", label: "Aktivlik", short: "ACT", icon: Activity }
];

export const weekDays = [
  { value: 1, label: "Du" },
  { value: 2, label: "Se" },
  { value: 3, label: "Ch" },
  { value: 4, label: "Pa" },
  { value: 5, label: "Ju" },
  { value: 6, label: "Sh" },
  { value: 0, label: "Ya" }
];

export const availableGifts = [
  { id: "sticker", name: "Stiker", icon: Star, color: "var(--gold)" },
  { id: "notebook", name: "Daftar", icon: BookOpenCheck, color: "var(--blue)" },
  { id: "pen", name: "Ruchka", icon: Activity, color: "var(--mint)" },
  { id: "block_friend", name: "Do'stni bloklash", icon: ShieldX, color: "var(--rose)" },
  { id: "vip_weekly", name: "VIP Haftalik", icon: Trophy, color: "var(--rose)", type: "vip" },
  { id: "vip_monthly", name: "VIP Oylik", icon: Award, color: "var(--gold)", type: "vip" }
];

export const privilegesData = {
  senior: [
    { id: "homework_75", name: "Vazifani 75% qilish", price: 3000, type: "percent" },
    { id: "choose_question", name: "Savolni o'zi tanlaydi", price: 600, type: "ability" },
    { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", price: 600, type: "time" },
    { id: "remove_bad_mark", name: "Past bahoni o'chirish", price: 1000, type: "reset" },
    { id: "skip_task", name: "1 ta vazifa skip", price: 500, type: "skip" },
    { id: "no_question", name: "Savol bermaslik huquqi", price: 1000, type: "mute" },
    { id: "escape_punishment", name: "Jazodan qutilish", price: 900, type: "protection" },
    { id: "gift_coin", name: "Do'stiga coin 2x qilish", price: 900, type: "boost" },
    { id: "block_friend", name: "Do'stni bloklash", price: 650, type: "block" },
    { id: "mystery_box", name: "MISTIRIY BOX", price: 3000, type: "random" }
  ],
  junior: [
    { id: "homework_75", name: "Vazifani 75% qilish", price: 3000, type: "percent" },
    { id: "choose_question", name: "Savolni o'zi tanlaydi", price: 600, type: "ability" },
    { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", price: 600, type: "time" },
    { id: "remove_bad_mark", name: "Past bahoni o'chirish", price: 1000, type: "reset" },
    { id: "skip_task", name: "1 ta vazifa skip", price: 500, type: "skip" },
    { id: "no_question", name: "Savol bermaslik huquqi", price: 1000, type: "mute" },
    { id: "gift_coin", name: "Do'stiga coin 2x qilish", price: 900, type: "boost" },
    { id: "block_friend", name: "Do'stni bloklash", price: 650, type: "block" },
    { id: "mystery_box", name: "MISTIRIY BOX", price: 3000, type: "random" }
  ]
};

export const vipData = {
  senior: {
    monthly: [
      { id: "homework_25", name: "Vazifani 25% qilish", type: "effect", effect: "reduce_homework", value: 25, uses: 2, count: 2 },
      { id: "free_mode", name: "Free mode", type: "effect", effect: "free_mode", uses: 2, count: 2 },
      { id: "remove_bad_mark", name: "Past bahoni o'chirish", type: "effect", effect: "remove_mark", uses: 2, count: 2 },
      { id: "coin_boost_2x", name: "2x coin boost", type: "effect", effect: "coin_boost", value: 2, duration: { value: 2, unit: "week" }, count: 6 },
      { id: "skip_task", name: "1 ta vazifa skip", type: "effect", effect: "skip_task", uses: 1, count: 1 },
      { id: "no_question", name: "Savol bermaslik huquqi", type: "effect", effect: "mute", uses: 1, count: 1 },
      { id: "choose_question", name: "Savolni o'zi tanlaydi", type: "effect", effect: "choose_question", uses: 2, count: 2 },
      { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", type: "effect", effect: "extend_time", uses: 2, count: 2 },
      { id: "escape_punishment", name: "Jazodan qutilish", type: "effect", effect: "escape", uses: 1, count: 1 },
      { id: "gift_coin", name: "Do'stiga coin 2x qilish", type: "effect", effect: "gift_boost", value: 2, uses: 1, count: 1 },
      { id: "mystery_box", name: "MISTIRIY BOX", type: "random", pool: ["senior_monthly", "senior_weekly", "shop_senior"], uses: 1, count: 1 }
    ],
    weekly: [
      { id: "homework_50", name: "Vazifani 50% qilish", type: "effect", effect: "reduce_homework", value: 50, uses: 1, count: 1 },
      { id: "homework_15", name: "1 ta vazifani 15% qilish", type: "effect", effect: "reduce_homework", value: 15, uses: 1, count: 1 },
      { id: "choose_question", name: "Savolni o'zi tanlaydi", type: "effect", effect: "choose_question", uses: 1, count: 1 },
      { id: "coin_boost_2x", name: "2x coin boost", type: "effect", effect: "coin_boost", value: 2, uses: 2, count: 2 },
      { id: "free_mode", name: "Free mode", type: "effect", effect: "free_mode", uses: 1, count: 1 },
      { id: "skip_task", name: "1 ta vazifa skip", type: "effect", effect: "skip_task", uses: 1, count: 1 },
      { id: "mystery_box", name: "MISTIRIY BOX", type: "random", pool: ["senior_weekly", "shop_senior"], uses: 1, count: 1 }
    ]
  },
  junior: {
    monthly: [
      { id: "homework_25", name: "Vazifani 25% qilish", type: "effect", effect: "reduce_homework", value: 25, uses: 2, count: 2 },
      { id: "free_mode", name: "Free mode", type: "effect", effect: "free_mode", uses: 2, count: 2 },
      { id: "remove_bad_mark", name: "Past bahoni o'chirish", type: "effect", effect: "remove_mark", uses: 2, count: 2 },
      { id: "coin_boost_2x", name: "2x coin boost", type: "effect", effect: "coin_boost", value: 2, duration: { value: 2, unit: "week" }, count: 6 },
      { id: "skip_task", name: "1 ta vazifa skip", type: "effect", effect: "skip_task", uses: 1, count: 1 },
      { id: "no_question", name: "Savol bermaslik huquqi", type: "effect", effect: "mute", duration: { value: 1, unit: "day" }, count: 1 },
      { id: "choose_question", name: "Savolni o'zi tanlaydi", type: "effect", effect: "choose_question", uses: 2, count: 2 },
      { id: "extend_time", name: "Topshiriq vaqtini uzaytirish", type: "effect", effect: "extend_time", uses: 2, count: 2 },
      { id: "gift_coin", name: "Do'stiga coin 2x qilish", type: "effect", effect: "gift_boost", value: 2, uses: 1, count: 1 },
      { id: "mystery_box", name: "MISTIRIY BOX", type: "random", pool: ["junior_monthly", "junior_weekly", "shop_junior"], uses: 1, count: 1 }
    ],
    weekly: [
      { id: "homework_50", name: "Vazifani 50% qilish", type: "effect", effect: "reduce_homework", value: 50, uses: 1, count: 1 },
      { id: "homework_15", name: "1 ta vazifani 15% qilish", type: "effect", effect: "reduce_homework", value: 15, uses: 1, count: 1 },
      { id: "choose_question", name: "Savolni o'zi tanlaydi", type: "effect", effect: "choose_question", uses: 1, count: 1 },
      { id: "coin_boost_2x", name: "2x coin boost", type: "effect", effect: "coin_boost", value: 2, uses: 2, count: 2 },
      { id: "free_mode", name: "Free mode", type: "effect", effect: "free_mode", uses: 1, count: 1 },
      { id: "skip_task", name: "1 ta vazifa skip", type: "effect", effect: "skip_task", uses: 1, count: 1 },
      { id: "mystery_box", name: "MISTIRIY BOX", type: "random", pool: ["junior_weekly", "shop_junior"], uses: 1, count: 1 }
    ]
  }
};

export const mysteryBoxData = {
  senior_monthly: { pool: ["homework_25", "free_mode", "remove_bad_mark", "coin_boost_2x", "skip_task", "no_question", "choose_question", "extend_time", "escape_punishment", "gift_coin"] },
  senior_weekly: { pool: ["homework_50", "homework_15", "choose_question", "coin_boost_2x", "free_mode", "skip_task"] },
  junior_monthly: { pool: ["homework_25", "free_mode", "remove_bad_mark", "coin_boost_2x", "skip_task", "no_question", "choose_question", "extend_time", "gift_coin"] },
  junior_weekly: { pool: ["homework_50", "homework_15", "choose_question", "coin_boost_2x", "free_mode", "skip_task"] },
  shop_senior: { pool: ["homework_75", "choose_question", "extend_time", "remove_bad_mark", "skip_task", "no_question", "escape_punishment", "gift_coin"] },
  shop_junior: { pool: ["homework_75", "choose_question", "extend_time", "remove_bad_mark", "skip_task", "no_question", "gift_coin"] }
};

export const BATTLE_BOSS_PRESETS = [
  { name: "Dark Dragon",  emoji: "🐉" },
  { name: "Shadow Ghost", emoji: "👻" },
  { name: "Iron Titan",   emoji: "🤖" },
  { name: "Storm Eagle",  emoji: "🦅" },
  { name: "Fire Lord",    emoji: "🔥" },
  { name: "Void King",    emoji: "💀" },
];
export const BATTLE_HP_OPTIONS     = [300, 500, 700, 1000, 1500, 2000];
export const BATTLE_REWARD_OPTIONS = [50, 100, 150, 200, 300];
export const BATTLE_STAKE_OPTIONS  = [30, 50, 100, 150, 200];

export const lessonStartOptions = Array.from({ length: 20 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
});

export const LEVELS = [
  { key: "new",    name: "Yangi",  emoji: "🌱", min: 0,    max: 499,      color: "#64748b", bg: "#f1f5f9" },
  { key: "mid",    name: "O'rta",  emoji: "⚡", min: 500,  max: 1999,     color: "#2563eb", bg: "#dbeafe" },
  { key: "master", name: "Ustoz",  emoji: "🔥", min: 2000, max: 4999,     color: "#d97706", bg: "#fef9c3" },
  { key: "legend", name: "Legend", emoji: "👑", min: 5000, max: Infinity,  color: "#7c3aed", bg: "#ede9fe" },
];

export const allPrivileges = [
  ...privilegesData.senior,
  ...privilegesData.junior,
  ...vipData.senior.monthly,
  ...vipData.senior.weekly,
  ...vipData.junior.monthly,
  ...vipData.junior.weekly
];
