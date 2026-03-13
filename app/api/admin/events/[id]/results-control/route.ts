import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ Next.js App Router requires awaiting params
    const { id } = await context.params;

    const { resultsPublished } = await request.json();

    // ✅ Validate input
    if (typeof resultsPublished !== "boolean") {
      return NextResponse.json(
        { error: "resultsPublished boolean required" },
        { status: 400 },
      );
    }

    const ref = adminDb.collection("events").doc(id);

    // ✅ Update event document
    await ref.update({
      resultsPublished,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      resultsPublished,
    });
  } catch (err: any) {
    console.error("🔥 Results control update error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to update results visibility" },
      { status: 500 },
    );
  }
}
