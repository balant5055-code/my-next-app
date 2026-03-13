"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  label?: string;
  icon?: ReactNode;
};

export default function SectionHeader({ title, subtitle, label, icon }: Props) {
  return (
    <section className="mb-12 text-center">
      {/* TOP LABEL */}
      {label && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <div aria-hidden="true" className="h-px w-12 bg-gray-200"></div>

          <span className="flex items-center gap-1 text-xs font-semibold tracking-wider text-gray-600 uppercase">
            {icon}
            {label}
          </span>

          <div aria-hidden="true" className="h-px w-12 bg-gray-200"></div>
        </div>
      )}

      {/* TITLE WITH PATTERN DIVIDERS */}
      <div className="flex items-center justify-center gap-6">
        <div aria-hidden="true" className="flex-1 border-title"></div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] bg-clip-text text-transparent">
          {title}
        </h2>

        <div aria-hidden="true" className="flex-1 border-title"></div>
      </div>

      {/* SUBTITLE */}
      {subtitle && (
        <p className="mt-3 text-2xl md:text-3xl lg:text-3xl text-gray-600 max-w-2xl mx-auto tan">
          {subtitle}
        </p>
      )}
    </section>
  );
}
