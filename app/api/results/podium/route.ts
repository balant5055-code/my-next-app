import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId missing" }, { status: 400 });
  }

  try {
    const q = query(
      collection(db, "registrations_flat"),
      where("eventId", "==", eventId),
      orderBy("result.overallRank"),
      limit(3),
    );

    const snap = await getDocs(q);

    const runners = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      runners,
    });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
