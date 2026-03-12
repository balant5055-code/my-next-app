"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  PlayCircleIcon,
  DocumentChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Requirement Discussion",
    icon: ChatBubbleLeftRightIcon,
    color: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-500",
  },
  {
    title: "Event Page Creation",
    icon: GlobeAltIcon,
    color: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500",
  },
  {
    title: "Online Registration",
    icon: ClipboardDocumentListIcon,
    color: "bg-purple-500",
    text: "text-purple-500",
    border: "border-purple-500",
  },
  {
    title: "Event Execution",
    icon: PlayCircleIcon,
    color: "bg-green-500",
    text: "text-green-500",
    border: "border-green-500",
  },
  {
    title: "Reports & Data",
    icon: DocumentChartBarIcon,
    color: "bg-pink-500",
    text: "text-pink-500",
    border: "border-pink-500",
  },
];
import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrophyIcon } from "@heroicons/react/24/solid";
export default function OurProcess() {
  const headingRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="bg-white overflow-hidden mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}

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
            title="Our Event Registration & Race Timing Process"
            subtitle="A simple workflow for organizers to launch and manage sports events
            with our platform."
          />
        </motion.div>
        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full rounded-xl border border-gray-200 bg-white p-5 md:p-6 text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  {/* Step Badge */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-[3px] text-[11px] font-bold ${step.text} ${step.border} border`}
                  >
                    STEP {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`mx-auto mb-4 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full ${step.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs md:text-sm font-semibold text-gray-800 leading-snug">
                    {step.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Read More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/our-process"
            className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-8 md:px-12 py-2.5 md:py-3 text-xs md:text-sm font-semibold uppercase text-orange-500 transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-lg"
          >
            Read More <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
