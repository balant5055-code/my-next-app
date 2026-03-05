export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .where("chipCode", "!=", null)
      .get();

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { chipCode: null });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      cleared: snapshot.size,
    });
  } catch (error) {
    console.error("Clear Chips Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
