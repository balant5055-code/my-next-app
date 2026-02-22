export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const pageSize = Number(searchParams.get("pageSize") || 25);
    const cursor = searchParams.get("cursor");

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    let query = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .orderBy("createdAt", "desc")
      .limit(pageSize + 1);

    if (cursor) {
      const cursorDoc = await adminDb
        .collection("registrations_flat")
        .doc(cursor)
        .get();

      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();

    const docs = snapshot.docs.slice(0, pageSize);

    const nextCursor =
      snapshot.docs.length > pageSize ? snapshot.docs[pageSize - 1].id : null;

    return NextResponse.json({
      data: docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      nextCursor,
      hasNext: snapshot.docs.length > pageSize,
    });
  } catch (error) {
    console.error("Pagination Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, registrationId, chipCode } = await req.json();

    if (!eventId || !registrationId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await adminDb
      .collection("registrations_flat")
      .doc(registrationId)
      .update({
        chipCode: chipCode || null,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
