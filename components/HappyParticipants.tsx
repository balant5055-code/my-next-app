"use client";

import { motion } from "framer-motion";

export default function HappyParticipants() {
  return (
    <div className="relative overflow-hidden bg-white py-14 md:py-20 mt-16 md:mt-20">
      {/* background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-orange-50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
        >
          Happy participants{" "}
          <span className="relative inline-block text-orange-500">
            = successful events
            {/* underline */}
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute left-0 -bottom-1 h-[2px] md:h-[3px] bg-orange-500 rounded-full"
            />
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          When participants enjoy a smooth experience — from registration and
          payments to race-day check-in and results — your sports event
          naturally becomes a success.
        </motion.p>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500 max-w-lg mx-auto"
        >
          Built for running races, cycling events, school sports and corporate
          fitness programs.
        </motion.p>
      </div>
    </div>
  );
}
