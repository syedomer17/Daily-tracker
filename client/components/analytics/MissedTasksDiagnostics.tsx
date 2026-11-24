"use client";

import React from "react";
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Target,
} from "lucide-react";
import { MissedTaskAnalysis } from "@/lib/analytics";

interface MissedTasksDiagnosticsProps {
  diagnostics: MissedTaskAnalysis;
}

export function MissedTasksDiagnostics({ diagnostics }: MissedTasksDiagnosticsProps) {
  const { missedBlocks, habitMisses, lowFocusDays, totalMissedBlocksCount, coachingSummary } =
    diagnostics;

  return (
    <div className="space-y-6">
      {/* Coaching Summary Banner */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
            Evidence-Based Routine Coaching
          </h3>
        </div>
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          {coachingSummary}
        </p>
      </div>

      {/* Frequently Missed Timetable Blocks */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Frequently Missed Timetable Blocks
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Timetable blocks that were scheduled during past days or elapsed hours and not completed
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
            {totalMissedBlocksCount} total misses
          </span>
        </div>

        {missedBlocks.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-850">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Flawless Timetable Discipline</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">No scheduled slots were missed across the selected timeline.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missedBlocks.map((b) => (
              <div
                key={b.blockId}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">{b.title}</span>
                    <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 uppercase">
                      {b.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Missed: {b.missedCount} / {b.scheduledCount}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {b.missRatePercent}% miss rate
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${b.missRatePercent}%` }}
                  />
                </div>

                <div className="flex items-start gap-1.5 pt-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{b.insight}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habit Adherence Ranking & Low Focus Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Ranking */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              Core Habit Adherence Ranking
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sorted from lowest adherence to highest adherence
            </p>
          </div>

          <div className="space-y-3">
            {habitMisses.map((h) => (
              <div
                key={h.habitKey}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 dark:text-white">{h.name}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {h.adherencePercent}% done
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${h.adherencePercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Completed: {h.completedDays} days</span>
                  <span>Missed: {h.missedDays} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Focus Days */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Low-Focus Periods (&lt;30 mins deep work)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Past days with under 30 minutes of logged focus time
            </p>
          </div>

          {lowFocusDays.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-850">
              <ShieldCheck className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Consistent Daily Focus</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Every past day in range maintained healthy focus sessions.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lowFocusDays.map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-xs"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {d.dayName}, {d.date}
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    {d.deepWorkMinutes} mins focus
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
