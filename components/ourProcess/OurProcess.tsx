"use client";

import { motion } from "framer-motion";
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

export default function OurProcess() {
  return (
    <section className="bg-white overflow-hidden mt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
            <span>OUR PROCESS</span>
          </h2>
          <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
            Choose your next experience and register instantly.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-14">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                {/* Step Number */}
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold ${step.text} ${step.border} border`}
                >
                  STEP {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${step.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <step.icon className="h-7 w-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-800 leading-snug">
                  {step.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Read More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <a
            href="/our-process"
            className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-12 py-3 text-sm font-semibold uppercase text-orange-500 transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-lg"
          >
            Read More <ArrowRightIcon className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
