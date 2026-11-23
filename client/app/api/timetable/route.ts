import { NextResponse } from "next/server";
import clientPromise, { isMongoConnected } from "@/lib/mongodb";
import { COLLEGE_DAY_TIMETABLE, NO_COLLEGE_DAY_TIMETABLE } from "@/data/timetable";

export async function GET() {
  try {
    const isConnected = await isMongoConnected();
    if (!isConnected || !clientPromise) {
      return NextResponse.json({
        connected: false,
        templates: {
          college: COLLEGE_DAY_TIMETABLE,
          noCollege: NO_COLLEGE_DAY_TIMETABLE,
        },
      });
    }

    const client = await clientPromise;
    const db = client.db("deen_dunya_tracker");
    const doc = await db.collection("timetables").findOne({ key: "active_templates" });

    return NextResponse.json({
      connected: true,
      templates: doc?.templates || {
        college: COLLEGE_DAY_TIMETABLE,
        noCollege: NO_COLLEGE_DAY_TIMETABLE,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
