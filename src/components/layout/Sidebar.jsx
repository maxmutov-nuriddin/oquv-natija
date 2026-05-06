import { Award } from "lucide-react";
import { navItems } from "../../constants";
import { cx, initials } from "../../lib/utils";

export function Sidebar({ activePage, setActivePage, isDemo, teacher, logout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Award size={22} />
        </div>
        <div>
          <h1>O'quv natija</h1>
          <p>Admin dashboard</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cx("nav-button", activePage === item.id && "nav-button-active")}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <span className={cx("live-dot", isDemo ? "live-dot-demo" : "live-dot-online")} />
        <div>
          <strong>{isDemo ? "Demo ma'lumot" : "Firebase live"}</strong>
          <p>O'zgarishlar real-time yangilanadi.</p>
        </div>
      </div>
      <div className="teacher-box">
        <div className="avatar avatar-small">{initials(teacher?.name || "O")}</div>
        <div>
          <strong>{teacher?.name || "O'qituvchi"}</strong>
        </div>
        <button type="button" onClick={logout} className="logout-btn-small">Chiqish</button>
      </div>
    </aside>
  );
}
