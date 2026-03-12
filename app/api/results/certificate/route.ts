import { NextRequest, NextResponse } from "next/server";
import { adminDb, bucket } from "@/lib/firebaseAdmin";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const registrationId = req.nextUrl.searchParams.get("id");

    if (!registrationId) {
      return NextResponse.json(
        { error: "Missing registration id" },
        { status: 400 },
      );
    }

    /* ---------------- FETCH RUNNER ---------------- */

    const regDoc = await adminDb
      .collection("registrations_flat")
      .doc(registrationId)
      .get();

    if (!regDoc.exists) {
      return NextResponse.json({ error: "Runner not found" }, { status: 404 });
    }

    const reg: any = regDoc.data();
    const eventId = reg.eventId;

    /* ---------------- STORAGE PATH ---------------- */

    const filePath = `certificates/${eventId}/participant-certificate/${registrationId}.pdf`;
    const file = bucket.file(filePath);

    const [exists] = await file.exists();

    /* ---------------- IF ALREADY GENERATED ---------------- */

    if (exists) {
      const stream = file.createReadStream();

      return new NextResponse(stream as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="certificate-${reg.bibNumber}.pdf"`,
        },
      });
    }

    /* ---------------- FETCH EVENT ---------------- */

    const eventDoc = await adminDb.collection("events").doc(eventId).get();

    const event: any = eventDoc.data();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const template = event.certificateTemplate;

    if (!template) {
      return NextResponse.json(
        { error: "Certificate template missing" },
        { status: 400 },
      );
    }

    /* ---------------- LOAD TEMPLATE IMAGE FROM STORAGE ---------------- */

    const templatePath = `certificates/${eventId}/template.png`;
    const templateFile = bucket.file(templatePath);

    const [templateExists] = await templateFile.exists();

    if (!templateExists) {
      return NextResponse.json(
        { error: "Template image not found in storage" },
        { status: 404 },
      );
    }

    const [templateBuffer] = await templateFile.download();

    /* ---------------- CREATE PDF ---------------- */

    const pdfDoc = await PDFDocument.create();

    const width = template.width || 1200;
    const height = template.height || 850;

    const page = pdfDoc.addPage([width, height]);

    const bgImage = await pdfDoc.embedPng(templateBuffer);

    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    /* ---------------- RUNNER DATA ---------------- */

    const values: any = {
      name:
        reg.name ||
        `${reg.participant?.firstName || ""} ${reg.participant?.lastName || ""}`,

      bibNumber: reg.bibNumber || "",

      finishTime: reg?.result?.netTime || "",

      rank: reg?.result?.overallRank ? String(reg.result.overallRank) : "",

      category: reg.category || "",
    };

    /* ---------------- DRAW DYNAMIC FIELDS ---------------- */

    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const field of template.fields) {
      const value = values[field.key] || "";

      if (!value) continue;

      const maxWidth = field.width || 300;
      let fontSize = field.fontSize || 28;

      const fontToUse = field.fontWeight === "bold" ? fontBold : fontNormal;

      /* -------- COLOR FROM FIRESTORE -------- */

      const hex = field.color || "#000000";

      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const color = rgb(r, g, b);

      /* -------- AUTO SHRINK TEXT -------- */

      let textWidth = fontToUse.widthOfTextAtSize(value, fontSize);

      while (textWidth > maxWidth && fontSize > 10) {
        fontSize -= 1;
        textWidth = fontToUse.widthOfTextAtSize(value, fontSize);
      }

      /* -------- HORIZONTAL ALIGN -------- */

      let x = field.x;

      if (field.textAlign === "center") {
        x = field.x + (field.width - textWidth) / 2;
      }

      if (field.textAlign === "right") {
        x = field.x + field.width - textWidth;
      }

      /* -------- VERTICAL CENTER -------- */

      const y = height - field.y - field.height / 2 - fontSize / 2;

      page.drawText(value, {
        x,
        y,
        size: fontSize,
        font: fontToUse,
        color,
      });
    }

    /* ---------------- QR VERIFICATION ---------------- */

    const verifyUrl = `https://racelineindia.com/verify/${registrationId}`;

    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    const qrBuffer = Buffer.from(
      qrDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64",
    );

    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawImage(qrImage, {
      x: width - 150,
      y: 50,
      width: 100,
      height: 100,
    });

    page.drawText("Scan to verify", {
      x: width - 150,
      y: 30,
      size: 10,
      font,
    });

    /* ---------------- SAVE PDF ---------------- */

    const pdfBytes = await pdfDoc.save();

    await file.save(Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      public: false,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${reg.bibNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("CERTIFICATE ERROR", error);

    return NextResponse.json(
      { error: "Certificate generation failed" },
      { status: 500 },
    );
  }
}
