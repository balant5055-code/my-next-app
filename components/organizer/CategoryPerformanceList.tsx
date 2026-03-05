"use client";

import { motion } from "framer-motion";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
];

export function CategoryPerformance({ categories }: { categories?: any[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {categories.map((cat, index) => {
        const percent = cat.maxSeats
          ? (cat.bookedSeats / cat.maxSeats) * 100
          : 0;

        const accentColor = colors[index % colors.length];

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition overflow-hidden"
          >
            {/* LEFT ACCENT BAR */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}
            />

            <div className="p-5 pl-6 space-y-4">
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {cat.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {cat.distance} KM
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    cat.status === "open"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cat.status === "open" ? (
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                  ) : (
                    <XCircleIcon className="w-3.5 h-3.5" />
                  )}
                  {cat.status}
                </div>
              </div>

              {/* PARTICIPANT COUNT */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <UsersIcon className="w-5 h-5 text-gray-500" />
                </div>

                <div>
                  <div className="text-2xl font-bold text-gray-900 leading-none">
                    {cat.bookedSeats}
                  </div>
                  <div className="text-xs text-gray-400">
                    / {cat.maxSeats} capacity
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${accentColor}`}
                  />
                </div>

                <div className="text-xs text-gray-400 mt-1 text-right">
                  {percent.toFixed(1)}% filled
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
