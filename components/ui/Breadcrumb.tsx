"use client";

import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1 text-sm text-gray-600 mb-6"
    >
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-gray-900 transition"
          >
            <HomeIcon className="w-4 h-4" />
          </Link>

          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1">
            {!isLast && item.href ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{item.label}</span>
            )}

            {!isLast && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}
