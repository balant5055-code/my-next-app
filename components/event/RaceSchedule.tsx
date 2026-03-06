"use client";

import { motion } from "framer-motion";
import { ClockIcon, FlagIcon } from "@heroicons/react/24/outline";

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
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Race Schedule
        </h2>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="
                flex items-center justify-between
                rounded-lg
                border border-gray-200
                px-4 py-3
                hover:border-orange-300
                hover:shadow-sm
                transition
                "
              >
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div
                    className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  bg-orange-50
                  "
                  >
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>

                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>

                {/* Time */}
                <p className="text-sm font-semibold text-gray-900">
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
