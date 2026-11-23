"use client";

import { useMemo } from "react";
import { CheckCircle2, Flame, Brain } from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { SalahName, SalahStatus } from "@/types";
import { calculateCurrentStreak } from "@/lib/utils";
import confetti from "canvas-confetti";

const SALAH_LIST: { id: SalahName; name: string; time: string }[] = [
  { id: "fajr", name: "Fajr", time: "05:20 AM" },
  { id: "dhuhr", name: "Dhuhr", time: "01:15 PM" },
  { id: "asr", name: "Asr", time: "04:30 PM" },
  { id: "maghrib", name: "Maghrib", time: "06:15 PM" },
  { id: "isha", name: "Isha", time: "08:00 PM" },
];

const EMPTY_SALAH: SalahStatus = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

export function KpiCards() {
  const todayDate = useTrackerStore((s) => s.todayDate);
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const allSalahRecords = useTrackerStore((s) => s.salahRecords);
  const toggleSalah = useTrackerStore((s) => s.toggleSalah);
  const deepWorkMinutes = useTrackerStore((s) => s.deepWorkMinutesToday);
  const addDeepWorkMinutes = useTrackerStore((s) => s.addDeepWorkMinutes);
  const habitLogs = useTrackerStore((s) => s.habitLogs);

  const timetable = useMemo(
    () => (dayType === "college" ? collegeTimetable : noCollegeTimetable),
    [dayType, collegeTimetable, noCollegeTimetable]
  );

  const completionPercent = useMemo(() => {
    if (timetable.length === 0) return 0;
    const completedCount = timetable.filter(
      (b) => !!completedBlocks[`${todayDate}_${b.id}`]
    ).length;
    return Math.round((completedCount / timetable.length) * 100);
  }, [timetable, completedBlocks, todayDate]);

  const salahRecords = useMemo(() => {
    return allSalahRecords[todayDate] || EMPTY_SALAH;
  }, [allSalahRecords, todayDate]);

  const completedSalahCount = Object.values(salahRecords).filter(Boolean).length;
  const allSalahDone = completedSalahCount === 5;

  // Real, accurate streak calculated from activity history
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(habitLogs, allSalahRecords, completedBlocks);
  }, [habitLogs, allSalahRecords, completedBlocks]);

  const handleSalahClick = (id: SalahName) => {
    toggleSalah(id);
    if (!salahRecords[id] && completedSalahCount === 4) {
      // 5th salah just clicked!
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399", "#fbbf24"],
      });
    }
  };

  const deepWorkHours = (deepWorkMinutes / 60).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Completion % */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Daily Routine</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">{completionPercent}%</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Tasks Completed</p>
          </div>
          {/* Mini circular ring badge */}
          <div className="relative flex h-12 w-12 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-200 dark:text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700"
                strokeDasharray={`${completionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. 5 Salah Tracker */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">5 Daily Salah</span>
            {allSalahDone && (
              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                100%
              </span>
            )}
          </div>
          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{completedSalahCount}/5</span>
        </div>

        {/* 5 Salah Checkboxes */}
        <div className="mt-2.5 grid grid-cols-5 gap-1 text-center">
          {SALAH_LIST.map((s) => {
            const isDone = salahRecords[s.id];
            return (
              <button
                key={s.id}
                onClick={() => handleSalahClick(s.id)}
                className={`flex flex-col items-center justify-center rounded-xl p-1.5 transition border ${
                  isDone
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-950/10"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
                title={`${s.name} (~${s.time}) - Click to toggle`}
              >
                <span className="text-[10px] font-bold uppercase">{s.name.slice(0, 3)}</span>
                <span className={`text-[10px] mt-0.5 font-bold ${isDone ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                  {isDone ? "✓" : "○"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Real Current Streak */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Consistency Streak</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <Flame className="h-4 w-4 animate-bounce" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">{currentStreak}</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{currentStreak === 1 ? "Day" : "Days"}</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {currentStreak > 0 ? "Daily consistency active" : "Start your streak today!"}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-center">
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">
              {currentStreak >= 7 ? "🔥 On Fire" : currentStreak > 0 ? "⚡ Building" : "🌱 Begin"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Deep Work Hours */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Deep Work Today</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Brain className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">{deepWorkHours}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">/ 6.0 hrs</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Goal: 4+ hrs deep coding</p>
          </div>
          <button
            onClick={() => addDeepWorkMinutes(30)}
            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition"
            title="Log +30 minutes of deep study"
          >
            +30m
          </button>
        </div>
      </div>
    </div>
  );
}
