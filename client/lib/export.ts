import { DailyRecord } from "@/types";
import { formatDisplayDate } from "@/lib/utils";

/**
 * Converts daily records into an RFC 4180-compliant CSV string and triggers a browser download.
 */
export function exportDailyRecordsToCsv(
  dailyRecords: Record<string, DailyRecord>,
  filename: string = `deen-dunya-progress-${new Date().toISOString().slice(0, 10)}.csv`
): void {
  const dates = Object.keys(dailyRecords).sort();

  const headers = [
    "Date",
    "Formatted Date",
    "Day Type",
    "DSA Solved",
    "SQL Practiced",
    "Deep Work Minutes",
    "Deep Work Hours",
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
    "Total Salah (out of 5)",
    "Habit: Quran",
    "Habit: Salah 5x",
    "Habit: Exercise",
    "Habit: Deep Work",
    "Habit: Clean Food & Sleep",
    "Habits Completed (out of 5)",
    "Completed Blocks Count",
    "Notes",
  ];

  const escapeCsv = (str: string | number | boolean | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [headers.map(escapeCsv).join(",")];

  for (const date of dates) {
    const rec = dailyRecords[date];
    if (!rec) continue;

    const salahCount = rec.salah ? Object.values(rec.salah).filter(Boolean).length : 0;
    const habitsCount = rec.habits ? Object.values(rec.habits).filter(Boolean).length : 0;
    const blocksCount = rec.completedBlocks
      ? Object.values(rec.completedBlocks).filter(Boolean).length
      : 0;

    const row = [
      escapeCsv(rec.date),
      escapeCsv(formatDisplayDate(rec.date)),
      escapeCsv(rec.dayType),
      escapeCsv(rec.dsaCount || 0),
      escapeCsv(rec.sqlCount || 0),
      escapeCsv(rec.deepWorkMinutes || 0),
      escapeCsv(((rec.deepWorkMinutes || 0) / 60).toFixed(1)),
      escapeCsv(rec.salah?.fajr ? "Yes" : "No"),
      escapeCsv(rec.salah?.dhuhr ? "Yes" : "No"),
      escapeCsv(rec.salah?.asr ? "Yes" : "No"),
      escapeCsv(rec.salah?.maghrib ? "Yes" : "No"),
      escapeCsv(rec.salah?.isha ? "Yes" : "No"),
      escapeCsv(salahCount),
      escapeCsv(rec.habits?.quran ? "Done" : "Missed"),
      escapeCsv(rec.habits?.salah5 ? "Done" : "Missed"),
      escapeCsv(rec.habits?.exercise ? "Done" : "Missed"),
      escapeCsv(rec.habits?.deepWork ? "Done" : "Missed"),
      escapeCsv(rec.habits?.healthyFoodSleep ? "Done" : "Missed"),
      escapeCsv(habitsCount),
      escapeCsv(blocksCount),
      escapeCsv(rec.notes || ""),
    ];

    rows.push(row.join(","));
  }

  const csvContent = rows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete analytics payload to formatted JSON and triggers a browser download.
 */
export function exportAnalyticsToJson(
  analyticsData: unknown,
  filename: string = `deen-dunya-analytics-${new Date().toISOString().slice(0, 10)}.json`
): void {
  const jsonContent = JSON.stringify(analyticsData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers native browser print dialog for print-friendly report view.
 */
export function triggerPrintReport(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
