export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing order ID" },
        { status: 400 },
      );
    }

    if (typeof orderId !== "string" || orderId.length > 80) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const snap = await adminDb
      .collection("registrations_flat")
      .where("payment.orderId", "==", orderId)
      .limit(10)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, message: "Registrations not found" },
        { status: 404 },
      );
    }

    const registrations = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        registrationId: data.registrationId,
        eventName: data.eventName,
        eventDate: data.eventDate,
        category: data.category,
        amount: data.amount,

        participant: {
          firstName: data.participant?.firstName || "",
          lastName: data.participant?.lastName || "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("GET REGISTRATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
