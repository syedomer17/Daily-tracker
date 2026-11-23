"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Category, TimeBlock, DayType } from "@/types";
import { CATEGORY_CONFIG } from "@/lib/utils";

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayType: DayType;
  editingBlock: TimeBlock | null;
  onSave: (block: Omit<TimeBlock, "id"> | TimeBlock) => void;
}

export function TimetableModal({
  isOpen,
  onClose,
  editingBlock,
  onSave,
}: TimetableModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState<Category>("tech");

  useEffect(() => {
    if (editingBlock) {
      setTitle(editingBlock.title);
      setDescription(editingBlock.description);
      setStartTime(editingBlock.startTime);
      setEndTime(editingBlock.endTime);
      setCategory(editingBlock.category);
    } else {
      setTitle("");
      setDescription("");
      setStartTime("09:00");
      setEndTime("10:00");
      setCategory("tech");
    }
  }, [editingBlock, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    if (editingBlock) {
      onSave({
        ...editingBlock,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-base font-bold text-white">
            {editingBlock ? "Edit Time Block" : "Add New Routine Block"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Block Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Trees & Recursion Practice"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300">Start Time (24h)</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">End Time (24h)</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Category</label>
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
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {config.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Description / Focus Note</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on Striver SDE sheet Tree problems, avoid phone distractions"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-emerald-950/40"
            >
              {editingBlock ? "Save Changes" : "Create Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
