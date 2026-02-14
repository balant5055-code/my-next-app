"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneIcon } from "@heroicons/react/24/outline";

export default function StrongCTA() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="bg-white py-24">
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          boxShadow: hovered
            ? "0 25px 60px rgba(0,0,0,0.08)"
            : "0 0px 0px rgba(0,0,0,0)",
          y: hovered ? -6 : 0,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto px-6 py-16 rounded-3xl border border-gray-200"
      >
        {/* SOFT HOVER GLOW */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-orange-400/30"
        />

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center"
        >
          Ready to Organize Your{" "}
          <span className="text-orange-500">Next Event?</span>
        </motion.h2>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto"
        >
          Share your number and our team will contact you to help you get started.
        </motion.p>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* INPUT */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative w-full sm:w-72"
          >
            <PhoneIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone / WhatsApp Number"
              className="w-full border border-gray-300 py-3 pl-12 pr-4 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </motion.div>

          {/* BUTTON */}
          <motion.button
            whileHover={{
              scale: 1.08,
              boxShadow: "0 10px 30px rgba(249,115,22,0.45)",
            }}
            whileTap={{ scale: 0.96 }}
            className=" bg-orange-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Request Call Back
          </motion.button>
        </motion.div>

        {/* TRUST TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-5 text-xs text-gray-500 text-center"
        >
          We respect your privacy. No spam. Only event-related support.
        </motion.p>
      </motion.div>
    </section>
  );
}
