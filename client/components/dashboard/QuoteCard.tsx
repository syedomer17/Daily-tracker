"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { INSPIRING_QUOTES } from "@/data/timetable";

const ROTATE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function QuoteCard() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const nextQuote = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
      setFade(true);
    }, 150);
  }, []);

  const prevQuote = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + INSPIRING_QUOTES.length) % INSPIRING_QUOTES.length);
      setFade(true);
    }, 150);
  }, []);

  // Automatic quote rotation every 2 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      nextQuote();
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [nextQuote]);

  const currentQuote = INSPIRING_QUOTES[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-900/90 dark:to-zinc-950 p-4 sm:p-5 shadow-sm transition-all duration-300">
      {/* Top Subtle Animated Accent Bar (cycles every 2 mins) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          key={index}
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 animate-quote-progress"
          style={{
            animationDuration: `${ROTATE_INTERVAL_MS}ms`,
            animationTimingFunction: "linear",
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        {/* Left Side: Icon & Content */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
            <Quote className="h-4 w-4" />
          </div>

          <div
            className={`min-w-0 flex-1 space-y-1.5 transition-opacity duration-200 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Header tags & meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                {currentQuote.tag}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Mindset Reminder
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 ml-auto sm:ml-0">
                {index + 1} of {INSPIRING_QUOTES.length}
              </span>
            </div>

            {/* Quote Text */}
            <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed italic break-words">
              &quot;{currentQuote.text}&quot;
            </p>

            {/* Author */}
            <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* Right Side: Navigation & Shuffle Controls */}
        <div className="flex items-center justify-end gap-1 shrink-0 self-end sm:self-start pt-1 sm:pt-0">
          <button
            onClick={prevQuote}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
            title="Previous reminder"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={nextQuote}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
            title="Next reminder"
            aria-label="Next quote"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={nextQuote}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition shadow-sm ml-1"
            title="Shuffle (auto-rotates every 2 mins)"
            aria-label="Shuffle reminder"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
