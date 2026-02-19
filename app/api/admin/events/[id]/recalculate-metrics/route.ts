export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // 🔥 IMPORTANT: await params
    const { id } = await context.params;

    console.log("Received ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID missing in URL" },
        { status: 400 },
      );
    }

    const registrationsSnap = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", id)
      .get();

    let totalParticipants = 0;
    let totalRevenue = 0;

    registrationsSnap.forEach((doc) => {
      const data = doc.data();
      totalParticipants += 1;
      totalRevenue += Number(data.amount || 0);
    });

    await adminDb.collection("events").doc(id).update({
      "metrics.totalParticipants": totalParticipants,
      "metrics.totalRevenue": totalRevenue,
      "metrics.lastRecalculatedAt": new Date(),
    });

    return NextResponse.json({
      success: true,
      totalParticipants,
      totalRevenue,
    });
  } catch (error: any) {
    console.error("RECALCULATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
