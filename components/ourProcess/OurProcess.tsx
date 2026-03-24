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

import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrophyIcon } from "@heroicons/react/24/solid";

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

export default function OurProcess() {
  const headingRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="bg-white overflow-hidden mt-10">
      <div className="max-w-7xl mx-auto px-4">
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
            title="Our Event Registration & Race Timing Process"
            subtitle="A simple workflow for organizers to launch and manage sports events with our platform."
          />
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full rounded-xl border border-gray-200 bg-white p-3 md:p-4 text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  {/* Step Badge */}
                  <div
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-[2px] text-[10px] font-semibold ${step.text} ${step.border} border`}
                  >
                    STEP {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`mx-auto mb-2 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full ${step.color} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-[11px] md:text-md font-semibold text-gray-800 leading-snug">
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
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            href="/our-process"
            className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-5 py-2 text-md font-semibold text-orange-500 transition-all duration-300 hover:bg-orange-500 hover:text-white"
          >
            Read More <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
