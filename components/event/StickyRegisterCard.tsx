"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  formatDate,
  formatCurrency,
  formatLocation,
} from "@/lib/utils";
import {
  CalendarDaysIcon,
  MapPinIcon,
  TrophyIcon,
  CurrencyRupeeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface Category {
  price: number;
}

interface StickyRegisterCardProps {
  event: {
    slug: string;
    date?: string | Date | null;
    venue?: string;
    city?: string;
    categories?: Category[];
  };
}

export default function StickyRegisterCard({
  event,
}: StickyRegisterCardProps) {
  const router = useRouter();

  const startingPrice =
    event.categories && event.categories.length > 0
      ? Math.min(...event.categories.map((c) => c.price))
      : null;

  return (
    <aside className="hidden md:block sticky top-24">
      <div
        className="
        rounded-xl
        border border-gray-200
        bg-white
        p-6
        shadow-sm
        "
      >
        {/* Title */}
         <h2 className="text-lg  text-gray-900">
            Race Entry
          </h2>

        {/* Info */}
        <div className="mt-6 space-y-4">
          {/* Date */}
          <InfoRow
            icon={CalendarDaysIcon}
            label="Event Date"
            value={formatDate(event.date)}
          />

          {/* Location */}
          <InfoRow
            icon={MapPinIcon}
            label="Location"
            value={formatLocation(event.venue, event.city)}
          />

          {/* Categories */}
          <InfoRow
            icon={TrophyIcon}
            label="Categories"
            value={`${event.categories?.length ?? 0} races`}
          />

          {/* Price */}
          {startingPrice !== null && (
            <InfoRow
              icon={CurrencyRupeeIcon}
              label="Starting From"
              value={formatCurrency(startingPrice)}
            />
          )}
        </div>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/events/${event.slug}/register`)}
          className="
          mt-6
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-gradient-to-r
          from-orange-500
          to-red-500
          py-3
          text-sm
          
          text-white
          "
        >
          Register Now
          <ArrowRightIcon className="h-4 w-4" />
        </motion.button>
      </div>
    </aside>
  );
}

/* ================= INFO ROW ================= */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Icon Box */}
      <div
        className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        bg-orange-50
        "
      >
        <Icon className="h-5 w-5 text-orange-500" />
      </div>

      {/* Text */}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}