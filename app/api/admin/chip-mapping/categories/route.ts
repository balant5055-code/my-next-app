export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const eventDoc = await adminDb.collection("events").doc(eventId).get();

  if (!eventDoc.exists) {
    return NextResponse.json({ categories: [] });
  }

  const event = eventDoc.data();

  const categories = (event?.categories || []).map((c: any) => c.title);

  return NextResponse.json({
    categories,
  });
}