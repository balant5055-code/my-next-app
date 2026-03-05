export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const stats: Record<
      string,
      { total: number; assigned: number; pending: number }
    > = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category || "Uncategorized";

      if (!stats[category]) {
        stats[category] = {
          total: 0,
          assigned: 0,
          pending: 0,
        };
      }

      stats[category].total += 1;

      if (data.chipCode) {
        stats[category].assigned += 1;
      } else {
        stats[category].pending += 1;
      }
    });

    // 🔥 Add overall totals
    let overallTotal = 0;
    let overallAssigned = 0;
    let overallPending = 0;

    Object.values(stats).forEach((cat) => {
      overallTotal += cat.total;
      overallAssigned += cat.assigned;
      overallPending += cat.pending;
    });

    return NextResponse.json({
      stats,
      overall: {
        total: overallTotal,
        assigned: overallAssigned,
        pending: overallPending,
      },
    });
  } catch (error) {
    console.error("Event Stats Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
