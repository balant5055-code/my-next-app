import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons/validateCoupon";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { couponCode, eventId, categoryTitle, runnerClub, phone, price } =
      body;

    if (!couponCode || !eventId || !categoryTitle || !price) {
      return NextResponse.json(
        { valid: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await validateCoupon({
      couponCode,
      eventId,
      categoryTitle,
      runnerClub,
      phone,
      price,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validation error:", error);

    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon" },
      { status: 500 },
    );
  }
}
