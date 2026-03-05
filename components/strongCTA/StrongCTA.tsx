"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import {
  BoltIcon,
  ChartBarIcon,
  TrophyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
export default function StrongCTA() {
  const whatsappNumber = "919916803664";

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hovered, setHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);

    if (cleaned.length === 0) {
      setError("");
      setValid(false);
      return;
    }

    if (!/^[0-9]{10}$/.test(cleaned)) {
      setError("Enter a valid 10-digit phone number");
      setValid(false);
    } else {
      setError("");
      setValid(true);
    }
  };

  const handleSubmit = async () => {
    if (!valid) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);

      await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "+91" + phone,
          source: "cta",
        }),
      });

      setSuccess(true);
      setPhone("");
      setValid(false);
      setError("");

      inputRef.current?.focus();

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden max-w mx-auto">
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Card */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          boxShadow: hovered
            ? "0 25px 60px rgba(0,0,0,0.08)"
            : "0 0px 0px rgba(0,0,0,0)",
          y: hovered ? -6 : 0,
        }}
        transition={{ duration: 0.35 }}
        className="relative bg-white border border-gray-200 rounded-3xl p-8 text-center"
      >
        {/* hover glow */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-orange-400/30"
        />

        {/* privacy text */}
        {/* HEADER */}
        <h6 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Start managing registrations, race timing and results in minutes.
        </h6>

        {/* privacy text */}
        <p className="text-xs text-gray-500 mb-6">
          We respect your privacy. No spam. Only event-related support.
        </p>

        {/* PHONE INPUT */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              +91
            </span>

            <input
              ref={inputRef}
              value={phone}
              onChange={(e) => validatePhone(e.target.value)}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="9123456789"
              className={`w-full border py-3 pl-20 pr-4 text-sm rounded-lg outline-none transition 
              ${
                error
                  ? "border-red-400 focus:ring-red-200"
                  : valid
                    ? "border-green-400 focus:ring-green-200"
                    : "border-gray-300 focus:ring-orange-200"
              }
              focus:ring-2 focus:ring-orange-200 focus:shadow-[0_0_0_1px_rgba(249,115,22,0.15)]`}
            />

            {/* success icon */}
            <AnimatePresence>
              {valid && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 mt-2 text-left"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* BUTTONS */}
        <div className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative overflow-hidden w-full sm:flex-1 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-500"
          >
            {loading
              ? "Submitting..."
              : success
                ? "✓ We'll call you"
                : "Request Call Back"}

            {/* Stripe style shine */}
            <span className="absolute inset-0 -translate-x-full bg-white/20 hover:translate-x-full transition-transform duration-700"></span>
          </motion.button>

          {/* OR */}
          <span className="text-xs text-gray-400 text-center sm:flex sm:items-center sm:px-1">
            OR
          </span>

          <motion.a
            href={`https://wa.me/${whatsappNumber}?text=Hello%20I%20want%20to%20organize%20an%20event`}
            target="_blank"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative overflow-hidden w-full sm:flex-1 flex items-center justify-center gap-2 bg-green-500 px-6 py-3 text-sm font-semibold text-white rounded-lg hover:bg-green-600 transition"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            WhatsApp
            {/* Shine effect */}
            <span className="absolute inset-0 -translate-x-full bg-white/20 group-hover:translate-x-full transition-transform duration-700"></span>
          </motion.a>
        </div>

        {/* response time */}
        <p className="text-xs text-gray-500 mt-6">
          ⚡ Usually responds within 2 hours
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <BoltIcon className="h-4 w-4 text-orange-500" />
            Instant Registration
          </div>

          <div className="flex items-center justify-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-orange-500" />
            Live Timing
          </div>

          <div className="flex items-center justify-center gap-2">
            <TrophyIcon className="h-4 w-4 text-orange-500" />
            Certificates
          </div>

          <div className="flex items-center justify-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-orange-500" />
            Secure Payments
          </div>
        </div>
        {/* success message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-center gap-3 justify-center rounded-xl bg-green-50 border border-green-200 p-3 shadow-sm"
            >
              <CheckCircleIcon className="h-5 w-5 text-green-600" />

              <div className="text-left">
                <p className="text-sm font-semibold text-green-700">
                  Request received successfully
                </p>

                <p className="text-xs text-green-600">
                  Our team will contact you shortly
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
