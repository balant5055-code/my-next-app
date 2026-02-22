export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID missing" },
        { status: 400 },
      );
    }

    /* ----------------------------------------------------
       1️⃣ Get Event Document
    ---------------------------------------------------- */
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventSnap.data();
    const totalCapacity = eventData?.metrics?.totalCapacity || 0;

    /* ----------------------------------------------------
       2️⃣ Fetch All Registrations
    ---------------------------------------------------- */
    const registrationsSnap = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    let totalParticipants = 0;
    let totalRevenue = 0;
    let confirmedCount = 0;
    let bibAssignedCount = 0;
    let checkedInCount = 0;

    registrationsSnap.forEach((doc) => {
      const data = doc.data();

      totalParticipants += 1;
      totalRevenue += Number(data.amount || 0);

      if (data.status === "CONFIRMED") {
        confirmedCount += 1;
      }

      if (data.bibNumber) {
        bibAssignedCount += 1;
      }

      if (data.checkInStatus === true) {
        checkedInCount += 1;
      }
    });

    /* ----------------------------------------------------
       3️⃣ Calculate Occupancy
    ---------------------------------------------------- */
    const occupancyRate =
      totalCapacity > 0
        ? Math.round((totalParticipants / totalCapacity) * 100)
        : 0;

    /* ----------------------------------------------------
       4️⃣ Update Metrics
    ---------------------------------------------------- */
    await eventRef.update({
      metrics: {
        ...eventData?.metrics,
        totalParticipants,
        totalRevenue,
        confirmedCount,
        bibAssignedCount,
        checkedInCount,
        occupancyRate,
        lastRecalculatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalParticipants,
        totalRevenue,
        confirmedCount,
        bibAssignedCount,
        checkedInCount,
        occupancyRate,
      },
    });
  } catch (error: any) {
    console.error("RECALCULATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
