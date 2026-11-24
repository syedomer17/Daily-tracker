"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  LineChart,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import {
  aggregateDateRange,
  getPlannedVsActual,
  getMissedTasksAnalysis,
} from "@/lib/analytics";
import {
  exportDailyRecordsToCsv,
  exportAnalyticsToJson,
} from "@/lib/export";
import {
  getYesterdayDateString,
  lastNDates,
  formatDisplayDate,
} from "@/lib/utils";

import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { ProductivityCharts } from "@/components/analytics/ProductivityCharts";
import { ReportsView } from "@/components/analytics/ReportsView";
import { MissedTasksDiagnostics } from "@/components/analytics/MissedTasksDiagnostics";
import { CareerRoadmapSection } from "@/components/analytics/CareerRoadmapSection";

type RangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisMonth"
  | "allTime"
  | "custom";

export default function AnalyticsPage() {
  // Stable Store Selectors
  const todayDate = useTrackerStore((s) => s.todayDate);
  const dailyRecords = useTrackerStore((s) => s.dailyRecords);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const dayTypeByDate = useTrackerStore((s) => s.dayTypeByDate);
  const weeklyGoals = useTrackerStore((s) => s.weeklyGoals);
  const milestones = useTrackerStore((s) => s.milestones);
  const roadmapTargets = useTrackerStore((s) => s.roadmapTargets);
  const dailyReviews = useTrackerStore((s) => s.dailyReviews);
  const legacyBaselineDsa = useTrackerStore((s) => s.legacyBaselineDsa);
  const legacyBaselineSql = useTrackerStore((s) => s.legacyBaselineSql);

  // Store Actions
  const toggleMilestoneChecklistItem = useTrackerStore((s) => s.toggleMilestoneChecklistItem);
  const setRoadmapTarget = useTrackerStore((s) => s.setRoadmapTarget);
  const updateMilestoneTargetDate = useTrackerStore((s) => s.updateMilestoneTargetDate);
  const addMilestoneChecklistItem = useTrackerStore((s) => s.addMilestoneChecklistItem);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "charts" | "reports" | "diagnostics" | "roadmap"
  >("overview");

  // Date Range Filtering
  const [rangePreset, setRangePreset] = useState<RangePreset>("last7");
  const [customStartDate, setCustomStartDate] = useState<string>(
    () => lastNDates(7)[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(() => todayDate);

  // Compute effective date range based on preset
  const { startDate, endDate } = useMemo(() => {
    switch (rangePreset) {
      case "today":
        return { startDate: todayDate, endDate: todayDate };
      case "yesterday": {
        const y = getYesterdayDateString(todayDate);
        return { startDate: y, endDate: y };
      }
      case "last7": {
        const dates = lastNDates(7);
        return { startDate: dates[0], endDate: dates[dates.length - 1] };
      }
      case "last14": {
        const dates = lastNDates(14);
        return { startDate: dates[0], endDate: dates[dates.length - 1] };
      }
      case "last30": {
        const dates = lastNDates(30);
        return { startDate: dates[0], endDate: dates[dates.length - 1] };
      }
      case "thisMonth": {
        const yearMonth = todayDate.slice(0, 7);
        return { startDate: `${yearMonth}-01`, endDate: todayDate };
      }
      case "allTime": {
        const recordedDates = Object.keys(dailyRecords).sort();
        const earliest = recordedDates.length > 0 ? recordedDates[0] : todayDate;
        return { startDate: earliest, endDate: todayDate };
      }
      case "custom":
      default:
        return {
          startDate: customStartDate || todayDate,
          endDate: customEndDate || todayDate,
        };
    }
  }, [rangePreset, todayDate, dailyRecords, customStartDate, customEndDate]);

  // Aggregated Data for the selected range
  const selectedRangeAgg = useMemo(() => {
    return aggregateDateRange({
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
    });
  }, [dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate, startDate, endDate]);

  // Planned vs Actual for the selected range
  const plannedVsActual = useMemo(() => {
    return getPlannedVsActual({
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
    });
  }, [dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate, startDate, endDate]);

  // Routine & Missed Tasks Diagnostics
  const diagnostics = useMemo(() => {
    return getMissedTasksAnalysis({
      dailyRecords,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
      todayDate,
    });
  }, [dailyRecords, collegeTimetable, noCollegeTimetable, dayTypeByDate, startDate, endDate, todayDate]);

  // Export handlers
  const handleExportCsv = () => {
    exportDailyRecordsToCsv(dailyRecords);
  };

  const handleExportJson = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userRange: { startDate, endDate },
      summary: selectedRangeAgg,
      plannedVsActual,
      diagnostics,
      roadmapTargets,
      dailyRecords,
    };
    exportAnalyticsToJson(exportPayload);
  };

  const lifetimeDsa = useMemo(() => {
    const sum = Object.values(dailyRecords).reduce((acc, r) => acc + (r.dsaCount || 0), 0);
    return sum + legacyBaselineDsa;
  }, [dailyRecords, legacyBaselineDsa]);

  const lifetimeSql = useMemo(() => {
    const sum = Object.values(dailyRecords).reduce((acc, r) => acc + (r.sqlCount || 0), 0);
    return sum + legacyBaselineSql;
  }, [dailyRecords, legacyBaselineSql]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Productivity Analytics & Reports
            </h1>
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Data-backed metrics tracking spiritual consistency, coding trajectory, deep work, and timetable adherence
          </p>
        </div>

        {/* Export Data Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
            Range:
          </span>
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "last7", label: "Last 7 Days" },
            { id: "last14", label: "Last 14 Days" },
            { id: "last30", label: "Last 30 Days" },
            { id: "thisMonth", label: "This Month" },
            { id: "allTime", label: "All Time" },
            { id: "custom", label: "Custom" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setRangePreset(preset.id as RangePreset)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                rangePreset === preset.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs or Active Range Display */}
        {rangePreset === "custom" ? (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-mono text-zinc-900 dark:text-zinc-100"
            />
            <span className="text-zinc-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-mono text-zinc-900 dark:text-zinc-100"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono">
              {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)} ({selectedRangeAgg.daysCount} days)
            </span>
          </div>
        )}
      </div>

      {/* Primary KPI Cards (12 Key Metrics) */}
      <AnalyticsKpiCards
        todayDate={todayDate}
        dailyRecords={dailyRecords}
        collegeTimetable={collegeTimetable}
        noCollegeTimetable={noCollegeTimetable}
        dayTypeByDate={dayTypeByDate}
        weeklyGoals={weeklyGoals}
        legacyBaselineDsa={legacyBaselineDsa}
        legacyBaselineSql={legacyBaselineSql}
        selectedRangeAgg={selectedRangeAgg}
      />

      {/* Navigation View Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex space-x-6">
          {[
            { id: "overview", label: "Overview & Summary", icon: Sparkles },
            { id: "charts", label: "Productivity Charts (8)", icon: LineChart },
            { id: "reports", label: "Executive Reports", icon: FileText },
            { id: "diagnostics", label: "Routine Diagnostics", icon: Target },
            { id: "roadmap", label: "July 2027 Roadmap", icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <ProductivityCharts
            aggregation={selectedRangeAgg}
            plannedVsActual={plannedVsActual}
            dailyRecords={dailyRecords}
          />
        </div>
      )}

      {activeTab === "charts" && (
        <ProductivityCharts
          aggregation={selectedRangeAgg}
          plannedVsActual={plannedVsActual}
          dailyRecords={dailyRecords}
        />
      )}

      {activeTab === "reports" && (
        <ReportsView
          todayDate={todayDate}
          dailyRecords={dailyRecords}
          collegeTimetable={collegeTimetable}
          noCollegeTimetable={noCollegeTimetable}
          dailyReviews={dailyReviews}
          weeklyGoals={weeklyGoals}
          milestones={milestones}
          dayTypeByDate={dayTypeByDate}
        />
      )}

      {activeTab === "diagnostics" && (
        <MissedTasksDiagnostics diagnostics={diagnostics} />
      )}

      {activeTab === "roadmap" && (
        <CareerRoadmapSection
          milestones={milestones}
          lifetimeDsa={lifetimeDsa}
          lifetimeSql={lifetimeSql}
          roadmapTargets={roadmapTargets}
          onToggleChecklistItem={toggleMilestoneChecklistItem}
          onSetRoadmapTarget={setRoadmapTarget}
          onUpdateMilestoneTargetDate={updateMilestoneTargetDate}
          onAddChecklistItem={addMilestoneChecklistItem}
        />
      )}
    </div>
  );
}
