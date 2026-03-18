"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  CheckIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
  LinkIcon,
  ShareIcon,
  TrophyIcon,
  ClockIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

import ImageViewer from "@/components/ImageViewer";
import ResultCard from "@/components/event/ResultCard";
import { getEventStage } from "@/lib/eventLifecycle";
import { EventType } from "@/lib/types/event";
import SectionHeader from "@/components/ui/SectionHeader";

const ITEMS_PER_PAGE = 6;

export default function EventsPage() {
  const headingRef = useRef<HTMLDivElement | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const getFormatIcon = (format?: string) => {
    switch (format) {
      case "timed":
        return <TrophyIcon className="h-3.5 w-3.5" />;
      case "non-timed":
        return <ClockIcon className="h-3.5 w-3.5" />;
      case "fun-run":
        return <SparklesIcon className="h-3.5 w-3.5" />;
      case "awareness":
        return <HeartIcon className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };
  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, "events"));

      const list = snap.docs.map((doc) => {
        const data = doc.data() as EventType;

        const { id: _, ...rest } = data;

        return {
          id: doc.id,
          ...rest,
          date:
            data.date instanceof Timestamp
              ? data.date.toDate()
              : data.date instanceof Date
                ? data.date
                : null,
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

  const upcomingEvents = events.filter((e) => getEventStage(e) !== "results");

  const totalPages = Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const currentEvents = upcomingEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const resultsEvents = events.filter((e) => getEventStage(e) === "results");

  return (
    <div className="max-w-7xl mx-auto px-4 ">
      {/* HEADER */}
      <motion.div
        ref={headingRef}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-14 text-center"
      >
        <SectionHeader
          label="Race Results"
          icon={<TrophyIcon className="h-4 w-4 text-red-500" />}
          title="Upcoming Running, Cycling & Sports Events"
          subtitle=" Discover upcoming races and register instantly."
        />
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
                <div className="mb-2 flex justify-center h-[26px]">
                  {index === 0 ? (
                    <div className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-[4px] text-[11px] font-semibold text-white shadow-md">
                      🔥 Next Upcoming Event
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-[4px] text-[11px] font-medium text-gray-600">
                      📅 Upcoming {/* Event Type */}
                      {event.eventType && (
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-[4px] rounded-full bg-orange-50 text-orange-600 font-medium">
                          <BoltIcon className="h-3.5 w-3.5" />

                          {event.eventType}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  href={`/events/${event.slug || event.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-orange-200"
                >
                  {/* Date badge */}
                  {/* DATE CORNER */}
                  <div className="absolute top-2 left-2 z-30 bg-gradient-to-br from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl shadow-lg flex flex-col items-center leading-none backdrop-blur-sm">
                    {/* Day */}
                    <span className="text-[9px] uppercase font-semibold tracking-widest opacity-90">
                      {event.date instanceof Date
                        ? event.date.toLocaleString("en-US", {
                            weekday: "short",
                          })
                        : "--"}
                    </span>

                    {/* Month */}
                    <span className="text-[9px] uppercase font-medium tracking-wider opacity-90 mt-[2px]">
                      {event.date instanceof Date
                        ? event.date.toLocaleString("en-US", { month: "short" })
                        : "TBA"}
                    </span>

                    {/* Date */}
                    <span className="text-[18px] font-bold mt-[1px]">
                      {event.date instanceof Date ? event.date.getDate() : "--"}
                    </span>
                  </div>
                  {/* REGISTRATION RIBBON */}
                  <div className="absolute top-0 right-0 z-30 overflow-hidden w-24 h-24 pointer-events-none">
                    <div
                      className={`absolute rotate-45 text-white text-[11px] font-semibold tracking-wide text-center w-40 py-[5px] shadow-md top-5 -right-11
      ${
        isOpen
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : "bg-gradient-to-r from-gray-700 to-gray-900"
      }
    `}
                    >
                      {isOpen ? "OPEN" : "CLOSED"}
                    </div>
                  </div>

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
                    ></motion.div>
                  )}
                  {/* IMAGE */}
                  {/* IMAGE */}
                  {/* IMAGE */}

                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-black">
                    {/* Cinematic blur background */}
                    {/* Cinematic glow background */}
                    <div className="absolute inset-0 scale-150 blur-3xl opacity-50 transition duration-700 group-hover:scale-[1.6]">
                      <Image
                        src={event.bannerURL || "/ONLINE_POSTER.jpg"}
                        alt=""
                        fill
                        priority={index < 2}
                        className="object-cover"
                      />
                    </div>

                    {/* Animated spotlight */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
                      <div className="absolute -inset-[40%] bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-12 blur-2xl animate-[spotlight_3s_linear_infinite]" />
                    </div>

                    {/* Soft light glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent pointer-events-none" />

                    {/* Poster */}
                    <Image
                      src={event.bannerURL || "/ONLINE_POSTER.jpg"}
                      alt={event.name || "Sports Event"}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-contain p-3 transition duration-700 group-hover:scale-105"
                    />

                    {/* Premium overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Floating countdown */}
                    {event.date && (
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold shadow-lg flex items-center gap-1">
                        ⏳ {getDaysToGo(event.date)}
                      </div>
                    )}

                    {/* Zoom button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setZoomImage(event.bannerURL ?? "/ONLINE_POSTER.jpg");
                      }}
                      className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg hover:scale-110 transition"
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-between p-5 grow bg-gradient-to-b from-white to-gray-50">
                    {/* TOP SECTION */}
                    <div className="space-y-4">
                      {/* EVENT TITLE */}
                      <h3 className="flex items-start gap-2 text-[16px] font-semibold text-gray-900 leading-snug">
                        <CalendarDaysIcon className="h-5 w-5 text-orange-500 mt-[2px]" />

                        <span className="line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {event.name || "Untitled Event"}
                        </span>
                        {event.eventFormat && (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-[4px] rounded-full bg-orange-50 text-orange-600 font-medium">
                            {getFormatIcon(event.eventFormat)}
                            {event.eventFormat.replace("-", " ").toUpperCase()}
                          </span>
                        )}
                      </h3>

                      {/* LOCATION */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />

                        <span className="font-medium">
                          {event.city || "Location TBA"}
                        </span>
                      </div>
                    </div>

                    {/* FOOTER ACTION BAR */}
                    {/* FOOTER ACTION BAR */}
                    <div className="pt-4 flex items-center justify-end border-t border-gray-100 mt-4">
                      <div className="flex items-center gap-2">
                        {/* COPY LINK */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();

                            navigator.clipboard.writeText(
                              `${window.location.origin}/events/${event.slug || event.id}`,
                            );

                            setCopiedId(event.id);

                            setTimeout(() => {
                              setCopiedId(null);
                            }, 2000);
                          }}
                          className="group flex items-center gap-2 h-9 px-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                        >
                          {copiedId === event.id ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <LinkIcon className="h-4 w-4" />
                          )}

                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 group-hover:max-w-[80px]">
                            {copiedId === event.id ? "Copied" : "Copy"}
                          </span>
                        </button>

                        {/* SHARE */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();

                            navigator.share?.({
                              title: event.name,
                              url: `${window.location.origin}/events/${event.slug || event.id}`,
                            });
                          }}
                          className="group flex items-center gap-2 h-9 px-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                        >
                          <ShareIcon className="h-4 w-4" />

                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 group-hover:max-w-[80px]">
                            Share
                          </span>
                        </button>

                        {/* VIEW DETAILS */}
                        <button className="group flex items-center gap-2 h-9 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow hover:shadow-md transition-all duration-300">
                          <ArrowRightIcon className="h-4 w-4" />

                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 group-hover:max-w-[120px]">
                            View Details
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      <ImageViewer image={zoomImage} onClose={() => setZoomImage(null)} />
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

      {/* RESULTS SECTION */}

      {resultsEvents.length > 0 && (
        <div className="mt-20">
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <SectionHeader
              label="Race Results"
              icon={<TrophyIcon className="h-4 w-4 text-red-500" />}
              title="Explore Latest Race Results"
              subtitle="Discover podium finishers, leaderboard rankings, and race performance insights."
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultsEvents.map((event, index) => (
              <ResultCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
