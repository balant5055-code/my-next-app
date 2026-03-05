"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
export default function EventMeta() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      const snap = await getDoc(doc(db, "events", eventId));
      if (snap.exists()) {
        setEvent(snap.data());
      }
    }

    loadEvent();
  }, [eventId]);

  if (!event) return null;

  const statusColor =
    event.status === "live"
      ? "bg-green-500"
      : event.status === "completed"
        ? "bg-gray-400"
        : "bg-orange-500";
  function formatCamelCase(text?: string) {
    if (!text) return "";

    return text
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center flex-wrap gap-3 text-xs font-medium text-gray-600"
    >
      {/* STATUS */}
      <span className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
        <span
          className={`font-semibold ${
            event.status === "live"
              ? "text-green-600"
              : event.status === "completed"
                ? "text-gray-500"
                : "text-orange-600"
          }`}
        >
          {formatCamelCase(event.status)}
        </span>
      </span>

      {/* DOT */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-1 h-1 bg-gray-300/70 rounded-full"
      />

      {/* REGISTRATION */}
      <span>
        <span className="font-semibold text-gray-700">Registration:</span>{" "}
        {formatCamelCase(event.registration?.status)}
      </span>

      {/* DOT + VENUE (Desktop Only) */}
      <span className="hidden md:flex items-center gap-3">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-1 h-1 bg-gray-300/70 rounded-full"
        />
        <span>
          <span className="font-semibold text-gray-700">Venue:</span>{" "}
          {event.venue}
        </span>
      </span>
    </motion.div>
  );
}
