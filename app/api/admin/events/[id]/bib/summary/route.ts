export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";

/* ---------------- DISTANCE NORMALIZER ---------------- */

function normalizeDistance(value: any) {
  if (!value) return "";
  const match = String(value).match(/\d+/);
  return match ? String(Number(match[0])) : "";
}

/* ---------------------------------------------------- */

export async function GET(req: NextRequest, context: any) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(id);

    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();

    const categories = eventData?.categories || [];

    const summary: any = {};

    for (const category of categories) {
      const distance = normalizeDistance(category.distance);

      const rangeStart = category.bibStart;
      const rangeEnd = category.bibEnd;

      if (!rangeStart || !rangeEnd) continue;

      /* ---------------- CONFIRMED COUNT ---------------- */

      const confirmedAgg = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.categoryDistance", "==", distance)
        .where("status", "==", "CONFIRMED")
        .count()
        .get();

      const confirmed = confirmedAgg.data().count;

      /* ---------------- ASSIGNED COUNT ---------------- */

      const assignedAgg = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.categoryDistance", "==", distance)
        .where("participant.bibNumber", ">", 0)
        .count()
        .get();

      const assigned = assignedAgg.data().count;

      /* ---------------- CALCULATIONS ---------------- */

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
