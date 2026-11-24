import { NextResponse } from "next/server";
import { getDb, isMongoConnected } from "@/lib/mongodb";
import { getAuthenticatedUser, apiError, apiSuccess } from "@/lib/auth-helpers";
import {
  aggregateDateRange,
  calculateAccurateStreak,
  getPlannedVsActual,
  getMissedTasksAnalysis,
} from "@/lib/analytics";
import { COLLEGE_DAY_TIMETABLE, NO_COLLEGE_DAY_TIMETABLE } from "@/data/timetable";
import { getTodayDateString, lastNDates } from "@/lib/utils";
import { DailyRecord } from "@/types";

export async function GET(req: Request) {
  try {
    // 1. Authenticate user server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to access analytics");
    }

    const { searchParams } = new URL(req.url);
    const today = searchParams.get("today") || getTodayDateString();
    const defaultStart = lastNDates(30, new Date())[0];
    const startDate = searchParams.get("startDate") || defaultStart;
    const endDate = searchParams.get("endDate") || today;

    // 2. Check MongoDB connection
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        status: "offline",
        message: "Database is offline. Using local client analytics.",
        connected: false,
        data: null,
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 3. Fetch user daily records
    const recordsCursor = await db
      .collection("user_daily_records")
      .find({ userId: user.id })
      .toArray();

    const dailyRecordsMap: Record<string, DailyRecord> = {};
    recordsCursor.forEach((doc) => {
      dailyRecordsMap[doc.date] = {
        date: doc.date,
        dayType: doc.dayType || "college",
        dsaCount: doc.dsaCount || 0,
        dsaEntries: doc.dsaEntries || [],
        sqlCount: doc.sqlCount || 0,
        sqlEntries: doc.sqlEntries || [],
        deepWorkMinutes: doc.deepWorkMinutes || 0,
        deepWorkSessions: doc.deepWorkSessions || [],
        completedBlocks: doc.completedBlocks || {},
        salah: doc.salah || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
        habits: doc.habits || { quran: false, salah5: false, exercise: false, deepWork: false, healthyFoodSleep: false },
        notes: doc.notes || "",
        version: doc.version || 1,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: doc.updatedAt || new Date().toISOString(),
      };
    });

    // 4. Fetch user tracker state for custom timetables if any
    const trackerDoc = await db.collection("user_tracker_state").findOne({ userId: user.id });
    const collegeTimetable = trackerDoc?.data?.collegeTimetable || COLLEGE_DAY_TIMETABLE;
    const noCollegeTimetable = trackerDoc?.data?.noCollegeTimetable || NO_COLLEGE_DAY_TIMETABLE;
    const dayTypeByDate = trackerDoc?.data?.dayTypeByDate || {};

    // 5. Compute server aggregations
    const streak = calculateAccurateStreak(dailyRecordsMap, today, "all");
    const salahStreak = calculateAccurateStreak(dailyRecordsMap, today, "salah");
    const deepWorkStreak = calculateAccurateStreak(dailyRecordsMap, today, "deepWork");
    const habitsStreak = calculateAccurateStreak(dailyRecordsMap, today, "habits");

    const aggregation = aggregateDateRange({
      dailyRecords: dailyRecordsMap,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
    });

    const plannedVsActual = getPlannedVsActual({
      dailyRecords: dailyRecordsMap,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
    });

    const missedTasks = getMissedTasksAnalysis({
      dailyRecords: dailyRecordsMap,
      collegeTimetable,
      noCollegeTimetable,
      dayTypeByDate,
      startDate,
      endDate,
      todayDate: today,
    });

    return apiSuccess({
      dateRange: { startDate, endDate },
      streaks: {
        all: streak,
        salah: salahStreak,
        deepWork: deepWorkStreak,
        habits: habitsStreak,
      },
      aggregation,
      plannedVsActual,
      missedTasks,
      totalRecordsLogged: recordsCursor.length,
    });
  } catch {
    return apiError(500, "Failed to compute server-side analytics");
  }
}
