import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const code = "BALA";
    const couponRef = adminDb.collection("coupons").doc(code);

    const existing = await couponRef.get();

    if (existing.exists) {
      return NextResponse.json({
        success: false,
        message: "Coupon already exists",
      });
    }

    await couponRef.set({
      code: code,

      // Coupon configuration
      type: "flat", // flat | percentage
      value: 200,
      maxDiscount: null,

      active: true,

      // Usage control
      usedCount: 0,
      usageLimit: 100,
      perUserLimit: 1,

      // Cart rule
      minCartValue: 0,

      // Restrictions
      applicableEvents: [],
      applicableCategories: [],
      allowedClubs: [],

      // Validity
      validFrom: new Date(),
      validTill: new Date("2026-12-31"),

      // Metadata
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("COUPON CREATE ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Failed to create coupon",
    });
  }
}
