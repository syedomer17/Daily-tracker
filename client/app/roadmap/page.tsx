"use client";

import { useState } from "react";
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  ListTodo,
  Plus,
  Trophy,
  Calendar,
  Trash2,
} from "lucide-react";
import { useTrackerStore } from "@/lib/store";
import { Category } from "@/types";
import { CATEGORY_CONFIG, cn, getDaysUntilJuly2027 } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function RoadmapPage() {
  const milestones = useTrackerStore((s) => s.milestones);
  const toggleMilestoneChecklistItem = useTrackerStore(
    (s) => s.toggleMilestoneChecklistItem
  );
  const weeklyGoals = useTrackerStore((s) => s.weeklyGoals);
  const toggleWeeklyGoal = useTrackerStore((s) => s.toggleWeeklyGoal);
  const addWeeklyGoal = useTrackerStore((s) => s.addWeeklyGoal);
  const deleteWeeklyGoal = useTrackerStore((s) => s.deleteWeeklyGoal);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Category>("tech");
  const [newGoalMetric, setNewGoalMetric] = useState("");

  const countdown = getDaysUntilJuly2027();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addWeeklyGoal({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      completed: false,
      targetMetric: newGoalMetric.trim() || undefined,
      currentMetric: newGoalMetric ? "0" : undefined,
    });
    setNewGoalTitle("");
    setNewGoalMetric("");
  };

  const handleToggleChecklist = (milestoneId: string, checklistId: string) => {
    toggleMilestoneChecklistItem(milestoneId, checklistId);
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
      colors: ["#10b981", "#3b82f6"],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MilestoneIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Career Roadmap & Weekly Focus
            </h1>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400 border border-blue-500/20 font-mono">
              Target: July 2027
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Structured phases from foundation to high-paying tech placement
          </p>
        </div>

        {/* Big Countdown Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 shadow-sm">
          <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-bounce" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
              Placement Target
            </span>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
              {countdown.totalDays} Days Left ({countdown.months} months)
            </span>
          </div>
        </div>
      </div>

      {/* 1. Weekly Focus Checklist */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Weekly Focus Checklist</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {weeklyGoals.filter((g) => g.completed).length} / {weeklyGoals.length} Completed
          </span>
        </div>

        {/* Existing Weekly Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weeklyGoals.map((goal) => {
            const cat = CATEGORY_CONFIG[goal.category];
            return (
              <div
                key={goal.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border p-3 transition text-xs",
                  goal.completed
                    ? "border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5 opacity-80"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                <div
                  onClick={() => toggleWeeklyGoal(goal.id)}
                  className="flex items-start gap-2.5 flex-1 cursor-pointer"
                >
                  <button
                    type="button"
                    aria-label={`Toggle weekly goal: ${goal.title}`}
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                      goal.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    )}
                  >
                    {goal.completed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <div>
                    <span
                      className={cn(
                        "font-semibold text-zinc-800 dark:text-white",
                        goal.completed && "line-through text-zinc-400 dark:text-zinc-500"
                      )}
                    >
                      {goal.title}
                    </span>
                    {goal.targetMetric && (
                      <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Progress: {goal.currentMetric} / {goal.targetMetric}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-bold border", cat.badgeBg)}>
                    {cat.shortLabel}
                  </span>
                  <button
                    onClick={() => deleteWeeklyGoal(goal.id)}
                    className="text-zinc-400 hover:text-rose-500 p-0.5"
                    title="Delete goal"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Weekly Goal Form */}
        <form onSubmit={handleAddGoal} className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap gap-2">
          <input
            type="text"
            required
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Add new weekly objective (e.g. Master React Query hooks)..."
            className="flex-1 min-w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="text"
            value={newGoalMetric}
            onChange={(e) => setNewGoalMetric(e.target.value)}
            placeholder="Metric (e.g. 5 problems)"
            className="w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none"
          />
          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value as Category)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
          >
            <option value="tech">Tech</option>
            <option value="deen">Deen</option>
            <option value="college">College</option>
            <option value="health">Health</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      </div>

      {/* 2. Monthly Milestones Timeline to July 2027 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            Monthly Milestones Timeline
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Phased breakdown to systematically secure an engineering position by July 2027
          </p>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isInProgress = milestone.status === "in-progress";

            return (
              <div
                key={milestone.id}
                className={cn(
                  "rounded-2xl border p-5 shadow-sm transition",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5"
                    : isInProgress
                    ? "border-blue-500/40 bg-white dark:bg-zinc-950/90 ring-1 ring-blue-500/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold font-mono",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isInProgress
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">
                          {milestone.period}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{milestone.phase}</span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">{milestone.title}</h3>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold border capitalize self-start sm:self-center",
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                        : isInProgress
                        ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    {milestone.status.replace("-", " ")}
                  </span>
                </div>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {milestone.description}
                </p>

                {/* Key Skills Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Target Tech:</span>
                  {milestone.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Interactive Checklist within Milestone */}
                <div className="mt-4 space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phase Deliverables:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {milestone.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(milestone.id, item.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2 cursor-pointer transition text-xs",
                          item.done
                            ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <button
                          type="button"
                          aria-label={`Toggle deliverable: ${item.text}`}
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                            item.done
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          )}
                        >
                          {item.done && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        <span className={cn(item.done && "line-through text-zinc-400 dark:text-zinc-500")}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
