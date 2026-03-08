export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid payment details" },
        { status: 400 },
      );
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Payment verification not configured");
    }
    /* 🔐 1️⃣ Verify Razorpay signature */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 },
      );
    }
    /* 🔥 2️⃣ Get pending registration */
    const pendingRef = adminDb
      .collection("registrations_pending")
      .doc(razorpay_order_id);

    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 400 },
      );
    }

    const pendingData = pendingSnap.data();

    if (!pendingData) {
      return NextResponse.json(
        { success: false, message: "Pending data missing" },
        { status: 400 },
      );
    }

    /* 🔥 3️⃣ Idempotency check */
    const confirmedRef = adminDb
      .collection("registrations_flat")
      .doc(pendingData.registrationId);

    const confirmedSnap = await confirmedRef.get();

    if (confirmedSnap.exists) {
      return NextResponse.json({
        success: true,
        registrationId: pendingData.registrationId,
      });
    }

    /* =======================================================
       🔥 4️⃣ Confirm Registration (NO BIB ASSIGNMENT)
    ======================================================= */

    await adminDb.runTransaction(async (transaction) => {
      const flatRef = adminDb
        .collection("registrations_flat")
        .doc(pendingData.registrationId);

      const existing = await transaction.get(flatRef);

      if (existing.exists) {
        return;
      }

      const eventRef = adminDb.collection("events").doc(pendingData.eventId);
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data()!;

      if (!eventData.name) {
        throw new Error("Event name missing in database");
      }

      /* ✅ Validate category still exists */

      const categories = eventData.categories || [];

      const categoryIndex = categories.findIndex(
        (c: any) => c.id === pendingData.categoryId,
      );

      if (categoryIndex === -1) {
        throw new Error("Invalid category");
      }

      const category = categories[categoryIndex];

      /* ===============================
   🔥 ENTERPRISE REGISTRATION MODEL
================================= */

      const participant = pendingData.participant;

      const fullName = `${participant?.firstName || ""} ${
        participant?.lastName || ""
      }`.trim();

      const registrationData = {
        registrationId: pendingData.registrationId,

        eventId: pendingData.eventId,
        eventName: eventData.name,
        eventDate: eventData?.date?.toDate?.() || eventData?.date || null,

        category: category.title,
        categoryId: pendingData.categoryId,
        amount: pendingData.amount,

        participant: pendingData.participant,

        /* 🔎 For prefix search */
        nameLowercase: fullName.toLowerCase(),

        /* 💳 Payment */
        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          method: "RAZORPAY",
          status: "SUCCESS",
        },

        /* 🟢 Registration status */
        status: "CONFIRMED",
        confirmedAt: new Date(),
        createdAt: pendingData.createdAt || new Date(),

        /* 🎟 BIB SYSTEM */
        bibNumber: null,
        bibAssignedAt: null,
        bibAssignedBy: null,

        /* 🏁 CHECK-IN SYSTEM */
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,

        /* 📜 Activity Timeline */
        activityLog: [
          {
            type: "REGISTRATION_CONFIRMED",
            at: new Date(),
          },
        ],
      };

      transaction.set(flatRef, registrationData);

      /* ✅ Update metrics (NO bibAssignedCount here) */
      transaction.set(
        eventRef,
        {
          metrics: {
            totalParticipants: FieldValue.increment(1),
            totalRevenue: FieldValue.increment(pendingData.amount),
            confirmedCount: FieldValue.increment(1),
          },
        },
        { merge: true },
      );
    });

    /* 🔥 5️⃣ Delete Pending */
    await pendingRef.delete();

    return NextResponse.json({
      success: true,
      registrationId: pendingData.registrationId,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);

    const message = error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
