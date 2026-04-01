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

/* ================= CLEAN HTML ================= */
function cleanHTML(html: string) {
  if (!html) return "";

  return html
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<li>\s*<\/li>/g, "")
    .replace(/(<br\s*\/?>\s*)+/g, "<br/>")
    .trim();
}

export default function EventAbout({ event }: EventAboutProps) {
  const [expanded, setExpanded] = useState(false);

  const description = event.description || "";

  /* ✅ Decode + Clean */
  const processedHtml = useMemo(() => {
    if (!description) return "";

    const decoded = description
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return cleanHTML(decoded);
  }, [description]);

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="rounded-xl bg-white p-6"
      >
        {/* HEADER (same style as ImportantInfo) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <InformationCircleIcon className="h-5 w-5 text-orange-600" />
          </div>

          <h2 className="text-lg  text-gray-900">
            About This Event
          </h2>
        </div>

        {/* CONTENT */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: expanded ? 1000 : 160,
          }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden"
        >
          <div
            className="prose max-w-none custom-prose text-gray-700"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </motion.div>

        {/* FADE EFFECT */}
        {!expanded && description.length > 200 && (
          <div className="pointer-events-none h-16 -mt-16 bg-gradient-to-t from-white to-transparent" />
        )}

        {/* TOGGLE */}
        {description.length > 200 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-2 text-sm  text-orange-600 hover:text-orange-700"
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