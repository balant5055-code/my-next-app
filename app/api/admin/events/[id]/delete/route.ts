export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/* 🔐 AUTH */
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifySessionCookie(token);

  const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!adminDoc.exists || adminDoc.data()?.active !== true) {
    throw new Error("Forbidden");
  }

  return decoded;
}

/* ❌ DELETE EVENT */
export async function DELETE(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/")[4]; // adjust if needed

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const admin = await verifyAdmin(req);

    const ref = adminDb.collection("events").doc(id);

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await ref.delete();

    return NextResponse.json({
      success: true,
      deletedBy: admin.uid,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 },
    );
  }
}
