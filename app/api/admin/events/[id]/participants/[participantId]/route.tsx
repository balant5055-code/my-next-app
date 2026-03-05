export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> },
) {
  try {
    /* =====================================================
       🔐 1️⃣ Admin Authentication
    ====================================================== */
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================================================
       🆔 2️⃣ Params
    ====================================================== */
    const { id: eventId, participantId } = await context.params;

    if (!eventId || !participantId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    /* =====================================================
       📄 3️⃣ Fetch Participant
    ====================================================== */
    const docRef = adminDb.collection("registrations_flat").doc(participantId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    const data = docSnap.data();

    /* =====================================================
       🔒 4️⃣ Event Safety Check
    ====================================================== */
    if (data?.eventId !== eventId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    /* =====================================================
       📦 5️⃣ Return Full Document (No Flattening)
    ====================================================== */
    return NextResponse.json({
      data: {
        id: docSnap.id,
        ...data,
      },
    });
  } catch (error: any) {
    console.error("Single Participant API Error:", error);

    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
