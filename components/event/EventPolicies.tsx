"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface Props {
  terms?: string;
  refundPolicy?: string;
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

export default function EventPolicies({ terms, refundPolicy }: Props) {
  const [expandTerms, setExpandTerms] = useState(false);
  const [expandRefund, setExpandRefund] = useState(false);

  if (!terms && !refundPolicy) return null;

  const cleanedTerms = useMemo(
    () => cleanHTML(terms || ""),
    [terms]
  );

  const cleanedRefund = useMemo(
    () => cleanHTML(refundPolicy || ""),
    [refundPolicy]
  );

  const showTermsToggle = cleanedTerms.length > 200;
  const showRefundToggle = cleanedRefund.length > 200;

  return (
    <section>
      <div className="space-y-6">

        {/* ================= TERMS ================= */}
        {terms && (
          <div className="rounded-xl bg-white p-6 relative">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <DocumentTextIcon className="h-5 w-5 text-orange-600" />
              </div>

              <h2 className="text-lg  text-gray-900">
                Terms & Conditions
              </h2>
            </div>

            {/* Content */}
            <motion.div
              initial={false}
              animate={{
                maxHeight: expandTerms ? 1000 : 160,
              }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div
                className="prose max-w-none custom-prose text-gray-700"
                dangerouslySetInnerHTML={{ __html: cleanedTerms }}
              />
            </motion.div>

            {/* Fade */}
            {!expandTerms && showTermsToggle && (
              <div className="pointer-events-none h-16 -mt-16 bg-gradient-to-t from-white to-transparent" />
            )}

            {/* Toggle */}
            {showTermsToggle && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setExpandTerms(!expandTerms)}
                className="mt-4 flex items-center gap-2 text-sm  text-orange-600 hover:text-orange-700"
              >
                {expandTerms ? "Show Less" : "Read More"}

                <motion.span
                  animate={{ rotate: expandTerms ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.span>
              </motion.button>
            )}
          </div>
        )}

        {/* ================= REFUND ================= */}
        {refundPolicy && (
          <div className="rounded-xl bg-white p-6 relative">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <DocumentTextIcon className="h-5 w-5 text-orange-600" />
              </div>

              <h2 className="text-lg  text-gray-900">
                Refund Policy
              </h2>
            </div>

            {/* Content */}
            <motion.div
              initial={false}
              animate={{
                maxHeight: expandRefund ? 1000 : 160,
              }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div
                className="prose max-w-none custom-prose text-gray-700"
                dangerouslySetInnerHTML={{ __html: cleanedRefund }}
              />
            </motion.div>

            {/* Fade */}
            {!expandRefund && showRefundToggle && (
              <div className="pointer-events-none h-16 -mt-16 bg-gradient-to-t from-white to-transparent" />
            )}

            {/* Toggle */}
            {showRefundToggle && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setExpandRefund(!expandRefund)}
                className="mt-4 flex items-center gap-2 text-sm  text-orange-600 hover:text-orange-700"
              >
                {expandRefund ? "Show Less" : "Read More"}

                <motion.span
                  animate={{ rotate: expandRefund ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.span>
              </motion.button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}