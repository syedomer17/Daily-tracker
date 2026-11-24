import type {
  DailyAnalyticsRecord,
  DailyRecord,
  DailyReview,
  DayType,
  HabitFlags,
  HabitLog,
  SalahStatus,
  TimeBlock,
  WeeklyGoal,
} from "@/types";
import {
  APP_TIME_ZONE,
  calculateTimeDiffMinutes,
  getDateRangeArray,
  getCurrentTime24Kolkata,
  getTodayDateString,
  getYesterdayDateString,
  getTomorrowDateString,
} from "@/lib/utils";

export interface AnalyticsInput {
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  completedBlocks: Record<string, boolean>;
  salahRecords: Record<string, SalahStatus>;
  habitLogs: HabitLog[];
  dailyRecords?: Record<string, DailyRecord>;
}

/** YYYY-MM-DD strings for the last `days` days (oldest first), in Asia/Kolkata. */
export function lastNDates(days: number, now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(getTodayDateString(new Date(now.getTime() - i * 86_400_000)));
  }
  return out;
}

/** Check if a daily record has qualifying activity for a given streak type */
export function isDayActive(
  record: DailyRecord | undefined,
  type: "all" | "salah" | "deepWork" | "habits" | "dsa" | "sql" = "all"
): boolean {
  if (!record) return false;

  switch (type) {
    case "salah":
      return Boolean(
        record.salah &&
          record.salah.fajr &&
          record.salah.dhuhr &&
          record.salah.asr &&
          record.salah.maghrib &&
          record.salah.isha
      );
    case "deepWork":
      return (record.deepWorkMinutes || 0) > 0;
    case "habits":
      return Boolean(
        record.habits &&
          record.habits.quran &&
          record.habits.salah5 &&
          record.habits.exercise &&
          record.habits.deepWork &&
          record.habits.healthyFoodSleep
      );
    case "dsa":
      return (record.dsaCount || 0) > 0;
    case "sql":
      return (record.sqlCount || 0) > 0;
    case "all":
    default: {
      const hasCompletedBlocks =
        record.completedBlocks &&
        Object.values(record.completedBlocks).some(Boolean);
      const hasSalah =
        record.salah && Object.values(record.salah).some(Boolean);
      const hasHabits =
        record.habits && Object.values(record.habits).some(Boolean);
      const hasDsa = (record.dsaCount || 0) > 0;
      const hasSql = (record.sqlCount || 0) > 0;
      const hasDeepWork = (record.deepWorkMinutes || 0) > 0;

      return (
        hasCompletedBlocks ||
        hasSalah ||
        hasHabits ||
        hasDsa ||
        hasSql ||
        hasDeepWork
      );
    }
  }
}

/**
 * Calculates current and longest activity streaks strictly from recorded user entries.
 * Rules:
 * - Untouched/empty days are NOT completed.
 * - Future dates (> todayDate) are completely ignored.
 * - Active day stays active until day ends in Asia/Kolkata:
 *   If today has activity, it counts.
 *   If today has no activity yet, streak stays alive if yesterday was active.
 *   If yesterday was inactive, streak is 0.
 */
export function calculateAccurateStreak(
  dailyRecords: Record<string, DailyRecord> = {},
  todayDate: string = getTodayDateString(),
  type: "all" | "salah" | "deepWork" | "habits" | "dsa" | "sql" = "all"
): { currentStreak: number; longestStreak: number; activeDaysCount: number } {
  // Filter out any future dates beyond todayDate
  const recordedDates = Object.keys(dailyRecords)
    .filter((d) => d <= todayDate)
    .sort();

  // 1. Current Streak calculation
  let currentStreak = 0;
  const todayRecord = dailyRecords[todayDate];
  const todayActive = isDayActive(todayRecord, type);

  if (todayActive) {
    currentStreak = 1;
    let prevDate = getYesterdayDateString(todayDate);
    while (isDayActive(dailyRecords[prevDate], type)) {
      currentStreak++;
      prevDate = getYesterdayDateString(prevDate);
    }
  } else {
    // Today not active yet - check yesterday to maintain continuity
    const yesterdayDate = getYesterdayDateString(todayDate);
    if (isDayActive(dailyRecords[yesterdayDate], type)) {
      currentStreak = 1;
      let prevDate = getYesterdayDateString(yesterdayDate);
      while (isDayActive(dailyRecords[prevDate], type)) {
        currentStreak++;
        prevDate = getYesterdayDateString(prevDate);
      }
    }
  }

  // 2. Longest Streak calculation across all historical records up to today
  let longestStreak = 0;
  let currentRun = 0;
  let lastActiveDate: string | null = null;
  let activeDaysCount = 0;

  for (const date of recordedDates) {
    if (isDayActive(dailyRecords[date], type)) {
      activeDaysCount++;
      if (lastActiveDate && getTomorrowDateString(lastActiveDate) === date) {
        currentRun++;
      } else {
        currentRun = 1;
      }
      lastActiveDate = date;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    }
  }

  // Ensure longestStreak is at least equal to currentStreak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak, activeDaysCount };
}

/**
 * Calculates a balanced completion percentage (0 - 100) for a given day:
 * - Timetable blocks: 40%
 * - Salah (5 daily prayers): 30%
 * - Habits (5 core habits): 20%
 * - Deep Work (target 90 mins): 10%
 */
export function getCompletionPercentage(
  record: DailyRecord | undefined,
  timetable: TimeBlock[] = []
): number {
  if (!record) return 0;

  // 1. Timetable completion (40%)
  let timetableScore = 0;
  if (timetable.length > 0) {
    const completedCount = timetable.filter(
      (b) => record.completedBlocks && record.completedBlocks[b.id]
    ).length;
    timetableScore = (completedCount / timetable.length) * 40;
  }

  // 2. Salah completion (30%)
  const salahCount = record.salah
    ? Object.values(record.salah).filter(Boolean).length
    : 0;
  const salahScore = (salahCount / 5) * 30;

  // 3. Habits completion (20%)
  const habitsCount = record.habits
    ? Object.values(record.habits).filter(Boolean).length
    : 0;
  const habitsScore = (habitsCount / 5) * 20;

  // 4. Deep work score (10%) - capped at 90 mins
  const deepWorkMins = record.deepWorkMinutes || 0;
  const deepWorkScore = Math.min(1, deepWorkMins / 90) * 10;

  return Math.min(100, Math.round(timetableScore + salahScore + habitsScore + deepWorkScore));
}

export interface DayAggregatedStat {
  date: string;
  dayName: string;
  dayType: DayType;
  completionRate: number;
  dsaCount: number;
  sqlCount: number;
  deepWorkMinutes: number;
  deepWorkHours: number;
  deenHours: number;
  techHours: number;
  collegeHours: number;
  healthHours: number;
  salahCount: number;
  habitsCompleted: number;
  completedBlocksCount: number;
  totalBlocksCount: number;
  hasRecord: boolean;
}

export interface DateRangeAggregation {
  startDate: string;
  endDate: string;
  daysCount: number;
  activeDaysCount: number;
  totalDsa: number;
  totalSql: number;
  totalDeepWorkMinutes: number;
  totalDeepWorkHours: number;
  averageDailyCompletion: number;
  salahAdherenceRate: number; // 0 - 100
  habitAdherenceRate: number; // 0 - 100
  timetableCompletionRate: number; // 0 - 100
  totalDeenHours: number;
  totalTechHours: number;
  totalCollegeHours: number;
  totalHealthHours: number;
  dailyStats: DayAggregatedStat[];
}

/** Aggregates all activity across an arbitrary date range (inclusive) */
export function aggregateDateRange(params: {
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dayTypeByDate?: Record<string, DayType>;
  startDate: string;
  endDate: string;
}): DateRangeAggregation {
  const {
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate = {},
    startDate,
    endDate,
  } = params;

  const dates = getDateRangeArray(startDate, endDate);
  const blocksById = new Map<string, TimeBlock>();
  [...collegeTimetable, ...noCollegeTimetable].forEach((b) => blocksById.set(b.id, b));

  let totalDsa = 0;
  let totalSql = 0;
  let totalDeepWorkMinutes = 0;
  let totalSalah = 0;
  let totalHabits = 0;
  let totalDeenHours = 0;
  let totalTechHours = 0;
  let totalCollegeHours = 0;
  let totalHealthHours = 0;
  let sumCompletion = 0;
  let activeDaysCount = 0;
  let totalScheduledBlocks = 0;
  let totalCompletedBlocks = 0;

  const dailyStats: DayAggregatedStat[] = dates.map((date) => {
    const record = dailyRecords[date];
    const dayType: DayType =
      dayTypeByDate[date] || record?.dayType || "college";
    const activeTimetable =
      dayType === "college" ? collegeTimetable : noCollegeTimetable;

    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIME_ZONE,
      weekday: "short",
    }).format(new Date(`${date}T12:00:00+05:30`));

    const categoryHours = { deen: 0, tech: 0, college: 0, health: 0 };
    let completedBlocksCount = 0;

    if (record && record.completedBlocks) {
      for (const [blockId, done] of Object.entries(record.completedBlocks)) {
        if (!done) continue;
        completedBlocksCount++;
        const block = blocksById.get(blockId);
        if (block) {
          categoryHours[block.category] +=
            calculateTimeDiffMinutes(block.startTime, block.endTime) / 60;
        }
      }
    }

    const dsa = record?.dsaCount || 0;
    const sql = record?.sqlCount || 0;
    const deepWork = record?.deepWorkMinutes || 0;
    const salahCount = record?.salah
      ? Object.values(record.salah).filter(Boolean).length
      : 0;
    const habitsCount = record?.habits
      ? Object.values(record.habits).filter(Boolean).length
      : 0;
    const completion = getCompletionPercentage(record, activeTimetable);

    const hasActivity = isDayActive(record, "all");
    if (hasActivity) {
      activeDaysCount++;
    }

    totalDsa += dsa;
    totalSql += sql;
    totalDeepWorkMinutes += deepWork;
    totalSalah += salahCount;
    totalHabits += habitsCount;
    totalDeenHours += categoryHours.deen;
    totalTechHours += categoryHours.tech;
    totalCollegeHours += categoryHours.college;
    totalHealthHours += categoryHours.health;
    sumCompletion += completion;
    totalScheduledBlocks += activeTimetable.length;
    totalCompletedBlocks += completedBlocksCount;

    return {
      date,
      dayName,
      dayType,
      completionRate: completion,
      dsaCount: dsa,
      sqlCount: sql,
      deepWorkMinutes: deepWork,
      deepWorkHours: +(deepWork / 60).toFixed(1),
      deenHours: +categoryHours.deen.toFixed(1),
      techHours: +categoryHours.tech.toFixed(1),
      collegeHours: +categoryHours.college.toFixed(1),
      healthHours: +categoryHours.health.toFixed(1),
      salahCount,
      habitsCompleted: habitsCount,
      completedBlocksCount,
      totalBlocksCount: activeTimetable.length,
      hasRecord: Boolean(record),
    };
  });

  const daysCount = dates.length || 1;
  const averageDailyCompletion = Math.round(sumCompletion / daysCount);
  const salahAdherenceRate = Math.round((totalSalah / (daysCount * 5)) * 100);
  const habitAdherenceRate = Math.round((totalHabits / (daysCount * 5)) * 100);
  const timetableCompletionRate = totalScheduledBlocks
    ? Math.round((totalCompletedBlocks / totalScheduledBlocks) * 100)
    : 0;

  return {
    startDate,
    endDate,
    daysCount,
    activeDaysCount,
    totalDsa,
    totalSql,
    totalDeepWorkMinutes,
    totalDeepWorkHours: +(totalDeepWorkMinutes / 60).toFixed(1),
    averageDailyCompletion,
    salahAdherenceRate,
    habitAdherenceRate,
    timetableCompletionRate,
    totalDeenHours: +totalDeenHours.toFixed(1),
    totalTechHours: +totalTechHours.toFixed(1),
    totalCollegeHours: +totalCollegeHours.toFixed(1),
    totalHealthHours: +totalHealthHours.toFixed(1),
    dailyStats,
  };
}

export interface PlannedVsActualDaily {
  date: string;
  dayName: string;
  plannedStudyHours: number;
  actualStudyHours: number;
  plannedDeenHours: number;
  actualDeenHours: number;
  plannedCollegeHours: number;
  actualCollegeHours: number;
  plannedHealthHours: number;
  actualHealthHours: number;
  plannedDsa: number;
  actualDsa: number;
  plannedSql: number;
  actualSql: number;
}

export interface PlannedVsActualSummary {
  plannedStudyHours: number;
  actualStudyHours: number;
  studyAdherencePercent: number;
  plannedDeenHours: number;
  actualDeenHours: number;
  plannedDsa: number;
  actualDsa: number;
  plannedSql: number;
  actualSql: number;
  categoryAllocation: Array<{
    category: string;
    plannedHours: number;
    actualHours: number;
    color: string;
  }>;
  daily: PlannedVsActualDaily[];
}

/**
 * Calculates planned vs actual hours without double-counting overlapping blocks
 * or assuming uncompleted scheduled time was done.
 */
export function getPlannedVsActual(params: {
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dayTypeByDate?: Record<string, DayType>;
  startDate: string;
  endDate: string;
}): PlannedVsActualSummary {
  const {
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate = {},
    startDate,
    endDate,
  } = params;

  const dates = getDateRangeArray(startDate, endDate);
  const daily: PlannedVsActualDaily[] = [];

  let sumPlannedStudyHours = 0;
  let sumActualStudyHours = 0;
  let sumPlannedDeenHours = 0;
  let sumActualDeenHours = 0;
  let sumPlannedCollegeHours = 0;
  let sumActualCollegeHours = 0;
  let sumPlannedHealthHours = 0;
  let sumActualHealthHours = 0;
  let sumPlannedDsa = 0;
  let sumActualDsa = 0;
  let sumPlannedSql = 0;
  let sumActualSql = 0;

  for (const date of dates) {
    const record = dailyRecords[date];
    const dayType: DayType =
      dayTypeByDate[date] || record?.dayType || "college";
    const activeTimetable =
      dayType === "college" ? collegeTimetable : noCollegeTimetable;

    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIME_ZONE,
      weekday: "short",
    }).format(new Date(`${date}T12:00:00+05:30`));

    // Calculate Planned Hours per category
    let pStudy = 0;
    let pDeen = 0;
    let pCollege = 0;
    let pHealth = 0;

    for (const b of activeTimetable) {
      const dur = calculateTimeDiffMinutes(b.startTime, b.endTime) / 60;
      if (b.category === "tech") pStudy += dur;
      else if (b.category === "deen") pDeen += dur;
      else if (b.category === "college") pCollege += dur;
      else if (b.category === "health") pHealth += dur;
    }

    // Calculate Actual Hours strictly from completed blocks and deep work
    let aStudy = 0;
    let aDeen = 0;
    let aCollege = 0;
    let aHealth = 0;

    if (record?.completedBlocks) {
      for (const b of activeTimetable) {
        if (record.completedBlocks[b.id]) {
          const dur = calculateTimeDiffMinutes(b.startTime, b.endTime) / 60;
          if (b.category === "tech") aStudy += dur;
          else if (b.category === "deen") aDeen += dur;
          else if (b.category === "college") aCollege += dur;
          else if (b.category === "health") aHealth += dur;
        }
      }
    }

    // If actual deep work minutes were recorded outside or exceeding completed tech blocks,
    // ensure actual study reflects deep focus time
    const deepWorkHours = (record?.deepWorkMinutes || 0) / 60;
    if (deepWorkHours > aStudy) {
      aStudy = deepWorkHours;
    }

    // Configured targets per day: 3 DSA, 2 SQL
    const pDsa = 3;
    const aDsa = record?.dsaCount || 0;
    const pSql = 2;
    const aSql = record?.sqlCount || 0;

    sumPlannedStudyHours += pStudy;
    sumActualStudyHours += aStudy;
    sumPlannedDeenHours += pDeen;
    sumActualDeenHours += aDeen;
    sumPlannedCollegeHours += pCollege;
    sumActualCollegeHours += aCollege;
    sumPlannedHealthHours += pHealth;
    sumActualHealthHours += aHealth;
    sumPlannedDsa += pDsa;
    sumActualDsa += aDsa;
    sumPlannedSql += pSql;
    sumActualSql += aSql;

    daily.push({
      date,
      dayName,
      plannedStudyHours: +pStudy.toFixed(1),
      actualStudyHours: +aStudy.toFixed(1),
      plannedDeenHours: +pDeen.toFixed(1),
      actualDeenHours: +aDeen.toFixed(1),
      plannedCollegeHours: +pCollege.toFixed(1),
      actualCollegeHours: +aCollege.toFixed(1),
      plannedHealthHours: +pHealth.toFixed(1),
      actualHealthHours: +aHealth.toFixed(1),
      plannedDsa: pDsa,
      actualDsa: aDsa,
      plannedSql: pSql,
      actualSql: aSql,
    });
  }

  const studyAdherencePercent = sumPlannedStudyHours > 0
    ? Math.round((sumActualStudyHours / sumPlannedStudyHours) * 100)
    : 0;

  return {
    plannedStudyHours: +sumPlannedStudyHours.toFixed(1),
    actualStudyHours: +sumActualStudyHours.toFixed(1),
    studyAdherencePercent,
    plannedDeenHours: +sumPlannedDeenHours.toFixed(1),
    actualDeenHours: +sumActualDeenHours.toFixed(1),
    plannedDsa: sumPlannedDsa,
    actualDsa: sumActualDsa,
    plannedSql: sumPlannedSql,
    actualSql: sumActualSql,
    categoryAllocation: [
      {
        category: "Tech / DSA",
        plannedHours: +sumPlannedStudyHours.toFixed(1),
        actualHours: +sumActualStudyHours.toFixed(1),
        color: "#3b82f6",
      },
      {
        category: "Deen / Spiritual",
        plannedHours: +sumPlannedDeenHours.toFixed(1),
        actualHours: +sumActualDeenHours.toFixed(1),
        color: "#10b981",
      },
      {
        category: "College / Study",
        plannedHours: +sumPlannedCollegeHours.toFixed(1),
        actualHours: +sumActualCollegeHours.toFixed(1),
        color: "#f59e0b",
      },
      {
        category: "Health / Recovery",
        plannedHours: +sumPlannedHealthHours.toFixed(1),
        actualHours: +sumActualHealthHours.toFixed(1),
        color: "#f43f5e",
      },
    ],
    daily,
  };
}

export interface MissedBlockDiagnostic {
  blockId: string;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  scheduledCount: number;
  missedCount: number;
  missRatePercent: number;
  insight: string;
}

export interface MissedTaskAnalysis {
  missedBlocks: MissedBlockDiagnostic[];
  habitMisses: Array<{
    habitKey: keyof HabitFlags;
    name: string;
    missedDays: number;
    completedDays: number;
    adherencePercent: number;
  }>;
  lowFocusDays: Array<{
    date: string;
    dayName: string;
    deepWorkMinutes: number;
  }>;
  totalMissedBlocksCount: number;
  coachingSummary: string;
}

/**
 * Diagnostic analysis identifying frequently missed blocks and habits with nonjudgmental explanations.
 * Accurately distinguishes between:
 * - "incomplete/missed" (past block that was scheduled but not completed)
 * - "not-yet-due" (scheduled block for today where endTime > currentTime, or future date)
 */
export function getMissedTasksAnalysis(params: {
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dayTypeByDate?: Record<string, DayType>;
  startDate: string;
  endDate: string;
  todayDate?: string;
  currentTimeKolkata?: string;
}): MissedTaskAnalysis {
  const {
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate = {},
    startDate,
    endDate,
    todayDate = getTodayDateString(),
    currentTimeKolkata = getCurrentTime24Kolkata(),
  } = params;

  const dates = getDateRangeArray(startDate, endDate);
  const blockStats = new Map<
    string,
    {
      block: TimeBlock;
      scheduledCount: number;
      missedCount: number;
    }
  >();

  const habitCounters = {
    quran: { completed: 0, missed: 0, label: "Qur'an Recitation" },
    salah5: { completed: 0, missed: 0, label: "5 Daily Prayers" },
    exercise: { completed: 0, missed: 0, label: "Workout & Exercise" },
    deepWork: { completed: 0, missed: 0, label: "Deep Work (90+ min)" },
    healthyFoodSleep: { completed: 0, missed: 0, label: "Clean Food & Sleep" },
  };

  const lowFocusDays: Array<{ date: string; dayName: string; deepWorkMinutes: number }> = [];

  for (const date of dates) {
    if (date > todayDate) continue; // Future dates are not missed

    const record = dailyRecords[date];
    const dayType: DayType =
      dayTypeByDate[date] || record?.dayType || "college";
    const activeTimetable =
      dayType === "college" ? collegeTimetable : noCollegeTimetable;

    const isToday = date === todayDate;

    for (const block of activeTimetable) {
      let entry = blockStats.get(block.title);
      if (!entry) {
        entry = { block, scheduledCount: 0, missedCount: 0 };
        blockStats.set(block.title, entry);
      }
      entry.scheduledCount++;

      const isCompleted = Boolean(record?.completedBlocks && record.completedBlocks[block.id]);
      if (!isCompleted) {
        if (!isToday) {
          // Past day: block was definitely missed
          entry.missedCount++;
        } else {
          // Today: only missed if block end time has passed
          if (block.endTime <= currentTimeKolkata) {
            entry.missedCount++;
          }
        }
      }
    }

    // Habit diagnostics
    (Object.keys(habitCounters) as Array<keyof HabitFlags>).forEach((key) => {
      const isDone = Boolean(record?.habits && record.habits[key]);
      if (isDone) {
        habitCounters[key].completed++;
      } else {
        if (!isToday) {
          habitCounters[key].missed++;
        }
      }
    });

    // Low focus tracking
    const dw = record?.deepWorkMinutes || 0;
    if (dw < 30 && !isToday) {
      const dayName = new Intl.DateTimeFormat("en-US", {
        timeZone: APP_TIME_ZONE,
        weekday: "short",
      }).format(new Date(`${date}T12:00:00+05:30`));
      lowFocusDays.push({ date, dayName, deepWorkMinutes: dw });
    }
  }

  // Constructive, nonjudgmental suggestions per block
  const getInsight = (title: string, category: string, missRate: number): string => {
    if (missRate === 0) return "Consistent execution! Routine is well-anchored.";
    if (title.toLowerCase().includes("dsa")) {
      return "Late-afternoon cognitive fatigue may be a hurdle. Try tackling 1 problem earlier or setting up the problem environment during lunch.";
    }
    if (title.toLowerCase().includes("tahajjud") || title.toLowerCase().includes("fajr")) {
      return "Sleep timing directly influences early rising. Shifting bedtime 20 minutes earlier can stabilize dawn wakefulness.";
    }
    if (title.toLowerCase().includes("revision") || title.toLowerCase().includes("review")) {
      return "End-of-day fatigue often leads to skipped reviews. Try a 5-minute lightning review right after dinner instead.";
    }
    if (category === "college") {
      return "Commute and university schedules naturally fluctuate; preserve your energy for high-leverage evening blocks.";
    }
    return "Consider breaking this block into smaller 25-minute Pomodoros to reduce activation energy.";
  };

  const missedBlocks: MissedBlockDiagnostic[] = Array.from(blockStats.values())
    .filter((s) => s.missedCount > 0)
    .map(({ block, scheduledCount, missedCount }) => {
      const missRatePercent = Math.round((missedCount / scheduledCount) * 100);
      return {
        blockId: block.id,
        title: block.title,
        category: block.category,
        startTime: block.startTime,
        endTime: block.endTime,
        scheduledCount,
        missedCount,
        missRatePercent,
        insight: getInsight(block.title, block.category, missRatePercent),
      };
    })
    .sort((a, b) => b.missRatePercent - a.missRatePercent);

  const habitMisses = (Object.keys(habitCounters) as Array<keyof HabitFlags>).map((k) => {
    const item = habitCounters[k];
    const total = item.completed + item.missed || 1;
    return {
      habitKey: k,
      name: item.label,
      missedDays: item.missed,
      completedDays: item.completed,
      adherencePercent: Math.round((item.completed / total) * 100),
    };
  }).sort((a, b) => a.adherencePercent - b.adherencePercent);

  const totalMissedBlocksCount = missedBlocks.reduce((acc, b) => acc + b.missedCount, 0);

  let coachingSummary = "Good overall adherence across the evaluated timeline.";
  if (missedBlocks.length > 0 && missedBlocks[0].missRatePercent > 40) {
    coachingSummary = `Primary focus opportunity: '${missedBlocks[0].title}' shows a ${missedBlocks[0].missRatePercent}% miss rate. Structuring an earlier trigger will compound your output.`;
  }

  return {
    missedBlocks,
    habitMisses,
    lowFocusDays,
    totalMissedBlocksCount,
    coachingSummary,
  };
}

export interface DailyReportData {
  date: string;
  dayName: string;
  dayType: DayType;
  completionPercentage: number;
  completedTasks: Array<{ block: TimeBlock; completed: boolean }>;
  missedTasks: Array<{ block: TimeBlock; reason: string }>;
  notYetDueTasks: Array<{ block: TimeBlock }>;
  salahStatus: SalahStatus;
  habitsStatus: HabitFlags;
  deepWorkMinutes: number;
  deepWorkHours: number;
  dsaCount: number;
  sqlCount: number;
  review?: DailyReview;
}

/** Generates a complete daily report for any specified date */
export function getDailyReport(params: {
  date: string;
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dailyReviews?: DailyReview[];
  dayTypeByDate?: Record<string, DayType>;
  todayDate?: string;
  currentTimeKolkata?: string;
}): DailyReportData {
  const {
    date,
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dailyReviews = [],
    dayTypeByDate = {},
    todayDate = getTodayDateString(),
    currentTimeKolkata = getCurrentTime24Kolkata(),
  } = params;

  const record = dailyRecords[date];
  const dayType: DayType =
    dayTypeByDate[date] || record?.dayType || "college";
  const activeTimetable =
    dayType === "college" ? collegeTimetable : noCollegeTimetable;

  const isToday = date === todayDate;
  const isFuture = date > todayDate;

  const completedTasks: Array<{ block: TimeBlock; completed: boolean }> = [];
  const missedTasks: Array<{ block: TimeBlock; reason: string }> = [];
  const notYetDueTasks: Array<{ block: TimeBlock }> = [];

  for (const block of activeTimetable) {
    const isDone = Boolean(record?.completedBlocks && record.completedBlocks[block.id]);
    if (isDone) {
      completedTasks.push({ block, completed: true });
    } else {
      if (isFuture) {
        notYetDueTasks.push({ block });
      } else if (isToday) {
        if (block.endTime <= currentTimeKolkata) {
          missedTasks.push({ block, reason: "Incomplete (time elapsed)" });
        } else {
          notYetDueTasks.push({ block });
        }
      } else {
        missedTasks.push({ block, reason: "Incomplete" });
      }
    }
  }

  const review = dailyReviews.find((r) => r.date === date);
  const completionPercentage = getCompletionPercentage(record, activeTimetable);
  const dw = record?.deepWorkMinutes || 0;

  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
  }).format(new Date(`${date}T12:00:00+05:30`));

  return {
    date,
    dayName,
    dayType,
    completionPercentage,
    completedTasks,
    missedTasks,
    notYetDueTasks,
    salahStatus: record?.salah || {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    },
    habitsStatus: record?.habits || {
      quran: false,
      salah5: false,
      exercise: false,
      deepWork: false,
      healthyFoodSleep: false,
    },
    deepWorkMinutes: dw,
    deepWorkHours: +(dw / 60).toFixed(1),
    dsaCount: record?.dsaCount || 0,
    sqlCount: record?.sqlCount || 0,
    review,
  };
}

export interface WeeklyReportData {
  weekEndDate: string;
  weekStartDate: string;
  dailyStats: DayAggregatedStat[];
  strongestDay: DayAggregatedStat | null;
  weakestDay: DayAggregatedStat | null;
  averageCompletion: number;
  totalStudyHours: number;
  totalDeenHours: number;
  totalDsa: number;
  totalSql: number;
  completedWeeklyGoals: WeeklyGoal[];
  missedWeeklyGoals: WeeklyGoal[];
  wowChanges: {
    completionDelta: number; // e.g. +8%
    studyHoursDelta: number; // e.g. +3.5
    dsaDelta: number;
    sqlDelta: number;
    salahDelta: number;
  };
}

/** Generates a 7-day weekly report with week-over-week (WoW) comparison */
export function getWeeklyReport(params: {
  weekEndDate: string;
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  weeklyGoals?: WeeklyGoal[];
  dayTypeByDate?: Record<string, DayType>;
}): WeeklyReportData {
  const {
    weekEndDate,
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    weeklyGoals = [],
    dayTypeByDate = {},
  } = params;

  // This week: 7 days ending at weekEndDate
  const weekDates = lastNDates(7, new Date(`${weekEndDate}T12:00:00+05:30`));
  const weekStartDate = weekDates[0];

  const thisWeekAgg = aggregateDateRange({
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate,
    startDate: weekStartDate,
    endDate: weekEndDate,
  });

  // Previous week: 7 days preceding weekStartDate
  const prevWeekEndDate = getYesterdayDateString(weekStartDate);
  const prevWeekDates = lastNDates(7, new Date(`${prevWeekEndDate}T12:00:00+05:30`));
  const prevWeekStartDate = prevWeekDates[0];

  const prevWeekAgg = aggregateDateRange({
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate,
    startDate: prevWeekStartDate,
    endDate: prevWeekEndDate,
  });

  // Strongest and Weakest days in the current week
  const sortedDays = [...thisWeekAgg.dailyStats].sort(
    (a, b) => b.completionRate - a.completionRate
  );
  const strongestDay = sortedDays.length > 0 ? sortedDays[0] : null;
  const weakestDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : null;

  const completedWeeklyGoals = weeklyGoals.filter((g) => g.completed);
  const missedWeeklyGoals = weeklyGoals.filter((g) => !g.completed);

  return {
    weekEndDate,
    weekStartDate,
    dailyStats: thisWeekAgg.dailyStats,
    strongestDay,
    weakestDay,
    averageCompletion: thisWeekAgg.averageDailyCompletion,
    totalStudyHours: thisWeekAgg.totalTechHours,
    totalDeenHours: thisWeekAgg.totalDeenHours,
    totalDsa: thisWeekAgg.totalDsa,
    totalSql: thisWeekAgg.totalSql,
    completedWeeklyGoals,
    missedWeeklyGoals,
    wowChanges: {
      completionDelta:
        thisWeekAgg.averageDailyCompletion - prevWeekAgg.averageDailyCompletion,
      studyHoursDelta: +(
        thisWeekAgg.totalTechHours - prevWeekAgg.totalTechHours
      ).toFixed(1),
      dsaDelta: thisWeekAgg.totalDsa - prevWeekAgg.totalDsa,
      sqlDelta: thisWeekAgg.totalSql - prevWeekAgg.totalSql,
      salahDelta: thisWeekAgg.salahAdherenceRate - prevWeekAgg.salahAdherenceRate,
    },
  };
}

export interface MonthlyReportData {
  yearMonth: string; // "YYYY-MM"
  daysInMonth: number;
  consistencyRate: number;
  trendDirection: "improving" | "stable" | "declining";
  totalDsa: number;
  totalSql: number;
  totalDeepWorkHours: number;
  salahAdherenceRate: number;
  habitAdherenceRate: number;
  momChanges: {
    consistencyDelta: number;
    deepWorkDelta: number;
    dsaDelta: number;
    sqlDelta: number;
  };
  dailyStats: DayAggregatedStat[];
}

/** Generates a complete monthly report with month-over-month (MoM) comparison */
export function getMonthlyReport(params: {
  yearMonth: string; // YYYY-MM
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dayTypeByDate?: Record<string, DayType>;
}): MonthlyReportData {
  const {
    yearMonth,
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate = {},
  } = params;

  const [y, m] = yearMonth.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-${lastDay.toString().padStart(2, "0")}`;

  const currentMonthAgg = aggregateDateRange({
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate,
    startDate,
    endDate,
  });

  // Calculate Previous Month
  const prevMonthDate = new Date(y, m - 2, 1);
  const prevYearMonth = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
  }).format(prevMonthDate);
  const prevLastDay = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
  const prevStartDate = `${prevYearMonth}-01`;
  const prevEndDate = `${prevYearMonth}-${prevLastDay.toString().padStart(2, "0")}`;

  const prevMonthAgg = aggregateDateRange({
    dailyRecords,
    collegeTimetable,
    noCollegeTimetable,
    dayTypeByDate,
    startDate: prevStartDate,
    endDate: prevEndDate,
  });

  const consistencyDelta =
    currentMonthAgg.averageDailyCompletion - prevMonthAgg.averageDailyCompletion;

  let trendDirection: "improving" | "stable" | "declining" = "stable";
  if (consistencyDelta > 3) trendDirection = "improving";
  else if (consistencyDelta < -3) trendDirection = "declining";

  return {
    yearMonth,
    daysInMonth: lastDay,
    consistencyRate: currentMonthAgg.averageDailyCompletion,
    trendDirection,
    totalDsa: currentMonthAgg.totalDsa,
    totalSql: currentMonthAgg.totalSql,
    totalDeepWorkHours: currentMonthAgg.totalDeepWorkHours,
    salahAdherenceRate: currentMonthAgg.salahAdherenceRate,
    habitAdherenceRate: currentMonthAgg.habitAdherenceRate,
    momChanges: {
      consistencyDelta,
      deepWorkDelta: +(
        currentMonthAgg.totalDeepWorkHours - prevMonthAgg.totalDeepWorkHours
      ).toFixed(1),
      dsaDelta: currentMonthAgg.totalDsa - prevMonthAgg.totalDsa,
      sqlDelta: currentMonthAgg.totalSql - prevMonthAgg.totalSql,
    },
    dailyStats: currentMonthAgg.dailyStats,
  };
}

/**
 * Backward-compatible helper building recent 7-day analytics record.
 * Uses real recorded data (not invented).
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

    const dailyRec = input.dailyRecords ? input.dailyRecords[date] : undefined;
    const salah = dailyRec ? dailyRec.salah : input.salahRecords[date];
    const habit = dailyRec
      ? dailyRec.habits
      : input.habitLogs.find((h) => h.date === date);

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
      dsaCount: dailyRec?.dsaCount || 0,
      sqlCount: dailyRec?.sqlCount || 0,
      salahCount: salah ? Object.values(salah).filter(Boolean).length : 0,
      habitsCompleted: habit
        ? [habit.quran, habit.salah5, habit.exercise, habit.deepWork, habit.healthyFoodSleep].filter(Boolean).length
        : 0,
    };
  });
}
