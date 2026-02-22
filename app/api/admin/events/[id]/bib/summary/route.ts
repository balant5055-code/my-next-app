export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";

export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = await context.params; // 👈 IMPORTANT: await here

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const eventId = id;

    const eventRef = adminDb.collection("events").doc(id);
    interface EventCategory {
      id: string;
      title: string;
      distance: string;
      bibStart?: number;
      bibEnd?: number;
      nextBib?: number;
    }

    interface EventData {
      categories?: EventCategory[];
    }
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data() as EventData;

    if (!eventData) {
      return NextResponse.json(
        { error: "Event data missing" },
        { status: 500 },
      );
    }

    const categories = eventData.categories ?? [];

    const summary: any = {};

    for (const category of categories) {
      const distance = category.distance;

      const rangeStart = category.bibStart;
      const rangeEnd = category.bibEnd;

      if (!rangeStart || !rangeEnd) continue;

      const confirmedSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.distance", "==", distance)
        .where("status", "==", "CONFIRMED")
        .get();

      const confirmed = confirmedSnap.size;

      const assignedSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.distance", "==", distance)
        .where("bibNumber", ">", 0)
        .get();

      const assigned = assignedSnap.size;

      const remaining = Math.max(confirmed - assigned, 0);

      const capacity = rangeEnd - rangeStart + 1;
      const available = capacity - assigned;

      summary[distance] = {
        confirmed,
        assigned,
        remaining,
        rangeStart,
        rangeEnd,
        capacity,
        available,
        nextBib: category.nextBib,
        canGenerate: remaining > 0 && available >= remaining,
      };
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("BIB SUMMARY ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
