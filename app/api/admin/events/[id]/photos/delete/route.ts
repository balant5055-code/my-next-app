import { NextRequest, NextResponse } from "next/server";
import { adminDb, bucket } from "@/lib/firebaseAdmin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;
    const { photoIds } = await req.json();

    if (!photoIds?.length) {
      return NextResponse.json(
        { success: false, error: "No photoIds" },
        { status: 400 },
      );
    }

    const batch = adminDb.batch();

    for (const id of photoIds) {
      const ref = adminDb
        .collection("events")
        .doc(eventId)
        .collection("event_photos")
        .doc(id);

      const doc = await ref.get();
      if (!doc.exists) continue;

      const data = doc.data();

      /* ================= DELETE STORAGE ================= */

      const urls = [data?.smallUrl, data?.mediumUrl, data?.imageUrl].filter(
        Boolean,
      );

      for (const url of urls) {
        try {
          const path = url.split(`${bucket.name}/`)[1];
          if (path) {
            await bucket.file(path).delete();
          }
        } catch (e) {
          console.warn("Storage delete failed:", url);
        }
      }

      /* ================= DELETE FIRESTORE ================= */
      batch.delete(ref);
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
