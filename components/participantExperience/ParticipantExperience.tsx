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
import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
const experiences = [
  {
    title: "Mobile-Friendly Registration",
    description: "Register for sports events easily from any mobile device.",
    icon: DevicePhoneMobileIcon,
    accent: "from-orange-400 to-orange-600",
  },
  {
    title: "Instant Payment Confirmation",
    description: "Secure online payments confirmed immediately after checkout.",
    icon: CreditCardIcon,
    accent: "from-blue-400 to-blue-600",
  },
  {
    title: "QR Ticket on Phone",
    description:
      "Receive a digital QR race ticket instantly after registration.",
    icon: QrCodeIcon,
    accent: "from-purple-400 to-purple-600",
  },
  {
    title: "WhatsApp & Email Updates",
    description: "Get real-time event notifications and race updates.",
    icon: BellAlertIcon,
    accent: "from-green-400 to-green-600",
  },
  {
    title: "Event Results",
    description:
      "View official race results once the sports event is completed.",
    icon: TrophyIcon,
    accent: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Photos & Certificates",
    description: "Access event photos and download participation certificates.",
    icon: PhotoIcon,
    accent: "from-pink-400 to-pink-600",
  },
];

export default function ParticipantExperience() {
  const headingRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* Header */}
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
            title="A Smooth Experience for Every Participant"
            subtitle=" Designed to make participation effortless from start to finish."
          />
        </motion.div>
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-orange-400"
              >
                {/* Spotlight Hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-transparent" />
                </div>

                {/* Glow Accent */}
                <div
                  className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-10 blur-xl transition-all duration-500 group-hover:opacity-25 group-hover:scale-125`}
                />

                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition">
                      {item.title}
                    </h3>

                    {/* Divider */}
                    <div
                      className={`mt-2 mb-2 h-[2px] w-8 rounded-full bg-gradient-to-r ${item.accent} transition-all duration-500 group-hover:w-14`}
                    />

                    <p className="text-sm text-gray-600">{item.description}</p>
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
