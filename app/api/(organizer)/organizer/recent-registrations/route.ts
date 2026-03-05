export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const snap = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        firstName: d.participant?.firstName || "",
        lastName: d.participant?.lastName || "",
        category: d.category || "",
        amount: d.amount || 0,
        status: d.status || "PENDING",
        bibNumber: d.bibNumber || null,
        createdAt: d.createdAt?.toDate?.() || null,
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("RECENT REG ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}
