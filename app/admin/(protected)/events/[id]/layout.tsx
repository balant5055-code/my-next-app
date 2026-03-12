"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  QrCodeIcon,
  ArrowUpTrayIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const eventId = params.id as string;

  const tabs = [
    {
      name: "Overview",
      href: `/admin/events/${eventId}/overview`,
      icon: PresentationChartLineIcon,
    },
    {
      name: "Registrations",
      href: `/admin/events/${eventId}/participants`,
      icon: UsersIcon,
    },
    {
      name: "Check-In",
      href: `/admin/events/${eventId}/checkin`,
      icon: QrCodeIcon,
    },
    {
      name: "Bulk Upload",
      href: `/admin/events/${eventId}/bulk-upload`,
      icon: ArrowUpTrayIcon,
    },
    {
      name: "Chip Mapping",
      href: `/admin/events/${eventId}/chip-mapping`,
      icon: CpuChipIcon,
    },
    {
      name: "Analytics",
      href: `/admin/events/${eventId}/analytics`,
      icon: ChartBarIcon,
    },
    {
      name: "Certificate",
      href: `/admin/events/${eventId}/certificate`,
      icon: DocumentTextIcon,
    },
    {
      name: "Settings",
      href: `/admin/events/${eventId}/settings`,
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div
      className="
  min-h-screen 
  bg-white text-gray-900
  dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0b1220]
  dark:text-slate-100
  transition-colors duration-300
"
    >
      {/* ================= NAVIGATION ================= */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4">
        {/* Scrollable container for tablet/mobile */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href); // ✅ better active detection
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200
  ${
    active
      ? "bg-indigo-600 text-white shadow-lg"
      : "text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
  }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
