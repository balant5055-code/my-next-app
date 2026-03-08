"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
const navItems = [
  { name: "Home", id: "home", link: "/#home" },
  { name: "Events", id: "events", link: "/#events" },
  { name: "Services", id: "services", link: "/#services" },
  { name: "About", id: "about", link: "/#about" },
  { name: "Contact", id: "contact", link: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const router = useRouter();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Scroll detect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll spy */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /* Smooth scroll */
  const handleScroll = (id: string) => {
    setActiveSection(id);

    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -100;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    setOpen(false);
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    setTimeout(() => {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  useEffect(() => {
    const updateActiveFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveSection(hash);
      }
    };

    updateActiveFromHash(); // run on load
    window.addEventListener("hashchange", updateActiveFromHash);

    return () => window.removeEventListener("hashchange", updateActiveFromHash);
  }, []);
  return (
    <motion.header
      id="site-navbar"
      initial={false}
      animate={{
        top: isHome ? (scrolled ? 0 : 52) : scrolled ? 0 : 0,
      }}
      transition={{ duration: 0.4 }}
      className={`w-full z-50 ${
        scrolled ? "fixed top-0" : isHome ? "absolute" : "relative"
      }`}
    >
      {/* NAV CONTAINER */}
      <motion.nav
        aria-label="Main navigation"
        layout
        transition={{ duration: 0.4 }}
        className={`bg-white border border-gray-200 transition-all duration-500 shadow-xl

${
  isHome
    ? scrolled
      ? "w-full rounded-none shadow-2xl"
      : "max-w-7xl mx-auto md:rounded-xl shadow-xl"
    : "w-full rounded-none border-x-0 border-t-0 shadow-md"
}

md:block
`}
      >
        <div className="h-[74px] flex items-center px-6 max-w-7xl mx-auto">
          {/* LOGO */}
          <div className="flex-1">
            <Link href="/" className="flex items-center cursor-pointer">
              <Image
                src="/logo/raceline-in.png"
                alt="Raceline"
                width={170}
                height={60}
                priority
                className="h-[44px] w-auto"
              />
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-8 font-semibold text-gray-800">
            {navItems.map((item) => (
              <li key={item.name} className="relative group">
                <Link
                  href={item.link}
                  onClick={() => setActiveSection(item.id)}
                  className={`transition ${
                    activeSection === item.id
                      ? "text-orange-600"
                      : "text-gray-800 hover:text-orange-500"
                  }`}
                >
                  {item.name}
                </Link>

                <span
                  className={`absolute left-0 -bottom-2 h-[2px]
                  bg-orange-500 transition-all duration-300
                  ${
                    activeSection === item.id
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex flex-1 justify-end">
            <button
              onClick={() => handleScroll("contact")}
              className="cursor-pointer bg-orange-500 text-white px-7 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
            >
              Host an Event
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-800"
          >
            {open ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="md:hidden border-t"
            >
              <ul className="p-5 space-y-4">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.link}
                      onClick={() => {
                        setActiveSection(item.id);
                        setOpen(false);
                      }}
                      className="block w-full text-left font-medium text-gray-700 hover:text-orange-500"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}

                <Link
                  href="/#contact"
                  className="bg-orange-500 text-white px-7 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
                >
                  Host an Event
                </Link>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}
