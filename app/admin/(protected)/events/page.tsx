"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  MapPinIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 const router = useRouter();
  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(list);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Events
          </h1>
          <p className="text-gray-500">
            All your marathons and events in one place
          </p>
        </div>

        <Link
          href="/admin/create-event"
          className="inline-flex items-center gap-2 rounded-full
                     bg-red-600 px-6 py-3 text-white font-semibold
                     shadow-md hover:bg-red-700 hover:shadow-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Create Event
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="py-20 text-center text-gray-400">
          Loading events…
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && events.length === 0 && (
        <div className="rounded-3xl bg-white p-16 text-center shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">
            No events yet
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Create your first event to start accepting registrations.
          </p>

          <Link
            href="/admin/create-event"
            className="inline-flex items-center gap-2 mt-8 rounded-full
                       bg-red-600 px-7 py-3 text-white font-semibold
                       hover:bg-red-700 shadow transition"
          >
            <PlusIcon className="h-5 w-5" />
            Create First Event
          </Link>
        </div>
      )}

      {/* EVENTS GRID */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

          {events.map((event) => (
            <div
              key={event.id}
              className="group rounded-3xl bg-white p-6
                         shadow-md hover:shadow-xl
                         transition-all duration-300 hover:-translate-y-1"
            >
              {/* TITLE */}
              <h2 className="text-lg font-semibold text-gray-900">
                {event.name}
              </h2>

              {/* META */}
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-red-500" />
                  <span>{event.city || "—"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-red-500" />
                  <span>{event.date || "—"}</span>
                </div>
              </div>

              {/* STATUS */}
              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full px-4 py-1.5
                    text-xs font-semibold
                    ${
                      event.registrationStatus === "open"
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {event.registrationStatus === "open"
                    ? "Registration Open"
                    : "Registration Closed"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-5 text-sm">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="inline-flex items-center gap-1 font-medium
                             text-red-600 hover:text-red-700"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit
                </Link>

                <Link
                  href={`/events/${event.slug || event.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 font-medium
                             text-gray-600 hover:text-gray-800"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
