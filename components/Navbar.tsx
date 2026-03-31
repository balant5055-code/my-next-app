"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CalendarDaysIcon,
  TrophyIcon,
  BriefcaseIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Home", id: "home", link: "/#home", icon: HomeIcon },
  { name: "Events", id: "events", link: "/#events", icon: CalendarDaysIcon },
  {
    name: "Results",
    id: "results",
    link: "/results",
    icon: TrophyIcon,
    children: [
      { name: "Event Results", link: "/results", desc: "Search race results" },
      { name: "Photo Search", link: "/photos", desc: "Find race photos" },
      {
        name: "Certificates",
        link: "/certificates",
        desc: "Download certificate",
      },
      { name: "Leaderboard", link: "/leaderboard", desc: "Top runners" },
    ],
  },
  { name: "Services", id: "services", link: "/#services", icon: BriefcaseIcon },
  { name: "About", id: "about", link: "/#about", icon: InformationCircleIcon },
  { name: "Contact", id: "contact", link: "/#contact", icon: PhoneIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [hash, setHash] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");

  const isHome = pathname === "/";

  /* Track hash */
  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash.replace("#", ""));
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  /* Scroll detection */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let last = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;

      setScrolled(current > 120);

      if (current > last && current > 120) setScrollDir("down");
      else setScrollDir("up");

      last = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close mobile on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Prevent body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  /* Active detection */
  const isActive = (id: string, link: string) => {
    if (link === "/results") return pathname.startsWith("/results");

    if (pathname !== "/") return false;

    return hash === id || (hash === "" && id === "home");
  };
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setHash(id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);
  const handleScroll = (id: string) => {
    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 100;

    window.scrollTo({ top: y, behavior: "smooth" });
    setOpen(false);
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.header
      initial={false}
      animate={{
        y: scrollDir === "down" ? -120 : 0,
        top: isHome ? (scrolled ? 0 : 52) : 0,
      }}
      transition={{ duration: 0.35 }}
      className={`w-full z-50 ${
        scrolled ? "fixed top-0" : isHome ? "absolute" : "relative"
      }`}
    >
      <motion.nav
        aria-label="Main navigation"
        className={`bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl transition-all duration-500
        ${
          isHome
            ? scrolled
              ? "w-full"
              : "max-w-7xl mx-auto md:rounded-2xl mt-3"
            : "w-full border-x-0 border-t-0"
        }`}
      >
        <div className="h-[74px] flex items-center px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" aria-label="Homepage">
              <div className="relative w-[200px] h-[50px]">
                <Image
                  src="/logo/racelineindia.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <LayoutGroup>
            <ul className="hidden md:flex items-center gap-10 font-semibold text-[15px]">
              {navItems.map((item) => {
                const active = isActive(item.id, item.link);
                const Icon = item.icon;

                return (
                  <li key={item.name} className="relative group">
                    <Link
                      href={item.link}
                      onClick={() =>
                        item.link.includes("#") && setHash(item.id)
                      }
                      className={`flex items-center gap-1 transition-all duration-200 ${
                        active
                          ? "text-gray-900 font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>

                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-[2px] bg-orange-500"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Mega menu */}
                    {item.children && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-6 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all">
                        <div className="bg-white shadow-xl rounded-xl border w-[420px] p-5 grid grid-cols-2 gap-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.link}
                              className="p-3 rounded-lg hover:bg-gray-50 transition"
                            >
                              <p className="font-semibold text-gray-900">
                                {child.name}
                              </p>
                              <p className="text-md text-gray-500">
                                {child.desc}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          {/* CTA */}
          <div className="hidden md:flex flex-1 justify-end">
            <button
              onClick={() => handleScroll("contact")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-7 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
            >
              Host an Event
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            {open ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t"
            >
              <ul className="p-6 space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.id, item.link);

                  return (
                    <li key={item.name}>
                      {!item.children && (
                        <Link
                          href={item.link}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                            active
                              ? "text-gray-900 font-semibold"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      )}

                      {item.children && (
                        <>
                          <button
                            onClick={() =>
                              setMobileDropdown(
                                mobileDropdown === item.name ? null : item.name,
                              )
                            }
                            className="flex w-full justify-between px-3 py-2"
                          >
                            <span className="flex items-center gap-3">
                              <Icon className="h-5 w-5" />
                              {item.name}
                            </span>

                            <ChevronDownIcon
                              className={`h-4 w-4 transition-transform ${
                                mobileDropdown === item.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {mobileDropdown === item.name && (
                            <div className="pl-8 space-y-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.link}
                                  className="block text-md text-gray-600 hover:text-orange-500"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}

                <button
                  onClick={() => handleScroll("contact")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 w-full text-white px-7 py-3 rounded-full font-semibold mt-4"
                >
                  Host an Event
                </button>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}
