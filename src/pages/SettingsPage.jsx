import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Eye, EyeOff, Loader2, Settings, UserRound } from "lucide-react";
import { cx } from "../lib/utils";
import { PanelHeader } from "../components/ui/PanelHeader";
import { SettingInput } from "../components/ui/SettingInput";

export function SettingsPage({ settings, saveSettings, teacher, updateProfile, changePassword }) {
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
