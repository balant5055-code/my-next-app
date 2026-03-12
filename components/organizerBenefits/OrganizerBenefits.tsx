"use client";

import { motion } from "framer-motion";

import {
  CheckCircleIcon,
  CreditCardIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrophyIcon } from "@heroicons/react/24/solid";
const benefits = [
  { title: "No Excel Sheets or Manual Follow-ups", icon: TableCellsIcon },
  { title: "Automatic Payment Tracking", icon: CreditCardIcon },
  { title: "Category-wise Participant Management", icon: Squares2X2Icon },
  {
    title: "Easy Communication with Participants",
    icon: ChatBubbleLeftRightIcon,
  },
  { title: "Download Reports Anytime", icon: ArrowDownTrayIcon },
  { title: "Less Stress. More Focus on the Event.", icon: CheckCircleIcon },
];

export default function OrganizerBenefits() {
  const headingRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        {/* Heading (UNCHANGED STYLE) */}

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
            title="Powerful Benefits for Organizers"
            subtitle="Everything you need to run events smoothly — without the stress."
          />
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
              Designed for Organizers Who Want Full Control
            </h3>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              Managing sports events shouldn’t feel overwhelming. Our platform
              simplifies registrations, payments, communication and reporting —
              helping organizers run successful events with confidence.
            </p>
          </motion.div>

          {/* BENEFITS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 transition hover:border-orange-500 hover:shadow-sm"
                >
                  {/* Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Text */}
                  <p className="text-xs sm:text-sm font-medium text-gray-800 leading-snug group-hover:text-orange-600 transition">
                    {item.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
