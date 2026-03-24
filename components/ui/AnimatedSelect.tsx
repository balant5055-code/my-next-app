"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface AnimatedSelectProps {
  icon?: ReactNode;
  name: string;
  value: string;
  required?: boolean;
  onChange: (e: any) => void;
  children: ReactNode;
  className?: string;
}

export default function AnimatedSelect({
  name,
  value,
  required,
  onChange,
  icon,
  children,
  className = "",
}: AnimatedSelectProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`relative ${className}`}
    >
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}

      <select
        name={name}
        value={value ?? ""}
        required={required}
        onChange={onChange}
        className="w-full appearance-none
        bg-gray-50 hover:bg-gray-100
        py-3 pl-12 pr-10
        text-sm text-gray-700 font-medium
        rounded-xl
        transition
        outline-none
        focus:ring-2 focus:ring-orange-400"
      >
        {children}
      </select>

      {/* Dropdown arrow */}

      <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </motion.div>
  );
}
