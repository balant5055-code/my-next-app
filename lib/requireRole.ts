// lib/requireRole.ts

import { requireAdmin } from "@/lib/requireAdmin";

export async function requireRole(allowedRoles: string[]) {
  const admin = await requireAdmin();

  if (!allowedRoles.includes(admin.role)) {
    throw new Error("Insufficient permissions");
  }

  return admin;
}
