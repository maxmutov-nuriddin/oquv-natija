import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Eye, EyeOff, Loader2, Send, Settings, UserRound } from "lucide-react";
import { useT } from "../i18n/index.jsx";
import { cx } from "../lib/utils";
import { PanelHeader } from "../components/ui/PanelHeader";
import { SettingInput } from "../components/ui/SettingInput";

export function SettingsPage({ settings, saveSettings, teacher, updateProfile, changePassword, isDemo }) {
  const { t } = useT();
  const [draft, setDraft] = useState(settings);
  const [profileName, setProfileName] = useState(teacher?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [botToken, setBotToken] = useState(settings?.telegramBotToken || "");
  const [showToken, setShowToken] = useState(false);
  const [tgSaveMsg, setTgSaveMsg] = useState({ type: "", text: "" });
  const [tgChats, setTgChats] = useState(null);
  const [fetchingChats, setFetchingChats] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(settings);
    setBotToken(settings?.telegramBotToken || "");
  }, [settings]);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  async function handleSaveSettings() {
    setBusy(true);
    try {
      await saveSettings({ ...draft, telegramBotToken: botToken.trim() });
      setStatus({ type: "success", message: t.settings_saved });
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  }

  async function handleFetchChats() {
    const token = botToken.trim();
    if (!token) return;
    setFetchingChats(true);
    setTgChats(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
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

  function copyId(id) {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
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

  async function handleUpdateProfile() {
    setBusy(true);
    try {
      await updateProfile({ name: profileName });
      setStatus({ type: "success", message: t.settings_profile_saved });
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
      setStatus({ type: "error", message: t.settings_password_short });
      return;
    }
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      await changePassword(newPassword);
      setNewPassword("");
      setStatus({ type: "success", message: t.settings_password_saved });
      alert(t.settings_password_alert);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <PanelHeader icon={Settings} title={t.settings_title} subtitle={t.settings_sub} />

      {status.message && (
        <div className={cx("alert", status.type === "error" ? "alert-error" : "alert-success")} style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
          {status.message}
        </div>
      )}

      <section className="panel">
        <PanelHeader icon={UserRound} title={t.settings_profile_title} subtitle={t.settings_profile_sub} />
        <div className="settings-grid">
          <label className="setting-field">
            <span>{t.settings_name_label}</span>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder={t.settings_name_ph} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
          </label>
        </div>
        <button className="primary-button" onClick={handleUpdateProfile} disabled={busy} style={{ marginTop: "16px" }}>
          {busy ? <Loader2 size={17} className="spinner" /> : <CheckCircle2 size={17} />}
          {t.settings_save_profile}
        </button>
      </section>

      <section className="panel">
        <PanelHeader icon={BarChart3} title={t.settings_reward_title} subtitle={t.settings_reward_sub} />
        <div className="settings-grid">
          <SettingInput label={t.settings_hw_coin}         value={draft.homeworkCoin}    onChange={(v) => update("homeworkCoin", v)} />
          <SettingInput label={t.settings_att_coin}        value={draft.attendanceCoin}  onChange={(v) => update("attendanceCoin", v)} />
          <SettingInput label={t.settings_act_coin}        value={draft.activityCoin}    onChange={(v) => update("activityCoin", v)} />
          <SettingInput label={t.settings_extra_task_coin}   value={draft.extraTaskCoin ?? 3}    onChange={(v) => update("extraTaskCoin", v)} />
          <SettingInput step="0.05" label={t.settings_extra_task_weight} value={draft.extraTaskWeight ?? 0.1} onChange={(v) => update("extraTaskWeight", v)} />
          <SettingInput step="0.1" label={t.settings_hw_weight}  value={draft.homeworkWeight}   onChange={(v) => update("homeworkWeight", v)} />
          <SettingInput step="0.1" label={t.settings_att_weight} value={draft.attendanceWeight} onChange={(v) => update("attendanceWeight", v)} />
          <SettingInput step="0.1" label={t.settings_act_weight} value={draft.activityWeight}   onChange={(v) => update("activityWeight", v)} />
        </div>
        <button className="primary-button" onClick={handleSaveSettings} disabled={busy} style={{ marginTop: "16px" }}>
          {busy ? <Loader2 size={17} className="spinner" /> : <Settings size={17} />}
          {t.settings_save_settings}
        </button>
      </section>

      <section className="panel">
        <PanelHeader icon={Send} title={t.tg_title} subtitle={t.tg_sub} />
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#0369a1", marginBottom: "16px", whiteSpace: "pre-line", lineHeight: 1.6 }}>
          {t.tg_token_hint}
        </div>
        <div className="settings-grid">
          <label className="setting-field">
            <span>{t.tg_token_label}</span>
            <div style={{ position: "relative" }}>
              <input
                type={showToken ? "text" : "password"}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder={t.tg_token_ph}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px", width: "100%", paddingRight: "40px", fontFamily: "monospace", fontSize: "12px" }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{ position: "absolute", right: "12px", top: "calc(50% + 2px)", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
          <button className="primary-button" onClick={handleSaveToken} disabled={busy}>
            {busy ? <Loader2 size={17} className="spinner" /> : <Send size={17} />}
            {t.tg_save_token}
          </button>
          <button className="secondary-button" onClick={handleFetchChats} disabled={fetchingChats || !botToken.trim()}>
            {fetchingChats ? <Loader2 size={17} className="spinner" /> : <Send size={17} />}
            {fetchingChats ? t.tg_fetch_loading : t.tg_fetch_btn}
          </button>
        </div>

        {tgSaveMsg.text && (
          <p style={{ marginTop: "10px", fontWeight: 600, fontSize: "14px", color: tgSaveMsg.type === "error" ? "#dc2626" : "#16a34a" }}>
            {tgSaveMsg.text}
          </p>
        )}

        {tgChats !== null && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>{t.tg_fetch_hint}</p>
            {tgChats.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>{t.tg_fetch_empty}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{t.tg_chats_title}:</p>
                {tgChats.map(chat => (
                  <div key={chat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px" }}>
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

      <section className="panel">
        <PanelHeader icon={Clock3} title={t.settings_security_title} subtitle={t.settings_security_sub} />
        <div className="settings-grid">
          <label className="setting-field">
            <span>{t.settings_new_password}</span>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.settings_password_ph}
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
          {t.settings_change_password}
        </button>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: isDemo ? "#fef9c3" : "#f0fdf4", border: `1px solid ${isDemo ? "#fde047" : "#bbf7d0"}`, borderRadius: "12px" }}>
        <span className={cx("live-dot", isDemo ? "live-dot-demo" : "live-dot-online")} />
        <div>
          <strong style={{ fontSize: "13px", color: isDemo ? "#854d0e" : "#166534" }}>{isDemo ? t.sidebar_demo : t.sidebar_live}</strong>
          <p style={{ fontSize: "12px", color: isDemo ? "#92400e" : "#15803d", margin: 0 }}>{t.sidebar_realtime}</p>
        </div>
      </div>
    </div>
  );
}
