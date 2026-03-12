import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getEventStage } from "@/lib/eventLifecycle";

export async function GET() {
  try {
    const snap = await getDocs(collection(db, "events"));

    const events: any[] = [];

    snap.docs.forEach((doc) => {
      const data = doc.data();

      const stage = getEventStage(data);

      if (stage === "results") {
        events.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Results events API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load results events" },
      { status: 500 },
    );
  }
}
