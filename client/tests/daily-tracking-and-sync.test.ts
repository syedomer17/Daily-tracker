import { describe, it, expect, beforeEach } from "vitest";
import { useTrackerStore } from "@/lib/store";
import {
  getTodayDateString,
  getTomorrowDateString,
  getYesterdayDateString,
} from "@/lib/utils";
import { DailyRecordSchema } from "@/lib/validations";

describe("Daily Tracking and Cloud Synchronization (Task 2)", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useTrackerStore.setState({
      todayDate: getTodayDateString(),
      dayType: "college",
      dayTypeByDate: {},
      dailyRecords: {},
      legacyBaselineDsa: 0,
      legacyBaselineSql: 0,
      dailyReviews: [],
      weeklyGoals: [],
      milestones: [],
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
      syncVersion: 1,
      pendingSync: false,
      dsaCount: 0,
      sqlCount: 0,
      deepWorkMinutesToday: 0,
      completedBlocks: {},
      salahRecords: {},
      habitLogs: [],
    });
  });

  describe("1. Date-Wise Daily Progress Records & Schema", () => {
    it("creates and retrieves isolated daily records per date", () => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      // Today's record
      useTrackerStore.getState().incrementDsa(2, { name: "Two Sum", difficulty: "Easy" }, today);
      useTrackerStore.getState().incrementSql(1, { queryName: "Department Top Three", difficulty: "Hard" }, today);

      // Yesterday's record
      useTrackerStore.getState().incrementDsa(3, undefined, yesterday);
      useTrackerStore.getState().incrementSql(2, undefined, yesterday);

      const todayRec = useTrackerStore.getState().getDailyRecord(today);
      const yestRec = useTrackerStore.getState().getDailyRecord(yesterday);

      expect(todayRec.dsaCount).toBe(2);
      expect(todayRec.sqlCount).toBe(1);
      expect(todayRec.dsaEntries).toHaveLength(1);
      expect(todayRec.dsaEntries?.[0].name).toBe("Two Sum");

      expect(yestRec.dsaCount).toBe(3);
      expect(yestRec.sqlCount).toBe(2);

      // Validate schema
      const validation = DailyRecordSchema.safeParse(todayRec);
      expect(validation.success).toBe(true);
    });
  });

  describe("2. DSA Tracking: Daily, Lifetime, Weekly, Monthly & Non-Negative Floor", () => {
    it("tracks daily count vs lifetime total accurately with details and corrections", () => {
      const today = getTodayDateString();
      const store = useTrackerStore.getState();

      // Add 2 questions today
      store.incrementDsa(1, {
        name: "Reverse Linked List",
        difficulty: "Easy",
        topic: "Linked List",
        url: "https://leetcode.com/problems/reverse-linked-list/",
      });
      store.incrementDsa(1, {
        name: "LRU Cache",
        difficulty: "Medium",
        topic: "Design",
        url: "https://leetcode.com/problems/lru-cache/",
      });

      const rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.dsaCount).toBe(2);
      expect(rec.dsaEntries).toHaveLength(2);
      expect(useTrackerStore.getState().getLifetimeDsaCount()).toBe(2);

      // Accidental entry correction (decrement)
      useTrackerStore.getState().decrementDsa(1);
      expect(useTrackerStore.getState().getDailyRecord(today).dsaCount).toBe(1);

      // Ensure non-negative floor
      useTrackerStore.getState().decrementDsa(5);
      expect(useTrackerStore.getState().getDailyRecord(today).dsaCount).toBe(0);

      // Test delete entry by ID
      useTrackerStore.getState().incrementDsa(1, { id: "test-dsa-1", name: "Valid Tree" });
      expect(useTrackerStore.getState().getDailyRecord(today).dsaCount).toBe(1);
      useTrackerStore.getState().deleteDsaEntry("test-dsa-1");
      expect(useTrackerStore.getState().getDailyRecord(today).dsaCount).toBe(0);
      expect(useTrackerStore.getState().getDailyRecord(today).dsaEntries).toHaveLength(0);
    });

    it("calculates weekly and monthly DSA metrics correctly", () => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      useTrackerStore.getState().incrementDsa(3, undefined, today);
      useTrackerStore.getState().incrementDsa(4, undefined, yesterday);

      expect(useTrackerStore.getState().getWeeklyDsaCount()).toBe(7);
      expect(useTrackerStore.getState().getMonthlyDsaCount()).toBe(7);
      expect(useTrackerStore.getState().getLifetimeDsaCount()).toBe(7);
    });
  });

  describe("3. SQL Tracking: Daily, Lifetime, Weekly, Monthly & Non-Negative Floor", () => {
    it("handles SQL increments, decrements, details, and delete entries", () => {
      const today = getTodayDateString();

      useTrackerStore.getState().incrementSql(1, {
        id: "sql-q1",
        queryName: "Consecutive Numbers",
        difficulty: "Medium",
        topic: "Window Functions",
      });

      let rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.sqlCount).toBe(1);
      expect(rec.sqlEntries?.[0].queryName).toBe("Consecutive Numbers");
      expect(useTrackerStore.getState().getLifetimeSqlCount()).toBe(1);

      // Non-negative floor
      useTrackerStore.getState().decrementSql(10);
      rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.sqlCount).toBe(0);

      // Delete SQL entry by ID
      useTrackerStore.getState().incrementSql(1, { id: "sql-to-delete", queryName: "Nth Highest Salary" });
      expect(useTrackerStore.getState().getDailyRecord(today).sqlCount).toBe(1);
      useTrackerStore.getState().deleteSqlEntry("sql-to-delete");
      expect(useTrackerStore.getState().getDailyRecord(today).sqlCount).toBe(0);
    });
  });

  describe("4. Focus Timer & Deep Work Session Recording", () => {
    it("handles start, pause, resume, reset and session completion", () => {
      const today = getTodayDateString();
      const store = useTrackerStore.getState();

      // Start a 25-minute session on block "block-dsa"
      store.startFocusTimer("block-dsa", 25);
      let t = useTrackerStore.getState().focusTimer;
      expect(t.isRunning).toBe(true);
      expect(t.activeBlockId).toBe("block-dsa");
      expect(t.plannedSeconds).toBe(1500);
      expect(t.endsAt).not.toBeNull();

      // Pause timer
      store.pauseFocusTimer();
      t = useTrackerStore.getState().focusTimer;
      expect(t.isRunning).toBe(false);
      expect(t.endsAt).toBeNull();

      // Resume timer
      store.resumeFocusTimer();
      t = useTrackerStore.getState().focusTimer;
      expect(t.isRunning).toBe(true);
      expect(t.endsAt).not.toBeNull();

      // Reset timer
      store.resetFocusTimer();
      t = useTrackerStore.getState().focusTimer;
      expect(t.isRunning).toBe(false);
      expect(t.remainingSeconds).toBe(1500);

      // Complete a simulated 45-minute focus session
      useTrackerStore.setState({
        focusTimer: {
          activeBlockId: "block-dsa",
          isRunning: true,
          remainingSeconds: 0,
          initialSeconds: 2700,
          plannedSeconds: 2700,
          startedAt: Date.now() - 45 * 60 * 1000,
          endsAt: Date.now(),
          mode: "countdown",
        },
      });

      useTrackerStore.getState().completeFocusSession();

      const rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.deepWorkMinutes).toBe(45);
      expect(rec.deepWorkSessions).toHaveLength(1);
      expect(rec.deepWorkSessions?.[0].durationMinutes).toBe(45);
      expect(rec.deepWorkSessions?.[0].blockId).toBe("block-dsa");
      expect(rec.completedBlocks["block-dsa"]).toBe(true);

      // Check habit: 45 min is < 120 min, so deepWork habit flag is still false
      expect(rec.habits.deepWork).toBe(false);

      // Add another 75 minutes to reach 120 minutes target
      useTrackerStore.getState().addDeepWorkMinutes(75);
      const updatedRec = useTrackerStore.getState().getDailyRecord(today);
      expect(updatedRec.deepWorkMinutes).toBe(120);
      expect(updatedRec.habits.deepWork).toBe(true);
    });
  });

  describe("5. Tomorrow Schedule Bug Fix & Schedule Switching", () => {
    it("NEVER mutates today's active timetable when setting tomorrow's schedule", () => {
      const today = getTodayDateString();
      const tomorrow = getTomorrowDateString();

      // Today is 'college'
      useTrackerStore.getState().setDayType("college");
      expect(useTrackerStore.getState().dayType).toBe("college");
      expect(useTrackerStore.getState().getEffectiveDayType(today)).toBe("college");

      // Save daily review setting tomorrow's schedule to 'no-college'
      useTrackerStore.getState().saveDailyReview({
        date: today,
        githubUpdated: true,
        githubCommitsCount: 3,
        wentWell: "All tests passing",
        blockedBy: "None",
        tomorrowPriority: "DSA Trees",
        tomorrowDayType: "no-college",
        moodScore: 5,
        energyScore: 5,
      });

      // Critical assertion: Today's active schedule must REMAIN 'college'
      expect(useTrackerStore.getState().dayType).toBe("college");
      expect(useTrackerStore.getState().getEffectiveDayType(today)).toBe("college");

      // Tomorrow's planned schedule must be 'no-college'
      expect(useTrackerStore.getState().dayTypeByDate[tomorrow]).toBe("no-college");
      expect(useTrackerStore.getState().getEffectiveDayType(tomorrow)).toBe("no-college");
    });

    it("allows overriding past or future date schedules without altering today", () => {
      const today = getTodayDateString();
      const tomorrow = getTomorrowDateString();

      useTrackerStore.getState().setDayTypeForDate(tomorrow, "no-college");
      expect(useTrackerStore.getState().getEffectiveDayType(tomorrow)).toBe("no-college");
      expect(useTrackerStore.getState().getEffectiveDayType(today)).toBe("college");
    });
  });

  describe("6. Midnight Rollover in Asia/Kolkata", () => {
    it("rolls over at midnight IST, preserving previous records and loading configured schedule", () => {
      const yesterday = getYesterdayDateString();
      const today = getTodayDateString();

      // Simulate state where yesterday had activity and planned tomorrow as 'no-college'
      useTrackerStore.setState({
        todayDate: yesterday,
        dayType: "college",
        dayTypeByDate: {
          [today]: "no-college",
        },
      });

      useTrackerStore.getState().incrementDsa(5, undefined, yesterday);
      useTrackerStore.getState().incrementSql(3, undefined, yesterday);

      // Trigger midnight rollover
      const rolledOver = useTrackerStore.getState().checkMidnightRollover();
      expect(rolledOver).toBe(true);

      // Store now reflects new day
      const state = useTrackerStore.getState();
      expect(state.todayDate).toBe(today);
      expect(state.dayType).toBe("no-college"); // Loaded configured schedule for today!

      // New day starts fresh with 0 daily counters
      const todayRec = state.getDailyRecord(today);
      expect(todayRec.dsaCount).toBe(0);
      expect(todayRec.sqlCount).toBe(0);
      expect(todayRec.deepWorkMinutes).toBe(0);

      // Yesterday's records and lifetime totals remain fully preserved
      const yesterdayRec = state.getDailyRecord(yesterday);
      expect(yesterdayRec.dsaCount).toBe(5);
      expect(yesterdayRec.sqlCount).toBe(3);
      expect(state.getLifetimeDsaCount()).toBe(5);
      expect(state.getLifetimeSqlCount()).toBe(3);
    });
  });

  describe("7. Salah and Habit Logical Consistency", () => {
    it("automatically sets salah5 habit only when all 5 prayers are completed", () => {
      const today = getTodayDateString();
      const store = useTrackerStore.getState();

      // Check Fajr, Dhuhr, Asr, Maghrib
      store.toggleSalah("fajr");
      store.toggleSalah("dhuhr");
      store.toggleSalah("asr");
      store.toggleSalah("maghrib");

      let rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.habits.salah5).toBe(false);

      // Check Isha - now all 5 are completed!
      store.toggleSalah("isha");
      rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.habits.salah5).toBe(true);

      // Uncheck Dhuhr - salah5 must become false
      store.toggleSalah("dhuhr");
      rec = useTrackerStore.getState().getDailyRecord(today);
      expect(rec.habits.salah5).toBe(false);
    });

    it("calculates active streak correctly across consecutive active days", () => {
      const yesterday = getYesterdayDateString();
      const today = getTodayDateString();

      // Check prayer yesterday
      useTrackerStore.getState().toggleSalah("fajr", yesterday);
      // Check prayer today
      useTrackerStore.getState().toggleSalah("fajr", today);

      const streak = useTrackerStore.getState().getCurrentStreak();
      expect(streak).toBeGreaterThanOrEqual(2);
    });
  });

  describe("8. Cloud Synchronization Versioning and Optimistic Merging", () => {
    it("increments sync version and handles cloud data hydration without losing local updates", () => {
      const store = useTrackerStore.getState();
      const today = getTodayDateString();

      store.incrementDsa(1);
      const v1 = useTrackerStore.getState().syncVersion;

      store.incrementDsa(1);
      const v2 = useTrackerStore.getState().syncVersion;
      expect(v2).toBe(v1 + 1);

      // Hydrate from cloud with newer version
      useTrackerStore.getState().hydrateFromCloud({
        syncVersion: 10,
        dailyRecords: {
          [today]: {
            date: today,
            dayType: "college",
            dsaCount: 5,
            sqlCount: 3,
            deepWorkMinutes: 60,
            completedBlocks: {},
            salah: { fajr: true, dhuhr: true, asr: false, maghrib: false, isha: false },
            habits: { quran: true, salah5: false, exercise: false, deepWork: false, healthyFoodSleep: false },
            dsaEntries: [],
            sqlEntries: [],
            deepWorkSessions: [],
            version: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      const updated = useTrackerStore.getState().getDailyRecord(today);
      expect(updated.dsaCount).toBe(5);
      expect(updated.sqlCount).toBe(3);
    });
  });
});
