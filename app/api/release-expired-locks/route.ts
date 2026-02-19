export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST() {
  try {
    const now = new Date();
    const expiryMinutes = 10; // Seat hold time
    const expiryTime = new Date(now.getTime() - expiryMinutes * 60 * 1000);

    const pendingSnap = await adminDb
      .collection("registrations_pending")
      .where("createdAt", "<", expiryTime)
      .get();

    const batch = adminDb.batch();

    for (const doc of pendingSnap.docs) {
      const data = doc.data();

      const eventRef = adminDb.collection("events").doc(data.eventId);
      const eventSnap = await eventRef.get();

      if (eventSnap.exists) {
        const eventData = eventSnap.data();
        const categories = eventData?.categories || [];

        const index = categories.findIndex(
          (c: any) => c.id === data.categoryId,
        );

        if (index !== -1) {
          if (categories[index].bookedSeats > 0) {
            categories[index].bookedSeats -= 1;
          }

          batch.update(eventRef, { categories });
        }
      }

      batch.delete(doc.ref);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      released: pendingSnap.size,
    });
  } catch (error) {
    console.error("RELEASE LOCK ERROR:", error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
