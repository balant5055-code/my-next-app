export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

/* ---------------- NORMALIZERS ---------------- */

function normalizeDistance(value: string) {
  if (!value) return "";
  const match = String(value).match(/\d+/);
  return match ? String(Number(match[0])) : "";
}

function normalizeGender(value: string) {
  if (!value) return "N/A";

  const v = value.toString().trim().toLowerCase();

  if (["m", "male"].includes(v)) return "MALE";
  if (["f", "female"].includes(v)) return "FEMALE";

  return v.toUpperCase();
}

function normalizeTshirt(value: any) {
  if (!value) return "N/A";
  return value.toString().trim().toUpperCase();
}

function normalizeBloodGroup(value: string) {
  if (!value) return "N/A";
  return value.toString().trim().toUpperCase();
}

function normalizeDOB(value: any) {
  if (!value) return "N/A";

  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  }

  return value.toString();
}
/* ------------------------------------------------ */

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

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid rows data" },
        { status: 400 },
      );
    }

    if (rows.length > 10000) {
      return NextResponse.json(
        { success: false, message: "Maximum 10,000 rows allowed per upload" },
        { status: 400 },
      );
    }

    /* ---------------- FETCH EVENT ---------------- */

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventSnap.data()!;
    const categories = eventData.categories || [];

    /* ---------------- LOAD EXISTING RUNNERS (FAST) ---------------- */

    const existingRunners = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .select("nameIndex", "phoneIndex")
      .get();

    const existingSet = new Set<string>();

    existingRunners.docs.forEach((doc) => {
      const d = doc.data();
      existingSet.add(`${d.nameIndex}_${d.phoneIndex}`);
    });

    /* ---------------- JOB SYSTEM ---------------- */

    let jobId = "UPLOAD_" + Date.now();
    let startIndex = 0;

    const existingJob = await adminDb
      .collection("upload_history")
      .where("eventId", "==", eventId)
      .where("status", "==", "PROCESSING")
      .limit(1)
      .get();

    if (!existingJob.empty) {
      const jobDoc = existingJob.docs[0];
      jobId = jobDoc.id;
      const jobData = jobDoc.data();
      startIndex = jobData.lastRow + 1;
    } else {
      await adminDb.collection("upload_history").doc(jobId).set({
        jobId,
        eventId,
        totalRows: rows.length,
        processed: 0,
        inserted: 0,
        skipped: 0,
        lastRow: -1,
        status: "PROCESSING",
        createdAt: new Date(),
      });
    }

    /* ---------------- PROCESS ---------------- */

    let inserted = 0;
    let totalRevenueIncrement = 0;
    const skipped: any[] = [];

    const batchSize = 400;
    let batch = adminDb.batch();
    let batchCount = 0;

    const duplicateTracker = new Set<string>();
    const startTime = Date.now();

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];

      /* -------- DUPLICATE IN EXCEL -------- */

      const duplicateKey =
        (row.firstName || "") +
        "_" +
        (row.lastName || "") +
        "_" +
        (row.phone || "");

      if (duplicateTracker.has(duplicateKey)) {
        skipped.push({ row: i + 1, reason: "Duplicate row in Excel" });

        await adminDb
          .collection("upload_history")
          .doc(jobId)
          .update({
            processed: i + 1,
            skipped: FieldValue.increment(1),
            lastRow: i,
          });

        continue;
      }

      duplicateTracker.add(duplicateKey);

      /* -------- CATEGORY -------- */

      const normalizedDistance = normalizeDistance(row.distance);

      const categoryIndex = categories.findIndex(
        (c: any) => String(c.distance) === normalizedDistance,
      );

      if (categoryIndex === -1) {
        skipped.push({ row: i + 1, reason: "Invalid distance" });

        await adminDb
          .collection("upload_history")
          .doc(jobId)
          .update({
            processed: i + 1,
            skipped: FieldValue.increment(1),
            lastRow: i,
          });

        continue;
      }

      const category = categories[categoryIndex];

      /* -------- DUPLICATE IN DATABASE -------- */

      const nameIndex = (
        (row.firstName || "") +
        " " +
        (row.lastName || "")
      ).toLowerCase();

      const phoneIndex = row.phone || "";

      const existingKey = `${nameIndex}_${phoneIndex}`;

      if (existingSet.has(existingKey)) {
        skipped.push({
          row: i + 1,
          reason: "Runner already registered",
        });

        await adminDb
          .collection("upload_history")
          .doc(jobId)
          .update({
            processed: i + 1,
            skipped: FieldValue.increment(1),
            lastRow: i,
          });

        continue;
      }

      /* -------- SEAT CHECK -------- */

      if (category.bookedSeats >= category.maxSeats) {
        skipped.push({ row: i + 1, reason: "Category full" });

        await adminDb
          .collection("upload_history")
          .doc(jobId)
          .update({
            processed: i + 1,
            skipped: FieldValue.increment(1),
            lastRow: i,
          });

        continue;
      }

      categories[categoryIndex].bookedSeats += 1;

      /* -------- CREATE REGISTRATION -------- */

      const registrationId =
        "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

      const registrationData = {
        registrationId,
        eventId,
        eventName: eventData.name,
        eventDate: eventData?.date?.toDate?.() || eventData?.date || null,

        categoryTitle: category.title,
        categoryId: category.id,
        amount: category.price,

        participant: {
          firstName: (row.firstName || "N/A").toUpperCase(),
          lastName: (row.lastName || "").toUpperCase(),

          categoryId: category.id,
          categoryTitle: category.title,
          categoryDistance: normalizedDistance,

          gender: normalizeGender(row.gender),
          dob: normalizeDOB(row.dob),
          bloodGroup: normalizeBloodGroup(row.bloodGroup),

          bibName: (row.bibName || row.firstName || "N/A").toUpperCase(),
          tshirtSize: normalizeTshirt(row.tshirtSize),

          address: (row.address || "N/A").toUpperCase(),
          state: (row.state || "N/A").toUpperCase(),
          pincode: row.pincode || "N/A",

          phone: row.phone || "N/A",
          whatsAppNumber: row.phone || "",
          email: row.email || "N/A",

          emergencyName: (row.emergencyName || "N/A").toUpperCase(),
          emergencyNumber: row.emergencyNumber || "N/A",

          runnerClub: (row.runnerClub || "N/A").toUpperCase(),
          runnerClubOther: (row.runnerClubOther || "").toUpperCase(),

          medicallyFit: true,
          agree: true,
          bibNumber: null,
        },

        payment: {
          method: "OFFLINE",
          status: "SUCCESS",
        },

        status: "CONFIRMED",
        confirmedAt: new Date(),
        createdAt: new Date(),

        searchKey:
          (row.firstName || "") +
          " " +
          (row.lastName || "") +
          " " +
          (row.phone || ""),

        phoneIndex,
        nameIndex,
      };

      const flatRef = adminDb
        .collection("registrations_flat")
        .doc(registrationId);

      batch.set(flatRef, registrationData);
      batchCount++;

      existingSet.add(existingKey);

      inserted++;
      totalRevenueIncrement += Number(category.price || 0);

      /* -------- BATCH COMMIT -------- */

      if (batchCount === batchSize) {
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }

      /* -------- PROGRESS UPDATE -------- */

      await adminDb
        .collection("upload_history")
        .doc(jobId)
        .update({
          processed: i + 1,
          inserted: FieldValue.increment(1),
          lastRow: i,
          progress: Math.round(((i + 1) / rows.length) * 100),
        });

      /* -------- TIMEOUT PROTECTION -------- */

      if (Date.now() - startTime > 50000) {
        return NextResponse.json({
          success: true,
          jobId,
          resumeRequired: true,
        });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    /* -------- UPDATE EVENT -------- */

    await eventRef.update({ categories });

    await eventRef.set(
      {
        metrics: {
          totalParticipants: FieldValue.increment(inserted),
          confirmedCount: FieldValue.increment(inserted),
          totalRevenue: FieldValue.increment(totalRevenueIncrement),
        },
      },
      { merge: true },
    );

    /* -------- COMPLETE JOB -------- */

    await adminDb.collection("upload_history").doc(jobId).update({
      inserted,
      skipped: skipped.length,
      status: "COMPLETED",
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      jobId,
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
