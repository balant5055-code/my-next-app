"use client";

import { motion } from "framer-motion";
import {
  TrophyIcon,
  ClockIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import { Inclusions } from "@/types/event";

interface Props {
  inclusions?: Inclusions;
}

const iconMap = {
  timing: ClockIcon,
  apparel: SparklesIcon,
  awards: TrophyIcon,
  support: ShieldCheckIcon,
  certificates: DocumentTextIcon,
  media: PhotoIcon,
};

const colorMap = {
  timing: "bg-blue-100 text-blue-600",
  apparel: "bg-purple-100 text-purple-600",
  awards: "bg-yellow-100 text-yellow-700",
  support: "bg-green-100 text-green-600",
  certificates: "bg-orange-100 text-orange-600",
  media: "bg-pink-100 text-pink-600",
};

export default function EventInclusions({ inclusions }: Props) {
  if (!inclusions) return null;

  const sections = Object.entries(inclusions).filter(
    ([_, items]) => items && items.length > 0,
  );

  return (
    <section className="py-10 ">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-[2px] bg-red-500"></span>

            <span className="uppercase text-xs font-semibold tracking-widest text-red-500">
              Runner Benefits
            </span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Everything You Get
          </h2>

          <p className="mt-3 text-gray-700 max-w-xl">
            Your race registration includes professional timing services, race
            kits, certificates, safety support and media coverage.
          </p>
        </motion.div>

        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {sections.map(([key, items], index) => {
            const Icon = iconMap[key as keyof typeof iconMap] || SparklesIcon;

            const color =
              colorMap[key as keyof typeof colorMap] ||
              "bg-gray-100 text-gray-600";

            const watermark = String(index + 1).padStart(2, "0");

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative group bg-gradient-to-br from-red-700 via-red-800 to-red-900 rounded-3xl pt-[15px]"
              >
                <div
                  className="
                  relative
                  bg-white
                  border border-gray-200
                  rounded-2xl
                  p-7
                  shadow-sm
                  transition
                  group-hover:-translate-y-1
                  group-hover:shadow-lg
                  h-full
                  flex flex-col 
                  "
                >
                  {/* Watermark Number */}

                  <div
                    className="
                  absolute
                  top-2
                  right-6
                  text-[90px]
                  font-bold
                  text-gray-200
                  leading-none
                  select-none
                  pointer-events-none
                  "
                  >
                    {watermark}
                  </div>

                  {/* TITLE */}

                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 capitalize">
                      {key}
                    </h3>
                  </div>

                  {/* ITEMS */}

                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 relative z-10">
                    {(items as string[]).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <CheckIcon className="w-4 h-4 text-green-500" />

                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
