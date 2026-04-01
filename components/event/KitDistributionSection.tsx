"use client";

import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function KitDistributionSection({ kit }: any) {
  if (!kit) return null;

  /* Helper → return NA if empty */
  const getValue = (val: any) => {
    if (!val || val === "" || val === "TBA") return "NA";
    return val;
  };

  const formattedDate = kit.date
    ? new Date(kit.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "NA";

  return (
    <section>
      <div className="rounded-xl bg-white p-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
          </div>

          <h2 className="text-lg  text-gray-900">
            Kit Distribution
          </h2>
        </div>

        {/* CONTENT */}
        <div className="space-y-5">

          {/* DATE */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* TIME */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <ClockIcon className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-medium text-gray-900">
                {getValue(kit.time)}
              </p>
            </div>
          </div>

          {/* VENUE */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <MapPinIcon className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Venue</p>
              <p className="font-medium text-gray-900 leading-snug">
                {getValue(kit.venue)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}