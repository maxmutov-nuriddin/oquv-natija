import dayjs from "dayjs";
import { CalendarDays, Loader2, Menu, Search, Send, Users } from "lucide-react";
import { useState } from "react";
import { navItems } from "../../constants";
import { useT } from "../../i18n/index.jsx";

export function Topbar({ activePage, date, setDate, query, setQuery, selectedGroup, groups, setSelectedGroup, onSendResults, onMenuClick }) {
  const { t } = useT();
  const pageTitle = t[`nav_${activePage}`] || navItems.find((item) => item.id === activePage)?.label || "Dashboard";
  const [sendStatus, setSendStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!onSendResults || !selectedGroup) return;
    setSending(true);
    setSendStatus("");
    try {
      await onSendResults();
      setSendStatus(t.topbar_send_done);
      setTimeout(() => setSendStatus(""), 3000);
    } catch (err) {
      setSendStatus(`${t.topbar_send_fail} ${err?.message || ""}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <span className="eyebrow">{t.topbar_eyebrow}</span>
          <h2>{pageTitle}</h2>
          <p>{t.topbar_subtitle(dayjs(date).format("DD MMMM YYYY"), selectedGroup || t.topbar_no_group)}</p>
        </div>
      </div>

      <div className="control-row">
        <button
          className="primary-button"
          onClick={handleSend}
          disabled={sending || !selectedGroup}
          style={{ height: "54px", padding: "0 20px", fontSize: "14px", whiteSpace: "nowrap" }}
        >
          {sending ? <Loader2 size={15} className="spinner" /> : <Send size={15} />}
          {sending ? t.topbar_sending : (sendStatus || t.topbar_send_results)}
        </button>

        <label className="control control-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.topbar_search} />
        </label>

        <label className="control control-date">
          <CalendarDays size={17} />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label className="control control-select">
          <Users size={17} />
          <select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
            <option value="">{groups.length ? t.topbar_select_group : t.topbar_no_group}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
