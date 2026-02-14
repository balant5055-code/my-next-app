"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import AdminAuthGate from "@/app/admin/AdminAuthGate";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
  { name: "Create Event", path: "/admin/create-event", icon: PlusCircleIcon },
  { name: "Manage Events", path: "/admin/events", icon: CalendarDaysIcon },
  { name: "Registrations", path: "/admin/registrations", icon: UsersIcon },
  { name: "Payments", path: "/admin/payments", icon: CreditCardIcon },
  { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminAuthGate>
      <div className="flex min-h-screen bg-[#F3F6FB]">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white/80 backdrop-blur-xl px-5 py-6">
          <div className="mb-10">
            <h2 className="text-2xl font-extrabold text-red-600">
              Event Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Manage events & registrations
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map(({ name, path, icon: Icon }) => {
              const active = pathname === path;

              return (
                <Link key={path} href={path}>
                  <motion.div
                    whileHover={{ x: 6 }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                      ${
                        active
                          ? "bg-red-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-red-50"
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-white" : "text-red-600"
                      }`}
                    />
                    {name}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-10">{children}</main>
      </div>
    </AdminAuthGate>
  );
}
