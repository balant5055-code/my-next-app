"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface EventItem {
  id: string;
  name: string;
}

export default function SelectEventPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/organizer/login");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const eventIds = userData.eventIds || [];

        const eventList: EventItem[] = [];

        for (const id of eventIds) {
          const eventSnap = await getDoc(doc(db, "events", id));

          if (eventSnap.exists()) {
            eventList.push({
              id,
              name: eventSnap.data().name || id,
            });
          }
        }

        setEvents(eventList);
      } catch (error) {
        console.error("Failed loading events:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading events...
      </div>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-xl font-semibold">No Events Assigned</h2>
        <p className="text-gray-500">Please contact admin to assign events.</p>
      </div>
    );
  }

  /* ---------------- PAGE ---------------- */

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Select Event</h1>

      <div className="grid gap-4">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() =>
              router.push(`/organizer/admin/events/${event.id}/dashboard`)
            }
            className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md text-left transition"
          >
            <div className="font-semibold text-lg">{event.name}</div>
            <div className="text-sm text-gray-500">{event.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
