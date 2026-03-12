import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");
  const lastId = searchParams.get("lastId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId missing" }, { status: 400 });
  }

  try {
    let q;

    if (lastId) {
      const lastDoc = await getDoc(doc(db, "registrations_flat", lastId));

      q = query(
        collection(db, "registrations_flat"),
        where("eventId", "==", eventId),
        orderBy("result.overallRank"),
        startAfter(lastDoc),
        limit(50),
      );
    } else {
      q = query(
        collection(db, "registrations_flat"),
        where("eventId", "==", eventId),
        orderBy("result.overallRank"),
        limit(50),
      );
    }

    const snap = await getDocs(q);

    const runners = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastVisible =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      runners,
      lastVisible,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Leaderboard failed" },
      { status: 500 },
    );
  }
}
