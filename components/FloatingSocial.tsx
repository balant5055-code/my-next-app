"use client";

import { motion } from "framer-motion";
import {
  CameraIcon,
  GlobeAltIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

const socials = [
  {
    name: "Instagram",
    icon: CameraIcon,
    href: "https://instagram.com",
    hover: "group-hover:text-pink-500",
  },
  {
    name: "Facebook",
    icon: GlobeAltIcon,
    href: "https://facebook.com",
    hover: "group-hover:text-blue-600",
  },
  {
    name: "YouTube",
    icon: PlayCircleIcon,
    href: "https://youtube.com",
    hover: "group-hover:text-red-600",
  },
];

export default function FloatingSocial() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed right-5 bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50"
    >
      {/* Glass container */}
      <div className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-lg p-2">
        {socials.map((social, index) => {
          const Icon = social.icon;

          return (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 transition-all hover:bg-gray-100"
            >
              <Icon className={`h-5 w-5 transition-colors ${social.hover}`} />

              {/* Tooltip */}
              <span className="absolute right-12 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-xs font-medium bg-gray-900 text-white px-2 py-1 rounded-md whitespace-nowrap">
                {social.name}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
