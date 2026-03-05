import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // ✅ STEP 1: Verify ID token (NOT session cookie)
    await adminAuth.verifyIdToken(token);

    // ✅ STEP 2: Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn: 60 * 60 * 1000,
    });

    const response = NextResponse.json({ success: true });

    // ✅ STEP 3: Set cookie
    response.cookies.set("admin_token", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
