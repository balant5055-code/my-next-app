export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const body = await req.json();
    const { eventId, categoryId, participant } = body;

    if (!eventId || !categoryId) {
      return NextResponse.json(
        { error: "Missing event or category" },
        { status: 400 },
      );
    }

    const eventRef = adminDb.collection("events").doc(eventId);

    // 🔥 Firestore Transaction (Seat Lock)
    const result = await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data()!;

      // 🔒 Check registration window
      const now = new Date();

      const registration = eventData.registration;

      if (!registration) {
        throw new Error("Registration not configured");
      }

      const startDate = registration.start?.toDate?.() || registration.start;

      const endDate = registration.end?.toDate?.() || registration.end;

      if (
        registration.status !== "open" ||
        !startDate ||
        !endDate ||
        now < new Date(startDate) ||
        now > new Date(endDate)
      ) {
        console.log("NOW:", now);
        console.log("START:", startDate);
        console.log("END:", endDate);
        console.log("STATUS:", registration.status);
        throw new Error("Registration closed");
      }

      const categories = eventData.categories;
      const categoryIndex = categories.findIndex(
        (c: any) => c.id === categoryId,
      );

      if (categoryIndex === -1) {
        throw new Error("Invalid category");
      }

      const category = categories[categoryIndex];

      if (category.bookedSeats >= category.maxSeats) {
        throw new Error("Category full");
      }

      // 🔥 Lock seat
      categories[categoryIndex].bookedSeats += 1;

      transaction.update(eventRef, { categories });

      return {
        price: category.price,
        eventName: eventData.name,
      };
    });

    // 🔥 Create Razorpay Order (price from DB, not frontend)
    const order = await razorpay.orders.create({
      amount: result.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const registrationId =
      "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

    // 🔥 Create PENDING Registration
    await adminDb.collection("registrations_pending").doc(order.id).set({
      registrationId,
      eventId,
      categoryId,
      participant,
      amount: result.price,
      orderId: order.id,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt,
    });

    return NextResponse.json({
      order,
      registrationId,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error.message);

    return NextResponse.json(
      { error: error.message || "Order creation failed" },
      { status: 400 },
    );
  }
}
