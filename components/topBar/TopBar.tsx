"use client";

import { usePathname } from "next/navigation";
import {
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export default function TopBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm shadow-sm">
      {/* MOBILE ANNOUNCEMENT */}
      <div className="md:hidden flex items-center justify-center gap-2 py-1.5 border-b border-white/20 px-3 text-center">
        <MegaphoneIcon className="w-4 h-4 text-orange-200 flex-shrink-0" />
        <span className="font-medium truncate">
          Early Bird – Punjai Marathon 2026
        </span>
      </div>

      {/* MAIN BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <PhoneIcon className="w-4 h-4 text-orange-200" />
          <span className="font-medium">+1 223 355 2214</span>
        </div>

        {/* CENTER (DESKTOP ONLY) */}
        <div className="hidden md:flex items-center gap-2 text-center">
          <MegaphoneIcon className="w-4 h-4 text-orange-200" />
          <p className="whitespace-nowrap">
            Early Bird Registration Open for
            <span className="ml-1 font-semibold text-orange-100">
              Punjai Marathon 2026
            </span>
          </p>
        </div>

        {/* RIGHT */}
        <a
          href="/organizer/login"
          className="flex items-center gap-1 whitespace-nowrap hover:text-orange-200 transition"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Organizer Login</span>
        </a>
      </div>
    </div>
  );
}
