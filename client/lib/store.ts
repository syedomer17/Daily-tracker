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
  DailyRecord,
  DsaEntry,
  SqlEntry,
  DeepWorkSession,
  HabitFlags,
} from "@/types";
import {
  COLLEGE_DAY_TIMETABLE,
  NO_COLLEGE_DAY_TIMETABLE,
  INITIAL_MILESTONES,
  INITIAL_WEEKLY_GOALS,
} from "@/data/timetable";
import {
  getTodayDateString,
  getTomorrowDateString,
  calculateCurrentStreak,
} from "@/lib/utils";

interface FocusTimerState {
  activeBlockId: string | null;
  isRunning: boolean;
  remainingSeconds: number;
  initialSeconds: number;
  plannedSeconds: number;
  startedAt: number | null; // epoch ms when session started
  endsAt: number | null;    // epoch ms when countdown completes
  mode: "countdown" | "stopwatch";
}

export interface TrackerState {
  // Date & Day Type
  todayDate: string;
  dayType: DayType;
  dayTypeByDate: Record<string, DayType>; // date -> dayType
  theme: "dark" | "light";

  // Timetable Templates
  collegeTimetable: TimeBlock[];
  noCollegeTimetable: TimeBlock[];

  // Normalized Date-Wise Progress Records (date -> DailyRecord)
  dailyRecords: Record<string, DailyRecord>;

  // Legacy baseline counters (if imported from prior version)
  legacyBaselineDsa: number;
  legacyBaselineSql: number;

  // Roadmaps & Weekly Focus
  weeklyGoals: WeeklyGoal[];
  milestones: Milestone[];
  roadmapTargets: {
    dsa: number;
    sql: number;
    projects: number;
    systemDesign: number;
    mockInterviews: number;
  };

  // Daily Reviews
  dailyReviews: DailyReview[];

  // Focus Timer
  focusTimer: FocusTimerState;

  // Simulated Time (for previewing active blocks)
  simulatedTime: string | null;

  // Sync state tracking
  syncVersion: number;
  pendingSync: boolean;
  lastSyncedAt: string | null;

  // Actions
  setDayType: (type: DayType) => void;
  toggleDayType: () => void;
  setDayTypeForDate: (date: string, type: DayType) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  // Midnight Rollover
  checkMidnightRollover: () => boolean;

  // Timetable Actions
  toggleBlockCompletion: (blockId: string, date?: string) => void;
  addTimeBlock: (dayType: DayType, block: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (dayType: DayType, block: TimeBlock) => void;
  deleteTimeBlock: (dayType: DayType, blockId: string) => void;
  resetTimetable: (dayType: DayType) => void;

  // Salah Actions
  toggleSalah: (salah: SalahName, date?: string) => void;

  // DSA Actions
  incrementDsa: (delta?: number, entry?: Partial<DsaEntry>, date?: string) => void;
  decrementDsa: (delta?: number, date?: string) => void;
  setDsa: (val: number, date?: string) => void;
  deleteDsaEntry: (entryId: string, date?: string) => void;

  // SQL Actions
  incrementSql: (delta?: number, entry?: Partial<SqlEntry>, date?: string) => void;
  decrementSql: (delta?: number, date?: string) => void;
  setSql: (val: number, date?: string) => void;
  deleteSqlEntry: (entryId: string, date?: string) => void;

  // Deep Work & Focus Timer Actions
  addDeepWorkMinutes: (minutes: number, date?: string) => void;
  startFocusTimer: (blockId: string, durationMinutes?: number) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  resetFocusTimer: () => void;
  completeFocusSession: () => void;
  tickFocusTimer: () => void;
  addFiveMinutes: () => void;

  // Habits Actions
  toggleHabit: (habitKey: keyof HabitFlags, date?: string) => void;

  // Weekly Goals & Milestones Actions
  toggleWeeklyGoal: (goalId: string) => void;
  addWeeklyGoal: (goal: Omit<WeeklyGoal, "id">) => void;
  deleteWeeklyGoal: (goalId: string) => void;
  toggleMilestoneChecklistItem: (milestoneId: string, checklistId: string) => void;
  setRoadmapTarget: (
    key: "dsa" | "sql" | "projects" | "systemDesign" | "mockInterviews",
    target: number
  ) => void;
  updateMilestoneTargetDate: (milestoneId: string, targetDate: string) => void;
  addMilestoneChecklistItem: (milestoneId: string, text: string) => void;

  // Review Actions
  saveDailyReview: (review: Omit<DailyReview, "id" | "createdAt">) => void;

  // Simulation
  setSimulatedTime: (time: string | null) => void;

  // Getters & Derived Metrics
  getDailyRecord: (date?: string) => DailyRecord;
  getEffectiveDayType: (date?: string) => DayType;
  getActiveTimetable: (date?: string) => TimeBlock[];
  getCompletionPercentage: (date?: string) => number;
  getSalahForDate: (date?: string) => SalahStatus;
  getHabitsForDate: (date?: string) => HabitFlags;
  getLifetimeDsaCount: () => number;
  getWeeklyDsaCount: (endDate?: string) => number;
  getMonthlyDsaCount: (yearMonth?: string) => number;
  getLifetimeSqlCount: () => number;
  getWeeklySqlCount: (endDate?: string) => number;
  getMonthlySqlCount: (yearMonth?: string) => number;
  getCurrentStreak: () => number;
  getDeenDunyaSplit: (date?: string) => {
    deenHours: number;
    dunyaHours: number;
    deenPercent: number;
    dunyaPercent: number;
  };

  // Cloud Synchronization
  markSynced: (timestamp: string) => void;
  hydrateFromCloud: (cloudData: Partial<TrackerState>) => void;

  // Backward compatibility getters
  dsaCount: number;
  sqlCount: number;
  deepWorkMinutesToday: number;
  completedBlocks: Record<string, boolean>;
  salahRecords: Record<string, SalahStatus>;
  habitLogs: HabitLog[];
}

const DEFAULT_SALAH_STATUS: SalahStatus = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

const DEFAULT_HABIT_FLAGS: HabitFlags = {
  quran: false,
  salah5: false,
  exercise: false,
  deepWork: false,
  healthyFoodSleep: false,
};

function createEmptyDailyRecord(date: string, dayType: DayType): DailyRecord {
  const now = new Date().toISOString();
  return {
    date,
    dayType,
    dsaCount: 0,
    dsaEntries: [],
    sqlCount: 0,
    sqlEntries: [],
    deepWorkMinutes: 0,
    deepWorkSessions: [],
    completedBlocks: {},
    salah: { ...DEFAULT_SALAH_STATUS },
    habits: { ...DEFAULT_HABIT_FLAGS },
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

const EMPTY_RECORDS_CACHE = new Map<string, DailyRecord>();

export function getOrCreateEmptyDailyRecord(date: string, dayType: DayType): DailyRecord {
  const key = `${date}_${dayType}`;
  let cached = EMPTY_RECORDS_CACHE.get(key);
  if (!cached) {
    cached = createEmptyDailyRecord(date, dayType);
    EMPTY_RECORDS_CACHE.set(key, cached);
  }
  return cached;
}

export function computeDerivedState(
  dailyRecords: Record<string, DailyRecord>,
  todayDate: string
) {
  const completedBlocks: Record<string, boolean> = {};
  const salahRecords: Record<string, SalahStatus> = {};
  const habitLogs: HabitLog[] = [];

  for (const [date, rec] of Object.entries(dailyRecords)) {
    for (const [blockId, done] of Object.entries(rec.completedBlocks || {})) {
      if (done) completedBlocks[`${date}_${blockId}`] = true;
    }
    salahRecords[date] = rec.salah;
    const count = [
      rec.habits.quran,
      rec.habits.salah5,
      rec.habits.exercise,
      rec.habits.deepWork,
      rec.habits.healthyFoodSleep,
    ].filter(Boolean).length;
    habitLogs.push({
      date: rec.date,
      quran: rec.habits.quran,
      salah5: rec.habits.salah5,
      exercise: rec.habits.exercise,
      deepWork: rec.habits.deepWork,
      healthyFoodSleep: rec.habits.healthyFoodSleep,
      completionRate: Math.round((count / 5) * 100),
    });
  }

  const todayRec = dailyRecords[todayDate];
  return {
    completedBlocks,
    salahRecords,
    habitLogs,
    dsaCount: todayRec?.dsaCount ?? 0,
    sqlCount: todayRec?.sqlCount ?? 0,
    deepWorkMinutesToday: todayRec?.deepWorkMinutes ?? 0,
  };
}

function applyDailyRecordsUpdate(
  state: TrackerState,
  updatedRecord: DailyRecord,
  date: string
) {
  const newRecords = {
    ...state.dailyRecords,
    [date]: updatedRecord,
  };
  const derived = computeDerivedState(newRecords, state.todayDate);
  return {
    dailyRecords: newRecords,
    ...derived,
    syncVersion: state.syncVersion + 1,
    pendingSync: true,
  };
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      todayDate: getTodayDateString(),
      dayType: "college",
      dayTypeByDate: {},
      theme: "dark",

      collegeTimetable: COLLEGE_DAY_TIMETABLE,
      noCollegeTimetable: NO_COLLEGE_DAY_TIMETABLE,

      dailyRecords: {},
      legacyBaselineDsa: 0,
      legacyBaselineSql: 0,

      // Cached derived state to prevent infinite loops in getSnapshot
      dsaCount: 0,
      sqlCount: 0,
      deepWorkMinutesToday: 0,
      completedBlocks: {},
      salahRecords: {},
      habitLogs: [],

      weeklyGoals: INITIAL_WEEKLY_GOALS,
      milestones: INITIAL_MILESTONES,
      roadmapTargets: {
        dsa: 150,
        sql: 100,
        projects: 3,
        systemDesign: 5,
        mockInterviews: 10,
      },
      dailyReviews: [],

      focusTimer: {
        activeBlockId: null,
        isRunning: false,
        remainingSeconds: 25 * 60,
        initialSeconds: 25 * 60,
        plannedSeconds: 25 * 60,
        startedAt: null,
        endsAt: null,
        mode: "countdown",
      },

      simulatedTime: null,
      syncVersion: 1,
      pendingSync: false,
      lastSyncedAt: null,

      // --- Theme & Day Type Actions ---
      setDayType: (type) =>
        set((state) => ({
          dayType: type,
          dayTypeByDate: { ...state.dayTypeByDate, [state.todayDate]: type },
          pendingSync: true,
        })),

      toggleDayType: () =>
        set((state) => {
          const next = state.dayType === "college" ? "no-college" : "college";
          return {
            dayType: next,
            dayTypeByDate: { ...state.dayTypeByDate, [state.todayDate]: next },
            pendingSync: true,
          };
        }),

      setDayTypeForDate: (date, type) =>
        set((state) => ({
          dayTypeByDate: { ...state.dayTypeByDate, [date]: type },
          ...(date === state.todayDate ? { dayType: type } : {}),
          pendingSync: true,
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

      // --- Midnight Rollover ---
      checkMidnightRollover: () => {
        const state = get();
        const currentKolkataDate = getTodayDateString();
        if (currentKolkataDate === state.todayDate) {
          return false;
        }

        // A new calendar day has begun in Asia/Kolkata
        const scheduledTomorrowDayType = state.dayTypeByDate[currentKolkataDate];
        const nextDayType =
          scheduledTomorrowDayType ||
          (new Date().getDay() === 0 ? "no-college" : "college");

        // Ensure record exists for today
        const existingRecord = state.dailyRecords[currentKolkataDate];
        const newRecord =
          existingRecord || createEmptyDailyRecord(currentKolkataDate, nextDayType);

        const newRecords = {
          ...state.dailyRecords,
          [currentKolkataDate]: newRecord,
        };
        const derived = computeDerivedState(newRecords, currentKolkataDate);

        set({
          todayDate: currentKolkataDate,
          dayType: nextDayType,
          dailyRecords: newRecords,
          ...derived,
          // Reset daily active timer if left running overnight
          focusTimer: {
            ...state.focusTimer,
            isRunning: false,
            endsAt: null,
            remainingSeconds: state.focusTimer.initialSeconds,
          },
          syncVersion: state.syncVersion + 1,
          pendingSync: true,
        });

        return true;
      },

      // --- Timetable Actions ---
      toggleBlockCompletion: (blockId, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const currentVal = !!record.completedBlocks[blockId];
          const updatedBlocks = {
            ...record.completedBlocks,
            [blockId]: !currentVal,
          };

          const updatedRecord: DailyRecord = {
            ...record,
            completedBlocks: updatedBlocks,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
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
            return { collegeTimetable: list, pendingSync: true };
          } else {
            const list = [...state.noCollegeTimetable, newBlock].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
            return { noCollegeTimetable: list, pendingSync: true };
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
              pendingSync: true,
            };
          } else {
            return {
              noCollegeTimetable: state.noCollegeTimetable
                .map((b) => (b.id === updated.id ? updated : b))
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
              pendingSync: true,
            };
          }
        });
      },

      deleteTimeBlock: (dayType, blockId) => {
        set((state) => {
          if (dayType === "college") {
            return {
              collegeTimetable: state.collegeTimetable.filter((b) => b.id !== blockId),
              pendingSync: true,
            };
          } else {
            return {
              noCollegeTimetable: state.noCollegeTimetable.filter((b) => b.id !== blockId),
              pendingSync: true,
            };
          }
        });
      },

      resetTimetable: (dayType) => {
        set(() => {
          if (dayType === "college") {
            return { collegeTimetable: COLLEGE_DAY_TIMETABLE, pendingSync: true };
          } else {
            return { noCollegeTimetable: NO_COLLEGE_DAY_TIMETABLE, pendingSync: true };
          }
        });
      },

      // --- Salah Actions ---
      toggleSalah: (salah, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const updatedSalah = {
            ...record.salah,
            [salah]: !record.salah[salah],
          };

          // Consistency: Five daily prayers habit reflects whether all 5 are checked
          const all5 =
            updatedSalah.fajr &&
            updatedSalah.dhuhr &&
            updatedSalah.asr &&
            updatedSalah.maghrib &&
            updatedSalah.isha;

          const updatedHabits: HabitFlags = {
            ...record.habits,
            salah5: all5,
          };

          const updatedRecord: DailyRecord = {
            ...record,
            salah: updatedSalah,
            habits: updatedHabits,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      // --- DSA Actions ---
      incrementDsa: (delta = 1, entry, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const entries = [...(record.dsaEntries || [])];
          if (entry) {
            entries.push({
              id: entry.id || `dsa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: entry.name,
              difficulty: entry.difficulty || "Medium",
              topic: entry.topic || "General",
              url: entry.url,
              timestamp: new Date().toISOString(),
            });
          }

          const updatedRecord: DailyRecord = {
            ...record,
            dsaCount: record.dsaCount + delta,
            dsaEntries: entries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      decrementDsa: (delta = 1, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const newCount = Math.max(0, record.dsaCount - delta);
          const entries = (record.dsaEntries || []).slice(0, newCount);

          const updatedRecord: DailyRecord = {
            ...record,
            dsaCount: newCount,
            dsaEntries: entries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      setDsa: (val, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const updatedRecord: DailyRecord = {
            ...record,
            dsaCount: Math.max(0, val),
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      deleteDsaEntry: (entryId, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record = state.dailyRecords[date];
          if (!record) return state;

          const updatedEntries = (record.dsaEntries || []).filter((e) => e.id !== entryId);
          const updatedRecord: DailyRecord = {
            ...record,
            dsaCount: Math.max(0, record.dsaCount - 1),
            dsaEntries: updatedEntries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      // --- SQL Actions ---
      incrementSql: (delta = 1, entry, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const entries = [...(record.sqlEntries || [])];
          if (entry) {
            entries.push({
              id: entry.id || `sql-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              queryName: entry.queryName,
              difficulty: entry.difficulty || "Medium",
              topic: entry.topic || "Joins",
              timestamp: new Date().toISOString(),
            });
          }

          const updatedRecord: DailyRecord = {
            ...record,
            sqlCount: record.sqlCount + delta,
            sqlEntries: entries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      decrementSql: (delta = 1, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const newCount = Math.max(0, record.sqlCount - delta);
          const entries = (record.sqlEntries || []).slice(0, newCount);

          const updatedRecord: DailyRecord = {
            ...record,
            sqlCount: newCount,
            sqlEntries: entries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      setSql: (val, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const updatedRecord: DailyRecord = {
            ...record,
            sqlCount: Math.max(0, val),
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      deleteSqlEntry: (entryId, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record = state.dailyRecords[date];
          if (!record) return state;

          const updatedEntries = (record.sqlEntries || []).filter((e) => e.id !== entryId);
          const updatedRecord: DailyRecord = {
            ...record,
            sqlCount: Math.max(0, record.sqlCount - 1),
            sqlEntries: updatedEntries,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      // --- Deep Work & Focus Timer Actions ---
      addDeepWorkMinutes: (minutes, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const newMinutes = record.deepWorkMinutes + minutes;
          // Mark deepWork habit completed if >= 120 minutes (2 hrs)
          const updatedHabits = {
            ...record.habits,
            deepWork: newMinutes >= 120,
          };

          const updatedRecord: DailyRecord = {
            ...record,
            deepWorkMinutes: newMinutes,
            habits: updatedHabits,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      startFocusTimer: (blockId, durationMinutes = 25) => {
        const plannedSec = durationMinutes * 60;
        set({
          focusTimer: {
            activeBlockId: blockId,
            isRunning: true,
            remainingSeconds: plannedSec,
            initialSeconds: plannedSec,
            plannedSeconds: plannedSec,
            startedAt: Date.now(),
            endsAt: Date.now() + plannedSec * 1000,
            mode: "countdown",
          },
        });
      },

      pauseFocusTimer: () =>
        set((state) => {
          const t = state.focusTimer;
          if (!t.isRunning || t.endsAt === null) return state;
          const remaining = Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
          return {
            focusTimer: {
              ...t,
              isRunning: false,
              remainingSeconds: remaining,
              endsAt: null,
            },
          };
        }),

      resumeFocusTimer: () =>
        set((state) => {
          const t = state.focusTimer;
          if (t.isRunning || t.remainingSeconds <= 0) return state;
          return {
            focusTimer: {
              ...t,
              isRunning: true,
              endsAt: Date.now() + t.remainingSeconds * 1000,
            },
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

      completeFocusSession: () => {
        const state = get();
        const t = state.focusTimer;
        const elapsedSec = Math.max(0, t.initialSeconds - t.remainingSeconds);
        const elapsedMinutes = Math.max(1, Math.round(elapsedSec / 60));
        const today = state.todayDate;

        const record =
          state.dailyRecords[today] ||
          createEmptyDailyRecord(today, state.dayTypeByDate[today] || state.dayType);

        const newSession: DeepWorkSession = {
          id: `dws-${Date.now()}`,
          blockId: t.activeBlockId || undefined,
          startTime: new Date(Date.now() - elapsedSec * 1000).toISOString(),
          endTime: new Date().toISOString(),
          durationMinutes: elapsedMinutes,
          plannedMinutes: Math.round(t.plannedSeconds / 60),
        };

        const newTotalMinutes = record.deepWorkMinutes + elapsedMinutes;

        // Auto-complete block if active
        const updatedBlocks = { ...record.completedBlocks };
        if (t.activeBlockId) {
          updatedBlocks[t.activeBlockId] = true;
        }

        const updatedRecord: DailyRecord = {
          ...record,
          deepWorkMinutes: newTotalMinutes,
          deepWorkSessions: [...(record.deepWorkSessions || []), newSession],
          completedBlocks: updatedBlocks,
          habits: {
            ...record.habits,
            deepWork: newTotalMinutes >= 120,
          },
          version: record.version + 1,
          updatedAt: new Date().toISOString(),
        };

        const newRecords = {
          ...state.dailyRecords,
          [today]: updatedRecord,
        };
        const derived = computeDerivedState(newRecords, state.todayDate);

        set({
          focusTimer: {
            ...t,
            isRunning: false,
            remainingSeconds: t.initialSeconds,
            endsAt: null,
          },
          dailyRecords: newRecords,
          ...derived,
          syncVersion: state.syncVersion + 1,
          pendingSync: true,
        });
      },

      tickFocusTimer: () => {
        // First, check midnight rollover
        get().checkMidnightRollover();

        const state = get();
        const t = state.focusTimer;
        if (!t.isRunning || t.endsAt === null) {
          return;
        }

        const remaining = Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
        if (remaining <= 0) {
          // Completed session!
          get().completeFocusSession();
          return;
        }

        if (remaining !== t.remainingSeconds) {
          set({
            focusTimer: { ...t, remainingSeconds: remaining },
          });
        }
      },

      addFiveMinutes: () =>
        set((state) => {
          const t = state.focusTimer;
          const additional = 300;
          return {
            focusTimer: {
              ...t,
              remainingSeconds: t.remainingSeconds + additional,
              initialSeconds: t.initialSeconds + additional,
              plannedSeconds: t.plannedSeconds + additional,
              endsAt: t.isRunning && t.endsAt !== null ? t.endsAt + additional * 1000 : t.endsAt,
            },
          };
        }),

      // --- Habit Actions ---
      toggleHabit: (habitKey, customDate) => {
        const date = customDate || get().todayDate;
        set((state) => {
          const record =
            state.dailyRecords[date] ||
            createEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType);

          const updatedHabits = {
            ...record.habits,
            [habitKey]: !record.habits[habitKey],
          };

          const updatedRecord: DailyRecord = {
            ...record,
            habits: updatedHabits,
            version: record.version + 1,
            updatedAt: new Date().toISOString(),
          };

          return applyDailyRecordsUpdate(state, updatedRecord, date);
        });
      },

      // --- Weekly Goals & Milestones Actions ---
      toggleWeeklyGoal: (goalId) =>
        set((state) => ({
          weeklyGoals: state.weeklyGoals.map((g) =>
            g.id === goalId ? { ...g, completed: !g.completed } : g
          ),
          pendingSync: true,
        })),

      addWeeklyGoal: (goal) => {
        const newGoal: WeeklyGoal = {
          ...goal,
          id: `wg-${Date.now()}`,
        };
        set((state) => ({
          weeklyGoals: [newGoal, ...state.weeklyGoals],
          pendingSync: true,
        }));
      },

      deleteWeeklyGoal: (goalId) =>
        set((state) => ({
          weeklyGoals: state.weeklyGoals.filter((g) => g.id !== goalId),
          pendingSync: true,
        })),

      toggleMilestoneChecklistItem: (milestoneId, checklistId) =>
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
          pendingSync: true,
        })),

      setRoadmapTarget: (key, target) =>
        set((state) => ({
          roadmapTargets: {
            ...state.roadmapTargets,
            [key]: Math.max(1, target),
          },
          pendingSync: true,
        })),

      updateMilestoneTargetDate: (milestoneId, targetDate) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestoneId ? { ...m, targetDate } : m
          ),
          pendingSync: true,
        })),

      addMilestoneChecklistItem: (milestoneId, text) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  checklist: [
                    ...m.checklist,
                    {
                      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      text,
                      done: false,
                    },
                  ],
                }
              : m
          ),
          pendingSync: true,
        })),

      // --- Daily Review Action (FIXED TOMORROW SCHEDULE BUG) ---
      saveDailyReview: (review) => {
        const newReview: DailyReview = {
          ...review,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        // Determine tomorrow's date in Asia/Kolkata
        const tomorrowDate = getTomorrowDateString(review.date);

        set((state) => {
          // IMPORTANT BUG FIX:
          // We set tomorrow's day type into dayTypeByDate[tomorrowDate].
          // We DO NOT mutate state.dayType (which is active for TODAY).
          return {
            dailyReviews: [
              newReview,
              ...state.dailyReviews.filter((r) => r.date !== review.date),
            ],
            dayTypeByDate: {
              ...state.dayTypeByDate,
              [tomorrowDate]: review.tomorrowDayType,
            },
            pendingSync: true,
          };
        });
      },

      // --- Simulation ---
      setSimulatedTime: (time) => set({ simulatedTime: time }),

      // --- Getters & Derived Metrics ---
      getDailyRecord: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        return (
          state.dailyRecords[date] ||
          getOrCreateEmptyDailyRecord(date, state.dayTypeByDate[date] || state.dayType)
        );
      },

      getEffectiveDayType: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        if (state.dayTypeByDate[date]) {
          return state.dayTypeByDate[date];
        }
        return state.dayType;
      },

      getActiveTimetable: (customDate) => {
        const state = get();
        const effectiveType = state.getEffectiveDayType(customDate);
        return effectiveType === "college"
          ? state.collegeTimetable
          : state.noCollegeTimetable;
      },

      getCompletionPercentage: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        const timetable = state.getActiveTimetable(date);
        if (timetable.length === 0) return 0;

        const record = state.getDailyRecord(date);
        const completedCount = timetable.filter((b) => !!record.completedBlocks[b.id]).length;
        return Math.round((completedCount / timetable.length) * 100);
      },

      getSalahForDate: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        const record = state.getDailyRecord(date);
        return record.salah || DEFAULT_SALAH_STATUS;
      },

      getHabitsForDate: (customDate) => {
        const state = get();
        const date = customDate || state.todayDate;
        const record = state.getDailyRecord(date);
        return record.habits || DEFAULT_HABIT_FLAGS;
      },

      getLifetimeDsaCount: () => {
        const state = get();
        const dailySum = Object.values(state.dailyRecords).reduce(
          (sum, r) => sum + (r.dsaCount || 0),
          0
        );
        return dailySum + (state.legacyBaselineDsa || 0);
      },

      getWeeklyDsaCount: (endDate) => {
        const state = get();
        const end = endDate || state.todayDate;
        const endTimestamp = new Date(end).getTime();
        const sevenDaysAgo = endTimestamp - 7 * 86_400_000;

        return Object.entries(state.dailyRecords)
          .filter(([d]) => {
            const t = new Date(d).getTime();
            return t >= sevenDaysAgo && t <= endTimestamp;
          })
          .reduce((sum, [, r]) => sum + (r.dsaCount || 0), 0);
      },

      getMonthlyDsaCount: (yearMonth) => {
        const state = get();
        const ym = yearMonth || state.todayDate.substring(0, 7);
        return Object.entries(state.dailyRecords)
          .filter(([d]) => d.startsWith(ym))
          .reduce((sum, [, r]) => sum + (r.dsaCount || 0), 0);
      },

      getLifetimeSqlCount: () => {
        const state = get();
        const dailySum = Object.values(state.dailyRecords).reduce(
          (sum, r) => sum + (r.sqlCount || 0),
          0
        );
        return dailySum + (state.legacyBaselineSql || 0);
      },

      getWeeklySqlCount: (endDate) => {
        const state = get();
        const end = endDate || state.todayDate;
        const endTimestamp = new Date(end).getTime();
        const sevenDaysAgo = endTimestamp - 7 * 86_400_000;

        return Object.entries(state.dailyRecords)
          .filter(([d]) => {
            const t = new Date(d).getTime();
            return t >= sevenDaysAgo && t <= endTimestamp;
          })
          .reduce((sum, [, r]) => sum + (r.sqlCount || 0), 0);
      },

      getMonthlySqlCount: (yearMonth) => {
        const state = get();
        const ym = yearMonth || state.todayDate.substring(0, 7);
        return Object.entries(state.dailyRecords)
          .filter(([d]) => d.startsWith(ym))
          .reduce((sum, [, r]) => sum + (r.sqlCount || 0), 0);
      },

      getCurrentStreak: () => {
        const state = get();
        const habitLogsForStreak = Object.values(state.dailyRecords).map((r) => {
          const count = [
            r.habits.quran,
            r.habits.salah5,
            r.habits.exercise,
            r.habits.deepWork,
            r.habits.healthyFoodSleep,
          ].filter(Boolean).length;
          return {
            date: r.date,
            completionRate: count > 0 ? (count / 5) * 100 : 0,
          };
        });

        const salahRecordsForStreak: Record<string, Record<string, boolean>> = {};
        const completedBlocksForStreak: Record<string, boolean> = {};

        for (const [date, r] of Object.entries(state.dailyRecords)) {
          salahRecordsForStreak[date] = r.salah;
          for (const [blockId, done] of Object.entries(r.completedBlocks || {})) {
            if (done) {
              completedBlocksForStreak[`${date}_${blockId}`] = true;
            }
          }
        }

        return calculateCurrentStreak(
          habitLogsForStreak,
          salahRecordsForStreak,
          completedBlocksForStreak
        );
      },

      getDeenDunyaSplit: (customDate) => {
        const state = get();
        const timetable = state.getActiveTimetable(customDate);
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

      // --- Cloud Synchronization Helpers ---
      markSynced: (timestamp) =>
        set({
          pendingSync: false,
          lastSyncedAt: timestamp,
        }),

      hydrateFromCloud: (cloudData) => {
        set((state) => {
          // Merge daily records by date, keeping the higher version or non-conflicting updates
          const mergedDailyRecords: Record<string, DailyRecord> = {
            ...state.dailyRecords,
          };

          if (cloudData.dailyRecords) {
            for (const [date, cloudRecord] of Object.entries(cloudData.dailyRecords)) {
              const localRecord = state.dailyRecords[date];
              if (!localRecord) {
                mergedDailyRecords[date] = cloudRecord;
              } else if (cloudRecord.version >= localRecord.version) {
                // Cloud has equal or newer revision
                mergedDailyRecords[date] = {
                  ...cloudRecord,
                  // Merge entries without duplicating IDs
                  dsaEntries: mergeEntries(localRecord.dsaEntries, cloudRecord.dsaEntries),
                  sqlEntries: mergeEntries(localRecord.sqlEntries, cloudRecord.sqlEntries),
                };
              }
            }
          }

          const derived = computeDerivedState(mergedDailyRecords, state.todayDate);

          return {
            ...state,
            ...(cloudData.dayType ? { dayType: cloudData.dayType } : {}),
            dayTypeByDate: {
              ...state.dayTypeByDate,
              ...(cloudData.dayTypeByDate || {}),
            },
            collegeTimetable: cloudData.collegeTimetable || state.collegeTimetable,
            noCollegeTimetable: cloudData.noCollegeTimetable || state.noCollegeTimetable,
            dailyRecords: mergedDailyRecords,
            ...derived,
            legacyBaselineDsa:
              cloudData.legacyBaselineDsa ?? state.legacyBaselineDsa,
            legacyBaselineSql:
              cloudData.legacyBaselineSql ?? state.legacyBaselineSql,
            weeklyGoals: cloudData.weeklyGoals || state.weeklyGoals,
            milestones: cloudData.milestones || state.milestones,
            roadmapTargets: cloudData.roadmapTargets
              ? { ...state.roadmapTargets, ...cloudData.roadmapTargets }
              : state.roadmapTargets,
            dailyReviews: mergeReviews(state.dailyReviews, cloudData.dailyReviews),
            lastSyncedAt: new Date().toISOString(),
            pendingSync: false,
          };
        });
      },
    }),
    {
      name: "deen-dunya-storage-v4",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = computeDerivedState(state.dailyRecords || {}, state.todayDate);
          Object.assign(state, derived);
        }
      },
      partialize: (state) => ({
        todayDate: state.todayDate,
        dayType: state.dayType,
        dayTypeByDate: state.dayTypeByDate,
        theme: state.theme,
        collegeTimetable: state.collegeTimetable,
        noCollegeTimetable: state.noCollegeTimetable,
        dailyRecords: state.dailyRecords,
        legacyBaselineDsa: state.legacyBaselineDsa,
        legacyBaselineSql: state.legacyBaselineSql,
        weeklyGoals: state.weeklyGoals,
        milestones: state.milestones,
        roadmapTargets: state.roadmapTargets,
        dailyReviews: state.dailyReviews,
        focusTimer: state.focusTimer,
        syncVersion: state.syncVersion,
      }),
    }
  )
);

function mergeEntries<T extends { id: string }>(local?: T[], cloud?: T[]): T[] {
  const map = new Map<string, T>();
  (local || []).forEach((item) => map.set(item.id, item));
  (cloud || []).forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mergeReviews(local: DailyReview[], cloud?: DailyReview[]): DailyReview[] {
  if (!cloud) return local;
  const map = new Map<string, DailyReview>();
  local.forEach((r) => map.set(r.date, r));
  cloud.forEach((r) => {
    const existing = map.get(r.date);
    if (!existing || new Date(r.createdAt) >= new Date(existing.createdAt)) {
      map.set(r.date, r);
    }
  });
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}
