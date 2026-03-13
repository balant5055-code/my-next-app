"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
};

export default function PageHeader({ title, subtitle, icon }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {/* ICON */}
      {icon && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
          {icon}
        </div>
      )}

      {/* TEXT */}
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 leading-tight">
          {title}
        </h1>

        {/* underline */}
        <motion.div
          className="h-[2px] mt-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          animate={{ width: [30, 80, 30] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {subtitle && (
          <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
