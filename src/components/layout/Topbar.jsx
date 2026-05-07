import dayjs from "dayjs";
import { CalendarDays, Search, Users } from "lucide-react";
import { navItems } from "../../constants";
import { useT } from "../../i18n/index.jsx";

export function Topbar({ activePage, date, setDate, query, setQuery, selectedGroup, groups, setSelectedGroup }) {
  const { t } = useT();
  const pageTitle = t[`nav_${activePage}`] || navItems.find((item) => item.id === activePage)?.label || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="eyebrow">{t.topbar_eyebrow}</span>
        <h2>{pageTitle}</h2>
        <p>{t.topbar_subtitle(dayjs(date).format("DD MMMM YYYY"), selectedGroup || t.topbar_no_group)}</p>
      </div>

      <div className="control-row">
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
