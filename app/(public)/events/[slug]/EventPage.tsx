"use client";

import { EventData } from "@/types/event";

/* COMPONENTS */
import EventHero from "@/components/event/EventHero";
import EventStats from "@/components/event/EventStats";
// import EventRegistrationProgress from "@/components/event/EventRegistrationProgress";
import CategoryCards from "@/components/event/CategoryCards";
import EventInclusions from "@/components/event/EventInclusions";
import EventAbout from "@/components/event/EventAbout";
import RaceSchedule from "@/components/event/RaceSchedule";
import EventLocation from "@/components/event/EventLocation";
import ImportantInfo from "@/components/event/ImportantInfo";
import StickyRegisterCard from "@/components/event/StickyRegisterCard";
import MobileRegisterBar from "@/components/event/MobileRegisterBar";
import KitDistributionSection from "@/components/event/KitDistributionSection";

/* ================= PAGE ================= */

export default function EventPage({ event }: { event: EventData }) {
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Event not found
      </div>
    );
  }

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

        {/* OPTIONAL */}
        {/* <EventRegistrationProgress event={event} /> */}
      </main>

      {/* MOBILE REGISTER BAR */}
      <MobileRegisterBar event={event} />
    </>
  );
}
