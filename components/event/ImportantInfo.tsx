"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ImportantInfoProps {
  event: {
    medicalNote?: string;
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

export default function ImportantInfo({ event }: ImportantInfoProps) {
  const [expanded, setExpanded] = useState(false);

  if (!event.medicalNote) return null;

  const cleanedHtml = useMemo(() => {
    return cleanHTML(event.medicalNote || "");
  }, [event.medicalNote]);

  const shouldShowToggle = cleanedHtml.length > 200;

  return (
    <section>
      <div className="rounded-xl  bg-white p-6 relative">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
          </div>

          <h2 className="text-lg  text-gray-900">
            Important Information
          </h2>
        </div>

        {/* Content */}
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
            dangerouslySetInnerHTML={{ __html: cleanedHtml }}
          />
        </motion.div>

        {/* Fade effect */}
        {!expanded && shouldShowToggle && (
          <div className="pointer-events-none h-16 -mt-16 bg-gradient-to-t from-white to-transparent" />
        )}

        {/* Toggle button */}
        {shouldShowToggle && (
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
      </div>
    </section>
  );
}