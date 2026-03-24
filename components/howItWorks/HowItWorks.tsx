"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrophyIcon } from "@heroicons/react/24/solid";

const steps = [
  {
    step: "01",
    title: "Create Your Event",
    description: "Set up categories, entry fees and registration forms.",
    icon: CalendarDaysIcon,
  },
  {
    step: "02",
    title: "Open Registrations",
    description: "Participants register and pay securely online.",
    icon: CreditCardIcon,
  },
  {
    step: "03",
    title: "Manage with Ease",
    description: "Track registrations and communicate with participants.",
    icon: ChartBarIcon,
  },
  {
    step: "04",
    title: "Celebrate & Share",
    description: "Publish results, photos and certificates.",
    icon: SparklesIcon,
  },
];

export default function HowItWorks() {
  const headingRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-10">
        {" "}
        {/* reduced */}
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <SectionHeader
            label="Process"
            icon={<TrophyIcon className="h-4 w-4 text-orange-500" />}
            title="How It Works — Simple for Everyone"
            subtitle="A simple workflow to launch and manage sports events effortlessly."
          />
        </motion.div>
        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {" "}
          {/* reduced */}
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group h-full flex flex-col items-center text-center rounded-xl border border-gray-200 p-3 md:p-4 hover:border-orange-400 hover:shadow-sm transition"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 group-hover:bg-orange-100 transition mb-2">
                  <Icon className="h-4 w-4 text-orange-500" />
                </div>

                {/* Step */}
                <span className="text-xs font-semibold text-gray-400 mb-1">
                  STEP {item.step}
                </span>

                {/* Title */}
                <h3 className="text-md font-semibold text-gray-900 group-hover:text-orange-500 transition">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-md text-gray-600 mt-1.5 leading-relaxed flex-grow">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
