import { useState } from "react";
import { Award, Eye, EyeOff, Loader2 } from "lucide-react";

export function AuthPage({ login, normalizePhone, resetPassword }) {
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
        // keep saving=true until component unmounts on redirect
      }
    } catch (submitError) {
      setError(submitError.message);
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
