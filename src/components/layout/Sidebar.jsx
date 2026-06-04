import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "../../constants";
import { useT } from "../../i18n/index.jsx";
import { cx, initials } from "../../lib/utils";

export function Sidebar({ activePage, setActivePage, teacher, logout, isOpen, onClose }) {
  const { lang, t, setLang } = useT();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }
    function onAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setInstalled(true);
    }
  }

  return (
    <aside className={cx("sidebar", isOpen && "sidebar-open")}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <X size={18} />
      </button>
      <div className="brand">
        <img src="/CoddyResultsRoboLogo.png" alt="CoddyResults" className="brand-logo-robo" />
        <div>
          <h1>{t.brand_title}</h1>
          <p>{t.brand_subtitle}</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = t[`nav_${item.id}`] || item.label;
          return (
            <div key={item.id} style={{ position: "relative" }} className="nav-item-wrapper">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-button"
                  style={{ textDecoration: "none" }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </a>
              ) : (
                <button
                  className={cx("nav-button", activePage === item.id && "nav-button-active")}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-note" style={{ padding: "8px 16px" }}>
        <div style={{ display: "flex", gap: "6px", width: "100%" }}>
          <button
            onClick={() => setLang("uz")}
            style={{ flex: 1, padding: "5px", borderRadius: "8px", border: `2px solid ${lang === "uz" ? "#1cb0f6" : "#e2e8f0"}`, background: lang === "uz" ? "#e0f2fe" : "transparent", fontWeight: lang === "uz" ? 700 : 500, fontSize: "12px", cursor: "pointer", color: lang === "uz" ? "#0369a1" : "#64748b" }}
          >
            UZ
          </button>
          <button
            onClick={() => setLang("ru")}
            style={{ flex: 1, padding: "5px", borderRadius: "8px", border: `2px solid ${lang === "ru" ? "#1cb0f6" : "#e2e8f0"}`, background: lang === "ru" ? "#e0f2fe" : "transparent", fontWeight: lang === "ru" ? 700 : 500, fontSize: "12px", cursor: "pointer", color: lang === "ru" ? "#0369a1" : "#64748b" }}
          >
            RU
          </button>
        </div>
      </div>

      {installPrompt && !installed && (
        <button
          type="button"
          onClick={handleInstall}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", marginTop: "12px",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.4)",
            borderBottom: "4px solid rgba(0,0,0,0.15)",
            borderRadius: "16px", padding: "12px 16px",
            color: "white", fontWeight: 800, fontSize: "14px",
            cursor: "pointer", transition: "all 0.1s"
          }}
        >
          <Download size={18} />
          <span>Ilovani yuklab olish</span>
        </button>
      )}

      <div className="teacher-box">
        <div className="avatar avatar-small">{initials(teacher?.name || "O")}</div>
        <div>
          <strong>{teacher?.name || t.sidebar_teacher}</strong>
          {teacher?.role && (
            <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: teacher.role === "admin" ? "#fff176" : "#e0f2fe", marginTop: "2px", textTransform: "capitalize", opacity: teacher.role === "admin" ? 1 : 0.75 }}>
              {teacher.role}
            </span>
          )}
        </div>
        <button type="button" onClick={logout} className="logout-btn-small">{t.sidebar_logout}</button>
      </div>

      <footer className="app-footer">
        Created by <a href="https://mvnuriddin.netlify.app" target="_blank" rel="noreferrer" style={{ color: "inherit", fontWeight: 700, textDecoration: "none" }}>mv_nuriddin</a> &nbsp;·&nbsp; 2025
      </footer>
    </aside>
  );
}
