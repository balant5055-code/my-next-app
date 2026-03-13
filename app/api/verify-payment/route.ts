export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/*
========================================================
VERIFY PAYMENT API
--------------------------------------------------------
Purpose:
1. Verify Razorpay payment signature
2. Retrieve pending registration
3. Prevent duplicate confirmation (idempotency)
4. Convert pending registration → confirmed registrations
5. Create one registration document per runner
6. Update event metrics & coupon usage
7. Delete pending registration
========================================================
*/

export async function POST(req: Request) {
  try {
    let body;

    /* ======================================================
       1️⃣ Parse Request Body
       ------------------------------------------------------
       Ensures valid JSON payload
    ====================================================== */

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const isFreeOrder = razorpay_order_id?.startsWith("FREE_");

    /* ======================================================
       2️⃣ Validate Razorpay Payment Payload
       ------------------------------------------------------
       Free orders skip Razorpay signature verification
    ====================================================== */

    if (!isFreeOrder) {
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
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Payment verification not configured");
    }

    /* ======================================================
       3️⃣ Razorpay Signature Verification
       ------------------------------------------------------
       Prevents payment tampering
    ====================================================== */

    if (!isFreeOrder) {
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
    }

    /* ======================================================
       4️⃣ Fetch Pending Registration
       ------------------------------------------------------
       Pending registration was created during create-order
    ====================================================== */

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

    const expiresAt =
      pendingData.expiresAt?.toDate?.() || pendingData.expiresAt;

    if (expiresAt && new Date() > new Date(expiresAt)) {
      return NextResponse.json(
        { success: false, message: "Registration session expired" },
        { status: 400 },
      );
    }

    /* ======================================================
       5️⃣ Idempotency Check
       ------------------------------------------------------
       Prevents duplicate registrations if payment webhook
       or frontend retry occurs.
    ====================================================== */

    const existing = await adminDb
      .collection("registrations_flat")
      .where("payment.orderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({
        success: true,
        registrationId: pendingData.registrationId,
      });
    }

    /* ======================================================
       6️⃣ Confirm Registration (Firestore Transaction)
       ------------------------------------------------------
       Transaction ensures:
       - All runners are registered atomically
       - Metrics updated safely
       - Coupon usage incremented safely
    ====================================================== */

    await adminDb.runTransaction(async (transaction) => {
      /* Fetch event document */
      const eventRef = adminDb.collection("events").doc(pendingData.eventId);
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data()!;

      /* Get participants array FIRST */
      const participants = pendingData.participants || [];

      if (!Array.isArray(participants) || participants.length === 0) {
        throw new Error("Participants missing");
      }

      /* ==================================================
🔒 Reserve Category Seats AFTER Payment Success
================================================== */

      const categories = eventData.categories || [];
      const seatCounter: Record<string, number> = {};

      for (const runner of participants) {
        const index = categories.findIndex(
          (c: any) => c.id === runner.categoryId,
        );

        if (index === -1) {
          throw new Error("Invalid category");
        }

        const category = categories[index];

        const alreadyReserved = seatCounter[runner.categoryId] || 0;
        const booked = Number(category.bookedSeats || 0);
        const maxSeats = Number(category.maxSeats || 0);

        /* ✅ Allow unlimited categories */
        if (
          !category.unlimited &&
          maxSeats > 0 &&
          booked + alreadyReserved + 1 > maxSeats
        ) {
          throw new Error(`${category.title} category sold out`);
        }

        seatCounter[runner.categoryId] = alreadyReserved + 1;
      }

      const updates: Record<string, any> = {};

      for (const categoryId in seatCounter) {
        const index = categories.findIndex((c: any) => c.id === categoryId);

        if (index === -1) {
          throw new Error("Category not found during seat update");
        }

        updates[`categories.${index}.bookedSeats`] = FieldValue.increment(
          seatCounter[categoryId],
        );
      }

      transaction.update(eventRef, updates);

      /* Update seats */
      transaction.update(eventRef, { categories });

      /* ==================================================
         7️⃣ Create Registration Document for Each Runner
      ================================================== */

      for (const runner of participants) {
        const runnerRegistrationId =
          "RLI-" +
          crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

        const fullName =
          `${runner?.firstName || ""} ${runner?.lastName || ""}`.trim();

        const categoryIndex = categories.findIndex(
          (c: any) => c.id === runner.categoryId,
        );

        if (categoryIndex === -1) {
          throw new Error("Invalid category during registration");
        }

        const category = categories[categoryIndex];

        const registrationData = {
          registrationId: runnerRegistrationId,

          eventId: pendingData.eventId,
          eventName: eventData.name,
          eventDate: eventData?.date?.toDate?.() || eventData?.date || null,

          category: category.title,
          categoryId: category.id,
          amount: pendingData.amount,

          couponCode: pendingData.couponCode || null,
          couponDiscount: pendingData.discountAmount || 0,

          participant: runner,

          nameLowercase: fullName.toLowerCase(),

          searchKey:
            runner.searchKey ||
            (
              (runner.firstName || "") +
              " " +
              (runner.lastName || "") +
              " " +
              (runner.whatsAppNumber || runner.phone || "")
            ).toLowerCase(),

          phoneIndex: (
            runner.whatsAppNumber ||
            runner.phone ||
            ""
          ).toLowerCase(),

          nameIndex: (
            (runner.firstName || "") +
            " " +
            (runner.lastName || "")
          ).toLowerCase(),

          bibIndex: (runner.bibNumber || "").toLowerCase(),

          payment: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            method: isFreeOrder ? "COUPON" : "RAZORPAY",
            status: "SUCCESS",
          },

          status: "CONFIRMED",
          confirmedAt: new Date(),
          createdAt: pendingData.createdAt || new Date(),

          bibNumber: null,
          bibAssignedAt: null,
          bibAssignedBy: null,

          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null,

          activityLog: [
            {
              type: "REGISTRATION_CONFIRMED",
              at: new Date(),
            },
          ],
        };

        const runnerRef = adminDb
          .collection("registrations_flat")
          .doc(runnerRegistrationId);

        transaction.set(runnerRef, registrationData);
      }

      /* ==================================================
         8️⃣ Increment Coupon Usage
      ================================================== */

      if (pendingData.couponCode) {
        const couponRef = adminDb
          .collection("coupons")
          .doc(pendingData.couponCode);

        transaction.set(
          couponRef,
          { usedCount: FieldValue.increment(participants.length) },
          { merge: true },
        );

        for (const runner of participants) {
          const phoneNumber = runner.whatsAppNumber || runner.phone;

          if (!phoneNumber) continue;

          const usageRef = adminDb.collection("coupon_usage").doc();

          transaction.set(usageRef, {
            couponCode: pendingData.couponCode,
            phone: phoneNumber,
            registrationId: pendingData.registrationId,
            usedAt: new Date(),
          });
        }
      }

      /* ==================================================
         9️⃣ Update Event Metrics
      ================================================== */

      transaction.set(
        eventRef,
        {
          metrics: {
            totalParticipants: FieldValue.increment(participants.length),
            confirmedCount: FieldValue.increment(participants.length),
            totalRevenue: FieldValue.increment(Number(pendingData.amount || 0)),
          },
        },
        { merge: true },
      );
    });

    /* ======================================================
       🔟 Delete Pending Registration
       ------------------------------------------------------
       Prevents reuse of pending order
    ====================================================== */

    await pendingRef.update({
      status: "CONFIRMED",
      confirmedAt: new Date(),
      paymentId: razorpay_payment_id || null,
    });

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);

    const message = error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
