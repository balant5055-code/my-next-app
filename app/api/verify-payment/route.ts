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

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required details" },
        { status: 400 }
      );
    }

    // 🔐 Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 🎟 Generate Registration ID
    const registrationId =
      "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

    const now = new Date();

    const registrationData = {
      registrationId,
      eventId,
      eventName,
      category,
      amount,

      participant: {
        ...formData,
      },

      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        method: "RAZORPAY",
        status: "SUCCESS",
        amount: amount,
      },

      status: "SUCCESS",
      createdAt: now,
    };

    // ====================================================
    // 1️⃣ SAVE EVENT-WISE (Fast event dashboard)
    // ====================================================
    await adminDb
      .collection("registrations")
      .doc(eventId)
      .collection("participants")
      .doc(registrationId)
      .set(registrationData);

    // ====================================================
    // 2️⃣ SAVE FLAT (Fast global search & receipt)
    // ====================================================
    await adminDb
      .collection("registrations_flat")
      .doc(registrationId)
      .set(registrationData);

    return NextResponse.json({
      success: true,
      registrationId,
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
