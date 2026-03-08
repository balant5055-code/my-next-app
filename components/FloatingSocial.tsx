"use client";

import { motion } from "framer-motion";
import {
  CameraIcon,
  GlobeAltIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";

const socials = [
  {
    name: "Instagram",
    icon: CameraIcon,
    color: "bg-pink-500",
    href: "https://instagram.com",
  },
  {
    name: "Facebook",
    icon: GlobeAltIcon,
    color: "bg-blue-600",
    href: "https://facebook.com",
  },
  {
    name: "YouTube",
    icon: PlayCircleIcon,
    color: "bg-red-600",
    href: "https://youtube.com",
  },
];

export default function FloatingSocial() {
  return (
    <div className="fixed right-4 bottom-28 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50 flex flex-col gap-3">
      {socials.map((social) => {
        const Icon = social.icon;

        return (
          <motion.a
            key={social.name}
            href={social.href}
            target="_blank"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center"
          >
            {/* Label */}
            <span className="absolute right-14 opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-medium bg-white border border-gray-200 px-3 py-1 rounded-full shadow whitespace-nowrap">
              {social.name}
            </span>

            {/* Icon */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ${social.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}
