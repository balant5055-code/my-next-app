export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function DELETE(req: NextRequest) {
  try {
    // 🔐 1️⃣ Get token
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔐 2️⃣ Verify Firebase token
    const decoded = await adminAuth.verifySessionCookie(token, true);

    // 🔐 3️⃣ Verify admin role
    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📦 4️⃣ Validate body
    const body = await req.json();

    if (!body?.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 🗑 5️⃣ Delete event
    await adminDb.collection("events").doc(body.id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
