import { Download } from "lucide-react";

export function ExportButton({ rows, groupName }) {
  function exportRows() {
    const columns = ["Ism", "Guruh", "Uy vazifa %", "Yuqori natija %", "Aktivlik %", "Coin", "Haftalik rank", "Oylik rank"];
    const body = rows
      .map((student) =>
        [
          student.name,
          student.group,
          student.homeworkScore,
          student.attendanceScore,
          student.activityScore,
          student.coins,
          student.weeklyRank,
          student.monthlyRank
        ]
          .map((value) => `<td>${String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</td>`)
          .join("")
      )
      .map((cells) => `<tr>${cells}</tr>`)
      .join("");
    const table = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr>${columns
      .map((column) => `<th>${column}</th>`)
      .join("")}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${groupName}-ranking.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="primary-button" onClick={exportRows}>
      <Download size={17} />
      Excel
    </button>
  );
}
