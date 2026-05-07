import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import dayjs from "dayjs";

function calcFinal(r, settings) {
  const hw  = Number(settings?.homeworkWeight  || 0.4);
  const att = Number(settings?.attendanceWeight || 0.3);
  const act = Number(settings?.activityWeight   || 0.3);
  return Math.round((r.homework || 0) * hw + (r.attendance || 0) * att + (r.activity || 0) * act);
}

function sheet(data, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = colWidths.map(w => ({ wch: w }));
  return ws;
}

export function ExportButton({ rows, groupName, records = [], settings = {} }) {
  function handleExport() {
    const wb = XLSX.utils.book_new();
    const groupIds = new Set(rows.map(s => s.id));
    const nameById = Object.fromEntries(rows.map(s => [s.id, s.name]));

    // ── Sheet 1: Ranking ──────────────────────────────────────────────
    XLSX.utils.book_append_sheet(wb, sheet(
      [
        ["#", "Ism", "Guruh", "Daraja", "Jami Coin", "Haftalik Coin", "Oylik Coin", "Haftalik Rank", "Oylik Rank", "Uy Vazifa %", "Yuqori Natija %", "Aktivlik %"],
        ...rows.map((s, i) => [
          i + 1,
          s.name,
          s.group,
          s.level?.name || "",
          s.coins        || 0,
          s.weeklyCoins  || 0,
          s.monthlyCoins || 0,
          s.weeklyRank   || "",
          s.monthlyRank  || "",
          s.homeworkScore   || 0,
          s.attendanceScore || 0,
          s.activityScore   || 0,
        ]),
      ],
      [4, 24, 14, 12, 12, 14, 12, 14, 12, 13, 16, 12]
    ), "Ranking");

    // ── Sheet 2: Barcha tarix ─────────────────────────────────────────
    const histRecs = records
      .filter(r => groupIds.has(r.studentId))
      .sort((a, b) => b.date.localeCompare(a.date));

    XLSX.utils.book_append_sheet(wb, sheet(
      [
        ["Sana", "O'quvchi", "Uy Vazifa %", "Yuqori Natija %", "Aktivlik %", "Final %", "Coin"],
        ...histRecs.map(r => [
          dayjs(r.date).format("DD.MM.YYYY"),
          nameById[r.studentId] || "-",
          r.homework   || 0,
          r.attendance || 0,
          r.activity   || 0,
          calcFinal(r, settings),
          r.coinsEarned || 0,
        ]),
      ],
      [14, 24, 13, 16, 13, 10, 10]
    ), "Barcha tarix");

    // ── Sheet 3: O'quvchi xulosasi ────────────────────────────────────
    XLSX.utils.book_append_sheet(wb, sheet(
      [
        ["O'quvchi", "Jami Dars", "O'rt. Uy Vazifa", "O'rt. Yuq.Natija", "O'rt. Aktivlik", "O'rt. Final %", "Jami Coin", "Eng yaxshi kun"],
        ...rows.map(s => {
          const recs = records.filter(r => r.studentId === s.id && (r.homework > 0 || r.attendance > 0 || r.activity > 0));
          const n = recs.length || 1;
          const avg = key => Math.round(recs.reduce((sum, r) => sum + (r[key] || 0), 0) / n);
          const hw = avg("homework");
          const att = avg("attendance");
          const act = avg("activity");
          const best = [...recs].sort((a, b) => calcFinal(b, settings) - calcFinal(a, settings))[0];
          return [
            s.name,
            recs.length,
            hw,
            att,
            act,
            Math.round(hw * (settings.homeworkWeight || 0.4) + att * (settings.attendanceWeight || 0.3) + act * (settings.activityWeight || 0.3)),
            s.coins || 0,
            best ? dayjs(best.date).format("DD.MM.YYYY") : "-",
          ];
        }),
      ],
      [24, 11, 16, 17, 15, 14, 12, 16]
    ), "O'quvchi xulosasi");

    XLSX.writeFile(wb, `${groupName}-${dayjs().format("YYYY-MM-DD")}.xlsx`);
  }

  return (
    <button className="primary-button" onClick={handleExport}>
      <Download size={17} />
      Excel
    </button>
  );
}
