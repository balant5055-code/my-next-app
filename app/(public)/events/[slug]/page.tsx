"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventData } from "@/types/event";

/* COMPONENTS */
import EventHero from "@/components/event/EventHero";
import EventStats from "@/components/event/EventStats";
import EventRegistrationProgress from "@/components/event/EventRegistrationProgress";
import CategoryCards from "@/components/event/CategoryCards";
import EventInclusions from "@/components/event/EventInclusions";
import EventAbout from "@/components/event/EventAbout";
import RaceSchedule from "@/components/event/RaceSchedule";
import EventLocation from "@/components/event/EventLocation";
import ImportantInfo from "@/components/event/ImportantInfo";
import StickyRegisterCard from "@/components/event/StickyRegisterCard";
import MobileRegisterBar from "@/components/event/MobileRegisterBar";
import EventPageSkeleton from "./loading";
/* ================= PAGE ================= */

export default function EventPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`, { cache: "no-store" });

        const data = await res.json();

        if (!res.ok) {
          console.error("API ERROR:", data);
          setEvent(null);
          return;
        }

        const raw = data;

        const formattedEvent: EventData = {
          id: raw.id,
          name: raw.name ?? "",
          slug: raw.slug ?? "",
          bannerURL: raw.bannerURL ?? "",
          eventType: raw.eventType ?? "Event",
          venue: raw.venue ?? "",
          city: raw.city ?? "",
          mapLink: raw.mapLink ?? "",
          gateOpen: raw.gateOpen ?? "",
          raceStart: raw.raceStart ?? "",
          description: raw.description ?? "",
          medicalNote: raw.medicalNote ?? "",
          maxParticipants: raw.maxParticipants ?? 0,
          categories: raw.categories ?? [],
          inclusions: raw.inclusions ?? {},
          date: raw.date?.seconds ? new Date(raw.date.seconds * 1000) : null,

          registration: {
            start: raw.registration?.start?.seconds
              ? new Date(raw.registration.start.seconds * 1000)
              : undefined,

            end: raw.registration?.end?.seconds
              ? new Date(raw.registration.end.seconds * 1000)
              : undefined,

            status: raw.registration?.status ?? "closed",
          },
        };

        setEvent(formattedEvent);
      } catch (err) {
        console.error("Error loading event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return <EventPageSkeleton />;
  }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Event not found
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <>
      <main>
        {/* HERO */}
        <EventHero event={event} />
        {/* CATEGORY + LOCATION */}
        <section className="bg-[#f8f7f3] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* LEFT - Categories */}
              <CategoryCards event={event} />

              {/* RIGHT - Location */}
              <EventLocation event={event} />
            </div>
          </div>
        </section>
        {/* EVENT INCLUSIONS */}
        <EventInclusions inclusions={event.inclusions} />

        {/* MAIN CONTENT */}
        <section className="bg-[#f8f7f3] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* LEFT CONTENT */}
              <div className="lg:col-span-2 space-y-8">
                <EventAbout event={event} />

                <RaceSchedule event={event} />

                <ImportantInfo event={event} />
              </div>

              {/* SIDEBAR */}
              <div className="lg:col-span-1">
                <StickyRegisterCard event={event} />
              </div>
            </div>
          </div>
        </section>
        {/* QUICK STATS */}
        <EventStats event={event} />

        {/* REGISTRATION PROGRESS */}
        {/*  <EventRegistrationProgress event={event} /> */}
      </main>

      {/* MOBILE REGISTER BAR */}
      <MobileRegisterBar event={event} />
    </>
  );
}
