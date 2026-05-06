import dayjs from "dayjs";
import { CalendarDays, Search, Users } from "lucide-react";
import { navItems } from "../../constants";

export function Topbar({ activePage, date, setDate, query, setQuery, selectedGroup, groups, setSelectedGroup }) {
  const pageTitle = navItems.find((item) => item.id === activePage)?.label || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="eyebrow">Bugungi nazorat</span>
        <h2>{pageTitle}</h2>
        <p>{dayjs(date).format("DD MMMM YYYY")} uchun {selectedGroup || "guruh"} ma'lumotlari.</p>
      </div>

      <div className="control-row">
        <label className="control control-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O'quvchi qidirish" />
        </label>

        <label className="control control-date">
          <CalendarDays size={17} />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label className="control control-select">
          <Users size={17} />
          <select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
            <option value="">{groups.length ? "Guruh tanlang" : "Guruh yo'q"}</option>
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
