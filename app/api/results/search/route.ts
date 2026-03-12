import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");
  const bib = searchParams.get("bib");

  if (!eventId || !bib) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const q = query(
      collection(db, "registrations_flat"),
      where("eventId", "==", eventId),
      where("bibNumber", "==", bib),
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({
        success: false,
        message: "Runner not found",
      });
    }

    const runner = snap.docs[0].data();

    return NextResponse.json({
      success: true,
      runner,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}
