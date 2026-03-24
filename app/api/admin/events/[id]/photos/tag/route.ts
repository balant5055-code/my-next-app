import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;
    const body = await req.json();

    const photoIds: string[] = body.photoIds;
    const bibNumbers: string[] = body.bibNumbers;

    /* ================= VALIDATION ================= */

    if (!photoIds || !Array.isArray(photoIds) || !photoIds.length) {
      return NextResponse.json(
        { success: false, error: "No photoIds" },
        { status: 400 },
      );
    }

    if (!bibNumbers || !Array.isArray(bibNumbers)) {
      return NextResponse.json(
        { success: false, error: "Invalid bibNumbers" },
        { status: 400 },
      );
    }

    /* ================= BATCH UPDATE ================= */

    const batch = adminDb.batch();

    photoIds.forEach((id) => {
      const ref = adminDb
        .collection("events")
        .doc(eventId)
        .collection("event_photos")
        .doc(id);

      batch.update(ref, {
        bibNumbers,
        status: "published",
        updatedAt: new Date(), // ✅ added for tracking
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Tag error:", err);

    return NextResponse.json(
      { success: false, error: "Tagging failed" },
      { status: 500 },
    );
  }
}
