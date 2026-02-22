export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";

export async function POST(req: NextRequest, context: any) {
  try {
    await requireRole(req, ["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;
    const body = await req.json();
    const { distance } = body;

    if (!id || !distance) {
      return NextResponse.json(
        { error: "Missing event or distance" },
        { status: 400 },
      );
    }

    const eventRef = adminDb.collection("events").doc(id);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const categories = eventData?.categories || [];

    const category = categories.find((c: any) => c.distance === distance);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    const confirmedSnap = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", id)
      .where("participant.distance", "==", distance)
      .where("status", "==", "CONFIRMED")
      .where("bibNumber", "==", null)
      .get();

    const totalToAssign = confirmedSnap.size;

    if (totalToAssign === 0) {
      return NextResponse.json({
        success: true,
        preview: null,
        message: "No participants pending BIB",
      });
    }

    const startBib = category.nextBib;
    const endBib = startBib + totalToAssign - 1;

    if (endBib > category.bibEnd) {
      return NextResponse.json(
        { error: "Bib range overflow" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      preview: {
        distance,
        totalToAssign,
        startBib,
        endBib,
        remainingCapacity: category.bibEnd - endBib,
      },
    });
  } catch (error: any) {
    console.error("BIB PREVIEW ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
