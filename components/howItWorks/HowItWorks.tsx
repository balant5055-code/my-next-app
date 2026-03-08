"use client";

import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

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
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* Heading (UNCHANGED STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center border-title"
        >
          <h2 className="text-3xl md:text-3xl font-semibold text-gray-900 main-title">
            <span>How It Works — Simple for Everyone</span>
          </h2>

          <p className="mt-3 text-2xl md:text-3xl lg:text-3xl text-gray-600 max-w-2xl mx-auto tan">
            A simple workflow to launch and manage sports events effortlessly.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group h-full flex flex-col items-center text-center rounded-xl border border-gray-200 p-5 hover:border-orange-400 hover:shadow-md transition"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 group-hover:bg-orange-100 transition mb-3">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>

                {/* Step */}
                <span className="text-xs font-semibold text-gray-400 mb-1">
                  STEP {item.step}
                </span>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mt-2 leading-relaxed flex-grow">
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
