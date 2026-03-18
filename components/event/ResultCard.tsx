"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  MapPinIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { TrophyIcon } from "@heroicons/react/24/solid";

import { EventType } from "@/lib/types/event";

type Props = {
  event: EventType;
  index: number;
};

const formatEventDate = (date: any) => {
  if (!date) return "TBA";

  if (date?.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  if (date instanceof Date) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};

export default function ResultCard({ event, index }: Props) {
  const distances = event.categories?.map((c) => `${c.distance}K`) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/results/${event.slug || event.id}`}
        className="group block h-full"
      >
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden transition hover:shadow-lg hover:-translate-y-1">
          {/* 🔥 IMAGE */}
          <div className="relative h-44 bg-gray-100 overflow-hidden">
            <Image
              src={event.bannerURL || "/ONLINE_POSTER.jpg"}
              alt={event.name || "Event"}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* BADGE */}
            <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold text-white px-3 py-[5px] rounded-full bg-red-600">
              <TrophyIcon className="h-3 w-3" />
              RESULTS
            </div>

            {/* EVENT NAME (OVER IMAGE) */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h3 className="text-sm font-semibold line-clamp-2">
                {event.name || "Race Results"}
              </h3>
            </div>
          </div>

          {/* 🔥 CONTENT */}
          <div className="p-5 flex flex-col flex-1 space-y-4">
            {/* META */}
            <div className="flex items-center justify-between text-xs text-gray-500">
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
              {distances.map((d, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-[4px] rounded-full bg-gray-100 text-gray-700 font-medium"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* 🔥 STATS STRIP (NEW 🔥) */}
            <div className="grid grid-cols-3 text-center border border-gray-200 rounded-xl overflow-hidden">
              <div className="py-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {event.metrics?.totalParticipants ?? "-"}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">
                  Runners
                </div>
              </div>

              <div className="py-3">
                <div className="text-sm font-semibold text-gray-900">
                  {distances.length}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">
                  Categories
                </div>
              </div>

              <div className="py-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {event.eventType?.toUpperCase() || "RUN"}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Type</div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <span className="text-xs text-gray-500">View leaderboard</span>

              <div className="flex items-center gap-1 text-gray-900 font-semibold text-sm group-hover:translate-x-1 transition">
                View Results
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
