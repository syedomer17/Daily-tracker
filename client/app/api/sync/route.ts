import { NextResponse } from "next/server";
import { getDb, isMongoConnected } from "@/lib/mongodb";
import { getAuthenticatedUser, apiError, apiSuccess, checkPayloadSize } from "@/lib/auth-helpers";
import { SyncPayloadSchema } from "@/lib/validations";
import { DailyRecord } from "@/types";

export async function GET() {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to access tracker data");
    }

    // 2. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        status: "offline",
        message: "Database offline. Operating in local storage mode.",
        connected: false,
        data: null,
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 3. Enforce tenant ownership - fetch user tracker state
    const trackerDoc = await db.collection("user_tracker_state").findOne({ userId: user.id });

    // 4. Fetch all normalized daily records belonging to the authenticated userId
    const dailyRecordsCursor = await db
      .collection("user_daily_records")
      .find({ userId: user.id })
      .toArray();

    const dailyRecordsMap: Record<string, DailyRecord> = {};
    dailyRecordsCursor.forEach((doc) => {
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

    if (!trackerDoc && dailyRecordsCursor.length === 0) {
      return apiSuccess({
        status: "connected",
        connected: true,
        data: null,
        lastSynced: null,
      });
    }

    const responseData = {
      ...(trackerDoc?.data || {}),
      dailyRecords: dailyRecordsMap,
    };

    return apiSuccess({
      status: "connected",
      connected: true,
      data: responseData,
      lastSynced: trackerDoc?.updatedAt || null,
    });
  } catch {
    return apiError(500, "An error occurred while fetching tracker state");
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to sync progress");
    }

    // 2. Prevent oversized payloads
    if (!checkPayloadSize(req, 2 * 1024 * 1024)) {
      return apiError(413, "Payload exceeds maximum allowed size (2MB)");
    }

    // 3. Parse and validate payload using Zod
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError(400, "Invalid JSON payload");
    }

    const validationResult = SyncPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError(400, "Validation failed", validationResult.error.format());
    }

    const validData = validationResult.data;

    // 4. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        status: "local_only",
        message: "Operating in local storage mode",
        connected: false,
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    const now = new Date().toISOString();

    // 5. Upsert normalized daily records individually to prevent race condition overwrites
    if (validData.dailyRecords) {
      const recordsCollection = db.collection("user_daily_records");

      for (const [date, record] of Object.entries(validData.dailyRecords)) {
        const existing = await recordsCollection.findOne({ userId: user.id, date });

        if (existing) {
          // Conflict Resolution: Never let a stale update overwrite newer cloud records
          if (existing.version > record.version) {
            // Keep existing cloud version or merge non-conflicting entries
            continue;
          }

          const nextVersion = Math.max(record.version, (existing.version || 0) + 1);
          await recordsCollection.updateOne(
            { userId: user.id, date },
            {
              $set: {
                dayType: record.dayType,
                dsaCount: record.dsaCount,
                dsaEntries: record.dsaEntries || [],
                sqlCount: record.sqlCount,
                sqlEntries: record.sqlEntries || [],
                deepWorkMinutes: record.deepWorkMinutes,
                deepWorkSessions: record.deepWorkSessions || [],
                completedBlocks: record.completedBlocks,
                salah: record.salah,
                habits: record.habits,
                notes: record.notes || "",
                version: nextVersion,
                updatedAt: now,
              },
            }
          );
        } else {
          await recordsCollection.insertOne({
            userId: user.id,
            date,
            dayType: record.dayType,
            dsaCount: record.dsaCount,
            dsaEntries: record.dsaEntries || [],
            sqlCount: record.sqlCount,
            sqlEntries: record.sqlEntries || [],
            deepWorkMinutes: record.deepWorkMinutes,
            deepWorkSessions: record.deepWorkSessions || [],
            completedBlocks: record.completedBlocks,
            salah: record.salah,
            habits: record.habits,
            notes: record.notes || "",
            version: record.version || 1,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // 6. Save top-level roadmap, review, and template states
    await db.collection("user_tracker_state").updateOne(
      { userId: user.id },
      {
        $set: {
          userId: user.id,
          data: {
            dayType: validData.dayType,
            dayTypeByDate: validData.dayTypeByDate || {},
            weeklyGoals: validData.weeklyGoals || [],
            milestones: validData.milestones || [],
            dailyReviews: validData.dailyReviews || [],
            dsaCount: validData.dsaCount,
            sqlCount: validData.sqlCount,
            deepWorkMinutesToday: validData.deepWorkMinutesToday,
          },
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return apiSuccess({
      status: "synced",
      message: "Synced securely to your personal account",
      connected: true,
      timestamp: now,
    });
  } catch {
    return apiError(500, "An error occurred while saving tracker state");
  }
}
