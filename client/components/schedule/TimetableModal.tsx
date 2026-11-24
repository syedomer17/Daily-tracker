"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Category, TimeBlock, DayType } from "@/types";
import { CATEGORY_CONFIG } from "@/lib/utils";

export interface TimetableModalProps {
  isOpen?: boolean;
  onClose: () => void;
  dayType?: DayType;
  editingBlock?: TimeBlock | null;
  initialData?: TimeBlock | null;
  onSave: (block: Omit<TimeBlock, "id"> | TimeBlock) => void;
}

function TimetableForm({
  onClose,
  editingBlock,
  initialData,
  onSave,
}: TimetableModalProps) {
  const targetBlock = editingBlock ?? initialData ?? null;
  const [title, setTitle] = useState(targetBlock?.title ?? "");
  const [description, setDescription] = useState(targetBlock?.description ?? "");
  const [startTime, setStartTime] = useState(targetBlock?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(targetBlock?.endTime ?? "10:00");
  const [category, setCategory] = useState<Category>(targetBlock?.category ?? "tech");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    if (targetBlock) {
      onSave({
        ...targetBlock,
        title,
        description,
        startTime,
        endTime,
        category,
      });
    } else {
      onSave({
        title,
        description,
        startTime,
        endTime,
        category,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {editingBlock ? "Edit Time Block" : "Add New Routine Block"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Block Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Trees & Recursion Practice"
              className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Start Time (24h)</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">End Time (24h)</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["deen", "tech", "college", "health"] as Category[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-xl border p-2 text-xs font-semibold transition text-center ${
                      isSelected
                        ? `${config.badgeBg} border-emerald-500 ring-2 ring-emerald-500/30`
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {config.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description / Focus Note</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on Striver SDE sheet Tree problems, avoid phone distractions"
              className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-emerald-950/20"
            >
              {targetBlock ? "Save Changes" : "Create Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TimetableModal(props: TimetableModalProps) {
  if (props.isOpen === false) return null;
  const blockToEdit = props.editingBlock ?? props.initialData ?? null;
  // key remounts the form so its state resets for each add/edit
  return <TimetableForm key={blockToEdit?.id ?? "new"} {...props} />;
}
