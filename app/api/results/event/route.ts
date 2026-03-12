import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug missing" }, { status: 400 });
  }

  try {
    const q = query(collection(db, "events"), where("slug", "==", slug));

    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = {
      id: snap.docs[0].id,
      ...snap.docs[0].data(),
    };

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load event" },
      { status: 500 },
    );
  }
}
