export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { mockParticipants } from "@/data/mockParticipants";

export async function GET() {
  try {
    if (!mockParticipants || mockParticipants.length === 0) {
      return NextResponse.json(
        { error: "No mock participants found" },
        { status: 400 },
      );
    }

    const batch = adminDb.batch();
    const colRef = adminDb.collection("registrations_flat");

    for (const runner of mockParticipants) {
      const docRef = colRef.doc(runner.id);
      batch.set(docRef, runner);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      inserted: mockParticipants.length,
      message: "Mock participants inserted successfully",
    });
  } catch (error: any) {
    console.error("MOCK IMPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Insert failed",
      },
      { status: 500 },
    );
  }
}
