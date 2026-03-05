export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { eventId, rows } = await req.json();

    if (!eventId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const duplicateInDbChips: string[] = [];
    const duplicateInDbBibs: string[] = [];

    for (const row of rows) {
      const chip = row.CHIP?.toString().trim();
      const bib = row.BIB?.toString().trim();

      if (!chip || !bib) continue;

      // 🔹 Check chip duplicate
      const chipSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", eventId)
        .where("chipCode", "==", chip)
        .limit(1)
        .get();

      if (!chipSnap.empty) {
        duplicateInDbChips.push(chip);
      }

      // 🔹 Check if bib already has chip assigned
      const bibSnap = await adminDb
        .collection("registrations_flat")
        .where("eventId", "==", eventId)
        .where("bibNumber", "==", bib)
        .limit(1)
        .get();

      if (!bibSnap.empty) {
        const doc = bibSnap.docs[0];
        const existingChip = doc.data().chipCode;

        if (existingChip) {
          duplicateInDbBibs.push(bib);
        }
      }
    }

    return NextResponse.json({
      duplicateInDbChips,
      duplicateInDbBibs,
    });
  } catch (err) {
    console.error("DB duplicate check error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
