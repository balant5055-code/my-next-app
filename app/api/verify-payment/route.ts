export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required details" },
        { status: 400 },
      );
    }

    /* 🔐 1️⃣ Verify Razorpay signature */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
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
       🔥 4️⃣ Assign Bib + Save Registration (ONE TRANSACTION)
    ======================================================== */

    let assignedBibNumber: number | null = null;

    await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection("events").doc(pendingData.eventId);

      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data()!;

      if (!eventData.name) {
        throw new Error("Event name missing in database");
      }

      const categories = eventData.categories;

      const categoryIndex = categories.findIndex(
        (c: any) => c.id === pendingData.categoryId,
      );

      if (categoryIndex === -1) {
        throw new Error("Invalid category");
      }

      const category = categories[categoryIndex];

      if (category.nextBib > category.bibEnd) {
        throw new Error("Bib limit exceeded");
      }

      // 🎽 Assign Bib
      assignedBibNumber = category.nextBib;

      // 🔥 Increment safely
      categories[categoryIndex].nextBib += 1;

      transaction.update(eventRef, { categories });

      const registrationData = {
        registrationId: pendingData.registrationId,
        eventId: pendingData.eventId,
        eventName: eventData.name,
        eventDate: eventData?.date?.toDate?.() || eventData?.date || null,

        category: category.title,
        categoryId: pendingData.categoryId,
        amount: pendingData.amount,
        participant: pendingData.participant,

        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          method: "RAZORPAY",
          status: "SUCCESS",
        },

        status: "CONFIRMED",
        confirmedAt: new Date(),
        createdAt: new Date(),
        bibNumber: assignedBibNumber,
      };

      // 🔥 Flat save
      const flatRef = adminDb
        .collection("registrations_flat")
        .doc(pendingData.registrationId);

      transaction.set(flatRef, registrationData);

      // ✅ Enterprise safe metrics
      transaction.set(
        eventRef,
        {
          metrics: {
            totalParticipants: FieldValue.increment(1),
            totalRevenue: FieldValue.increment(pendingData.amount),
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
      bibNumber: assignedBibNumber,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
