"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  MapPinIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  PhotoIcon,
  UserGroupIcon,
  Squares2X2Icon,
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

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};

export default function ResultCard({ event, index }: Props) {
  const slug = event.slug || event.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="h-full"
    >
      <div className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg overflow-hidden">

        {/* IMAGE */}
        <div className="relative h-40 overflow-hidden">
          <Image
            src={event.bannerURL || "/ONLINE_POSTER.jpg"}
            alt={event.name || "Event"}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* BADGE */}
          <div className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-medium text-white px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
            <TrophyIcon className="h-3 w-3" />
            Results
          </div>

          {/* TITLE */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {event.name}
            </h3>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col flex-1 gap-3">

          {/* META */}
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1 truncate">
              <MapPinIcon className="h-4 w-4" />
              {event.city || "Location"}
            </div>

            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4" />
              {formatEventDate(event.date)}
            </div>
          </div>

          {/* STATS */}
          <div className="flex justify-between text-center px-1">

            <div className="flex flex-col items-center gap-0.5">
              <UserGroupIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                {event.metrics?.totalParticipants ?? "-"}
              </span>
              <span className="text-[10px] text-gray-400">Runners</span>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <Squares2X2Icon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                {event.categories?.length || 0}
              </span>
              <span className="text-[10px] text-gray-400">Categories</span>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <TrophyIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                {event.eventType?.toUpperCase() || "RUN"}
              </span>
              <span className="text-[10px] text-gray-400">Type</span>
            </div>

          </div>

          {/* CTA (ALIGNED) */}
          <div className="mt-auto flex flex-col gap-2 pt-2">

            {/* RESULTS */}
            <Link
              href={`/results/${slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
            >
              <span className="flex items-center gap-1">
                <TrophyIcon className="h-4 w-4" />
                Results
              </span>

              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            {/* PHOTOS */}
            <Link
              href={`/results/${slug}/photos`}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
            >
              <span className="flex items-center gap-1">
                <PhotoIcon className="h-4 w-4" />
                Photos
              </span>

              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

          </div>
        </div>
      </div>
    </motion.div>
  );
}