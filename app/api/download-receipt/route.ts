export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
let cachedFontBytes: Buffer | null = null;
let cachedLogoBytes: Buffer | null = null;
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || typeof id !== "string" || id.length > 40) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    // 🔥 ONLY read from registrations_flat (fast & clean)
    const docSnap = await adminDb
      .collection("registrations_flat")
      .doc(id)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    const data = docSnap.data();
    if (data?.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Receipt not available" },
        { status: 403 },
      );
    }
    // ==============================
    // PDF GENERATION
    // ==============================

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter_18pt-Medium.ttf",
    );

    let font: any;
    if (!cachedFontBytes && fs.existsSync(fontPath)) {
      cachedFontBytes = fs.readFileSync(fontPath);
    }

    if (cachedFontBytes) {
      font = await pdfDoc.embedFont(cachedFontBytes);
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    let y = height - 60;

    // ==============================
    // LOGO
    // ==============================
    const logoPath = path.join(
      process.cwd(),
      "public",
      "logo",
      "raceline-in.png",
    );

    if (!cachedLogoBytes && fs.existsSync(logoPath)) {
      cachedLogoBytes = fs.readFileSync(logoPath);
    }

    if (cachedLogoBytes) {
      const logoImage = await pdfDoc.embedPng(cachedLogoBytes);
      const scaled = logoImage.scale(0.35);

      page.drawImage(logoImage, {
        x: 50,
        y: y - 30,
        width: scaled.width,
        height: scaled.height,
      });
    }
    page.drawText("RACELINE INDIA", {
      x: width - 220,
      y: y - 5,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= 60;

    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 40;

    page.drawText("REGISTRATION RECEIPT", {
      x: 50,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    const drawRow = (label: string, value: string | undefined) => {
      page.drawText(label, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(value || "-", {
        x: 250,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 24;
    };

    const fullName =
      data?.participant?.firstName && data?.participant?.lastName
        ? `${data.participant.firstName} ${data.participant.lastName}`
        : "Participant";

    // ==============================
    // PARTICIPANT DETAILS
    // ==============================
    page.drawText("Participant Details", {
      x: 50,
      y,
      size: 13,
      font,
      color: rgb(0, 0.4, 0.2),
    });

    y -= 20;

    drawRow("Name", fullName);
    drawRow("Event", data?.eventName);
    drawRow("Category", data?.category);

    y -= 20;

    // ==============================
    // PAYMENT DETAILS
    // ==============================
    page.drawText("Payment Details", {
      x: 50,
      y,
      size: 13,
      font,
      color: rgb(0, 0.4, 0.2),
    });

    y -= 20;

    drawRow("Registration ID", id);
    drawRow("Payment ID", data?.payment?.paymentId);
    drawRow("Order ID", data?.payment?.orderId);
    drawRow("Amount Paid", data?.amount ? `₹ ${data.amount}` : "₹ 0");
    drawRow("Status", data?.payment?.status || "SUCCESS");

    y -= 40;

    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 25;

    page.drawText(
      "Thank you for registering. We look forward to seeing you at the event.",
      {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.4),
      },
    );

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${id}.pdf`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("RECEIPT ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
