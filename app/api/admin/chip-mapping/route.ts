export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const pageSize = Number(searchParams.get("pageSize") || 15);
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

    const hasNext = snapshot.docs.length > pageSize;
    const docs = snapshot.docs.slice(0, pageSize);

    const nextCursor = hasNext ? docs[docs.length - 1].id : null;

    const data = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      data,
      nextCursor,
      hasNext,
    });
  } catch (error) {
    console.error("Pagination Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, registrationId, chipCode, bibNumber } = await req.json();

    if (!eventId || !registrationId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔐 Get logged-in admin from Firebase token
    const authHeader = req.headers.get("authorization");
    let adminEmail = "unknown";

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const decoded = await adminAuth.verifyIdToken(token);
      adminEmail = decoded.email || decoded.uid;
    }

    await adminDb
      .collection("registrations_flat")
      .doc(registrationId)
      .update({
        chipCode: chipCode || null,
        bibNumber: bibNumber || null,
        "participant.bibNumber": bibNumber || null,
        bibAssignedAt: new Date(),
        bibAssignedBy: adminEmail,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
