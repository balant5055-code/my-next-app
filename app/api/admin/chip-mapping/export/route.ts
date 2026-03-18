export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return new Response("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new Response("Missing eventId", { status: 400 });
    }

    const snapshot = await adminDb
      .collection("registrations_flat")
      .where("eventId", "==", eventId)
      .get();

    const workbook = new ExcelJS.Workbook();

    const formatIST = (ts: any) => {
      if (!ts) return "";
      if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return "";
    };

    /* ======================================
       PREPARE DATA STRUCTURES
    ====================================== */

    const categoryMap: Record<string, any[]> = {};
    const categoryStats: Record<string, { total: number; revenue: number }> =
      {};

    let totalRevenue = 0;

    snapshot.docs.forEach((doc) => {
      const d = doc.data();

     const category =
  d.categoryTitle ??
  d.participant?.categoryTitle ??
  "Uncategorized";

      if (!categoryMap[category]) {
        categoryMap[category] = [];
        categoryStats[category] = { total: 0, revenue: 0 };
      }

      categoryMap[category].push(d);

      const amount = Number(d.amount || 0);

      categoryStats[category].total += 1;
      categoryStats[category].revenue += amount;

      totalRevenue += amount;
    });

    /* ======================================
       CATEGORY SHEETS
    ====================================== */

    Object.entries(categoryMap).forEach(([categoryName, participants]) => {
      const safeSheetName = categoryName
        .replace(/[\/\\?*[\]]/g, "")
        .substring(0, 30);

      const sheet = workbook.addWorksheet(safeSheetName);

      sheet.views = [{ state: "frozen", ySplit: 1 }];

      sheet.columns = [
        { header: "Registration ID", key: "registrationId", width: 20 },
        { header: "Event Name", key: "eventName", width: 25 },
        { header: "Event Date (IST)", key: "eventDate", width: 22 },
        { header: "BIB", key: "bib", width: 12 },
        { header: "Chip", key: "chip", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Amount", key: "amount", width: 12 },
        { header: "First Name", key: "firstName", width: 18 },
        { header: "Last Name", key: "lastName", width: 18 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Email", key: "email", width: 28 },
        { header: "Payment Method", key: "paymentMethod", width: 15 },
        { header: "Payment Status", key: "paymentStatus", width: 15 },
      ];

      sheet.getRow(1).font = { bold: true };

      let categoryRevenue = 0;

      participants.forEach((d) => {
        const amount = Number(d.amount || 0);

        categoryRevenue += amount;

        sheet.addRow({
          registrationId: d.registrationId,
          eventName: d.eventName,
          eventDate: formatIST(d.eventDate),
          bib: d.participant?.bibNumber ?? "-",
          chip: d.chipCode ?? "-",
          status: d.status,
          amount: amount,
          firstName: d.participant?.firstName,
          lastName: d.participant?.lastName,
          phone: d.participant?.phone,
          email: d.participant?.email,
          paymentMethod: d.payment?.method,
          paymentStatus: d.payment?.status,
        });
      });

      sheet.addRow([]);

      const summaryRow = sheet.addRow([
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      summaryRow.getCell(1).font = { bold: true };

      sheet.addRow(["Revenue:", categoryRevenue]);
    });

    /* ======================================
       ALL PARTICIPANTS SHEET
    ====================================== */

    const sheet = workbook.addWorksheet("All Participants");

    sheet.views = [{ state: "frozen", ySplit: 2 }];

    sheet.mergeCells("A1:F1");

    sheet.getCell("A1").value = "Raceline India – Marathon Export";
    sheet.getCell("A1").font = { size: 14, bold: true };

    sheet.addRow([]);

    sheet.columns = [
      { header: "Registration ID", key: "registrationId", width: 20 },
      { header: "Event Name", key: "eventName", width: 25 },
      { header: "Event Date (IST)", key: "eventDate", width: 22 },
      { header: "Category", key: "category", width: 20 },
      { header: "BIB", key: "bib", width: 12 },
      { header: "Chip", key: "chip", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "First Name", key: "firstName", width: 18 },
      { header: "Last Name", key: "lastName", width: 18 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 28 },
      { header: "Payment Method", key: "paymentMethod", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
    ];

    sheet.getRow(3).font = { bold: true };

    snapshot.docs.forEach((doc) => {
      const d = doc.data();

      sheet.addRow({
        registrationId: d.registrationId,
        eventName: d.eventName,
        eventDate: formatIST(d.eventDate),
        category: d.categoryTitle,
        bib: d.participant?.bibNumber ?? "-",
        chip: d.chipCode ?? "-",
        status: d.status,
        amount: d.amount,
        firstName: d.participant?.firstName,
        lastName: d.participant?.lastName,
        phone: d.participant?.phone,
        email: d.participant?.email,
        paymentMethod: d.payment?.method,
        paymentStatus: d.payment?.status,
      });
    });

    /* ======================================
       CATEGORY SUMMARY
    ====================================== */

    const categorySheet = workbook.addWorksheet("Category Summary");

    categorySheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Total Participants", key: "total", width: 20 },
      { header: "Revenue", key: "revenue", width: 18 },
    ];

    categorySheet.getRow(1).font = { bold: true };

    Object.entries(categoryStats).forEach(([cat, data]) => {
      categorySheet.addRow({
        category: cat,
        total: data.total,
        revenue: data.revenue,
      });
    });

    categorySheet.addRow([]);

    categorySheet.addRow({
      category: "OVERALL TOTAL",
      total: snapshot.size,
      revenue: totalRevenue,
    });

    categorySheet.getRow(categorySheet.lastRow!.number).font = {
      bold: true,
    };

    /* ======================================
       FINANCE SUMMARY
    ====================================== */

    const financeSheet = workbook.addWorksheet("Finance Summary");

    financeSheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    financeSheet.getRow(1).font = { bold: true };

    financeSheet.addRow({
      metric: "Total Participants",
      value: snapshot.size,
    });

    financeSheet.addRow({
      metric: "Total Revenue",
      value: totalRevenue,
    });

    /* ======================================
       EXPORT FILE
    ====================================== */

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="marathon-export-${eventId}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return new Response("Server Error", { status: 500 });
  }
}