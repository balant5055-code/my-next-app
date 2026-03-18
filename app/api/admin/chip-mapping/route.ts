export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const MAX_PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const pageSizeRaw = Number(searchParams.get("pageSize") || 15);
    const cursor = searchParams.get("cursor");
const category = searchParams.get("category");
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId required" },
        { status: 400 }
      );
    }

    const pageSize = Math.min(pageSizeRaw, MAX_PAGE_SIZE);

   let query = adminDb
  .collection("registrations_flat")
  .where("eventId", "==", eventId);

if (category && category !== "ALL") {
  query = query.where("categoryTitle", "==", category);
}

query = query.orderBy("createdAt", "desc").limit(pageSize + 1);

    if (cursor) {
      const cursorDoc = await adminDb
        .collection("registrations_flat")
        .doc(cursor)
        .get();

      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();

    const hasNext = snapshot.docs.length > pageSize;
    const docs = snapshot.docs.slice(0, pageSize);

    const nextCursor = hasNext ? docs[docs.length - 1].id : null;

    const data = docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        registrationId: d.registrationId,
        chipCode: d.chipCode ?? null,
        categoryTitle: d.categoryTitle ?? null,
        participant: d.participant ?? null,
        createdAt: d.createdAt ?? null,
      };
    });

    return NextResponse.json({
      data,
      nextCursor,
      hasNext,
    });

  } catch (error) {
    console.error("Pagination Error:", error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const eventId: string = body.eventId;
    const registrationId: string = body.registrationId;
    const chipCode: string | null = body.chipCode;
    const bibNumber: number | null = body.bibNumber;

    if (!eventId || !registrationId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    let adminEmail = "unknown";

    const authHeader = req.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const decoded = await adminAuth.verifyIdToken(token);
      adminEmail = decoded.email || decoded.uid;
    }

    const updatePayload: any = {
      chipCode: chipCode ?? null,
      chipMappedAt: FieldValue.serverTimestamp(),
      chipMappedBy: adminEmail,
    };

    if (bibNumber !== undefined) {
      updatePayload["participant.bibNumber"] = bibNumber ?? null;
      updatePayload["bibAssignedAt"] = FieldValue.serverTimestamp();
      updatePayload["bibAssignedBy"] = adminEmail;
    }

    await adminDb
      .collection("registrations_flat")
      .doc(registrationId)
      .update(updatePayload);

    return NextResponse.json({
      success: true,
      registrationId,
      chipCode,
      bibNumber,
    });

  } catch (error) {
    console.error("Update Error:", error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}