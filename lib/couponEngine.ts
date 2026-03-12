import { adminDb } from "@/lib/firebaseAdmin";

export async function validateCoupon({
  couponCode,
  eventId,
  participants,
  runnerClub,
}: {
  couponCode: string;
  eventId: string;
  participants: any[];
  runnerClub?: string;
}) {
  const couponRef = adminDb.collection("coupons").doc(couponCode);
  const snap = await couponRef.get();

  if (!snap.exists) {
    return { valid: false, message: "Invalid coupon" };
  }

  const coupon = snap.data();

  if (!coupon?.active) {
    return { valid: false, message: "Coupon inactive" };
  }

  const now = new Date();

  if (coupon.validFrom && now < coupon.validFrom.toDate()) {
    return { valid: false, message: "Coupon not started yet" };
  }

  if (coupon.validTill && now > coupon.validTill.toDate()) {
    return { valid: false, message: "Coupon expired" };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached" };
  }

  /* EVENT RESTRICTION */

  if (
    coupon.applicableEvents?.length &&
    !coupon.applicableEvents.includes(eventId)
  ) {
    return { valid: false, message: "Coupon not valid for this event" };
  }

  /* CATEGORY RESTRICTION */

  if (coupon.applicableCategories?.length) {
    const allowed = participants.some((p) =>
      coupon.applicableCategories.includes(p.categoryId),
    );

    if (!allowed) {
      return { valid: false, message: "Coupon not valid for this category" };
    }
  }

  /* RUNNER CLUB RESTRICTION */

  if (coupon.allowedClubs?.length) {
    if (!coupon.allowedClubs.includes(runnerClub)) {
      return {
        valid: false,
        message: "Coupon not valid for this running club",
      };
    }
  }

  /* CART TOTAL */

  const cartTotal = participants.reduce(
    (sum, p) => sum + (p.categoryPrice || 0),
    0,
  );

  if (cartTotal < coupon.minCartValue) {
    return {
      valid: false,
      message: `Minimum cart value ₹${coupon.minCartValue}`,
    };
  }

  /* DISCOUNT CALCULATION */

  let discount = 0;

  if (coupon.type === "flat") {
    discount = coupon.value;
  }

  if (coupon.type === "percentage") {
    discount = (cartTotal * coupon.value) / 100;
  }

  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  const finalPrice = Math.max(cartTotal - discount, 0);

  return {
    valid: true,
    discountAmount: discount,
    finalPrice,
  };
}
