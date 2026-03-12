"use client";

import { useEffect, useState, useRef } from "react";
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
import KitDistributionSection from "@/components/event/KitDistributionSection";
/* ================= HELPER ================= */

function parseFirestoreDate(value: any) {
  if (!value) return null;

  if (value.seconds) {
    return new Date(value.seconds * 1000);
  }

  if (value._seconds) {
    return new Date(value._seconds * 1000);
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

/* ================= PAGE ================= */

export default function EventPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!slug || fetchedRef.current) return;

    fetchedRef.current = true;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`, {
          next: { revalidate: 60 },
        });

        let data;
        try {
          data = await res.json();
        } catch {
          console.error("Invalid API response");
          setEvent(null);
          return;
        }

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
          tagline: raw.tagline ?? "",
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

          date: parseFirestoreDate(raw.date),

          registration: {
            start: parseFirestoreDate(raw.registration?.start) || undefined,
            end: parseFirestoreDate(raw.registration?.end) || undefined,
            status: raw.registration?.status ?? "closed",
          },

          kitDistribution: raw.kitDistribution ?? null,
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
                <KitDistributionSection kit={event.kitDistribution} />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <EventStats event={event} />

        {/* REGISTRATION PROGRESS */}
        {/* <EventRegistrationProgress event={event} /> */}
      </main>

      {/* MOBILE REGISTER BAR */}
      <MobileRegisterBar event={event} />
    </>
  );
}
