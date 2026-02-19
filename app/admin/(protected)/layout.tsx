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
import { Toaster } from "react-hot-toast";

import SessionManager from "@/components/admin/SessionManager";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
  { name: "All Events", path: "/admin/events", icon: CalendarDaysIcon },
  { name: "Create Event", path: "/admin/create-event", icon: PlusCircleIcon },
  { name: "Registrations", path: "/admin/registrations", icon: UsersIcon },
  { name: "Payments", path: "/admin/payments", icon: CreditCardIcon },
  {
    name: "Upload History",
    path: "/admin/upload-history",
    icon: ArrowUpTrayIcon,
  },
  { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminAuthGate>
      {/* 🔐 Enterprise Session Manager */}
      <SessionManager />

      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220] text-white">
        {/* SIDEBAR */}
        <aside
          className={`fixed top-0 left-0 h-screen ${
            collapsed ? "w-20" : "w-72"
          } bg-[#111827] border-r border-slate-700 transition-all duration-300 px-5 py-6 flex flex-col z-40`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">
            {!collapsed && (
              <div>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  Raceline India
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Event Operations Panel
                </p>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-700 transition"
            >
              <Bars3Icon className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* MENU */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {menuItems.map(({ name, path, icon: Icon }) => {
              const active = pathname.startsWith(path);

              return (
                <Link key={path} href={path}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 6 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition ${
                        active ? "text-white" : "text-slate-400"
                      }`}
                    />

                    {!collapsed && name}

                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-pink-400 rounded-r"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER */}
          {!collapsed && (
            <div className="pt-6 border-t border-slate-700 mt-6">
              <div className="text-sm font-medium text-white">Bala NT</div>
              <div className="text-xs text-slate-400">Super Admin</div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main
          className={`transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-72"
          } p-10`}
        >
          {children}
        </main>
        {/* 🔥 GLOBAL ENTERPRISE TOAST SYSTEM */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#ffffff",
              border: "1px solid #334155",
              borderRadius: "14px",
              fontSize: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#0f172a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#0f172a",
              },
            },
          }}
        />
      </div>
    </AdminAuthGate>
  );
}
