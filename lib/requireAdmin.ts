// lib/requireAdmin.ts

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/**
 * Internal helper to verify session + fetch admin record
 */
async function getAdminFromSession(sessionCookie: string) {
  const decoded = await adminAuth.verifySessionCookie(
    sessionCookie,
    true, // check revoked
  );

  const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!adminDoc.exists) {
    throw new Error("Admin record not found");
  }

  const data = adminDoc.data();

  if (!data?.active) {
    throw new Error("Account disabled");
  }

  return {
    uid: decoded.uid,
    role: data.role,
  };
}

/**
 * Require any active admin
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_token")?.value;

  if (!sessionCookie) {
    throw new Error("Unauthorized: No session");
  }

  return await getAdminFromSession(sessionCookie);
}
