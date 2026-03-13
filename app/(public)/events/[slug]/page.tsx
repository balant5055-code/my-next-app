import { Metadata } from "next";
import EventPage from "./EventPage";

/* ================= DOMAIN DETECTION ================= */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/* ================= FETCH EVENT ================= */

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("Event fetch error:", err);
    return null;
  }
}

/* ================= SEO METADATA ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | Raceline",
      description: "This event could not be found.",
    };
  }

  const title = `${event.name} | Raceline`;
  const description =
    event.description?.slice(0, 160) ||
    "Join this exciting race event.";

  const image =
    event.bannerURL || `${SITE_URL}/api/og/events/${event.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: `${SITE_URL}/events/${event.slug}`,
    },

    openGraph: {
      title,
      description,
      url: `${SITE_URL}/events/${event.slug}`,
      siteName: "Raceline",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await getEvent(slug);

  /* ================= JSON-LD ================= */

  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",

        name: event.name,

        description:
          event.description ||
          "Join this exciting race event.",

        startDate: event.date,
        endDate: event.date,

        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode:
          "https://schema.org/OfflineEventAttendanceMode",

        image: [event.bannerURL],

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
          url: SITE_URL,
        },

        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/events/${event.slug}`,
          priceCurrency: "INR",
          price: event.categories?.[0]?.price ?? 0,
          availability: "https://schema.org/InStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

      )}

      <EventPage />
    </>
  );
}