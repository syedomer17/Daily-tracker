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
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { Category, TimeBlock } from "@/types";
import { CATEGORY_CONFIG, formatTime12, cn, getTodayDateString } from "@/lib/utils";
import { TimetableModal } from "@/components/schedule/TimetableModal";
import confetti from "canvas-confetti";

export default function SchedulePage() {
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const toggleDayType = useTrackerStore((s) => s.toggleDayType);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const toggleBlockCompletion = useTrackerStore((s) => s.toggleBlockCompletion);
  const addTimeBlock = useTrackerStore((s) => s.addTimeBlock);
  const updateTimeBlock = useTrackerStore((s) => s.updateTimeBlock);
  const deleteTimeBlock = useTrackerStore((s) => s.deleteTimeBlock);
  const resetTimetable = useTrackerStore((s) => s.resetTimetable);
  const startFocusTimer = useTrackerStore((s) => s.startFocusTimer);

  const timetable = useMemo(
    () => (dayType === "college" ? collegeTimetable : noCollegeTimetable),
    [dayType, collegeTimetable, noCollegeTimetable]
  );

  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  const todayStr = getTodayDateString();

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
    (b) => !!completedBlocks[`${todayStr}_${b.id}`]
  ).length;
  const completionPercent = timetable.length
    ? Math.round((completionCount / timetable.length) * 100)
    : 0;

  const handleToggle = (id: string) => {
    const wasCompleted = !!completedBlocks[`${todayStr}_${id}`];
    toggleBlockCompletion(id);
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
      updateTimeBlock(dayType, block as TimeBlock);
    } else {
      addTimeBlock(dayType, block);
    }
  };

  const getBlockStatus = (block: TimeBlock) => {
    const isDone = !!completedBlocks[`${todayStr}_${block.id}`];
    if (isDone) return { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };

    const [sh, sm] = block.startTime.split(":").map(Number);
    const [eh, em] = block.endTime.split(":").map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;

    if (endM < startM) {
      // Midnight block
      if (currentMinutes >= startM || currentMinutes < endM) {
        return { label: "In Progress", color: "text-blue-400 bg-blue-500/15 border-blue-500/30 animate-pulse" };
      }
    } else {
      if (currentMinutes >= startM && currentMinutes < endM) {
        return { label: "In Progress", color: "text-blue-400 bg-blue-500/15 border-blue-500/30 animate-pulse" };
      }
      if (currentMinutes > endM) {
        return { label: "Missed", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      }
    }

    return { label: "Upcoming", color: "text-zinc-500 bg-zinc-800/60 border-zinc-700/40" };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Daily Timetable Schedule</h1>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono">
              {timetable.length} Blocks
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {dayType === "college"
              ? "Template A: College Day (Mon–Sat | College: 9:30 AM – 1:00 PM)"
              : "Template B: No College Day (Full Day Deep Study & Project Development)"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Switcher */}
          <button
            onClick={toggleDayType}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
          >
            {dayType === "college" ? (
              <>
                <GraduationCap className="h-3.5 w-3.5 text-amber-400" /> Switch to No College Day
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5 text-blue-400" /> Switch to College Day
              </>
            )}
          </button>

          {/* Reset Template */}
          <button
            onClick={() => {
              if (confirm(`Reset ${dayType} timetable to default template?`)) {
                resetTimetable(dayType);
              }
            }}
            className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            title="Reset to original template timetable"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Add Block */}
          <button
            onClick={() => {
              setEditingBlock(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm shadow-emerald-950/40"
          >
            <Plus className="h-3.5 w-3.5" /> Add Block
          </button>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <span className="text-[11px] text-zinc-400">Completion Rate</span>
          <p className="text-xl font-extrabold text-white font-mono mt-0.5">{completionPercent}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <span className="text-[11px] text-zinc-400">Completed Blocks</span>
          <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
            {completionCount} / {timetable.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <span className="text-[11px] text-zinc-400">Active Day Template</span>
          <p className="text-sm font-bold text-amber-400 mt-1 capitalize">
            {dayType.replace("-", " ")}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <span className="text-[11px] text-zinc-400">Next Scheduled Milestone</span>
          <p className="text-sm font-bold text-blue-400 mt-1">July 2027 Tech Offer</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0",
              selectedCategory === "all"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white"
            )}
          >
            All Blocks ({timetable.length})
          </button>
          {(["deen", "tech", "college", "health"] as Category[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? `${config.badgeBg} border-current`
                    : "border-transparent text-zinc-400 hover:text-white"
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.accent }} />
                {config.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routine..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Interactive Timeline List */}
      <div className="relative space-y-3 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-800/80">
        {filteredBlocks.map((block) => {
          const isDone = !!completedBlocks[`${todayStr}_${block.id}`];
          const cat = CATEGORY_CONFIG[block.category];
          const status = getBlockStatus(block);

          return (
            <div
              key={block.id}
              className={cn(
                "relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 transition pl-12",
                isDone
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950 hover:border-zinc-700/80"
              )}
            >
              {/* Timeline Checkbox Node */}
              <button
                type="button"
                onClick={() => handleToggle(block.id)}
                aria-label={`Toggle completion for ${block.title}`}
                className={cn(
                  "absolute left-3 top-5 sm:top-1/2 sm:-translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg border transition shadow-sm",
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-700 bg-zinc-900 hover:border-emerald-500 hover:text-emerald-400 text-transparent"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>

              {/* Block Content */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono text-zinc-300">
                    {formatTime12(block.startTime)} – {formatTime12(block.endTime)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.2 text-[10px] font-semibold border",
                      cat.badgeBg
                    )}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.2 text-[10px] font-semibold border",
                      status.color
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <h3
                  className={cn(
                    "text-sm font-bold text-white",
                    isDone && "line-through text-zinc-400"
                  )}
                >
                  {block.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{block.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* Start Focus Timer on this block */}
                <button
                  onClick={() => startFocusTimer(block.id, 25)}
                  className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                  title="Focus 25m on this task"
                >
                  <Play className="h-3 w-3 text-emerald-400" /> Focus
                </button>

                {/* Edit */}
                <button
                  onClick={() => {
                    setEditingBlock(block);
                    setModalOpen(true);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                  title="Edit block"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (confirm(`Delete "${block.title}"?`)) {
                      deleteTimeBlock(dayType, block.id);
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
                  title="Delete block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-xs">
            No routine blocks found matching your query.
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <TimetableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dayType={dayType}
        editingBlock={editingBlock}
        onSave={handleSaveBlock}
      />
    </div>
  );
}
