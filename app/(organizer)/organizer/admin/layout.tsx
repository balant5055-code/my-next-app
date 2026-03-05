"use client";

import { useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import EventSwitcher from "@/components/organizer/EventSwitcher";
import EventMeta from "@/components/organizer/EventMeta";
import UserDropdown from "@/components/organizer/UserDropdown";
import OrganizerAuthGate from "@/app/(organizer)/OrganizerAuthGate";
import SessionWatcher from "@/components/organizer/SessionWatcher";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/organizer/admin/logout", { method: "POST" });
    router.push("/organizer/login");
  }
  const menu = [
    {
      name: "Dashboard",
      href: `/organizer/admin/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      name: "Participants",
      href: `/organizer/admin/events/${eventId}/participants`,
      icon: UsersIcon,
    },
    {
      name: "Payments",
      href: `/organizer/admin/events/${eventId}/payments`,
      icon: CreditCardIcon,
    },
    {
      name: "Reports",
      href: `/organizer/admin/events/${eventId}/reports`,
      icon: ChartBarIcon,
    },
  ];

  return (
    <OrganizerAuthGate>
      <SessionWatcher />
      <div className="flex h-screen overflow-x-hidden bg-white">
        {/* Backdrop (Mobile) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 ${
            collapsed ? "w-20" : "w-72"
          } bg-white border-r border-gray-200 shadow-lg transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-all duration-300 md:translate-x-0 md:static md:flex`}
        >
          <div className="flex flex-col w-full relative">
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
              {/* Logo */}
              {!collapsed && (
                <Image
                  src="/logo/raceline-in.png"
                  alt="Raceline"
                  width={110}
                  height={32}
                  priority
                />
              )}

              {/* Mobile Close */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Desktop Collapse Toggle */}
            <div className="absolute -right-3 top-5 hidden md:block">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition"
              >
                {collapsed ? (
                  <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1.5">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = pathname.includes(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="relative group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 overflow-hidden"
                  >
                    {/* Sliding Active Bar */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full transition-all duration-300
            ${active ? "bg-orange-500 opacity-100" : "opacity-0"}
          `}
                    />

                    {/* Gradient Background */}
                    <span
                      className={`absolute inset-0 rounded-lg transition-all duration-300
            ${
              active
                ? "bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-100 shadow-md"
                : "bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100"
            }`}
                    />

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200
            ${
              active
                ? "bg-white/20 text-white"
                : "text-gray-400 group-hover:text-white group-hover:-translate-y-[1px]"
            }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Text */}
                    {!collapsed && (
                      <span
                        className={`relative z-10 transition-all duration-200
              ${
                active
                  ? "text-white"
                  : "text-gray-600 group-hover:text-white group-hover:-translate-y-[1px]"
              }`}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="relative group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <div className="relative z-10 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 group-hover:text-white transition">
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                </div>

                {!collapsed && (
                  <span className="relative z-10 text-gray-600 group-hover:text-white transition">
                    Logout
                  </span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side */}
        <div className="flex-1 flex flex-col relative z-0">
          {/* HEADER */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
            {/* Desktop Header */}
            <div className="hidden md:flex h-16 items-center justify-between px-8">
              {/* LEFT SIDE */}
              <div className="flex items-center gap-8">
                <EventSwitcher />
                <EventMeta />
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center">
                <UserDropdown onLogout={handleLogout} />
              </div>
            </div>

            {/* Mobile Header */}
            {/* Mobile Header */}
            <div className="md:hidden border-b border-gray-100">
              {/* Row 1 */}
              <div className="h-16 flex items-center justify-between px-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Bars3Icon className="w-5 h-5 text-gray-700" />
                </button>

                <EventSwitcher />
              </div>

              {/* Row 2 (Live + Registration Status) */}
              <div className="px-4 pb-3">
                <EventMeta />
              </div>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-auto">{children}</main>
          {/* FOOTER */}
          <footer className="border-t border-gray-100 bg-white px-6 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <span className="font-medium text-gray-700">
                Raceline India Support
              </span>

              <div className="flex items-center gap-4">
                <a
                  href="mailto:support@racelineindia.com"
                  className="hover:text-orange-600 transition"
                >
                  support@racelineindia.com
                </a>

                <a
                  href="tel:+919876543210"
                  className="hover:text-orange-600 transition"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </OrganizerAuthGate>
  );
}
