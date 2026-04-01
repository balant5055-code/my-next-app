import { Metadata } from "next";
import EventPage from "./EventPage";
import { EventData } from "@/types/event";

/* ✅ FIREBASE */
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/* ================= FETCH EVENT ================= */

async function getEvent(slug?: string): Promise<EventData | null> {
  try {
    if (!slug) return null;

    const q = query(
      collection(db, "events"),
      where("slug", "==", slug)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() as EventData;

    return {
      ...data,
      id: docSnap.id,
    };
  } catch (err) {
    console.error("Firestore error:", err);
    return null;
  }
}

/* ================= TIMESTAMP CONVERTER ================= */

function convertTimestamp(value: any) {
  if (!value) return value;

  // Firestore Timestamp object
  if (value?.seconds !== undefined) {
    return new Date(value.seconds * 1000);
  }

  return value;
}

/* ================= NORMALIZER ================= */

function normalizeEvent(event: EventData | null): EventData | null {
  if (!event) return event;

  return {
    ...event,

    date: convertTimestamp(event.date),

    registration: event.registration
      ? {
          ...event.registration,
          start: convertTimestamp(event.registration.start),
          end: convertTimestamp(event.registration.end),
        }
      : undefined,
  };
}

/* ================= SERIALIZER (IMPORTANT) ================= */

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: "Event Not Found | Raceline",
      description: "Invalid event URL.",
    };
  }

  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | Raceline",
      description: "This event could not be found.",
    };
  }

  return {
    title: `${event.name} | Raceline`,
    description:
      event.description?.slice(0, 160) ||
      "Join this exciting race event.",
  };
}

/* ================= PAGE ================= */

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Invalid event URL
      </div>
    );
  }

  const rawEvent = await getEvent(slug);
  const normalizedEvent = normalizeEvent(rawEvent);

  if (!normalizedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Event not found
      </div>
    );
  }

  /* ✅ CRITICAL FIX: SERIALIZE */
  const event = serialize(normalizedEvent);

  /* ================= JSON-LD ================= */

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description:
      event.description || "Join this exciting race event.",
    startDate: event.date
      ? new Date(event.date).toISOString()
      : undefined,
    endDate: event.date
      ? new Date(event.date).toISOString()
      : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",
    image: event.bannerURL ? [event.bannerURL] : [],
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Raceline",
    },
    offers: {
      "@type": "Offer",
      url: `/events/${event.slug}`,
      priceCurrency: "INR",
      price: event.categories?.[0]?.price ?? 0,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      {/* ✅ SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* ✅ CLIENT COMPONENT SAFE */}
      <EventPage event={event} />
    </>
  );
}