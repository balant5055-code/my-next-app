export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { validateCoupon } from "@/lib/coupons/validateCoupon";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys not configured");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (JSON.stringify(body).length > 100000) {
      throw new Error("Request too large");
    }

    const { eventId, participants } = body;
    let couponCode = body.couponCode?.trim().toUpperCase();

    if (
      !eventId ||
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0 ||
      participants.length > 10
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const eventRef = adminDb.collection("events").doc(eventId);

    let totalPrice = 0;
    let categoryTitles: string[] = [];
    let eventName = "";
    let discountAmount = 0;
    let appliedCoupon: string | null = null;
    let freeEntry = false;
    /* TRANSACTION */
    await adminDb.runTransaction(async (tx) => {
      const eventSnap = await tx.get(eventRef);

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const event = eventSnap.data()!;
      eventName = event.name;

      const registration = event.registration;

      if (!registration) {
        throw new Error("Registration not configured");
      }

      const now = new Date();
      const categories = event.categories || [];
      const seatCounter: Record<string, number> = {};
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

      for (const runner of participants) {
        if (!runner.categoryId) {
          throw new Error("Runner category missing");
        }
        const index = categories.findIndex(
          (c: any) => c.id === runner.categoryId,
        );

        if (index === -1) {
          throw new Error("Invalid category");
        }

        const category = categories[index];
        if (typeof category.price !== "number") {
          throw new Error("Invalid category pricing");
        }
        let price = category.price;

        if (category.earlyBirdPrice && category.earlyBirdEnd) {
          const earlyBirdEnd =
            category.earlyBirdEnd?.toDate?.() ||
            new Date(category.earlyBirdEnd);

          if (now < earlyBirdEnd) {
            price = category.earlyBirdPrice;
          }
        }

        totalPrice += price;

        if (category.status === "closed") {
          throw new Error(`${category.title} category closed`);
        }

        const booked = Number(category.bookedSeats || 0);
        const maxSeats = Number(category.maxSeats || 0);

        const alreadyReserved = seatCounter[runner.categoryId] || 0;

        if (maxSeats > 0 && booked + alreadyReserved + 1 > maxSeats) {
          throw new Error(`${category.title} category fully booked`);
        }

        seatCounter[runner.categoryId] = alreadyReserved + 1;
        //categories[index].bookedSeats = booked + 1;
        //category.bookedSeats = categories[index].bookedSeats;

        categoryTitles.push(category.title);
      }

      // no seat update here — seats reserved after payment verification
    });
    /* APPLY COUPON IF PROVIDED */

    if (couponCode) {
      const couponResult = await validateCoupon({
        couponCode,
        eventId,
        runnerClub: participants[0]?.runnerClub,
        phone: participants[0]?.phone,
        categoryTitle: categoryTitles.join(","),
        price: totalPrice,
      });

      if (!couponResult.valid) {
        throw new Error(couponResult.message);
      }

      discountAmount = couponResult.discountAmount ?? 0;
      appliedCoupon = couponCode;
      freeEntry = couponResult.freeEntry === true;

      if (couponResult.finalPrice !== undefined) {
        totalPrice = couponResult.finalPrice;
      } else {
        totalPrice = Math.max(totalPrice - discountAmount, 0);
      }
    }

    /* CREATE RAZORPAY ORDER */
    let order;
    if (freeEntry) {
      order = {
        id: "FREE_" + Date.now(),
        amount: 0,
      };
    } else {
      try {
        order = await razorpay.orders.create({
          amount: totalPrice * 100,
          currency: "INR",
          receipt: `rli_${uuidv4().slice(0, 8)}`,
        });
      } catch (err) {
        console.error("RAZORPAY ORDER ERROR:", err);
        throw new Error("Payment initialization failed");
      }
    }

    const registrationId =
      "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

    /* CREATE PENDING REGISTRATION */

    await adminDb
      .collection("registrations_pending")
      .doc(order.id)
      .set({
        registrationId,
        orderId: order.id,

        eventId,

        participants: participants.map((p: any) => ({
          ...p,
          whatsAppNumber: p.phone || "",
          searchKey: (
            (p.firstName || "") +
            " " +
            (p.lastName || "") +
            " " +
            (p.phone || p.whatsAppNumber || "")
          ).toLowerCase(),
        })),
        categories: categoryTitles,

        amount: totalPrice,
        discountAmount,
        couponCode: appliedCoupon,

        status: "PENDING",

        createdAt: new Date(),
        expiresAt,
      });

    return NextResponse.json({
      order,
      registrationId,
      freeEntry,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Order creation failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
