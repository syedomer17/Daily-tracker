"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  GraduationCap,
  Code2,
  Sun,
  Moon,
  Menu,
  Trophy,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { getDaysUntilJuly2027 } from "@/lib/utils";
import confetti from "canvas-confetti";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(() => new Date());
  const [showGoalModal, setShowGoalModal] = useState(false);

  const dayType = useTrackerStore((s) => s.dayType);
  const toggleDayType = useTrackerStore((s) => s.toggleDayType);
  const theme = useTrackerStore((s) => s.theme);
  const toggleTheme = useTrackerStore((s) => s.toggleTheme);
  const dsaCount = useTrackerStore((s) => s.dsaCount);
  const sqlCount = useTrackerStore((s) => s.sqlCount);

  // Live Clock effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const countdown = getDaysUntilJuly2027();

  const fireCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
    });
  };

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Mon, Nov 23";

  const formattedTimeFull = currentTime
    ? currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "12:00:00 PM";

  const formattedTimeCompact = currentTime
    ? currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "12:00 PM";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 px-3 sm:px-4 md:px-6 backdrop-blur transition-colors duration-200">
        {/* Left Side: Mobile Menu + Date & Clock */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 lg:hidden hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Date & Live Clock Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-zinc-100/90 dark:bg-zinc-900/60 px-2.5 sm:px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 transition-colors">
            {/* Date: Hidden on tiny screens, short on sm, full on md+ */}
            <div className="hidden sm:flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{formattedDate}</span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
            </div>

            {/* Time: Compact on mobile, full with seconds on md+ */}
            <div className="flex items-center gap-1.5 font-mono text-zinc-900 dark:text-zinc-100 font-semibold tracking-wide shrink-0">
              <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
              <span className="hidden md:inline">{formattedTimeFull}</span>
              <span className="md:hidden">{formattedTimeCompact}</span>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* College Day vs No College Day Switch */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 p-0.5 sm:p-1 shadow-inner transition-colors">
            <button
              onClick={() => {
                if (dayType !== "college") toggleDayType();
              }}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-medium transition ${
                dayType === "college"
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="College Day: Mon–Sat (9:30 AM – 1:00 PM)"
            >
              <GraduationCap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="hidden md:inline">College Day</span>
              <span className="md:hidden hidden xs:inline">College</span>
            </button>

            <button
              onClick={() => {
                if (dayType !== "no-college") toggleDayType();
              }}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-medium transition ${
                dayType === "no-college"
                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="No College Day: Full Day Deep Study & Project Development"
            >
              <Code2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="hidden md:inline">No College Day</span>
              <span className="md:hidden hidden xs:inline">Study</span>
            </button>
          </div>

          {/* Goal Countdown Badge - Visible on all screen sizes with clear dark mode contrast */}
          <button
            onClick={() => {
              setShowGoalModal(true);
              fireCelebration();
            }}
            className="group flex items-center gap-1.5 sm:gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/90 px-2 sm:px-3 py-1.5 text-xs text-emerald-900 dark:text-emerald-100 transition shadow-sm"
            title="Click to view target milestones & roadmap"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-semibold text-emerald-950 dark:text-emerald-100 hidden sm:inline">
              Goal: Tech Job
            </span>
            <span className="rounded bg-emerald-200/80 dark:bg-emerald-900 px-1.5 py-0.5 text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-200 border border-emerald-400/50 dark:border-emerald-700/60">
              {countdown.totalDays}d<span className="hidden md:inline"> left</span>
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-600" />
            )}
          </button>
        </div>
      </header>

      {/* Goal Countdown Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/40">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Target Tech Job</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Target Date: July 1, 2027</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 text-center">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {countdown.totalDays}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Days Remaining</p>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 text-center">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {countdown.months}m {countdown.days}d
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Months & Days</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 p-3 space-y-2 text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Current Progress Towards Goal:</span>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>DSA Solved:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{dsaCount} / 150</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>SQL Queries:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{sqlCount} / 100</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Core Target:</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">Full-Stack SDE Role</span>
              </div>
            </div>

            <p className="text-xs italic text-zinc-600 dark:text-zinc-400 border-l-2 border-emerald-500 pl-3">
              &quot;Whoever takes a path upon which he seeks knowledge, Allah makes the path to Paradise easy for him.&quot; — Sahih Muslim
            </p>

            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition shadow-lg shadow-emerald-950/20"
            >
              Back to Routine
            </button>
          </div>
        </div>
      )}
    </>
  );
}
