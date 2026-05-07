import dayjs from "dayjs";
import { BookOpen } from "lucide-react";
import { useT } from "../../i18n/index.jsx";
import { loadComics } from "../../lib/comics";
import { PanelHeader } from "./PanelHeader";

export function WeeklyComicPanel({ group, date }) {
  const { t } = useT();
  const comics = loadComics(group);

  const panels = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs(date).subtract(6 - i, "day");
    const key = d.format("YYYY-MM-DD");
    const dayIdx = d.day();
    return { date: key, label: `${t.weekday_short[dayIdx]}, ${d.format("DD MMM")}`, dialog: comics[key]?.dialog || null };
  }).filter(p => p.dialog);

  if (!panels.length) return null;

  return (
    <section className="panel">
      <PanelHeader icon={BookOpen} title={t.comic_panel_title} subtitle={t.comic_panel_sub} />
      <div className="comic-strip">
        {panels.map((p, i) => (
          <div key={p.date} className="comic-panel">
            <div className="comic-panel-header">
              <span className="comic-panel-day">{p.label}</span>
              <span className="comic-panel-num">#{i + 1}</span>
            </div>
            <div className="comic-speech">
              <span className="comic-speech-icon">💬</span>
              <p>{p.dialog}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
