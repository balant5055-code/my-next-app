"use client";

import { motion } from "framer-motion";
import { UserGroupIcon } from "@heroicons/react/24/outline";

interface Category {
  bookedSeats?: number;
}

interface EventRegistrationProgressProps {
  event: {
    maxParticipants?: number;
    categories?: Category[];
  };
}

export default function EventRegistrationProgress({
  event,
}: EventRegistrationProgressProps) {
  const totalBooked =
    event.categories?.reduce((sum, cat) => sum + (cat.bookedSeats ?? 0), 0) ??
    0;

  const capacity = event.maxParticipants ?? 0;

  const progress =
    capacity > 0 ? Math.min((totalBooked / capacity) * 100, 100) : 0;

  return (
    <section className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <div
              className="
            flex h-9 w-9 items-center justify-center
            rounded-lg
            bg-orange-50
            "
            >
              <UserGroupIcon className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Registrations</p>

              <p className="text-sm font-medium text-gray-900">
                {totalBooked.toLocaleString()} / {capacity.toLocaleString()}{" "}
                runners
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 md:max-w-md">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
