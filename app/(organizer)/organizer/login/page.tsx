"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function OrganizerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);

      const cred = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/organizer/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const events = data.events;

      if (!events || events.length === 0) {
        throw new Error("No events assigned to this organizer.");
      }

      // open first event dashboard
      router.push(`/organizer/admin/events/${events[0]}/dashboard`);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const saved = localStorage.getItem("remember");
    if (saved === "true") setRememberMe(true);
  }, []);
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* ================= MOBILE TOP LOGO (OUTSIDE CARD) ================= */}
      <div className="md:hidden w-full flex justify-center py-8 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500">
        <Image
          src="/logo/raceline-in.png"
          alt="Raceline India"
          width={150}
          height={55}
          priority
        />
      </div>

      {/* ================= LOGIN SECTION ================= */}
      <div className="order-1 md:order-2 w-full md:w-1/2 flex items-center justify-center px-6 sm:px-10 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Organizer <span className="text-orange-500">Login</span>
          </h2>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <input
              type="email"
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => {
                    const val = !rememberMe;
                    setRememberMe(val);
                    localStorage.setItem("remember", String(val));
                  }}
                  className="accent-orange-500 cursor-pointer"
                />
                Remember me
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 10px 30px rgba(249,115,22,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className="w-full bg-orange-500 py-3 text-sm font-semibold text-white rounded-xl hover:bg-orange-600 transition shadow-md cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* ================= LEFT BRANDING SECTION ================= */}
      <div className="order-2 md:order-1 w-full md:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 text-white px-8 md:px-12 py-14 flex flex-col overflow-hidden relative">
        {/* Desktop Logo Only */}
        <div className="hidden md:block relative z-10">
          <Image
            src="/logo/raceline-in.png"
            alt="Raceline India"
            width={170}
            height={65}
            priority
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg mt-8 space-y-6">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold leading-snug">
            Sports Timing <br /> Platform
          </h1>

          <p className="text-orange-100 text-base lg:text-lg leading-relaxed">
            Manage marathon events, registrations, payments, bib allocation and
            race-day execution — built for professional organizers.
          </p>
        </div>

        <div className="relative z-10 mt-10 space-y-6">
          <div className="w-16 h-[2px] bg-white/40" />
          <Link
            href="/"
            className="flex items-center gap-2 text-orange-100 hover:text-white transition cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
