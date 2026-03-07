export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // ⚠️ IMPORTANT: use raw body
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // 🔐 Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(body);

    console.log("🔥 WEBHOOK EVENT:", event.event);

    // ============================================
    // ✅ PAYMENT CAPTURED
    // ============================================
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      const pendingRef = adminDb
        .collection("registrations_pending")
        .doc(orderId);

      const pendingSnap = await pendingRef.get();

      if (!pendingSnap.exists) {
        console.log("No pending registration found");
        return NextResponse.json({ received: true });
      }

      const pendingData = pendingSnap.data();

      if (!pendingData) {
        return NextResponse.json({ received: true });
      }
      /* 🔒 Prevent duplicate webhook confirmations */

      const existing = await adminDb
        .collection("registrations_flat")
        .doc(pendingData.registrationId)
        .get();

      if (existing.exists) {
        console.log("Webhook retry ignored - registration already confirmed");
        return NextResponse.json({ received: true });
      }
      const registrationData = {
        ...pendingData,
        payment: {
          orderId: orderId,
          paymentId: payment.id,
          method: "RAZORPAY",
          status: "SUCCESS",
          amount: payment.amount / 100,
        },
        status: "CONFIRMED",
        confirmedAt: new Date(),
      };

      // ✅ Save Confirmed Registration
      await adminDb
        .collection("registrations_flat")
        .doc(pendingData.registrationId)
        .set(registrationData);

      // ✅ Remove pending
      await pendingRef.delete();

      console.log("✅ Registration confirmed via webhook");
    }

    // ============================================
    // ❌ PAYMENT FAILED
    // ============================================
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      const pendingRef = adminDb
        .collection("registrations_pending")
        .doc(orderId);

      const pendingSnap = await pendingRef.get();

      if (!pendingSnap.exists) {
        return NextResponse.json({ received: true });
      }

      const pendingData = pendingSnap.data();

      if (!pendingData) {
        return NextResponse.json({ received: true });
      }

      // 🔓 Release seat
      const eventRef = adminDb.collection("events").doc(pendingData.eventId);

      await adminDb.runTransaction(async (transaction) => {
        const eventSnap = await transaction.get(eventRef);

        if (!eventSnap.exists) return;

        const eventData = eventSnap.data();
        const categories = eventData?.categories || [];

        const index = categories.findIndex(
          (c: any) => c.id === pendingData.categoryId,
        );

        if (index !== -1 && categories[index].bookedSeats > 0) {
          categories[index].bookedSeats -= 1;
          transaction.update(eventRef, { categories });
        }
      });

      // ❌ Delete pending
      await pendingRef.delete();

      console.log("❌ Payment failed — seat released");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
