"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  MapPinIcon,
  UserIcon,
  TicketIcon,
  FireIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
  eventSlug: string;
}

export default function CategorySelector({
  categories,
  selectedCat,
  isProcessing,
  handleCategorySelect,
  eventSlug,
}: Props) {
  const router = useRouter();
  const safeCategories: Category[] = Array.isArray(categories)
    ? categories
    : Object.values(categories || {});

  const sortedCategories = [...safeCategories].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1;
    if (a.status !== "closed" && b.status === "closed") return -1;
    return 0;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-2 rounded-lg bg-orange-50">
          <TrophyIcon className="w-5 h-5 text-orange-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">Race Category</h2>

          <p className="mt-1 text-xs text-gray-500">
            Select your preferred race distance
          </p>
        </div>
      </motion.div>

      {/* CATEGORY LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sortedCategories.map((c, index) => {
          const isSelected = selectedCat === c.title;
          const isClosed = c.status === "closed";
          const seatsLeft = c.maxSeats - (c.bookedSeats || 0);

          return (
            <motion.div
              key={c.id || `${c.title}-${index}`}
              whileHover={!isClosed ? { y: -4, scale: 1.02 } : undefined}
              whileTap={!isClosed ? { scale: 0.97 } : undefined}
              transition={{ duration: 0.18 }}
              onClick={() => {
                if (!isClosed && !isProcessing) {
                  handleCategorySelect(c.title);
                }
              }}
              className={`
            relative rounded-xl border p-4 cursor-pointer transition-all
            ${
              isClosed
                ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                : isSelected
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
            }
            `}
            >
              {/* SELECTED INDICATOR */}
              {isSelected && (
                <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-orange-500" />
              )}

              {/* POPULAR BADGE */}
              {c.popular && !isClosed && (
                <div className="absolute -top-2 left-3 text-[10px] px-2 py-[2px] rounded-full bg-orange-500 text-white flex items-center gap-1 shadow">
                  <FireIcon className="w-3 h-3" />
                  Popular
                </div>
              )}

              {/* DISTANCE */}
              <div className="flex items-center gap-3">
                {/* ICON BADGE */}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50">
                  <MapPinIcon className="w-4 h-4 text-orange-500" />
                </div>

                {/* DISTANCE */}
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-900 leading-none">
                    {c.distance}
                  </span>

                  <span className="text-xs font-semibold text-gray-500 tracking-wide mb-[2px]">
                    KM
                  </span>
                </div>
              </div>

              {/* TITLE */}
              <div className="text-xs text-gray-500 mt-1">{c.title}</div>

              {/* PRICE */}
              <div className="mt-3 text-sm font-semibold text-orange-600">
                {isClosed ? "Closed" : `₹${c.price}`}
              </div>

              {/* SEATS */}
              {!isClosed && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <TicketIcon className="w-3 h-3" />
                      {c.bookedSeats || 0}/{c.maxSeats}
                    </span>

                    <span>{c.maxSeats - (c.bookedSeats || 0)} left</span>
                  </div>

                  {/* PROGRESS BAR */}

                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((c.bookedSeats || 0) / c.maxSeats) * 100}%`,
                      }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 w-full flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/events/${eventSlug}`)}
          className="cursor-pointer w-full md:w-auto md:px-8 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Event
        </motion.button>
      </div>
    </div>
  );
}
