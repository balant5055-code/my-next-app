"use client";

import { EventData } from "@/types/event";

/* COMPONENTS */
import EventHero from "@/components/event/EventHero";
import EventStats from "@/components/event/EventStats";
import CategoryCards from "@/components/event/CategoryCards";
import EventInclusions from "@/components/event/EventInclusions";
import EventAbout from "@/components/event/EventAbout";
import RaceSchedule from "@/components/event/RaceSchedule";
import EventLocation from "@/components/event/EventLocation";
import ImportantInfo from "@/components/event/ImportantInfo";
import StickyRegisterCard from "@/components/event/StickyRegisterCard";
import MobileRegisterBar from "@/components/event/MobileRegisterBar";
import KitDistributionSection from "@/components/event/KitDistributionSection";
import EventPolicies from "@/components/event/EventPolicies";
/* ================= PAGE ================= */

export default function EventPage({ event }: { event: EventData }) {
  /* LOADING / FALLBACK */
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white text-lg">
        Loading event...
      </div>
    );
  }

  return (
    <>
      <main>
        {/* ================= HERO ================= */}
        <EventHero event={event} />

        {/* ================= CATEGORY + LOCATION ================= */}
        <section className="bg-[#f8f7f3] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* LEFT - Categories (Pricing decision happens here) */}
              <CategoryCards event={event} />

              {/* RIGHT - Location */}
              <EventLocation event={event} />
            </div>
          </div>
        </section>
        <EventInclusions inclusions={event.inclusions} />
        {/* ================= MAIN CONTENT ================= */}
        <section className="bg-[#f8f7f3] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* ================= LEFT CONTENT ================= */}
              <div className="lg:col-span-2 space-y-10">
                <EventAbout event={event} />

                <ImportantInfo event={event} />
                <EventPolicies
                  terms={event.terms}
                  refundPolicy={event.refundPolicy}
                />
              </div>

              {/* ================= RIGHT SIDEBAR ================= */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <StickyRegisterCard event={event} />
                  <RaceSchedule event={event} />
                  <KitDistributionSection kit={event.kitDistribution} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= MOBILE REGISTER BAR ================= */}
      <MobileRegisterBar event={event} />

      {/* ================= QUICK STATS (TRUST + URGENCY) ================= */}
      <EventStats event={event} />
    </>
  );
}
