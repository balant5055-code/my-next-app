"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { KPISection } from "@/components/organizer/KPISection";
import { CategoryPerformance } from "@/components/organizer/CategoryPerformanceList";
import {
  PresentationChartLineIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import RecentRegistrations from "@/components/organizer/RecentRegistrations";
import PageHeader from "@/components/organizer/PageHeader";

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      const snap = await getDoc(doc(db, "events", eventId));
      if (snap.exists()) {
        setEvent(snap.data());
      }
    }

    loadEvent();
  }, [eventId]);

  if (!event) {
    return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        icon={<ChartBarIcon className="h-5 w-5" />}
        title="Dashboard Overview"
        subtitle="Track registrations, revenue and performance"
        breadcrumbs={[
          { label: "Home", href: "/organizer/admin" },
          { label: "Dashboard" },
        ]}
      />
      {/* ===== STRATEGIC HIGHLIGHTS ===== */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <PresentationChartLineIcon className="h-6 w-6 text-orange-600" />
          <h2 className="text-lg sm:text-xl  text-gray-900">
            Strategic{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Highlights
            </span>
          </h2>
        </div>

        <KPISection metrics={event.metrics} />
      </section>

      {/* ===== CATEGORY PERFORMANCE + RECENT ACTIVITY ===== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 flex flex-col h-[520px]">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg  text-gray-900">
              Category <span className="text-orange-600">Performance</span>
            </h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex-1 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="h-full overflow-y-auto pr-2">
              <CategoryPerformance categories={event.categories} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col h-[520px]">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg  text-gray-900">
              Recent <span className="text-orange-600">Activity</span>
            </h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex-1 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="h-full overflow-y-auto pr-2 space-y-3">
              <RecentRegistrations eventId={eventId} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
