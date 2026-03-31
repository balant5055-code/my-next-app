"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Trophy,
  Clock,
  Image,
  ShieldCheck,
  Sparkles,
  FileText,
  Bike,
  Users,
  Heart,
  Flag,
  Medal,
  Activity,
} from "lucide-react";

import { Inclusions } from "@/types/event";

interface Props {
  inclusions?: Inclusions;
}

// ✅ DYNAMIC ICON BY TITLE / KEY
const getDynamicIcon = (key?: string, title?: string) => {
  const t = `${key} ${title}`.toLowerCase();

  if (t.includes("cycling")) return Bike;
  if (t.includes("rider")) return Bike;
  if (t.includes("timing")) return Clock;
  if (t.includes("apparel") || t.includes("kit")) return Sparkles;
  if (t.includes("award")) return Trophy;
  if (t.includes("support") || t.includes("safety")) return ShieldCheck;
  if (t.includes("certificate")) return FileText;
  if (t.includes("media") || t.includes("photo")) return Image;
  if (t.includes("benefit")) return Medal;
  if (t.includes("requirement")) return Users;
  if (t.includes("awareness")) return Heart;
  if (t.includes("operation")) return Activity;
  if (t.includes("distance")) return Flag;

  return Sparkles; // default
};

// ✅ COLOR (KEEP YOUR SAME DESIGN LOGIC)
const colorMap = {
  timing: "bg-blue-100 text-blue-600",
  apparel: "bg-purple-100 text-purple-600",
  awards: "bg-yellow-100 text-yellow-700",
  support: "bg-green-100 text-green-600",
  certificates: "bg-orange-100 text-orange-600",
  media: "bg-pink-100 text-pink-600",
};

export default function EventInclusions({ inclusions }: Props) {
  if (!inclusions || !Array.isArray(inclusions)) return null;

  const sections = inclusions.filter(
    (section) => section.items && section.items.length > 0,
  );
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
  }, [sections.length]);
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

          <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900">
            Everything You Get
          </h2>

          <p className="mt-3 text-gray-700 max-w-xl">
            Your race registration includes professional timing services, race
            kits, certificates, safety support and media coverage.
          </p>
        </motion.div>

        {/* GRID */}
        <div
          ref={scrollRef}
          className={`
    grid grid-cols-1 md:grid-cols-2 gap-8
    ${sections.length > 6 ? "max-h-[500px] overflow-y-auto pr-2" : ""}
  `}
        >
          {sections.map((section, index) => {
            const { key, title, items } = section;

            const Icon = getDynamicIcon(key, title);

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
                  {/* Watermark */}
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
                      {title}
                    </h3>
                  </div>

                  {/* ITEMS */}
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 relative z-10">
                    {items.map((item: string, i: number) => (
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
      {showArrow && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-3"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border border-red-100 shadow-sm"
          >
            <ChevronDown className="w-4 h-4 text-red-500" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
