import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DayType,
  TimeBlock,
  SalahName,
  SalahStatus,
  HabitLog,
  DailyReview,
  Milestone,
  WeeklyGoal,
} from "@/types";
import {
  COLLEGE_DAY_TIMETABLE,
  NO_COLLEGE_DAY_TIMETABLE,
  INITIAL_MILESTONES,
  INITIAL_WEEKLY_GOALS,
} from "@/data/timetable";
import { getTodayDateString } from "@/lib/utils";

interface TrackerState {
  // Date & Day Type
  todayDate: string;
  dayType: DayType;
  theme: "dark" | "light";

  // Timetable
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];
  completedBlocks: Record<string, boolean>; // key: `${date}_${blockId}`

  // Salah Tracker (date -> status)
  salahRecords: Record<string, SalahStatus>;

  // Career Goal Counters
  dsaCount: number;
  sqlCount: number;
  deepWorkMinutesToday: number;

  // Habits
  habitLogs: HabitLog[];

  // Roadmaps & Weekly Focus
  weeklyGoals: WeeklyGoal[];
  milestones: Milestone[];

  // Daily Reviews
  dailyReviews: DailyReview[];

  // Focus Timer
  focusTimer: {
    activeBlockId: string | null;
    isRunning: boolean;
    remainingSeconds: number;
    initialSeconds: number;
    mode: "countdown" | "stopwatch";
    endsAt: number | null; // epoch ms while running; timer derives remaining time from this
  };
  deepWorkDate: string;

  // Simulated Time (for previewing active blocks at any hour)
  simulatedTime: string | null; // e.g. "10:15" or null for live clock

  // Actions
  setDayType: (type: DayType) => void;
  toggleDayType: () => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  // Timetable Actions
  toggleBlockCompletion: (blockId: string, date?: string) => void;
  addTimeBlock: (dayType: DayType, block: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (dayType: DayType, block: TimeBlock) => void;
  deleteTimeBlock: (dayType: DayType, blockId: string) => void;
  resetTimetable: (dayType: DayType) => void;

  // Salah Actions
  toggleSalah: (salah: SalahName, date?: string) => void;

  // Counter Actions
  incrementDsa: (delta?: number) => void;
  decrementDsa: (delta?: number) => void;
  setDsa: (val: number) => void;
  incrementSql: (delta?: number) => void;
  decrementSql: (delta?: number) => void;
  setSql: (val: number) => void;
  addDeepWorkMinutes: (minutes: number) => void;

  // Habit Actions
  toggleHabit: (date: string, habitKey: keyof Omit<HabitLog, "date" | "completionRate" | "notes">) => void;

  // Weekly Goal Actions
  toggleWeeklyGoal: (goalId: string) => void;
  addWeeklyGoal: (goal: Omit<WeeklyGoal, "id">) => void;
  deleteWeeklyGoal: (goalId: string) => void;

  // Milestone Actions
  toggleMilestoneChecklistItem: (milestoneId: string, checklistId: string) => void;

  // Review Actions
  saveDailyReview: (review: Omit<DailyReview, "id" | "createdAt">) => void;

  // Focus Timer Actions
  startFocusTimer: (blockId: string, durationMinutes?: number) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  resetFocusTimer: () => void;
  tickFocusTimer: () => void;
  addFiveMinutes: () => void;

  // Simulation
  setSimulatedTime: (time: string | null) => void;

  // Active timetable selector
  getActiveTimetable: () => TimeBlock[];
  getCompletionPercentage: (date?: string) => number;
  getSalahForDate: (date?: string) => SalahStatus;
  getDeenDunyaSplit: () => { deenHours: number; dunyaHours: number; deenPercent: number; dunyaPercent: number };

  // MongoDB Cloud Hydration
  hydrateFromCloud: (data: Partial<TrackerState>) => void;
}

const DEFAULT_SALAH_STATUS: SalahStatus = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      todayDate: getTodayDateString(),
      dayType: "college",
      theme: "dark",

      collegeTimetable: COLLEGE_DAY_TIMETABLE,
      noCollegeTimetable: NO_COLLEGE_DAY_TIMETABLE,
      completedBlocks: {},

      salahRecords: {},

      dsaCount: 0,
      sqlCount: 0,
      deepWorkMinutesToday: 0,
      deepWorkDate: getTodayDateString(),

      habitLogs: [],
      weeklyGoals: INITIAL_WEEKLY_GOALS,
      milestones: INITIAL_MILESTONES,
      dailyReviews: [],

      focusTimer: {
        activeBlockId: null,
        isRunning: false,
        remainingSeconds: 25 * 60,
        initialSeconds: 25 * 60,
        mode: "countdown",
        endsAt: null,
      },

      simulatedTime: null,

      setDayType: (type) => set({ dayType: type }),
      toggleDayType: () =>
        set((state) => ({
          dayType: state.dayType === "college" ? "no-college" : "college",
        })),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined") {
            if (next === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { theme: next };
        }),

      toggleBlockCompletion: (blockId, customDate) => {
        const date = customDate || get().todayDate;
        const key = `${date}_${blockId}`;
        set((state) => {
          const current = !!state.completedBlocks[key];
          const newCompleted = { ...state.completedBlocks, [key]: !current };
          return { completedBlocks: newCompleted };
        });
      },

      addTimeBlock: (dayType, block) => {
        const newBlock: TimeBlock = {
          ...block,
          id: `custom-${Date.now()}`,
        };
        set((state) => {
          if (dayType === "college") {
            const list = [...state.collegeTimetable, newBlock].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
            return { collegeTimetable: list };
          } else {
            const list = [...state.noCollegeTimetable, newBlock].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
            return { noCollegeTimetable: list };
          }
        });
      },

      updateTimeBlock: (dayType, updated) => {
        set((state) => {
          if (dayType === "college") {
            return {
              collegeTimetable: state.collegeTimetable
                .map((b) => (b.id === updated.id ? updated : b))
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
            };
          } else {
            return {
              noCollegeTimetable: state.noCollegeTimetable
                .map((b) => (b.id === updated.id ? updated : b))
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
            };
          }
        });
      },

      deleteTimeBlock: (dayType, blockId) => {
        set((state) => {
          if (dayType === "college") {
            return {
              collegeTimetable: state.collegeTimetable.filter((b) => b.id !== blockId),
            };
          } else {
            return {
              noCollegeTimetable: state.noCollegeTimetable.filter((b) => b.id !== blockId),
            };
          }
        });
      },

      resetTimetable: (dayType) => {
        set(() => {
          if (dayType === "college") {
            return { collegeTimetable: COLLEGE_DAY_TIMETABLE };
          } else {
            return { noCollegeTimetable: NO_COLLEGE_DAY_TIMETABLE };
          }
        });
      },

      toggleSalah: (salah, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const currentRecord = state.salahRecords[date] || { ...DEFAULT_SALAH_STATUS };
          const updated = {
            ...currentRecord,
            [salah]: !currentRecord[salah],
          };
          return {
            salahRecords: {
              ...state.salahRecords,
              [date]: updated,
            },
          };
        });
      },

      incrementDsa: (delta = 1) => set((s) => ({ dsaCount: s.dsaCount + delta })),
      decrementDsa: (delta = 1) =>
        set((s) => ({ dsaCount: Math.max(0, s.dsaCount - delta) })),
      setDsa: (val) => set({ dsaCount: Math.max(0, val) }),

      incrementSql: (delta = 1) => set((s) => ({ sqlCount: s.sqlCount + delta })),
      decrementSql: (delta = 1) =>
        set((s) => ({ sqlCount: Math.max(0, s.sqlCount - delta) })),
      setSql: (val) => set({ sqlCount: Math.max(0, val) }),

      addDeepWorkMinutes: (minutes) =>
        set((s) => ({ deepWorkMinutesToday: s.deepWorkMinutesToday + minutes })),

      toggleHabit: (date, habitKey) => {
        set((state) => {
          const existing = state.habitLogs.find((h) => h.date === date);
          let updatedLogs: HabitLog[];
          if (existing) {
            const nextVal = !existing[habitKey];
            const updated = {
              ...existing,
              [habitKey]: nextVal,
            };
            const count = [
              updated.quran,
              updated.salah5,
              updated.exercise,
              updated.deepWork,
              updated.healthyFoodSleep,
            ].filter(Boolean).length;
            updated.completionRate = Math.round((count / 5) * 100);

            updatedLogs = state.habitLogs.map((h) => (h.date === date ? updated : h));
          } else {
            const newLog: HabitLog = {
              date,
              quran: false,
              salah5: false,
              exercise: false,
              deepWork: false,
              healthyFoodSleep: false,
              [habitKey]: true,
              completionRate: 20,
            };
            updatedLogs = [newLog, ...state.habitLogs];
          }
          return { habitLogs: updatedLogs };
        });
      },

      toggleWeeklyGoal: (goalId) => {
        set((state) => ({
          weeklyGoals: state.weeklyGoals.map((g) =>
            g.id === goalId ? { ...g, completed: !g.completed } : g
          ),
        }));
      },

      addWeeklyGoal: (goal) => {
        const newGoal: WeeklyGoal = {
          ...goal,
          id: `wg-${Date.now()}`,
        };
        set((state) => ({ weeklyGoals: [newGoal, ...state.weeklyGoals] }));
      },

      deleteWeeklyGoal: (goalId) => {
        set((state) => ({
          weeklyGoals: state.weeklyGoals.filter((g) => g.id !== goalId),
        }));
      },

      toggleMilestoneChecklistItem: (milestoneId, checklistId) => {
        set((state) => ({
          milestones: state.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            const updatedChecklist = m.checklist.map((c) =>
              c.id === checklistId ? { ...c, done: !c.done } : c
            );
            const allDone = updatedChecklist.every((c) => c.done);
            const someDone = updatedChecklist.some((c) => c.done);
            const status = allDone
              ? "completed"
              : someDone
              ? "in-progress"
              : m.status === "completed"
              ? "in-progress"
              : m.status;
            return {
              ...m,
              checklist: updatedChecklist,
              status,
            };
          }),
        }));
      },

      saveDailyReview: (review) => {
        const newReview: DailyReview = {
          ...review,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          // If tomorrowDayType was set in review, pre-set it!
          return {
            dailyReviews: [newReview, ...state.dailyReviews.filter((r) => r.date !== review.date)],
            dayType: review.tomorrowDayType,
          };
        });
      },

      startFocusTimer: (blockId, durationMinutes = 25) => {
        set({
          focusTimer: {
            activeBlockId: blockId,
            isRunning: true,
            remainingSeconds: durationMinutes * 60,
            initialSeconds: durationMinutes * 60,
            mode: "countdown",
            endsAt: Date.now() + durationMinutes * 60 * 1000,
          },
        });
      },

      pauseFocusTimer: () =>
        set((state) => {
          const t = state.focusTimer;
          if (!t.isRunning || t.endsAt === null) return state;
          const remaining = Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
          return {
            focusTimer: { ...t, isRunning: false, remainingSeconds: remaining, endsAt: null },
          };
        }),

      resumeFocusTimer: () =>
        set((state) => {
          const t = state.focusTimer;
          if (t.isRunning || t.remainingSeconds <= 0) return state;
          return {
            focusTimer: { ...t, isRunning: true, endsAt: Date.now() + t.remainingSeconds * 1000 },
          };
        }),

      resetFocusTimer: () =>
        set((state) => ({
          focusTimer: {
            ...state.focusTimer,
            isRunning: false,
            remainingSeconds: state.focusTimer.initialSeconds,
            endsAt: null,
          },
        })),

      // Derives remaining time from a wall-clock timestamp, so it stays correct
      // when the tab is throttled or in the background.
      tickFocusTimer: () =>
        set((state) => {
          const today = getTodayDateString();
          const rolledOver = today !== state.todayDate || today !== state.deepWorkDate;
          const base = rolledOver
            ? { todayDate: today, deepWorkMinutesToday: 0, deepWorkDate: today }
            : {};

          const t = state.focusTimer;
          if (!t.isRunning || t.endsAt === null) {
            return rolledOver ? base : state;
          }
          const remaining = Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
          if (remaining <= 0) {
            const minutes = Math.round(t.initialSeconds / 60);
            const baseMinutes = rolledOver ? 0 : state.deepWorkMinutesToday;
            return {
              ...base,
              focusTimer: { ...t, isRunning: false, remainingSeconds: 0, endsAt: null },
              deepWorkMinutesToday: baseMinutes + minutes,
            };
          }
          if (remaining === t.remainingSeconds && !rolledOver) return state;
          return { ...base, focusTimer: { ...t, remainingSeconds: remaining } };
        }),

      addFiveMinutes: () =>
        set((state) => {
          const t = state.focusTimer;
          return {
            focusTimer: {
              ...t,
              remainingSeconds: t.remainingSeconds + 300,
              initialSeconds: t.initialSeconds + 300,
              endsAt: t.isRunning && t.endsAt !== null ? t.endsAt + 300 * 1000 : t.endsAt,
            },
          };
        }),

      setSimulatedTime: (time) => set({ simulatedTime: time }),

      getActiveTimetable: () => {
        const state = get();
        return state.dayType === "college"
          ? state.collegeTimetable
          : state.noCollegeTimetable;
      },

      getCompletionPercentage: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        const currentTimetable = state.getActiveTimetable();
        if (currentTimetable.length === 0) return 0;
        const completedCount = currentTimetable.filter(
          (b) => !!state.completedBlocks[`${date}_${b.id}`]
        ).length;
        return Math.round((completedCount / currentTimetable.length) * 100);
      },

      getSalahForDate: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        return state.salahRecords[date] || DEFAULT_SALAH_STATUS;
      },

      getDeenDunyaSplit: () => {
        const state = get();
        const timetable = state.getActiveTimetable();
        let deenMinutes = 0;
        let dunyaMinutes = 0;

        timetable.forEach((b) => {
          const [sh, sm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);
          let duration = eh * 60 + em - (sh * 60 + sm);
          if (duration < 0) duration += 24 * 60;

          if (b.category === "deen") {
            deenMinutes += duration;
          } else {
            dunyaMinutes += duration;
          }
        });

        const total = deenMinutes + dunyaMinutes;
        const deenPercent = total ? Math.round((deenMinutes / total) * 100) : 0;
        const dunyaPercent = 100 - deenPercent;

        return {
          deenHours: +(deenMinutes / 60).toFixed(1),
          dunyaHours: +(dunyaMinutes / 60).toFixed(1),
          deenPercent,
          dunyaPercent,
        };
      },

      hydrateFromCloud: (cloudData) => {
        set((state) => ({
          ...state,
          ...(cloudData.dayType ? { dayType: cloudData.dayType } : {}),
          ...(cloudData.dsaCount !== undefined ? { dsaCount: cloudData.dsaCount } : {}),
          ...(cloudData.sqlCount !== undefined ? { sqlCount: cloudData.sqlCount } : {}),
          ...(cloudData.deepWorkMinutesToday !== undefined ? { deepWorkMinutesToday: cloudData.deepWorkMinutesToday } : {}),
          ...(cloudData.completedBlocks ? { completedBlocks: cloudData.completedBlocks } : {}),
          ...(cloudData.salahRecords ? { salahRecords: cloudData.salahRecords } : {}),
          ...(cloudData.habitLogs ? { habitLogs: cloudData.habitLogs } : {}),
          ...(cloudData.dailyReviews ? { dailyReviews: cloudData.dailyReviews } : {}),
          ...(cloudData.weeklyGoals ? { weeklyGoals: cloudData.weeklyGoals } : {}),
          ...(cloudData.milestones ? { milestones: cloudData.milestones } : {}),
        }));
      },
    }),
    {
      name: "deen-dunya-storage-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dayType: state.dayType,
        theme: state.theme,
        collegeTimetable: state.collegeTimetable,
        noCollegeTimetable: state.noCollegeTimetable,
        completedBlocks: state.completedBlocks,
        salahRecords: state.salahRecords,
        dsaCount: state.dsaCount,
        sqlCount: state.sqlCount,
        deepWorkMinutesToday: state.deepWorkMinutesToday,
        deepWorkDate: state.deepWorkDate,
        habitLogs: state.habitLogs,
        weeklyGoals: state.weeklyGoals,
        milestones: state.milestones,
        dailyReviews: state.dailyReviews,
      }),
    }
  )
);
