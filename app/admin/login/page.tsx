"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Toast from "@/components/Toast";
import AnimatedInput from "@/components/ui/AnimatedInput";
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { secureFetch } from "@/lib/secureFetch";

export default function AdminLogin() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | null
  >(null);

  const userInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userInputRef.current?.focus();

    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) setUserId(savedUser);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (attempts >= 5) {
      setToastMessage("Too many attempts. Please wait.");
      setToastType("error");
      return;
    }

    setLoading(true);

    try {
      const trimmedUserId = userId.trim().toLowerCase();
      const hiddenEmail = `${trimmedUserId}@event.local`;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        hiddenEmail,
        password,
      );

      const token = await userCredential.user.getIdToken();

      const response = await secureFetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Session creation failed");
      }

      localStorage.setItem("adminUser", trimmedUserId);

      router.replace("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setAttempts((prev) => prev + 1);

      setToastMessage("Invalid User ID or Password");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCaps = e.getModifierState("CapsLock");
    setCapsLock(isCaps);
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/background/admin_login.png')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content layer */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => {
            setToastMessage(null);
            setToastType(null);
          }}
        />

        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">
              Secure access to Event Raceline dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                User ID
              </label>

              <AnimatedInput
                ref={userInputRef}
                name="userId"
                placeholder="admin01"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                icon={<UserIcon className="h-5 w-5" />}
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <AnimatedInput
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={checkCapsLock}
                icon={<LockClosedIcon className="h-5 w-5" />}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>

              {capsLock && (
                <p className="text-xs text-red-500 mt-1">Caps Lock is ON</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-4 w-full inline-flex items-center justify-center gap-2
                       rounded-full bg-orange-600 hover:bg-orange-700 px-6 py-3
                       text-white font-semibold
                       shadow-md hover:shadow-xl
                       transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Login Securely
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {attempts > 0 && (
              <p className="text-xs text-center text-gray-400">
                Failed attempts: {attempts}/5
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
