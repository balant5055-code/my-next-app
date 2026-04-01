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

  // ✅ ADD THIS
  disabled?: boolean;
}

export default function AnimatedSelect({
  name,
  value,
  required,
  onChange,
  icon,
  children,
  className = "",
  disabled
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
  value={value || ""}
  required={required}
  onChange={onChange}
  disabled={disabled}
  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
  className={`w-full border border-gray-300 py-3
  ${icon ? "pl-12" : "pl-4"} pr-10 text-sm transition
  focus:border-orange-500 focus:outline-none
  focus:ring-2 focus:ring-orange-200
  appearance-none
  [&::-ms-expand]:hidden
  ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
  ${className}`}
>
  {children}
</select>

      {/* Dropdown arrow */}

      <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </motion.div>
  );
}
