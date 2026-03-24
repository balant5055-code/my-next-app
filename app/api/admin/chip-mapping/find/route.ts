export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const rawBib = searchParams.get("bib");

    if (!eventId || !rawBib) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const bib = rawBib.trim();

    if (!/^\d+$/.test(bib)) {
      return NextResponse.json(
        { error: "Invalid BIB format" },
        { status: 400 },
      );
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .where("participant.bibNumber", "==", Number(bib))
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Runner not found" }, { status: 404 });
    }

    const doc = snapshot.docs[0];

    const data = doc.data();

    return NextResponse.json({
      data: {
        id: doc.id,
        registrationId: data.registrationId,
        chipCode: data.chipCode ?? null,
        participant: data.participant ?? null,
        categoryTitle: data.categoryTitle ?? null,
      },
    });
  } catch (error) {
    console.error("Find API Error:", error);

    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
