"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-10">Race Results</h1>

      {loading && <p className="text-gray-500">Loading results...</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-500">No race results published yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/results/${event.slug}`}
            className="block border rounded-xl p-6 hover:shadow-md transition bg-white"
          >
            <h2 className="text-lg font-semibold mb-2">{event.name}</h2>

            <p className="text-sm text-gray-500">
              {event.city} • {event.venue}
            </p>

            <p className="text-xs text-gray-400 mt-2">View Full Results →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
