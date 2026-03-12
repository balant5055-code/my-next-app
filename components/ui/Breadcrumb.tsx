"use client";

import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-2 text-sm flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* HOME ICON */}
            {index === 0 && <HomeIcon className="w-4 h-4 text-red-700" />}

            {!isLast && item.href ? (
              <Link
                href={item.href}
                className="text-red-700 hover:text-red-900 font-medium transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold">{item.label}</span>
            )}

            {!isLast && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}
