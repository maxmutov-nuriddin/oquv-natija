import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Eye, EyeOff, Loader2, Settings, UserRound } from "lucide-react";
import { useT } from "../i18n/index.jsx";
import { cx } from "../lib/utils";
import { PanelHeader } from "../components/ui/PanelHeader";
import { SettingInput } from "../components/ui/SettingInput";

export function SettingsPage({ settings, saveSettings, teacher, updateProfile, changePassword }) {
  const { t } = useT();
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
      setStatus({ type: "success", message: t.settings_saved });
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
          <SettingInput label={t.settings_hw_coin}     value={draft.homeworkCoin}    onChange={(v) => update("homeworkCoin", v)} />
          <SettingInput label={t.settings_att_coin}    value={draft.attendanceCoin}  onChange={(v) => update("attendanceCoin", v)} />
          <SettingInput label={t.settings_act_coin}    value={draft.activityCoin}    onChange={(v) => update("activityCoin", v)} />
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
    </div>
  );
}
