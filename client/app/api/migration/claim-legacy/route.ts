import { getDb, isMongoConnected } from "@/lib/mongodb";
import { getAuthenticatedUser, apiError, apiSuccess } from "@/lib/auth-helpers";
import { ClaimLegacyPayloadSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required");
    }

    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return apiSuccess({ availableToClaim: false, message: "Database offline" });
    }

    const db = await getDb();
    if (!db) return apiError(503, "Database unavailable");

    const legacyDoc = await db.collection("app_state").findOne({ key: "current_user_state" });
    if (!legacyDoc || !legacyDoc.data) {
      return apiSuccess({ availableToClaim: false });
    }

    if (legacyDoc.claimed) {
      return apiSuccess({
        availableToClaim: false,
        alreadyClaimed: true,
        claimedByCurrentUser: legacyDoc.claimedByUserId === user.id,
      });
    }

    // Check if current user already has existing private state
    const userState = await db.collection("user_tracker_state").findOne({ userId: user.id });

    return apiSuccess({
      availableToClaim: true,
      userHasExistingData: Boolean(userState?.data),
      legacyUpdatedAt: legacyDoc.updatedAt || null,
      preview: {
        dsaCount: legacyDoc.data.dsaCount ?? 0,
        sqlCount: legacyDoc.data.sqlCount ?? 0,
        deepWorkMinutes: legacyDoc.data.deepWorkMinutesToday ?? 0,
      },
    });
  } catch {
    return apiError(500, "Error checking legacy state");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "Authentication required to claim data");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError(400, "Invalid JSON body");
    }

    const validation = ClaimLegacyPayloadSchema.safeParse(body);
    if (!validation.success) {
      return apiError(400, "Confirmation required", validation.error.format());
    }

    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return apiError(503, "Database unavailable to execute migration");
    }

    const db = await getDb();
    if (!db) return apiError(503, "Database unavailable");

    const legacyDoc = await db.collection("app_state").findOne({ key: "current_user_state" });
    if (!legacyDoc || !legacyDoc.data) {
      return apiError(404, "No legacy data found to claim");
    }

    if (legacyDoc.claimed && legacyDoc.claimedByUserId !== user.id) {
      return apiError(403, "This legacy data has already been claimed by another account");
    }

    // 1. Back up legacy records before migration
    await db.collection("legacy_backups").insertOne({
      backupType: "legacy_app_state_claim",
      originalKey: "current_user_state",
      claimedByUserId: user.id,
      originalData: legacyDoc.data,
      originalUpdatedAt: legacyDoc.updatedAt,
      backedUpAt: new Date(),
    });

    // 2. Transfer data into user's private store
    const now = new Date().toISOString();
    await db.collection("user_tracker_state").updateOne(
      { userId: user.id },
      {
        $set: {
          userId: user.id,
          data: legacyDoc.data,
          updatedAt: now,
          migratedFromLegacy: true,
        },
      },
      { upsert: true }
    );

    // 3. Mark the legacy record as claimed
    await db.collection("app_state").updateOne(
      { key: "current_user_state" },
      {
        $set: {
          claimed: true,
          claimedByUserId: user.id,
          claimedAt: now,
        },
      }
    );

    return apiSuccess({
      claimed: true,
      message: "Legacy progress successfully claimed and migrated to your account",
      data: legacyDoc.data,
    });
  } catch {
    return apiError(500, "An error occurred while claiming legacy data");
  }
}
