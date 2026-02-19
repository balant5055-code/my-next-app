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

const benefits = [
  {
    title: "No Excel Sheets or Manual Follow-ups",
    icon: TableCellsIcon,
  },
  {
    title: "Automatic Payment Tracking",
    icon: CreditCardIcon,
  },
  {
    title: "Category-wise Participant Management",
    icon: Squares2X2Icon,
  },
  {
    title: "Easy Communication with Participants",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: "Download Reports Anytime",
    icon: ArrowDownTrayIcon,
  },
  {
    title: "Less Stress. More Focus on the Event.",
    icon: CheckCircleIcon,
  },
];

export default function OrganizerBenefits() {
  return (
    <section className="bg-white ">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* ABSTRACT BACKGROUND */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
            <span>Powerful Benefits for Organizers</span>
          </h2>
          <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
            Everything you need to run events smoothly — without the stress.
          </p>
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 leading-tight">
                Designed for Organizers Who Want Control
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                Managing an event shouldn’t feel overwhelming. Our platform
                replaces chaos with clarity — so you can focus on delivering a
                great experience.
              </p>
            </motion.div>

            {/* RIGHT BENEFITS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 transition hover:border-orange-500 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Text */}
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    {item.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
