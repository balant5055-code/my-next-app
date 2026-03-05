export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireOrganizerEvent } from "@/lib/requireOrganizerEvent";

export async function GET(req: NextRequest) {
  try {
    /* ---------------- URL PARAMS ---------------- */

    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const page = Number(searchParams.get("page") || 1);
    const limit = 15;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    /* ---------------- SECURITY CHECK ---------------- */

    await requireOrganizerEvent(req, eventId);

    /* ---------------- FIRESTORE QUERY ---------------- */

    let query = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .orderBy("createdAt", "desc");

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();

    let participants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    /* ---------------- SERVER SEARCH ---------------- */

    if (search) {
      const s = search.toLowerCase();

      participants = participants.filter((p: any) => {
        const name =
          `${p.participant?.firstName || ""} ${p.participant?.lastName || ""}`.toLowerCase();

        const phone = p.participant?.phone || "";
        const reg = p.registrationId || "";

        return (
          name.includes(s) || phone.includes(s) || reg.toLowerCase().includes(s)
        );
      });
    }

    /* ---------------- STATS ---------------- */

    const categoryMap: Record<string, number> = {};

    participants.forEach((p: any) => {
      const cat = p.category || "Other";

      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }));

    const stats = {
      total: participants.length,

      online: participants.filter((p: any) =>
        ["ONLINE", "RAZORPAY"].includes(p.payment?.method),
      ).length,

      offline: participants.filter((p: any) => p.payment?.method === "OFFLINE")
        .length,

      categories,
    };

    /* ---------------- PAGINATION ---------------- */

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = participants.slice(start, end);

    const pages = Math.ceil(stats.total / limit);

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      participants: paginated,
      total: stats.total,
      stats,
      page,
      pages,
    });
  } catch (error: any) {
    console.error("Participants API Error:", error);

    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
