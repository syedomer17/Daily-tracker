"use client";

import { Code2, Database, Plus, Minus } from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import confetti from "canvas-confetti";

export function QuickCounters() {
  const dsaCount = useTrackerStore((s) => s.dsaCount);
  const incrementDsa = useTrackerStore((s) => s.incrementDsa);
  const decrementDsa = useTrackerStore((s) => s.decrementDsa);

  const sqlCount = useTrackerStore((s) => s.sqlCount);
  const incrementSql = useTrackerStore((s) => s.incrementSql);
  const decrementSql = useTrackerStore((s) => s.decrementSql);

  const dsaTarget = 150;
  const sqlTarget = 100;

  const dsaPercent = Math.min(100, Math.round((dsaCount / dsaTarget) * 100));
  const sqlPercent = Math.min(100, Math.round((sqlCount / sqlTarget) * 100));

  const handleDsaInc = (delta: number) => {
    incrementDsa(delta);
    if (dsaCount + delta >= dsaTarget) {
      confetti({ particleCount: 60, spread: 70, colors: ["#3b82f6", "#60a5fa"] });
    }
  };

  const handleSqlInc = (delta: number) => {
    incrementSql(delta);
    if (sqlCount + delta >= sqlTarget) {
      confetti({ particleCount: 60, spread: 70, colors: ["#10b981", "#34d399"] });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* DSA Counter Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm hover:border-blue-500/30 transition">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                DSA Practice
                <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
                  Goal: {dsaTarget}+
                </span>
              </h3>
              <p className="text-xs text-zinc-400">LeetCode, Arrays, Trees, Graphs</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono">{dsaCount}</span>
            <span className="text-xs text-zinc-500"> / {dsaTarget}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Overall Roadmap Progress</span>
            <span className="font-mono text-blue-400 font-semibold">{dsaPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
              style={{ width: `${dsaPercent}%` }}
            />
          </div>
        </div>

        {/* Increment / Decrement Buttons */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => decrementDsa(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              title="Decrement by 1"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDsaInc(1)}
              className="flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/25 transition"
            >
              <Plus className="h-3.5 w-3.5" /> 1 Problem
            </button>
            <button
              onClick={() => handleDsaInc(5)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition"
            >
              +5
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            {dsaTarget - dsaCount > 0 ? `${dsaTarget - dsaCount} to target` : "Target Achieved! 🎯"}
          </span>
        </div>
      </div>

      {/* SQL Queries Counter Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm hover:border-emerald-500/30 transition">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                SQL Queries
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Goal: {sqlTarget}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Joins, Aggregations, CTEs, Indexing</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono">{sqlCount}</span>
            <span className="text-xs text-zinc-500"> / {sqlTarget}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Query Mastery Progress</span>
            <span className="font-mono text-emerald-400 font-semibold">{sqlPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
              style={{ width: `${sqlPercent}%` }}
            />
          </div>
        </div>

        {/* Increment / Decrement Buttons */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => decrementSql(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              title="Decrement by 1"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleSqlInc(1)}
              className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <Plus className="h-3.5 w-3.5" /> 1 Query
            </button>
            <button
              onClick={() => handleSqlInc(5)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition"
            >
              +5
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            {sqlTarget - sqlCount > 0 ? `${sqlTarget - sqlCount} to target` : "Target Achieved! 🎯"}
          </span>
        </div>
      </div>
    </div>
  );
}
