"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function OrganizerAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/organizer/login") {
      setChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/organizer/login");
      } else {
        try {
          await user.getIdToken(true);
          setChecking(false);
        } catch {
          router.replace("/organizer/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6FB]">
        <div className="text-gray-400 animate-pulse">
          Securing organizer access…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
