export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const FIRESTORE_BATCH_LIMIT = 400;

export async function POST(req: NextRequest) {
  try {
    const { eventId, rows, mode } = await req.json();

    if (!eventId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 🔥 1️⃣ Load entire event registrations once
    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const bibMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    const chipMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.bibNumber) bibMap.set(String(data.bibNumber), doc);

      if (data.chipCode) chipMap.set(String(data.chipCode), doc);
    });

    let success = 0;
    let failed = 0;
    const updates: {
      ref: FirebaseFirestore.DocumentReference;
      chip: string | null;
    }[] = [];

    const errors: { bib: number; chip: string; reason: string }[] = [];

    // 🔥 2️⃣ Process rows in memory
    for (const row of rows) {
      const bib = String(row.BIB);
      const chip = String(row.CHIP);

      const bibDoc = bibMap.get(bib);

      if (!bibDoc) {
        failed++;
        errors.push({ bib: Number(bib), chip, reason: "BIB_NOT_FOUND" });
        continue;
      }

      const conflictingDoc = chipMap.get(chip);

      if (conflictingDoc && conflictingDoc.id !== bibDoc.id) {
        if (mode === "block" || mode === "skip") {
          failed++;
          errors.push({
            bib: Number(bib),
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
        }
      }

      updates.push({
        ref: bibDoc.ref,
        chip,
      });

      success++;
    }

    // 🔥 3️⃣ Batch commit safely
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
