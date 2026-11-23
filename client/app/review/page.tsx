"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  GitBranch,
  GitCommit,
  CheckCircle2,
  Calendar,
  Sparkles,
  Smile,
  Zap,
  GraduationCap,
  Code2,
  Send,
  History,
  AlertTriangle,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { DayType } from "@/types";
import { getTodayDateString, cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function ReviewPage() {
  const dailyReviews = useTrackerStore((s) => s.dailyReviews);
  const saveDailyReview = useTrackerStore((s) => s.saveDailyReview);

  const todayStr = getTodayDateString();

  // Find if review exists for today
  const existingTodayReview = dailyReviews.find((r) => r.date === todayStr);

  const [githubUpdated, setGithubUpdated] = useState(existingTodayReview?.githubUpdated ?? true);
  const [commitsCount, setCommitsCount] = useState<number>(existingTodayReview?.githubCommitsCount ?? 3);
  const [wentWell, setWentWell] = useState(existingTodayReview?.wentWell ?? "");
  const [blockedBy, setBlockedBy] = useState(existingTodayReview?.blockedBy ?? "");
  const [tomorrowPriority, setTomorrowPriority] = useState(existingTodayReview?.tomorrowPriority ?? "");
  const [tomorrowDayType, setTomorrowDayType] = useState<DayType>(existingTodayReview?.tomorrowDayType ?? "college");
  const [moodScore, setMoodScore] = useState<number>(existingTodayReview?.moodScore ?? 5);
  const [energyScore, setEnergyScore] = useState<number>(existingTodayReview?.energyScore ?? 4);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData = {
      date: todayStr,
      githubUpdated,
      githubCommitsCount: commitsCount,
      wentWell: wentWell.trim() || "Consistently showed up and maintained routine.",
      blockedBy: blockedBy.trim() || "None - smooth day alhamdulillah.",
      tomorrowPriority: tomorrowPriority.trim() || "Stay consistent with morning Fajr & DSA study block.",
      tomorrowDayType,
      moodScore,
      energyScore,
    };

    saveDailyReview(reviewData);

    // Also sync to MongoDB API
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
    } catch {
      // Offline fallback
    }

    setSavedSuccess(true);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b"],
    });

    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Daily Review & Nightly Reflection</h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 border border-emerald-500/20 font-mono">
              9:00 PM – 9:30 PM Slot
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Close your loops, verify GitHub commits, record learnings, and prepare tomorrow&apos;s mindset
          </p>
        </div>

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="h-4 w-4" /> Review Saved & Tomorrow Pre-Configured!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Review Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 md:p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. GitHub Updated Toggle */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-white">
                  <GitBranch className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">GitHub Pushed Today?</h3>
                  <p className="text-[11px] text-zinc-400">Keep your contribution streak green</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {githubUpdated && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-400">Commits:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={commitsCount}
                      onChange={(e) => setCommitsCount(Number(e.target.value))}
                      className="w-14 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setGithubUpdated(!githubUpdated)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition border",
                    githubUpdated
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}
                >
                  {githubUpdated ? "✓ Yes, Pushed" : "Not Yet"}
                </button>
              </div>
            </div>

            {/* 2. What Went Well Today? */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                What went well today? (Wins, breakthroughs, concepts understood)
              </label>
              <textarea
                rows={3}
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="e.g. Solved 2 LeetCode Tree problems with clean recursive approach. Finished Sheryians React routing section alhamdulillah."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 3. What Blocked Me? */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                What blocked me or wasted time?
              </label>
              <textarea
                rows={2}
                value={blockedBy}
                onChange={(e) => setBlockedBy(e.target.value)}
                placeholder="e.g. Got stuck debugging a Next.js middleware issue for 45 min; need to read docs first before brute forcing."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 4. Pre-set Tomorrow's Day Type */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Pre-set Tomorrow&apos;s Schedule Template:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTomorrowDayType("college")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition",
                    tomorrowDayType === "college"
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  )}
                >
                  <GraduationCap className="h-4 w-4 text-amber-400" /> College Day (Mon–Sat)
                </button>
                <button
                  type="button"
                  onClick={() => setTomorrowDayType("no-college")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition",
                    tomorrowDayType === "no-college"
                      ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  )}
                >
                  <Code2 className="h-4 w-4 text-blue-400" /> No College Day (Full Focus)
                </button>
              </div>
            </div>

            {/* 5. Tomorrow's #1 Priority */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block">
                Tomorrow&apos;s Non-Negotiable #1 Priority:
              </label>
              <input
                type="text"
                value={tomorrowPriority}
                onChange={(e) => setTomorrowPriority(e.target.value)}
                placeholder="e.g. Wake up at 4:45 AM for Tahajjud + Finish LeetCode 102 & 104 before college"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* 6. Mood & Energy Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Smile className="h-3.5 w-3.5 text-amber-400" /> Mood Score
                  </span>
                  <span className="font-bold text-amber-400 font-mono">{moodScore} / 5</span>
                </div>
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMoodScore(val)}
                      className={cn(
                        "h-8 flex-1 rounded-lg border text-xs font-bold transition",
                        moodScore === val
                          ? "border-amber-500 bg-amber-500/20 text-amber-300"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white"
                      )}
                    >
                      {val === 5 ? "⚡ 5" : val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" /> Energy Level
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">{energyScore} / 5</span>
                </div>
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEnergyScore(val)}
                      className={cn(
                        "h-8 flex-1 rounded-lg border text-xs font-bold transition",
                        energyScore === val
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white"
                      )}
                    >
                      {val === 5 ? "🔥 5" : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-lg shadow-emerald-950/40"
            >
              <Send className="h-3.5 w-3.5" /> Save Nightly Review & Lock Intention
            </button>
          </form>
        </div>

        {/* Previous Reviews History (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Review History & Reflections</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Past logs documenting your journey towards spiritual growth and career mastery
          </p>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {dailyReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2 font-mono text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rev.githubUpdated && (
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300 font-mono">
                        <GitCommit className="h-2.5 w-2.5 text-emerald-400" /> {rev.githubCommitsCount || 1} commits
                      </span>
                    )}
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] text-emerald-400 font-bold">
                      Mood {rev.moodScore}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 block">Wins:</span>
                  <p className="text-zinc-300 leading-relaxed">{rev.wentWell}</p>
                </div>

                {rev.blockedBy && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-amber-400 block">Blockers:</span>
                    <p className="text-zinc-400 leading-relaxed">{rev.blockedBy}</p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-zinc-800/80 flex justify-between text-[11px] text-zinc-400">
                  <span>Priority: {rev.tomorrowPriority}</span>
                  <span className="capitalize text-zinc-500">{rev.tomorrowDayType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
