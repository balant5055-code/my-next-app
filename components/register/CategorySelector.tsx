"use client";

import { motion } from "framer-motion";
import {
  TrophyIcon,
  MapPinIcon,
  UserIcon,
  TicketIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id?: string;
  title: string;
  price: number;
  minAge: number;
  maxAge: number;
  distance: string;
  maxSeats: number;
  bookedSeats?: number;
  popular?: boolean;
  status?: "open" | "closed";
}

interface Props {
  categories: Category[] | Record<string, Category>;
  selectedCat: string | null;
  handleCategorySelect: (title: string) => void;
  cat?: Category | null;
  isProcessing?: boolean;
}

export default function CategorySelector({
  categories,
  selectedCat,
  isProcessing,
  handleCategorySelect,
}: Props) {
  /* SAFELY NORMALIZE CATEGORIES */
  const safeCategories: Category[] = Array.isArray(categories)
    ? categories
    : Object.values(categories || {});

  /* SORT OPEN FIRST */
  const sortedCategories = [...safeCategories].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1;
    if (a.status !== "closed" && b.status === "closed") return -1;
    return 0;
  });

  return (
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl shadow-md">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3 mb-5"
      >
        <div className="p-2 rounded-lg bg-orange-50">
          <TrophyIcon className="w-5 h-5 text-orange-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">Race Category</h2>
          <p className="text-xs text-gray-500">
            Select your preferred race distance
          </p>
        </div>
      </motion.div>

      {/* CATEGORY LIST */}
      <div className="flex flex-col gap-2">
        {sortedCategories.map((c, index) => {
          const isSelected = selectedCat === c.title;
          const isClosed = c.status === "closed";

          return (
            <motion.div
              key={c.id || `${c.title}-${c.distance}-${index}`}
              whileTap={!isClosed ? { scale: 0.98 } : undefined}
              whileHover={!isClosed ? { scale: 1.01 } : undefined}
              transition={{ duration: 0.15 }}
              onClick={() => {
                if (!isClosed && !isProcessing) {
                  handleCategorySelect(c.title);
                }
              }}
              className={`relative rounded-lg px-4 py-3 transition-all
              ${
                isClosed
                  ? "bg-gray-100 opacity-60 cursor-not-allowed"
                  : isSelected
                    ? "bg-green-50 shadow-sm cursor-pointer"
                    : "bg-gradient-to-b from-white to-gray-50 hover:shadow-sm cursor-pointer"
              }`}
            >
              {/* SELECTION INDICATOR */}
              {isSelected && !isClosed && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute left-0 top-0 h-full w-1 bg-green-600 rounded-l-lg"
                />
              )}

              {/* POPULAR BADGE */}
              {c.popular && !isClosed && (
                <div className="absolute -top-2 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1 shadow">
                  <FireIcon className="w-3 h-3" />
                  Popular
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-6 items-center gap-2 text-sm">
                {/* TITLE */}
                <div className="flex items-center gap-2 col-span-2 md:col-span-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center
                    ${
                      isClosed
                        ? "bg-gray-400"
                        : isSelected
                          ? "bg-green-600"
                          : "bg-gray-300"
                    }`}
                  >
                    {isSelected && !isClosed && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  <span className="font-semibold text-gray-800">{c.title}</span>
                </div>

                {/* DISTANCE */}
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPinIcon className="w-4 h-4" />
                  {c.distance}
                </div>

                {/* AGE */}
                <div className="flex items-center gap-1 text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  {c.minAge}-{c.maxAge}
                </div>

                {/* SEATS */}
                <div className="flex items-center gap-1 text-gray-500">
                  <TicketIcon className="w-4 h-4" />
                  {c.bookedSeats || 0}/{c.maxSeats}
                </div>

                {/* PRICE */}
                <div className="text-right font-semibold">
                  {isClosed ? (
                    <span className="text-red-600 text-sm">Closed</span>
                  ) : (
                    <span className="text-orange-600">₹{c.price}</span>
                  )}
                </div>
              </div>

              {/* CLOSED MESSAGE */}
              {isClosed && (
                <div className="mt-2 text-xs font-semibold text-red-600">
                  Registration closed
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
