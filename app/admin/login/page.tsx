"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Toast from "@/components/Toast";
import AnimatedInput from "@/components/ui/AnimatedInput";
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { secureFetch } from "@/lib/secureFetch";

export default function AdminLogin() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | null
  >(null);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const hiddenEmail = `${userId}@event.local`;

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

      router.replace("/admin/dashboard");
    } catch (error) {
      setToastMessage("Invalid User ID or Password");
      setToastType("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3F6FB]">
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => {
          setToastMessage(null);
          setToastType(null);
        }}
      />

      {/* LOGIN CARD */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-1">Secure access to your dashboard</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* USER ID */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>

            <AnimatedInput
              name="userId"
              placeholder="admin01"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              icon={<UserIcon className="h-5 w-5" />}
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

            <AnimatedInput
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockClosedIcon className="h-5 w-5" />}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="group mt-4 w-full inline-flex items-center justify-center gap-2
                       rounded-full bg-orange-600 hover:bg-orange-700 px-6 py-3
                       text-white font-semibold
                       shadow-md hover:bg-red-700 hover:shadow-lg
                       transition"
          >
            Login Securely
            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </main>
  );
}
