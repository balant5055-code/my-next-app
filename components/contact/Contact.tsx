"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import {
  GlobeAltIcon,
  CameraIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

export default function Contact() {
  const [hovered, setHovered] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateName = (value: string) => {
    setName(value);
    if (value.length < 2) setNameError("Enter a valid name");
    else setNameError("");
  };

  const validateEmail = (value: string) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) setEmailError("Enter a valid email address");
    else setEmailError("");
  };

  const validateMessage = (value: string) => {
    setMessage(value);
    if (value.length < 10)
      setMessageError("Message should be at least 10 characters");
    else setMessageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      nameError ||
      emailError ||
      messageError ||
      !name ||
      !email ||
      !message
    ) {
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
          name,
          email,
          message,
          source: "contact",
        }),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");

      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("Lead submission failed", error);
    }

    setLoading(false);
  };

  return (
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
      className="relative bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 max-w-5xl mx-auto w-full overflow-hidden"
    >
      {/* Glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-orange-400/30"
      />

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* LEFT SIDE - FORM */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900">
                Send Us a Message
              </h3>
              <p className="sr-only">
                Contact Raceline for marathon timing services, sports event
                registration platform, race timing chips, cycling event timing,
                and participant management for running and sports events in
                India.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Planning a marathon, cycling race, walkathon or sports event?
              Contact Raceline for event registration and race timing solutions.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                aria-label="Full name"
                value={name}
                onChange={(e) => validateName(e.target.value)}
                type="text"
                placeholder="Full name"
                className={`w-full border pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition
                ${
                  nameError
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }
                focus:ring-2`}
              />

              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* EMAIL */}
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                aria-label="Email address"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className={`w-full border pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition
                ${
                  emailError
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }
                focus:ring-2`}
              />

              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* MESSAGE */}
            <div className="relative">
              <PencilSquareIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

              <textarea
                aria-label="Event details message"
                rows={4}
                value={message}
                onChange={(e) => validateMessage(e.target.value)}
                placeholder="Tell us about your event..."
                className={`w-full border pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition
                ${
                  messageError
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }
                focus:ring-2`}
              />

              <AnimatePresence>
                {messageError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {messageError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* BUTTON */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-semibold text-white"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
          {/* privacy text */}
          <p className="text-xs text-gray-500 mt-6">
            We respect your privacy. No spam. Only event-related support.
          </p>
          {/* SUCCESS */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3"
              >
                <CheckCircleIcon className="h-5 w-5 text-green-600" />

                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Message sent successfully
                  </p>

                  <p className="text-xs text-green-600">
                    Our team will contact you shortly
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE - CONTACT INFO */}
        {/* RIGHT SIDE - CONTACT INFO */}
        <div className="flex flex-col justify-between bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-5 sm:p-8 h-full shadow-sm hover:shadow-lg transition-all duration-300">
          {/* HEADER */}
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
              Event Support & Partnerships
            </p>

            <h3 className="text-xl font-semibold text-gray-900">
              Get in Touch with Raceline
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mt-2 mb-6">
              Planning a marathon, cycling race, or corporate run? Raceline
              helps you manage registrations, race timing, and event technology
              seamlessly — all in one powerful platform.
            </p>
            {/* Hidden SEO location text */}
            <p className="sr-only">
              Raceline provides marathon timing services, race timing systems,
              sports event registration platforms, and event technology
              solutions across India including Tamil Nadu, Coimbatore, Chennai
              and major running and cycling events.
            </p>
            {/* CONTACT TITLE */}
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Contact Information
            </p>

            {/* CONTACT CARDS */}
            <div className="space-y-3">
              <ContactCard icon={<MapPinIcon />} value="Tamil Nadu, India" />

              <ContactCard
                icon={<EnvelopeIcon />}
                value="support@raceline.in"
                href="mailto:support@raceline.in"
              />

              <ContactCard
                icon={<PhoneIcon />}
                value="+91 98765 43210"
                href="tel:+919876543210"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactCard({
  icon,
  value,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  href?: string;
}) {
  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ y: -2 }}
        className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 sm:p-4 text-sm text-gray-700 hover:border-orange-300 hover:bg-gray-50 transition"
      >
        <div className="h-5 w-5 text-orange-500">{icon}</div>

        <div className="flex items-center justify-between w-full">
          <span>{value}</span>
          <span className="text-gray-400">→</span>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 sm:p-4 text-sm text-gray-700 hover:border-orange-300 hover:bg-gray-50 transition"
    >
      <div className="h-5 w-5 text-orange-500">{icon}</div>
      <span>{value}</span>
    </motion.div>
  );
}

function SocialButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:border-orange-300 transition"
    >
      <div className="h-4 w-4 text-orange-500">{icon}</div>
      {label}
    </motion.div>
  );
}
