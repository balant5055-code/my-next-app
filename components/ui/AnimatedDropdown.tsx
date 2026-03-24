"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface Option {
  label: string;
  value: string;
  icon?: ReactNode;
}

interface Props {
  label?: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}

export default function AnimatedDropdown({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: any) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative flex flex-col gap-1 min-w-[170px]" ref={ref}>
      {label && (
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* BUTTON */}

      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-3 py-2
        bg-white border border-gray-300 rounded-md
        cursor-pointer text-sm"
      >
        <div className="flex items-center gap-2">
          {selected?.icon}

          <span className="text-gray-700">{selected?.label}</span>
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition ${open ? "rotate-180" : ""}`}
        />
      </motion.div>

      {/* MENU */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 w-full mt-1
            bg-white border border-gray-200 rounded-md z-40"
          >
            {options.map((opt) => {
              const active = opt.value === value;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                  ${
                    active
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {opt.icon}

                  {opt.label}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
