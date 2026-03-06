"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface EventAboutProps {
  event: {
    description?: string;
  };
}

export default function EventAbout({ event }: EventAboutProps) {
  const [expanded, setExpanded] = useState(false);

  const description = event.description || "";

  // Decode escaped HTML
  const decodedHtml = useMemo(() => {
    if (!description) return "";
    const textarea = document.createElement("textarea");
    textarea.innerHTML = description;
    return textarea.value;
  }, [description]);

  return (
    <section>
      <div
        className="
        relative
        rounded-2xl
        border border-gray-200
        bg-white
        p-6 md:p-7
        shadow-sm
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
            <InformationCircleIcon className="h-5 w-5 text-orange-600" />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              About This Event
            </h2>
            <p className="text-xs text-gray-500">
              Event overview and important details
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gray-100 mb-4" />

        {/* Description */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: expanded ? 900 : 140,
          }}
          transition={{ duration: 0.35 }}
          className="
          overflow-hidden
          prose
          prose-sm
          max-w-none
          text-gray-700
          prose-headings:text-gray-900
          prose-strong:text-gray-900
          prose-a:text-orange-600
          prose-ul:list-disc
          "
        >
          <div dangerouslySetInnerHTML={{ __html: decodedHtml }} />
        </motion.div>

        {/* Fade */}
        {!expanded && description.length > 200 && (
          <div className="pointer-events-none absolute bottom-14 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent" />
        )}

        {/* Toggle */}
        {description.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </section>
  );
}
