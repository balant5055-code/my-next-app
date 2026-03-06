"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CurrencyRupeeIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface Category {
  price: number;
}

interface MobileRegisterBarProps {
  event: {
    slug: string;
    categories?: Category[];
  };
}

export default function MobileRegisterBar({ event }: MobileRegisterBarProps) {
  const router = useRouter();

  const categoryCount = event.categories?.length ?? 0;

  const startingPrice =
    event.categories && event.categories.length > 0
      ? Math.min(...event.categories.map((c) => c.price))
      : null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B1220] backdrop-blur-lg px-4 py-3"
    >
      <div className="flex items-center justify-between">
        {/* EVENT INFO */}
        <div className="flex flex-col text-xs text-slate-400">
          {startingPrice !== null && (
            <span className="flex items-center gap-1">
              <CurrencyRupeeIcon className="h-4 w-4 text-orange-400" />
              From ₹{startingPrice}
            </span>
          )}

          <span className="flex items-center gap-1">
            <TrophyIcon className="h-4 w-4 text-orange-400" />
            {categoryCount} Categories
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => router.push(`/events/${event.slug}/register`)}
          className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-2 rounded-full text-sm"
        >
          Register Now
        </button>
      </div>
    </motion.div>
  );
}
