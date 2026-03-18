"use client";

import { motion } from "framer-motion";

export default function HappyParticipants() {
  return (
    <section className="relative py-12 md:py-16 mt-10 bg-gradient-to-b from-orange-50 to-white">

      
      {/* subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M40 0H0V40" fill="none" stroke="black" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug"
        >
          Happy participants{" "}
          <span className="relative inline-block text-orange-500">
            = successful events
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute left-0 -bottom-1 h-[2px] bg-orange-500 rounded-full"
            />
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed max-w-xl mx-auto"
        >
          When participants enjoy a smooth experience — from registration and
          payments to race-day check-in and results — your sports event
          naturally becomes a success.
        </motion.p>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 text-xs text-gray-500"
        >
          Built for running races, cycling events, school sports and corporate
          fitness programs.
        </motion.p>

      </div>

      {/* Smooth divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-[70px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C300,90 900,0 1440,40 L1440,100 L0,100 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>

    </section>
  );
}