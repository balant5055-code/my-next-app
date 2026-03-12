import { adminDb } from "@/lib/firebaseAdmin";
import { calculateDiscount } from "./calculateDiscount";

interface ValidateInput {
  couponCode: string;
  eventId: string;
  categoryTitle: string;
  runnerClub?: string;
  phone?: string;
  price: number;
}

export async function validateCoupon(input: ValidateInput) {
  const { couponCode, eventId, categoryTitle, runnerClub, phone, price } =
    input;

  if (!couponCode) {
    return {
      valid: false,
      message: "Coupon code is empty",
    };
  }

  const code = couponCode.toUpperCase();

  const doc = await adminDb.collection("coupons").doc(code).get();

  if (!doc.exists) {
    return {
      valid: false,
      message: "Invalid coupon code",
    };
  }

  const coupon = doc.data() as any;

  if (!coupon?.active) {
    return {
      valid: false,
      message: "Coupon is inactive",
    };
  }

  const now = new Date();

  /* VALIDITY WINDOW */

  if (coupon.validFrom?.toDate && now < coupon.validFrom.toDate()) {
    return {
      valid: false,
      message: "Coupon not started yet",
    };
  }

  if (coupon.validTill?.toDate && now > coupon.validTill.toDate()) {
    return {
      valid: false,
      message: "Coupon expired",
    };
  }

  /* GLOBAL USAGE LIMIT */

  if (
    coupon.usageLimit &&
    coupon.usedCount &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return {
      valid: false,
      message: "Coupon usage limit reached",
    };
  }

  /* MIN CART VALUE */

  if (coupon.minCartValue && price < coupon.minCartValue) {
    return {
      valid: false,
      message: `Minimum amount ₹${coupon.minCartValue} required`,
    };
  }

  /* EVENT RESTRICTION */

  if (
    coupon.applicableEvents &&
    coupon.applicableEvents.length > 0 &&
    !coupon.applicableEvents.includes(eventId)
  ) {
    return {
      valid: false,
      message: "Coupon not valid for this event",
    };
  }

  /* CATEGORY RESTRICTION */

  if (
    coupon.applicableCategories &&
    coupon.applicableCategories.length > 0 &&
    !coupon.applicableCategories.includes(categoryTitle)
  ) {
    return {
      valid: false,
      message: "Coupon not valid for this category",
    };
  }

  /* RUNNER CLUB RESTRICTION (FIXED) */

  if (coupon.allowedClubs && coupon.allowedClubs.length > 0) {
    if (!runnerClub || !coupon.allowedClubs.includes(runnerClub)) {
      return {
        valid: false,
        message: "Coupon not valid for your runner club",
      };
    }
  }

  /* PER USER LIMIT */

  if (phone && coupon.perUserLimit) {
    const usageSnap = await adminDb
      .collection("coupon_usage")
      .where("couponCode", "==", code)
      .where("phone", "==", phone)
      .limit(coupon.perUserLimit)
      .get();

    if (usageSnap.size >= coupon.perUserLimit) {
      return {
        valid: false,
        message: "You have already used this coupon",
      };
    }
  }

  /* COUPON STRUCTURE VALIDATION */

  if (!coupon.type || typeof coupon.value !== "number") {
    return {
      valid: false,
      message: "Invalid coupon configuration",
    };
  }

  /* CALCULATE DISCOUNT */

  const result = calculateDiscount(price, {
    code: coupon.code || code,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount || null,
  });

  return {
    valid: true,
    message: "Coupon applied successfully",
    discountAmount: result.discountAmount,
    finalPrice: result.finalPrice,
    freeEntry: result.freeEntry,
    coupon,
  };
}
