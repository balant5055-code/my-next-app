"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Props {
  event: {
    name: string;
    venue: string;
    city: string;
    date: Date | null;
  };
}

export default function EventHeader({ event }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Registration status logic */

  const getRegistrationStatus = () => {
    if (!event.date) return null;

    const today = new Date();
    const diff = event.date.getTime() - today.getTime();

    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    if (days > 1) {
      return { label: `${days} days left`, type: "open" };
    }

    if (days === 1) {
      return { label: "Last day today", type: "urgent" };
    }

    return { label: "Registration closed", type: "closed" };
  };

  const status = getRegistrationStatus();

  return (
    <motion.div
      id="event-header"
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: scrolled ? 0.98 : 1,
      }}
      transition={{ duration: 0.35 }}
      className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden group
  ${scrolled ? "shadow-sm" : "shadow-lg"}`}
    >
      {/* HOVER GLOW */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

      {/* LEFT ACCENT */}
      <div className="absolute inset-y-0 left-0 w-[5px] bg-[var(--color-orange-500)]" />

      <div className="relative p-6 md:p-8">
        {/* TITLE ROW */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            Register for{" "}
            <span className="text-[var(--color-orange-500)]">{event.name}</span>
          </h1>

          {status && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border
              ${
                status.type === "open"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status.type === "urgent"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              {status.label}
            </div>
          )}
        </div>

        {/* ANIMATED DIVIDER */}

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-[3px] bg-[var(--color-orange-500)] rounded-full mt-3"
        />

        {/* META INFO */}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <MapPinIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
            <span className="text-gray-700 font-medium">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <MapPinIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
            <span className="text-gray-700 font-medium">{event.city}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <CalendarDaysIcon className="w-4 h-4 text-[var(--color-orange-500)]" />
            <span className="text-gray-700 font-medium">
              {event.date
                ? event.date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "TBA"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
