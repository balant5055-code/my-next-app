export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const slug = pathname.split("/").pop();

    // Validate slug
    if (!slug || typeof slug !== "string" || slug.length > 120) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    // Query event by slug
    const snap = await adminDb
      .collection("events")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const doc = snap.docs[0];

    // Return full event document
    const data = doc.data();

    return NextResponse.json({
      id: doc.id,

      ...data,

      // ✅ MAIN DATE FIX
      date: data.date ? data.date.toDate().toISOString() : null,

      // ✅ REGISTRATION FIX
      registration: {
        ...data.registration,
        start: data.registration?.start
          ? data.registration.start.toDate().toISOString()
          : null,
        end: data.registration?.end
          ? data.registration.end.toDate().toISOString()
          : null,
      },

      // ✅ OPTIONAL (GOOD PRACTICE)
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,

      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error("EVENT API ERROR:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
