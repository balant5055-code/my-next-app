export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

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

    const body = await req.json();

    if (!body.name || !body.slug || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.categories) || body.categories.length === 0) {
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

    const formattedCategories = body.categories.map(
      (cat: any, index: number) => {
        if (!cat.title || !cat.distance || !cat.maxSeats) {
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

        const maxSeats = Number(cat.maxSeats);

        if (maxSeats <= 0) {
          throw new Error("Seats must be greater than zero");
        }

        totalSeats += maxSeats;

        const bibBase = distanceNumber * 1000;
        const bibStart = bibBase + 1;
        const bibEnd = bibBase + maxSeats;

        return {
          id: `cat_${index + 1}`,
          title: String(cat.title),
          distance: String(cat.distance),
          price: Number(cat.price) || 0,
          minAge: Number(cat.minAge) || 0,
          maxAge: Number(cat.maxAge) || 100,
          maxSeats,
          bookedSeats: 0,

          // 🎽 SERVER GENERATED BIB
          bibStart,
          bibEnd,
          nextBib: bibStart,

          status: "open",
          waitlistEnabled: false,

          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
      },
    );

    /* ===============================
       📊 6️⃣ EVENT STRUCTURE
    =============================== */

    const eventPayload = {
      name: String(body.name).trim(),
      slug: normalizedSlug,
      eventType: body.eventType || "marathon",

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
          : totalSeats,

      socialLinks: body.socialLinks || {},

      description: body.description || "",
      terms: body.terms || "",
      refundPolicy: body.refundPolicy || "",
      medicalNote: body.medicalNote || "",

      bannerURL: body.bannerURL || "",

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
