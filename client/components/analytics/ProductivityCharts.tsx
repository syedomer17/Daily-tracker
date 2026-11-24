"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Code2,
  Database,
  Moon,
  PieChart as PieIcon,
  CheckCircle2,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  DateRangeAggregation,
  PlannedVsActualSummary,
} from "@/lib/analytics";
import { DailyRecord } from "@/types";

interface ProductivityChartsProps {
  aggregation: DateRangeAggregation;
  plannedVsActual: PlannedVsActualSummary;
  dailyRecords: Record<string, DailyRecord>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
    unit?: string;
  }>;
  label?: string;
}

function GenericTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur p-3 shadow-xl text-xs space-y-1.5 z-50">
        <p className="font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1">
          {label}
        </p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">{p.name || p.dataKey}:</span>
            </span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              {p.value} {p.unit || ""}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function ProductivityCharts({
  aggregation,
  plannedVsActual,
  dailyRecords,
}: ProductivityChartsProps) {
  const { dailyStats } = aggregation;

  // Cumulative data for DSA and SQL progress
  const cumulativeGrowthData = useMemo(() => {
    const list: Array<{
      date: string;
      dayName: string;
      dailyDsa: number;
      cumulativeDsa: number;
      dailySql: number;
      cumulativeSql: number;
    }> = [];
    let runDsa = 0;
    let runSql = 0;
    for (let i = 0; i < dailyStats.length; i++) {
      const d = dailyStats[i];
      runDsa += d.dsaCount;
      runSql += d.sqlCount;
      list.push({
        date: d.date,
        dayName: d.dayName,
        dailyDsa: d.dsaCount,
        cumulativeDsa: runDsa,
        dailySql: d.sqlCount,
        cumulativeSql: runSql,
      });
    }
    return list;
  }, [dailyStats]);

  // Donut chart data for actual category allocation
  const categoryPieData = useMemo(() => {
    const data = [
      { name: "Tech / Coding", value: aggregation.totalTechHours, color: "#3b82f6" },
      { name: "Deen / Spiritual", value: aggregation.totalDeenHours, color: "#10b981" },
      { name: "College / Study", value: aggregation.totalCollegeHours, color: "#f59e0b" },
      { name: "Health / Recovery", value: aggregation.totalHealthHours, color: "#f43f5e" },
    ].filter((item) => item.value > 0);

    // Fallback if zero activity
    if (data.length === 0) {
      return [{ name: "No Activity Logged", value: 1, color: "#71717a" }];
    }
    return data;
  }, [aggregation]);

  const hasData = dailyStats.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
        <Calendar className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          No records found for this range
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Start recording today&apos;s timetable blocks, prayers, habits, or focus sessions to generate real productivity charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Daily Completion Trend Chart (Area Chart) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              1. Daily Completion Trend (%)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Balanced score across timetable execution, Salah, core habits, and deep focus
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            Avg: {aggregation.averageDailyCompletion}%
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
              <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} tickLine={false} unit="%" />
              <Tooltip content={<GenericTooltip />} />
              <Area
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate"
                unit="%"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#completionGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 2. Deep-Work Bar Chart & 7. Planned vs Actual Study Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Deep-Work Bar Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                2. Deep-Work Duration (Hours)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Focus timer sessions logged per day
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-purple-600 dark:text-purple-400">
              Total: {aggregation.totalDeepWorkHours}h
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="h" />
                <Tooltip content={<GenericTooltip />} />
                <Bar dataKey="deepWorkHours" name="Deep Work" unit="h" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Planned vs Actual Study Hours */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                7. Planned vs Actual Study Hours
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Scheduled timetable tech blocks vs verified completed time
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
              {plannedVsActual.studyAdherencePercent}% adherence
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plannedVsActual.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="h" />
                <Tooltip content={<GenericTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="plannedStudyHours" name="Planned Tech" unit="h" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualStudyHours" name="Actual Tech" unit="h" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: 3. DSA Progress Line Chart & 4. SQL Progress Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. DSA Progress Line Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-sky-500" />
                3. DSA Problem Trajectory
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Daily solved and cumulative trend toward 150 goal
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-sky-600 dark:text-sky-400">
              +{aggregation.totalDsa} solved
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<GenericTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="dailyDsa" name="Daily Solved" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cumulativeDsa" name="Cumulative" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. SQL Progress Line Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-teal-500" />
                4. SQL Practice Trajectory
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Daily queries and cumulative progress toward 100 goal
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-teal-600 dark:text-teal-400">
              +{aggregation.totalSql} queries
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<GenericTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="dailySql" name="Daily Practiced" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cumulativeSql" name="Cumulative" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: 6. Salah Completion History & 8. Category-wise Time Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6. Salah Completion History */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Moon className="h-4 w-4 text-emerald-500" />
                6. Salah Completion History (out of 5)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fajr, Dhuhr, Asr, Maghrib & Isha daily adherence
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {aggregation.salahAdherenceRate}% on time
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<GenericTooltip />} />
                <Bar dataKey="salahCount" name="Prayers Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Category-wise Time Allocation (Donut Chart) */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-amber-500" />
                8. Category Time Allocation (Hours)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verified hours invested across life categories
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
              {(
                aggregation.totalTechHours +
                aggregation.totalDeenHours +
                aggregation.totalCollegeHours +
                aggregation.totalHealthHours
              ).toFixed(1)}h total
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<GenericTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Habit Consistency Heatmap (Matrix View) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              5. Habit Consistency Heatmap
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Green blocks represent verified habit completion across the date range
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-800" /> Missed / Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="py-2 pr-4 font-semibold min-w-[140px]">Core Habit</th>
                {dailyStats.map((d) => (
                  <th key={d.date} className="py-2 px-1.5 text-center font-mono font-medium">
                    <div>{d.dayName}</div>
                    <div className="text-[10px] text-zinc-400">{d.date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {[
                { key: "quran", label: "Qur'an Recitation" },
                { key: "salah5", label: "5 Daily Prayers" },
                { key: "exercise", label: "Workout / Fitness" },
                { key: "deepWork", label: "Deep Work (90+ min)" },
                { key: "healthyFoodSleep", label: "Clean Nutrition & Sleep" },
              ].map((habit) => (
                <tr key={habit.key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <td className="py-2.5 pr-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {habit.label}
                  </td>
                  {dailyStats.map((d) => {
                    const rec = dailyRecords[d.date];
                    const isDone = Boolean(rec?.habits && rec.habits[habit.key as keyof typeof rec.habits]);
                    return (
                      <td key={d.date} className="py-2.5 px-1.5 text-center">
                        <span
                          title={`${habit.label} on ${d.date}: ${isDone ? "Done" : "Missed"}`}
                          className={`inline-block h-6 w-6 rounded-md transition-colors ${
                            isDone
                              ? "bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-emerald-500/20"
                              : "bg-zinc-200 dark:bg-zinc-800"
                          }`}
                        >
                          {isDone ? "✓" : ""}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
