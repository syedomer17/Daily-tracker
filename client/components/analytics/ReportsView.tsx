"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Moon,
  Sparkles,
  Award,
  AlertCircle,
  TrendingUp,
  Smile,
  Zap,
  Target,
  FileText,
  Printer,
} from "lucide-react";
import {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
} from "@/lib/analytics";
import { DailyRecord, DailyReview, Milestone, TimeBlock, WeeklyGoal } from "@/types";
import { formatDisplayDate, formatTime12 } from "@/lib/utils";
import { triggerPrintReport } from "@/lib/export";

interface ReportsViewProps {
  todayDate: string;
  dailyRecords: Record<string, DailyRecord>;
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  dailyReviews: DailyReview[];
  weeklyGoals: WeeklyGoal[];
  milestones: Milestone[];
  dayTypeByDate: Record<string, "college" | "no-college">;
}

export function ReportsView({
  todayDate,
  dailyRecords,
  collegeTimetable,
  noCollegeTimetable,
  dailyReviews,
  weeklyGoals,
  milestones,
  dayTypeByDate,
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");

  // Selection states
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(todayDate);
  const [selectedWeekEnd, setSelectedWeekEnd] = useState<string>(todayDate);
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(todayDate.slice(0, 7));

  // 1. Daily Report Data
  const dailyReport = useMemo(() => {
    return getDailyReport({
      date: selectedDailyDate,
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dailyReviews,
      dayTypeByDate,
      todayDate,
    });
  }, [selectedDailyDate, dailyRecords, collegeTimetable, noCollegeTimetable, dailyReviews, dayTypeByDate, todayDate]);

  // 2. Weekly Report Data
  const weeklyReport = useMemo(() => {
    return getWeeklyReport({
      weekEndDate: selectedWeekEnd,
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      weeklyGoals,
      dayTypeByDate,
    });
  }, [selectedWeekEnd, dailyRecords, collegeTimetable, noCollegeTimetable, weeklyGoals, dayTypeByDate]);

  // 3. Monthly Report Data
  const monthlyReport = useMemo(() => {
    return getMonthlyReport({
      yearMonth: selectedYearMonth,
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
    });
  }, [selectedYearMonth, dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate]);

  return (
    <div className="space-y-6">
      {/* Report Controls & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType("daily")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              reportType === "daily"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType("weekly")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              reportType === "weekly"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
            }`}
          >
            Weekly Report (7-Day)
          </button>
          <button
            onClick={() => setReportType("monthly")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              reportType === "monthly"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
            }`}
          >
            Monthly Report
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Pickers */}
          {reportType === "daily" && (
            <div className="flex items-center gap-2">
              <label htmlFor="daily-date-picker" className="text-xs text-zinc-500 dark:text-zinc-400">Date:</label>
              <input
                id="daily-date-picker"
                type="date"
                value={selectedDailyDate}
                onChange={(e) => setSelectedDailyDate(e.target.value)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {reportType === "weekly" && (
            <div className="flex items-center gap-2">
              <label htmlFor="week-end-picker" className="text-xs text-zinc-500 dark:text-zinc-400">Week Ending:</label>
              <input
                id="week-end-picker"
                type="date"
                value={selectedWeekEnd}
                onChange={(e) => setSelectedWeekEnd(e.target.value)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {reportType === "monthly" && (
            <div className="flex items-center gap-2">
              <label htmlFor="month-picker" className="text-xs text-zinc-500 dark:text-zinc-400">Month:</label>
              <input
                id="month-picker"
                type="month"
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          <button
            onClick={triggerPrintReport}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DAILY REPORT VIEW */}
      {/* ======================================================== */}
      {reportType === "daily" && (
        <div className="space-y-6 print:space-y-4">
          {/* Header Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Daily Productivity Report
                  </h2>
                  <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold capitalize">
                    {dailyReport.dayType} Day
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {dailyReport.dayName}, {formatDisplayDate(dailyReport.date)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {dailyReport.completionPercentage}%
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Day Completion</p>
                </div>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-850">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">DSA Solved</span>
                <p className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">
                  {dailyReport.dsaCount} problems
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">SQL Queries</span>
                <p className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  {dailyReport.sqlCount} queries
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Deep Work</span>
                <p className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  {dailyReport.deepWorkMinutes} mins
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Timetable Tasks</span>
                <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-0.5">
                  {dailyReport.completedTasks.length} completed
                </p>
              </div>
            </div>
          </div>

          {/* Spiritual & Habit Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salah Status */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Moon className="h-4 w-4 text-emerald-500" />
                Salah Checklist (Spiritual Foundation)
              </h3>
              <div className="grid grid-cols-5 gap-2 pt-2">
                {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((salah) => {
                  const done = dailyReport.salahStatus[salah];
                  return (
                    <div
                      key={salah}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-colors ${
                        done
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs capitalize">{salah}</span>
                      <span className="text-[10px] mt-1 font-mono">{done ? "✓ Done" : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Habits Status */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                Core Habits Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {[
                  { key: "quran", label: "Qur'an" },
                  { key: "salah5", label: "5 Prayers" },
                  { key: "exercise", label: "Exercise" },
                  { key: "deepWork", label: "Deep Work" },
                  { key: "healthyFoodSleep", label: "Clean Sleep" },
                ].map((item) => {
                  const done = dailyReport.habitsStatus[item.key as keyof typeof dailyReport.habitsStatus];
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
                        done
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span>{done ? "✓" : "○"}</span>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timetable Execution: Completed vs Missed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Tasks */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed Tasks ({dailyReport.completedTasks.length})
              </h3>
              {dailyReport.completedTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">No completed blocks recorded for this date.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dailyReport.completedTasks.map(({ block }) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{block.title}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {formatTime12(block.startTime)} – {formatTime12(block.endTime)}
                        </p>
                      </div>
                      <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {block.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missed or Incomplete Tasks */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Missed / Incomplete Tasks ({dailyReport.missedTasks.length})
              </h3>
              {dailyReport.missedTasks.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium py-2">
                  Zero missed tasks! All past scheduled slots were executed.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dailyReport.missedTasks.map(({ block, reason }) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{block.title}</p>
                        <p className="text-[11px] text-rose-500 font-mono">
                          {formatTime12(block.startTime)} – {formatTime12(block.endTime)} • {reason}
                        </p>
                      </div>
                      <span className="rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {block.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Review Reflection if recorded */}
          {dailyReport.review && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Evening Review & Reflections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">What went well</span>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{dailyReport.review.wentWell || "No notes logged."}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Blockers & Friction</span>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{dailyReport.review.blockedBy || "None reported."}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Tomorrow Priority</span>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{dailyReport.review.tomorrowPriority || "Standard timetable."}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5 text-amber-500" />
                  Mood: {dailyReport.review.moodScore}/5
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  Energy: {dailyReport.review.energyScore}/5
                </span>
                <span>GitHub Commits: {dailyReport.review.githubCommitsCount || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. WEEKLY REPORT VIEW */}
      {/* ======================================================== */}
      {reportType === "weekly" && (
        <div className="space-y-6 print:space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  7-Day Executive Weekly Progress
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {formatDisplayDate(weeklyReport.weekStartDate)} – {formatDisplayDate(weeklyReport.weekEndDate)}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {weeklyReport.averageCompletion}%
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Weekly Completion Avg</p>
                </div>
              </div>
            </div>

            {/* Week-over-Week Changes Banner */}
            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Week-over-Week (WoW) Shift:
              </span>
              <div className="flex items-center gap-4 font-mono font-medium">
                <span className={weeklyReport.wowChanges.completionDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>
                  {weeklyReport.wowChanges.completionDelta >= 0 ? "+" : ""}{weeklyReport.wowChanges.completionDelta}% completion
                </span>
                <span className="text-zinc-400">|</span>
                <span className={weeklyReport.wowChanges.studyHoursDelta >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-500"}>
                  {weeklyReport.wowChanges.studyHoursDelta >= 0 ? "+" : ""}{weeklyReport.wowChanges.studyHoursDelta}h tech study
                </span>
                <span className="text-zinc-400">|</span>
                <span className={weeklyReport.wowChanges.dsaDelta >= 0 ? "text-sky-600 dark:text-sky-400" : "text-rose-500"}>
                  {weeklyReport.wowChanges.dsaDelta >= 0 ? "+" : ""}{weeklyReport.wowChanges.dsaDelta} DSA
                </span>
                <span className="text-zinc-400">|</span>
                <span className={weeklyReport.wowChanges.sqlDelta >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-500"}>
                  {weeklyReport.wowChanges.sqlDelta >= 0 ? "+" : ""}{weeklyReport.wowChanges.sqlDelta} SQL
                </span>
              </div>
            </div>
          </div>

          {/* Strongest & Weakest Days Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strongest Day */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Strongest Day of the Week
                </span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {weeklyReport.strongestDay?.completionRate || 0}%
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {weeklyReport.strongestDay ? `${weeklyReport.strongestDay.dayName} (${weeklyReport.strongestDay.date})` : "N/A"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Peak performance day with {weeklyReport.strongestDay?.completedBlocksCount || 0} timetable blocks executed,{" "}
                {weeklyReport.strongestDay?.dsaCount || 0} DSA solved, and {weeklyReport.strongestDay?.deepWorkHours || 0}h deep work.
              </p>
            </div>

            {/* Weakest Day */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Weakest Day of the Week
                </span>
                <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                  {weeklyReport.weakestDay?.completionRate || 0}%
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {weeklyReport.weakestDay ? `${weeklyReport.weakestDay.dayName} (${weeklyReport.weakestDay.date})` : "N/A"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Identified friction point. Review blockers on this day to protect focus and schedule restorative rest.
              </p>
            </div>
          </div>

          {/* 7-Day Progression Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Day-by-Day 7-Day Execution Record
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 font-semibold">Day & Date</th>
                    <th className="py-2.5 font-semibold">Type</th>
                    <th className="py-2.5 font-semibold text-right">Completion</th>
                    <th className="py-2.5 font-semibold text-right">Deep Work</th>
                    <th className="py-2.5 font-semibold text-right">DSA</th>
                    <th className="py-2.5 font-semibold text-right">SQL</th>
                    <th className="py-2.5 font-semibold text-right">Salah</th>
                    <th className="py-2.5 font-semibold text-right">Habits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono">
                  {weeklyReport.dailyStats.map((d) => (
                    <tr key={d.date} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2.5 font-sans font-medium text-zinc-900 dark:text-white">
                        {d.dayName}, {d.date}
                      </td>
                      <td className="py-2.5 font-sans text-zinc-500 capitalize">{d.dayType}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {d.completionRate}%
                      </td>
                      <td className="py-2.5 text-right text-purple-600 dark:text-purple-400">
                        {d.deepWorkHours}h
                      </td>
                      <td className="py-2.5 text-right text-sky-600 dark:text-sky-400">{d.dsaCount}</td>
                      <td className="py-2.5 text-right text-teal-600 dark:text-teal-400">{d.sqlCount}</td>
                      <td className="py-2.5 text-right text-zinc-700 dark:text-zinc-300">{d.salahCount}/5</td>
                      <td className="py-2.5 text-right text-indigo-600 dark:text-indigo-400">{d.habitsCompleted}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Goals Status */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Weekly Goals Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weeklyGoals.map((g) => (
                <div
                  key={g.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    g.completed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                      : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="font-bold text-sm mt-0.5">{g.completed ? "✓" : "○"}</span>
                  <div>
                    <p className={`font-semibold ${g.completed ? "line-through text-zinc-500" : ""}`}>
                      {g.title}
                    </p>
                    {g.targetMetric && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">Target: {g.targetMetric}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MONTHLY REPORT VIEW */}
      {/* ======================================================== */}
      {reportType === "monthly" && (
        <div className="space-y-6 print:space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Monthly Productivity Overview
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Month of {selectedYearMonth} ({monthlyReport.daysInMonth} calendar days)
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                    {monthlyReport.consistencyRate}%
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Consistency Index</p>
                </div>
              </div>
            </div>

            {/* Month-over-Month (MoM) Changes Banner */}
            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Month-over-Month (MoM) Variance:
              </span>
              <div className="flex items-center gap-4 font-mono font-medium">
                <span className={monthlyReport.momChanges.consistencyDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>
                  {monthlyReport.momChanges.consistencyDelta >= 0 ? "+" : ""}{monthlyReport.momChanges.consistencyDelta}% consistency
                </span>
                <span className="text-zinc-400">|</span>
                <span className={monthlyReport.momChanges.deepWorkDelta >= 0 ? "text-purple-600 dark:text-purple-400" : "text-rose-500"}>
                  {monthlyReport.momChanges.deepWorkDelta >= 0 ? "+" : ""}{monthlyReport.momChanges.deepWorkDelta}h deep focus
                </span>
                <span className="text-zinc-400">|</span>
                <span className={monthlyReport.momChanges.dsaDelta >= 0 ? "text-sky-600 dark:text-sky-400" : "text-rose-500"}>
                  {monthlyReport.momChanges.dsaDelta >= 0 ? "+" : ""}{monthlyReport.momChanges.dsaDelta} DSA
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Totals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Total DSA</span>
              <p className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                {monthlyReport.totalDsa}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Problems solved this month</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Total SQL</span>
              <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                {monthlyReport.totalSql}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Queries practiced</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Deep Work</span>
              <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {monthlyReport.totalDeepWorkHours}h
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Focused study logged</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Salah Adherence</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {monthlyReport.salahAdherenceRate}%
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Prayer consistency</p>
            </div>
          </div>

          {/* Roadmap Milestone Alignment */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Roadmap Alignment & Milestones
            </h3>
            <div className="space-y-3">
              {milestones.map((m) => {
                const totalItems = m.checklist.length;
                const completedItems = m.checklist.filter((c) => c.done).length;
                const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">{m.phase}: {m.title}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-medium">({m.period})</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
