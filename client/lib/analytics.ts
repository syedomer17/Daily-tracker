import type { DailyAnalyticsRecord, HabitLog, SalahStatus, TimeBlock } from "@/types";
import { APP_TIME_ZONE, calculateTimeDiffMinutes, getTodayDateString } from "@/lib/utils";

interface AnalyticsInput {
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  completedBlocks: Record<string, boolean>;
  salahRecords: Record<string, SalahStatus>;
  habitLogs: HabitLog[];
}

/** YYYY-MM-DD strings for the last `days` days (oldest first), in Asia/Kolkata. */
export function lastNDates(days: number, now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(getTodayDateString(new Date(now.getTime() - i * 86_400_000)));
  }
  return out;
}

/**
 * Builds the last-N-days analytics from what the user actually recorded.
 * Nothing is invented: days without records show zeros.
 * Per-day DSA/SQL counts are not tracked yet, so they are always 0 here.
 */
export function buildRecentAnalytics(input: AnalyticsInput, days = 7): DailyAnalyticsRecord[] {
  const blocksById = new Map<string, TimeBlock>();
  [...input.collegeTimetable, ...input.noCollegeTimetable].forEach((b) => blocksById.set(b.id, b));

  return lastNDates(days).map((date) => {
    const hours = { deen: 0, tech: 0, college: 0, health: 0 };
    for (const [key, done] of Object.entries(input.completedBlocks)) {
      if (!done || !key.startsWith(`${date}_`)) continue;
      const block = blocksById.get(key.slice(date.length + 1));
      if (!block) continue;
      hours[block.category] += calculateTimeDiffMinutes(block.startTime, block.endTime) / 60;
    }
    const salah = input.salahRecords[date];
    const habit = input.habitLogs.find((h) => h.date === date);
    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIME_ZONE,
      weekday: "short",
    }).format(new Date(`${date}T12:00:00+05:30`));

    return {
      date,
      dayName,
      deenHours: +hours.deen.toFixed(1),
      techHours: +hours.tech.toFixed(1),
      collegeHours: +hours.college.toFixed(1),
      healthHours: +hours.health.toFixed(1),
      dsaCount: 0,
      sqlCount: 0,
      salahCount: salah ? Object.values(salah).filter(Boolean).length : 0,
      habitsCompleted: habit
        ? [habit.quran, habit.salah5, habit.exercise, habit.deepWork, habit.healthyFoodSleep].filter(Boolean).length
        : 0,
    };
  });
}
