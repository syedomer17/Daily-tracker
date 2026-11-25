"use client";

import { useState, useMemo } from "react";
import {
  CalendarClock,
  Plus,
  RotateCcw,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  GraduationCap,
  Code2,
  Play,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { Category, TimeBlock, DayType } from "@/types";
import {
  CATEGORY_CONFIG,
  formatTime12,
  cn,
  getTodayDateString,
  getTomorrowDateString,
  getYesterdayDateString,
} from "@/lib/utils";
import { TimetableModal } from "@/components/schedule/TimetableModal";
import confetti from "canvas-confetti";

export default function SchedulePage() {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const dayType = useTrackerStore((s) => s.dayType);
  const dayTypeByDate = useTrackerStore((s) => s.dayTypeByDate);
  const setDayTypeForDate = useTrackerStore((s) => s.setDayTypeForDate);
  const toggleBlockCompletion = useTrackerStore((s) => s.toggleBlockCompletion);
  const addTimeBlock = useTrackerStore((s) => s.addTimeBlock);
  const updateTimeBlock = useTrackerStore((s) => s.updateTimeBlock);
  const deleteTimeBlock = useTrackerStore((s) => s.deleteTimeBlock);
  const resetTimetable = useTrackerStore((s) => s.resetTimetable);
  const startFocusTimer = useTrackerStore((s) => s.startFocusTimer);
  const dailyRecords = useTrackerStore((s) => s.dailyRecords);
  const getDailyRecord = useTrackerStore((s) => s.getDailyRecord);

  const activeDayType = dayTypeByDate[selectedDate] || dayType;
  const currentRecord = useMemo(() => {
    return dailyRecords[selectedDate] || getDailyRecord(selectedDate);
  }, [dailyRecords, selectedDate, getDailyRecord]);

  const timetable = useMemo(
    () => (activeDayType === "college" ? collegeTimetable : noCollegeTimetable),
    [activeDayType, collegeTimetable, noCollegeTimetable]
  );

  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  // Calculate current minutes now for status determination
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const filteredBlocks = useMemo(() => {
    return timetable.filter((block) => {
      const matchesCat = selectedCategory === "all" || block.category === selectedCategory;
      const matchesSearch =
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [timetable, selectedCategory, searchQuery]);

  const completionCount = timetable.filter(
    (b) => !!currentRecord.completedBlocks[b.id]
  ).length;
  const completionPercent = timetable.length
    ? Math.round((completionCount / timetable.length) * 100)
    : 0;

  const handleToggle = (id: string) => {
    const wasCompleted = !!currentRecord.completedBlocks[id];
    toggleBlockCompletion(id, selectedDate);
    if (!wasCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
    }
  };

  const handleSaveBlock = (block: Omit<TimeBlock, "id"> | TimeBlock) => {
    if ("id" in block) {
      updateTimeBlock(activeDayType, block as TimeBlock);
    } else {
      addTimeBlock(activeDayType, block);
    }
  };

  const getBlockStatus = (block: TimeBlock) => {
    const isDone = !!currentRecord.completedBlocks[block.id];
    if (isDone)
      return {
        label: "Completed",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };

    if (selectedDate !== todayStr) {
      return {
        label: selectedDate < todayStr ? "Past" : "Scheduled",
        color: "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      };
    }

    const [sh, sm] = block.startTime.split(":").map(Number);
    const [eh, em] = block.endTime.split(":").map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;

    if (endM < startM) {
      // Midnight block
      if (currentMinutes >= startM || currentMinutes < endM) {
        return {
          label: "Active Now",
          color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 font-bold animate-pulse",
        };
      }
      return {
        label: currentMinutes > endM && currentMinutes < startM ? "Upcoming" : "Missed",
        color: "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      };
    } else {
      if (currentMinutes >= startM && currentMinutes < endM) {
        return {
          label: "Active Now",
          color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 font-bold animate-pulse",
        };
      }
      if (currentMinutes > endM) {
        return {
          label: "Missed",
          color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      }
      return {
        label: "Upcoming",
        color: "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      };
    }
  };

  const handleDayTypeSwitch = (type: DayType) => {
    setDayTypeForDate(selectedDate, type);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Daily Timetable & Schedule Manager
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track, reorder, edit, and check off routine blocks with persistent date-wise isolation
          </p>
        </div>

        {/* Date Selector & Day Type Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Date Switcher */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 text-xs shadow-sm">
            <button
              onClick={() => setSelectedDate(getYesterdayDateString(selectedDate))}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="Previous Day"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setSelectedDate(getYesterdayDateString(todayStr))}
              className={cn(
                "px-2 py-1 rounded-lg transition",
                selectedDate === getYesterdayDateString(todayStr)
                  ? "bg-zinc-200 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              )}
            >
              Yesterday
            </button>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                "px-2 py-1 rounded-lg transition",
                selectedDate === todayStr
                  ? "bg-emerald-500 text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              )}
            >
              Today
            </button>

            <button
              onClick={() => setSelectedDate(getTomorrowDateString(todayStr))}
              className={cn(
                "px-2 py-1 rounded-lg transition",
                selectedDate === getTomorrowDateString(todayStr)
                  ? "bg-zinc-200 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              )}
            >
              Tomorrow
            </button>

            <button
              onClick={() => setSelectedDate(getTomorrowDateString(selectedDate))}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="Next Day"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Current Date Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
            <CalendarIcon className="h-3.5 w-3.5 text-emerald-500" />
            <span>{selectedDate}</span>
          </div>

          {/* Day Type Override for Selected Date */}
          <button
            onClick={() => handleDayTypeSwitch(activeDayType === "college" ? "no-college" : "college")}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition shadow-sm"
          >
            {activeDayType === "college" ? (
              <>
                <GraduationCap className="h-3.5 w-3.5 text-amber-500" /> College Day
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5 text-blue-500" /> No College Day
              </>
            )}
          </button>

          {/* Reset Template */}
          <button
            onClick={() => {
              if (confirm(`Reset ${activeDayType} timetable to default template?`)) {
                resetTimetable(activeDayType);
              }
            }}
            className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
            title="Reset to default template"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Add Block */}
          <button
            onClick={() => {
              setEditingBlock(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm shadow-emerald-950/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Block
          </button>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-3 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Completion Rate</span>
          <p className="text-xl font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">{completionPercent}%</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-3 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Completed Blocks</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {completionCount} / {timetable.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-3 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Schedule Active</span>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 capitalize">
            {activeDayType.replace("-", " ")}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-3 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Target Career Goal</span>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">July 2027 Tech Job</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(["all", "deen", "tech", "college", "health"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition border",
                selectedCategory === cat
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              {cat === "all" ? "All Categories" : CATEGORY_CONFIG[cat].shortLabel}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search block title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Timeline Blocks List */}
      <div className="space-y-3">
        {filteredBlocks.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-8 text-center text-xs text-zinc-500">
            No schedule blocks match your current filter.
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const isCompleted = !!currentRecord.completedBlocks[block.id];
            const catConfig = CATEGORY_CONFIG[block.category];
            const status = getBlockStatus(block);

            return (
              <div
                key={block.id}
                className={cn(
                  "group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700/80 shadow-sm"
                )}
              >
                {/* Left: Time and Checkbox */}
                <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(block.id)}
                    className={cn(
                      "mt-0.5 md:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition",
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-emerald-500/60"
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                  </button>

                  {/* Time badge */}
                  <div className="flex flex-col shrink-0 font-mono text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatTime12(block.startTime)}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatTime12(block.endTime)}
                    </span>
                  </div>

                  {/* Block Title and Details */}
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={cn(
                          "text-sm font-semibold transition truncate",
                          isCompleted
                            ? "text-zinc-500 dark:text-zinc-400 line-through"
                            : "text-zinc-900 dark:text-white"
                        )}
                      >
                        {block.title}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.2 text-[10px] font-semibold border",
                          catConfig.badgeBg
                        )}
                      >
                        {catConfig.shortLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.2 text-[10px] font-mono border",
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {block.description}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => startFocusTimer(block.id, 25)}
                    className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
                    title="Start 25-minute focus session for this block"
                  >
                    <Play className="h-3 w-3" /> Focus
                  </button>

                  <button
                    onClick={() => {
                      setEditingBlock(block);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Edit block"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete "${block.title}"?`)) {
                        deleteTimeBlock(activeDayType, block.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Timetable Modal */}
      {modalOpen && (
        <TimetableModal
          initialData={editingBlock}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveBlock}
        />
      )}
    </div>
  );
}
