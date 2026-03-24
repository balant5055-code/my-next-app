import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug");
  const bib = searchParams.get("bib");

  if (!slug || !bib) {
    return NextResponse.json(
      { success: false, error: "Missing parameters" },
      { status: 400 },
    );
  }

  try {
    /* 1️⃣ FIND EVENT */

    const eventQuery = query(
      collection(db, "events"),
      where("slug", "==", slug),
      limit(1),
    );

    const eventSnap = await getDocs(eventQuery);

    if (eventSnap.empty) {
      return NextResponse.json({ success: false });
    }

    const eventDoc = eventSnap.docs[0];

    const event = {
      id: eventDoc.id,
      ...eventDoc.data(),
    };

    /* 2️⃣ FIND RUNNER */

    const runnerQuery = query(
      collection(db, "registrations_flat"),
      where("eventId", "==", event.id),
      where("participant.bibNumber", "==", Number(bib)),
      limit(1),
    );

    const runnerSnap = await getDocs(runnerQuery);

    if (runnerSnap.empty) {
      return NextResponse.json({ success: false });
    }

    const runnerDoc = runnerSnap.docs[0];

    const runner = {
      id: runnerDoc.id,
      ...runnerDoc.data(),
    };

    return NextResponse.json({
      success: true,
      event,
      runner,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
