"use client";

import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function KitDistributionSection({ kit }: any) {
  if (!kit) return null;

  const formattedDate = kit.date
    ? new Date(kit.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBA";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
          <CalendarDaysIcon className="h-5 w-5 text-red-500" />
        </div>

        <h3 className="text-sm font-semibold text-gray-900">
          Kit Distribution
        </h3>
      </div>

      {/* Info */}
      <div className="space-y-4 text-sm">
        {/* Date */}
        <div className="flex items-start gap-3">
          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mt-1" />

          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-medium text-gray-900">{formattedDate}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <ClockIcon className="h-4 w-4 text-gray-400 mt-1" />

          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="font-medium text-gray-900">{kit.time ?? "TBA"}</p>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-3">
          <MapPinIcon className="h-4 w-4 text-gray-400 mt-1" />

          <div>
            <p className="text-xs text-gray-500">Venue</p>

            <p className="font-medium text-gray-900 leading-snug">
              {kit.venue ?? "Venue TBA"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
