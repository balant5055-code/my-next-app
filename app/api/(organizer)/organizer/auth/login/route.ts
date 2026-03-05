import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Get user from Firestore
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDoc.data();

    if (!user) {
      return NextResponse.json({ error: "User data missing" }, { status: 404 });
    }

    // Check organizer role
    if (user.role !== "organizer" || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    });

    const res = NextResponse.json({
      success: true,
      events: user.eventids || [],
    });

    res.cookies.set("organizer-auth", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Organizer login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
}
