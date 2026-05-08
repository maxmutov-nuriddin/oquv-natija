import dayjs from "dayjs";
import { Clock3 } from "lucide-react";
import { cx } from "../../lib/utils";
import { useT } from "../../i18n/index.jsx";

export function CurrentLessonBanner({ group, date, time }) {
  const { t } = useT();
  const formattedDate = dayjs(date).format("DD MMMM YYYY");
  const lessonTime = group?.lessonStart && group?.lessonEnd ? `${group.lessonStart} - ${group.lessonEnd}` : time;

  return (
    <section className={cx("panel current-lesson", !group && "current-lesson-empty")}>
      <div className="current-lesson-icon">
        <Clock3 size={22} />
      </div>
      <div>
        <span className="eyebrow">{formattedDate} · {time}</span>
        {group ? (
          <>
            <h3>{group.name}</h3>
            <p>{t.banner_has_lesson(lessonTime)}</p>
          </>
        ) : (
          <>
            <h3>{t.banner_no_lesson}</h3>
            <p>{t.banner_no_lesson_sub(formattedDate, time)}</p>
          </>
        )}
      </div>
    </section>
  );
}
