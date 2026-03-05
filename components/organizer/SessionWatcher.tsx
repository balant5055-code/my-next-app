"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        router.replace("/organizer/login");
        return;
      }

      try {
        // force refresh if token near expiry
        await user.getIdToken(true);
      } catch (error) {
        console.error("Token refresh failed", error);

        await signOut(auth);

        router.replace("/organizer/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
