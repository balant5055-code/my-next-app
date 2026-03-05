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
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm shadow-sm">
      {/* MOBILE ANNOUNCEMENT */}
      <div className="md:hidden flex items-center justify-center gap-2 py-1 border-b border-white/20">
        <MegaphoneIcon className="w-4 h-4 text-orange-200" />
        <span className="text-xs font-medium">
          Early Bird – Punjai Marathon 2026
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 text-orange-200" />
          <span className="font-medium text-xs sm:text-sm">
            +1 223 355 2214
          </span>
        </div>

        {/* DESKTOP ANNOUNCEMENT */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
          <MegaphoneIcon className="w-4 h-4 text-orange-200" />
          <p className="tracking-wide whitespace-nowrap">
            Early Bird Registration Open for
            <span className="ml-1 font-semibold text-orange-100">
              Punjai Marathon 2026
            </span>
          </p>
        </div>

        {/* RIGHT */}
        <a
          href="/organizer/login"
          className="flex items-center gap-1 hover:text-orange-200 transition"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Organizer Login</span>
        </a>
      </div>
    </div>
  );
}
