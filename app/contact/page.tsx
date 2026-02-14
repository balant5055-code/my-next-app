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
    <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-100">

      {/* background glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

        {/* LEFT — CONTACT FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8 md:p-10"
        >
          <h2 className="text-4xl font-bold mb-2">Contact Us</h2>
          <p className="text-gray-500 mb-8">
            Let’s discuss your event, partnership, or enquiry.
          </p>

          <form className="space-y-6">
            <Input label="Full Name" placeholder="Your name" />
            <Input label="Email Address" placeholder="you@email.com" />
            <Textarea label="Message" placeholder="Tell us about your event…" />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              Send Message 🚀
            </motion.button>
          </form>
        </motion.div>

        {/* RIGHT — CONTACT DETAILS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center"
        >
          <h3 className="text-3xl font-bold mb-8">
            Connect With Us
          </h3>

          <div className="space-y-5">

            <ContactCard
              icon={<MapPinIcon />}
              title="Office Address"
              value="Punjai Puliampatti, Sathy Road, Tamil Nadu – 638459"
              color="bg-gray-800"
            />

            <ContactCard
              icon={<EnvelopeIcon />}
              title="Email"
              value="support@yourdomain.com"
              color="bg-orange-500"
            />

            <ContactCard
              icon={<PhoneIcon />}
              title="WhatsApp"
              value="+91 98765 43210"
              color="bg-green-500"
            />

            <ContactCard
              icon={<CameraIcon />}
              title="Instagram"
              value="@yourpage"
              color="bg-pink-500"
            />

            <ContactCard
              icon={<GlobeAltIcon />}
              title="Facebook"
              value="/yourpage"
              color="bg-blue-600"
            />

            <ContactCard
              icon={<PlayCircleIcon />}
              title="YouTube"
              value="Your Channel"
              color="bg-red-600"
            />

          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Input({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3
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
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <textarea
        rows={5}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3
                   focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                   focus:outline-none transition"
      />
    </div>
  );
}

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
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-4 rounded-2xl border bg-white/80 backdrop-blur
                 p-5 shadow-md hover:shadow-xl transition cursor-pointer"
    >
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${color}`}
      >
        <div className="h-6 w-6">{icon}</div>
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{value}</p>
      </div>
    </motion.div>
  );
}
