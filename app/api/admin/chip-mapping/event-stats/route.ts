export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const stats: Record<
      string,
      {
        online: { total: number; assigned: number; pending: number };
        offline: { total: number; assigned: number; pending: number };
      }
    > = {};

    let overallTotal = 0;
    let overallAssigned = 0;
    let overallPending = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const category = data.categoryTitle || "Uncategorized";

      const paymentMethod = data.payment?.method || "OFFLINE";

      const type =
        paymentMethod === "OFFLINE" ? "offline" : "online";

      if (!stats[category]) {
        stats[category] = {
          online: { total: 0, assigned: 0, pending: 0 },
          offline: { total: 0, assigned: 0, pending: 0 },
        };
      }

      stats[category][type].total += 1;
      overallTotal += 1;

      if (Boolean(data.chipCode)) {
        stats[category][type].assigned += 1;
        overallAssigned += 1;
      } else {
        stats[category][type].pending += 1;
        overallPending += 1;
      }
    }

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

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}