"use client";

import { useRouter } from "next/navigation";
import {
  CurrencyRupeeIcon,
  UserIcon,
  FlagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Category } from "@/types/event";

interface Props {
  event: {
    slug: string;
    categories: Category[];
  };
}

export default function CategoryCards({ event }: Props) {
  const router = useRouter();

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
  hover:shadow-lg
  h-full
  flex flex-col
  "
      >
        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-[2px] bg-red-500 rounded-full"></span>

            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              Event
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Race Categories
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Choose your distance and secure your bib.
          </p>
        </div>

        {/* CATEGORY LIST */}
        <div className="space-y-4 overflow-y-auto pr-2 max-h-[420px]">
          {event.categories.map((cat) => {
            const seatsLeft = cat.maxSeats - cat.bookedSeats;

            let status: "open" | "almost" | "soldout" = "open";

            if (cat.status === "closed" || seatsLeft === 0) status = "soldout";
            else if (seatsLeft <= cat.maxSeats * 0.2) status = "almost";

            return (
              <div
                key={cat.id}
                className="
              flex items-center justify-between
              border border-gray-200
              rounded-lg
              px-5 py-4
              hover:border-orange-300
              hover:shadow-sm
              transition
              "
              >
                {/* LEFT */}

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FlagIcon className="w-5 h-5 text-gray-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-800">
                        {cat.distance} KM
                      </span>

                      <div className="flex items-center text-gray-600 text-sm">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                        {cat.price}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">{cat.title}</p>

                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Age {cat.minAge} – {cat.maxAge}
                    </div>
                  </div>
                </div>

                {/* REGISTER BUTTON */}

                <button
                  disabled={status === "soldout"}
                  onClick={() =>
                    router.push(
                      `/events/${event.slug}/register?category=${encodeURIComponent(
                        cat.title,
                      )}`,
                    )
                  }
                  className="
                inline-flex items-center gap-2
                px-4 py-2
                rounded-lg
                text-sm font-semibold
                text-white
                bg-gradient-to-r from-orange-500 to-red-500
                hover:from-orange-600 hover:to-red-600
                disabled:opacity-40
                "
                >
                  Register
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
