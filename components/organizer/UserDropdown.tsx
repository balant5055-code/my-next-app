"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function UserDropdown({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
          O
        </div>

        <span className="hidden md:block text-sm font-medium text-gray-700">
          Organizer
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
