"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";

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
      name: "Analytics",
      href: `/admin/events/${eventId}/analytics`,
      icon: ChartBarIcon,
    },
    {
      name: "Registrations",
      href: `/admin/events/${eventId}/registrations`,
      icon: UsersIcon,
    },
    {
      name: "Settings",
      href: `/admin/events/${eventId}/settings`,
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220] text-slate-100">
      {/* Top Navigation */}
      <div className="border-b border-slate-800 px-8 py-4">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition
                  ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8">{children}</div>
    </div>
  );
}
