import dayjs from "dayjs";
import { calculateCoins } from "./scoring";

export async function sendIntroMessage({ group, settings }) {
  const token  = String(settings?.telegramBotToken || "").trim();
  const chatId = String(group?.telegramChatId      || "").trim();
  if (!token || !chatId) return;

  const name = group.name || "";
  const text =
    `🤖 <b>O'quv Natija</b> boti ulandi! | <b>Учебные результаты</b> подключён!\n\n` +
    `📚 <b>${name}</b> guruhiga har dars tugagach natijalar avtomatik yuboriladi.\n` +
    `📚 После каждого урока группы <b>${name}</b> результаты будут отправляться автоматически.\n\n` +
    `Nima ko'rsatiladi / Что показывается:\n` +
    `🟢 Yaxshi / Хорошо (80%+)\n` +
    `🟡 O'rtacha / Средне (50–79%)\n` +
    `🔴 Past / Плохо (&lt;50%)\n` +
    `👻 Kelmagan / Отсутствовал\n\n` +
    `✅ Tizim faol! | Система активна!`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.description || `HTTP ${res.status}`);
  }
}

function scoreEmoji(score) {
  if (score >= 80) return "🟢";
  if (score >= 50) return "🟡";
  return "🔴";
}

function scoreLabel(score) {
  if (score >= 80) return "Yaxshi ✅";
  if (score >= 50) return "O'rtacha ⚠️";
  return "Past ❌";
}

const LINE = "━━━━━━━━━━━━━━━━━━━━";

export async function sendLessonReport({ group, students, date, settings }) {
  const token = String(settings?.telegramBotToken || "").trim();
  const chatId = String(group?.telegramChatId || "").trim();
  if (!token || !chatId) return;

  const hw_w  = Number(settings.homeworkWeight  || 0.4);
  const att_w = Number(settings.attendanceWeight || 0.3);
  const act_w = Number(settings.activityWeight   || 0.3);

  const attended = [];
  const absent   = [];

  students.forEach(s => {
    const hw  = Number(s.homeworkScore  || 0);
    const att = Number(s.attendanceScore || 0);
    const act = Number(s.activityScore   || 0);
    if (hw === 0 && att === 0 && act === 0) {
      absent.push(s);
    } else {
      const score = Math.round(hw * hw_w + att * att_w + act * act_w);
      const coins = calculateCoins({ homework: hw, attendance: att, activity: act }, settings);
      attended.push({ ...s, hw, att, act, score, coins });
    }
  });

  attended.sort((a, b) => b.score - a.score);

  const dateStr = dayjs(date).format("DD.MM.YYYY");

  let text = `📚 <b>${group.name}</b> — ${dateStr} dars natijasi\n${LINE}\n`;

  attended.forEach(s => {
    text += `\n${scoreEmoji(s.score)} <b>${s.name}</b>\n`;
    text += `   📝 Uy vazifa: <b>${s.hw}%</b>\n`;
    text += `   📊 Yuqori natija: <b>${s.att}%</b>\n`;
    text += `   ⚡ Aktivlik: <b>${s.act}%</b>\n`;
    text += `   🏆 Umumiy ball: <b>${s.score}%</b> — ${scoreLabel(s.score)}\n`;
    text += `   🪙 Bugungi coin: <b>+${s.coins}</b>\n`;
    text += `${LINE}\n`;
  });

  if (absent.length) {
    text += `\n😔 <b>Kelmagan o'quvchilar:</b>\n`;
    absent.forEach(s => {
      text += `👻 ${s.name}\n`;
    });
    text += `${LINE}\n`;
  }


  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.description || `HTTP ${res.status}`);
  }
}
