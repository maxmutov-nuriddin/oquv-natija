import dayjs from "dayjs";
import { Clock3 } from "lucide-react";
import { cx } from "../../lib/utils";

export function CurrentLessonBanner({ group, date, time }) {
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
            <p>Shu kun va shu vaqt oralig'ida dars bor: {lessonTime}.</p>
          </>
        ) : (
          <>
            <h3>Bu vaqtda guruh yo'q</h3>
            <p>Sizda {formattedDate} kuni soat {time} da guruhingiz yo'q.</p>
          </>
        )}
      </div>
    </section>
  );
}
