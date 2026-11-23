"use client";

import { useState } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { INSPIRING_QUOTES } from "@/data/timetable";

export function QuoteCard() {
  const [index, setIndex] = useState(0);

  const nextQuote = () => {
    setIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
  };

  const currentQuote = INSPIRING_QUOTES[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-5 shadow-sm transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Quote className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                {currentQuote.tag}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Mindset Reminder</span>
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
              &quot;{currentQuote.text}&quot;
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">— {currentQuote.author}</p>
          </div>
        </div>

        <button
          onClick={nextQuote}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
          title="Shuffle quote"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
