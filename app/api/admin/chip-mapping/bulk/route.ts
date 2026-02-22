export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const BATCH_LIMIT = 500;

export async function POST(req: NextRequest) {
  try {
    const { eventId, rows } = await req.json();

    if (!eventId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let success = 0;
    let failed = 0;

    const updates: {
      ref: FirebaseFirestore.DocumentReference;
      chip: string;
    }[] = [];

    for (const row of rows) {
      const bib = Number(row.BIB || row.bib || row.Bib);
      const chip = String(row.CHIP || row.chip || row.Chip || "").trim();

      if (!bib || !chip) {
        failed++;
        continue;
      }

      const snapshot = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", eventId)
        .where("bibNumber", "==", bib)
        .limit(1)
        .get();

      if (snapshot.empty) {
        failed++;
        continue;
      }

      const doc = snapshot.docs[0];

      updates.push({
        ref: doc.ref,
        chip,
      });
    }

    for (let i = 0; i < updates.length; i += BATCH_LIMIT) {
      const batch = adminDb.batch();
      const chunk = updates.slice(i, i + BATCH_LIMIT);

      chunk.forEach((item) => {
        batch.update(item.ref, {
          chipCode: item.chip,
          chipMappedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      success += chunk.length;
    }

    return NextResponse.json({
      success,
      failed,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
