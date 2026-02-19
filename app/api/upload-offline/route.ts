export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  let jobId: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("eventId") as string;

    if (!file || !eventId) {
      return NextResponse.json(
        { error: "Missing file or eventId" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 },
      );
    }

    // Get event name first
    const eventSnap = await adminDb.collection("events").doc(eventId).get();
    const eventName = eventSnap.data()?.name || "Unknown Event";

    const jobRef = await adminDb.collection("upload_history").add({
      eventId,
      eventName, // 🔥 ADD THIS
      totalRows: rows.length,
      successCount: 0,
      failedCount: 0,
      status: "processing",
      startedAt: new Date(),
    });
    jobId = jobRef.id;

    let successCount = 0;
    let failedCount = 0;

    let batch = adminDb.batch();
    let operations = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // 🔥 STRICT REQUIRED VALIDATION
        if (!row.firstName || !row.phone) {
          failedCount++;

          await adminDb.collection("upload_failures").add({
            jobId,
            eventId,
            rowNumber: i + 2,
            rowData: row,
            reason: "First Name and Phone are required",
            status: "failed",
            createdAt: new Date(),
          });

          continue; // ⛔ Stop processing this row
        }

        const registrationId =
          "RLI-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();

        const registrationData = {
          registrationId,
          eventId,
          category: row.category || "",
          amount: Number(row.amount) || 0,

          participant: {
            firstName: row.firstName,
            lastName: row.lastName || "",
            dob: row.dob || "",
            gender: row.gender || "",
            phone: row.phone,
          },

          payment: {
            method: "OFFLINE",
            status: "SUCCESS",
          },

          status: "SUCCESS",
          createdAt: new Date(),
        };

        const flatRef = adminDb
          .collection("registrations_flat")
          .doc(registrationId);

        batch.set(flatRef, registrationData);

        operations += 2;
        successCount++;

        if (operations >= 400) {
          await batch.commit();
          batch = adminDb.batch();
          operations = 0;
        }
      } catch (err: any) {
        failedCount++;

        await adminDb.collection("upload_failures").add({
          jobId,
          eventId,
          rowNumber: i + 2,
          rowData: row,
          reason: err?.message || "Unknown error",
          status: "failed",
          createdAt: new Date(),
        });
      }
    }

    if (operations > 0) {
      await batch.commit();
    }

    // 🔥 UPDATE JOB STATUS
    await adminDb.collection("upload_history").doc(jobId).update({
      successCount,
      failedCount,
      status: "completed",
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      uploaded: successCount,
      failed: failedCount,
      total: rows.length,
      jobId,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    if (jobId) {
      await adminDb
        .collection("upload_history")
        .doc(jobId)
        .update({
          status: "failed",
          error: error?.message || "Unknown error",
          completedAt: new Date(),
        });
    }

    return NextResponse.json(
      { error: "Server error during upload" },
      { status: 500 },
    );
  }
}
