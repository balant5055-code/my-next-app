"use client";

import StrongCTA from "@/components/strongCTA/StrongCTA";
import Contact from "@/components/contact/Contact";
import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <section className="relative py-16 scroll-mt-24" id="contact">
      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_70%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Organize Your{" "}
            <span className="text-orange-500">Next Event?</span>
          </h2>

          <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
            Whether it's a marathon, cycling race, or corporate run, Raceline
            helps you manage registrations and timing seamlessly.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <StrongCTA />
        </motion.div>
        {/* Divider */}
        <div className="flex items-center my-16">
          <div className="flex-1 h-px bg-gray-200"></div>

          <span className="px-6 text-xs text-gray-400 uppercase tracking-wider">
            OR SEND US A MESSAGE
          </span>

          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* CONTACT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <Contact />
        </motion.div>
      </div>
    </section>
  );
}
