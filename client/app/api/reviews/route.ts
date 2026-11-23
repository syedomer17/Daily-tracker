import { NextResponse } from "next/server";
import clientPromise, { isMongoConnected } from "@/lib/mongodb";

export async function GET() {
  try {
    const isConnected = await isMongoConnected();
    if (!isConnected || !clientPromise) {
      return NextResponse.json({
        connected: false,
        reviews: [],
        message: "Operating in local storage mode",
      });
    }

    const client = await clientPromise;
    const db = client.db("deen_dunya_tracker");
    const reviews = await db.collection("reviews").find().sort({ date: -1 }).toArray();

    return NextResponse.json({
      connected: true,
      reviews,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isConnected = await isMongoConnected();

    if (!isConnected || !clientPromise) {
      return NextResponse.json({
        connected: false,
        savedLocally: true,
        review: body,
      });
    }

    const client = await clientPromise;
    const db = client.db("deen_dunya_tracker");

    const result = await db.collection("reviews").updateOne(
      { date: body.date },
      { $set: { ...body, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({
      connected: true,
      success: true,
      id: result.upsertedId || body.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
