export function formatLocation(
  venue?: string,
  city?: string
): string {
  return [venue, city].filter(Boolean).join(", ") || "-";
}

export function formatCount(count?: number) {
  if (!count) return "0";
  return count.toString();
}