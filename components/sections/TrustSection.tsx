"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Events Managed", value: "50+" },
  { label: "Runners Registered", value: "100K+" },
  { label: "Cities Covered", value: "20+" },
  { label: "Timing Accuracy", value: "99.9%" },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 text-center">
        {/* TITLE */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
          Trusted by Event Organizers
        </h3>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-3xl font-bold text-orange-500">
                {item.value}
              </p>

              <p className="text-md text-gray-600 mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
