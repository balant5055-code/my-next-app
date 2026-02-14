"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedInputProps {
  icon?: ReactNode;
  type?: string;
  placeholder?: string;
  name: string;
  value?: string;
  required?: boolean;
  onChange: (e: any) => void;
}

export default function AnimatedInput({
  icon,
  type = "text",
  placeholder,
  name,
  value,
  required,
  onChange,
}: AnimatedInputProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="relative w-full">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full  border border-gray-300 bg-white py-3
                   pl-12 pr-4 text-sm transition
                   focus:border-orange-500 focus:outline-none
                   focus:ring-2 focus:ring-orange-200"
      />
    </motion.div>
  );
}
