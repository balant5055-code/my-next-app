"use client";

import StrongCTA from "@/components/strongCTA/StrongCTA";
import Contact from "@/components/contact/Contact";
import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative py-16 scroll-mt-24"
    >
      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_70%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-5 text-center"
          >
            <h2
              id="contact-heading"
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Ready to Organize Your{" "}
              <span className="text-orange-500">Next Sports Event?</span>
            </h2>

            <p className="text-[15px] mt-4 text-gray-600 leading-relaxed max-w-md mx-auto">
              Organize marathons, cycling races, triathlons or sports events
              with Raceline. Manage registrations, race timing and participants
              in one platform.
            </p>
          </motion.div>
        </header>

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

        {/* CONTACT FORM */}
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
