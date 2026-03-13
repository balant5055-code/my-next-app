"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  MapPinIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { TrophyIcon, FlagIcon, FireIcon } from "@heroicons/react/24/solid";

import { EventType } from "@/lib/types/event";

type Props = {
  event: EventType;
  index: number;
};
const formatEventDate = (date: any) => {
  if (!date) return "TBA";

  // Firestore timestamp
  if (date?.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  // Already JS Date
  if (date instanceof Date) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  // ISO string fallback
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};
export default function ResultCard({ event, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={`/results/${event.slug || event.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* LIGHT STREAK */}

        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
          <div className="absolute -inset-[40%] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl animate-[raceStreak_1.6s_linear]" />
        </div>

        {/* HERO IMAGE */}

        <div className="relative h-40 bg-black overflow-hidden">
          <Image
            src={event.bannerURL || "/ONLINE_POSTER.jpg"}
            alt=""
            fill
            className="object-cover blur-3xl scale-150 opacity-40"
          />

          <Image
            src={event.bannerURL || "/ONLINE_POSTER.jpg"}
            alt={event.name || "Event"}
            fill
            className="object-contain p-3"
          />

          {/* RESULTS BADGE */}

          <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold text-white px-3 py-[5px] rounded-full bg-red-600 shadow">
            <TrophyIcon className="h-3 w-3" />
            RESULTS
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-5 flex flex-col flex-1 space-y-4">
          {/* TITLE */}

          <h3 className="flex items-start gap-2 text-[16px] font-semibold text-gray-900">
            <FlagIcon className="h-5 w-5 text-gray-700 mt-[2px]" />

            <span className="line-clamp-2">{event.name || "Race Results"}</span>
          </h3>

          {/* META */}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />

              {event.city || "Location"}
            </div>

            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4" />

              {formatEventDate(event.date)}
            </div>
          </div>

          {/* DISTANCES */}

          <div className="flex flex-wrap gap-2">
            {Array.isArray(event.categories) &&
              event.categories.map((cat, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full bg-gray-100 text-gray-700 font-medium"
                >
                  <FireIcon className="h-3 w-3 text-gray-500" />
                  {cat.distance}
                </span>
              ))}
          </div>

          {/* LEADERBOARD PREVIEW */}

          <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent animate-[shimmer_4s_linear_infinite]" />

            <div className="relative space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <TrophyIcon className="h-5 w-5 text-red-500" />

                    <div className="absolute inset-0 rounded-full animate-[medalGlow_2s_infinite]" />
                  </div>
                  Winner
                </div>

                <span className="font-mono text-gray-700">32:14</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Runner Up</span>

                <span className="font-mono">33:02</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Third Place</span>

                <span className="font-mono">33:45</span>
              </div>
            </div>
          </div>

          {/* CTA */}

          <div className="flex items-center justify-between pt-2 mt-auto">
            <span className="text-xs text-gray-500">Full leaderboard</span>

            <div className="flex items-center gap-1 text-gray-900 font-semibold text-sm">
              View Results
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
