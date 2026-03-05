"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
      } else {
        try {
          // Force refresh ID token to keep session synced
          await user.getIdToken(true);
          setChecking(false);
        } catch (error) {
          router.replace("/admin/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6FB]">
        <div className="text-gray-400 animate-pulse">
          Securing admin access…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
