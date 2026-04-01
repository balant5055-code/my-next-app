"use client";

import { motion } from "framer-motion";
import {
  UserGroupIcon,
  PhoneIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

import { EventData } from "@/types/event";

interface Props {
  event: EventData;
}

export default function EventStats({ event }: Props) {
  const getValue = (val: any) => {
    if (!val || val === "" || val === "TBA") return "NA";
    return val;
  };

  const stats = [
    {
      label: "Organizer",
      value: getValue(event.organizer?.name),
      icon: UserGroupIcon,
    },
    {
      label: "Contact",
      value: getValue(event.organizer?.phone),
      icon: PhoneIcon,
    },
  ];

  const socials = [
    {
      label: "Facebook",
      value: event.socialLinks?.facebook,
      action: "Open",
    },
    {
      label: "Instagram",
      value: event.socialLinks?.instagram,
      action: "View",
    },
    {
      label: "YouTube",
      value: event.socialLinks?.youtube,
      action: "Watch",
    },
    {
      label: "WhatsApp",
      value: event.socialLinks?.whatsapp,
      action: "Chat",
    },
  ];

  return (
    <section className="py-6 bg-white border-y border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ================= SOCIAL ================= */}
        <div className="flex items-start gap-3">

          {/* ICON */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 mt-1">
            <GlobeAltIcon className="h-5 w-5 text-orange-500" />
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-3">
              Social
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socials.map((item, i) => {
                const value =
                  item.value && item.value.trim() !== ""
                    ? item.value
                    : null;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="
                      flex items-center justify-between
                      px-3 py-2 rounded-lg
                      border border-gray-200
                      hover:border-orange-300
                      hover:bg-orange-50/40
                      transition
                    "
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>

                    {/* RIGHT */}
                    {value ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-xs font-semibold
                          text-orange-500
                          px-2 py-1 rounded
                          bg-orange-50
                          hover:bg-orange-100
                          transition
                        "
                      >
                        {item.action}
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">
                        NA
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}