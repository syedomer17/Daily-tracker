"use client";

import { useState, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { TimeBlock } from "@/types";
import { CATEGORY_CONFIG, formatTime12, cn, getTodayDateString } from "@/lib/utils";
import confetti from "canvas-confetti";

export function ActiveBlockCard() {
  const dayType = useTrackerStore((s) => s.dayType);
  const collegeTimetable = useTrackerStore((s) => s.collegeTimetable);
  const noCollegeTimetable = useTrackerStore((s) => s.noCollegeTimetable);
  const completedBlocks = useTrackerStore((s) => s.completedBlocks);
  const toggleBlockCompletion = useTrackerStore((s) => s.toggleBlockCompletion);
  const focusTimer = useTrackerStore((s) => s.focusTimer);
  const startFocusTimer = useTrackerStore((s) => s.startFocusTimer);
  const pauseFocusTimer = useTrackerStore((s) => s.pauseFocusTimer);
  const resumeFocusTimer = useTrackerStore((s) => s.resumeFocusTimer);
  const resetFocusTimer = useTrackerStore((s) => s.resetFocusTimer);
  const addFiveMinutes = useTrackerStore((s) => s.addFiveMinutes);
  const simulatedTime = useTrackerStore((s) => s.simulatedTime);
  const setSimulatedTime = useTrackerStore((s) => s.setSimulatedTime);

  const timetable = useMemo(
    () => (dayType === "college" ? collegeTimetable : noCollegeTimetable),
    [dayType, collegeTimetable, noCollegeTimetable]
  );

  const [selectedBlockId] = useState<string | null>(null);
  const [showScrubber, setShowScrubber] = useState(false);

  const todayStr = getTodayDateString();

  // Find active block based on simulated time or current local time
  const { activeBlock, progressPercent } = useMemo(() => {
    let nowMinutes: number;
    if (simulatedTime) {
      const [sh, sm] = simulatedTime.split(":").map(Number);
      nowMinutes = sh * 60 + sm;
    } else {
      const now = new Date();
      nowMinutes = now.getHours() * 60 + now.getMinutes();
    }

    let foundBlock: TimeBlock | null = null;
    let percent = 0;

    for (const b of timetable) {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      const startM = sh * 60 + sm;
      const endM = eh * 60 + em;

      if (endM < startM) {
        // Wraps midnight (e.g. 21:30 to 04:45)
        if (nowMinutes >= startM || nowMinutes < endM) {
          foundBlock = b;
          const totalDur = (24 * 60 - startM) + endM;
          const elapsed = nowMinutes >= startM ? nowMinutes - startM : (24 * 60 - startM) + nowMinutes;
          percent = Math.min(100, Math.round((elapsed / totalDur) * 100));
          break;
        }
      } else {
        if (nowMinutes >= startM && nowMinutes < endM) {
          foundBlock = b;
          const totalDur = endM - startM;
          const elapsed = nowMinutes - startM;
          percent = Math.min(100, Math.round((elapsed / totalDur) * 100));
          break;
        }
      }
    }

    // Fallback if between gaps or early morning
    if (!foundBlock && timetable.length > 0) {
      foundBlock = timetable[0];
      percent = 0;
    }

    return { activeBlock: foundBlock, progressPercent: percent };
  }, [timetable, simulatedTime]);

  const displayedBlock = useMemo(() => {
    if (selectedBlockId) {
      const found = timetable.find((b) => b.id === selectedBlockId);
      if (found) return found;
    }
    return activeBlock || timetable[0];
  }, [selectedBlockId, timetable, activeBlock]);

  if (!displayedBlock) return null;

  const isCompleted = !!completedBlocks[`${todayStr}_${displayedBlock.id}`];
  const catConfig = CATEGORY_CONFIG[displayedBlock.category];

  // Timer formatted mm:ss
  const minutes = Math.floor(focusTimer.remainingSeconds / 60);
  const seconds = focusTimer.remainingSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleComplete = () => {
    toggleBlockCompletion(displayedBlock.id);
    if (!isCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#3b82f6", "#14b8a6"],
      });
    }
  };

  const handleStartTimer = () => {
    if (focusTimer.activeBlockId !== displayedBlock.id) {
      startFocusTimer(displayedBlock.id, 25);
    } else if (!focusTimer.isRunning) {
      resumeFocusTimer();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-zinc-950 dark:to-zinc-900/90 p-5 md:p-6 shadow-sm dark:shadow-xl backdrop-blur transition-colors duration-200">
      {/* Decorative Top Accent Glow */}
      <div
        className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-15 dark:opacity-20 pointer-events-none"
        style={{ backgroundColor: catConfig.accent }}
      />

      {/* Top Banner: Status + Category + Time Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
            {selectedBlockId && selectedBlockId !== activeBlock?.id ? "Inspecting Block" : "Current Routine Block"}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border flex items-center gap-1",
              catConfig.badgeBg
            )}
          >
            {catConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Time Scrubber Toggle */}
          <button
            onClick={() => setShowScrubber(!showScrubber)}
            className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 px-2 py-1 transition"
            title="Preview routine at any hour"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{simulatedTime ? `Time: ${simulatedTime}` : "Live Mode"}</span>
          </button>

          {simulatedTime && (
            <button
              onClick={() => setSimulatedTime(null)}
              className="text-[10px] text-rose-500 dark:text-rose-400 hover:underline"
            >
              Reset Live
            </button>
          )}
        </div>
      </div>

      {/* Time scrubber dropdown if open */}
      {showScrubber && (
        <div className="my-3 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Jump to hour:</span>
          {["05:00", "07:30", "10:00", "13:30", "16:30", "19:15", "21:15"].map((t) => (
            <button
              key={t}
              onClick={() => setSimulatedTime(t)}
              className={cn(
                "rounded-md px-2 py-1 font-mono transition",
                simulatedTime === t
                  ? "bg-emerald-500 text-white font-bold"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Main Block Info & Focus Timer Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Block Title, Timings, Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>
              {formatTime12(displayedBlock.startTime)} – {formatTime12(displayedBlock.endTime)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span>
              {displayedBlock.startTime} to {displayedBlock.endTime} (24h)
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            {displayedBlock.title}
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            )}
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {displayedBlock.description}
          </p>

          {/* Block Time Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Block Timeline Progress</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: catConfig.accent,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Focus Timer & Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/70 p-4 space-y-3 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Focus Deep Work Timer</span>
          </div>

          {/* Digital Timer Display */}
          <div className="font-mono text-3xl md:text-4xl font-extrabold tracking-wider text-zinc-900 dark:text-white">
            {formattedTimer}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            {focusTimer.isRunning ? (
              <button
                onClick={pauseFocusTimer}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition"
              >
                <Pause className="h-3.5 w-3.5" /> Pause
              </button>
            ) : (
              <button
                onClick={handleStartTimer}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
              >
                <Play className="h-3.5 w-3.5" /> Start 25m
              </button>
            )}

            <button
              onClick={addFiveMinutes}
              className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm"
              title="Add 5 minutes"
            >
              <Plus className="h-3.5 w-3.5" /> 5m
            </button>

            <button
              onClick={resetFocusTimer}
              className="flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
              title="Reset Timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mark Complete Big Button */}
          <button
            onClick={handleComplete}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-semibold transition shadow-md",
              isCompleted
                ? "border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                : "border border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/20"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? "Mark as Incomplete" : "Mark Block Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
