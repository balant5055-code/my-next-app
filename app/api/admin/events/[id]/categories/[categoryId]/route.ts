import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; categoryId: string }> },
) {
  try {
    // 🔐 Require login + get role
    const { role } = await requireAdmin();

    // 🚨 Block VIEW_ONLY from modifying
    if (role === "VIEW_ONLY") {
      return NextResponse.json(
        { error: "Read-only access. Modification not allowed." },
        { status: 403 },
      );
    }

    const { id, categoryId } = await context.params;
    const body = await request.json();

    const ref = adminDb.collection("events").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = snapshot.data();
    const categories = data?.categories || [];

    const existingCategory = categories.find((c: any) => c.id === categoryId);

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    /* ================================
       🔐 ENTERPRISE VALIDATIONS
    ================================= */

    if (typeof body.maxSeats === "number") {
      if (body.maxSeats < existingCategory.bookedSeats) {
        return NextResponse.json(
          {
            error: `Cannot reduce seats below booked seats (${existingCategory.bookedSeats})`,
          },
          { status: 400 },
        );
      }

      if (body.maxSeats < 0) {
        return NextResponse.json(
          { error: "Seats cannot be negative" },
          { status: 400 },
        );
      }
    }

    if (typeof body.price === "number") {
      if (body.price < 0) {
        return NextResponse.json(
          { error: "Price cannot be negative" },
          { status: 400 },
        );
      }
    }

    if (body.waitlistEnabled !== undefined) {
      if (typeof body.waitlistEnabled !== "boolean") {
        return NextResponse.json(
          { error: "Invalid waitlist value" },
          { status: 400 },
        );
      }
    }

    if (body.status !== undefined) {
      if (!["open", "closed"].includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid category status" },
          { status: 400 },
        );
      }
    }

    if (typeof body.bibStart === "number" && typeof body.bibEnd === "number") {
      if (body.bibStart >= body.bibEnd) {
        return NextResponse.json(
          { error: "Invalid bib range" },
          { status: 400 },
        );
      }

      if (
        existingCategory.nextBib &&
        existingCategory.nextBib < body.bibStart
      ) {
        return NextResponse.json(
          { error: "Cannot move bibStart above issued bibs" },
          { status: 400 },
        );
      }
    }

    const allowedFields = [
      "price",
      "maxSeats",
      "bibStart",
      "bibEnd",
      "nextBib",
      "waitlistEnabled",
      "status",
    ];

    const safeUpdates: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        safeUpdates[key] = body[key];
      }
    }

    const updatedCategories = categories.map((cat: any) =>
      cat.id === categoryId
        ? {
            ...cat,
            ...safeUpdates,
            updatedAt: new Date(),
          }
        : cat,
    );

    const totalParticipants = updatedCategories.reduce(
      (sum: number, cat: any) => sum + (cat.bookedSeats || 0),
      0,
    );

    const totalRevenue = updatedCategories.reduce(
      (sum: number, cat: any) =>
        sum + (cat.bookedSeats || 0) * (cat.price || 0),
      0,
    );

    const totalCapacity = updatedCategories.reduce(
      (sum: number, cat: any) => sum + (cat.maxSeats || 0),
      0,
    );

    const occupancyRate =
      totalCapacity > 0
        ? Math.round((totalParticipants / totalCapacity) * 100)
        : 0;

    await ref.update({
      categories: updatedCategories,
      metrics: {
        totalParticipants,
        totalRevenue,
        totalCapacity,
        occupancyRate,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      updatedCategoryId: categoryId,
    });
  } catch (err) {
    console.error("🔥 Category update error:", err);
    return NextResponse.json(
      { error: "Unauthorized or failed to update category" },
      { status: 500 },
    );
  }
}
