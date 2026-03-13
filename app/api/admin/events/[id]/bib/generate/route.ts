export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";
import { FieldValue } from "firebase-admin/firestore";

const BATCH_SIZE = 400;

/* ---------------- DISTANCE NORMALIZER ---------------- */

function normalizeDistance(value: any) {
  if (!value) return "";
  const match = String(value).match(/\d+/);
  return match ? String(Number(match[0])) : "";
}

/* ----------------------------------------------------- */

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

    const catIndex = categories.findIndex(
      (c: any) => String(c.distance) === normalizedDistance,
    );

    if (catIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    const category = categories[catIndex];

    let currentBib = category.nextBib;
    const bibEnd = category.bibEnd;

    if (!currentBib || !bibEnd) {
      return NextResponse.json(
        { error: "Bib range not configured" },
        { status: 400 },
      );
    }

    let totalAssigned = 0;
    const startBib = currentBib;

    /* ---------------- PROGRESS START ---------------- */

    await eventRef.update({
      bibGenerationProgress: {
        distance: normalizedDistance,
        assigned: 0,
        startedAt: new Date(),
      },
    });

    /* ---------------- BATCH LOOP ---------------- */

    while (true) {
      const snap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.categoryDistance", "==", normalizedDistance)
        .where("status", "==", "CONFIRMED")
        .where("participant.bibNumber", "==", null)
        .limit(BATCH_SIZE)
        .get();

      if (snap.empty) break;

      const batch = adminDb.batch();

      for (const doc of snap.docs) {
        if (currentBib > bibEnd) {
          throw new Error("Bib range exhausted");
        }

        batch.update(doc.ref, {
          "participant.bibNumber": currentBib,
          bibAssignedAt: new Date(),
        });

        currentBib++;
        totalAssigned++;
      }

      await batch.commit();

      /* ---------------- UPDATE PROGRESS ---------------- */

      await eventRef.update({
        "bibGenerationProgress.assigned": totalAssigned,
        "bibGenerationProgress.updatedAt": new Date(),
      });
    }

    /* ---------------- NO RUNNERS ---------------- */

    if (totalAssigned === 0) {
      await eventRef.update({
        bibGenerationProgress: FieldValue.delete(),
      });

      return NextResponse.json({
        success: true,
        message: "No participants pending BIB",
      });
    }

    /* ---------------- FINALIZE ---------------- */

    const endBib = currentBib - 1;

    categories[catIndex].nextBib = currentBib;

    const batchId = `BIB-${normalizedDistance}-${Date.now()}`;

    await eventRef.update({
      categories,
      "metrics.bibAssignedCount": FieldValue.increment(totalAssigned),

      auditLogs: FieldValue.arrayUnion({
        action: "BIB_BATCH_GENERATED",
        batchId,
        distance: normalizedDistance,
        fromBib: startBib,
        toBib: endBib,
        totalAssigned,
        generatedAt: new Date(),
      }),

      bibGenerationProgress: FieldValue.delete(),
    });

    return NextResponse.json({
      success: true,
      batch: {
        batchId,
        startBib,
        endBib,
        totalAssigned,
        nextBibAfter: currentBib,
      },
    });
  } catch (error: any) {
    console.error("BIB GENERATE ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
