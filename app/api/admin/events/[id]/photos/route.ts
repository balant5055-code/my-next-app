import { NextRequest, NextResponse } from "next/server";
import { adminDb, bucket } from "@/lib/firebaseAdmin";
import sharp from "sharp";
import crypto from "crypto";

/* ================= UTIL ================= */
const getFileName = (originalName: string) => {
  const base = originalName.split(".")[0].replace(/\s+/g, "-");
  return `${Date.now()}-${base}.webp`;
};

const getPublicUrl = (path: string) => {
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
};

/* ================= HASH ================= */
const generateHash = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/* ================= POST (UPLOAD) ================= */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 },
      );
    }

    const uploaded: any[] = [];
    const skipped: any[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      /* ================= DUPLICATE CHECK ================= */
      const hash = generateHash(buffer);

      const existing = await adminDb
        .collection("events")
        .doc(eventId)
        .collection("event_photos")
        .where("hash", "==", hash)
        .limit(1)
        .get();

      if (!existing.empty) {
        skipped.push({ fileName: file.name, reason: "duplicate" });
        continue; // 🔥 skip upload
      }

      const fileName = getFileName(file.name);

      /* ================= SHARP ================= */
      const smallBuffer = await sharp(buffer)
        .rotate()
        .resize(300)
        .webp({ quality: 70 })
        .toBuffer();

      const mediumBuffer = await sharp(buffer)
        .rotate()
        .resize(1000)
        .webp({ quality: 80 })
        .toBuffer();

      /* ================= PATH ================= */
      const smallPath = `events/${eventId}/photos/small/${fileName}`;
      const mediumPath = `events/${eventId}/photos/medium/${fileName}`;

      /* ================= UPLOAD ================= */
      await Promise.all([
        bucket.file(smallPath).save(smallBuffer, {
          metadata: {
            contentType: "image/webp",
            cacheControl: "public, max-age=31536000, immutable",
          },
          public: true,
        }),

        bucket.file(mediumPath).save(mediumBuffer, {
          metadata: {
            contentType: "image/webp",
            cacheControl: "public, max-age=31536000, immutable",
          },
          public: true,
        }),
      ]);

      /* ================= URL ================= */
      const smallUrl = getPublicUrl(smallPath);
      const mediumUrl = getPublicUrl(mediumPath);

      /* ================= FIRESTORE ================= */
      const docRef = await adminDb
        .collection("events")
        .doc(eventId)
        .collection("event_photos")
        .add({
          eventId,
          hash, // 🔥 IMPORTANT
          smallUrl,
          mediumUrl,
          smallPath,
          mediumPath,
          imageUrl: mediumUrl,
          bibNumbers: [],
          status: "draft",
          createdAt: new Date(),
        });

      uploaded.push({
        id: docRef.id,
        smallUrl,
        mediumUrl,
      });
    }

    return NextResponse.json({
      success: true,
      uploaded,
      skipped, // 🔥 tell frontend duplicates skipped
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

/* ================= GET (PAGINATION) ================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "15"); // ✅ FIXED DEFAULT

    const baseRef = adminDb
      .collection("events")
      .doc(eventId)
      .collection("event_photos");

    /* ===== TOTAL COUNT ===== */
    const totalSnap = await baseRef.count().get();
    const total = totalSnap.data().count;

    /* ===== PAGINATION ===== */
    const snapshot = await baseRef
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const photos = snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        smallUrl: d.smallUrl,
        mediumUrl: d.mediumUrl,
        imageUrl: d.imageUrl,
        status: d.status,
        bibNumbers: d.bibNumbers || [],
      };
    });

    return NextResponse.json({
      success: true,
      photos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Fetch failed" },
      { status: 500 },
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await context.params;

    const body = await req.json();
    const { photoIds } = body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json(
        { success: false, error: "photoIds required" },
        { status: 400 },
      );
    }

    const deleted: string[] = [];
    const failed: string[] = [];

    for (const photoId of photoIds) {
      try {
        const docRef = adminDb
          .collection("events")
          .doc(eventId)
          .collection("event_photos")
          .doc(photoId);

        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          failed.push(photoId);
          continue;
        }

        const data = docSnap.data();

        const smallPath = data?.smallPath;
        const mediumPath = data?.mediumPath;

        const tasks = [];

        if (smallPath) {
          tasks.push(
            bucket
              .file(smallPath)
              .delete()
              .catch(() => null),
          );
        }

        if (mediumPath) {
          tasks.push(
            bucket
              .file(mediumPath)
              .delete()
              .catch(() => null),
          );
        }

        await Promise.all(tasks);
        await docRef.delete();

        deleted.push(photoId);
      } catch (err) {
        console.error(err);
        failed.push(photoId);
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      failed,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 },
    );
  }
}
