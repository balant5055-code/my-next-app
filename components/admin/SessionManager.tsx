"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

// 15 minutes total session
const LOGOUT_TIME = 25 * 60 * 1000; // 900000 ms

// Warning 5 minutes before logout
const WARNING_TIME = 15 * 60 * 1000; // 600000 ms

export default function SessionManager() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- CLEAR TIMERS ---------------- */
  const clearTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  /* ---------------- START TIMERS ---------------- */
  const startTimers = () => {
    clearTimers();

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIME);

    logoutTimer.current = setTimeout(() => {
      logoutNow();
    }, LOGOUT_TIME);
  };

  /* ---------------- LOGOUT ---------------- */
  const logoutNow = async () => {
    clearTimers();
    await signOut(auth);
    router.replace("/admin/login");
  };

  /* ---------------- EXTEND SESSION ---------------- */
  const extendSession = async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true); // refresh token
    }

    setShowWarning(false);
    startTimers();
  };

  /* ---------------- COUNTDOWN ---------------- */
  useEffect(() => {
    if (!showWarning) return;

    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          logoutNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  /* ---------------- INITIAL START ---------------- */
  useEffect(() => {
    startTimers();

    return () => clearTimers();
  }, []);

  /* ---------------- RENDER ---------------- */
  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-slate-700 shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">
            Session Expiring Soon
          </h2>
          <p className="text-sm text-slate-400">
            You’ve been inactive for a while.
          </p>
        </div>

        {/* Countdown Circle */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#334155"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#f97316"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(countdown / 10) * 2 * Math.PI * 40}
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-orange-400">
              {countdown}
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-sm text-slate-300">
          You will be logged out in{" "}
          <span className="font-semibold text-orange-400">
            {countdown} seconds
          </span>
          .
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={extendSession}
            className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
          >
            Stay Logged In
          </button>

          <button
            onClick={logoutNow}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
