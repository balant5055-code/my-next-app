import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const slug = pathname.split("/").pop();

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    // Query by slug field
    const snap = await adminDb
      .collection("events")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const doc = snap.docs[0];

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error: any) {
    console.error("EVENT API ERROR:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
