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
    <section className="mb-6 text-center">
      {/* TOP LABEL */}
      {label && (
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <div aria-hidden="true" className="h-px w-8 bg-gray-200"></div>

          <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            {icon}
            {label}
          </span>

          <div aria-hidden="true" className="h-px w-8 bg-gray-200"></div>
        </div>
      )}

      {/* TITLE */}
      <div className="flex items-center justify-center gap-3">
        <div aria-hidden="true" className="flex-1 border-title"></div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] bg-clip-text text-transparent">
          {title}
        </h2>

        <div aria-hidden="true" className="flex-1 border-title"></div>
      </div>

      {/* SUBTITLE */}
      {subtitle && (
        <p className="mt-2 text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </section>
  );
}
