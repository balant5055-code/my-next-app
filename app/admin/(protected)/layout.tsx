"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import AdminAuthGate from "@/app/admin/AdminAuthGate";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
  { name: "Create Event", path: "/admin/create-event", icon: PlusCircleIcon },
  { name: "Manage Events", path: "/admin/events", icon: CalendarDaysIcon },
  { name: "Registrations", path: "/admin/registrations", icon: UsersIcon },
  { name: "Payments", path: "/admin/payments", icon: CreditCardIcon },
  {
    name: "Upload History",
    path: "/admin/upload-history",
    icon: ArrowUpTrayIcon,
  },
  { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-[#F3F6FB]">
        {/* FIXED SIDEBAR */}
        <aside
          className={`fixed top-0 left-0 h-screen ${
            collapsed ? "w-20" : "w-72"
          } bg-white shadow-xl transition-all duration-300 px-5 py-6 flex flex-col z-40`}
        >
          {/* Top */}
          <div className="flex items-center justify-between mb-10">
            {!collapsed && (
              <div>
                <h2 className="text-2xl font-extrabold text-blue-600">
                  Event Admin
                </h2>
                <p className="text-xs text-gray-500 mt-1">Manage events</p>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* MENU */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {menuItems.map(({ name, path, icon: Icon }) => {
              const active = pathname === path;

              return (
                <Link key={path} href={path}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 6 }}
                    className={`relative flex items-center gap-3 px-4 py-3 text-sm font-medium  transition
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-white" : "text-blue-600"
                      }`}
                    />

                    {!collapsed && name}

                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-blue-800 rounded-r"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER PROFILE */}
          {!collapsed && (
            <div className="pt-6 border-t mt-6">
              <div className="text-sm font-medium text-gray-700">Bala NT</div>
              <div className="text-xs text-gray-500">Admin Access</div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main
          className={`transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-72"
          } p-10`}
        >
          {children}
        </main>
      </div>
    </AdminAuthGate>
  );
}
