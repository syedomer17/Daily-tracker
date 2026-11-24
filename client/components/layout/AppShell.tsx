"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useTrackerStore } from "@/lib/store";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { toast } from "@/lib/toast";
import { Sparkles, X, Database } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, data: session } = useSession();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [legacyClaimAvailable, setLegacyClaimAvailable] = useState(false);
  const [legacyClaimLoading, setLegacyClaimLoading] = useState(false);

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasHydratedRef = useRef(false);

  // false on the server, true on the client: avoids a hydration mismatch
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

  // Protect client dashboard: redirect unauthenticated users to /login
  useEffect(() => {
    if (pathname === "/login") return;
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  // Check for available legacy unassigned data to claim
  useEffect(() => {
    if (status !== "authenticated" || pathname === "/login") return;

    async function checkLegacyData() {
      try {
        const res = await fetch("/api/migration/claim-legacy");
        const json = await res.json();
        if (json.success && json.availableToClaim) {
          setLegacyClaimAvailable(true);
        }
      } catch {
        // Silently skip if network or DB issue
      }
    }

    checkLegacyData();
  }, [status, pathname]);

  // Initial fetch from MongoDB to hydrate real user cloud state
  useEffect(() => {
    if (status !== "authenticated" || pathname === "/login") return;

    let isCancelled = false;

    async function loadCloudState() {
      try {
        const res = await fetch("/api/sync");
        const json = await res.json();
        if (isCancelled) return;

        if (json.connected && json.data) {
          useTrackerStore.getState().hydrateFromCloud(json.data);
          hasHydratedRef.current = true;
          toast.info("Account Synced", "Your personal data loaded securely from MongoDB");
        } else if (json.connected && !json.data) {
          // Initialize user's private cloud record with current state
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
          toast.success("Storage Initialized", "Your personal cloud vault is now active");
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
  }, [status, pathname]);

  // Debounced background auto-sync to MongoDB Atlas whenever user state changes
  useEffect(() => {
    if (status !== "authenticated" || pathname === "/login") return;

    const unsub = useTrackerStore.subscribe((state, prevState) => {
      if (!hasHydratedRef.current) return;

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
        state.milestones !== prevState.milestones ||
        state.dailyRecords !== prevState.dailyRecords ||
        state.dayTypeByDate !== prevState.dayTypeByDate;

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
              dailyRecords: state.dailyRecords,
              dayTypeByDate: state.dayTypeByDate,
              version: state.syncVersion,
              updatedAt: new Date().toISOString(),
            }),
          });

          const resJson = await res.json();
          if (resJson.connected) {
            toast.success("Progress Saved", "Securely stored in your personal account");
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
  }, [status, pathname]);

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "deen-dunya-storage-v4" && e.newValue) {
        try {
          useTrackerStore.persist.rehydrate();
        } catch (err) {
          console.error("Failed to rehydrate from cross-tab storage change:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Offline / Online resilience & recovery
  useEffect(() => {
    const handleOnline = async () => {
      toast.info("Back Online", "Syncing pending changes with personal account...");
      const state = useTrackerStore.getState();
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
            dailyRecords: state.dailyRecords,
            dayTypeByDate: state.dayTypeByDate,
            version: state.syncVersion,
            updatedAt: new Date().toISOString(),
          }),
        });
        const resJson = await res.json();
        if (resJson.connected) {
          toast.success("Synchronized", "All updates safely backed up to MongoDB");
        }
      } catch {
        // Silently retain in local storage
      }
    };

    const handleOffline = () => {
      toast.warning("Offline Mode", "Working offline - changes will sync automatically once reconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Periodic Midnight Rollover check (Asia/Kolkata)
  useEffect(() => {
    const checkMidnight = () => {
      const rolledOver = useTrackerStore.getState().checkMidnightRollover();
      if (rolledOver) {
        toast.info("New Day", "Timetable refreshed for Asia/Kolkata midnight");
      }
    };

    // Run check immediately
    checkMidnight();

    // Check every minute
    const interval = setInterval(checkMidnight, 60000);

    // Also check on window focus and visibility change (e.g. laptop opened next morning)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkMidnight();
      }
    };

    window.addEventListener("focus", checkMidnight);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkMidnight);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Tick the focus timer every second if running
  useEffect(() => {
    const interval = setInterval(() => {
      useTrackerStore.getState().tickFocusTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimLegacy = async () => {
    try {
      setLegacyClaimLoading(true);
      const res = await fetch("/api/migration/claim-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const json = await res.json();
      if (json.success && json.claimed) {
        if (json.data) {
          useTrackerStore.getState().hydrateFromCloud(json.data);
        }
        setLegacyClaimAvailable(false);
        toast.success("Progress Claimed!", "Your previous progress has been migrated to your account.");
      } else {
        toast.error("Claim Failed", json.error || "Could not claim legacy records");
      }
    } catch {
      toast.error("Claim Error", "An error occurred while claiming legacy records");
    } finally {
      setLegacyClaimLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Loading DeenSync...</span>
        </div>
      </div>
    );
  }

  // If on login route, render standalone without dashboard frame
  if (pathname === "/login") {
    return (
      <>
        <ToastContainer />
        {children}
      </>
    );
  }

  // If session is loading, show auth verification splash
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, return null while redirecting to avoid private data flash
  if (status === "unauthenticated") {
    return null;
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

        {/* Legacy Data Migration Claim Banner */}
        {legacyClaimAvailable && (
          <div className="mx-4 mt-4 md:mx-6 lg:mx-8 rounded-2xl border border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/40 p-4 backdrop-blur shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-900/20 shrink-0">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Unclaimed Legacy Progress Detected</span>
                    <span className="rounded bg-emerald-200 dark:bg-emerald-900/80 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-300">
                      Migration Available
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Found saved progress from previous tracker version. Claim this data to import it permanently into your account ({session?.user?.email}).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={handleClaimLegacy}
                  disabled={legacyClaimLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{legacyClaimLoading ? "Migrating..." : "Claim to My Account"}</span>
                </button>
                <button
                  onClick={() => setLegacyClaimAvailable(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
