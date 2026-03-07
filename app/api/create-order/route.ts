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
    const body = await req.json();

    const { eventId, categoryId, participant } = body;

    if (!eventId || !categoryId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const eventRef = adminDb.collection("events").doc(eventId);

    let categoryPrice = 0;
    let eventName = "";
    let categoryTitle = "";

    /* TRANSACTION */
    await adminDb.runTransaction(async (tx) => {
      const eventSnap = await tx.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const event = eventSnap.data()!;

      eventName = event.name;

      /* REGISTRATION WINDOW CHECK */

      const registration = event.registration;

      if (!registration) {
        throw new Error("Registration not configured");
      }

      const now = new Date();

      const start = registration.start?.toDate?.() || registration.start;
      const end = registration.end?.toDate?.() || registration.end;

      if (
        registration.status !== "open" ||
        !start ||
        !end ||
        now < new Date(start) ||
        now > new Date(end)
      ) {
        throw new Error("Registration closed");
      }

      /* FIND CATEGORY */

      const categories = event.categories || [];

      const index = categories.findIndex((c: any) => c.id === categoryId);

      if (index === -1) {
        throw new Error("Invalid category");
      }

      const category = categories[index];

      /* CATEGORY STATUS CHECK */

      if (category.status === "closed") {
        throw new Error("Category closed");
      }

      /* SEAT CHECK */

      const booked = category.bookedSeats || 0;

      if (booked >= category.maxSeats) {
        throw new Error("Category full");
      }

      /* LOCK SEAT */

      categories[index].bookedSeats = booked + 1;

      tx.update(eventRef, { categories });

      /* SAVE DB PRICE */

      categoryPrice = category.price;
      categoryTitle = category.title;
    });

    /* CREATE RAZORPAY ORDER */

    const order = await razorpay.orders.create({
      amount: categoryPrice * 100, // 🔒 price from DB
      currency: "INR",
      receipt: `rli_${Date.now()}`,
    });

    const registrationId =
      "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

    /* CREATE PENDING REGISTRATION */

    await adminDb.collection("registrations_pending").doc(order.id).set({
      registrationId,
      orderId: order.id,

      eventId,
      categoryId,
      categoryTitle,

      participant,

      amount: categoryPrice,

      status: "PENDING",

      createdAt: new Date(),

      expiresAt,
    });

    return NextResponse.json({
      order,
      registrationId,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        error: error.message || "Order creation failed",
      },
      { status: 400 },
    );
  }
}
