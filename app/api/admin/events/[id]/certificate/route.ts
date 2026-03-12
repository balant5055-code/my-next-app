import { NextRequest, NextResponse } from "next/server";
import { adminDb, bucket } from "@/lib/firebaseAdmin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    /* ---------------- GET EVENT ID ---------------- */

    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing event id" },
        { status: 400 },
      );
    }

    /* ---------------- READ FORM DATA ---------------- */

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const layoutRaw = formData.get("layout") as string;

    if (!layoutRaw) {
      return NextResponse.json(
        { success: false, error: "Layout missing" },
        { status: 400 },
      );
    }

    const layout = JSON.parse(layoutRaw);

    let templateUrl: string | null = null;

    /* ---------------- TEMPLATE UPLOAD ---------------- */

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const path = `certificates/${eventId}/template.png`;

      const storageFile = bucket.file(path);

      await storageFile.save(buffer, {
        metadata: {
          contentType: file.type,
        },
        public: true,
      });

      templateUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
    }

    /* ---------------- GET EXISTING EVENT ---------------- */

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    const existing = eventSnap.data();

    /* ---------------- BUILD TEMPLATE DATA ---------------- */

    const certificateTemplate = {
      width: layout.width,
      height: layout.height,
      fields: layout.fields,
      templateUrl:
        templateUrl || existing?.certificateTemplate?.templateUrl || null,
      updatedAt: new Date(),
    };

    /* ---------------- SAVE TO FIRESTORE ---------------- */

    await eventRef.set(
      {
        certificateTemplate,
      },
      { merge: true },
    );

    return NextResponse.json({
      success: true,
      templateUrl: certificateTemplate.templateUrl,
    });
  } catch (error) {
    console.error("CERTIFICATE SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Certificate layout save failed",
      },
      { status: 500 },
    );
  }
}
