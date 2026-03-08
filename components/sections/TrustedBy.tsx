"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
  {
    name: "Running Club",
    logo: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  },
  {
    name: "Cycling Event",
    logo: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  },
  {
    name: "Marathon Series",
    logo: "https://cdn-icons-png.flaticon.com/512/3097/3097144.png",
  },
  {
    name: "Corporate Fitness",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    name: "School Sports",
    logo: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  },
  {
    name: "Triathlon League",
    logo: "https://cdn-icons-png.flaticon.com/512/2972/2972268.png",
  },
];

export default function TrustedBy() {
  return (
    <div className="bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading (YOUR STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-3xl font-semibold text-gray-900 main-title">
            <span>Trusted by Event Organizers</span>
          </h2>

          <p className="mt-3 text-2xl md:text-3xl lg:text-3xl text-gray-600 max-w-2xl mx-auto tan">
            Running clubs, cycling communities, schools and corporate fitness
            programs trust Raceline to manage their sports events.
          </p>
        </motion.div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group flex items-center justify-center"
            >
              <div
                className="
                flex items-center justify-center
                w-full h-24
                rounded-xl
                border border-gray-200
                bg-white
                shadow-sm
                transition
                hover:shadow-lg
                hover:border-orange-400
                "
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={50}
                  height={50}
                  className="
                  opacity-60
                  grayscale
                  group-hover:opacity-100
                  group-hover:grayscale-0
                  transition duration-300
                  "
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
