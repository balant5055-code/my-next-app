export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";

export async function GET(req: NextRequest, context: any) {
  try {
    await requireRole(req, ["SUPER_ADMIN", "EVENT_MANAGER"]);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    const eventSnap = await adminDb.collection("events").doc(id).get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const auditLogs = eventData?.auditLogs || [];

    const batches = auditLogs
      .filter((log: any) => log.action === "BIB_BATCH_GENERATED")
      .sort(
        (a: any, b: any) =>
          b.generatedAt?.toMillis?.() - a.generatedAt?.toMillis?.(),
      );

    return NextResponse.json({
      success: true,
      batches,
    });
  } catch (error: any) {
    console.error("BIB HISTORY ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
