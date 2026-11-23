"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  GraduationCap,
  Code2,
  Sun,
  Moon,
  Database,
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
  const [, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "offline">("idle");
  const [syncMsg, setSyncMsg] = useState<string>("Local Storage Active");

  const dayType = useTrackerStore((s) => s.dayType);
  const toggleDayType = useTrackerStore((s) => s.toggleDayType);
  const theme = useTrackerStore((s) => s.theme);
  const toggleTheme = useTrackerStore((s) => s.toggleTheme);
  const dsaCount = useTrackerStore((s) => s.dsaCount);
  const sqlCount = useTrackerStore((s) => s.sqlCount);

  // Live Clock effect
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const countdown = getDaysUntilJuly2027();

  const handleManualSync = async () => {
    setSyncStatus("syncing");
    setSyncMsg("Syncing with MongoDB...");
    try {
      const state = useTrackerStore.getState();
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayType: state.dayType,
          dsaCount: state.dsaCount,
          sqlCount: state.sqlCount,
          completedBlocks: state.completedBlocks,
          salahRecords: state.salahRecords,
          weeklyGoals: state.weeklyGoals,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.connected) {
        setSyncStatus("synced");
        setSyncMsg("MongoDB Atlas Synced");
      } else {
        setSyncStatus("offline");
        setSyncMsg("Local Storage Active (Ready for Mongo)");
      }
      setTimeout(() => setSyncStatus("idle"), 4000);
    } catch {
      setSyncStatus("offline");
      setSyncMsg("Local Storage Active");
      setTimeout(() => setSyncStatus("idle"), 4000);
    }
  };

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

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "12:00:00 PM";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 md:px-6 backdrop-blur">
        {/* Left Side: Mobile Menu + Date & Clock */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 lg:hidden hover:bg-zinc-800 transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Date & Live Clock Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/90 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200">
            <div className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 font-mono text-zinc-100 font-semibold tracking-wide">
              <Clock className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* College Day vs No College Day Switch */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1 shadow-inner">
            <button
              onClick={() => {
                if (dayType !== "college") toggleDayType();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                dayType === "college"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="College Day: Mon–Sat (9:30 AM – 1:00 PM)"
            >
              <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">College Day</span>
              <span className="sm:hidden">College</span>
            </button>

            <button
              onClick={() => {
                if (dayType !== "no-college") toggleDayType();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                dayType === "no-college"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="No College Day: Full Day Deep Study & Project Development"
            >
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">No College Day</span>
              <span className="sm:hidden">No College</span>
            </button>
          </div>

          {/* Goal Countdown Badge */}
          <button
            onClick={() => {
              setShowGoalModal(true);
              fireCelebration();
            }}
            className="group hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:border-emerald-500/60 transition shadow-sm"
            title="Click to view target milestones & roadmap"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-white">Goal: Tech Job</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
              {countdown.totalDays}d left
            </span>
          </button>

          {/* MongoDB Cloud Sync Button */}
          <button
            onClick={handleManualSync}
            aria-label="Database sync status"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            title={`Database Status: ${syncMsg}`}
          >
            <Database
              className={`h-3.5 w-3.5 ${
                syncStatus === "syncing"
                  ? "text-blue-400 animate-spin"
                  : syncStatus === "synced"
                  ? "text-emerald-400"
                  : "text-zinc-400"
              }`}
            />
            <span className="hidden md:inline text-[11px] font-medium text-zinc-400">
              {syncStatus === "syncing" ? "Syncing..." : syncStatus === "synced" ? "Synced" : "DB Sync"}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-400" />
            )}
          </button>
        </div>
      </header>

      {/* Goal Countdown Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/60">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Target Tech Job</h3>
                  <p className="text-xs text-zinc-400">Target Date: July 1, 2027</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {countdown.totalDays}
                </span>
                <p className="text-xs text-zinc-400 mt-1">Days Remaining</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <span className="text-2xl font-extrabold text-blue-400 font-mono">
                  {countdown.months}m {countdown.days}d
                </span>
                <p className="text-xs text-zinc-400 mt-1">Months & Days</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2 text-xs">
              <span className="font-semibold text-zinc-200">Current Progress Towards Goal:</span>
              <div className="flex justify-between text-zinc-400">
                <span>DSA Solved:</span>
                <span className="font-medium text-blue-400">{dsaCount} / 150</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>SQL Queries:</span>
                <span className="font-medium text-emerald-400">{sqlCount} / 100</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Core Target:</span>
                <span className="font-medium text-amber-400">Full-Stack SDE Role</span>
              </div>
            </div>

            <p className="text-xs italic text-zinc-400 border-l-2 border-emerald-500 pl-3">
              &quot;Whoever takes a path upon which he seeks knowledge, Allah makes the path to Paradise easy for him.&quot; — Sahih Muslim
            </p>

            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition shadow-lg shadow-emerald-950/40"
            >
              Back to Routine
            </button>
          </div>
        </div>
      )}
    </>
  );
}
