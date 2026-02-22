export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

/* 🔥 Normalize distance like 5KM → 5 */
function normalizeDistance(value: string): string {
  if (!value) return "";
  const match = String(value).match(/\d+/);
  return match ? String(Number(match[0])) : "";
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID missing" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const rows = body.rows;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, message: "Invalid rows data" },
        { status: 400 },
      );
    }

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventSnap.data()!;
    const categories = eventData.categories;

    let inserted = 0;
    const skipped: any[] = [];

    await adminDb.runTransaction(async (transaction) => {
      const freshSnap = await transaction.get(eventRef);
      const freshData = freshSnap.data()!;
      const freshCategories = freshData.categories;

      let totalParticipantsIncrement = 0;
      let totalRevenueIncrement = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const normalizedDistance = normalizeDistance(row.distance);

        const categoryIndex = freshCategories.findIndex(
          (c: any) => String(c.distance) === normalizedDistance,
        );

        if (categoryIndex === -1) {
          skipped.push({
            row: i + 1,
            reason: "Invalid distance",
          });
          continue;
        }

        const category = freshCategories[categoryIndex];

        /* 🔒 Seat limit check */
        if (category.bookedSeats >= category.maxSeats) {
          skipped.push({
            row: i + 1,
            reason: "Category full",
          });
          continue;
        }

        /* 🔥 Increment seat */
        freshCategories[categoryIndex].bookedSeats += 1;

        const registrationId =
          "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

        const registrationData = {
          registrationId,
          eventId,
          eventName: eventData.name,
          eventDate: eventData?.date?.toDate?.() || eventData?.date || null,

          category: category.title,
          categoryId: category.id,
          amount: category.price,

          participant: {
            firstName: row.firstName || "",
            lastName: row.lastName || "",
            phone: row.phone || "",
            gender: row.gender || "",
            distance: normalizedDistance,
            dob: row.dob || "",
            tshirtSize: row.tshirtSize || "",
            schoolName: row.schoolName || "",
            email: row.email || "",
            bloodGroup: row.bloodGroup || "",
            emergencyName: row.emergencyName || "",
            emergencyNumber: row.emergencyPhone || "",
          },

          payment: {
            method: "OFFLINE",
            status: "SUCCESS",
          },

          status: "CONFIRMED",
          confirmedAt: new Date(),
          createdAt: new Date(),

          bibNumber: null, // 🎯 Model B
        };

        const flatRef = adminDb
          .collection("registrations_flat")
          .doc(registrationId);

        transaction.set(flatRef, registrationData);

        totalParticipantsIncrement += 1;
        totalRevenueIncrement += Number(category.price || 0);
        inserted++;
      }

      /* 🔥 Update categories (bookedSeats only) */
      transaction.update(eventRef, {
        categories: freshCategories,
      });

      /* 🔥 Update metrics */
      transaction.set(
        eventRef,
        {
          metrics: {
            totalParticipants: FieldValue.increment(totalParticipantsIncrement),
            totalRevenue: FieldValue.increment(totalRevenueIncrement),
            confirmedCount: FieldValue.increment(totalParticipantsIncrement),
          },
        },
        { merge: true },
      );
    });

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
    });
  } catch (error: any) {
    console.error("BULK UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
