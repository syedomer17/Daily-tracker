"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ActiveBlockCard } from "@/components/dashboard/ActiveBlockCard";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { QuickCounters } from "@/components/dashboard/QuickCounters";
import { MiniCharts } from "@/components/dashboard/MiniCharts";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { useTrackerStore } from "@/lib/store";
import { CATEGORY_CONFIG, formatTime12, cn, getTodayDateString } from "@/lib/utils";
import {
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  BookOpenCheck,
} from "lucide-react";

export default function DashboardPage() {
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const toggleBlockCompletion = useTrackerStore((s) => s.toggleBlockCompletion);
  const weeklyGoals = useTrackerStore((s) => s.weeklyGoals);
  const toggleWeeklyGoal = useTrackerStore((s) => s.toggleWeeklyGoal);

  const timetable = useMemo(
    () => (dayType === "college" ? collegeTimetable : noCollegeTimetable),
    [dayType, collegeTimetable, noCollegeTimetable]
  );

  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6">
      {/* 1. Motivational Deen & Dunya Quote */}
      <QuoteCard />

      {/* 2. Active Routine Block & Focus Timer */}
      <ActiveBlockCard />

      {/* 3. Core KPIs (Completion %, 5 Salah, Streak, Deep Work) */}
      <KpiCards />

      {/* 4. Quick Counters (DSA 150+ & SQL 100) */}
      <QuickCounters />

      {/* 5. Mini Charts (Deen vs Dunya Radial & 7-Day Bar Chart) */}
      <MiniCharts />

      {/* 6. Two-Column Quick Views: Today's Remaining Schedule & Weekly Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Timeline Preview (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Today&apos;s Schedule Quick View</h3>
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                {dayType === "college" ? "College Day" : "No College Day"}
              </span>
            </div>
            <Link
              href="/schedule"
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition"
            >
              Full Interactive Timetable <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {timetable.slice(0, 8).map((block) => {
              const isDone = !!completedBlocks[`${todayStr}_${block.id}`];
              const cat = CATEGORY_CONFIG[block.category];

              return (
                <div
                  key={block.id}
                  onClick={() => toggleBlockCompletion(block.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3 cursor-pointer transition",
                    isDone
                      ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                      : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Mark ${block.title} as ${isDone ? 'incomplete' : 'complete'}`}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500"
                      )}
                    >
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <p
                        className={cn(
                          "text-xs font-semibold text-zinc-900 dark:text-white",
                          isDone && "line-through text-zinc-400 dark:text-zinc-500"
                        )}
                      >
                        {block.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {formatTime12(block.startTime)} – {formatTime12(block.endTime)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                      cat.badgeBg
                    )}
                  >
                    {cat.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Focus Checklist (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Weekly Focus</h3>
              </div>
              <Link
                href="/roadmap"
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                Roadmap <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Top priority objectives to advance toward the July 2027 Tech Job.
            </p>

            <div className="mt-3 space-y-2">
              {weeklyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleWeeklyGoal(goal.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer transition text-xs",
                    goal.completed
                      ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Toggle weekly goal: ${goal.title}`}
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                      goal.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    )}
                  >
                    {goal.completed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <div className="flex-1">
                    <span
                      className={cn(
                        "font-medium text-zinc-800 dark:text-zinc-200",
                        goal.completed && "line-through text-zinc-400 dark:text-zinc-500"
                      )}
                    >
                      {goal.title}
                    </span>
                    {goal.targetMetric && (
                      <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {goal.currentMetric} / {goal.targetMetric}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">9:00 PM Review:</span>
            <Link
              href="/review"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <BookOpenCheck className="h-3.5 w-3.5" /> Start Daily Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
