/* gOGOGLE seo 
After deploying, test here:🔗 https://search.google.com/test/rich-results
Enter:https://racelineindia.com/events/chennai-marathon
You should see:
✔ Event detected */

import { Metadata } from "next";
import EventPage from "./EventPage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://racelineindia.com";

async function getEvent(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${base}/api/events/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | Raceline India",
    };
  }

  const title = `${event.name} | Raceline India`;

  const description =
    event.description?.slice(0, 150) ||
    "Join this exciting race event organized by Raceline India.";

  const image = event.bannerURL || `${SITE_URL}/api/og/events/${event.slug}`;

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
      siteName: "Raceline India",
      images: [{ url: image, width: 1200, height: 630 }],
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
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await getEvent(slug);

  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",

        name: event.name,

        description:
          event.description ||
          "Join this exciting race event organized by Raceline India.",

        startDate: event.date,
        endDate: event.date,

        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",

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
          name: "Raceline India",
          url: "https://racelineindia.com",
          logo: "https://racelineindia.com/logo/raceline-in.png",
        },

        offers: {
          "@type": "Offer",
          url: `https://racelineindia.com/events/${event.slug}`,
          priceCurrency: "INR",
          price: event.categories?.[0]?.price ?? 0,
          availability: "https://schema.org/InStock",
          validFrom: event.registration?.start,
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
