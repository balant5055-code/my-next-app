"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRightIcon,
  TrophyIcon,
  BoltIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
const useCases = [
  {
    title: "Marathons & Walkathons",
    desc: "Manage registrations and race timing for running events.",
    image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
    icon: TrophyIcon,
  },
  {
    title: "Cycling Events",
    desc: "Track riders and finish times with precision timing tools.",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
    icon: BoltIcon,
  },
  {
    title: "School & College Sports",
    desc: "Simplify student sports events and participant management.",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    icon: AcademicCapIcon,
  },
  {
    title: "Corporate Sports Events",
    desc: "Organize corporate runs and wellness challenges.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    icon: BuildingOfficeIcon,
  },
];

export default function UseCases() {
  const headingRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <SectionHeader
            label="Race Results"
            icon={<TrophyIcon className="h-4 w-4 text-red-500" />}
            title="Events We Power"
            subtitle="  Choose your next experience and register instantly."
          />
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-3 flex items-center text-xs font-semibold text-orange-500">
                    Learn more
                    <ArrowRightIcon className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
