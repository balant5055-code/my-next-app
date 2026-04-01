export function parseDOB(dob: string | null | undefined): Date | null {
  if (!dob) return null;

  // Expecting YYYY-MM-DD from DatePicker
  const parts = dob.split("-");

  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day) return null;

  // ✅ LOCAL DATE (no timezone issue)
  return new Date(year, month - 1, day);
}