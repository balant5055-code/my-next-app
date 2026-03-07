"use client";

import { motion } from "framer-motion";
import {
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface EventLocationProps {
  event: {
    venue?: string;
    city?: string;
    mapLink?: string;
  };
}

export default function EventLocation({ event }: EventLocationProps) {
  const mapQuery = `${event.venue ?? ""} ${event.city ?? ""}`;

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQuery,
  )}&z=15&output=embed`;

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
        rounded-2xl
        border border-gray-200
        bg-white
        p-6 md:p-7
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-lg
        h-full
        flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
            <MapPinIcon className="h-5 w-5 text-orange-600" />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Event Location
            </h2>

            <p className="text-xs text-gray-500">
              Race start point and venue details
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gray-100 mb-5" />

        {/* Venue */}
        <div className="flex items-start gap-3 mb-5">
          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />

          <div>
            <p className="text-sm font-semibold text-gray-900">
              {event.venue || "Venue TBA"}
            </p>

            {event.city && (
              <p className="text-sm text-gray-600">{event.city}</p>
            )}
          </div>
        </div>

        {/* Google Map */}
        {(event.venue || event.city) && (
          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          </div>
        )}

        {/* ACTION BUTTONS */}
        {(event.venue || event.city) && (
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            {/* Open Maps */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              href={
                event.mapLink
                  ? event.mapLink
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      mapQuery,
                    )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
              inline-flex items-center gap-2
              px-4 py-2
              text-sm font-semibold
              rounded-lg
              bg-red-600
              text-white
              shadow-sm
              hover:bg-red-700
              transition
              "
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Open Maps
            </motion.a>

            {/* Share Location */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const url = event.mapLink
                  ? event.mapLink
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      mapQuery,
                    )}`;

                if (navigator.share) {
                  navigator.share({
                    title: "Event Location",
                    text: `${event.venue}, ${event.city}`,
                    url,
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert("Location copied!");
                }
              }}
              className="
              inline-flex items-center gap-2
              px-4 py-2
              text-sm font-semibold
              rounded-lg
              border border-red-200
              text-red-600
              bg-white
              hover:bg-red-50
              transition
              "
            >
              <MapPinIcon className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        )}
      </motion.div>
    </section>
  );
}
