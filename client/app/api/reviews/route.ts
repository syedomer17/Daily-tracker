import { NextResponse } from "next/server";
import { getDb, isMongoConnected } from "@/lib/mongodb";
import { getAuthenticatedUser, apiError, apiSuccess, checkPayloadSize } from "@/lib/auth-helpers";
import { ReviewPayloadSchema } from "@/lib/validations";

export async function GET() {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to view reviews");
    }

    // 2. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        connected: false,
        reviews: [],
        message: "Operating in local mode",
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 3. Enforce tenant ownership - fetch ONLY reviews belonging to the authenticated user
    const reviews = await db
      .collection("user_reviews")
      .find({ userId: user.id })
      .sort({ date: -1 })
      .project({ _id: 0, userId: 0 })
      .toArray();

    return apiSuccess({
      connected: true,
      reviews,
    });
  } catch {
    return apiError(500, "An error occurred while fetching reviews");
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify authentication server-side
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to submit review");
    }

    // 2. Prevent oversized payloads
    if (!checkPayloadSize(req, 128 * 1024)) {
      return apiError(413, "Payload exceeds maximum allowed size (128KB)");
    }

    // 3. Parse and validate payload using Zod
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError(400, "Invalid JSON payload");
    }

    const validationResult = ReviewPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError(400, "Validation failed", validationResult.error.format());
    }

    const validReview = validationResult.data;

    // 4. Check database connectivity
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        connected: false,
        savedLocally: true,
        review: validReview,
      });
    }

    const db = await getDb();
    if (!db) {
      return apiError(503, "Database service temporarily unavailable");
    }

    // 5. Enforce tenant ownership - save review strictly associated with userId and date
    const now = new Date().toISOString();
    await db.collection("user_reviews").updateOne(
      { userId: user.id, date: validReview.date },
      {
        $set: {
          userId: user.id,
          ...validReview,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return apiSuccess({
      connected: true,
      date: validReview.date,
      timestamp: now,
    });
  } catch {
    return apiError(500, "An error occurred while saving review");
  }
}
