import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { NextRequest } from "next/server";

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(token);

  const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!adminDoc.exists) {
    throw new Error("Admin record not found");
  }

  const data = adminDoc.data();

  if (!data?.active) {
    throw new Error("Account disabled");
  }

  if (!allowedRoles.includes(data.role)) {
    throw new Error("Insufficient permissions");
  }

  return {
    uid: decoded.uid,
    role: data.role,
  };
}
