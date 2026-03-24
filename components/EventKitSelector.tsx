"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckIcon,
  TrophyIcon,
  DocumentTextIcon,
  TicketIcon,
  IdentificationIcon,
  GiftIcon,
} from "@heroicons/react/24/solid";

const kitItems = [
  { id: "medal", label: "Medals", icon: TrophyIcon },
  { id: "shield", label: "Shields", icon: TrophyIcon },
  { id: "trophy", label: "Trophies", icon: TrophyIcon },
  { id: "certificate", label: "Certificates", icon: DocumentTextIcon },
  { id: "bib", label: "Bib Printing", icon: TicketIcon },
  { id: "tshirt", label: "Event T-Shirts", icon: IdentificationIcon },
  { id: "goodie", label: "Goodie Bags", icon: GiftIcon },
  { id: "lanyard", label: "Lanyards / ID Cards", icon: IdentificationIcon },
];

export default function EventKitSelector() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleWhatsApp = () => {
    if (selected.length === 0) return;

    const itemsText = selected
      .map((id) => {
        const item = kitItems.find((i) => i.id === id);
        return `- ${item?.label}`;
      })
      .join("%0A");

    const message = `Hi, I need event services.%0A%0ASelected items:%0A${itemsText}%0A%0APlease share pricing.`;

    const phoneNumber = "91XXXXXXXXXX"; // replace
    const url = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(url, "_blank");
  };

  return (
    <section className="mt-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Build Your Event Kit
          </h3>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            Select the items you need — we’ll handle everything seamlessly.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {kitItems.map((item) => {
            const isSelected = selected.includes(item.id);
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleItem(item.id)}
                className={`
                  relative cursor-pointer rounded-2xl p-6
                  transition-all duration-300
                  ${
                    isSelected
                      ? "bg-orange-50 shadow-lg ring-1 ring-orange-100"
                      : "bg-white shadow-sm hover:shadow-md"
                  }
                `}
              >
                {/* CHECK */}
                <div
                  className={`
                    absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center transition
                    ${
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-transparent"
                    }
                  `}
                >
                  <CheckIcon className="h-4 w-4" />
                </div>

                {/* ICON */}
                <div className="mb-4 flex justify-center">
                  <div
                    className={`
                      h-12 w-12 flex items-center justify-center rounded-xl
                      ${
                        isSelected
                          ? "bg-orange-100"
                          : "bg-gray-100"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-6 w-6
                        ${
                          isSelected
                            ? "text-orange-600"
                            : "text-gray-500"
                        }
                      `}
                    />
                  </div>
                </div>

                {/* TEXT */}
                <p className="text-sm font-medium text-gray-800 text-center">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-gray-500 mb-4">
            {selected.length > 0
              ? `${selected.length} item${selected.length > 1 ? "s" : ""} selected`
              : "Select items to continue"}
          </p>

          <button
            onClick={handleWhatsApp}
            disabled={selected.length === 0}
            className={`
              px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300
              ${
                selected.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg"
              }
            `}
          >
            Get Quote on WhatsApp
          </button>
        </div>

      </div>
    </section>
  );
}