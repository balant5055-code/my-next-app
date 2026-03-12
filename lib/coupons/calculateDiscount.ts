export type CouponType = "flat" | "percent" | "free";

export interface Coupon {
  code: string;
  type: CouponType;
  value?: number;
  maxDiscount?: number | null;
}

export interface DiscountResult {
  discountAmount: number;
  finalPrice: number;
  freeEntry: boolean;
}

export function calculateDiscount(
  price: number,
  coupon: Coupon,
): DiscountResult {
  let discountAmount = 0;

  if (!coupon) {
    return {
      discountAmount: 0,
      finalPrice: price,
      freeEntry: false,
    };
  }

  switch (coupon.type) {
    case "flat":
      discountAmount = coupon.value || 0;
      break;

    case "percent":
      discountAmount = (price * (coupon.value || 0)) / 100;

      // respect max discount cap
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }

      break;

    case "free":
      discountAmount = price;
      break;

    default:
      discountAmount = 0;
  }

  // prevent negative price
  const finalPrice = Math.max(price - discountAmount, 0);

  return {
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    freeEntry: finalPrice === 0,
  };
}
