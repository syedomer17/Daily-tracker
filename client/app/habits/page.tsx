"use client";

import { useState, useMemo } from "react";
import {
  Flame,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Dumbbell,
  Brain,
  Moon,
  Sparkles,
  Trophy,
  Calendar,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { HabitLog, HabitFlags } from "@/types";
import { getTodayDateString, calculateCurrentStreak, cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const CORE_HABITS: {
  key: keyof HabitFlags;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  badgeColor: string;
}[] = [
  {
    key: "quran",
    title: "Qur'an Recitation",
    subtitle: "15–20 min with meaning & reflection",
    icon: BookOpen,
    category: "Deen",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    key: "salah5",
    title: "5 Salah On Time",
    subtitle: "Fajr, Dhuhr, Asr, Maghrib & Isha with Khushu",
    icon: ShieldCheck,
    category: "Deen",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  {
    key: "exercise",
    title: "Physical Exercise",
    subtitle: "3–4x/week workout, calisthenics or cardio",
    icon: Dumbbell,
    category: "Health",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    key: "deepWork",
    title: "Deep Work Session",
    subtitle: "2–3 hrs distraction-free coding & DSA",
    icon: Brain,
    category: "Tech",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    key: "healthyFoodSleep",
    title: "Healthy Food & Sleep",
    subtitle: "Clean nutrition & 7+ hrs restorative sleep",
    icon: Moon,
    category: "Health",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

export default function HabitsPage() {
  const habitLogs = useTrackerStore((s) => s.habitLogs);
  const toggleHabit = useTrackerStore((s) => s.toggleHabit);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const salahRecords = useTrackerStore((s) => s.salahRecords);

  const todayStr = getTodayDateString();
  const getDailyRecord = useTrackerStore((s) => s.getDailyRecord);
  const todayRecord = getDailyRecord(todayStr);
  const [selectedDayLog, setSelectedDayLog] = useState<HabitLog | null>(null);

  // Real, accurate streak calculated from activity history
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(habitLogs, salahRecords, completedBlocks);
  }, [habitLogs, salahRecords, completedBlocks]);

  // Today's log directly from today's record
  const todayLog = useMemo(() => {
    const habits = todayRecord.habits;
    const count = [
      habits.quran,
      habits.salah5,
      habits.exercise,
      habits.deepWork,
      habits.healthyFoodSleep,
    ].filter(Boolean).length;

    return {
      date: todayStr,
      quran: habits.quran,
      salah5: habits.salah5,
      exercise: habits.exercise,
      deepWork: habits.deepWork,
      healthyFoodSleep: habits.healthyFoodSleep,
      completionRate: Math.round((count / 5) * 100),
    };
  }, [todayRecord.habits, todayStr]);

  const handleToggleToday = (key: keyof HabitFlags) => {
    toggleHabit(key, todayStr);
    if (!todayLog[key]) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f43f5e"],
      });
    }
  };

  // Full 90-day heatmap grid ending today (Asia/Kolkata)
  const last90Days = useMemo(() => {
    const days: HabitLog[] = [];
    const recordsMap = new Map<string, HabitLog>();
    habitLogs.forEach((h) => recordsMap.set(h.date, h));

    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const existing = recordsMap.get(dateStr);
      if (existing) {
        days.push(existing);
      } else {
        days.push({
          date: dateStr,
          quran: false,
          salah5: false,
          exercise: false,
          deepWork: false,
          healthyFoodSleep: false,
          completionRate: 0,
        });
      }
    }
    return days;
  }, [habitLogs]);

  // Overall stats
  const recordedDays = useMemo(() => habitLogs.filter((h) => h.completionRate > 0), [habitLogs]);
  const totalDays = recordedDays.length;
  const avgCompletionRate = totalDays
    ? Math.round(recordedDays.reduce((acc, curr) => acc + curr.completionRate, 0) / totalDays)
    : 0;

  const getColorForRate = (rate: number) => {
    if (rate >= 90) return "bg-emerald-500 hover:ring-2 hover:ring-emerald-400";
    if (rate >= 75) return "bg-emerald-600 hover:ring-2 hover:ring-emerald-500";
    if (rate >= 50) return "bg-emerald-700 hover:ring-2 hover:ring-emerald-600";
    if (rate > 0) return "bg-emerald-900 hover:ring-2 hover:ring-emerald-700";
    return "bg-zinc-200 dark:bg-zinc-800/80";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Daily Core Habits</h1>
            <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
              5 Pillars
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Build discipline in both Deen (Spiritual) and Dunya (Tech Career & Physical Health)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-1.5 text-xs flex items-center gap-2 shadow-sm">
            <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span className="text-zinc-600 dark:text-zinc-300">Streak:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {currentStreak} {currentStreak === 1 ? "Day" : "Days"} Active
            </span>
          </div>
        </div>
      </div>

      {/* Today's 5 Core Habits Interactive Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Today&apos;s Habit Checklist
          </h2>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            {todayLog.completionRate}% Done Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_HABITS.map((habit) => {
            const isDone = !!todayLog[habit.key];
            const Icon = habit.icon;

            return (
              <div
                key={habit.key}
                onClick={() => handleToggleToday(habit.key)}
                className={cn(
                  "flex items-start justify-between rounded-2xl border p-4 cursor-pointer transition shadow-sm",
                  isDone
                    ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 shadow-emerald-950/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-950/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-bold border", habit.badgeColor)}>
                        {habit.category}
                      </span>
                    </div>
                    <h3 className={cn("text-xs font-bold text-zinc-900 dark:text-white", isDone && "text-emerald-700 dark:text-emerald-300")}>
                      {habit.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{habit.subtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Mark ${habit.title} as ${isDone ? 'incomplete' : 'complete'}`}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-transparent"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 90-Day Habit Streak Heatmap Grid */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              90-Day Habit Streak Heatmap
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Consistent daily momentum across your 5 core life systems
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
            <span className="h-3 w-3 rounded-sm bg-emerald-900" />
            <span className="h-3 w-3 rounded-sm bg-emerald-700" />
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="h-3 w-3 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid (Scrollable on small screens) */}
        <div className="overflow-x-auto pb-2">
          {last90Days.length > 0 ? (
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
              {last90Days.map((h) => (
                <button
                  key={h.date}
                  onClick={() => setSelectedDayLog(h)}
                  className={cn(
                    "h-4 w-4 rounded-sm transition cursor-pointer relative group",
                    getColorForRate(h.completionRate)
                  )}
                  title={`${h.date}: ${h.completionRate}%`}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
              <p>Check off today&apos;s habits above to begin recording your personal 90-day consistency heatmap.</p>
            </div>
          )}
        </div>

        {/* Selected Day Inspection Modal/Pill */}
        {selectedDayLog && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 p-3 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-zinc-900 dark:text-white">{selectedDayLog.date}</span>
              <span className="text-zinc-400">•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedDayLog.completionRate}% Completed
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span className={selectedDayLog.quran ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                Qur&apos;an: {selectedDayLog.quran ? "✓" : "✗"}
              </span>
              <span className={selectedDayLog.salah5 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                5 Salah: {selectedDayLog.salah5 ? "✓" : "✗"}
              </span>
              <span className={selectedDayLog.exercise ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                Workout: {selectedDayLog.exercise ? "✓" : "✗"}
              </span>
              <span className={selectedDayLog.deepWork ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                Deep Work: {selectedDayLog.deepWork ? "✓" : "✗"}
              </span>
            </div>
            <button
              onClick={() => setSelectedDayLog(null)}
              className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Average Consistency Rate</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{avgCompletionRate}%</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Across recorded days</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Qur&apos;an Recitation Days</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-1">
            {habitLogs.filter((h) => h.quran).length} Days
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Daily 15-20 min connection</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Deep Work Sessions</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {habitLogs.filter((h) => h.deepWork).length} Days
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">DSA & Full-Stack Mastery</p>
        </div>
      </div>
    </div>
  );
}
