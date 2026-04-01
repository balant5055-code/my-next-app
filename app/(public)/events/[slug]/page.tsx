import { Metadata } from "next";
import EventPage from "./EventPage";

/* ================= FETCH EVENT ================= */

async function getEvent(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/events/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("Event fetch error:", err);
    return null;
  }
}

/* ================= DATE NORMALIZER ================= */

function normalizeEventDates(event: any) {
  if (!event) return event;

  return {
    ...event,
    date: event.date ? new Date(event.date) : null,
    registration: {
      ...event.registration,
      start: event.registration?.start
        ? new Date(event.registration.start)
        : null,
      end: event.registration?.end
        ? new Date(event.registration.end)
        : null,
    },
  };
}

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

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
  params: { slug: string };
}) {
  const { slug } = params;

  const rawEvent = await getEvent(slug);
  const event = normalizeEventDates(rawEvent);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Event not found
      </div>
    );
  }

  return <EventPage event={event} />;
}