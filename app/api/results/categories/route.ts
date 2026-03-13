import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ success: false });
    }

    const eventRef = doc(db, "events", eventId);

    const snap = await getDoc(eventRef);

    if (!snap.exists()) {
      return NextResponse.json({ success: false });
    }

    const data: any = snap.data();

    const distances = data.categories?.map((c: any) => c.distance) || [];

    return NextResponse.json({
      success: true,
      categories: distances,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false });
  }
}
