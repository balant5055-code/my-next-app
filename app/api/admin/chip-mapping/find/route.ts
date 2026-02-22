export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const bib = searchParams.get("bib");

    if (!eventId || !bib) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .where("bibNumber", "==", Number(bib))
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Runner not found" }, { status: 404 });
    }

    const doc = snapshot.docs[0];

    return NextResponse.json({
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Find API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
