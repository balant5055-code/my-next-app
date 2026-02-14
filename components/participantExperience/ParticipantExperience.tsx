"use client";

import { motion } from "framer-motion";
import {
  DevicePhoneMobileIcon,
  CreditCardIcon,
  QrCodeIcon,
  BellAlertIcon,
  TrophyIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const experiences = [
  {
    title: "Mobile-Friendly Registration",
    description: "Register easily on any device, anytime.",
    icon: DevicePhoneMobileIcon,
    accent: "from-orange-400 to-orange-600",
  },
  {
    title: "Instant Payment Confirmation",
    description: "Payments confirmed immediately after checkout.",
    icon: CreditCardIcon,
    accent: "from-blue-400 to-blue-600",
  },
  {
    title: "QR Ticket on Phone",
    description: "Digital ticket available instantly after registration.",
    icon: QrCodeIcon,
    accent: "from-purple-400 to-purple-600",
  },
  {
    title: "WhatsApp & Email Updates",
    description: "Get real-time event notifications and updates.",
    icon: BellAlertIcon,
    accent: "from-green-400 to-green-600",
  },
  {
    title: "Event Results",
    description: "View official results once the event is completed.",
    icon: TrophyIcon,
    accent: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Photos & Certificates",
    description: "Access event photos and download certificates easily.",
    icon: PhotoIcon,
    accent: "from-pink-400 to-pink-600",
  },
];

export default function ParticipantExperience() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
            <span> A Smooth Experience for Every Participant</span>
          </h2>
          <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
            Designed to make participation effortless from start to finish.
          </p>
        </motion.div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {experiences.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="group relative rounded-2xl border border-gray-200 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              {/* Soft Accent Shape (UNCHANGED) */}
              <div
                className={`absolute -top-10 -right-10 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-15`}
              />

              {/* Icon (CENTERED — UNCHANGED) */}
              <div className="flex justify-center">
                <div
                  className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent}`}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Accent Divider (UNCHANGED) */}
              <div
                className={`mx-auto mb-5 h-[3px] w-10 rounded-full bg-gradient-to-r ${item.accent}`}
              />

              {/* Text (UNCHANGED) */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
