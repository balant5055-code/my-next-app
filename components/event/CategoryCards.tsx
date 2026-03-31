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
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { EventData } from "@/types/event";
import { motion } from "framer-motion";
import { Category } from "@/types/event";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
interface Props {
  event: EventData;
}

export default function CategoryCards({ event }: Props) {
  const router = useRouter();
  const routeStops = event.routeStops || [];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showArrow, setShowArrow] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

      setShowArrow(isScrollable && !isAtBottom);
    };

    checkScroll();

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
        rounded-2xl
      
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

        <div className="mb-8 sm:mb-5">
          {/* Top label row */}
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <FlagIcon className="w-4 h-4 text-orange-500" />
            </div>

            <span className="text-xs font-semibold tracking-widest text-orange-500 uppercase">
              Event
            </span>

            <span className="flex-1 h-[1px] bg-gradient-to-r from-orange-200 via-orange-100 to-transparent"></span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900">
            Race Categories
          </h2>

          {/* Description */}
          <p className="text-gray-500 text-sm sm:text-base mt-1 sm:mt-2 max-w-xl">
            Choose your distance and secure your bib.
          </p>
        </div>

        {/* CATEGORY LIST */}
        <div
          ref={scrollRef}
          className="space-y-4 overflow-y-auto pr-2 max-h-[420px]"
        >
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

          {routeStops.length > 0 && (
            <div className="mt-10">
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <FlagIcon className="w-4 h-4 text-orange-500" />
                </div>

                <span className="text-xs font-semibold tracking-widest text-orange-500 uppercase">
                  Awareness Stops
                </span>

                <span className="flex-1 h-[1px] bg-gradient-to-r from-orange-200 via-orange-100 to-transparent"></span>
              </div>

              {/* LIST */}
              <div className="space-y-5">
                {/* ROUTE LABEL */}
                {event.routeLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50 border border-orange-100">
                      <MapPinIcon className="w-4 h-4 text-orange-500" />
                    </span>

                    <span>{event.routeLabel}</span>
                  </motion.div>
                )}

                {/* DIVIDER */}
                <div className="h-px w-full bg-gray-100"></div>

                {/* STOPS */}
                <div className="space-y-4">
                  {routeStops.map((stop, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.12, duration: 0.4 }}
                      className="flex items-start gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition"
                    >
                      {/* ICON + LINE */}
                      <div className="flex flex-col items-center mt-1">
                        {/* STEP CIRCLE */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{
                            delay: index * 0.12,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className="w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] flex items-center justify-center font-semibold"
                        >
                          {index + 1}
                        </motion.div>

                        {/* CONNECTING LINE */}
                        {index !== routeStops.length - 1 && (
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: "100%" }}
                            transition={{
                              delay: index * 0.12 + 0.1,
                              duration: 0.4,
                            }}
                            className="w-[2px] bg-orange-200 mt-1"
                          />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm mb-1">
                          {stop.name}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {stop.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {showArrow && (
          <motion.div className="flex justify-center mt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border border-orange-100 shadow-sm"
            >
              <ChevronDownIcon className="w-4 h-4 text-orange-500" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
