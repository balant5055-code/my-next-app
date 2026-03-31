export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/* ================= AUTH ================= */
async function verifyAdminSafe(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return { error: "Unauthorized" };

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return { error: "Forbidden" };
    }

    return { uid: decoded.uid };
  } catch (err) {
    return { error: "Auth failed" };
  }
}

/* ================= HELPERS ================= */

function deepMerge(target: any, source: any) {
  const output = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

function getDiff(oldObj: any, newObj: any) {
  let diff: any = {};

  for (const key in newObj) {
    if (typeof newObj[key] === "object" && !Array.isArray(newObj[key])) {
      const nested = getDiff(oldObj[key] || {}, newObj[key]);
      if (Object.keys(nested).length) diff[key] = nested;
    } else if (oldObj[key] !== newObj[key]) {
      diff[key] = newObj[key];
    }
  }

  return diff;
}

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const doc = await adminDb.collection("events").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

/* ================= PATCH ================= */
export async function PATCH(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    /* 🔐 AUTH SAFE */
    const admin = await verifyAdminSafe(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: 401 });
    }

    const body = await req.json();

    const ref = adminDb.collection("events").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existing: Record<string, any> = snap.data() || {};

    /* 🔒 CLEAN SYSTEM */
    delete body.createdAt;
    delete body.metrics;
    delete body.categoryBreakdown;

    /* 🔥 MERGE + DIFF */
    const merged = deepMerge(existing, body);
    const changes = getDiff(existing, merged);

    if (!Object.keys(changes).length) {
      return NextResponse.json({ success: true, message: "No changes" });
    }

    const audit = {
      action: "EVENT_UPDATED",
      at: new Date(),
      by: admin.uid,
      changes,
    };

    /* 🔥 SAFE SAVE */
    await ref.set(
      {
        ...merged,
        updatedAt: new Date(),
        updatedBy: admin.uid,
        auditLogs: [...(existing.auditLogs || []), audit],
      },
      { merge: true },
    );

    return NextResponse.json({
      success: true,
      updatedFields: Object.keys(changes),
    });
  } catch (err: any) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 },
    );
  }
}
