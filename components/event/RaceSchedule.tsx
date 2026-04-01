"use client";

import { motion } from "framer-motion";
import {
  ClockIcon,
  FlagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface RaceScheduleProps {
  event: {
    gateOpen?: string;
    raceStart?: string;
  };
}

export default function RaceSchedule({ event }: RaceScheduleProps) {
  const items = [
    {
      label: "Gate Opens",
      value: event.gateOpen || "TBA",
      icon: ClockIcon,
    },
    {
      label: "Race Starts",
      value: event.raceStart || "TBA",
      icon: FlagIcon,
    },
  ];

  return (
    <section>
      <div className="rounded-xl bg-white p-6">

        {/* HEADER (aligned with all sections) */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
          </div>

          <h2 className="text-lg  text-gray-900">
            Race Schedule
          </h2>
        </div>

        {/* CONTENT */}
        <div className="space-y-5">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.value}
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