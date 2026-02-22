export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireRole } from "@/lib/requireRole";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(req, ["SUPER_ADMIN", "EVENT_MANAGER", "CHECKIN_STAFF"]);

    // ✅ MUST await params in Next 15
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ data: [] });
    }

    let baseQuery = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId);

    let snapshot;

    if (/^RLI-/i.test(query)) {
      snapshot = await baseQuery.where("registrationId", "==", query).get();
    } else if (/^\d{6,15}$/.test(query)) {
      snapshot = await baseQuery.where("participant.phone", "==", query).get();
    } else {
      const searchLower = query.toLowerCase();

      snapshot = await baseQuery
        .where("nameLowercase", ">=", searchLower)
        .where("nameLowercase", "<=", searchLower + "\uf8ff")
        .limit(10)
        .get();
    }

    if (snapshot.empty) {
      return NextResponse.json({ data: [] });
    }

    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      const participant = data.participant || {};

      return {
        id: doc.id,
        registrationId: data.registrationId || doc.id,
        name: `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
        phone: participant.phone || null,
        bibNumber: data.bibNumber || null,
        checkedIn: data.checkedIn || false,
        status: data.status || null,
      };
    });

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
