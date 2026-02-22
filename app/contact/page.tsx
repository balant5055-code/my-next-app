"use client";

import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  GlobeAltIcon,
  CameraIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";

export default function Contact() {
  return (
    <section className="relative bg-white pt-20 lg:pt-36 pb-16 md:pb-24 px-4 overflow-hidden">
      {/* Racing Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
        {/* LEFT — FORM */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Let’s Build Your Next Event 🏃
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Have an event idea? We’re ready to race with you.
          </p>

          <form className="space-y-4">
            <Input label="Full Name" placeholder="Your name" />
            <Input label="Email Address" placeholder="you@email.com" />
            <Textarea label="Message" placeholder="Tell us about your event…" />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full relative overflow-hidden rounded-lg 
                         bg-gradient-to-r from-orange-500 to-red-600
                         py-3 font-bold text-white shadow-md 
                         transition-all duration-300"
            >
              <span className="relative z-10">Start the Conversation</span>

              {/* Speed Shine Effect */}
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </motion.button>
          </form>
        </motion.div>

        {/* RIGHT — CONTACT DETAILS */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Connect With Us
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <ContactCard
              icon={<MapPinIcon />}
              title="Address"
              value="Punjai Puliampatti, Tamil Nadu"
              color="from-gray-700 to-gray-900"
            />

            <ContactCard
              icon={<EnvelopeIcon />}
              title="Email"
              value="support@yourdomain.com"
              color="from-orange-500 to-red-500"
            />

            <ContactCard
              icon={<PhoneIcon />}
              title="WhatsApp"
              value="+91 98765 43210"
              color="from-green-500 to-emerald-600"
            />

            <ContactCard
              icon={<CameraIcon />}
              title="Instagram"
              value="@yourpage"
              color="from-pink-500 to-rose-600"
            />

            <ContactCard
              icon={<GlobeAltIcon />}
              title="Facebook"
              value="/yourpage"
              color="from-blue-500 to-indigo-600"
            />

            <ContactCard
              icon={<PlayCircleIcon />}
              title="YouTube"
              value="Your Channel"
              color="from-red-500 to-red-700"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- INPUT ---------- */

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                   focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                   focus:outline-none transition"
      />
    </div>
  );
}

function Textarea({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
        {label}
      </label>
      <textarea
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                   focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                   focus:outline-none transition"
      />
    </div>
  );
}

/* ---------- CONTACT CARD ---------- */

function ContactCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex items-start gap-3 rounded-xl border border-gray-200 
                 bg-white p-4 shadow-sm hover:shadow-lg transition"
    >
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center text-white 
                    bg-gradient-to-br ${color}`}
      >
        <div className="h-5 w-5">{icon}</div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 break-words">{value}</p>
      </div>
    </motion.div>
  );
}
