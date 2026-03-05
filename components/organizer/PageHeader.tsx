"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function PageHeader({
  icon,
  title,
  subtitle,
  breadcrumbs = [],
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-600 transition"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-500 font-medium">{crumb.label}</span>
              )}

              {index < breadcrumbs.length - 1 && (
                <ChevronRightIcon className="h-3 w-3 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Title Row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        {icon && (
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            {icon}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {/* Animated Gradient Title */}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
              {title}
            </span>
          </h1>

          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </motion.div>

      <div className="mt-6 h-px bg-gray-100" />
    </div>
  );
}
