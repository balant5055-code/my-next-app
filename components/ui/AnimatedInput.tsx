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
  disabled?: boolean;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

export default function AnimatedInput({
  icon,
  type = "text",
  placeholder,
  name,
  value,
  required,
  disabled,
  inputMode,
  autoComplete,
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
        value={value ?? ""}
        required={required}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full border border-gray-300 py-3
        pl-12 pr-4 text-sm transition
        focus:border-orange-500 focus:outline-none
        focus:ring-2 focus:ring-orange-200
        ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
    </motion.div>
  );
}
