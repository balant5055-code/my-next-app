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
    description: "Set up your event, categories, fees, and custom forms.",
    icon: CalendarDaysIcon,
    color: "from-orange-400 to-orange-600",
  },
  {
    step: "02",
    title: "Open Registrations",
    description: "Participants register and pay online in minutes.",
    icon: CreditCardIcon,
    color: "from-blue-400 to-blue-600",
  },
  {
    step: "03",
    title: "Manage with Ease",
    description: "Track registrations, communicate instantly, export data.",
    icon: ChartBarIcon,
    color: "from-green-400 to-green-600",
  },
  {
    step: "04",
    title: "Celebrate & Share",
    description: "Publish photos, results, and certificates post-event.",
    icon: SparklesIcon,
    color: "from-purple-400 to-purple-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white ">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
            <span>How It Works — Simple for Everyone</span>
          </h2>
          <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
            A simple, guided flow from event creation to celebration.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute left-0 right-0 top-10 h-[2px] bg-gray-200 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow-lg`}
                >
                  <item.icon className="h-9 w-9 text-white" />
                </div>

                {/* Step Number */}
                <span className="mt-4 text-sm font-bold text-gray-400">
                  STEP {item.step}
                </span>

                {/* Title */}
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600 max-w-xs">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
