export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { Query } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortField = searchParams.get("sortField") || "startedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    let queryRef: Query = adminDb.collection("upload_history");

    if (status) {
      queryRef = queryRef.where("status", "==", status);
    }

    queryRef = queryRef.orderBy(sortField, sortOrder);

    const snap = await queryRef.get();

    let data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        startedAt: d.startedAt?.toDate?.() || null,
        completedAt: d.completedAt?.toDate?.() || null,
      };
    });

    // Global search (simple)
    if (search) {
      data = data.filter((d: any) =>
        d.eventId?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const total = data.length;

    const paginated = data.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("UPLOAD HISTORY API ERROR:", error);

    return NextResponse.json(
      { success: false, error: error?.message || "Server error" },
      { status: 500 },
    );
  }
}
