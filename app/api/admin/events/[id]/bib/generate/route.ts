export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";
import { FieldValue } from "firebase-admin/firestore";

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

    const result = await adminDb.runTransaction(async (tx) => {
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data();
      const lock = eventData?.bibGenerationLock;

      const now = Date.now();
      const LOCK_TIMEOUT = 30 * 1000; // 30 seconds

      /* ================= LOCK CHECK ================= */

      if (lock?.locked) {
        const lockedAt = lock.lockedAt?.toDate?.()?.getTime() || 0;

        if (now - lockedAt < LOCK_TIMEOUT) {
          throw new Error("Another admin is generating BIBs. Please wait.");
        }
        // If timeout exceeded → auto recover
      }

      /* ================= LOCK ACQUIRE ================= */

      tx.update(eventRef, {
        bibGenerationLock: {
          locked: true,
          lockedAt: new Date(),
          lockedBy: "system", // or decoded.uid if available
        },
      });

      /* ================= CATEGORY ================= */

      const categories = eventData?.categories || [];

      const catIndex = categories.findIndex(
        (c: any) => c.distance === distance,
      );

      if (catIndex === -1) {
        throw new Error("Category not found");
      }

      const category = categories[catIndex];
      const nextBib = category.nextBib;
      const bibEnd = category.bibEnd;

      if (!nextBib || !bibEnd) {
        throw new Error("Bib range not configured");
      }

      /* ================= FETCH PARTICIPANTS ================= */

      const confirmedSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.distance", "==", distance)
        .where("status", "==", "CONFIRMED")
        .where("bibNumber", "==", null)
        .get();

      if (confirmedSnap.empty) {
        throw new Error("No participants pending BIB");
      }

      let currentBib = nextBib;
      const startBib = nextBib;
      let totalAssigned = 0;

      for (const doc of confirmedSnap.docs) {
        if (currentBib > bibEnd) {
          throw new Error("Bib range exhausted");
        }

        tx.update(doc.ref, {
          bibNumber: currentBib,
          bibAssignedAt: new Date(),
        });

        currentBib++;
        totalAssigned++;
      }

      const endBib = currentBib - 1;

      categories[catIndex].nextBib = currentBib;

      const batchId = `BIB-${distance}-${Date.now()}`;

      /* ================= FINAL UPDATE + UNLOCK ================= */

      tx.update(eventRef, {
        categories,
        "metrics.bibAssignedCount": FieldValue.increment(totalAssigned),
        auditLogs: FieldValue.arrayUnion({
          action: "BIB_BATCH_GENERATED",
          batchId,
          distance,
          fromBib: startBib,
          toBib: endBib,
          totalAssigned,
          generatedAt: new Date(),
        }),
        bibGenerationLock: {
          locked: false,
          lockedAt: null,
          lockedBy: null,
        },
      });

      return {
        batchId,
        startBib,
        endBib,
        totalAssigned,
        nextBibAfter: currentBib,
      };
    });

    return NextResponse.json({
      success: true,
      batch: result,
    });
  } catch (error: any) {
    console.error("BIB GENERATE ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
