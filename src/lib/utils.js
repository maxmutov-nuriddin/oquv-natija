import { allPrivileges, LEVELS } from "../constants";

export function getLevel(coins) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (coins >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function rankText(rank) {
  if (rank === 1) return "1-o'rin";
  if (rank === 2) return "2-o'rin";
  if (rank === 3) return "3-o'rin";
  return `${rank}-o'rin`;
}

export function medalLabel(index) {
  if (index === 0) return "TOP 1";
  if (index === 1) return "TOP 2";
  if (index === 2) return "TOP 3";
  return `#${index + 1}`;
}

export function percent(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

export function numberInputValue(value) {
  return value === "" || value == null ? "" : value;
}

export function parseNumberInput(value) {
  return value === "" ? "" : Number(value);
}

export function parsePercentInput(value) {
  return value === "" ? "" : Math.max(0, Math.min(100, Number(value)));
}

export function isValidLessonTime(time) {
  if (!time) return false;
  const [hour, minute] = time.split(":").map(Number);
  return hour >= 9 && hour <= 20 && [0, 30].includes(minute) && !(hour === 20 && minute > 0);
}

export function addLessonDuration(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + 90;
  const endHour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endMinute = String(totalMinutes % 60).padStart(2, "0");
  return `${endHour}:${endMinute}`;
}

export function getPrivilegeInfo(id) {
  return allPrivileges.find(p => p.id === id) || { id, name: id };
}

export function getWeightedRandomItem(poolIds) {
  const items = poolIds.map(id => {
    const info = getPrivilegeInfo(id);
    const price = info.price || 1000;
    return { ...info, weight: 1 / price };
  });

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random <= item.weight) {
      return item;
    }
    random -= item.weight;
  }
  return items[items.length - 1];
}
