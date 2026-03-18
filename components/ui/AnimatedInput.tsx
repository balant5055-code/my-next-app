"use client";

import { motion } from "framer-motion";
import React, { ReactNode, forwardRef } from "react";

interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ icon, className, disabled, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.03 }} className="relative w-full">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          {...props}
          disabled={disabled}
          className={`w-full border border-gray-300 py-3
          ${icon ? "pl-12" : "pl-4"} pr-4 text-sm transition
          focus:border-orange-500 focus:outline-none
          focus:ring-2 focus:ring-orange-200
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${className ?? ""}`}
        />
      </motion.div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export default AnimatedInput;