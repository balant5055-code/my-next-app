import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import TopBar from "@/components/topBar/TopBar";
import { LoadingProvider } from "@/context/LoadingContext";
import GlobalLoader from "@/components/ui/GlobalLoader";
export const metadata: Metadata = {
  title: "Eventure — Event Registration & Timing Platform",
  description:
    "Eventure is a complete event technology platform for marathons, cycling events, and walkathons with registration, payments, and results.",
  keywords: [
    "marathon registration",
    "event timing",
    "event management",
    "run events",
    "sports events",
    "online registration",
  ],
  authors: [{ name: "Eventure Team" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-[#0b1220] dark:text-white transition-colors duration-300">
        <LoadingProvider>
          {/* 🌍 GLOBAL LOADER (must be here) */}
          <GlobalLoader />

          {/* ===== SEMANTIC HEADER ===== */}
          <header>
            <TopBar />
            <Navbar />
          </header>

          {/* ===== MAIN CONTENT AREA ===== */}
          <main id="main-content" role="main">
            {children}
          </main>

          {/* ===== SEMANTIC FOOTER ===== */}
          <Footer />
        </LoadingProvider>
      </body>
    </html>
  );
}
