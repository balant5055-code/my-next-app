import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();

  await adminAuth.setCustomUserClaims(uid, {
    role: "SUPER_ADMIN",
  });

  return NextResponse.json({ success: true });
}
