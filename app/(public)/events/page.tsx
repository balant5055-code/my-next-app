"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";
type EventType = {
  id: string;
  name?: string;
  city?: string;
  date?: Date | null;
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
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const getDaysToGo = (date?: Date | null) => {
    if (!date) return null;

    const eventDate = date instanceof Date ? date : new Date(date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} Days to Go`;
    if (diffDays === 0) return "Event Today 🎉";

    return "Event Completed";
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-20">
      {/* HEADER */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-14 text-center border-title"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
          <span>Upcoming Running, Cycling & Sports Events</span>
        </h2>

        <p className="mt-3 text-2xl md:text-3xl lg:text-3xl text-gray-600 max-w-2xl mx-auto tan">
          Discover upcoming races and register instantly.
        </p>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && events.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No upcoming events available right now.
        </div>
      )}

      {/* GRID */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event, index) => {
            const isOpen = event.registration?.status === "open";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  href={`/events/${event.slug || event.id}`}
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-orange-200"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" />
                  {index === 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
                    >
                      <div className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-[3px] text-[10px] font-semibold text-white shadow-md">
                        🔥 Next Upcoming Event
                      </div>
                    </motion.div>
                  )}
                  {/* IMAGE */}
                  <div className="relative h-52 overflow-hidden">
                    {/* ZOOM IMAGE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // prevents card navigation
                        setZoomImage(
                          event.image ??
                            "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
                        );
                      }}
                      className="cursor-pointer absolute bottom-3 right-3 z-20 rounded-full bg-white/90 backdrop-blur p-2 shadow transition hover:scale-110 hover:bg-white"
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <Image
                      src={
                        event.image ||
                        "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf"
                      }
                      alt={event.name || "Sports Event"}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />

                    {/* Premium gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition pointer-events-none" />
                    {/* DAYS BADGE */}
                    {event.date && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold shadow">
                        ⏳ {getDaysToGo(event.date)}
                      </div>
                    )}

                    {/* STATUS */}
                    <div
                      className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
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
                    </div>

                    {/* DATE */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white rounded-md px-2 py-1 text-center">
                      <p className="text-sm font-bold">
                        {event.date instanceof Date
                          ? event.date.getDate()
                          : "--"}
                      </p>

                      <p className="text-[10px] uppercase">
                        {event.date instanceof Date
                          ? event.date.toLocaleString("en-US", {
                              month: "short",
                            })
                          : "TBA"}
                      </p>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-between p-4 grow">
                    <div className="space-y-2">
                      <h3 className="flex items-start gap-2 text-sm font-semibold text-gray-900">
                        <CalendarDaysIcon className="h-4 w-4 text-orange-500 mt-[2px]" />
                        {event.name || "Untitled Event"}
                      </h3>

                      <p className="flex gap-2 text-xs text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {event.venue || "Venue TBA"}
                      </p>

                      <p className="flex gap-2 text-xs text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {event.city || "Location TBA"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                        Register / View Details
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      {zoomImage && (
        <motion.div
          variants={{
            hover: { y: 0, opacity: 1 },
          }}
          initial={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={zoomImage}
            onClick={(e) => e.stopPropagation()} // ⭐ ADD THIS
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          />
        </motion.div>
      )}
      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
