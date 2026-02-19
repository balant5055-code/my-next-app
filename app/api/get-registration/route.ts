export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const regId = searchParams.get("regId");

    if (!regId) {
      return NextResponse.json(
        { success: false, message: "Missing registration ID" },
        { status: 400 },
      );
    }

    const snap = await adminDb
      .collection("registrations_flat")
      .doc(regId)
      .get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: snap.data(),
    });
  } catch (error) {
    console.error("GET REGISTRATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
