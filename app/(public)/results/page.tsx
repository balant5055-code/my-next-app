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

      {loading && <p className="text-gray-500">Loading results...</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-500">No race results published yet.</p>
      )}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
          {events.map((event, index) => (
            <ResultCard key={event.id} event={event} index={index} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
