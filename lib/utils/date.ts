export function toDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d.getTime())) return null;

  return d;
}

export function formatDate(date: string | Date | null | undefined) {
  const d = toDate(date);
  if (!d) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined) {
  const d = toDate(date);
  if (!d) return "-";

  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isPast(date: string | Date | null | undefined) {
  const d = toDate(date);
  if (!d) return false;

  return d.getTime() < Date.now();
}