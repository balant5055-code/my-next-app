export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { bucket } from "@/lib/firebaseAdmin";
export async function POST(req: NextRequest) {
  try {
    /* ===============================
       🔐 1️⃣ AUTHENTICATION
    =============================== */

    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(token);

    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ===============================
       📦 2️⃣ PARSE & VALIDATE BODY
    =============================== */

    const formData = await req.formData();

    const bannerFile = formData.get("banner") as File;

    const body = JSON.parse(formData.get("data") as string);

    if (!body.name || !body.slug || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const categories = Array.isArray(body.categories)
      ? body.categories
      : Object.values(body.categories || {});

    if (!categories.length) {
      return NextResponse.json(
        { error: "At least one category required" },
        { status: 400 },
      );
    }

    /* ===============================
       🔤 3️⃣ SLUG NORMALIZATION
    =============================== */

    const normalizedSlug = String(body.slug)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let bannerURL = "";

    if (bannerFile) {
      const buffer = Buffer.from(await bannerFile.arrayBuffer());

      const filePath = `event_posters/${normalizedSlug}/poster.webp`;

      const file = bucket.file(filePath);

      await file.save(buffer, {
        metadata: {
          contentType: bannerFile.type,
        },
      });

      await file.makePublic();

      bannerURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }
    /* ===============================
       📅 4️⃣ DATE VALIDATION
    =============================== */

    const eventDate = new Date(body.date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid event date" },
        { status: 400 },
      );
    }

    const registrationStart = body.registration?.start
      ? new Date(body.registration.start)
      : new Date();

    const registrationEnd = body.registration?.end
      ? new Date(body.registration.end)
      : new Date();

    if (registrationEnd < registrationStart) {
      return NextResponse.json(
        { error: "Registration end must be after start date" },
        { status: 400 },
      );
    }

    /* ===============================
       🧠 5️⃣ ENTERPRISE CATEGORY ENGINE
    =============================== */

    const usedDistances = new Set<string>();
    let totalSeats = 0;

    const formattedCategories = categories.map((cat: any, index: number) => {
      if (!cat.title || !cat.distance) {
        throw new Error("Invalid category structure");
      }

      const distanceNumber = parseInt(cat.distance);

      if (isNaN(distanceNumber)) {
        throw new Error("Distance must be numeric like 3KM");
      }

      if (usedDistances.has(cat.distance)) {
        throw new Error(`Duplicate distance detected: ${cat.distance}`);
      }

      usedDistances.add(cat.distance);

      const isUnlimited = Boolean(cat.unlimited);

      const maxSeats = isUnlimited ? null : Number(cat.maxSeats || 0);

      if (!isUnlimited && (maxSeats ?? 0) <= 0) {
        throw new Error("Seats must be greater than zero");
      }
      if (!isUnlimited && maxSeats !== null) {
        totalSeats += maxSeats;
      }
      const bibBase = distanceNumber * 1000;
      const bibStart = bibBase + 1;
      const bibEnd =
        isUnlimited || maxSeats === null ? null : bibBase + maxSeats;
      const isTimed = cat.timedRun !== undefined ? Boolean(cat.timedRun) : true;

      return {
        id: `cat_${index + 1}`,
        title: String(cat.title),
        distance: String(cat.distance),
        price: Number(cat.price) || 0,

        cutOffTime: isTimed ? cat.cutOffTime || "" : null,

        earlyBirdPrice: cat.earlyBirdPrice ? Number(cat.earlyBirdPrice) : null,

        earlyBirdEnd: cat.earlyBirdEnd
          ? Timestamp.fromDate(new Date(cat.earlyBirdEnd))
          : null,

        minAge: Number(cat.minAge) || 0,
        maxAge: Number(cat.maxAge) || 100,
        maxSeats,
        unlimited: Boolean(cat.unlimited),

        timedRun: isTimed, // ✅ FINAL

        bookedSeats: 0,

        bibStart,
        bibEnd,
        nextBib: bibStart,

        status: "open",
        waitlistEnabled: false,

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    });

    /* ===============================
       📊 6️⃣ EVENT STRUCTURE
    =============================== */
    const hasUnlimited = formattedCategories.some(
      (c: { unlimited?: boolean }) => c.unlimited,
    );

    const eventPayload = {
      name: String(body.name).trim(),
      slug: normalizedSlug,
      tagline: body.tagline || "",
      eventType: body.eventType || "marathon",
      eventFormat: body.eventFormat || "timed",
      date: Timestamp.fromDate(eventDate),

      gateOpen: body.gateOpen || "",
      raceStart: body.raceStart || "",

      venue: body.venue || "",
      city: body.city || "",
      mapLink: body.mapLink || "",

      organizer: {
        name: body.organizer?.name || "",
        email: body.organizer?.email || "",
        phone: body.organizer?.phone || "",
        supportEmail: body.organizer?.supportEmail || "",
      },

      registration: {
        start: Timestamp.fromDate(registrationStart),
        end: Timestamp.fromDate(registrationEnd),
        status: "open",
      },

      maxParticipants:
        Number(body.maxParticipants) > 0
          ? Number(body.maxParticipants)
          : hasUnlimited
            ? null
            : totalSeats,

      socialLinks: body.socialLinks || {},

      description: body.description || "",
      terms: body.terms || "",
      refundPolicy: body.refundPolicy || "",
      medicalNote: body.medicalNote || "",

      bannerURL: bannerURL,

      kitDistribution: {
        date: body.kitDistribution?.date || "",
        venue: body.kitDistribution?.venue || "",
        time: body.kitDistribution?.time || "",
      },
      categories: formattedCategories,

      inclusions: {
        apparel: body.inclusions?.apparel || [],
        timing: body.inclusions?.timing || [],
        certificates: body.inclusions?.certificates || [],
        media: body.inclusions?.media || [],
        support: body.inclusions?.support || [],
        awards: body.inclusions?.awards || [],
      },

      status: "upcoming",

      /* ===============================
     📊 METRICS INITIALIZATION
  =============================== */

      metrics: {
        totalParticipants: 0,
        confirmedCount: 0,
        bibAssignedCount: 0,
        totalRevenue: 0,
        checkedInCount: 0,
        occupancyRate: 0,
        lastRecalculatedAt: Timestamp.now(),
      },

      /* ===============================
     🔐 BIB LOCK INITIALIZATION
  =============================== */

      bibGenerationLock: {
        locked: false,
        lockedAt: null,
        lockedBy: null,
      },

      /* ===============================
     🛡 AUDIT SYSTEM
  =============================== */

      auditLogs: [
        {
          action: "EVENT_CREATED",
          by: decoded.uid,
          at: Timestamp.now(),
        },
      ],

      createdBy: decoded.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    /* ===============================
       💾 7️⃣ SAVE EVENT
    =============================== */

    const docRef = adminDb.collection("events").doc(normalizedSlug);
    const existing = await adminDb
      .collection("events")
      .doc(normalizedSlug)
      .get();

    if (existing.exists) {
      return NextResponse.json(
        { error: "Event with this slug already exists" },
        { status: 400 },
      );
    }

    await docRef.create(eventPayload);
    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error: any) {
    console.error("🔥 Create Event Error:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
