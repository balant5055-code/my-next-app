"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

type EventType = {
  id: string;
  name?: string;
  city?: string;
  date?: Date | null; // ✅ FIXED
  image?: string;
  slug?: string;
  venue?: string;
  registration?: {
    status?: string;
  };
};

const ITEMS_PER_PAGE = 6;

export default function EventsPage() {
  const headingRef = useRef<HTMLDivElement | null>(null);

  const [events, setEvents] = useState<EventType[]>([]);
  const [page, setPage] = useState(1);

 useEffect(() => {
  const fetchEvents = async () => {
    const snap = await getDocs(collection(db, "events"));
    const list = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate
          ? data.date.toDate()
          : data.date?.seconds
          ? new Date(data.date.seconds * 1000)
          : data.date || null,
      };
    });

    const sorted = list
      .filter((e) => e.date)
      .sort((a, b) => {
        const da = a.date instanceof Date ? a.date.getTime() : 0;
        const db = b.date instanceof Date ? b.date.getTime() : 0;
        return da - db;
      });

    setEvents(sorted);
  };

  fetchEvents();
}, []);
  const getDaysToGo = (date?: Date | null) => {
    if (!date) return null;
    const eventDate = date instanceof Date ? date : new Date(date);

    const today = new Date();

    // remove time part for clean day diff
    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} Days to Go`;
    if (diffDays === 0) return "Event is Today 🎉";
    return "Event Completed";
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <main className="max-w-7xl mx-auto px-4 mt-20">
      {/* HEADER */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center border-title"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
          <span>Upcoming Events</span>
        </h2>
        <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
          Choose your next experience and register instantly.
        </p>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {currentEvents.map((event, index) => {
          const isOpen = event.registration?.status === "open";

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      event.image ||
                      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf"
                    }
                    alt={event.name || "Event"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* DAYS TO GO BADGE */}
                  {event.date && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      className="absolute bottom-4 left-4 rounded-full bg-white/90 backdrop-blur-sm 
               px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-md
               border border-gray-200"
                    >
                      ⏳ {getDaysToGo(event.date)}
                    </motion.div>
                  )}

                  {/* STATUS BADGE */}
                  <motion.div
                    animate={isOpen ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2.8, repeat: Infinity }}
                    className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-md ${
                      isOpen
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {isOpen ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <XCircleIcon className="h-4 w-4" />
                    )}
                    {isOpen ? "Open" : "Closed"}
                  </motion.div>

                  {/* DATE BADGE */}
                  {/* DATE BADGE */}
                  <div className="absolute top-4 left-4 rounded-lg bg-red-600 px-3 py-2 text-center text-white shadow-md">
                    <p className="text-lg font-bold leading-none">
                      {event.date instanceof Date ? event.date.getDate() : "--"}
                    </p>

                    <p className="text-[11px] uppercase">
                      {event.date instanceof Date
                        ? event.date.toLocaleString("en-US", { month: "short" })
                        : "TBA"}
                    </p>

                    <p className="text-[10px] opacity-90">
                      {event.date instanceof Date
                        ? event.date.getFullYear()
                        : ""}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex grow flex-col justify-between p-6">
                  <div className="space-y-3">
                    <h3 className="flex items-start gap-2 text-lg font-semibold text-gray-900">
                      <CalendarDaysIcon className="h-5 w-5 text-orange-500 mt-0.5" />
                      {event.name || "Untitled Event"}
                    </h3>

                    <p className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span>{event.venue || "No Address"}</span>
                    </p>

                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      {event.city || "Location TBA"}
                    </p>
                  </div>

                  <div className="mt-6">
                    <button className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                      View Details
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">
            Showing page{" "}
            <span className="font-semibold text-gray-700">{page}</span> of{" "}
            <span className="font-semibold text-gray-700">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              Prev
            </button>

            <span className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow">
              {page}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => p + 1);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                page === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
