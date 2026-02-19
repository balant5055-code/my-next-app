export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    /* 🔐 1️⃣ Get token */
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 🔐 2️⃣ Verify token */
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    /* 🔐 3️⃣ Verify admin role */
    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 🔎 4️⃣ Read query params */
    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");
    const paymentStatus = searchParams.get("paymentStatus");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const lastCreatedAt = searchParams.get("lastCreatedAt");
    const lastDocId = searchParams.get("lastDocId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    /* 🔥 5️⃣ Build base query */
    let query = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId);

    /* 🔥 6️⃣ Optional filters BEFORE orderBy */
    if (paymentStatus) {
      query = query.where("payment.status", "==", paymentStatus);
    }

    if (categoryId) {
      query = query.where("categoryId", "==", categoryId);
    }

    if (search) {
      query = query.where(
        "searchKeywords",
        "array-contains",
        search.toLowerCase(),
      );
    }

    /* 🔥 7️⃣ Order + limit */
    query = query
      .orderBy("createdAt", "desc")
      .orderBy("__name__")
      .limit(PAGE_SIZE);

    /* 🔥 8️⃣ Cursor pagination */
    if (lastCreatedAt && lastDocId) {
      query = query.startAfter(
        Timestamp.fromMillis(Number(lastCreatedAt)),
        lastDocId,
      );
    }

    /* ✅ 9️⃣ Execute */
    const snapshot = await query.get();

    const registrations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return NextResponse.json({
      data: registrations,
      nextCursor: lastDoc
        ? {
            createdAt: lastDoc.get("createdAt")?.toMillis?.() ?? null,
            id: lastDoc.id,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Admin Registrations Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
