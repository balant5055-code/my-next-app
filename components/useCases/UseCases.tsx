"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  TrophyIcon,
  BoltIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import EventKitSelector from "@/components/EventKitSelector";

const useCases = [
  {
    slug: "marathon-events",
    title: "Marathons & Walkathons",
    desc: "Complete race management with registrations, bibs, chip timing, and live results.",
    image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
    icon: TrophyIcon,
  },
  {
    slug: "cycling-events",
    title: "Cycling Events",
    desc: "Accurate rider tracking, timing systems, and seamless result processing.",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
    icon: BoltIcon,
  },
  {
    slug: "registration-events",
    title: "Registration-Only Events",
    desc: "Need only registrations for conferences or meetings? We provide fast, secure event signup systems.",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754",
    icon: BuildingOfficeIcon,
  },
];

export default function UseCases() {
  const headingRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <SectionHeader
            label="Use Cases"
            icon={<TrophyIcon className="h-4 w-4 text-orange-500" />}
            title="Everything You Need to Run a Successful Event"
            subtitle="From registrations to results — we power every stage of your event."
          />
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link key={item.slug} href={`/use-cases/${item.slug}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="mt-5 text-sm font-semibold text-orange-500 flex items-center">
                      Read More
                      <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* EVENT KIT SELECTOR */}
        <div className="mt-16">
          <EventKitSelector />
        </div>
      </div>
    </section>
  );
}