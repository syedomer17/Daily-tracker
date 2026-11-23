import { NextResponse } from "next/server";
import clientPromise, { isMongoConnected } from "@/lib/mongodb";

export async function GET() {
  try {
    const isConnected = await isMongoConnected();
    if (!isConnected || !clientPromise) {
      return NextResponse.json({
        status: "offline",
        message: "MongoDB running in local mode (Set MONGODB_URI to enable cloud persistence). LocalStorage is active.",
        connected: false,
      });
    }

    const client = await clientPromise;
    const db = client.db("deen_dunya_tracker");
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

    if (!isConnected || !clientPromise) {
      return NextResponse.json({
        status: "local_only",
        message: "Saved locally. Configure MONGODB_URI in .env.local to persist across devices.",
        connected: false,
        receivedBytes: JSON.stringify(body).length,
      });
    }

    const client = await clientPromise;
    const db = client.db("deen_dunya_tracker");

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
      message: "Synced successfully with MongoDB Atlas!",
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
