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

export async function POST(req: NextRequest, context: any) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;
    const body = await req.json();

    const normalizedDistance = normalizeDistance(body.distance);

    if (!id || !normalizedDistance) {
      return NextResponse.json(
        { error: "Missing event or distance" },
        { status: 400 },
      );
    }

    /* ---------------- FETCH EVENT ---------------- */

    const eventRef = adminDb.collection("events").doc(id);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const categories = eventData?.categories || [];

    /* ---------------- FIND CATEGORY ---------------- */

    const category = categories.find(
      (c: any) => String(c.distance) === normalizedDistance,
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    const startBib = category.nextBib;
    const bibEnd = category.bibEnd;

    if (!startBib || !bibEnd) {
      return NextResponse.json(
        { error: "Bib range not configured" },
        { status: 400 },
      );
    }

    /* ---------------- COUNT PARTICIPANTS ---------------- */

    const confirmedAgg = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", id)
      .where("participant.categoryDistance", "==", normalizedDistance)
      .where("status", "==", "CONFIRMED")
      .where("participant.bibNumber", "==", null)
      .count()
      .get();

    const totalToAssign = confirmedAgg.data().count;

    if (totalToAssign === 0) {
      return NextResponse.json({
        success: true,
        preview: null,
        message: "No participants pending BIB",
      });
    }

    /* ---------------- CALCULATE RANGE ---------------- */

    const endBib = startBib + totalToAssign - 1;

    if (endBib > bibEnd) {
      return NextResponse.json(
        { error: "Bib range overflow" },
        { status: 400 },
      );
    }

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      success: true,
      preview: {
        distance: normalizedDistance,
        totalToAssign,
        startBib,
        endBib,
        remainingCapacity: bibEnd - endBib,
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
