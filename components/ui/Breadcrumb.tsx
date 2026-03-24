"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRightIcon,
  HomeIcon,
  TrophyIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

/* ICON MAP */
const segmentIcons: Record<string, any> = {
  results: TrophyIcon,
  photos: PhotoIcon,
};

/* FORMAT LABEL */
function formatLabel(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/(\d)\s+(\d)/g, "$1.$2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const [eventName, setEventName] = useState<string | null>(null);

  /* FETCH EVENT NAME */
  useEffect(() => {
    const slug = segments[1];

    if (!slug || segments[0] !== "results") return;

    fetch(`/api/events/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.title) setEventName(data.title);
      })
      .catch(() => {});
  }, [pathname]);

  /* BUILD ITEMS */
  const breadcrumbItems = useMemo(() => {
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");

      const isEventSlug = index === 1 && segments[0] === "results";

      const label =
        isEventSlug && eventName
          ? eventName
          : formatLabel(segment);

      return { label, href };
    });
  }, [segments, eventName]);

  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-600 mb-6">
      {/* HOME */}
      <Link href="/" className="flex items-center gap-1 hover:text-gray-900">
        <HomeIcon className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const segment = segments[index];
        const Icon = segmentIcons[segment];

        return (
          <div key={item.href} className="flex items-center gap-1">
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />

            {!isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 font-medium hover:text-gray-900 max-w-[140px] truncate"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-gray-900 max-w-[160px] truncate">
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}