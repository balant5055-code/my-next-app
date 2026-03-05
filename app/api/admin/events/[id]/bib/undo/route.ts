export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest, context: any) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(id);

    const result = await adminDb.runTransaction(async (tx) => {
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data();
      const auditLogs = eventData?.auditLogs || [];
      const categories = eventData?.categories || [];

      // 🔎 Find last BIB batch
      const lastBatch = [...auditLogs]
        .reverse()
        .find((log: any) => log.action === "BIB_BATCH_GENERATED");

      if (!lastBatch) {
        throw new Error("No BIB batch found to undo");
      }

      if (lastBatch.undo === true) {
        throw new Error("Last batch already undone");
      }

      const { distance, fromBib, toBib, totalAssigned } = lastBatch;

      // Find category
      const catIndex = categories.findIndex(
        (c: any) => c.distance === distance,
      );

      if (catIndex === -1) {
        throw new Error("Category not found");
      }

      // 🔎 Find participants in that BIB range
      const participantsSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", id)
        .where("participant.distance", "==", distance)
        .where("bibNumber", ">=", fromBib)
        .where("bibNumber", "<=", toBib)
        .get();

      if (participantsSnap.empty) {
        throw new Error("No participants found for that batch");
      }

      // 🔄 Reset participants
      participantsSnap.docs.forEach((doc) => {
        tx.update(doc.ref, {
          bibNumber: null,
          bibAssignedAt: null,
        });
      });

      // 🔄 Restore nextBib
      categories[catIndex].nextBib = fromBib;

      // 📝 Mark batch as undone
      const updatedLogs = auditLogs.map((log: any) =>
        log.batchId === lastBatch.batchId
          ? { ...log, undo: true, undoneAt: new Date() }
          : log,
      );

      tx.update(eventRef, {
        categories,
        auditLogs: updatedLogs,
        "metrics.bibAssignedCount": FieldValue.increment(-totalAssigned),
      });

      return {
        batchId: lastBatch.batchId,
        distance,
        fromBib,
        toBib,
        totalAssigned,
      };
    });

    return NextResponse.json({
      success: true,
      undoneBatch: result,
    });
  } catch (error: any) {
    console.error("UNDO BIB ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
