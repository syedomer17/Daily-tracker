"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useTrackerStore } from "@/lib/store";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { toast } from "@/lib/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasHydratedRef = useRef(false);

  // false on the server, true on the client: avoids a hydration mismatch without a setState-in-effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const theme = useTrackerStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Initial fetch from MongoDB to hydrate real cloud state
  useEffect(() => {
    let isCancelled = false;

    async function loadCloudState() {
      try {
        const res = await fetch("/api/sync");
        const json = await res.json();
        if (isCancelled) return;

        if (json.connected && json.data) {
          useTrackerStore.getState().hydrateFromCloud(json.data);
          hasHydratedRef.current = true;
          toast.info("Database Connected", "Routine synced with MongoDB Atlas");
        } else if (json.connected && !json.data) {
          // Initialize MongoDB with current local real state
          const state = useTrackerStore.getState();
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dayType: state.dayType,
              dsaCount: state.dsaCount,
              sqlCount: state.sqlCount,
              deepWorkMinutesToday: state.deepWorkMinutesToday,
              completedBlocks: state.completedBlocks,
              salahRecords: state.salahRecords,
              habitLogs: state.habitLogs,
              dailyReviews: state.dailyReviews,
              weeklyGoals: state.weeklyGoals,
              milestones: state.milestones,
              updatedAt: new Date().toISOString(),
            }),
          });
          hasHydratedRef.current = true;
          toast.success("Database Initialized", "Your routine is now tracking to MongoDB Atlas");
        } else {
          hasHydratedRef.current = true;
        }
      } catch {
        hasHydratedRef.current = true;
      }
    }

    loadCloudState();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Debounced background auto-sync to MongoDB Atlas whenever user state changes
  useEffect(() => {
    const unsub = useTrackerStore.subscribe((state, prevState) => {
      // Don't auto-save before initial hydration completes to prevent race overwriting cloud data
      if (!hasHydratedRef.current) return;

      // Only sync when meaningful tracked data changed (not ticks or UI theme)
      const hasChanged =
        state.completedBlocks !== prevState.completedBlocks ||
        state.salahRecords !== prevState.salahRecords ||
        state.dsaCount !== prevState.dsaCount ||
        state.sqlCount !== prevState.sqlCount ||
        state.deepWorkMinutesToday !== prevState.deepWorkMinutesToday ||
        state.habitLogs !== prevState.habitLogs ||
        state.dailyReviews !== prevState.dailyReviews ||
        state.dayType !== prevState.dayType ||
        state.weeklyGoals !== prevState.weeklyGoals ||
        state.milestones !== prevState.milestones;

      if (!hasChanged) return;

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      syncTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dayType: state.dayType,
              dsaCount: state.dsaCount,
              sqlCount: state.sqlCount,
              deepWorkMinutesToday: state.deepWorkMinutesToday,
              completedBlocks: state.completedBlocks,
              salahRecords: state.salahRecords,
              habitLogs: state.habitLogs,
              dailyReviews: state.dailyReviews,
              weeklyGoals: state.weeklyGoals,
              milestones: state.milestones,
              updatedAt: new Date().toISOString(),
            }),
          });

          const resJson = await res.json();
          if (resJson.connected) {
            toast.success("Progress Saved", "Synced with MongoDB Atlas");
          } else {
            toast.info("Saved Locally", "Saved in browser storage");
          }
        } catch {
          toast.info("Saved Locally", "Saved in browser storage");
        }
      }, 800);
    });

    return () => {
      unsub();
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  // Tick the focus timer every second if running
  useEffect(() => {
    const interval = setInterval(() => {
      useTrackerStore.getState().tickFocusTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch on initial mount
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Loading Deen & Dunya Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Toast Notifications Stack */}
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
