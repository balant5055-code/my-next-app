export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const FIRESTORE_BATCH_LIMIT = 400;
const MAX_ROWS = 5000;

interface BulkRow {
  BIB: string | number;
  CHIP: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const eventId: string = body.eventId;
    const rows: BulkRow[] = body.rows;
    const mode: "block" | "skip" | "override" = body.mode ?? "block";

    if (!eventId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} rows allowed per upload` },
        { status: 400 },
      );
    }

    // 🔥 Load all registrations for event
    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const bibMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    const chipMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const bib = data?.participant?.bibNumber;

      if (bib !== undefined && bib !== null) {
        bibMap.set(String(bib).trim(), doc);
      }

      if (data.chipCode) {
        chipMap.set(String(data.chipCode).trim(), doc);
      }
    });

    let success = 0;
    let failed = 0;

    const updates: {
      ref: FirebaseFirestore.DocumentReference;
      chip: string | null;
    }[] = [];

    const errors: { bib: string; chip: string; reason: string }[] = [];

    // 🔥 Process uploaded rows
    for (const row of rows) {
      const bib = String(row.BIB ?? "").trim();
      const chip = String(row.CHIP ?? "").trim();

      if (!bib || !chip) {
        failed++;
        errors.push({
          bib,
          chip,
          reason: "INVALID_ROW",
        });
        continue;
      }

      const bibDoc = bibMap.get(bib);

      if (!bibDoc) {
        failed++;
        errors.push({
          bib,
          chip,
          reason: "BIB_NOT_FOUND",
        });
        continue;
      }

      const conflictingDoc = chipMap.get(chip);

      if (conflictingDoc && conflictingDoc.id !== bibDoc.id) {
        if (mode === "block" || mode === "skip") {
          failed++;
          errors.push({
            bib,
            chip,
            reason: "CHIP_ALREADY_ASSIGNED",
          });
          continue;
        }

        if (mode === "override") {
          updates.push({
            ref: conflictingDoc.ref,
            chip: null,
          });

          chipMap.delete(chip);
        }
      }

      updates.push({
        ref: bibDoc.ref,
        chip,
      });

      chipMap.set(chip, bibDoc);

      success++;
    }

    // 🔥 Batch commit updates
    for (let i = 0; i < updates.length; i += FIRESTORE_BATCH_LIMIT) {
      const batch = adminDb.batch();

      const chunk = updates.slice(i, i + FIRESTORE_BATCH_LIMIT);

      chunk.forEach((item) => {
        batch.update(item.ref, {
          chipCode: item.chip,
          chipMappedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }

    // 🔥 Optional audit log
    await adminDb.collection("upload_history").add({
      type: "CHIP_BULK_UPLOAD",
      eventId,
      rowsProcessed: rows.length,
      success,
      failed,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success,
      failed,
      errors,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);

    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
