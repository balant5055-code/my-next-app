import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split("/");
    const eventId = segments[segments.length - 2];

    if (!eventId) {
      return NextResponse.json({ error: "Event ID missing" }, { status: 400 });
    }

    const ref = doc(db, "events", eventId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = snapshot.data();

    /* ================= ENTERPRISE CALCULATIONS ================= */

    const totalParticipants =
      data.categories?.reduce(
        (sum: number, cat: any) => sum + (cat.bookedSeats || 0),
        0,
      ) || 0;

    const totalRevenue =
      data.categories?.reduce(
        (sum: number, cat: any) =>
          sum + (cat.bookedSeats || 0) * (cat.price || 0),
        0,
      ) || 0;

    const totalCapacity =
      data.categories?.reduce(
        (sum: number, cat: any) => sum + (cat.maxSeats || 0),
        0,
      ) || 0;

    const occupancyRate =
      totalCapacity > 0
        ? Math.round((totalParticipants / totalCapacity) * 100)
        : 0;

    const categoryBreakdown =
      data.categories?.map((cat: any) => ({
        id: cat.id,
        name: cat.title,
        distance: cat.distance,
        participants: cat.bookedSeats || 0,
        capacity: cat.maxSeats || 0,
        revenue: (cat.bookedSeats || 0) * (cat.price || 0),
        occupancy:
          cat.maxSeats > 0
            ? Math.round((cat.bookedSeats / cat.maxSeats) * 100)
            : 0,
      })) || [];

    /* ================= RETURN FULL ENTERPRISE STRUCTURE ================= */

    return NextResponse.json({
      data: {
        id: snapshot.id,

        // Identity
        name: data.name,
        slug: data.slug,
        bannerURL: data.bannerURL,
        eventType: data.eventType,

        // Core Info
        city: data.city,
        venue: data.venue,
        date: data.date,
        gateOpen: data.gateOpen,
        raceStart: data.raceStart,
        description: data.description,
        status: data.status,

        // Organizer
        organizer: data.organizer,

        // Registration
        registration: data.registration,
        maxParticipants: data.maxParticipants,

        // Policies
        terms: data.terms,
        refundPolicy: data.refundPolicy,
        medicalNote: data.medicalNote,

        // Social
        socialLinks: data.socialLinks,

        // Rules
        rules: data.rules,

        // Categories
        categories: data.categories,

        // Metrics
        metrics: {
          totalParticipants,
          totalRevenue,
          totalCapacity,
          occupancyRate,
        },

        categoryBreakdown,
      },
    });
  } catch (err) {
    console.error("Overview API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
