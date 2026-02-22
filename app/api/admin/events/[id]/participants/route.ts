export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const PAGE_SIZE_DEFAULT = 5;
const PAGE_SIZE_MAX = 10;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    /* =====================================================
       🔐 1️⃣ Admin Authentication
    ====================================================== */
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================================================
       🆔 2️⃣ Event ID
    ====================================================== */
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    /* =====================================================
       🔎 3️⃣ Query Params
    ====================================================== */
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const paymentStatus = searchParams.get("paymentStatus");
    const status = searchParams.get("status");

    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection =
      searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const pageSizeRaw = Number(
      searchParams.get("pageSize") || PAGE_SIZE_DEFAULT,
    );
    const pageSize = Math.min(pageSizeRaw, PAGE_SIZE_MAX);

    const lastValue = searchParams.get("lastValue");
    const lastDocId = searchParams.get("lastDocId");

    /* =====================================================
       🔒 4️⃣ Whitelist Sort Fields (Security)
    ====================================================== */
    const allowedSortFields = [
      "createdAt",
      "bibNumber",
      "amount",
      "status",
      "participant.distance",
      "participant.phone",
    ];

    if (!allowedSortFields.includes(sortField)) {
      return NextResponse.json(
        { error: "Invalid sort field" },
        { status: 400 },
      );
    }

    /* =====================================================
       🔥 5️⃣ Base Query
    ====================================================== */
    let query: FirebaseFirestore.Query = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId);

    /* =====================================================
       🎯 6️⃣ Apply Filters
    ====================================================== */

    // Distance filter
    if (category && category !== "all") {
      query = query.where("participant.distance", "==", category);
    }

    // Payment filter (method OR result)
    if (paymentStatus && paymentStatus !== "all") {
      const upper = paymentStatus.toUpperCase();

      if (["SUCCESS", "FAILED"].includes(upper)) {
        query = query.where("payment.status", "==", upper);
      } else {
        query = query.where("payment.method", "==", upper);
      }
    }

    // Registration status
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    /* =====================================================
       🔎 7️⃣ Smart Search (NO limit or order here)
    ====================================================== */

    let isNameSearch = false;

    if (search) {
      const trimmed = search.trim();

      if (/^\d+$/.test(trimmed)) {
        query = query.where("participant.phone", "==", trimmed);
      } else if (trimmed.includes("@")) {
        query = query.where("participant.email", "==", trimmed.toLowerCase());
      } else {
        const searchLower = trimmed.toLowerCase();
        query = query
          .where("nameLowercase", ">=", searchLower)
          .where("nameLowercase", "<=", searchLower + "\uf8ff");

        isNameSearch = true;
      }
    }

    /* =====================================================
   📊 8️⃣ FILTERED TOTAL COUNT
===================================================== */

    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;
    /* =====================================================
       📊 8️⃣ Apply Sorting (Firestore Rule Safe)
    ====================================================== */

    if (isNameSearch) {
      // Range query requires first orderBy on same field
      query = query.orderBy("nameLowercase").orderBy("__name__");
    } else {
      query = query
        .orderBy(sortField, sortDirection as FirebaseFirestore.OrderByDirection)
        .orderBy("__name__");
    }

    /* =====================================================
       🔁 9️⃣ Cursor Pagination
    ====================================================== */

    if (lastValue && lastDocId) {
      query = query.startAfter(lastValue, lastDocId);
    }

    /* =====================================================
       📦 10️⃣ Limit
    ====================================================== */

    query = query.limit(pageSize);

    /* =====================================================
       ✅ 11️⃣ Execute
    ====================================================== */

    const snapshot = await query.get();
    /* =====================================================
   📊 Get Total Count from Event Metrics
===================================================== */

    const participants = snapshot.docs.map((doc) => {
      const data = doc.data();
      const participant = data.participant || {};
      const payment = data.payment || {};

      return {
        id: doc.id,
        registrationId: data.registrationId,
        eventId: data.eventId,

        category: data.category,
        categoryId: data.categoryId,

        name: `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
        phone: participant.phone || null,
        email: participant.email || null,
        distance: participant.distance || null,

        bibNumber: data.bibNumber || null,
        amount: data.amount || 0,

        paymentStatus: payment.status || null,
        paymentMethod: payment.method || null,

        status: data.status || null,

        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    });

    /* =====================================================
       🔁 12️⃣ Next Cursor
    ====================================================== */

    const lastDocSnap = snapshot.docs[snapshot.docs.length - 1];

    let nextCursor = null;

    if (lastDocSnap) {
      const cursorValue = isNameSearch
        ? lastDocSnap.get("nameLowercase")
        : lastDocSnap.get(sortField);

      nextCursor = {
        lastValue: cursorValue,
        lastDocId: lastDocSnap.id,
      };
    }

    return NextResponse.json({
      data: participants,
      nextCursor,
      totalCount,
    });
  } catch (error: any) {
    console.error("Participants API Error:", error);

    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
