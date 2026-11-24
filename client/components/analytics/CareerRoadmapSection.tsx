"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Calendar,
  Edit3,
  Layers,
  Plus,
  Trophy,
} from "lucide-react";
import { Milestone } from "@/types";
import { getDaysUntilJuly2027 } from "@/lib/utils";

interface CareerRoadmapSectionProps {
  milestones: Milestone[];
  lifetimeDsa: number;
  lifetimeSql: number;
  roadmapTargets: {
    dsa: number;
    sql: number;
    projects: number;
    systemDesign: number;
    mockInterviews: number;
  };
  onToggleChecklistItem: (milestoneId: string, checklistId: string) => void;
  onSetRoadmapTarget: (
    key: "dsa" | "sql" | "projects" | "systemDesign" | "mockInterviews",
    target: number
  ) => void;
  onUpdateMilestoneTargetDate: (milestoneId: string, targetDate: string) => void;
  onAddChecklistItem: (milestoneId: string, text: string) => void;
}

export function CareerRoadmapSection({
  milestones,
  lifetimeDsa,
  lifetimeSql,
  roadmapTargets,
  onToggleChecklistItem,
  onSetRoadmapTarget,
  onUpdateMilestoneTargetDate,
  onAddChecklistItem,
}: CareerRoadmapSectionProps) {
  const countdown = getDaysUntilJuly2027();
  const [editingTargets, setEditingTargets] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {/* Target July 2027 Countdown Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-purple-500/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                July 2027 Career Countdown: Target Tech Job
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
              Track multi-year technical trajectory toward Tier-1 Software Engineering roles, campus placements, and startup engineering leadership.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-center min-w-[70px] shadow-sm">
              <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                {countdown.months}
              </span>
              <p className="text-[10px] uppercase font-semibold text-zinc-500">Months</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-center min-w-[70px] shadow-sm">
              <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                {countdown.days}
              </span>
              <p className="text-[10px] uppercase font-semibold text-zinc-500">Days</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-center min-w-[90px] shadow-sm">
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                {countdown.totalDays}
              </span>
              <p className="text-[10px] uppercase font-semibold text-zinc-500">Total Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurable Core Targets */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Core Competency Targets (Configurable)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize quantitative milestones to match evolving placement & job requirements
            </p>
          </div>
          <button
            onClick={() => setEditingTargets(!editingTargets)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {editingTargets ? "Done Editing" : "Configure Targets"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* DSA */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">DSA Questions</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                {lifetimeDsa} / {roadmapTargets.dsa}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {Math.round((lifetimeDsa / roadmapTargets.dsa) * 100)}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (lifetimeDsa / roadmapTargets.dsa) * 100)}%` }}
              />
            </div>
            {editingTargets && (
              <input
                type="number"
                value={roadmapTargets.dsa}
                onChange={(e) => onSetRoadmapTarget("dsa", Number(e.target.value))}
                className="w-full mt-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              />
            )}
          </div>

          {/* SQL */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">SQL Practice</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
                {lifetimeSql} / {roadmapTargets.sql}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {Math.round((lifetimeSql / roadmapTargets.sql) * 100)}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (lifetimeSql / roadmapTargets.sql) * 100)}%` }}
              />
            </div>
            {editingTargets && (
              <input
                type="number"
                value={roadmapTargets.sql}
                onChange={(e) => onSetRoadmapTarget("sql", Number(e.target.value))}
                className="w-full mt-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              />
            )}
          </div>

          {/* Full-Stack Projects */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Full-Stack Projects</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {roadmapTargets.projects} Target
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">Production SaaS with Auth & DB</p>
            {editingTargets && (
              <input
                type="number"
                value={roadmapTargets.projects}
                onChange={(e) => onSetRoadmapTarget("projects", Number(e.target.value))}
                className="w-full mt-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              />
            )}
          </div>

          {/* System Design */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">System Design</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {roadmapTargets.systemDesign} Cases
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">HLD & LLD Architecture</p>
            {editingTargets && (
              <input
                type="number"
                value={roadmapTargets.systemDesign}
                onChange={(e) => onSetRoadmapTarget("systemDesign", Number(e.target.value))}
                className="w-full mt-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              />
            )}
          </div>

          {/* Mock Interviews */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Mock Interviews</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {roadmapTargets.mockInterviews} Rounds
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">Peer & Technical Screens</p>
            {editingTargets && (
              <input
                type="number"
                value={roadmapTargets.mockInterviews}
                onChange={(e) => onSetRoadmapTarget("mockInterviews", Number(e.target.value))}
                className="w-full mt-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sequential Milestone Phases */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-500" />
          Roadmap Milestone Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((m) => {
            const completedCount = m.checklist.filter((c) => c.done).length;
            const totalCount = m.checklist.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {m.phase} • {m.period}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      {m.title}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      m.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : m.status === "in-progress"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {m.description}
                </p>

                {/* Target Date Input / Display */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  <span>Target Date:</span>
                  <input
                    type="date"
                    value={m.targetDate}
                    onChange={(e) => onUpdateMilestoneTargetDate(m.id, e.target.value)}
                    className="rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Checklist */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Milestone Deliverables</span>
                    <span className="font-mono text-zinc-500">{completedCount}/{totalCount} ({percent}%)</span>
                  </div>

                  <div className="space-y-1.5">
                    {m.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => onToggleChecklistItem(m.id, item.id)}
                          className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                        />
                        <span className={item.done ? "line-through text-zinc-400" : ""}>{item.text}</span>
                      </label>
                    ))}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add milestone item..."
                      value={newChecklistText[m.id] || ""}
                      onChange={(e) =>
                        setNewChecklistText({ ...newChecklistText, [m.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newChecklistText[m.id]?.trim()) {
                          onAddChecklistItem(m.id, newChecklistText[m.id].trim());
                          setNewChecklistText({ ...newChecklistText, [m.id]: "" });
                        }
                      }}
                      className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                    <button
                      onClick={() => {
                        if (newChecklistText[m.id]?.trim()) {
                          onAddChecklistItem(m.id, newChecklistText[m.id].trim());
                          setNewChecklistText({ ...newChecklistText, [m.id]: "" });
                        }
                      }}
                      className="rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-1 hover:opacity-90 transition-opacity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
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
