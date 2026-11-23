"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, Sparkles, Brain, CheckCircle2, ShieldCheck } from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { buildRecentAnalytics } from "@/lib/analytics";

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

function StackedBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-xl text-xs space-y-1">
        <p className="font-bold text-zinc-900 dark:text-white mb-1">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{p.value} {p.unit || "hrs"}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function GrowthAreaTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-xs text-zinc-900 dark:text-white shadow-xl space-y-1">
        <p className="font-bold">{label}</p>
        <p className="text-blue-600 dark:text-blue-400 font-mono">DSA Solved: {payload[0]?.value}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-mono">SQL Queries: {payload[1]?.value}</p>
      </div>
    );
  }
  return null;
}

function ConsistencyLineTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-xs text-zinc-900 dark:text-white shadow-xl space-y-1">
        <p className="font-bold">{label}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-mono">Salah Adherence: {payload[0]?.value}%</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-mono">Core Habits Rate: {payload[1]?.value}%</p>
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const salahRecords = useTrackerStore((s) => s.salahRecords);
  const habitLogs = useTrackerStore((s) => s.habitLogs);
  const analyticsHistory = useMemo(
    () => buildRecentAnalytics({ collegeTimetable, noCollegeTimetable, completedBlocks, salahRecords, habitLogs }),
    [collegeTimetable, noCollegeTimetable, completedBlocks, salahRecords, habitLogs]
  );
  const dsaCount = useTrackerStore((s) => s.dsaCount);
  const sqlCount = useTrackerStore((s) => s.sqlCount);

  // Cumulative progression data for DSA & SQL
  const cumulativeData = useMemo(() => {
    return analyticsHistory.map((item, idx) => ({
      day: item.dayName,
      dsa: idx === analyticsHistory.length - 1 ? dsaCount : item.dsaCount,
      sql: idx === analyticsHistory.length - 1 ? sqlCount : item.sqlCount,
    }));
  }, [analyticsHistory, dsaCount, sqlCount]);

  // Last 7 days consistency rate
  const consistencyData = useMemo(() => {
    return analyticsHistory.map((item) => ({
      day: item.dayName,
      habitsRate: Math.round((item.habitsCompleted / 5) * 100),
      salahRate: Math.round((item.salahCount / 5) * 100),
    }));
  }, [analyticsHistory]);

  const totalWeeklyTechHours = analyticsHistory.reduce((acc, c) => acc + c.techHours, 0);
  const totalWeeklyDeenHours = analyticsHistory.reduce((acc, c) => acc + c.deenHours, 0);
  const totalSalahLogged = analyticsHistory.reduce((acc, c) => acc + c.salahCount, 0);
  const avgSalahRate = Math.round(
    (totalSalahLogged / (analyticsHistory.length * 5)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Analytics & Performance Reports</h1>
            <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
              7-Day Trends
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Data-backed metrics tracking spiritual consistency, coding output, and physical well-being
          </p>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
            <span>Weekly Coding & DSA</span>
            <Brain className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-2">{totalWeeklyTechHours.toFixed(1)} hrs</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Deep work logged</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
            <span>Spiritual Focus (Deen)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-2">{totalWeeklyDeenHours.toFixed(1)} hrs</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Namaz, Tahajjud & Qur&apos;an</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
            <span>Salah Adherence Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">{avgSalahRate}%</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{totalSalahLogged} / 35 prayers on time</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
            <span>Cumulative Practice</span>
            <TrendingUp className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-2">{dsaCount + sqlCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{dsaCount} DSA + {sqlCount} SQL</p>
        </div>
      </div>

      {/* 1. Stacked Bar Chart: Weekly Hours by Category */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Stacked Category Hours Breakdown
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Hours invested daily across Deen, Tech, College, and Restorative Health
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#10b981]" /> Deen</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" /> Tech</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" /> College</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#f43f5e]" /> Health</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
              <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip content={<StackedBarTooltip />} />
              <Bar dataKey="deenHours" name="Deen" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="techHours" name="Tech" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="collegeHours" name="College" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="healthHours" name="Health" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Two Columns: Area Chart (DSA & SQL Progression) + Habit Consistency Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative DSA & SQL Area Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                DSA & SQL Growth Curve
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Cumulative problems solved over time</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> DSA ({dsaCount}/150)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> SQL ({sqlCount}/100)
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSql" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<GrowthAreaTooltip />} />
                <Area type="monotone" dataKey="dsa" name="DSA" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDsa)" />
                <Area type="monotone" dataKey="sql" name="SQL" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSql)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Consistency Rate Line Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Habit & Salah Consistency %
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Adherence to daily pillars</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Salah %</span>
              <span className="text-zinc-400">|</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Habits %</span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<ConsistencyLineTooltip />} />
                <Line type="monotone" dataKey="salahRate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="habitsRate" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
