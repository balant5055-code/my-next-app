"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  InformationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface EventAboutProps {
  event: {
    description?: string;
  };
}

export default function EventAbout({ event }: EventAboutProps) {
  const [expanded, setExpanded] = useState(false);

  const description = event.description || "";

  // ✅ Decode HTML safely
  const decodedHtml = useMemo(() => {
    if (!description) return "";

    return description
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }, [description]);

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative rounded-2xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-md transition"
      >
        {/* HEADER */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 shadow-sm">
            <InformationCircleIcon className="h-5 w-5 text-orange-600" />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              About This Event
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Event overview and important details
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

        {/* DESCRIPTION */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: expanded ? 1000 : 160,
          }}
          transition={{ duration: 0.4 }}
          className="
            overflow-hidden
            prose prose-sm max-w-none text-left
            text-gray-700

            prose-p:leading-relaxed
            prose-p:mb-3

            prose-headings:text-gray-900
            prose-headings:mb-2

            prose-strong:text-gray-900

            prose-ul:list-disc
            prose-ul:pl-5
            prose-ul:mb-3

            prose-li:mb-1

            prose-a:text-orange-600
            prose-a:no-underline hover:prose-a:underline
          "
        >
          <div dangerouslySetInnerHTML={{ __html: decodedHtml }} />
        </motion.div>

        {/* FADE EFFECT */}
        {!expanded && description.length > 200 && (
          <div className="pointer-events-none absolute bottom-16 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent" />
        )}

        {/* TOGGLE BUTTON */}
        {description.length > 200 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setExpanded(!expanded)}
            className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
          >
            {expanded ? "Show Less" : "Read More"}

            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.span>
          </motion.button>
        )}
      </motion.div>
    </section>
  );
}
