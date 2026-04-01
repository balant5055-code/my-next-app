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
  if (pathname.startsWith("/admin")) return null;

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
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://wedesignthemes.com/html/fitness/images/paralax-5.png')",
        }}
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(500px at ${pos.x}% ${pos.y}%, rgba(239,68,68,0.45), transparent 70%)`,
        }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">

        {/* CTA */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
            
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Powering <span className="text-orange-500">Events</span> That People Remember
              </h2>

              <p className="mt-3 text-sm sm:text-base text-gray-300">
                From marathons and sports meets to conferences and cultural programs — manage registrations, participants, and experiences on one powerful platform.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-orange-500 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-orange-600 transition"
            >
              Host Your Event
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>

        {/* MAIN */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          {/* About */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3">
              Event Platform
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              A modern event technology platform for sports, marathons, conferences, and large-scale programs.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              {["Upcoming Events", "Create Event", "Pricing", "Contact"].map((item) => (
                <li
                  key={item}
                  className="hover:text-orange-500 cursor-pointer transition"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              <FooterItem icon={CalendarDaysIcon} text="Event Scheduling" />
              <FooterItem icon={CalendarDaysIcon} text="Online Registration" />
              <FooterItem icon={CalendarDaysIcon} text="Live Results & Tracking" />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-white">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <FooterItem icon={MapPinIcon} text="India · Serving Events Nationwide" />
              <FooterItem icon={EnvelopeIcon} text="support@eventplatform.com" />
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 py-5 text-center text-xs sm:text-sm text-gray-400 px-4">
          © {new Date().getFullYear()} Event Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ================= ICON ITEM ================= */

function FooterItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
        <Icon className="h-4 w-4 text-orange-500" />
      </div>
      <span className="text-gray-300 leading-snug">{text}</span>
    </li>
  );
}