import { NextResponse } from "next/server";
import { getDb, isMongoConnected } from "@/lib/mongodb";
import { getAuthenticatedUser, apiError, apiSuccess, checkPayloadSize } from "@/lib/auth-helpers";
import { TimetablePayloadSchema } from "@/lib/validations";
import { COLLEGE_DAY_TIMETABLE, NO_COLLEGE_DAY_TIMETABLE } from "@/data/timetable";

export async function GET() {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to access personal timetable");
    }

    // 2. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        connected: false,
        templates: {
          college: COLLEGE_DAY_TIMETABLE,
          noCollege: NO_COLLEGE_DAY_TIMETABLE,
        },
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 3. Enforce tenant ownership - fetch only custom templates for the authenticated user
    const doc = await db.collection("user_timetables").findOne({ userId: user.id });

    return apiSuccess({
      connected: true,
      templates: doc?.templates || {
        college: COLLEGE_DAY_TIMETABLE,
        noCollege: NO_COLLEGE_DAY_TIMETABLE,
      },
    });
  } catch {
    return apiError(500, "An error occurred while fetching timetable templates");
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to update timetable");
    }

    // 2. Prevent oversized payloads
    if (!checkPayloadSize(req, 256 * 1024)) {
      return apiError(413, "Payload exceeds maximum allowed size (256KB)");
    }

    // 3. Parse and validate payload using Zod
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError(400, "Invalid JSON payload");
    }

    const validationResult = TimetablePayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError(400, "Validation failed", validationResult.error.format());
    }

    const validPayload = validationResult.data;

    // 4. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        connected: false,
        savedLocally: true,
        templates: validPayload.templates,
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 5. Enforce tenant ownership - save strictly associated with userId
    const now = new Date().toISOString();
    await db.collection("user_timetables").updateOne(
      { userId: user.id },
      {
        $set: {
          userId: user.id,
          templates: validPayload.templates,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return apiSuccess({
      connected: true,
      message: "Timetable updated successfully",
      timestamp: now,
    });
  } catch {
    return apiError(500, "An error occurred while saving timetable");
  }
}
