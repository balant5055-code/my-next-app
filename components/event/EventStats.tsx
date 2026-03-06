"use client";

import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MapPinIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

import { EventData } from "@/types/event";

interface Props {
  event: EventData;
}

export default function EventStats({ event }: Props) {
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBA";

  const categoryNames =
    event.categories?.map((c) => c.distance).join(" • ") || "TBA";

  const stats = [
    {
      label: "Event Date",
      value: formattedDate,
      icon: CalendarDaysIcon,
    },
    {
      label: "Location",
      value: event.city || "TBA",
      icon: MapPinIcon,
    },
    {
      label: "Categories",
      value: categoryNames,
      icon: FlagIcon,
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="leading-tight">
                  <p className="text-xs text-gray-500">{stat.label}</p>

                  <p className="text-sm font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
