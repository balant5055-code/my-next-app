"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrophyIcon } from "@heroicons/react/24/solid";

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
  const headingRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="bg-white"> {/* reduced */}
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <SectionHeader
            label="Trusted"
            icon={<TrophyIcon className="h-4 w-4 text-orange-500" />}
            title="Trusted by Event Organizers"
            subtitle="Running clubs, cycling communities, schools and corporate fitness programs trust Raceline to manage their sports events."
          />
        </motion.div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"> {/* reduced */}
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group flex items-center justify-center"
            >
              <div
                className="
                flex items-center justify-center
                w-full h-20
                rounded-lg
                border border-gray-200
                bg-white
                shadow-sm
                transition
                hover:shadow-md
                hover:border-orange-400
                "
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={44}
                  height={44}
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