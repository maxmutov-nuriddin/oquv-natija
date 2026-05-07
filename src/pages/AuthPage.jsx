import { useState } from "react";
import { Award, Eye, EyeOff, Loader2 } from "lucide-react";
import { useT } from "../i18n/index.jsx";

export function AuthPage({ login, normalizePhone, resetPassword }) {
  const { t, lang, setLang } = useT();
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
        setSaving(false);
      } else {
        await login(form);
      }
    } catch (submitError) {
      setError(submitError.message);
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginBottom: "8px" }}>
          {["uz", "ru"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: "3px 10px", borderRadius: "8px", border: `2px solid ${lang === l ? "#1cb0f6" : "#e2e8f0"}`, background: lang === l ? "#e0f2fe" : "transparent", fontWeight: lang === l ? 700 : 500, fontSize: "12px", cursor: "pointer", color: lang === l ? "#0369a1" : "#64748b" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="auth-brand">
          <div className="brand-mark">
            <Award size={24} />
          </div>
          <div>
            <h1>{t.brand_title}</h1>
            <p>{t.auth_subtitle}</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span>{t.auth_teacher_name}</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder={t.auth_name_placeholder} required />
            </label>
          )}

          <label>
            <span>{t.auth_phone}</span>
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
              <span>{t.auth_password}</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength="6"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder={t.auth_password_placeholder}
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
            {saving ? t.auth_checking : mode === "forgot" ? t.auth_reset : t.auth_login}
          </button>

          {mode === "login" ? (
            <button type="button" className="text-button" style={{ marginTop: "12px", background: "none", border: "none", color: "#64748b", cursor: "pointer", width: "100%" }} onClick={() => setMode("forgot")}>
              {t.auth_forgot}
            </button>
          ) : (
            <button type="button" className="text-button" style={{ marginTop: "12px", background: "none", border: "none", color: "#64748b", cursor: "pointer", width: "100%" }} onClick={() => setMode("login")}>
              {t.auth_back}
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
