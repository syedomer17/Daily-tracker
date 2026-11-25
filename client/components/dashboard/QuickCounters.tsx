"use client";

import { useState, useMemo } from "react";
import { Code2, Database, Plus, Minus, ListPlus, ExternalLink, Trash2, X } from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import confetti from "canvas-confetti";

export function QuickCounters() {
  const todayDate = useTrackerStore((s) => s.todayDate);

  const incrementDsa = useTrackerStore((s) => s.incrementDsa);
  const decrementDsa = useTrackerStore((s) => s.decrementDsa);
  const deleteDsaEntry = useTrackerStore((s) => s.deleteDsaEntry);

  const incrementSql = useTrackerStore((s) => s.incrementSql);
  const decrementSql = useTrackerStore((s) => s.decrementSql);
  const deleteSqlEntry = useTrackerStore((s) => s.deleteSqlEntry);

  const dailyRecords = useTrackerStore((s) => s.dailyRecords);
  const getDailyRecord = useTrackerStore((s) => s.getDailyRecord);
  const getLifetimeDsaCount = useTrackerStore((s) => s.getLifetimeDsaCount);
  const getWeeklyDsaCount = useTrackerStore((s) => s.getWeeklyDsaCount);
  const getMonthlyDsaCount = useTrackerStore((s) => s.getMonthlyDsaCount);
  const getLifetimeSqlCount = useTrackerStore((s) => s.getLifetimeSqlCount);
  const getWeeklySqlCount = useTrackerStore((s) => s.getWeeklySqlCount);
  const getMonthlySqlCount = useTrackerStore((s) => s.getMonthlySqlCount);

  const todayRecord = useMemo(() => {
    return dailyRecords[todayDate] || getDailyRecord(todayDate);
  }, [dailyRecords, todayDate, getDailyRecord]);
  const lifetimeDsa = getLifetimeDsaCount();
  const weeklyDsa = getWeeklyDsaCount();
  const monthlyDsa = getMonthlyDsaCount();

  const lifetimeSql = getLifetimeSqlCount();
  const weeklySql = getWeeklySqlCount();
  const monthlySql = getMonthlySqlCount();

  const dsaTarget = 150;
  const sqlTarget = 100;
  const dailyDsaTarget = 3;
  const dailySqlTarget = 2;

  const dsaPercent = Math.min(100, Math.round((lifetimeDsa / dsaTarget) * 100));
  const sqlPercent = Math.min(100, Math.round((lifetimeSql / sqlTarget) * 100));

  // Modal State for adding problem details
  const [showDsaModal, setShowDsaModal] = useState(false);
  const [dsaName, setDsaName] = useState("");
  const [dsaDifficulty, setDsaDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [dsaTopic, setDsaTopic] = useState("Arrays");
  const [dsaUrl, setDsaUrl] = useState("");

  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlQueryName, setSqlQueryName] = useState("");
  const [sqlDifficulty, setSqlDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [sqlTopic, setSqlTopic] = useState("Joins");

  const [showEntriesDrawer, setShowEntriesDrawer] = useState<"dsa" | "sql" | null>(null);

  const handleDsaInc = (delta: number) => {
    incrementDsa(delta);
    if (lifetimeDsa + delta >= dsaTarget) {
      confetti({ particleCount: 60, spread: 70, colors: ["#3b82f6", "#60a5fa"] });
    }
  };

  const handleSqlInc = (delta: number) => {
    incrementSql(delta);
    if (lifetimeSql + delta >= sqlTarget) {
      confetti({ particleCount: 60, spread: 70, colors: ["#10b981", "#34d399"] });
    }
  };

  const handleSaveDetailedDsa = (e: React.FormEvent) => {
    e.preventDefault();
    incrementDsa(1, {
      name: dsaName.trim() || "Problem",
      difficulty: dsaDifficulty,
      topic: dsaTopic.trim() || "General",
      url: dsaUrl.trim() || undefined,
    });
    setDsaName("");
    setDsaUrl("");
    setShowDsaModal(false);
  };

  const handleSaveDetailedSql = (e: React.FormEvent) => {
    e.preventDefault();
    incrementSql(1, {
      queryName: sqlQueryName.trim() || "Query",
      difficulty: sqlDifficulty,
      topic: sqlTopic.trim() || "Joins",
    });
    setSqlQueryName("");
    setShowSqlModal(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. DSA Counter Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm hover:border-blue-500/40 transition">
          <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  DSA Practice
                  <span className="rounded bg-blue-500/10 dark:bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                    Goal: {dsaTarget}+
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Week: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{weeklyDsa}</strong></span>
                  <span>&bull;</span>
                  <span>Month: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{monthlyDsa}</strong></span>
                  <span>&bull;</span>
                  <span>Target: <strong className="text-blue-600 dark:text-blue-400 font-mono">{dailyDsaTarget}/day</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {todayRecord.dsaCount}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">today</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Lifetime: <strong>{lifetimeDsa}</strong>/{dsaTarget}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>July 2027 Career Goal Progress</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{dsaPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${dsaPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => decrementDsa(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
                title="Decrement daily count by 1"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDsaInc(1)}
                className="flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-500/10 dark:bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:hover:bg-blue-500/25 transition"
              >
                <Plus className="h-3.5 w-3.5" /> 1 Problem
              </button>
              <button
                onClick={() => handleDsaInc(3)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                +3
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowDsaModal(true)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Log question with title, difficulty & URL"
              >
                <ListPlus className="h-3.5 w-3.5" /> Details
              </button>
              {(todayRecord.dsaEntries || []).length > 0 && (
                <button
                  onClick={() => setShowEntriesDrawer("dsa")}
                  className="rounded-lg bg-blue-500/10 px-2 py-1 text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition"
                >
                  View ({todayRecord.dsaEntries?.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. SQL Queries Counter Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  SQL Queries
                  <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Goal: {sqlTarget}
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Week: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{weeklySql}</strong></span>
                  <span>&bull;</span>
                  <span>Month: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{monthlySql}</strong></span>
                  <span>&bull;</span>
                  <span>Target: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{dailySqlTarget}/day</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {todayRecord.sqlCount}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">today</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Lifetime: <strong>{lifetimeSql}</strong>/{sqlTarget}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>SQL Query Mastery Progress</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{sqlPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                style={{ width: `${sqlPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => decrementSql(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
                title="Decrement daily count by 1"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleSqlInc(1)}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25 transition"
              >
                <Plus className="h-3.5 w-3.5" /> 1 Query
              </button>
              <button
                onClick={() => handleSqlInc(3)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                +3
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSqlModal(true)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Log query with topic & difficulty"
              >
                <ListPlus className="h-3.5 w-3.5" /> Details
              </button>
              {(todayRecord.sqlEntries || []).length > 0 && (
                <button
                  onClick={() => setShowEntriesDrawer("sql")}
                  className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  View ({todayRecord.sqlEntries?.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DSA Detailed Entry Modal */}
      {showDsaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" /> Log DSA Problem
              </h3>
              <button onClick={() => setShowDsaModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailedDsa} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Problem Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 200. Number of Islands"
                  value={dsaName}
                  onChange={(e) => setDsaName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Difficulty</label>
                  <select
                    value={dsaDifficulty}
                    onChange={(e) => setDsaDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Graphs, DP"
                    value={dsaTopic}
                    onChange={(e) => setDsaTopic(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Problem URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={dsaUrl}
                  onChange={(e) => setDsaUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDsaModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition"
                >
                  Save Problem (+1)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Detailed Entry Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-500" /> Log SQL Query
              </h3>
              <button onClick={() => setShowSqlModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailedSql} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Query Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Second Highest Salary with DENSE_RANK"
                  value={sqlQueryName}
                  onChange={(e) => setSqlQueryName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Difficulty</label>
                  <select
                    value={sqlDifficulty}
                    onChange={(e) => setSqlDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Window Functions, CTEs"
                    value={sqlTopic}
                    onChange={(e) => setSqlTopic(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition"
                >
                  Save Query (+1)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries List Modal */}
      {showEntriesDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {showEntriesDrawer === "dsa" ? "Today's DSA Problems" : "Today's SQL Queries"}
              </h3>
              <button onClick={() => setShowEntriesDrawer(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {showEntriesDrawer === "dsa" ? (
                (todayRecord.dsaEntries || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No problems logged with details yet today.</p>
                ) : (
                  todayRecord.dsaEntries?.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {entry.name || "DSA Problem"}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                              entry.difficulty === "Hard"
                                ? "bg-rose-500/20 text-rose-500"
                                : entry.difficulty === "Medium"
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-emerald-500/20 text-emerald-500"
                            }`}
                          >
                            {entry.difficulty}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{entry.topic}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.url && (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteDsaEntry(entry.id, todayDate)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                (todayRecord.sqlEntries || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No queries logged with details yet today.</p>
                ) : (
                  todayRecord.sqlEntries?.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {entry.queryName || "SQL Query"}
                          </span>
                          <span className="rounded bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 text-[10px] font-semibold">
                            {entry.difficulty}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{entry.topic}</span>
                      </div>
                      <button
                        onClick={() => deleteSqlEntry(entry.id, todayDate)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
