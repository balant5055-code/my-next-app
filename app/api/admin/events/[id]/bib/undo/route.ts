export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";
import { FieldValue } from "firebase-admin/firestore";

const BATCH_SIZE = 400;

export async function POST(req: NextRequest, context: any) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(id);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const auditLogs = eventData?.auditLogs || [];
    const categories = eventData?.categories || [];

    /* ---------------- FIND LAST BATCH ---------------- */

    const lastBatch = [...auditLogs]
      .reverse()
      .find((log: any) => log.action === "BIB_BATCH_GENERATED");

    if (!lastBatch) {
      return NextResponse.json(
        { error: "No BIB batch found to undo" },
        { status: 400 },
      );
    }

    if (lastBatch.undo === true) {
      return NextResponse.json(
        { error: "Last batch already undone" },
        { status: 400 },
      );
    }

    const { distance, fromBib, toBib, totalAssigned } = lastBatch;

    /* ---------------- FIND CATEGORY ---------------- */

    const catIndex = categories.findIndex(
      (c: any) => String(c.distance) === String(distance),
    );

    if (catIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    /* ---------------- RESET PARTICIPANTS ---------------- */

    while (true) {
      const snap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.categoryDistance", "==", distance)
        .where("participant.bibNumber", ">=", fromBib)
        .where("participant.bibNumber", "<=", toBib)
        .limit(BATCH_SIZE)
        .get();

      if (snap.empty) break;

      const batch = adminDb.batch();

      snap.docs.forEach((doc) => {
        batch.update(doc.ref, {
          "participant.bibNumber": null,
          bibAssignedAt: null,
        });
      });

      await batch.commit();
    }

    /* ---------------- RESTORE NEXT BIB ---------------- */

    categories[catIndex].nextBib = fromBib;

    /* ---------------- UPDATE AUDIT LOG ---------------- */

    const updatedLogs = auditLogs.map((log: any) =>
      log.batchId === lastBatch.batchId
        ? { ...log, undo: true, undoneAt: new Date() }
        : log,
    );

    await eventRef.update({
      categories,
      auditLogs: updatedLogs,
      "metrics.bibAssignedCount": FieldValue.increment(-totalAssigned),
    });

    return NextResponse.json({
      success: true,
      undoneBatch: {
        batchId: lastBatch.batchId,
        distance,
        fromBib,
        toBib,
        totalAssigned,
      },
    });
  } catch (error: any) {
    console.error("UNDO BIB ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
