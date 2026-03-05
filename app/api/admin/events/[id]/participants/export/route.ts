export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import ExcelJS from "exceljs";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    /* ======================================================
       🔐 1️⃣ ADMIN AUTH
    ====================================================== */
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);
    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ======================================================
       🆔 2️⃣ EVENT ID
    ====================================================== */
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    /* ======================================================
       🔎 3️⃣ QUERY PARAMS (MATCH TABLE)
    ====================================================== */
    const { searchParams } = new URL(req.url);

    const format = searchParams.get("format") || "xlsx";
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const paymentStatus = searchParams.get("paymentStatus");
    const status = searchParams.get("status");

    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection =
      searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const pageSize = Number(searchParams.get("pageSize") || 25);
    const lastValue = searchParams.get("lastValue");
    const lastDocId = searchParams.get("lastDocId");

    /* ======================================================
       🔥 4️⃣ BUILD QUERY (SAME AS TABLE)
    ====================================================== */

    let query: FirebaseFirestore.Query = adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId);

    /* Filters */
    if (category && category !== "all") {
      query = query.where("participant.distance", "==", category);
    }

    if (paymentStatus && paymentStatus !== "all") {
      const upper = paymentStatus.toUpperCase();

      if (["SUCCESS", "FAILED"].includes(upper)) {
        query = query.where("payment.status", "==", upper);
      } else {
        query = query.where("payment.method", "==", upper);
      }
    }

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    /* Search */
    if (search) {
      const trimmed = search.trim();

      if (/^\d+$/.test(trimmed)) {
        query = query.where("participant.phone", "==", trimmed);
      } else if (trimmed.includes("@")) {
        query = query.where("participant.email", "==", trimmed.toLowerCase());
      } else {
        const lower = trimmed.toLowerCase();
        query = query
          .where("nameLowercase", ">=", lower)
          .where("nameLowercase", "<=", lower + "\uf8ff")
          .orderBy("nameLowercase");
      }
    }

    /* Sorting */
    query = query
      .orderBy(sortField, sortDirection as FirebaseFirestore.OrderByDirection)
      .orderBy("__name__")
      .limit(pageSize);

    /* Pagination Cursor */
    if (lastValue && lastDocId) {
      query = query.startAfter(lastValue, lastDocId);
    }

    /* ======================================================
       ✅ 5️⃣ FETCH ONLY CURRENT PAGE
    ====================================================== */

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    /* ======================================================
       🧠 6️⃣ FLATTEN DATA
    ====================================================== */

    const flattenObject = (
      obj: any,
      prefix = "",
      result: Record<string, any> = {},
    ) => {
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value instanceof Timestamp) {
          result[newKey] = value.toDate();
        } else if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          flattenObject(value, newKey, result);
        } else {
          result[newKey] = value ?? "";
        }
      }
      return result;
    };

    const flattenedRows = snapshot.docs.map((doc) => flattenObject(doc.data()));

    const allKeys = new Set<string>();
    flattenedRows.forEach((row) =>
      Object.keys(row).forEach((key) => allKeys.add(key)),
    );

    const columns = Array.from(allKeys);

    /* ======================================================
       📦 7️⃣ CREATE EXCEL
    ====================================================== */

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Raceline India";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Participants");

    sheet.columns = columns.map((key) => ({
      header: key,
      key,
      width: 22,
    }));

    flattenedRows.forEach((row, index) => {
      const excelRow = sheet.addRow(row);

      if (index % 2 === 0) {
        excelRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF7F7F7" },
        };
      }

      excelRow.eachCell((cell) => {
        if (cell.value instanceof Date) {
          cell.numFmt = "dd-mmm-yyyy hh:mm";
        }

        if (typeof cell.value === "boolean") {
          cell.value = cell.value ? "Yes" : "No";
        }
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    /* ======================================================
       📤 RETURN FILE
    ====================================================== */

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="participants_page.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);

    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 },
    );
  }
}
