export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const snapshot = await adminDb
    .collection("registrations_flat")
    .where("eventId", "==", eventId)
    .get();

  const map: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const chip = doc.data().chipCode;
    if (!chip) return;

    map[chip] = (map[chip] || 0) + 1;
  });

  const duplicates = Object.keys(map).filter((chip) => map[chip] > 1);

  return NextResponse.json({ duplicates });
}
