export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const BATCH_LIMIT = 400;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    // Fetch all registrations
    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .orderBy("categoryTitle")
      .orderBy("createdAt")
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No registrations found" },
        { status: 404 },
      );
    }

    let currentBib = 1000;
    let updated = 0;

    for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
      const batch = adminDb.batch();
      const chunk = snapshot.docs.slice(i, i + BATCH_LIMIT);

      chunk.forEach((doc) => {
        const data = doc.data();

        // Skip if BIB already assigned
        if (data.participant?.bibNumber) return;

        batch.update(doc.ref, {
          "participant.bibNumber": currentBib++,
          bibAssignedAt: FieldValue.serverTimestamp(),
        });

        updated++;
      });

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      assigned: updated,
    });
  } catch (error) {
    console.error("Bib Assignment Error:", error);

    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
