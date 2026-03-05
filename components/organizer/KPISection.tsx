"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export function KPISection({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const items = [
    {
      label: "Participants",
      value: metrics.totalParticipants,
      subtitle: `Capacity: ${metrics.totalParticipants} / ${metrics.totalCapacity}`,
      icon: UsersIcon,
    },
    {
      label: "Revenue",
      value: metrics.totalRevenue,
      prefix: "₹",
      icon: CurrencyRupeeIcon,
    },
    {
      label: "Occupancy",
      value: metrics.occupancyRate,
      suffix: "%",
      icon: ChartBarIcon,
      showProgress: true,
    },
    {
      label: "BIB Assigned",
      value: metrics.bibAssignedCount,
      icon: TicketIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="relative bg-white border border-gray-100 rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition"
          >
            {/* Subtle Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600/80 rounded-t-xl" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  {item.label}
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                  <CountUp
                    end={item.value || 0}
                    duration={1}
                    separator=","
                    prefix={item.prefix || ""}
                    suffix={item.suffix || ""}
                  />
                </h2>

                {item.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                )}
              </div>

              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Occupancy progress */}
            {item.showProgress && (
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.occupancyRate}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-red-600"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
