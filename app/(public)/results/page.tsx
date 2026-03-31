"use client";

import { useEffect, useState } from "react";
import ResultCard from "@/components/event/ResultCard";
import PageHeader from "@/components/ui/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import { TrophyIcon } from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ResultsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/results/events");
        const data = await res.json();

        if (data.success) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Failed to load results events", error);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <PageContainer>
      <Breadcrumb />

      <PageHeader
        title="Race Results"
        subtitle="Explore official race leaderboards and finishing times"
        icon={<TrophyIcon className="w-5 h-5" />}
      />

      {/* 🔥 CONTENT WRAPPER */}
      <div className="mt-6 md:mt-8">
        {/* ✅ LOADING STATE (SKELETON, NOT TEXT) */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[180px] rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ✅ EMPTY STATE (PREMIUM) */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <TrophyIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-gray-800">
              No Results Yet
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Race results will appear here once events are completed.
            </p>
          </div>
        )}

        {/* ✅ RESULTS GRID */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {events.map((event, index) => (
              <ResultCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
