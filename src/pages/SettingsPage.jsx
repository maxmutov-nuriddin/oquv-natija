import { useEffect, useState } from "react";
import { BarChart3, BookOpen, CheckCircle2, Clock3, Copy, ExternalLink, Eye, EyeOff, Loader2, Lock, Send, Settings, Trash2, UserPlus, UserRound } from "lucide-react";
import { useT } from "../i18n/index.jsx";
import { cx } from "../lib/utils";
import { PanelHeader } from "../components/ui/PanelHeader";
import { SettingInput } from "../components/ui/SettingInput";

const _EP = "YWRtaW4xJDM0"; // obfuscated
const _EL = "adminadmin@admin.admin";

export function SettingsPage({ settings, saveSettings, teacher, updateProfile, changePassword, verifyPassword, isDemo, register, restoreDataFromUid }) {
  const { t } = useT();
  const [draft, setDraft] = useState(settings);
  const [profileName, setProfileName] = useState(teacher?.name || "");
  const [profilePhone, setProfilePhone] = useState(teacher?.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [botToken, setBotToken] = useState(settings?.telegramBotToken || "");
  const [showToken, setShowToken] = useState(false);
  const [tgSaveMsg, setTgSaveMsg] = useState({ type: "", text: "" });
  const [tgChats, setTgChats] = useState(null);
  const [fetchingChats, setFetchingChats] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [scoreStatus, setScoreStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", phone: "" });
  const [teacherStatus, setTeacherStatus] = useState({ type: "", text: "" });
  const [teacherBusy, setTeacherBusy] = useState(false);
  const [restoreUid, setRestoreUid] = useState("");
  const [restoreStatus, setRestoreStatus] = useState({ type: "", text: "" });
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [examUnlockInput, setExamUnlockInput] = useState("");
  const [examPassVisible, setExamPassVisible] = useState(false);
  const [examUnlockError, setExamUnlockError] = useState(false);
  const [examUnlockBusy, setExamUnlockBusy] = useState(false);
  const [customQForm, setCustomQForm] = useState({ topicName: "", topicIcon: "📝", pts: 100, cellType: "question", lang: "uz", question: "", answer: "" });
  const [customQBusy, setCustomQBusy] = useState(false);
  const [customQStatus, setCustomQStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    setDraft(settings);
    setBotToken(settings?.telegramBotToken || "");
  }, [settings]);

  useEffect(() => {
    if (teacher) {
      setProfileName(teacher.name || "");
      setProfilePhone(String(teacher.phone || ""));
    }
  }, [teacher]);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  async function saveBattleSetting(key, value) {
    const newDraft = { ...draft, [key]: value };
    setDraft(newDraft);
    try {
      await saveSettings({ ...newDraft, telegramBotToken: botToken.trim() });
    } catch (e) { }
  }


  async function handleUpdateProfile() {
    setBusy(true);
    try {
      await updateProfile({ name: profileName });
      setProfileStatus({ type: "success", message: t.settings_profile_saved });
    } catch (e) {
      setProfileStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setProfileStatus({ type: "", message: "" }), 3000);
    }
  }

  async function handleChangePassword() {
    if (!oldPassword) {
      setPasswordStatus({ type: "error", message: "Eski parolni kiriting." });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: t.settings_password_short });
      return;
    }
    setBusy(true);
    setPasswordStatus({ type: "", message: "" });
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setPasswordStatus({ type: "success", message: t.settings_password_saved });
      alert(t.settings_password_alert);
    } catch (e) {
      setPasswordStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleRestoreData(e) {
    e.preventDefault();
    setRestoreBusy(true);
    setRestoreStatus({ type: "", text: "" });
    try {
      const count = await restoreDataFromUid(restoreUid);
      setRestoreStatus({ type: "success", text: `✅ ${count} ta ma'lumot muvaffaqiyatli tiklandi. Sahifani yangilang.` });
      setRestoreUid("");
    } catch (err) {
      setRestoreStatus({ type: "error", text: err.message });
    } finally {
      setRestoreBusy(false);
    }
  }

  async function handleSaveSettings() {
    setBusy(true);
    try {
      await saveSettings({ ...draft, telegramBotToken: botToken.trim() });
      setScoreStatus({ type: "success", message: t.settings_saved });
    } catch (e) {
      setScoreStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setScoreStatus({ type: "", message: "" }), 3000);
    }
  }

  async function handleFetchChats() {
    const token = botToken.trim();
    if (!token) return;
    setFetchingChats(true);
    setTgChats(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit: 100,
          allowed_updates: ["message", "channel_post", "my_chat_member"],
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description || t.tg_fetch_error);
      const seen = new Map();
      data.result.forEach(u => {
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat;
        if (chat && (chat.type === "group" || chat.type === "supergroup") && !seen.has(chat.id)) {
          seen.set(chat.id, { id: String(chat.id), title: chat.title || "" });
        }
      });
      setTgChats([...seen.values()]);
    } catch (e) {
      setTgChats([]);
      setTgSaveMsg({ type: "error", text: `${t.tg_fetch_error}: ${e.message}` });
      setTimeout(() => setTgSaveMsg({ type: "", text: "" }), 4000);
    } finally {
      setFetchingChats(false);
    }
  }

  async function handleSaveToken() {
    setBusy(true);
    setTgSaveMsg({ type: "", text: "" });
    try {
      await saveSettings({ ...draft, telegramBotToken: botToken.trim() });
      setTgSaveMsg({ type: "success", text: t.tg_saved });
    } catch (e) {
      setTgSaveMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setTgSaveMsg({ type: "", text: "" }), 4000);
    }
  }

  const TOPIC_COLORS = [
    { color: "#8b5cf6", colorDark: "#7c3aed" },
    { color: "#06b6d4", colorDark: "#0891b2" },
    { color: "#f59e0b", colorDark: "#d97706" },
    { color: "#10b981", colorDark: "#059669" },
    { color: "#ef4444", colorDark: "#dc2626" },
    { color: "#3b82f6", colorDark: "#2563eb" },
  ];

  async function handleAddCustomQuestion(e) {
    e.preventDefault();
    const { topicName, topicIcon, pts, cellType, lang, question, answer } = customQForm;
    if (!topicName.trim() || !question.trim() || !answer.trim()) return;
    setCustomQBusy(true);
    setCustomQStatus({ type: "", text: "" });
    try {
      const current = settings?.customTopics || [];
      const existing = current.find(t => t.name === topicName.trim());
      let updated;
      const newEntry = { q: question.trim(), a: answer.trim(), lang };
      if (cellType !== "question") newEntry.cellType = cellType;
      if (existing) {
        updated = current.map(t => {
          if (t.name !== topicName.trim()) return t;
          const qs = { ...t.questions };
          qs[pts] = [...(qs[pts] || []), newEntry];
          return { ...t, questions: qs };
        });
      } else {
        const idx = current.length % TOPIC_COLORS.length;
        const newTopic = {
          id: Date.now().toString(36),
          name: topicName.trim(),
          icon: topicIcon.trim() || "📝",
          color: TOPIC_COLORS[idx].color,
          colorDark: TOPIC_COLORS[idx].colorDark,
          questions: { 100: [], 200: [], 300: [], 400: [], 500: [] },
        };
        newTopic.questions[pts] = [newEntry];
        updated = [...current, newTopic];
      }
      await saveSettings({ ...settings, customTopics: updated });
      setCustomQForm(f => ({ ...f, question: "", answer: "" }));
      setCustomQStatus({ type: "success", text: "✅ Savol qo'shildi!" });
      setTimeout(() => setCustomQStatus({ type: "", text: "" }), 2500);
    } catch (err) {
      setCustomQStatus({ type: "error", text: err.message });
    } finally {
      setCustomQBusy(false);
    }
  }

  async function handleDeleteCustomQuestion(topicId, pts, idx) {
    try {
      const current = settings?.customTopics || [];
      const updated = current.map(t => {
        if (t.id !== topicId) return t;
        const qs = { ...t.questions };
        qs[pts] = qs[pts].filter((_, i) => i !== idx);
        return { ...t, questions: qs };
      }).filter(t => Object.values(t.questions).some(arr => arr.length > 0));
      await saveSettings({ ...settings, customTopics: updated });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleExamUnlock() {
    if (!examUnlockInput || examUnlockBusy) return;
    setExamUnlockBusy(true);
    try {
      await verifyPassword(examUnlockInput);
      setExamPassVisible(true);
      setExamUnlockError(false);
    } catch {
      setExamUnlockError(true);
      setTimeout(() => setExamUnlockError(false), 2000);
    } finally {
      setExamUnlockBusy(false);
    }
  }

  function copyId(id) {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  }

  async function handleCreateTeacher(e) {
    e.preventDefault();
    setTeacherStatus({ type: "", text: "" });
    setTeacherBusy(true);
    try {
      await register({ name: newTeacher.name, phone: newTeacher.phone, password: "123456" });
      setTeacherStatus({ type: "success", text: `✅ ${newTeacher.name} yaratildi. Parol: 123456` });
      setNewTeacher({ name: "", phone: "" });
    } catch (err) {
      setTeacherStatus({ type: "error", text: err.message });
    } finally {
      setTeacherBusy(false);
    }
  }

  return (
    <div className="page-stack">
      {/* Coddy Exam */}
      <section className="panel">
        <PanelHeader icon={ExternalLink} title="CoddyExam" subtitle="Imtihon platformasi login ma'lumotlari" />
        <a
          href="https://coddyexam.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{ display: "inline-flex", textDecoration: "none", marginBottom: "20px" }}
        >
          <ExternalLink size={16} />
          CoddyExam platformasiga o'tish
        </a>
        <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Login row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 700, minWidth: "65px" }}>Login:</span>
            {examPassVisible
              ? <>
                  <code style={{ fontSize: "13px", color: "#0f172a", background: "#e0f2fe", padding: "3px 8px", borderRadius: "6px" }}>{_EL}</code>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(_EL).catch(() => {}); setCopiedId("login"); setTimeout(() => setCopiedId(""), 2000); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: copiedId === "login" ? "#10b981" : "#94a3b8", display: "flex", alignItems: "center" }}
                    title="Nusxalash"
                  >
                    {copiedId === "login" ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  </button>
                </>
              : <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px", letterSpacing: "3px", color: "#94a3b8" }}>••••••••••••••••</span>
                  <Lock size={13} color="#94a3b8" />
                </span>
            }
          </div>

          {/* Password row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 700, minWidth: "65px" }}>Parol:</span>
            {examPassVisible
              ? <>
                  <code style={{ fontSize: "13px", color: "#0f172a", background: "#dcfce7", padding: "3px 8px", borderRadius: "6px" }}>{atob(_EP)}</code>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(atob(_EP)).catch(() => {}); setCopiedId("pass"); setTimeout(() => setCopiedId(""), 2000); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: copiedId === "pass" ? "#10b981" : "#94a3b8", display: "flex", alignItems: "center" }}
                    title="Nusxalash"
                  >
                    {copiedId === "pass" ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  </button>
                </>
              : <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px", letterSpacing: "3px", color: "#94a3b8" }}>••••••••</span>
                  <Lock size={13} color="#94a3b8" />
                </span>
            }
          </div>

          {/* Unlock / hide controls */}
          {examPassVisible ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => { setExamPassVisible(false); setExamUnlockInput(""); }}
              style={{ alignSelf: "flex-start", fontSize: "13px" }}
            >
              <EyeOff size={14} /> Yashirish
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="password"
                  className="settings-input"
                  value={examUnlockInput}
                  onChange={e => setExamUnlockInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleExamUnlock()}
                  placeholder="Ko'rish uchun parol"
                  style={{ maxWidth: "220px", padding: "8px 12px", fontSize: "13px" }}
                />
                <button className="secondary-button" onClick={handleExamUnlock} disabled={examUnlockBusy} style={{ padding: "8px 14px", fontSize: "13px" }}>
                  {examUnlockBusy ? <Loader2 size={14} className="spin" /> : <Eye size={14} />} Ko'rish
                </button>
              </div>
              {examUnlockError && (
                <p className={cx("settings-status", "settings-status-error")} style={{ margin: 0 }}>Parol noto'g'ri</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Custom Quiz Questions */}
      <section className="panel">
        <PanelHeader icon={BookOpen} title="Quiz savollari" subtitle="O'z savollaringizni yarating — o'yinda ishlatiladi" />

        {/* Form */}
        <form onSubmit={handleAddCustomQuestion} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Language selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="settings-label" style={{ margin: 0 }}>Savol tili:</span>
            {[
              { val: "uz", label: "🇺🇿 O'zbek" },
              { val: "ru", label: "🇷🇺 Русский" },
            ].map(opt => {
              const active = customQForm.lang === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setCustomQForm(f => ({ ...f, lang: opt.val }))}
                  style={{
                    padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                    border: `2px solid ${active ? "#7c3aed" : "#e2e8f0"}`,
                    background: active ? "#ede9fe" : "white",
                    color: active ? "#7c3aed" : "#64748b",
                    transition: "all 0.15s",
                  }}
                >{opt.label}</button>
              );
            })}
          </div>

          {/* Emoji + Topic name in one row */}
          <div>
            <label className="settings-label">Mavzu nomi</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
              <input
                type="text"
                className="settings-input"
                style={{ width: "58px", flexShrink: 0, textAlign: "center", fontSize: "22px", padding: "8px 4px" }}
                value={customQForm.topicIcon}
                onChange={e => setCustomQForm(f => ({ ...f, topicIcon: e.target.value }))}
                maxLength={2}
                title="Emoji tanlang"
              />
              <input
                type="text"
                className="settings-input"
                style={{ flex: 1 }}
                value={customQForm.topicName}
                onChange={e => setCustomQForm(f => ({ ...f, topicName: e.target.value }))}
                placeholder="Masalan: Matematika, Fizika, Ingliz tili..."
                required
              />
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, marginTop: "5px" }}>
              Mavjud mavzu nomini yozsangiz — o'sha mavzuga qo'shiladi
            </p>
          </div>

          {/* Ball darajasi */}
          <div>
            <label className="settings-label">Ball darajasi</label>
            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
              {[100, 200, 300, 400, 500].map(pts => {
                const active = customQForm.pts === pts && customQForm.cellType === "question";
                return (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setCustomQForm(f => ({ ...f, pts, cellType: "question" }))}
                    style={{
                      padding: "7px 16px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer",
                      border: `2px solid ${active ? "#7c3aed" : "#e2e8f0"}`,
                      background: active ? "#ede9fe" : "white",
                      color: active ? "#7c3aed" : "#64748b",
                      transition: "all 0.15s",
                    }}
                  >{pts}</button>
                );
              })}
              <div style={{ width: "1px", background: "#e2e8f0", margin: "0 2px" }} />
              {[
                { type: "bonus", label: "⚡ Bonus ???", color: "#d97706", bg: "#fef9c3", border: "#fde68a" },
                { type: "minus", label: "💀 Minus ???", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
              ].map(opt => {
                const active = customQForm.cellType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setCustomQForm(f => ({ ...f, cellType: opt.type }))}
                    style={{
                      padding: "7px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${active ? opt.border : "#e2e8f0"}`,
                      background: active ? opt.bg : "white",
                      color: active ? opt.color : "#94a3b8",
                      transition: "all 0.15s",
                    }}
                  >{opt.label}</button>
                );
              })}
            </div>
            {customQForm.cellType !== "question" && (
              <p style={{ fontSize: "11px", marginTop: "6px", fontWeight: 600, color: customQForm.cellType === "bonus" ? "#d97706" : "#dc2626" }}>
                {customQForm.cellType === "bonus"
                  ? "⚡ Bonus: to'g'ri javob bersа 2× ball oladi. Ball qatori:"
                  : "💀 Minus: noto'g'ri javob bersа ball ayriladi. Ball qatori:"}
                {" "}
                {[100, 200, 300, 400, 500].map(pts => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setCustomQForm(f => ({ ...f, pts }))}
                    style={{
                      marginLeft: "4px", padding: "1px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "11px", cursor: "pointer",
                      border: `1.5px solid ${customQForm.pts === pts ? "#64748b" : "#e2e8f0"}`,
                      background: customQForm.pts === pts ? "#e2e8f0" : "white",
                      color: "#64748b",
                    }}
                  >{pts}</button>
                ))}
              </p>
            )}
          </div>

          {/* Savol va Javob */}
          <div>
            <label className="settings-label">Savol</label>
            <textarea
              className="settings-input"
              style={{ marginTop: "6px", minHeight: "72px", resize: "vertical" }}
              value={customQForm.question}
              onChange={e => setCustomQForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Savolingizni yozing..."
              required
            />
          </div>

          <div>
            <label className="settings-label">To'g'ri javob</label>
            <textarea
              className="settings-input"
              style={{ marginTop: "6px", minHeight: "60px", resize: "vertical" }}
              value={customQForm.answer}
              onChange={e => setCustomQForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Javobni yozing..."
              required
            />
          </div>

          {customQStatus.text && (
            <p className={cx("settings-status", customQStatus.type === "error" ? "settings-status-error" : "settings-status-ok")} style={{ margin: 0 }}>
              {customQStatus.text}
            </p>
          )}

          <button className="primary-button" type="submit" disabled={customQBusy} style={{ justifyContent: "center" }}>
            {customQBusy ? <Loader2 size={16} className="spinner" /> : <BookOpen size={16} />}
            Savol qo'shish
          </button>
        </form>

        {/* Existing custom questions */}
        {(settings?.customTopics || []).length > 0 && (
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="settings-section-label">Saqlangan savollar</div>
            {(settings.customTopics).map(topic => (
              <div key={topic.id} style={{ border: `1.5px solid ${topic.color}44`, borderLeft: `4px solid ${topic.color}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", background: `${topic.color}14`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>{topic.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: "14px", color: topic.color }}>{topic.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                    {Object.values(topic.questions).reduce((s, a) => s + a.length, 0)} ta savol
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[100, 200, 300, 400, 500].flatMap(pts =>
                    (topic.questions[pts] || []).map((q, i) => (
                      <div key={`${pts}-${i}`} style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{
                          flexShrink: 0, fontSize: "11px", fontWeight: 900, padding: "2px 8px",
                          borderRadius: "999px", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b",
                        }}>{pts}</span>
                        {q.cellType === "bonus" && (
                          <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 900, padding: "2px 7px", borderRadius: "999px", background: "#fef9c3", border: "1px solid #fde68a", color: "#d97706" }}>⚡???</span>
                        )}
                        {q.cellType === "minus" && (
                          <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 900, padding: "2px 7px", borderRadius: "999px", background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626" }}>💀???</span>
                        )}
                        <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "999px", background: "#f1f5f9", color: "#64748b" }}>
                          {(q.lang || "uz") === "ru" ? "🇷🇺" : "🇺🇿"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{q.q}</p>
                          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{q.a}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomQuestion(topic.id, pts, i)}
                          style={{ flexShrink: 0, background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scoring */}
      <section className="panel">
        <PanelHeader icon={BarChart3} title={t.settings_reward_title} subtitle={t.settings_reward_sub} />
        <div className="settings-section-label">{t.settings_coins_group || "Coin mukofotlari"}</div>
        <div className="settings-grid" style={{ marginBottom: "20px" }}>
          <SettingInput label={t.settings_hw_coin}  value={draft.homeworkCoin}   onChange={(v) => update("homeworkCoin", v)} />
          <SettingInput label={t.settings_att_coin} value={draft.attendanceCoin} onChange={(v) => update("attendanceCoin", v)} />
          <SettingInput label={t.settings_act_coin} value={draft.activityCoin}   onChange={(v) => update("activityCoin", v)} />
          <SettingInput label={t.settings_hw_fine}  value={draft.homeworkFine ?? 1000} onChange={(v) => update("homeworkFine", v)} />
        </div>
        <div className="settings-section-label">{t.settings_weights_group || "Ball og'irliklari (jami 1.0)"}</div>
        <div className="settings-grid" style={{ marginBottom: "20px" }}>
          <SettingInput step="0.1" label={t.settings_hw_weight}  value={draft.homeworkWeight}   onChange={(v) => update("homeworkWeight", v)} />
          <SettingInput step="0.1" label={t.settings_att_weight} value={draft.attendanceWeight} onChange={(v) => update("attendanceWeight", v)} />
          <SettingInput step="0.1" label={t.settings_act_weight} value={draft.activityWeight}   onChange={(v) => update("activityWeight", v)} />
        </div>
        {scoreStatus.message && (
          <p className={cx("settings-status", scoreStatus.type === "error" ? "settings-status-error" : "settings-status-ok")} style={{ marginBottom: "8px" }}>
            {scoreStatus.message}
          </p>
        )}
        <button className="primary-button" onClick={handleSaveSettings} disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          {busy ? <Loader2 size={16} className="spinner" /> : <Settings size={16} />}
          {t.settings_save_settings}
        </button>
      </section>

      {/* Titles */}
      <section className="panel">
        <PanelHeader icon={Settings} title="🏷️ Avto-unvonlar (Senior guruhlar)" subtitle="Har bir unvonni yoqish/o'chirish va shartini sozlash" />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            {
              key: "lightning", emoji: "⚡", label: "LIGHTNING",
              color: "#d97706", bg: "#fef9c3", border: "#fde68a",
              enabledKey: "titleLightningEnabled",
              desc: "Bu haftada #1 o'rinda",
              fields: [],
            },
            {
              key: "on_fire", emoji: "🔥", label: "ON FIRE",
              color: "#dc2626", bg: "#fee2e2", border: "#fca5a5",
              enabledKey: "titleOnFireEnabled",
              desc: "3 dars ketma-ket natija o'sgan",
              fields: [],
            },
            {
              key: "eagle", emoji: "🦅", label: "EAGLE",
              color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd",
              enabledKey: "titleEagleEnabled",
              desc: "Oxirgi darsda",
              fields: [{ key: "titleEagleThreshold", label: "%+", min: 50, max: 100, step: 5, suffix: "% dan yuqori" }],
            },
            {
              key: "machine", emoji: "💎", label: "MACHINE",
              color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc",
              enabledKey: "titleMachineEnabled",
              desc: "Oylik o'rtacha",
              fields: [
                { key: "titleMachineThreshold",  label: "%+",        min: 50, max: 100, step: 5,  suffix: "%+ ball" },
                { key: "titleMachineMinLessons", label: "Min dars:", min: 1,  max: 20,  step: 1,  suffix: "ta darsdan keyin" },
              ],
            },
            {
              key: "ghost", emoji: "💀", label: "GHOST",
              color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1",
              enabledKey: "titleGhostEnabled",
              desc: "Uy vazifa qilmagan",
              fields: [{ key: "titleGhostThreshold", label: "Marta:", min: 1, max: 20, step: 1, suffix: "ta marta va undan ko'p" }],
            },
          ].map(title => {
            const isOn = draft[title.enabledKey] !== false;
            return (
              <div key={title.key} style={{
                border: `1.5px solid ${isOn ? title.border : "#e2e8f0"}`,
                borderLeft: `4px solid ${isOn ? title.color : "#e2e8f0"}`,
                borderRadius: "12px", padding: "12px 16px",
                background: isOn ? title.bg + "55" : "#f8fafc",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "22px", flexShrink: 0 }}>{title.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 900, padding: "2px 8px", borderRadius: "999px",
                          background: isOn ? title.bg : "#e2e8f0",
                          color: isOn ? title.color : "#94a3b8",
                          border: `1px solid ${isOn ? title.border : "#e2e8f0"}`,
                          letterSpacing: "0.5px",
                        }}>
                          {title.emoji} {title.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginTop: "3px" }}>
                        {title.desc}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, [title.enabledKey]: !isOn }))}
                    style={{
                      flexShrink: 0, width: "44px", height: "24px", borderRadius: "999px",
                      border: "none", cursor: "pointer", position: "relative",
                      background: isOn ? title.color : "#cbd5e1",
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: "3px",
                      left: isOn ? "22px" : "3px",
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "white", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
                {isOn && title.fields.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                    {title.fields.map(field => (
                      <div key={field.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{field.label}</span>
                        <input
                          type="number"
                          min={field.min} max={field.max} step={field.step}
                          value={draft[field.key] ?? (field.key === "titleEagleThreshold" ? 95 : field.key === "titleMachineThreshold" ? 85 : field.key === "titleMachineMinLessons" ? 3 : 5)}
                          onChange={e => setDraft(d => ({ ...d, [field.key]: Number(e.target.value) }))}
                          style={{ width: "64px", padding: "5px 8px", borderRadius: "7px", border: `1.5px solid ${title.border}`, fontSize: "13px", fontWeight: 700, textAlign: "center" }}
                        />
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{field.suffix}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button className="primary-button" onClick={handleSaveSettings} disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}>
          {busy ? <Loader2 size={16} className="spinner" /> : <Settings size={16} />}
          Unvon sozlamalarini saqlash
        </button>
      </section>

      {/* Battles */}
      <section className="panel">
        <PanelHeader
          icon={Settings}
          title="⚔️ Chempionatlar"
          subtitle="Har bir chempionatni yoqish/o'chirish va kimga ko'rsatish"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { emoji: "🐉", label: "Boss Battle",     enabledKey: "bossBattleEnabled",  targetKey: "bossBattleTarget"  },
            { emoji: "⚔️", label: "Guruh vs Guruh",  enabledKey: "groupMatchEnabled",  targetKey: "groupMatchTarget"  },
            { emoji: "🏴", label: "Klan Jangi",      enabledKey: "clanBattleEnabled",  targetKey: "clanBattleTarget"  },
          ].map(battle => {
            const isOn = draft[battle.enabledKey] === true;
            const currentTarget = draft[battle.targetKey] || "all";
            return (
              <div key={battle.enabledKey} style={{
                border: `1.5px solid ${isOn ? "#7c3aed40" : "#e2e8f0"}`,
                borderLeft: `4px solid ${isOn ? "#7c3aed" : "#e2e8f0"}`,
                borderRadius: "12px", padding: "12px 16px",
                background: isOn ? "#ede9fe22" : "#f8fafc",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>{battle.emoji}</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: isOn ? "#4c1d95" : "#94a3b8" }}>{battle.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveBattleSetting(battle.enabledKey, !isOn)}
                    style={{
                      flexShrink: 0, width: "44px", height: "24px", borderRadius: "999px",
                      border: "none", cursor: "pointer", position: "relative",
                      background: isOn ? "#7c3aed" : "#cbd5e1",
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: "3px",
                      left: isOn ? "22px" : "3px",
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "white", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
                {isOn && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    {[
                      { value: "all",    label: "Barcha guruhlar" },
                      { value: "senior", label: "Faqat Senior" },
                      { value: "junior", label: "Faqat Junior" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => saveBattleSetting(battle.targetKey, opt.value)}
                        style={{
                          padding: "5px 14px", borderRadius: "8px", cursor: "pointer",
                          fontSize: "12px", fontWeight: 700,
                          border: `2px solid ${currentTarget === opt.value ? "#7c3aed" : "#e2e8f0"}`,
                          background: currentTarget === opt.value ? "#ede9fe" : "white",
                          color: currentTarget === opt.value ? "#7c3aed" : "#64748b",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Auto-random weekly toggle */}
        {(() => {
          const isAutoRandom = draft.battleRandomWeekly === true;
          return (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "14px", padding: "12px 16px", borderRadius: "12px",
              border: `1.5px solid ${isAutoRandom ? "#7c3aed40" : "#e2e8f0"}`,
              borderLeft: `4px solid ${isAutoRandom ? "#7c3aed" : "#e2e8f0"}`,
              background: isAutoRandom ? "#ede9fe22" : "#f8fafc",
            }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: isAutoRandom ? "#4c1d95" : "#94a3b8" }}>
                  🎲 Haftalik avto-random
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginTop: "2px" }}>
                  Har hafta boshida chempionatlar avtomatik randomlanadi
                </div>
              </div>
              <button
                type="button"
                onClick={() => saveBattleSetting("battleRandomWeekly", !isAutoRandom)}
                style={{
                  flexShrink: 0, width: "44px", height: "24px", borderRadius: "999px",
                  border: "none", cursor: "pointer", position: "relative",
                  background: isAutoRandom ? "#7c3aed" : "#cbd5e1",
                  transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: "3px",
                  left: isAutoRandom ? "22px" : "3px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>
          );
        })()}
        <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, marginTop: "8px", textAlign: "center" }}>
          ✅ O'zgarishlar avtomatik saqlanadi
        </p>
      </section>

      {/* Telegram */}
      <section className="panel">
        <PanelHeader icon={Send} title={t.tg_title} subtitle={t.tg_sub} />
        <div className="settings-info-box" style={{ marginBottom: "16px" }}>
          {t.tg_token_hint}
        </div>
        <label className="settings-label">{t.tg_token_label}</label>
        <div style={{ position: "relative", marginTop: "6px" }}>
          <input
            type={showToken ? "text" : "password"}
            className="settings-input"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder={t.tg_token_ph}
            style={{ paddingRight: "44px", fontFamily: "monospace", fontSize: "13px" }}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
          >
            {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          <button className="primary-button" onClick={handleSaveToken} disabled={busy}>
            {busy ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
            {t.tg_save_token}
          </button>
          <button className="secondary-button" onClick={handleFetchChats} disabled={fetchingChats || !botToken.trim()}>
            {fetchingChats ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
            {fetchingChats ? t.tg_fetch_loading : t.tg_fetch_btn}
          </button>
        </div>
        {tgSaveMsg.text && (
          <p className={cx("settings-status", tgSaveMsg.type === "error" ? "settings-status-error" : "settings-status-ok")} style={{ marginTop: "10px" }}>
            {tgSaveMsg.text}
          </p>
        )}
        {tgChats !== null && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>{t.tg_fetch_hint}</p>
            {tgChats.length === 0 ? (
              <div>
                <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>{t.tg_fetch_empty}</p>
                <p style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600, marginTop: "8px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 12px" }}>
                  💡 Guruh ko'rinmasa: botni guruhga qo'shgandan so'ng o'sha guruhda biror xabar yozing yoki <code>/start</code> yuboring, keyin qayta tekshiring.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{t.tg_chats_title}:</p>
                {tgChats.map(chat => (
                  <div key={chat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px" }}>
                    <div>
                      <strong style={{ fontSize: "13px" }}>{chat.title}</strong>
                      <code style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{chat.id}</code>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: "6px 12px", fontSize: "12px", flexShrink: 0, background: copiedId === chat.id ? "#dcfce7" : undefined, color: copiedId === chat.id ? "#16a34a" : undefined }}
                      onClick={() => copyId(chat.id)}
                    >
                      {copiedId === chat.id ? t.tg_copied : t.tg_copy}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Admin: create teacher */}
      {teacher?.role === "admin" && (
        <section className="panel">
          <PanelHeader icon={UserPlus} title="Yangi o'qituvchi yaratish" subtitle="Parol avtomatik 123456 qo'yiladi" />
          <form onSubmit={handleCreateTeacher} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="settings-account-grid">
              <div>
                <label className="settings-label">Ism familiya</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ marginTop: "6px" }}
                  value={newTeacher.name}
                  onChange={e => setNewTeacher(p => ({ ...p, name: e.target.value }))}
                  placeholder="Abdullayev Jasur"
                  required
                />
              </div>
              <div>
                <label className="settings-label">Telefon raqam</label>
                <div className="phone-field" style={{ marginTop: "6px" }}>
                  <b>+998</b>
                  <input
                    inputMode="numeric"
                    maxLength="9"
                    value={newTeacher.phone}
                    onChange={e => setNewTeacher(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                    placeholder="901234567"
                    required
                  />
                </div>
              </div>
            </div>
            {teacherStatus.text && (
              <p className={cx("settings-status", teacherStatus.type === "error" ? "settings-status-error" : "settings-status-ok")}>
                {teacherStatus.text}
              </p>
            )}
            <button className="primary-button" type="submit" disabled={teacherBusy} style={{ justifyContent: "center" }}>
              {teacherBusy ? <Loader2 size={16} className="spinner" /> : <UserPlus size={16} />}
              {teacherBusy ? "Yaratilmoqda..." : "O'qituvchi yaratish (parol: 123456)"}
            </button>
          </form>
        </section>
      )}

      {/* Ma'lumotlarni tiklash */}
      <section className="panel" style={{ border: "2px solid #fca5a5" }}>
        <PanelHeader icon={Settings} title="Ma'lumotlarni tiklash" subtitle="Telefon o'zgartirish sabab yo'qolgan ma'lumotlarni qaytarish" />
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
          Firebase Console → Firestore → <code>users</code> kolleksiyasini oching → ma'lumotlari bor eski document ID ni nusxalab quyiga kiriting.
        </p>
        <form onSubmit={handleRestoreData} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="settings-label">Eski UID (document ID)</label>
            <input
              type="text"
              className="settings-input"
              style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "13px" }}
              value={restoreUid}
              onChange={e => setRestoreUid(e.target.value.trim())}
              placeholder="abc123xyz..."
              required
            />
          </div>
          {restoreStatus.text && (
            <p className={cx("settings-status", restoreStatus.type === "error" ? "settings-status-error" : "settings-status-ok")}>
              {restoreStatus.text}
            </p>
          )}
          <button className="danger-button" type="submit" disabled={restoreBusy || !restoreUid} style={{ justifyContent: "center" }}>
            {restoreBusy ? <Loader2 size={16} className="spinner" /> : <Settings size={16} />}
            {restoreBusy ? "Tiklanmoqda..." : "Ma'lumotlarni tiklash"}
          </button>
        </form>
      </section>

      {/* Account */}
      <section className="panel">
        <PanelHeader icon={UserRound} title={t.settings_profile_title} subtitle={t.settings_profile_sub} />
        <div className="settings-account-grid">
          <div className="settings-account-block">
            <label className="settings-label">{t.settings_name_label}</label>
            <input
              type="text"
              className="settings-input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder={t.settings_name_ph}
            />
            <label className="settings-label" style={{ marginTop: "12px" }}>{t.auth_phone}</label>
            <div
              className="phone-field"
              style={{ marginTop: "6px", cursor: "not-allowed" }}
              title="Telefon raqamni o'zgartirib bo'lmaydi"
            >
              <b>+998</b>
              <div style={{ flex: 1, padding: "16px 20px", fontWeight: 900, fontSize: "18px", color: "#374151", userSelect: "none" }}>
                {profilePhone}
              </div>
            </div>
            {profileStatus.message && (
              <p className={cx("settings-status", profileStatus.type === "error" ? "settings-status-error" : "settings-status-ok")}>
                {profileStatus.message}
              </p>
            )}
            <button className="primary-button" onClick={handleUpdateProfile} disabled={busy} style={{ marginTop: "12px" }}>
              {busy ? <Loader2 size={16} className="spinner" /> : <CheckCircle2 size={16} />}
              {t.settings_save_profile}
            </button>
          </div>

          <div className="settings-account-block">
            <label className="settings-label">Eski parol</label>
            <div style={{ position: "relative", marginTop: "6px" }}>
              <input
                type={showOldPassword ? "text" : "password"}
                className="settings-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Joriy parolingiz"
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <label className="settings-label" style={{ marginTop: "12px" }}>{t.settings_new_password}</label>
            <div style={{ position: "relative", marginTop: "6px" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="settings-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.settings_password_ph}
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordStatus.message && (
              <p className={cx("settings-status", passwordStatus.type === "error" ? "settings-status-error" : "settings-status-ok")}>
                {passwordStatus.message}
              </p>
            )}
            <button className="danger-button" onClick={handleChangePassword} disabled={busy || !oldPassword || !newPassword} style={{ marginTop: "12px" }}>
              {busy ? <Loader2 size={16} className="spinner" /> : <Clock3 size={16} />}
              {t.settings_change_password}
            </button>
          </div>
        </div>
      </section>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", background: isDemo ? "#fef9c3" : "#f0fdf4", border: `2px solid ${isDemo ? "#fde047" : "#bbf7d0"}`, borderRadius: "14px" }}>
        <span className={cx("live-dot", isDemo ? "live-dot-demo" : "live-dot-online")} />
        <div>
          <strong style={{ fontSize: "13px", color: isDemo ? "#854d0e" : "#166534" }}>{isDemo ? t.sidebar_demo : t.sidebar_live}</strong>
          <p style={{ fontSize: "12px", color: isDemo ? "#92400e" : "#15803d", margin: 0 }}>{t.sidebar_realtime}</p>
        </div>
      </div>
    </div>
  );
}
