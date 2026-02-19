import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const { status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const ref = adminDb.collection("events").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 🔥 Enterprise Status + Registration Rule
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (["live", "completed", "disabled"].includes(status)) {
      updateData["registration.status"] = "closed";
    } else {
      updateData["registration.status"] = "open";
    }

    await ref.update(updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Status update error:", err);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
