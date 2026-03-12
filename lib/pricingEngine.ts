export interface RunnerPricing {
  categoryPrice: number;
}

export interface PricingInput {
  runners: RunnerPricing[];
  couponApplied?: boolean;
  couponDiscount?: number;
}
export interface PricingOutput {
  totalBeforeDiscount: number;
  discount: number;
  finalTotal: number;
}
export function calculatePrice({
  runners,
  couponApplied = false,
  couponDiscount = 0,
}: PricingInput): PricingOutput {
  if (!runners || runners.length === 0) {
    return {
      totalBeforeDiscount: 0,
      discount: 0,
      finalTotal: 0,
    };
  }

  const totalBeforeDiscount = runners.reduce(
    (sum, r) => sum + (r.categoryPrice || 0),
    0,
  );

  const discount = couponApplied ? couponDiscount : 0;

  const finalTotal = Math.max(totalBeforeDiscount - discount, 0);

  return {
    totalBeforeDiscount,
    discount,
    finalTotal,
  };
}
