import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function requireOrganizerEvent(req: NextRequest, eventId: string) {
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(token);

  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

  if (!userDoc.exists) {
    throw new Error("Forbidden");
  }

  const user = userDoc.data();

  const allowedEvents = user?.eventIds || user?.eventids || [];

  if (!allowedEvents.includes(eventId)) {
    throw new Error("Event access denied");
  }

  return {
    uid: decoded.uid,
    user,
  };
}
