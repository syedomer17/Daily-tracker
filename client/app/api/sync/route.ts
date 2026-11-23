import { NextResponse } from "next/server";
import { getDb, isMongoConnected } from "@/lib/mongodb";

export async function GET() {
  try {
    const isConnected = await isMongoConnected();
    if (!isConnected) {
      return NextResponse.json({
        status: "offline",
        message: "MongoDB offline or connecting. LocalStorage active.",
        connected: false,
      });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ status: "offline", connected: false });
    }

    const syncDoc = await db.collection("app_state").findOne({ key: "current_user_state" });

    return NextResponse.json({
      status: "connected",
      connected: true,
      data: syncDoc?.data || null,
      lastSynced: syncDoc?.updatedAt || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { status: "error", error: message, connected: false },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isConnected = await isMongoConnected();

    if (!isConnected) {
      return NextResponse.json({
        status: "local_only",
        message: "Operating in local storage mode.",
        connected: false,
      });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ status: "local_only", connected: false });
    }

    await db.collection("app_state").updateOne(
      { key: "current_user_state" },
      {
        $set: {
          key: "current_user_state",
          data: body,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      status: "synced",
      message: "Synced with MongoDB Atlas (dail-tracking)!",
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
