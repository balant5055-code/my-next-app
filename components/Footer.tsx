"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <footer
      className="relative overflow-hidden bg-black text-gray-300"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({ x, y });
      }}
    >
      {/* ✅ BACKGROUND IMAGE (VISIBLE) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://wedesignthemes.com/html/fitness/images/paralax-5.png')",
        }}
      />

      {/* ✅ MOUSE GLOW (VISIBLE) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(500px at ${pos.x}% ${pos.y}%, rgba(239,68,68,0.45), transparent 70%)`,
        }}
      />

      {/* ✅ DARK TINT (LIGHT, NOT KILLING IMAGE) */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* CTA BAND */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Powering <span className="text-red-500">Events</span> That
                People Remember
              </h2>
              <p className="mt-3 text-sm md:text-base text-gray-300">
                From marathons and sports meets to conferences and cultural
                programs — manage registrations, participants, and experiences
                on one powerful platform.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-full bg-red-600 px-8 py-3 text-sm md:text-base font-semibold text-white shadow-lg hover:bg-red-700 transition"
            >
              Host Your Event
              <ArrowRightIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* MAIN FOOTER */}
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              Event Platform
            </h3>
            <p className="text-sm text-gray-400">
              A modern event technology platform for sports, marathons,
              conferences, and large-scale programs.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              {["Upcoming Events", "Create Event", "Pricing", "Contact"].map(
                (item) => (
                  <li
                    key={item}
                    className="hover:text-red-500 cursor-pointer transition"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-red-500" />
                Event Scheduling
              </li>
              <li className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-red-500" />
                Online Registration
              </li>
              <li className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-red-500" />
                Live Results & Tracking
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-red-500 mt-0.5" />
                India · Serving Events Nationwide
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-red-500" />
                support@eventplatform.com
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 py-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Event Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
