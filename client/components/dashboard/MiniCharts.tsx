"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTrackerStore } from "@/lib/store";
import { buildRecentAnalytics } from "@/lib/analytics";
import { Moon, Laptop, Compass, Sparkles } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
  }>;
  label?: string;
}

function MiniBarTooltip({ active, payload, label }: CustomTooltipProps) {
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
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{p.value} hrs</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function MiniPieTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-900 dark:text-white shadow-md">
        <span className="font-semibold">{data.name}: </span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{data.value} hrs</span>
      </div>
    );
  }
  return null;
}

export function MiniCharts() {
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const salahRecords = useTrackerStore((s) => s.salahRecords);
  const habitLogs = useTrackerStore((s) => s.habitLogs);
  const analyticsHistory = useMemo(
    () => buildRecentAnalytics({ collegeTimetable, noCollegeTimetable, completedBlocks, salahRecords, habitLogs }),
    [collegeTimetable, noCollegeTimetable, completedBlocks, salahRecords, habitLogs]
  );

  const timetable = useMemo(
    () => (dayType === "college" ? collegeTimetable : noCollegeTimetable),
    [dayType, collegeTimetable, noCollegeTimetable]
  );

  const deenDunyaSplit = useMemo(() => {
    let deenMinutes = 0;
    let dunyaMinutes = 0;

    timetable.forEach((b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      let duration = eh * 60 + em - (sh * 60 + sm);
      if (duration < 0) duration += 24 * 60;

      if (b.category === "deen") {
        deenMinutes += duration;
      } else {
        dunyaMinutes += duration;
      }
    });

    const total = deenMinutes + dunyaMinutes;
    const deenPercent = total ? Math.round((deenMinutes / total) * 100) : 0;
    const dunyaPercent = 100 - deenPercent;

    return {
      deenHours: +(deenMinutes / 60).toFixed(1),
      dunyaHours: +(dunyaMinutes / 60).toFixed(1),
      deenPercent,
      dunyaPercent,
    };
  }, [timetable]);

  const pieData = useMemo(() => {
    return [
      { name: "Deen (Spiritual)", value: deenDunyaSplit.deenHours, color: "#10b981" },
      { name: "Dunya (Career/Health)", value: deenDunyaSplit.dunyaHours, color: "#3b82f6" },
    ];
  }, [deenDunyaSplit]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Deen vs Dunya Radial / Donut Balance Chart (5 cols) */}
      <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Deen vs. Dunya Balance
            </h3>
            <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
              Today&apos;s Split
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Harmonizing spiritual duties and career excellence
          </p>
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative h-48 w-full my-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<MiniPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Deen Share</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {deenDunyaSplit.deenPercent}%
            </span>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2">
            <Moon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{deenDunyaSplit.deenHours} hrs</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Deen ({deenDunyaSplit.deenPercent}%)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 p-2">
            <Laptop className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">{deenDunyaSplit.dunyaHours} hrs</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Dunya ({deenDunyaSplit.dunyaPercent}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 7-Day Hours Logged Bar Chart (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              7-Day Hours Logged
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Category Allocation</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Weekly distribution across Spiritual, Tech, College, and Health blocks
          </p>
        </div>

        {/* Bar Chart */}
        <div className="h-56 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dayName" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip content={<MiniBarTooltip />} />
              <Bar dataKey="deenHours" name="Deen" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="techHours" name="Tech" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="collegeHours" name="College" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="healthHours" name="Health" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#10b981]" /> Deen
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" /> Tech / Coding
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" /> College
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f43f5e]" /> Health & Sleep
          </span>
        </div>
      </div>
    </div>
  );
}
