export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/lib/requireRole";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> },
) {
  try {
    /* 🔐 Role-Based Protection */
    const { uid } = await requireRole([
      "SUPER_ADMIN",
      "EVENT_MANAGER",
      "CHECKIN_STAFF",
    ]);

    const { participantId } = await context.params;

    const ref = adminDb.collection("registrations_flat").doc(participantId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    const data = snap.data();

    /* 🚦 Prevent duplicate check-in */
    if (data?.checkedIn === true) {
      return NextResponse.json(
        { error: "Already checked-in" },
        { status: 400 },
      );
    }

    /* ✅ Perform Check-In */
    await ref.update({
      checkedIn: true,
      checkedInAt: FieldValue.serverTimestamp(),
      checkedInBy: uid,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Check-In Error:", error);

    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 403 },
    );
  }
}
