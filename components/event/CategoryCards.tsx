"use client";

import { useRouter } from "next/navigation";
import {
  CurrencyRupeeIcon,
  FlagIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  RocketLaunchIcon,
  UserIcon,
  ClockIcon,
  TicketIcon,
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
        transition
        hover:-translate-y-1
        hover:shadow-lg
        h-full
        flex flex-col
        "
      >
        {/* HEADER */}

        <div className="mb-8 sm:mb-10">
          {/* Top label row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Icon badge */}
            <div
              className="flex items-center justify-center 
      w-8 h-8 sm:w-9 sm:h-9 
      rounded-lg bg-red-50 border border-red-100"
            >
              <FlagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>

            {/* Label */}
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-red-500 uppercase">
              Event
            </span>

            {/* Divider */}
            <span className="flex-1 h-[1px] bg-gradient-to-r from-red-200 via-red-100 to-transparent"></span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Race Categories
          </h2>

          {/* Description */}
          <p className="text-gray-500 text-sm sm:text-base mt-1 sm:mt-2 max-w-xl">
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
flex flex-col md:flex-row md:items-center md:justify-between
gap-4
border border-gray-200
rounded-lg
px-4 py-4
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

                      <div className="flex items-center text-sm gap-2">
                        <CurrencyRupeeIcon className="w-4 h-4 text-gray-500" />

                        {cat.earlyBirdPrice ? (
                          <>
                            <span className="line-through text-gray-400">
                              ₹{cat.price}
                            </span>

                            <span className="text-green-600">
                              ₹{cat.earlyBirdPrice}
                            </span>
                            <RocketLaunchIcon className="w-4 h-4" />
                          </>
                        ) : (
                          <span className="text-gray-700 font-medium">
                            ₹{cat.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">{cat.title}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-medium">
                      {/* AGE */}
                      <div
                        className="group relative flex items-center gap-1.5 px-2.5 py-1 
  bg-white border border-blue-200 rounded-md text-gray-700
  hover:border-blue-400 transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                        {cat.minAge}–{cat.maxAge}
                        <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400 ml-1 cursor-pointer" />
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
    bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded shadow-lg whitespace-nowrap"
                        >
                          Eligible age range for this race
                        </div>
                      </div>

                      {/* CUT OFF */}
                      {cat.cutOffTime && (
                        <div
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 
    bg-white border border-orange-200 rounded-md text-gray-700
    hover:border-orange-400 transition"
                        >
                          <ClockIcon className="w-3.5 h-3.5 text-orange-500" />

                          {cat.cutOffTime}

                          <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400 ml-1 cursor-pointer" />

                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
      bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded shadow-lg whitespace-nowrap"
                          >
                            Maximum time allowed to finish
                          </div>
                        </div>
                      )}

                      {/* SEATS */}
                      <div
                        className="group relative flex items-center gap-1.5 px-2.5 py-1 
  bg-white border border-green-200 rounded-md text-gray-700
  hover:border-green-400 transition"
                      >
                        <TicketIcon className="w-3.5 h-3.5 text-green-500" />

                        {cat.maxSeats}

                        <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400 ml-1 cursor-pointer" />

                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
    bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded shadow-lg whitespace-nowrap"
                        >
                          Total participant slots available
                        </div>
                      </div>
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
inline-flex items-center justify-center gap-2
self-end md:self-auto
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
