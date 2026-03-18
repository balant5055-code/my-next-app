export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { eventId, rows } = await req.json();

    if (!eventId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 🔥 Load all registrations once
    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const chipMap = new Map<string, boolean>();
    const bibMap = new Map<string, boolean>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const chip = data.chipCode;
      const bib = data.participant?.bibNumber;

      if (chip) chipMap.set(String(chip), true);
      if (bib) bibMap.set(String(bib), true);
    });

    const duplicateInDbChips: string[] = [];
    const duplicateInDbBibs: string[] = [];

    const fileChipSet = new Set<string>();
    const fileBibSet = new Set<string>();

    const duplicateInFileChips: string[] = [];
    const duplicateInFileBibs: string[] = [];

    for (const row of rows) {
      const chip = row.CHIP?.toString().trim();
      const bib = row.BIB?.toString().trim();

      if (!chip || !bib) continue;

      // 🔹 Duplicate inside Excel
      if (fileChipSet.has(chip)) {
        duplicateInFileChips.push(chip);
      } else {
        fileChipSet.add(chip);
      }

      if (fileBibSet.has(bib)) {
        duplicateInFileBibs.push(bib);
      } else {
        fileBibSet.add(bib);
      }

      // 🔹 Duplicate in database
      if (chipMap.has(chip)) {
        duplicateInDbChips.push(chip);
      }

      if (bibMap.has(bib)) {
        duplicateInDbBibs.push(bib);
      }
    }

    return NextResponse.json({
      duplicateInDbChips,
      duplicateInDbBibs,
      duplicateInFileChips,
      duplicateInFileBibs,
    });

  } catch (err) {
    console.error("DB duplicate check error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}