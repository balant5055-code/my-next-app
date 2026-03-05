export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 50;

export async function GET(req: NextRequest) {
  try {
    /* 🔐 1️⃣ Admin Auth */
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 🔎 2️⃣ Query Params */
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const pageSizeRaw = Number(
      searchParams.get("pageSize") || PAGE_SIZE_DEFAULT,
    );
    const pageSize = Math.min(pageSizeRaw, PAGE_SIZE_MAX);

    const lastValue = searchParams.get("lastValue");
    const lastDocId = searchParams.get("lastDocId");

    /* 🔥 3️⃣ Base Query */
    let query: FirebaseFirestore.Query = adminDb.collection("events");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    /* ===================================================
       🔥 SEARCH MODE
    =================================================== */
    if (search) {
      const searchLower = search.toLowerCase();

      query = query
        .where("nameLowercase", ">=", searchLower)
        .where("nameLowercase", "<=", searchLower + "\uf8ff")
        .orderBy("nameLowercase")
        .orderBy("__name__")
        .limit(pageSize);

      if (lastValue && lastDocId) {
        query = query.startAfter(lastValue, lastDocId);
      }
    } else {
      /* ===================================================
         🔥 NORMAL MODE (CREATED DATE)
      =================================================== */
      query = query
        .orderBy("createdAt", "desc")
        .orderBy("__name__")
        .limit(pageSize);

      if (lastValue && lastDocId) {
        query = query.startAfter(
          Timestamp.fromMillis(Number(lastValue)),
          lastDocId,
        );
      }
    }

    /* ✅ Execute */
    const snapshot = await query.get();

    const events = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        city: data.city,
        date: data.date,
        status: data.status,

        // ✅ VERY IMPORTANT
        totalParticipants: data.metrics?.totalParticipants || 0,
        totalRevenue: data.metrics?.totalRevenue || 0,

        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    let nextCursor = null;

    if (lastDoc) {
      if (search) {
        nextCursor = {
          lastValue: lastDoc.get("nameLowercase"),
          lastDocId: lastDoc.id,
        };
      } else {
        nextCursor = {
          lastValue: lastDoc.get("createdAt")?.toMillis?.(),
          lastDocId: lastDoc.id,
        };
      }
    }

    return NextResponse.json({
      data: events,
      nextCursor,
    });
  } catch (error: any) {
    console.error("Admin Events Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
