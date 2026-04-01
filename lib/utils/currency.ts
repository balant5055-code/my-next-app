export function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "-";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}