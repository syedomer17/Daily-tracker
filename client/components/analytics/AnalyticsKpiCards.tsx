"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Flame,
  Moon,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  calculateAccurateStreak,
  getCompletionPercentage,
  aggregateDateRange,
  DateRangeAggregation,
} from "@/lib/analytics";
import { DailyRecord, TimeBlock, WeeklyGoal } from "@/types";
import { getYesterdayDateString, lastNDates } from "@/lib/utils";

interface AnalyticsKpiCardsProps {
  todayDate: string;
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dayTypeByDate: Record<string, "college" | "no-college">;
  weeklyGoals: WeeklyGoal[];
  legacyBaselineDsa: number;
  legacyBaselineSql: number;
  selectedRangeAgg: DateRangeAggregation;
}

export function AnalyticsKpiCards({
  todayDate,
  dailyRecords,
  collegeTimetable,
  noCollegeTimetable,
  dayTypeByDate,
  weeklyGoals,
  legacyBaselineDsa,
  legacyBaselineSql,
  selectedRangeAgg,
}: AnalyticsKpiCardsProps) {
  // 1. Today & Yesterday completion percentages
  const todayRecord = dailyRecords[todayDate];
  const todayDayType = dayTypeByDate[todayDate] || todayRecord?.dayType || "college";
  const todayTimetable = todayDayType === "college" ? collegeTimetable : noCollegeTimetable;
  const todayPercent = useMemo(
    () => getCompletionPercentage(todayRecord, todayTimetable),
    [todayRecord, todayTimetable]
  );

  const yesterdayDate = useMemo(() => getYesterdayDateString(todayDate), [todayDate]);
  const yesterdayRecord = dailyRecords[yesterdayDate];
  const yesterdayDayType = dayTypeByDate[yesterdayDate] || yesterdayRecord?.dayType || "college";
  const yesterdayTimetable = yesterdayDayType === "college" ? collegeTimetable : noCollegeTimetable;
  const yesterdayPercent = useMemo(
    () => getCompletionPercentage(yesterdayRecord, yesterdayTimetable),
    [yesterdayRecord, yesterdayTimetable]
  );

  // 2. Weekly & Monthly averages (past 7 & 30 days)
  const past7Dates = useMemo(() => lastNDates(7), []);
  const past30Dates = useMemo(() => lastNDates(30), []);

  const weeklyAvgPercent = useMemo(() => {
    const agg = aggregateDateRange({
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate: past7Dates[0],
      endDate: past7Dates[past7Dates.length - 1],
    });
    return agg.averageDailyCompletion;
  }, [dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate, past7Dates]);

  const monthlyAvgPercent = useMemo(() => {
    const agg = aggregateDateRange({
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate: past30Dates[0],
      endDate: past30Dates[past30Dates.length - 1],
    });
    return agg.averageDailyCompletion;
  }, [dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate, past30Dates]);

  // 3. Lifetime totals vs Selected Range totals
  const lifetimeDsa = useMemo(() => {
    const sum = Object.values(dailyRecords).reduce((acc, r) => acc + (r.dsaCount || 0), 0);
    return sum + legacyBaselineDsa;
  }, [dailyRecords, legacyBaselineDsa]);

  const lifetimeSql = useMemo(() => {
    const sum = Object.values(dailyRecords).reduce((acc, r) => acc + (r.sqlCount || 0), 0);
    return sum + legacyBaselineSql;
  }, [dailyRecords, legacyBaselineSql]);

  const lifetimeDeepWorkHours = useMemo(() => {
    const sumMins = Object.values(dailyRecords).reduce((acc, r) => acc + (r.deepWorkMinutes || 0), 0);
    return +(sumMins / 60).toFixed(1);
  }, [dailyRecords]);

  // 4. Streaks
  const streakInfo = useMemo(
    () => calculateAccurateStreak(dailyRecords, todayDate, "all"),
    [dailyRecords, todayDate]
  );

  // 5. Weekly Target Completion
  const weeklyGoalsCompleted = useMemo(() => {
    if (weeklyGoals.length === 0) return 0;
    const completed = weeklyGoals.filter((g) => g.completed).length;
    return Math.round((completed / weeklyGoals.length) * 100);
  }, [weeklyGoals]);

  const cards = [
    {
      title: "Today's Completion",
      value: `${todayPercent}%`,
      subtitle: `Yesterday: ${yesterdayPercent}%`,
      icon: CheckCircle2,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      accent: todayPercent >= 80 ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700",
      trend: todayPercent >= yesterdayPercent ? "+ Progressing" : "- Lower than yesterday",
      trendPositive: todayPercent >= yesterdayPercent,
    },
    {
      title: "Weekly Avg (7D)",
      value: `${weeklyAvgPercent}%`,
      subtitle: `Monthly Avg (30D): ${monthlyAvgPercent}%`,
      icon: TrendingUp,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
      accent: "bg-blue-500",
      trend: "Trailing average",
      trendPositive: true,
    },
    {
      title: "Active Streak",
      value: `${streakInfo.currentStreak} days`,
      subtitle: `Best Streak: ${streakInfo.longestStreak} days`,
      icon: Flame,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
      accent: "bg-amber-500",
      trend: `${streakInfo.activeDaysCount} active days total`,
      trendPositive: true,
    },
    {
      title: "Deep Work Hours",
      value: `${selectedRangeAgg.totalDeepWorkHours}h`,
      subtitle: `Lifetime: ${lifetimeDeepWorkHours}h total`,
      icon: Clock,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10",
      accent: "bg-purple-500",
      trend: `${selectedRangeAgg.totalDeepWorkMinutes} mins in range`,
      trendPositive: true,
    },
    {
      title: "DSA Solved",
      value: `${selectedRangeAgg.totalDsa}`,
      subtitle: `Lifetime: ${lifetimeDsa} solved`,
      icon: Code2,
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-500/10",
      accent: "bg-sky-500",
      trend: `Target: 150`,
      trendPositive: lifetimeDsa >= 50,
    },
    {
      title: "SQL Practiced",
      value: `${selectedRangeAgg.totalSql}`,
      subtitle: `Lifetime: ${lifetimeSql} queries`,
      icon: Database,
      color: "text-teal-500 dark:text-teal-400",
      bg: "bg-teal-500/10",
      accent: "bg-teal-500",
      trend: `Target: 100`,
      trendPositive: lifetimeSql >= 30,
    },
    {
      title: "Salah Completion",
      value: `${selectedRangeAgg.salahAdherenceRate}%`,
      subtitle: "5 Daily Prayers on time",
      icon: Moon,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      accent: "bg-emerald-500",
      trend: "Spiritual Pillar",
      trendPositive: selectedRangeAgg.salahAdherenceRate >= 80,
    },
    {
      title: "Habit Consistency",
      value: `${selectedRangeAgg.habitAdherenceRate}%`,
      subtitle: `Weekly Goals: ${weeklyGoalsCompleted}%`,
      icon: Target,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      accent: "bg-indigo-500",
      trend: `${selectedRangeAgg.timetableCompletionRate}% Timetable adherence`,
      trendPositive: selectedRangeAgg.habitAdherenceRate >= 70,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {card.title}
              </span>
              <div className={`rounded-xl p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
                {card.value}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 truncate">
                {card.subtitle}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${card.accent}`}
              />
              <span
                className={
                  card.trendPositive
                    ? "text-zinc-600 dark:text-zinc-300"
                    : "text-zinc-500 dark:text-zinc-400"
                }
              >
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
