"use client";

import { motion } from "framer-motion";

export default function HappyParticipants() {
  return (
    <section className="relative overflow-hidden bg-white py-20 mt-20">
      {/* subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-orange-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Animated text */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
        >
          Happy participants{" "}
          <span className="relative inline-block text-orange-500">
            = successful events
            {/* animated underline */}
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute left-0 -bottom-2 h-[3px] bg-orange-500 rounded-full"
            />
          </span>
        </motion.h2>

        {/* subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
        >
          When participants enjoy a smooth, stress-free experience, your event
          naturally becomes a success.
        </motion.p>
      </div>
    </section>
  );
}
