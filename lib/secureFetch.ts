import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

/* ---------------- WAIT FOR FIREBASE SESSION ---------------- */

function waitForAuth(): Promise<any> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/* ---------------- DETECT PANEL TYPE ---------------- */

function getLoginRoute() {
  if (typeof window === "undefined") return "/";

  if (window.location.pathname.startsWith("/admin")) {
    return "/admin/login";
  }

  if (window.location.pathname.startsWith("/organizer")) {
    return "/organizer/login";
  }

  return "/";
}

/* ---------------- ENTERPRISE SECURE FETCH ---------------- */

export async function secureFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let user = auth.currentUser;

  /* Wait for Firebase to restore session */
  if (!user) {
    user = await waitForAuth();
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  /* Get fresh ID token */
  const token = await user.getIdToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  /* ---------------- AUTO LOGOUT IF TOKEN INVALID ---------------- */

  if (response.status === 401 || response.status === 403) {
    console.warn("Session expired. Logging out...");

    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }

    const loginRoute = getLoginRoute();

    if (typeof window !== "undefined") {
      window.location.href = loginRoute;
    }

    throw new Error("Session expired");
  }

  return response;
}
