import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params; // ✅ MUST await params

    const { registrationStatus } = await request.json();

    if (!registrationStatus) {
      return NextResponse.json(
        { error: "registrationStatus required" },
        { status: 400 },
      );
    }

    const ref = adminDb.collection("events").doc(id);

    await ref.update({
      "registration.status": registrationStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 Registration update error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to update registration status" },
      { status: 500 },
    );
  }
}
