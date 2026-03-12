"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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
        className="w-full appearance-none border border-gray-300 bg-white
        py-3 pl-12 pr-4 text-sm transition
        focus:border-orange-500 focus:outline-none
        focus:ring-2 focus:ring-orange-200"
      >
        {children}
      </select>
    </motion.div>
  );
}
