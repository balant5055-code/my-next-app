export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData,
      eventId,
      category,
      amount,
      eventName,
    } = body;

    // 🛑 Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 },
      );
    }

    // 🔐 Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    // 🎟 Generate Professional Registration ID
    const registrationId =
      "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

    // 💾 Save to Firestore (Admin SDK)
    await adminDb
      .collection("registrations")
      .doc(registrationId)
      .set({
        registrationId,
        eventId,
        category,
        amount,
        eventName,
        // 👤 Participant Info
        participant: {
          ...formData,
        },

        // 💳 Payment Info
        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          method: "RAZORPAY",
        },

        status: "SUCCESS",
        createdAt: new Date(),
      });

    // ✅ Return success + registrationId
    return NextResponse.json({
      success: true,
      registrationId,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
