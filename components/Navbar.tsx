"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Events", path: "/events" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{ top: scrolled ? 0 : isMobile ? 35 : 52 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className={`z-50 w-full ${
        scrolled ? "fixed left-0" : "absolute left-1/2 -translate-x-1/2"
      }`}
    >
      {/* NAV CONTAINER */}
      <motion.nav
        layout
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "w-full rounded-none shadow-2xl bg-white/80 "
            : "w-full md:max-w-[1200px] mx-auto md:rounded-xl bg-white shadow-xl"
        }`}
      >
        <div className="h-[74px] flex items-center px-6 max-w-7xl mx-auto">
          {/* LOGO WITH SUBTLE RACING ANIMATION */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1"
          >
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <Image
                  src="/logo/raceline-in.png"
                  alt="Event Pulse India"
                  width={170}
                  height={60}
                  priority
                  className="h-[44px] w-auto md:h-[52px]"
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-8 font-semibold text-gray-800">
            {navItems.map((item, index) => {
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.path);

              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group"
                >
                  <Link
                    href={item.path}
                    className={`transition ${
                      isActive
                        ? "text-orange-600"
                        : "text-gray-800 hover:text-orange-500"
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Active / Hover Underline */}
                  <span
                    className={`absolute left-0 -bottom-2 h-[2px] bg-gradient-to-r from-orange-400 to-orange-600
        transition-all duration-300 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
                  />
                </motion.li>
              );
            })}
          </ul>

          {/* CTA BUTTON */}
          <motion.div
            className="hidden md:flex flex-1 justify-end"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/contact"
              className="relative overflow-hidden bg-orange-500 text-white px-7 py-2 rounded-full font-semibold
                         shadow-lg hover:bg-orange-600 transition"
            >
              <span className="relative z-10">Host an Event</span>

              {/* sweep animation */}
              <span
                className="absolute inset-0 -translate-x-full bg-white/20 
                               hover:translate-x-0 transition-transform duration-500"
              />
            </Link>
          </motion.div>

          {/* MOBILE BUTTON */}
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
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08 } },
                }}
                className="p-5 space-y-4 max-w-7xl mx-auto"
              >
                {navItems.map((item) => (
                  <motion.li
                    key={item.name}
                    variants={{
                      hidden: { opacity: 0, x: -15 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className="block font-medium text-gray-700 hover:text-orange-500"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}

                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block mt-3 bg-orange-500 text-white text-center py-2 rounded-full font-semibold"
                >
                  Host an Event
                </Link>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}
