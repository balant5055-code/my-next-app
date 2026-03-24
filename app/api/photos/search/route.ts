import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const bib = searchParams.get("bib");
    const cursor = searchParams.get("cursor");
    const limit = 10;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    /* ================= GET EVENT ================= */
    const eventSnap = await adminDb
      .collection("events")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (eventSnap.empty) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventId = eventSnap.docs[0].id;

    /* ================= BASE QUERY ================= */
    let query: any = adminDb
      .collection("events")
      .doc(eventId)
      .collection("event_photos")
      .orderBy("createdAt", "desc")
      .limit(limit);

    /* ================= FILTER ================= */
    if (bib) {
      query = query.where("bibNumbers", "array-contains", bib);
    }

    /* ================= CURSOR ================= */
    if (cursor) {
      const cursorDoc = await adminDb
        .collection("events")
        .doc(eventId)
        .collection("event_photos")
        .doc(cursor)
        .get();

      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    /* ================= FETCH ================= */
    const snap = await query.get();

    // ✅ FIX HERE — assign to photos
    const photos = snap.docs.map((doc: QueryDocumentSnapshot) => {
      const d = doc.data();

      return {
        id: doc.id,
        smallUrl: d.smallUrl || d.imageUrl,
        mediumUrl: d.mediumUrl || d.imageUrl,
        imageUrl: d.imageUrl,
        bibNumbers: d.bibNumbers || [],
        status: d.status,
      };
    });

    const nextCursor =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json({
      photos,
      nextCursor,
      hasMore: photos.length === limit,
    });
  } catch (err) {
    console.error("Search error:", err);

    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
