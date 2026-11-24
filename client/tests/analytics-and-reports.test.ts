/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateAccurateStreak,
  getCompletionPercentage,
  aggregateDateRange,
  getPlannedVsActual,
  getMissedTasksAnalysis,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
} from "@/lib/analytics";
import { exportDailyRecordsToCsv, exportAnalyticsToJson } from "@/lib/export";
import { GET as getAnalyticsRoute } from "@/app/api/analytics/route";
import * as authModule from "@/auth";
import * as mongoModule from "@/lib/mongodb";
import { DailyRecord, TimeBlock } from "@/types";
import { COLLEGE_DAY_TIMETABLE } from "@/data/timetable";
import { getTodayDateString } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";

describe("Productivity Analytics & Reporting System (Task 3)", () => {
  const sampleTimetable: TimeBlock[] = [
    {
      id: "b1",
      title: "Tahajjud & Fajr",
      category: "deen",
      startTime: "05:00",
      endTime: "06:00",
      description: "Morning prayer",
    },
    {
      id: "b2",
      title: "DSA Practice",
      category: "tech",
      startTime: "07:00",
      endTime: "08:30",
      description: "LeetCode arrays & trees",
    },
    {
      id: "b3",
      title: "College Commute & Lectures",
      category: "college",
      startTime: "09:00",
      endTime: "14:00",
      description: "Academics",
    },
    {
      id: "b4",
      title: "Evening Workout",
      category: "health",
      startTime: "18:00",
      endTime: "19:00",
      description: "Calisthenics",
    },
  ];

  const buildMockRecord = (overrides: Partial<DailyRecord> = {}): DailyRecord => ({
    date: "2026-11-20",
    dayType: "college",
    dsaCount: 0,
    dsaEntries: [],
    sqlCount: 0,
    sqlEntries: [],
    deepWorkMinutes: 0,
    deepWorkSessions: [],
    completedBlocks: {},
    salah: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
    habits: { quran: false, salah5: false, exercise: false, deepWork: false, healthyFoodSleep: false },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  // =========================================================================
  // 1. STREAK ENGINE TESTS
  // =========================================================================
  describe("1. Accurate Streak & Consistency Engine", () => {
    it("never counts untouched or empty days as completed", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-18": buildMockRecord({ date: "2026-11-18" }), // untouched
        "2026-11-19": buildMockRecord({ date: "2026-11-19" }), // untouched
        "2026-11-20": buildMockRecord({ date: "2026-11-20" }), // untouched
      };

      const result = calculateAccurateStreak(records, "2026-11-20", "all");
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.activeDaysCount).toBe(0);
    });

    it("counts today if active, and maintains continuity when today is in-progress but yesterday was active", () => {
      // Scenario A: Yesterday active, today NOT yet active -> streak is alive (1 from yesterday)
      const recordsA: Record<string, DailyRecord> = {
        "2026-11-19": buildMockRecord({ date: "2026-11-19", dsaCount: 3 }),
        "2026-11-20": buildMockRecord({ date: "2026-11-20" }), // today untouched
      };
      const resultA = calculateAccurateStreak(recordsA, "2026-11-20", "all");
      expect(resultA.currentStreak).toBe(1);

      // Scenario B: Today completes an action -> streak becomes 2!
      const recordsB: Record<string, DailyRecord> = {
        "2026-11-19": buildMockRecord({ date: "2026-11-19", dsaCount: 3 }),
        "2026-11-20": buildMockRecord({ date: "2026-11-20", dsaCount: 2 }),
      };
      const resultB = calculateAccurateStreak(recordsB, "2026-11-20", "all");
      expect(resultB.currentStreak).toBe(2);

      // Scenario C: Both yesterday and today are inactive -> streak is 0
      const recordsC: Record<string, DailyRecord> = {
        "2026-11-18": buildMockRecord({ date: "2026-11-18", dsaCount: 1 }), // 2 days ago active
        "2026-11-19": buildMockRecord({ date: "2026-11-19" }), // yesterday inactive
        "2026-11-20": buildMockRecord({ date: "2026-11-20" }), // today inactive
      };
      const resultC = calculateAccurateStreak(recordsC, "2026-11-20", "all");
      expect(resultC.currentStreak).toBe(0);
      // But longest streak remembers the past run
      expect(resultC.longestStreak).toBe(1);
    });

    it("strictly ignores future dates beyond today", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-20": buildMockRecord({ date: "2026-11-20", dsaCount: 2 }),
        "2026-11-21": buildMockRecord({ date: "2026-11-21", dsaCount: 5 }), // future date
        "2026-11-22": buildMockRecord({ date: "2026-11-22", dsaCount: 5 }), // future date
      };

      const result = calculateAccurateStreak(records, "2026-11-20", "all");
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });

    it("accurately calculates historical longest streak across past broken runs", () => {
      const records: Record<string, DailyRecord> = {
        // Run 1: 3 consecutive days
        "2026-11-01": buildMockRecord({ date: "2026-11-01", dsaCount: 1 }),
        "2026-11-02": buildMockRecord({ date: "2026-11-02", dsaCount: 1 }),
        "2026-11-03": buildMockRecord({ date: "2026-11-03", dsaCount: 1 }),
        // Gap: 2026-11-04 inactive
        // Run 2: 5 consecutive days (longest)
        "2026-11-05": buildMockRecord({ date: "2026-11-05", sqlCount: 2 }),
        "2026-11-06": buildMockRecord({ date: "2026-11-06", sqlCount: 2 }),
        "2026-11-07": buildMockRecord({ date: "2026-11-07", sqlCount: 2 }),
        "2026-11-08": buildMockRecord({ date: "2026-11-08", sqlCount: 2 }),
        "2026-11-09": buildMockRecord({ date: "2026-11-09", sqlCount: 2 }),
        // Gap: 2026-11-10 inactive
        // Current Run: 2 days up to today (2026-11-12)
        "2026-11-11": buildMockRecord({ date: "2026-11-11", deepWorkMinutes: 60 }),
        "2026-11-12": buildMockRecord({ date: "2026-11-12", deepWorkMinutes: 90 }),
      };

      const result = calculateAccurateStreak(records, "2026-11-12", "all");
      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(5);
      expect(result.activeDaysCount).toBe(10);
    });

    it("evaluates pillar-specific streaks (Salah 5/5, Habits, Deep Work)", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-10": buildMockRecord({
          date: "2026-11-10",
          salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
          habits: { quran: true, salah5: true, exercise: true, deepWork: true, healthyFoodSleep: true },
          deepWorkMinutes: 120,
        }),
        "2026-11-11": buildMockRecord({
          date: "2026-11-11",
          salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: false }, // missed isha!
          habits: { quran: true, salah5: false, exercise: true, deepWork: true, healthyFoodSleep: true },
          deepWorkMinutes: 60,
        }),
      };

      // On 2026-11-12 (after 11th has passed), 11th had missing Isha, so streak is broken
      const salahStreak = calculateAccurateStreak(records, "2026-11-12", "salah");
      expect(salahStreak.currentStreak).toBe(0); // broken on 11th because Isha was false
      expect(salahStreak.longestStreak).toBe(1);

      // Deep work streak requires deepWorkMinutes > 0
      const deepWorkStreak = calculateAccurateStreak(records, "2026-11-11", "deepWork");
      expect(deepWorkStreak.currentStreak).toBe(2);
      expect(deepWorkStreak.longestStreak).toBe(2);
    });
  });

  // =========================================================================
  // 2. AGGREGATIONS & COMPLETION PERCENTAGE
  // =========================================================================
  describe("2. Date Range Aggregations & Daily Score", () => {
    it("calculates accurate balanced completion percentages", () => {
      // 1 block completed out of 4 (10%), 5 prayers (30%), 5 habits (20%), 90 min deep work (10%)
      const record = buildMockRecord({
        completedBlocks: { b1: true },
        salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
        habits: { quran: true, salah5: true, exercise: true, deepWork: true, healthyFoodSleep: true },
        deepWorkMinutes: 90,
      });

      const score = getCompletionPercentage(record, sampleTimetable);
      // (1/4)*40 + (5/5)*30 + (5/5)*20 + (90/90)*10 = 10 + 30 + 20 + 10 = 70%
      expect(score).toBe(70);
    });

    it("aggregates date ranges without NaN or divide-by-zero on empty datasets", () => {
      const emptyResult = aggregateDateRange({
        dailyRecords: {},
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: "2026-11-01",
        endDate: "2026-11-07",
      });

      expect(emptyResult.daysCount).toBe(7);
      expect(emptyResult.activeDaysCount).toBe(0);
      expect(emptyResult.totalDsa).toBe(0);
      expect(emptyResult.totalSql).toBe(0);
      expect(emptyResult.totalDeepWorkHours).toBe(0);
      expect(emptyResult.averageDailyCompletion).toBe(0);
      expect(emptyResult.salahAdherenceRate).toBe(0);
      expect(emptyResult.habitAdherenceRate).toBe(0);
    });

    it("correctly handles unrecorded intermediate days in range aggregations", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-01": buildMockRecord({
          date: "2026-11-01",
          dsaCount: 5,
          sqlCount: 3,
          deepWorkMinutes: 120,
          salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
        }),
        // 2026-11-02 unrecorded
        "2026-11-03": buildMockRecord({
          date: "2026-11-03",
          dsaCount: 3,
          sqlCount: 2,
          deepWorkMinutes: 60,
          salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
        }),
      };

      const result = aggregateDateRange({
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: "2026-11-01",
        endDate: "2026-11-03",
      });

      expect(result.daysCount).toBe(3);
      expect(result.activeDaysCount).toBe(2);
      expect(result.totalDsa).toBe(8);
      expect(result.totalSql).toBe(5);
      expect(result.totalDeepWorkMinutes).toBe(180);
      expect(result.totalDeepWorkHours).toBe(3);
      // 10 prayers total across 3 days (15 possible) -> (10/15)*100 = 67%
      expect(result.salahAdherenceRate).toBe(67);
    });
  });

  // =========================================================================
  // 3. PLANNED VS ACTUAL ANALYSIS
  // =========================================================================
  describe("3. Planned vs Actual Study & Routine Comparison", () => {
    it("never assumes uncompleted scheduled blocks were completed", () => {
      // User scheduled a timetable with Tech block (b2 = 1.5 hrs), but didn't mark it done
      const records: Record<string, DailyRecord> = {
        "2026-11-20": buildMockRecord({
          date: "2026-11-20",
          completedBlocks: {}, // nothing marked done!
          deepWorkMinutes: 0,
        }),
      };

      const pva = getPlannedVsActual({
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: "2026-11-20",
        endDate: "2026-11-20",
      });

      expect(pva.plannedStudyHours).toBe(1.5); // block b2 was scheduled
      expect(pva.actualStudyHours).toBe(0);    // but zero actual work logged
      expect(pva.studyAdherencePercent).toBe(0);
    });

    it("credits actual study hours when blocks are completed or deep work is logged without double counting", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-20": buildMockRecord({
          date: "2026-11-20",
          completedBlocks: { b2: true }, // 1.5h
          deepWorkMinutes: 90,           // 1.5h
        }),
      };

      const pva = getPlannedVsActual({
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: "2026-11-20",
        endDate: "2026-11-20",
      });

      expect(pva.plannedStudyHours).toBe(1.5);
      expect(pva.actualStudyHours).toBe(1.5);
      expect(pva.studyAdherencePercent).toBe(100);
    });
  });

  // =========================================================================
  // 4. MISSED-TASK & ROUTINE DIAGNOSTICS
  // =========================================================================
  describe("4. Missed-Task & Routine Diagnostics", () => {
    it("accurately distinguishes between incomplete and not-yet-due tasks", () => {
      const today = "2026-11-20";
      // Suppose current time is 08:00
      // Block b1 (05:00-06:00) has elapsed -> missed
      // Block b2 (07:00-08:30) is currently in progress / not elapsed -> not-yet-due
      // Block b3 (09:00-14:00) is in future -> not-yet-due
      const records: Record<string, DailyRecord> = {
        [today]: buildMockRecord({
          date: today,
          completedBlocks: {},
        }),
      };

      const diagnostics = getMissedTasksAnalysis({
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: today,
        endDate: today,
        todayDate: today,
        currentTimeKolkata: "08:00",
      });

      const missedTitles = diagnostics.missedBlocks.map((b) => b.title);
      expect(missedTitles).toContain("Tahajjud & Fajr");
      expect(missedTitles).not.toContain("College Commute & Lectures");
    });

    it("ranks habit misses and flags low focus days", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-18": buildMockRecord({
          date: "2026-11-18",
          habits: { quran: true, salah5: true, exercise: false, deepWork: false, healthyFoodSleep: true },
          deepWorkMinutes: 15, // <30 mins -> low focus
        }),
        "2026-11-19": buildMockRecord({
          date: "2026-11-19",
          habits: { quran: true, salah5: true, exercise: false, deepWork: false, healthyFoodSleep: false },
          deepWorkMinutes: 0,  // low focus
        }),
      };

      const diagnostics = getMissedTasksAnalysis({
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        startDate: "2026-11-18",
        endDate: "2026-11-19",
        todayDate: "2026-11-20",
      });

      expect(diagnostics.lowFocusDays.length).toBe(2);
      // Exercise was missed 2 out of 2 times -> lowest adherence
      const exerciseStat = diagnostics.habitMisses.find((h) => h.habitKey === "exercise");
      expect(exerciseStat?.adherencePercent).toBe(0);
    });
  });

  // =========================================================================
  // 5. DAILY, WEEKLY & MONTHLY EXECUTIVE REPORTS
  // =========================================================================
  describe("5. Executive Reports", () => {
    it("generates daily report with review reflection and task states", () => {
      const date = "2026-11-20";
      const records: Record<string, DailyRecord> = {
        [date]: buildMockRecord({
          date,
          completedBlocks: { b1: true },
          salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
          deepWorkMinutes: 90,
          dsaCount: 3,
        }),
      };

      const dailyReviews = [
        {
          id: "r1",
          date,
          githubUpdated: true,
          githubCommitsCount: 4,
          wentWell: "Solved 3 dynamic programming problems smoothly",
          blockedBy: "None",
          tomorrowPriority: "Graphs BFS/DFS",
          tomorrowDayType: "college" as const,
          moodScore: 5,
          energyScore: 4,
          createdAt: new Date().toISOString(),
        },
      ];

      const report = getDailyReport({
        date,
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
        dailyReviews,
        todayDate: date,
        currentTimeKolkata: "23:00",
      });

      expect(report.completedTasks.length).toBe(1);
      expect(report.completedTasks[0].block.id).toBe("b1");
      expect(report.dsaCount).toBe(3);
      expect(report.deepWorkMinutes).toBe(90);
      expect(report.review?.wentWell).toContain("Solved 3 dynamic programming");
      expect(report.review?.moodScore).toBe(5);
    });

    it("generates 7-day weekly report with strongest/weakest day and WoW shifts", () => {
      const records: Record<string, DailyRecord> = {
        // Current week
        "2026-11-14": buildMockRecord({ date: "2026-11-14", dsaCount: 2, completedBlocks: { b1: true } }),
        "2026-11-15": buildMockRecord({ date: "2026-11-15", dsaCount: 4, completedBlocks: { b1: true, b2: true, b3: true, b4: true } }), // strongest (100%)
        "2026-11-16": buildMockRecord({ date: "2026-11-16" }), // weakest (0%)
        "2026-11-17": buildMockRecord({ date: "2026-11-17", dsaCount: 1, completedBlocks: { b1: true } }),
        "2026-11-18": buildMockRecord({ date: "2026-11-18", dsaCount: 2, completedBlocks: { b1: true } }),
        "2026-11-19": buildMockRecord({ date: "2026-11-19", dsaCount: 2, completedBlocks: { b1: true } }),
        "2026-11-20": buildMockRecord({ date: "2026-11-20", dsaCount: 1, completedBlocks: { b1: true } }),
      };

      const report = getWeeklyReport({
        weekEndDate: "2026-11-20",
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
      });

      expect(report.dailyStats.length).toBe(7);
      expect(report.strongestDay?.date).toBe("2026-11-15");
      expect(report.weakestDay?.date).toBe("2026-11-16");
      expect(report.totalDsa).toBe(12);
    });

    it("generates monthly report with consistency rate and MoM calculations", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-01": buildMockRecord({ date: "2026-11-01", dsaCount: 3, deepWorkMinutes: 90 }),
        "2026-11-15": buildMockRecord({ date: "2026-11-15", dsaCount: 2, deepWorkMinutes: 60 }),
      };

      const report = getMonthlyReport({
        yearMonth: "2026-11",
        dailyRecords: records,
        collegeTimetable: sampleTimetable,
        noCollegeTimetable: sampleTimetable,
      });

      expect(report.yearMonth).toBe("2026-11");
      expect(report.daysInMonth).toBe(30);
      expect(report.totalDsa).toBe(5);
      expect(report.totalDeepWorkHours).toBe(2.5);
    });
  });

  // =========================================================================
  // 6. CSV & JSON EXPORT UTILITIES
  // =========================================================================
  describe("6. Export Utilities", () => {
    it("handles CSV and JSON export without crashing in browser and test environments", () => {
      const records: Record<string, DailyRecord> = {
        "2026-11-20": buildMockRecord({
          date: "2026-11-20",
          notes: 'Completed "Two Sum" & practiced JOINs',
          dsaCount: 1,
        }),
      };

      // Mock DOM methods for download link
      const clickMock = vi.fn();
      const appendMock = vi.fn();
      const removeMock = vi.fn();

      vi.stubGlobal("document", {
        createElement: () => ({
          setAttribute: vi.fn(),
          click: clickMock,
        }),
        body: {
          appendChild: appendMock,
          removeChild: removeMock,
        },
      });

      vi.stubGlobal("URL", {
        createObjectURL: vi.fn(() => "mock-blob-url"),
        revokeObjectURL: vi.fn(),
      });

      // Trigger CSV export
      exportDailyRecordsToCsv(records);
      expect(clickMock).toHaveBeenCalled();

      // Trigger JSON export
      exportAnalyticsToJson({ summary: "test" });
      expect(clickMock).toHaveBeenCalledTimes(2);

      vi.unstubAllGlobals();
    });
  });

  // =========================================================================
  // 7. CONFIGURABLE CAREER ROADMAP IN STORE
  // =========================================================================
  describe("7. Configurable Career Roadmap Targets", () => {
    it("updates configurable roadmap targets and checklist items in Zustand store", () => {
      useTrackerStore.getState().setRoadmapTarget("dsa", 200);
      useTrackerStore.getState().setRoadmapTarget("sql", 120);

      expect(useTrackerStore.getState().roadmapTargets.dsa).toBe(200);
      expect(useTrackerStore.getState().roadmapTargets.sql).toBe(120);

      // Add checklist item to milestone
      const milestones = useTrackerStore.getState().milestones;
      if (milestones.length > 0) {
        const mId = milestones[0].id;
        const initialCount = milestones[0].checklist.length;
        useTrackerStore.getState().addMilestoneChecklistItem(mId, "Build production CI/CD pipeline");
        const updated = useTrackerStore.getState().milestones.find((m) => m.id === mId);
        expect(updated?.checklist.length).toBe(initialCount + 1);
      }
    });
  });

  // =========================================================================
  // 8. SERVER-SIDE ANALYTICS API ENDPOINT
  // =========================================================================
  describe("8. Authenticated Analytics API Endpoint (/api/analytics)", () => {
    let mockCollections: Record<string, any[]> = {};

    const createMockDb = () => ({
      collection: (name: string) => ({
        findOne: vi.fn(async (query: any) => {
          const items = mockCollections[name] || [];
          return items.find((item) => item.userId === query.userId) || null;
        }),
        find: vi.fn((query: any) => {
          const items = mockCollections[name] || [];
          const filtered = items.filter((item) => item.userId === query.userId);
          const cursor: any = {
            toArray: vi.fn(async () => filtered),
            sort: vi.fn(() => cursor),
            project: vi.fn(() => cursor),
          };
          return cursor;
        }),
      }),
    });

    beforeEach(() => {
      const today = getTodayDateString();
      mockCollections = {
        user_daily_records: [
          {
            userId: "user-1",
            date: today,
            dayType: "college",
            dsaCount: 3,
            sqlCount: 2,
            deepWorkMinutes: 90,
            completedBlocks: {},
            salah: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
            habits: { quran: true, salah5: true, exercise: true, deepWork: true, healthyFoodSleep: true },
          },
          {
            userId: "user-2", // Other user's data (must never leak!)
            date: today,
            dayType: "college",
            dsaCount: 99,
            sqlCount: 99,
          },
        ],
        user_tracker_state: [
          {
            userId: "user-1",
            data: { collegeTimetable: COLLEGE_DAY_TIMETABLE },
          },
        ],
      };

      vi.spyOn(mongoModule, "isMongoConnected").mockResolvedValue(true);
      vi.spyOn(mongoModule, "getDb").mockResolvedValue(createMockDb() as any);
    });

    it("rejects unauthenticated requests with 401 status", async () => {
      vi.spyOn(authModule, "auth").mockResolvedValue(null as any);

      const req = new Request("http://localhost:3000/api/analytics");
      const res = await getAnalyticsRoute(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Authentication required");
    });

    it("returns strictly tenant-isolated analytics for authenticated user", async () => {
      vi.spyOn(authModule, "auth").mockResolvedValue({
        user: { id: "user-1", name: "Omer", email: "omer@example.com" },
      } as any);

      const today = getTodayDateString();
      const req = new Request(`http://localhost:3000/api/analytics?startDate=${today}&endDate=${today}`);
      const res = await getAnalyticsRoute(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.totalRecordsLogged).toBe(1);
      // user-1 has dsaCount: 3, NOT user-2's 99!
      expect(json.aggregation.totalDsa).toBe(3);
      expect(json.aggregation.totalSql).toBe(2);
      expect(json.streaks.all.currentStreak).toBe(1);
    });
  });
});
