"use client";

import Link from "next/link";
import { ReactNode, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  QrCodeIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import AdminAuthGate from "@/app/admin/AdminAuthGate";
import { Toaster } from "react-hot-toast";
import SessionManager from "@/components/admin/SessionManager";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/admin/ThemeToggle";
import { secureFetch } from "@/lib/secureFetch";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Detect eventId (memoized)
  const eventId = useMemo(() => {
    const match = pathname.match(/^\/admin\/events\/([^\/]+)/);
    return match?.[1];
  }, [pathname]);

  const mainMenu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
    { name: "All Events", path: "/admin/events", icon: CalendarDaysIcon },
    { name: "Create Event", path: "/admin/create-event", icon: PlusCircleIcon },
    {
      name: "Upload History",
      path: "/admin/upload-history",
      icon: ArrowUpTrayIcon,
    },
    { name: "Payments", path: "/admin/payments", icon: CreditCardIcon },
  ];

  const eventMenu = eventId
    ? [
        {
          name: "Event Overview",
          path: `/admin/events/${eventId}/overview`,
          icon: PresentationChartLineIcon,
        },
        {
          name: "Registrations",
          path: `/admin/events/${eventId}/participants`,
          icon: UsersIcon,
        },
        {
          name: "Check-In",
          path: `/admin/events/${eventId}/checkin`,
          icon: QrCodeIcon,
        },
        {
          name: "Bulk Upload",
          path: `/admin/events/${eventId}/bulk-upload`,
          icon: ArrowUpTrayIcon,
        },
        {
          name: "Chip Mapping",
          path: `/admin/events/${eventId}/chip-mapping`,
          icon: CpuChipIcon,
        },
        {
          name: "Photos",
          path: `/admin/events/${eventId}/photos`,
          icon: ChartBarIcon,
        },
        {
          name: "Event Settings",
          path: `/admin/events/${eventId}/settings`,
          icon: Cog6ToothIcon,
        },
      ]
    : [];

  const menuToRender = eventId ? eventMenu : mainMenu;

  const handleLogout = async () => {
    try {
      await secureFetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/admin/login");
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AdminAuthGate>
        <SessionManager />

        <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0b1220] text-slate-900 dark:text-white transition-colors duration-300">
          <aside
            className={`fixed top-0 left-0 h-screen ${
              collapsed ? "w-20" : "w-72"
            } bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-700 transition-all duration-300 px-5 py-6 flex flex-col z-40`}
          >
            <div className="flex items-center justify-between mb-8">
              {!collapsed && (
                <div>
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                    Raceline India
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {eventId ? "Event Operations" : "Admin Panel"}
                  </p>
                </div>
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Bars3Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {eventId && !collapsed && (
              <Link
                href="/admin/events"
                className="text-xs text-indigo-500 mb-6 hover:underline"
              >
                ← Back to All Events
              </Link>
            )}

            <nav className="space-y-2 flex-1 overflow-y-auto">
              {menuToRender.map(({ name, path, icon: Icon }) => {
                const active =
                  pathname === path || pathname.startsWith(path + "/");

                return (
                  <Link key={path} href={path}>
                    <motion.div
                      whileHover={{ scale: collapsed ? 1.1 : 1.02 }}
                      className={`relative flex items-center ${
                        collapsed ? "justify-center px-0" : "gap-3 px-4"
                      } py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon
                        className={`${
                          collapsed ? "h-6 w-6" : "h-5 w-5"
                        } transition ${
                          active
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      {!collapsed && name}
                      {!collapsed && active && (
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

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } px-3 mb-4`}
              >
                {!collapsed && (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                      A
                    </div>

                    <div className="leading-tight">
                      <p className="text-sm font-medium">Admin</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bala NT
                      </p>
                    </div>
                  </div>
                )}

                <ThemeToggle collapsed={collapsed} />
              </div>

              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                } px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                {!collapsed && "Logout"}
              </button>
            </div>
          </aside>

          <main
            className={`transition-all duration-300 ${
              collapsed ? "ml-20" : "ml-72"
            }`}
          >
            {children}
          </main>

          <Toaster position="top-right" />
        </div>
      </AdminAuthGate>
    </ThemeProvider>
  );
}
