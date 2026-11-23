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
  DailyAnalyticsRecord,
} from "@/types";
import {
  COLLEGE_DAY_TIMETABLE,
  NO_COLLEGE_DAY_TIMETABLE,
  INITIAL_MILESTONES,
  INITIAL_WEEKLY_GOALS,
  MOCK_PAST_7_DAYS_ANALYTICS,
  MOCK_90_DAYS_HABITS,
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

  // Analytics History
  analyticsHistory: DailyAnalyticsRecord[];

  // Focus Timer
  focusTimer: {
    activeBlockId: string | null;
    isRunning: boolean;
    remainingSeconds: number;
    initialSeconds: number;
    mode: "countdown" | "stopwatch";
  };

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
}

const DEFAULT_SALAH_STATUS: SalahStatus = {
  fajr: true,
  dhuhr: true,
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
      completedBlocks: {
        [`${getTodayDateString()}_cd-1`]: true,
        [`${getTodayDateString()}_cd-2`]: true,
        [`${getTodayDateString()}_cd-3`]: true,
        [`${getTodayDateString()}_cd-4`]: true,
        [`${getTodayDateString()}_cd-5`]: true,
        [`${getTodayDateString()}_cd-6`]: true,
        [`${getTodayDateString()}_cd-7`]: true,
      },

      salahRecords: {
        [getTodayDateString()]: DEFAULT_SALAH_STATUS,
      },

      dsaCount: 84,
      sqlCount: 62,
      deepWorkMinutesToday: 240, // 4 hours

      habitLogs: MOCK_90_DAYS_HABITS,
      weeklyGoals: INITIAL_WEEKLY_GOALS,
      milestones: INITIAL_MILESTONES,
      dailyReviews: [
        {
          id: "rev-sample-1",
          date: "2026-11-22",
          githubUpdated: true,
          githubCommitsCount: 4,
          wentWell: "Cracked 2 LeetCode Medium problems (Binary Tree Level Order Traversal & Valid BST). Finished Sheryians React routing section.",
          blockedBy: "Spent 40 mins debugging a CORS issue in Next.js backend proxy.",
          tomorrowPriority: "Complete college lab practical on time & practice 5 SQL joins before Asr.",
          tomorrowDayType: "college",
          moodScore: 5,
          energyScore: 4,
          createdAt: new Date(2026, 10, 22, 21, 30).toISOString(),
        },
      ],

      analyticsHistory: MOCK_PAST_7_DAYS_ANALYTICS,

      focusTimer: {
        activeBlockId: "cd-7",
        isRunning: false,
        remainingSeconds: 25 * 60,
        initialSeconds: 25 * 60,
        mode: "countdown",
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
          },
        });
      },

      pauseFocusTimer: () =>
        set((state) => ({
          focusTimer: { ...state.focusTimer, isRunning: false },
        })),

      resumeFocusTimer: () =>
        set((state) => ({
          focusTimer: { ...state.focusTimer, isRunning: true },
        })),

      resetFocusTimer: () =>
        set((state) => ({
          focusTimer: {
            ...state.focusTimer,
            isRunning: false,
            remainingSeconds: state.focusTimer.initialSeconds,
          },
        })),

      tickFocusTimer: () =>
        set((state) => {
          if (!state.focusTimer.isRunning) return state;
          if (state.focusTimer.remainingSeconds <= 1) {
            // Timer completed: add 25 min to deep work if tech/deen
            return {
              focusTimer: {
                ...state.focusTimer,
                isRunning: false,
                remainingSeconds: 0,
              },
              deepWorkMinutesToday: state.deepWorkMinutesToday + 25,
            };
          }
          return {
            focusTimer: {
              ...state.focusTimer,
              remainingSeconds: state.focusTimer.remainingSeconds - 1,
            },
          };
        }),

      addFiveMinutes: () =>
        set((state) => ({
          focusTimer: {
            ...state.focusTimer,
            remainingSeconds: state.focusTimer.remainingSeconds + 300,
            initialSeconds: state.focusTimer.initialSeconds + 300,
          },
        })),

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
    }),
    {
      name: "deen-dunya-storage-v1",
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
        habitLogs: state.habitLogs,
        weeklyGoals: state.weeklyGoals,
        milestones: state.milestones,
        dailyReviews: state.dailyReviews,
      }),
    }
  )
);
