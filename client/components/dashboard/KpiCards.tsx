"use client";

import { CheckCircle2, Flame, Brain } from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { SalahName, SalahStatus } from "@/types";
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
  const getActiveTimetable = useTrackerStore((s) => s.getActiveTimetable);
  const getCompletionPercentage = useTrackerStore((s) => s.getCompletionPercentage);
  const getSalahForDate = useTrackerStore((s) => s.getSalahForDate);
  const toggleSalah = useTrackerStore((s) => s.toggleSalah);
  const addDeepWorkMinutes = useTrackerStore((s) => s.addDeepWorkMinutes);
  const getCurrentStreak = useTrackerStore((s) => s.getCurrentStreak);
  const getDailyRecord = useTrackerStore((s) => s.getDailyRecord);

  const dailyRecord = getDailyRecord(todayDate);
  const completionPercent = getCompletionPercentage(todayDate);
  const salahRecords = getSalahForDate(todayDate) || EMPTY_SALAH;

  const completedSalahCount = Object.values(salahRecords).filter(Boolean).length;
  const allSalahDone = completedSalahCount === 5;
  const currentStreak = getCurrentStreak();

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

  const deepWorkMinutes = dailyRecord.deepWorkMinutes || 0;
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
                className="text-emerald-500 transition-all duration-500"
                strokeDasharray={`${completionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {getActiveTimetable().filter((b) => !!dailyRecord.completedBlocks[b.id]).length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 5 Daily Salah Tracker */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">5 Daily Prayers</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              allSalahDone
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {completedSalahCount} / 5
          </span>
        </div>

        {/* 5 Salah Checkboxes */}
        <div className="mt-3 flex items-center justify-between gap-1">
          {SALAH_LIST.map((s) => {
            const isDone = !!salahRecords[s.id];
            return (
              <button
                key={s.id}
                onClick={() => handleSalahClick(s.id)}
                className={`group flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 transition border ${
                  isDone
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-950/20"
                    : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title={`${s.name} (~${s.time})`}
              >
                <span className="text-[10px] font-bold tracking-tight">{s.name[0]}</span>
                <span className="text-[9px] font-mono mt-0.5 opacity-80">{s.name.slice(1, 3)}</span>
                <div
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    isDone ? "bg-emerald-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Consistency Streak */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Streak</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">{currentStreak}</span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Days</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {currentStreak > 0 ? "Daily consistency active 🔥" : "Start your streak today!"}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-center">
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">Target</span>
            <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">90d</p>
          </div>
        </div>
      </div>

      {/* 4. Deep Work Hours Today */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Deep Work Today</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Brain className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">{deepWorkHours}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">hrs</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Goal: 2.5 - 3.0 hrs / day</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => addDeepWorkMinutes(15)}
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
              title="Add 15 minutes of deep work"
            >
              +15m
            </button>
            <button
              onClick={() => addDeepWorkMinutes(30)}
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
              title="Add 30 minutes of deep work"
            >
              +30m
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
